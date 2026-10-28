-- À coller dans Supabase > SQL Editor > New query > Run (après supabase.sql)
create table public.follows (
  follower_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  followed_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (follower_id, followed_id),
  check (follower_id <> followed_id)
);
create index on public.follows (followed_id);
alter table public.follows enable row level security;
create policy follows_read on public.follows for select using (true);
create policy follows_ins  on public.follows for insert with check (auth.uid() = follower_id);
create policy follows_del  on public.follows for delete using (auth.uid() = follower_id);
