-- PetOrkut v0.2 - extras: feed por follows, triggers de notificação, melhorias de DM

-- 1) RPC: feed por follows (públicos + posts dos alvos seguidos + seus posts)
create or replace function public.get_feed(p_profile_id uuid)
returns setof public.posts
language sql
security definer
as $$
  with followed as (
    select target_type, target_id
    from public.follows
    where follower_profile_id = p_profile_id
  )
  select p.*
  from public.posts p
  where
    -- seus posts (inclui seus pets)
    p.owner_profile_id = p_profile_id
    or
    -- públicos
    p.visibility = 'public'
    or
    -- posts de alvos seguidos
    exists (
      select 1 from followed f
      where f.target_type = p.author_type and f.target_id = p.author_id
    )
  order by p.created_at desc
  limit 60
$$;

-- Permissão de execução
grant execute on function public.get_feed(uuid) to anon, authenticated;

-- 2) Notificações via triggers
create or replace function public.notify_follow()
returns trigger language plpgsql security definer as $$
begin
  -- só notifica se seguir um perfil (para pet, notifica o dono)
  if new.target_type = 'profile' then
    insert into public.notifications(to_profile_id, type, payload)
    values (new.target_id, 'follow', jsonb_build_object('from', new.follower_profile_id));
  else
    -- pet: descobre dono
    insert into public.notifications(to_profile_id, type, payload)
    select p.owner_id, 'follow', jsonb_build_object('from', new.follower_profile_id, 'pet_id', p.id)
    from public.pets p where p.id = new.target_id;
  end if;
  return new;
end $$;

drop trigger if exists trg_notify_follow on public.follows;
create trigger trg_notify_follow
after insert on public.follows
for each row execute function public.notify_follow();

create or replace function public.notify_reaction()
returns trigger language plpgsql security definer as $$
declare owner uuid;
begin
  select owner_profile_id into owner from public.posts where id = new.post_id;
  if owner is not null and owner <> new.reactor_profile_id then
    insert into public.notifications(to_profile_id, type, payload)
    values (owner, 'reaction', jsonb_build_object('from', new.reactor_profile_id, 'post_id', new.post_id, 'emoji', new.emoji));
  end if;
  return new;
end $$;

drop trigger if exists trg_notify_reaction on public.reactions;
create trigger trg_notify_reaction
after insert on public.reactions
for each row execute function public.notify_reaction();

create or replace function public.notify_comment()
returns trigger language plpgsql security definer as $$
declare owner uuid;
begin
  select owner_profile_id into owner from public.posts where id = new.post_id;
  if owner is not null and owner <> new.owner_profile_id then
    insert into public.notifications(to_profile_id, type, payload)
    values (owner, 'comment', jsonb_build_object('from', new.owner_profile_id, 'post_id', new.post_id));
  end if;
  return new;
end $$;

drop trigger if exists trg_notify_comment on public.comments;
create trigger trg_notify_comment
after insert on public.comments
for each row execute function public.notify_comment();

create or replace function public.notify_scrap()
returns trigger language plpgsql security definer as $$
declare owner uuid;
begin
  if new.to_type = 'profile' then
    owner := new.to_id;
  else
    select owner_id into owner from public.pets where id = new.to_id;
  end if;

  if owner is not null and owner <> new.from_profile_id then
    insert into public.notifications(to_profile_id, type, payload)
    values (owner, 'scrap', jsonb_build_object('from', new.from_profile_id, 'to_type', new.to_type, 'to_id', new.to_id));
  end if;
  return new;
end $$;

drop trigger if exists trg_notify_scrap on public.scraps;
create trigger trg_notify_scrap
after insert on public.scraps
for each row execute function public.notify_scrap();

-- 3) Policies para notifications (RLS)
alter table public.notifications enable row level security;

drop policy if exists "read my notifications" on public.notifications;
create policy "read my notifications" on public.notifications
for select using (auth.uid() = to_profile_id);

drop policy if exists "update my notifications" on public.notifications;
create policy "update my notifications" on public.notifications
for update using (auth.uid() = to_profile_id);

-- 4) Policies para DM (RLS)
alter table public.dm_threads enable row level security;
alter table public.dm_participants enable row level security;
alter table public.dm_messages enable row level security;

drop policy if exists "read threads i'm in" on public.dm_threads;
create policy "read threads i'm in" on public.dm_threads
for select using (
  exists (select 1 from public.dm_participants p where p.thread_id = id and p.profile_id = auth.uid())
);

drop policy if exists "read participants" on public.dm_participants;
create policy "read participants" on public.dm_participants
for select using (true);

drop policy if exists "insert participants as me" on public.dm_participants;
create policy "insert participants as me" on public.dm_participants
for insert with check (auth.uid() = profile_id);

drop policy if exists "read messages if i'm in thread" on public.dm_messages;
create policy "read messages if i'm in thread" on public.dm_messages
for select using (
  exists (select 1 from public.dm_participants p where p.thread_id = dm_messages.thread_id and p.profile_id = auth.uid())
);

drop policy if exists "insert message as me" on public.dm_messages;
create policy "insert message as me" on public.dm_messages
for insert with check (
  auth.uid() = from_profile_id
  and exists (select 1 from public.dm_participants p where p.thread_id = dm_messages.thread_id and p.profile_id = auth.uid())
);
