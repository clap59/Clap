-- À coller dans Supabase > SQL Editor > New query > Run (après les 3 autres scripts)
-- 1) Nouveaux champs du profil
alter table public.profiles
  add column if not exists avatar_url text,
  add column if not exists bio text check (bio is null or char_length(bio) <= 160),
  add column if not exists fav_tmdb_id int,
  add column if not exists fav_title text,
  add column if not exists fav_poster text,
  add column if not exists onboarded boolean not null default false;
-- Les comptes déjà créés n'ont pas à refaire l'écran de bienvenue
update public.profiles set onboarded = true;

-- 2) Filtre de texte : pseudo et description (mêmes mots que public/moderation.js)
create or replace function public.is_bad_text(t text) returns boolean
language sql immutable as $$
  select coalesce(t,'') ~* '(https?:|www\.)'
      or regexp_replace(regexp_replace(translate(lower(coalesce(t,'')), 'àâäáãåçéèêëíìîïñóòôöõúùûüýÿ013457@$', 'aaaaaaceeeeiiiinooooouuuuyyoieastas'), '[^a-z0-9]+', ' ', 'g'), '(.)\1{2,}', '\1', 'g')
         ~ '\y(pute|putes|salope|salopes|connard|connards|connasse|encule|enculee|enculer|encules|niquer|nique|ntm|fdp|tapette|negro|negre|negres|bougnoule|bougnoules|bicot|youpin|youpins|chinetoque|pedophile|pedo|violeur|bite|bites|chatte|chattes|couille|couilles|branler|branleur|branlette|sucer|sodomie|zoophile|gouine|fuck|fucking|fucker|fucked|motherfucker|cunt|nigger|niggers|nigga|faggot|fag|whore|slut|dick|dickhead|pussy|cock|cum|porn|porno|nude|nudes|rape|rapist|bitch|asshole|blowjob|handjob|dildo|xxx|onlyfans|kys|retard|retarded|tranny)\y'
$$;
create or replace function public.check_profile_text() returns trigger
language plpgsql as $$
begin
  if public.is_bad_text(new.username) or public.is_bad_text(new.bio) then
    raise exception 'inappropriate_text' using errcode = 'P0001';
  end if;
  return new;
end $$;
drop trigger if exists profiles_text_check on public.profiles;
create trigger profiles_text_check before insert or update of username, bio on public.profiles
  for each row execute function public.check_profile_text();

-- 3) Stockage des photos de profil (JPEG, 1 Mo max, un dossier par personne)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 1048576, array['image/jpeg'])
on conflict (id) do update set public = true, file_size_limit = 1048576, allowed_mime_types = array['image/jpeg'];
create policy avatars_sel on storage.objects for select using (bucket_id = 'avatars');
create policy avatars_ins on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy avatars_upd on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy avatars_del on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
notify pgrst, 'reload schema';
