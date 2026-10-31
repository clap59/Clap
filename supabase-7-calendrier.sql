-- À coller dans Supabase > SQL Editor > New query > Run, AVANT d'envoyer la nouvelle version en ligne.
-- Journal des visionnages : un film peut être vu plusieurs fois, à des dates différentes.
create table if not exists public.watches (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  tmdb_id int not null,
  title text not null,
  poster_path text,
  watched_on date not null default current_date,
  rating numeric(2,1) check (rating is null or (rating >= 0.5 and rating <= 5 and rating * 2 = floor(rating * 2))),
  created_at timestamptz default now()
);
create index if not exists watches_user_day on public.watches (user_id, watched_on);
create index if not exists watches_user_film on public.watches (user_id, tmdb_id);
alter table public.watches enable row level security;
create policy watches_read on public.watches for select using (true);
create policy watches_ins  on public.watches for insert with check (auth.uid() = user_id);
create policy watches_upd  on public.watches for update using (auth.uid() = user_id);
create policy watches_del  on public.watches for delete using (auth.uid() = user_id);

-- Les notes et critiques déjà faites deviennent un premier visionnage (à leur date de création)
insert into public.watches (user_id, tmdb_id, title, poster_path, watched_on, rating)
select r.user_id, r.tmdb_id, r.title, r.poster_path, r.created_at::date, r.rating
from public.reviews r
where not exists (select 1 from public.watches w where w.user_id = r.user_id and w.tmdb_id = r.tmdb_id);
notify pgrst, 'reload schema';
