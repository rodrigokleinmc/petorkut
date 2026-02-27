# PetOrkut 🐾 (MVP funcional)

Projeto **fullstack** pronto pra Vercel usando:
- **Next.js (App Router)**
- **Supabase (Auth + Postgres + RLS)**

> Importante: a aplicação é funcional e persistente, mas depende do Supabase (banco/credenciais).
> Isso é justamente o “macete certo” pra não sofrer com limitações do Vercel (sem servidor stateful próprio).

---

## 1) Rodar local

```bash
npm i
cp .env.example .env.local
npm run dev
```

Configure `.env.local` com as chaves do Supabase.

---

## 2) Criar o banco no Supabase

No painel do Supabase:
1. Crie um projeto
2. Abra **SQL Editor**
3. Cole e execute o arquivo `supabase.sql`

---

## 3) Ativar RLS + políticas (mínimo recomendado)

No Supabase, em cada tabela abaixo, ative **RLS** e rode essas policies.

### profiles
```sql
alter table public.profiles enable row level security;

create policy "read profiles" on public.profiles
for select using (true);

create policy "update own profile" on public.profiles
for update using (auth.uid() = id);
```

### pets
```sql
alter table public.pets enable row level security;

create policy "read pets" on public.pets
for select using (true);

create policy "owner can manage pet" on public.pets
for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
```

### posts
```sql
alter table public.posts enable row level security;

create policy "read public posts" on public.posts
for select using (visibility = 'public');

create policy "owner can create posts" on public.posts
for insert with check (auth.uid() = owner_profile_id);

create policy "owner can update posts" on public.posts
for update using (auth.uid() = owner_profile_id);

create policy "owner can delete posts" on public.posts
for delete using (auth.uid() = owner_profile_id);
```

### comments
```sql
alter table public.comments enable row level security;

create policy "read comments" on public.comments
for select using (true);

create policy "insert comment as owner" on public.comments
for insert with check (auth.uid() = owner_profile_id);

create policy "delete own comment" on public.comments
for delete using (auth.uid() = owner_profile_id);
```

### reactions
```sql
alter table public.reactions enable row level security;

create policy "read reactions" on public.reactions
for select using (true);

create policy "insert reaction as me" on public.reactions
for insert with check (auth.uid() = reactor_profile_id);

create policy "delete reaction as me" on public.reactions
for delete using (auth.uid() = reactor_profile_id);
```

### scraps
```sql
alter table public.scraps enable row level security;

create policy "read scraps" on public.scraps
for select using (true);

create policy "insert scrap as me" on public.scraps
for insert with check (auth.uid() = from_profile_id);

create policy "delete my scrap" on public.scraps
for delete using (auth.uid() = from_profile_id);
```

### follows
```sql
alter table public.follows enable row level security;

create policy "read follows" on public.follows
for select using (true);

create policy "insert follow as me" on public.follows
for insert with check (auth.uid() = follower_profile_id);

create policy "delete follow as me" on public.follows
for delete using (auth.uid() = follower_profile_id);
```

---

## 4) Deploy no Vercel (via GitHub)

1. Suba este projeto no GitHub
2. No Vercel, **Import Project**
3. Configure as ENV VARS no Vercel (iguais ao `.env.local`)
4. Deploy

---

## O que já funciona (MVP)
- Auth (login/cadastro)
- Onboarding de perfil
- Criar pets
- Postar como humano ou pet (texto)
- Feed (públicos + seus)
- Página do post + comentar + reagir
- Perfis públicos de humano e de pet
- Scraps (recados) nos perfis
- Explorar e seguir (follow)

---

## Próximas “frescuras” prontas pra evoluir
- Upload de imagem/vídeo via Supabase Storage (já existe `media_urls`)
- Feed “de verdade” (seguidores/amigos) com políticas mais finas
- DM realtime com Supabase Realtime
- Moderação (denúncia, fila, rate limit)
- Badges/conquistas + check-ins + eventos

Se você quiser, eu continuo e te entrego a versão 0.2 com:
**uploads + feed por follows + notificações**.


---

## Versão 0.2 (frescuras a mais) ✅
Incluído neste pacote:
- Upload de **fotos/vídeos** no post via **Supabase Storage** (bucket `media`)
- Feed “de verdade” com **follows** (usa RPC `public.get_feed`)
- **Notificações automáticas** via triggers (follow, reaction, comment, scrap)
- **Mensagens (DM)** com threads + realtime (subscribe opcional)

### Storage (bucket `media`)
No Supabase:
1. Storage → Create bucket → nome: `media` (public ou private, como preferir)
2. Se for **public**, o app já consegue mostrar URLs fáceis.
3. Se for **private**, você vai gerar signed URLs (próximo passo).

Policies sugeridas (bucket public):
- Permitir insert apenas para usuário logado
- Permitir read para todos (ou logados)

### Ativar Realtime (para DM)
No Supabase, habilite Realtime para a tabela `dm_messages`.
