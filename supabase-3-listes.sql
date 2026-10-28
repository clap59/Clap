-- À coller dans Supabase > SQL Editor > New query > Run (après les deux autres)
create table public.lists (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 40),
  created_at timestamptz default now()
);
create table public.list_items (
  list_id bigint not null references public.lists(id) on delete cascade,
  tmdb_id int not null,
  title text not null,
  poster_path text,
  added_at timestamptz default now(),
  primary key (list_id, tmdb_id)
);
alter table public.lists enable row level security;
alter table public.list_items enable row level security;
create policy lists_read  on public.lists for select using (true);
create policy lists_ins   on public.lists for insert with check (auth.uid() = user_id);
create policy lists_upd   on public.lists for update using (auth.uid() = user_id);
create policy lists_del   on public.lists for delete using (auth.uid() = user_id);
create policy items_read  on public.list_items for select using (true);
create policy items_ins   on public.list_items for insert with check (exists (select 1 from public.lists l where l.id = list_id and l.user_id = auth.uid()));
create policy items_del   on public.list_items for delete using (exists (select 1 from public.lists l where l.id = list_id and l.user_id = auth.uid()));
notify pgrst, 'reload schema';
