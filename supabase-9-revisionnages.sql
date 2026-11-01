-- À coller dans Supabase > SQL Editor > New query > Run, AVANT d'envoyer la nouvelle version en ligne.
-- (après supabase-8-avis-stats.sql)

-- Pour afficher l'icône « revu » sur les critiques et activités
alter table public.reviews add column if not exists rewatched boolean not null default false;
alter table public.reviews add column if not exists views smallint not null default 1;

-- Tous les visionnages après le premier d'un film sont des revisionnages
update public.watches w set rewatch = true
where exists (
  select 1 from public.watches x
  where x.user_id = w.user_id and x.tmdb_id = w.tmdb_id
    and (x.watched_on < w.watched_on or (x.watched_on = w.watched_on and x.id < w.id))
);

-- Remet à jour les critiques existantes
update public.reviews r set
  views = greatest(1, (select count(*) from public.watches w where w.user_id = r.user_id and w.tmdb_id = r.tmdb_id)),
  rewatched = coalesce((select bool_or(w.rewatch) from public.watches w where w.user_id = r.user_id and w.tmdb_id = r.tmdb_id), false);
notify pgrst, 'reload schema';
