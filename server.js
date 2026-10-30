// Petit serveur : il garde ta cle TMDB secrete et la page Clap lui parle à lui, pas à TMDB.
const express = require("express");
try { process.loadEnvFile(); } catch (e) {} // lit .env en local ; en ligne, les variables viennent de l'hébergeur
const KEY = process.env.TMDB_KEY;
if (!KEY) { console.error("TMDB_KEY manquante : copie .env.example en .env et colle ta cle dedans."); process.exit(1); }
const app = express();
const BASE = "https://api.themoviedb.org/3";
const cache = new Map(); // mini cache 10 min pour ne pas spammer TMDB

async function tmdb(path, params = {}) {
  const u = new URL(BASE + path);
  const headers = { accept: "application/json" };
  const q = { language: "fr-FR", ...params };
  if (KEY.length > 60) headers.Authorization = "Bearer " + KEY; else q.api_key = KEY;
  u.search = new URLSearchParams(q);
  const hit = cache.get(u.href);
  if (hit && Date.now() - hit.t < 600000) return hit.d;
  const r = await fetch(u, { headers });
  if (!r.ok) throw new Error("TMDB " + r.status);
  const d = await r.json();
  cache.set(u.href, { t: Date.now(), d });
  return d;
}
const route = (path, fn) => app.get(path, async (req, res) => {
  try { res.json(await fn(req)); } catch (e) { console.error(e.message); res.status(502).json({ error: e.message }); }
});

route("/api/trending", (req) => tmdb("/trending/movie/week", { page: req.query.page || 1 }));
route("/api/search", (req) => tmdb("/search/movie", { query: req.query.q || "" }));
route("/api/movie/:id", (req) => tmdb("/movie/" + encodeURIComponent(req.params.id), {
  append_to_response: "credits,videos,images,recommendations,similar,release_dates,watch/providers",
  include_video_language: "fr,en",
  include_image_language: "fr,en,null"
}));
route("/api/collection/:id", (req) => tmdb("/collection/" + encodeURIComponent(req.params.id)));

app.use(express.static("public"));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Clap tourne sur le port " + PORT));
