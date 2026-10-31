-- À coller dans Supabase > SQL Editor > New query > Run, AVANT d'envoyer la nouvelle version en ligne.
-- Compte combien de fois un film a été revu et renoté.
alter table public.reviews add column if not exists rewatches smallint not null default 0;
notify pgrst, 'reload schema';
