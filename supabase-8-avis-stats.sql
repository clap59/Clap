-- À coller dans Supabase > SQL Editor > New query > Run, AVANT d'envoyer la nouvelle version en ligne.
-- (après supabase-7-calendrier.sql)

-- 1) Chaque visionnage garde sa critique, ses spoilers et ses infos de film (pour les statistiques)
alter table public.watches add column if not exists body text not null default '';
alter table public.watches add column if not exists spoiler boolean not null default false;
alter table public.watches add column if not exists rewatch boolean not null default false;
alter table public.watches add column if not exists meta jsonb not null default '{}'::jsonb;
alter table public.reviews add column if not exists spoiler boolean not null default false;

-- Les critiques déjà écrites sont rattachées au visionnage le plus récent de chaque film
update public.watches w set body = r.body
from public.reviews r
where r.user_id = w.user_id and r.tmdb_id = w.tmdb_id and w.body = '' and r.body <> ''
  and w.id = (select max(x.id) from public.watches x where x.user_id = w.user_id and x.tmdb_id = w.tmdb_id);

-- 2) J'aime / Je n'aime pas sur les films (servira aux recommandations)
create table if not exists public.film_reactions (
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  tmdb_id int not null,
  title text not null,
  poster_path text,
  reaction smallint not null check (reaction in (-1, 1)),
  created_at timestamptz default now(),
  primary key (user_id, tmdb_id)
);
alter table public.film_reactions enable row level security;
create policy reactions_read on public.film_reactions for select using (true);
create policy reactions_ins  on public.film_reactions for insert with check (auth.uid() = user_id);
create policy reactions_upd  on public.film_reactions for update using (auth.uid() = user_id);
create policy reactions_del  on public.film_reactions for delete using (auth.uid() = user_id);
notify pgrst, 'reload schema';
