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
5. **Profil et modération** : colle `supabase-4-profil.sql` dans le SQL Editor et clique *Run* **avant** d'envoyer la nouvelle version en ligne.
6. **Âge et 5 favoris** : colle `supabase-5-age-favoris.sql` dans le SQL Editor et clique *Run* (avant la mise en ligne).
7. **Notes rapides** : colle `supabase-6-notes.sql` dans le SQL Editor et clique *Run* (avant la mise en ligne).
8. Relance `npm start`, clique sur 👤 en haut à droite et crée un compte.
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

## Connexion obligatoire, Google et mot de passe oublié
**Google** : sur console.cloud.google.com, crée un projet, configure l'écran de consentement OAuth (Externe, nom « Clap »), puis *Identifiants > Créer des identifiants > ID client OAuth > Application Web*. Dans « URI de redirection autorisés », ajoute `https://kqqmklvfghcolctspgca.supabase.co/auth/v1/callback`. Copie l'ID client et la clé secrète, puis dans Supabase : *Authentication > Sign In / Providers > Google*, active-le et colle-les.
**Adresses autorisées** : Supabase > *Authentication > URL Configuration* : Site URL = ton adresse Render ; dans Redirect URLs ajoute `https://TON-SITE.onrender.com/**` et `http://localhost:3000/**`.
**Mot de passe** : Supabase > *Authentication > Sign In / Providers > Email* : longueur minimale 12 et exigences (minuscules, majuscules, chiffres, symboles) pour que les règles soient aussi appliquées côté serveur.
**Emails** : l'envoi par défaut de Supabase est très limité. Avant d'inviter des amis, configure un SMTP (ex. Resend ou Brevo, offres gratuites) dans *Authentication > Emails > SMTP Settings*.

## Écran de bienvenue et modération
- À la première connexion, chaque nouveau compte passe par 3 étapes (photo de profil recadrée dans un cercle, film préféré, description), toutes passables. Les comptes déjà créés ne le voient pas ; « Modifier mon profil » (onglet Profil) le rouvre.
- **Photos** : un modèle gratuit (NSFWJS, dossier `public/vendor/nsfw`) analyse la photo dans le navigateur avant l'envoi et refuse la nudité. C'est un premier filtre, pas une garantie : une personne technique peut le contourner.
- **Textes** : le pseudo et la description sont filtrés par une liste de mots (`public/moderation.js` côté navigateur, `supabase-4-profil.sql` côté base de données, à garder identiques). Ça bloque les insultes et contenus sexuels évidents et les liens, mais pas toutes les formulations.
- Pour aller plus loin plus tard : un bouton « Signaler », puis une vérification côté serveur par une API de modération.

## Âge minimum et favoris
- L'écran de bienvenue commence par l'âge (curseur de 5 à 99+). Moins de 13 ans : accès refusé, la personne est déconnectée et ne peut plus entrer avec ce compte. L'âge est enregistré dans une table privée (`user_private`) que seule la personne concernée peut lire. Les comptes existants sont invités à le renseigner une fois.
- Un contrôle déclaratif n'est pas une vérification : il bloque les moins de 13 ans honnêtes, pas ceux qui mentent. En France, le consentement au traitement de données d'un mineur de moins de 15 ans demande en principe l'accord des parents : à faire valider avant un lancement public.
- Chaque profil affiche jusqu'à 5 films favoris (« Mes 5 favoris »).

## Page film
`public/film.js` : héros animé (fond qui bouge, affiche qui s'incline), cercle de score qui se remplit, note animée, communauté Clap, note rapide, sections (Aperçu, Infos, Casting, Médias, Où voir, Critiques, Saga, Dans le même esprit) avec navigation collante. `server.js` demande à TMDB les images, vidéos, recommandations, classification et saga.

## Notes rapides, revisionnage, pictogrammes
- Toucher une étoile sur une page film enregistre la note tout de suite (sans critique). La note reste affichée ; « Revoir et renoter » permet d'en donner une nouvelle (le compteur « vu 2 fois » vient de `supabase-6-notes.sql`).
- Le fil n'affiche que les critiques avec du texte ; les notes seules apparaissent dans la page film, l'activité et le profil.
- Les emojis d'interface sont remplacés par les pictogrammes de `public/icons.js` (fonction `IC("nom")`).
