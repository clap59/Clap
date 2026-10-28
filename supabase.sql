-- À coller dans Supabase > SQL Editor > New query > Run
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null check (char_length(username) between 3 and 20),
  created_at timestamptz default now()
);
create table public.reviews (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  tmdb_id int not null,
  title text not null,
  poster_path text,
  rating numeric(2,1) not null check (rating >= 0.5 and rating <= 5 and rating * 2 = floor(rating * 2)),
  body text not null default '',
  created_at timestamptz default now(),
  unique (user_id, tmdb_id)
);
create table public.likes (
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  review_id bigint not null references public.reviews(id) on delete cascade,
  primary key (user_id, review_id)
);
create table public.replies (
  id bigint generated always as identity primary key,
  review_id bigint not null references public.reviews(id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 500),
  created_at timestamptz default now()
);
create index on public.reviews (tmdb_id);

-- Profil créé automatiquement à l'inscription (le pseudo vient du formulaire)
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username)
  values (new.id, coalesce(new.raw_user_meta_data->>'username', 'user' || substr(new.id::text, 1, 6)));
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Sécurité : tout le monde lit, chacun n'écrit que ce qui lui appartient
alter table public.profiles enable row level security;
alter table public.reviews  enable row level security;
alter table public.likes    enable row level security;
alter table public.replies  enable row level security;
create policy profiles_read  on public.profiles for select using (true);
create policy profiles_upd   on public.profiles for update using (auth.uid() = id);
create policy reviews_read   on public.reviews for select using (true);
create policy reviews_ins    on public.reviews for insert with check (auth.uid() = user_id);
create policy reviews_upd    on public.reviews for update using (auth.uid() = user_id);
create policy reviews_del    on public.reviews for delete using (auth.uid() = user_id);
create policy likes_read     on public.likes for select using (true);
create policy likes_ins      on public.likes for insert with check (auth.uid() = user_id);
create policy likes_del      on public.likes for delete using (auth.uid() = user_id);
create policy replies_read   on public.replies for select using (true);
create policy replies_ins    on public.replies for insert with check (auth.uid() = user_id);
create policy replies_del    on public.replies for delete using (auth.uid() = user_id);
