# Clap – projet de départ

Le design de Clap, branché sur TMDB : recherche, tendances et fiche film complète
(synopsis, date de sortie précise, casting avec photos, bande-annonce, où le voir, films similaires).

## Lancer le projet
1. Installe **Node.js 20 ou plus** : https://nodejs.org
2. Crée un compte sur https://www.themoviedb.org, puis va dans *Paramètres > API* et demande une clé.
   Copie le **« Jeton d’accès en lecture à l’API »** (la longue clé qui commence par `eyJ`).
3. Dans ce dossier, copie `.env.example` en `.env` et colle le jeton après `TMDB_KEY=`.
4. Dans un terminal, dans ce dossier :
   ```
   npm install
   npm start
   ```
5. Ouvre http://localhost:3000

## Comptes et base de données (Supabase)
1. Dans Supabase, ouvre *SQL Editor > New query*, colle tout le contenu de `supabase.sql` et clique *Run*.
2. Pendant le développement, va dans *Authentication > Providers > Email* et désactive **Confirm email** (sinon chaque inscription demande de cliquer sur un mail).
3. **Abonnements** : colle aussi `supabase-2-abonnements.sql` dans le SQL Editor et clique *Run*.
4. **Listes** : colle aussi `supabase-3-listes.sql` et clique *Run*.
5. Relance `npm start`, clique sur 👤 en haut à droite et crée un compte.
La clé de `public/config.js` est la clé « anon » : elle est publique par conception. Ne mets **jamais** la clé « service_role » dans ce projet.

## Bon à savoir
- La clé reste dans `server.js` (côté serveur) : elle n’est jamais visible dans la page.
- Les critiques (notes, textes), likes et réponses de la page film sont **enregistrés** dans Supabase. Le fil, les listes, les stories et les photos restent des données de démo.
- TMDB est gratuit pour un usage non commercial. Pour un vrai lancement, il faudra demander une licence commerciale.
- La mention TMDB affichée en bas de chaque fiche est obligatoire, garde-la.

## Mettre Clap en ligne (Render)
1. Crée un dépôt sur github.com et envoie-y le contenu de ce dossier (sans `node_modules` ni `.env`, le fichier `.gitignore` s'en occupe).
2. Sur render.com : *New > Web Service*, connecte ton dépôt. Build Command : `npm install`. Start Command : `npm start`. Instance : Free.
3. Dans *Environment*, ajoute `TMDB_KEY` (ton jeton TMDB) et `NODE_VERSION` = `22`.
4. Une fois en ligne, dans Supabase : *Authentication > URL Configuration*, mets ton adresse Render dans **Site URL**.
Sur l'offre gratuite, le site s'endort après un moment sans visite : le premier chargement peut prendre ~30 secondes.
