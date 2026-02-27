-- PetOrkut (MVP funcional) - SQL para Supabase
-- Cole no SQL Editor do Supabase e execute.
-- Depois ative RLS e crie políticas (um conjunto mínimo está no README).

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text not null,
  bio text default '',
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.pets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  username text unique not null,
  display_name text not null,
  species text not null,
  breed text,
  birthdate date,
  bio text default '',
  avatar_url text,
  created_at timestamptz not null default now()
);

create type public.actor_type as enum ('profile','pet');

create table if not exists public.follows (
  follower_profile_id uuid not null references public.profiles(id) on delete cascade,
  target_type public.actor_type not null,
  target_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (follower_profile_id, target_type, target_id)
);

create table if not exists public.friend_requests (
  id uuid primary key default gen_random_uuid(),
  from_profile_id uuid not null references public.profiles(id) on delete cascade,
  to_profile_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  unique (from_profile_id, to_profile_id)
);

create table if not exists public.friends (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  friend_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (profile_id, friend_id)
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_type public.actor_type not null,
  author_id uuid not null,
  owner_profile_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  visibility text not null default 'public',
  media_urls text[] default '{}',
  created_at timestamptz not null default now()
);
create index if not exists posts_created_at_idx on public.posts (created_at desc);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_type public.actor_type not null,
  author_id uuid not null,
  owner_profile_id uuid not null references public.profiles(id) on delete cascade,
  parent_id uuid references public.comments(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.reactions (
  post_id uuid not null references public.posts(id) on delete cascade,
  reactor_profile_id uuid not null references public.profiles(id) on delete cascade,
  emoji text not null,
  created_at timestamptz not null default now(),
  primary key (post_id, reactor_profile_id, emoji)
);

create table if not exists public.scraps (
  id uuid primary key default gen_random_uuid(),
  from_profile_id uuid not null references public.profiles(id) on delete cascade,
  to_type public.actor_type not null,
  to_id uuid not null,
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  to_profile_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  payload jsonb not null default '{}'::jsonb,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.dm_threads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

create table if not exists public.dm_participants (
  thread_id uuid not null references public.dm_threads(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  primary key (thread_id, profile_id)
);

create table if not exists public.dm_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.dm_threads(id) on delete cascade,
  from_profile_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);
