// Petit serveur : il garde ta cle TMDB secrete et la page Clap lui parle à lui, pas à TMDB.
const express = require("express");
try { process.loadEnvFile(); } catch (e) {} // lit .env en local ; en ligne, les variables viennent de l'hébergeur
const KEY = process.env.TMDB_KEY;
if (!KEY) { console.error("TMDB_KEY manquante : copie .env.example en .env et colle ta cle dedans."); process.exit(1); }
const app = express();
const BASE = process.env.TMDB_BASE || "https://api.themoviedb.org/3";
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
  if (cache.size > 3000) cache.clear();
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


// ================= Découverte : lignes façon Netflix, recommandations, franchises =================
const memo = new Map();
async function cached(key, ms, fn) {
  const h = memo.get(key); if (h && Date.now() - h.t < ms) return h.d;
  const d = await fn(); memo.set(key, { t: Date.now(), d }); return d;
}
const iso = (d) => d.toISOString().slice(0, 10);
const ago = (n) => new Date(Date.now() - n * 864e5);
const slim = (m) => ({ id: m.id, title: m.title, poster_path: m.poster_path, backdrop_path: m.backdrop_path, vote_average: m.vote_average, vote_count: m.vote_count, release_date: m.release_date, overview: m.overview, genre_ids: m.genre_ids || [], popularity: m.popularity || 0 });
const withPoster = (l) => (l || []).filter((m) => m && m.poster_path && m.title).map(slim);
const disc = async (params) => withPoster((await tmdb("/discover/movie", { include_adult: "false", ...params })).results);
const lst = async (kind, params = {}) => withPoster((await tmdb("/movie/" + kind, params)).results);
const trending = async (page = 1) => withPoster((await tmdb("/trending/movie/week", { page })).results);
const safe = async (fn) => { try { return await fn(); } catch (e) { console.error("découverte :", e.message); return []; } };
const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();

const GENRES = {
  sf: ["Science-fiction", "Voyages, futurs et mondes à part", 878], horreur: ["Frissons et horreur", "Pour avoir peur (un peu)", 27],
  comedie: ["Comédies", "Les films qui font rire", 35], action: ["Action et adrénaline", "Ça va vite et ça explose", 28],
  thriller: ["Thrillers à suspense", "Impossible de décrocher", 53], drame: ["Drames marquants", "Des histoires qui restent", 18],
  animation: ["Animation pour tous", "À tout âge", 16], romance: ["Histoires d’amour", "Pour le cœur", 10749],
  polar: ["Polars et crimes", "Enquêtes et criminels", 80], fantastique: ["Fantastique et magie", "Sortilèges et créatures", 14],
  aventure: ["Aventure", "Partir à l’autre bout du monde", 12], guerre: ["Films de guerre", "Histoires de conflits", 10752]
};
const DECADES = { d80: ["Cultes des années 80", 1980, 1989], d90: ["Cultes des années 90", 1990, 1999], d00: ["Cultes des années 2000", 2000, 2009] };

async function buildHome() {
  const today = iso(new Date()), jobs = {
    trend: () => trending(1), trend2: () => trending(2),
    recent: () => disc({ "primary_release_date.gte": iso(ago(150)), "primary_release_date.lte": today, "vote_count.gte": 400, sort_by: "vote_average.desc" }),
    nowFr: () => lst("now_playing", { region: "FR" }), upc: () => lst("upcoming", { region: "FR" }), top: () => lst("top_rated"),
    fr: () => disc({ with_original_language: "fr", sort_by: "popularity.desc", "vote_count.gte": 300 }),
    gems: () => disc({ sort_by: "vote_average.desc", "vote_count.gte": 300, "vote_count.lte": 2500, "vote_average.gte": 7.4 })
  };
  Object.keys(GENRES).forEach((k) => { jobs[k] = () => disc({ with_genres: GENRES[k][2], sort_by: "popularity.desc", "vote_count.gte": 500, "vote_average.gte": 6.4 }); });
  Object.keys(DECADES).forEach((k) => { jobs[k] = () => disc({ "primary_release_date.gte": DECADES[k][1] + "-01-01", "primary_release_date.lte": DECADES[k][2] + "-12-31", sort_by: "vote_average.desc", "vote_count.gte": 3000 }); });
  const keys = Object.keys(jobs), vals = await Promise.all(keys.map((k) => safe(jobs[k]))), R = {}; keys.forEach((k, i) => { R[k] = vals[i]; });
  // À la une : les films les mieux notés du moment dans le monde (récents + tendances), avec visuel large
  const score = (m) => m.vote_average * (1 + Math.log10(Math.max(m.vote_count, 1)) / 8), pool = new Map();
  [...R.recent, ...R.trend, ...R.trend2].forEach((m) => { if (m.backdrop_path && m.overview && m.vote_count >= 300 && !pool.has(m.id)) pool.set(m.id, m); });
  const hero = [...pool.values()].sort((a, b) => score(b) - score(a)).slice(0, 6);
  const g = (k) => ({ id: k, title: GENRES[k][0], sub: GENRES[k][1], items: R[k] }), d = (k) => ({ id: k, title: DECADES[k][0], sub: "Les classiques les mieux notés", items: R[k] });
  const rows = [
    { id: "top10-world", title: "Top 10 monde cette semaine", sub: "Les films les plus regardés en ce moment", style: "top10", items: R.trend.slice(0, 10) },
    { id: "top10-fr", title: "Top 10 France", sub: "Les plus populaires à l’affiche en France", style: "top10", items: [...R.nowFr].sort((a, b) => b.popularity - a.popularity).slice(0, 10) },
    { id: "best-recent", title: "Les mieux notés du moment", sub: "Les meilleurs avis des derniers mois, dans le monde", items: R.recent.slice(0, 20) },
    { id: "now-fr", title: "À l’affiche en France", sub: "", items: R.nowFr.slice(0, 20) },
    g("sf"), g("horreur"), { id: "fr", title: "Cinéma français", sub: "Les films français qui font parler", items: R.fr }, g("comedie"), g("action"),
    { id: "gems", title: "Pépites à découvrir", sub: "Très bien notés, moins connus", items: R.gems }, g("thriller"), g("drame"), d("d80"), g("animation"), g("romance"), d("d90"),
    g("polar"), g("fantastique"), d("d00"), g("aventure"), g("guerre"),
    { id: "upcoming", title: "Prochainement au cinéma", sub: "À ne pas manquer", items: R.upc.slice(0, 20) },
    { id: "top", title: "Les mieux notés de tous les temps", sub: "Les chefs-d’œuvre", items: R.top }
  ].filter((r) => r.items.length >= 4);
  return { hero, rows };
}

const DISC_KEYS = ["with_genres", "without_genres", "sort_by", "vote_count.gte", "vote_count.lte", "vote_average.gte", "primary_release_date.gte", "primary_release_date.lte", "with_original_language", "with_crew", "with_cast", "with_keywords", "with_companies", "region", "page"];
route("/api/home", () => cached("home", 30 * 60e3, buildHome));
route("/api/discover", async (req) => { const p = {}; DISC_KEYS.forEach((k) => { if (req.query[k] !== undefined) p[k] = String(req.query[k]).slice(0, 80); }); return { results: await disc(p) }; });
route("/api/recs/:id", async (req) => ({ results: withPoster((await tmdb("/movie/" + encodeURIComponent(req.params.id) + "/recommendations")).results) }));
route("/api/person-search", async (req) => ({ results: ((await tmdb("/search/person", { query: req.query.q || "" })).results || []).slice(0, 5).map((p) => ({ id: p.id, name: p.name, known_for_department: p.known_for_department })) }));

// ---- Franchises : toujours dans l'ordre de sortie
const FRANCHISES = [
  { slug: "mcu", name: "Marvel Cinematic Universe", colors: ["#ed1d24", "#1b1b2f"], specs: [{ k: "marvel cinematic universe" }] },
  { slug: "star-wars", name: "Star Wars", colors: ["#f2c200", "#0b0b1a"], specs: [{ c: "Star Wars Collection" }, { t: "Rogue One: A Star Wars Story", y: 2016 }, { t: "Solo: A Star Wars Story", y: 2018 }, { t: "Star Wars: The Clone Wars", y: 2008 }] },
  { slug: "harry-potter", name: "Harry Potter", colors: ["#7a4cc2", "#1a1030"], specs: [{ c: "Harry Potter Collection" }, { c: "Fantastic Beasts Collection" }] },
  { slug: "lotr", name: "Le Seigneur des anneaux", colors: ["#c9a227", "#16241a"], specs: [{ c: "The Lord of the Rings Collection" }, { c: "The Hobbit Collection" }] },
  { slug: "bond", name: "James Bond", colors: ["#2a2a2a", "#c0392b"], specs: [{ c: "James Bond Collection" }] },
  { slug: "fast", name: "Fast & Furious", colors: ["#ff7a18", "#14161f"], specs: [{ c: "The Fast and the Furious Collection" }] },
  { slug: "mi", name: "Mission: Impossible", colors: ["#d63031", "#0f1b2d"], specs: [{ c: "Mission: Impossible Collection" }] },
  { slug: "jurassic", name: "Jurassic Park", colors: ["#e17055", "#0b2b1c"], specs: [{ c: "Jurassic Park Collection" }] },
  { slug: "matrix", name: "Matrix", colors: ["#00b36b", "#04120c"], specs: [{ c: "The Matrix Collection" }] },
  { slug: "batman", name: "Batman", colors: ["#f1c40f", "#0b0b0f"], specs: [{ c: "Batman Collection" }, { c: "The Dark Knight Collection" }] },
  { slug: "dceu", name: "DC Extended Universe", colors: ["#1d6fe0", "#0a0f1e"], specs: [{ k: "dc extended universe" }] },
  { slug: "xmen", name: "X-Men", colors: ["#f9b400", "#142a5c"], specs: [{ c: "X-Men Collection" }, { c: "Wolverine Collection" }, { c: "Deadpool Collection" }] },
  { slug: "spider-man", name: "Spider-Man", colors: ["#e62429", "#0c1a3a"], specs: [{ c: "Spider-Man Collection" }, { c: "The Amazing Spider-Man Collection" }, { c: "Spider-Man: Spider-Verse Collection" }] },
  { slug: "pirates", name: "Pirates des Caraïbes", colors: ["#d4a017", "#0b2230"], specs: [{ c: "Pirates of the Caribbean Collection" }] },
  { slug: "toy-story", name: "Toy Story", colors: ["#2b9df4", "#ffcc00"], specs: [{ c: "Toy Story Collection" }] },
  { slug: "alien", name: "Alien & Predator", colors: ["#2ecc71", "#050a08"], specs: [{ c: "Alien Collection" }, { c: "Predator Collection" }] },
  { slug: "terminator", name: "Terminator", colors: ["#e74c3c", "#10141c"], specs: [{ c: "The Terminator Collection" }] },
  { slug: "indiana", name: "Indiana Jones", colors: ["#b9770e", "#1e1408"], specs: [{ c: "Indiana Jones Collection" }] },
  { slug: "john-wick", name: "John Wick", colors: ["#9b59b6", "#0a0a12"], specs: [{ c: "John Wick Collection" }] },
  { slug: "rocky", name: "Rocky & Creed", colors: ["#c0392b", "#1c1c1c"], specs: [{ c: "Rocky Collection" }, { c: "Creed Collection" }] },
  { slug: "hunger", name: "Hunger Games", colors: ["#f39c12", "#101010"], specs: [{ c: "The Hunger Games Collection" }] },
  { slug: "avatar", name: "Avatar", colors: ["#00b4d8", "#05172b"], specs: [{ c: "Avatar Collection" }] },
  { slug: "shrek", name: "Shrek", colors: ["#7cb518", "#1b2a0c"], specs: [{ c: "Shrek Collection" }] },
  { slug: "star-trek", name: "Star Trek", colors: ["#3a7bd5", "#0a1224"], specs: [{ c: "Star Trek", all: true }] },
  { slug: "apes", name: "La Planète des singes", colors: ["#a0522d", "#1a120b"], specs: [{ c: "Planet of the Apes", all: true }] },
  { slug: "mad-max", name: "Mad Max", colors: ["#e67e22", "#1a0f06"], specs: [{ c: "Mad Max Collection" }] },
  { slug: "dune", name: "Dune", colors: ["#d98e04", "#1a1206"], specs: [{ c: "Dune Collection" }] },
  { slug: "pixar", name: "Pixar", colors: ["#4aa3df", "#13203a"], specs: [{ co: "Pixar" }] },
  { slug: "ghibli", name: "Studio Ghibli", colors: ["#6fb98f", "#10261c"], specs: [{ co: "Studio Ghibli" }] }
];
async function resolveSpec(s) {
  if (s.c) {
    const r = await tmdb("/search/collection", { query: s.c, language: "en-US" }), q = norm(s.c);
    const m = (r.results || []).filter((x) => norm(x.name).includes(q)).slice(0, s.all ? 6 : 1);
    return (await Promise.all(m.map((x) => tmdb("/collection/" + x.id)))).flatMap((p) => p.parts || []);
  }
  if (s.k) {
    const r = await tmdb("/search/keyword", { query: s.k }), k = (r.results || []).find((x) => norm(x.name).startsWith(norm(s.k))) || (r.results || [])[0]; if (!k) return [];
    return (await Promise.all([1, 2, 3].map((p) => tmdb("/discover/movie", { include_adult: "false", with_keywords: k.id, sort_by: "primary_release_date.asc", "vote_count.gte": 50, page: p })))).flatMap((p) => p.results || []);
  }
  if (s.co) {
    const r = await tmdb("/search/company", { query: s.co }), c = (r.results || [])[0]; if (!c) return [];
    return (await Promise.all([1, 2, 3].map((p) => tmdb("/discover/movie", { include_adult: "false", with_companies: c.id, sort_by: "primary_release_date.asc", "vote_count.gte": 150, page: p })))).flatMap((p) => p.results || []);
  }
  if (s.t) return ((await tmdb("/search/movie", { query: s.t, year: s.y })).results || []).slice(0, 1);
  return [];
}
async function buildFranchise(f) {
  const parts = (await Promise.all(f.specs.map((s) => safe(() => resolveSpec(s))))).flat(), map = new Map();
  parts.forEach((m) => { if (m && m.id && m.title && m.release_date && m.poster_path && !map.has(m.id)) map.set(m.id, slim(m)); });
  const films = [...map.values()].sort((a, b) => (a.release_date < b.release_date ? -1 : a.release_date > b.release_date ? 1 : a.id - b.id));
  const flag = films.filter((m) => m.backdrop_path).sort((a, b) => b.vote_count - a.vote_count)[0];
  return { slug: f.slug, name: f.name, colors: f.colors, films, backdrop: flag ? flag.backdrop_path : null, from: films.length ? films[0].release_date.slice(0, 4) : null, to: films.length ? films[films.length - 1].release_date.slice(0, 4) : null };
}
route("/api/franchises", async () => FRANCHISES.map((f) => ({ slug: f.slug, name: f.name, colors: f.colors })));
route("/api/franchise/:slug", async (req) => {
  const f = FRANCHISES.find((x) => x.slug === req.params.slug); if (!f) throw new Error("franchise inconnue");
  return cached("fr:" + f.slug, 24 * 3600e3, () => buildFranchise(f));
});

app.use(express.static("public"));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Clap tourne sur le port " + PORT));
