-- Force Supabase à recharger la liste de tes tables et de leurs liens (inoffensif)
notify pgrst, 'reload schema';

-- Vérification : doit afficher 5 lignes (follows, likes, profiles, replies, reviews)
select table_name from information_schema.tables
where table_schema = 'public' order by table_name;
