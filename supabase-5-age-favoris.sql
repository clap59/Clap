-- À coller dans Supabase > SQL Editor > New query > Run (après supabase-4-profil.sql), AVANT d'envoyer la nouvelle version en ligne.

-- 1) L'âge est privé : seule la personne concernée peut le lire. On ne peut l'écrire qu'une fois.
create table if not exists public.user_private (
  user_id uuid primary key default auth.uid() references public.profiles(id) on delete cascade,
  age smallint not null check (age between 5 and 99),
  created_at timestamptz default now()
);
alter table public.user_private enable row level security;
create policy private_read on public.user_private for select using (auth.uid() = user_id);
create policy private_ins  on public.user_private for insert with check (auth.uid() = user_id);

-- 2) Jusqu'à 5 films favoris
alter table public.profiles
  add column if not exists fav_films jsonb not null default '[]'::jsonb
  check (jsonb_typeof(fav_films) = 'array' and jsonb_array_length(fav_films) <= 5);
update public.profiles
  set fav_films = jsonb_build_array(jsonb_build_object('id', fav_tmdb_id, 'title', fav_title, 'poster', fav_poster))
  where fav_tmdb_id is not null and fav_films = '[]'::jsonb;
notify pgrst, 'reload schema';
