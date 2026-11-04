// Découvrir façon Netflix : à la une, lignes thématiques, recommandations personnelles, franchises.
(function () {
  var A = CLAP_API, sb = A.sb, IMG = "https://image.tmdb.org/t/p/", root = document.querySelector("#disc .pad"), app = document.querySelector(".app");
  var E = function (s) { return esc(String(s == null ? "" : s)); }, nf = function (v) { return Number(v).toFixed(1).replace(".", ","); }, $ = function (s) { return document.querySelector(s); };
  var GN = { 28: "Action", 12: "Aventure", 16: "Animation", 35: "Comédie", 80: "Crime", 99: "Documentaire", 18: "Drame", 10751: "Familial", 14: "Fantastique", 36: "Histoire", 27: "Horreur", 10402: "Musique", 9648: "Mystère", 10749: "Romance", 878: "Science-fiction", 53: "Thriller", 10752: "Guerre", 37: "Western" };
  var seen = new Set(), tab = "home", searching = false, home = null, homeAt = 0, dirty = false, frList = null, frData = {}, hi = 0, heroN = 0, pbusy = false;
  var st = document.createElement("style");
  st.textContent = `.dc-sb{display:flex;align-items:center;gap:10px;background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:4px 14px;margin-top:6px;color:var(--muted);transition:border-color .2s,box-shadow .2s}.dc-sb:focus-within{border-color:var(--accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 22%,transparent)}.dc-sb input{flex:1;min-width:0;background:none;border:0;outline:none;color:var(--text);font:inherit;font-size:16px;padding:10px 0}
.dc-tabs{display:flex;gap:6px;margin:12px 0}.dc-tabs button{flex:1;padding:9px;border-radius:99px;font-weight:700;color:var(--muted);border:1px solid var(--line);background:var(--surface);transition:background .2s,color .2s}.dc-tabs button.dc-on{background:var(--text);color:var(--bg);border-color:var(--text)}
.dc-hero{position:relative;margin:0 -16px;height:430px;overflow:hidden;color:#fff;background:#120a0e;touch-action:pan-y}.dc-slides,.dc-sl{position:absolute;inset:0}.dc-sl{opacity:0;transition:opacity .9s;pointer-events:none}.dc-sl.dc-act{opacity:1;pointer-events:auto}
.dc-bg{position:absolute;inset:-6%;background-size:cover;background-position:center top}.dc-sl.dc-act .dc-bg{animation:dckb 14s ease-out forwards}@keyframes dckb{from{transform:scale(1)}to{transform:scale(1.1) translate(-1.5%,1%)}}
.dc-sh{position:absolute;inset:0;background:linear-gradient(to top,var(--bg) 0,rgba(10,5,8,.78) 38%,rgba(10,5,8,.25) 100%)}.dc-info{position:absolute;left:16px;right:16px;bottom:34px}.dc-sl.dc-act .dc-info>*{animation:dcup .7s backwards}.dc-sl.dc-act .dc-info>*:nth-child(2){animation-delay:.08s}.dc-sl.dc-act .dc-info>*:nth-child(3){animation-delay:.16s}.dc-sl.dc-act .dc-info>*:nth-child(4){animation-delay:.24s}.dc-sl.dc-act .dc-info>*:nth-child(5){animation-delay:.32s}@keyframes dcup{from{opacity:0;transform:translateY(18px)}}
.dc-kick{display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#ffd36b}.dc-kick .ic{width:13px;height:13px}.dc-info h2{font:400 44px/.92 "Bebas Neue",Impact,sans-serif;letter-spacing:.02em;margin:6px 0 8px;text-shadow:0 2px 20px rgba(0,0,0,.6)}
.dc-meta{display:flex;flex-wrap:wrap;gap:6px;align-items:center;font-size:12px;font-weight:700}.dc-meta b{color:#ffd36b}.dc-meta span{padding:3px 9px;border-radius:99px;background:rgba(255,255,255,.17);backdrop-filter:blur(6px)}
.dc-info p{margin:10px 0 12px;font-size:14px;line-height:1.45;opacity:.92;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.dc-btns{display:flex;gap:8px}.dc-btns .btn{flex:none;padding:11px 18px}
.dc-dots{position:absolute;left:0;right:0;bottom:12px;display:flex;justify-content:center;gap:6px}.dc-dots i{width:18px;height:4px;border-radius:9px;background:rgba(255,255,255,.35);transition:width .3s,background .3s;cursor:pointer}.dc-dots i.dc-act{width:30px;background:#fff}
.dc-row{margin:20px 0 0}.dc-rv{opacity:0;transform:translateY(20px);transition:opacity .6s,transform .6s cubic-bezier(.2,.8,.2,1)}.dc-rv.dc-in{opacity:1;transform:none}
.dc-row h3{font:400 26px/1 "Bebas Neue",sans-serif;letter-spacing:.04em;margin:0 0 10px}.dc-row h3 small{display:block;font:400 12px "DM Sans",sans-serif;letter-spacing:0;color:var(--muted);margin-top:3px}
.dc-sc{display:flex;gap:10px;overflow-x:auto;margin:0 -16px;padding:2px 16px 10px;scrollbar-width:none;scroll-snap-type:x proximity}.dc-sc::-webkit-scrollbar{display:none}
.dc-c{flex:none;width:112px;text-align:left;scroll-snap-align:start;transition:transform .2s}.dc-c:active{transform:scale(.95)}.dc-w{display:block}.dc-p{position:relative;display:block;aspect-ratio:2/3;border-radius:12px;overflow:hidden;background:var(--line);box-shadow:0 8px 20px rgba(0,0,0,.28)}.dc-p img{width:100%;height:100%;object-fit:cover;display:block;animation:dcfade .5s}@keyframes dcfade{from{opacity:0}}
.dc-r{position:absolute;left:6px;bottom:6px;font-style:normal;font-size:11px;font-weight:700;padding:2px 7px;border-radius:99px;background:rgba(0,0,0,.72);color:#ffd36b}.dc-s{display:none;position:absolute;right:6px;top:6px;width:22px;height:22px;border-radius:50%;background:#22c55e;color:#fff;place-items:center;text-decoration:none;font-size:13px;box-shadow:0 2px 8px rgba(0,0,0,.4)}.dc-c.dc-sn .dc-s{display:grid}
.dc-t{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-size:12px;line-height:1.25;margin-top:6px}
.dc-t10 .dc-c{width:158px;display:flex;align-items:flex-end}.dc-t10 .dc-w{width:104px;flex:none}.dc-n{font:400 128px/.78 "Bebas Neue",sans-serif;color:transparent;-webkit-text-stroke:3px color-mix(in srgb,var(--text) 55%,transparent);margin-right:-18px;position:relative;z-index:0;letter-spacing:-.05em}.dc-t10 .dc-w{position:relative;z-index:1}
.dc-sk{flex:none;width:112px;aspect-ratio:2/3;border-radius:12px;background:linear-gradient(100deg,var(--line) 30%,rgba(128,128,128,.3) 50%,var(--line) 70%);background-size:200% 100%;animation:dcsh 1.2s linear infinite}@keyframes dcsh{to{background-position:-200% 0}}.dc-skh{margin:0 -16px;height:430px;background:var(--line);animation:dcpulse 1.4s ease-in-out infinite}@keyframes dcpulse{50%{opacity:.5}}
.dc-tip{display:flex;gap:12px;align-items:center;margin-top:18px;padding:14px 16px;border-radius:16px;background:var(--surface);border:1px solid var(--line);font-size:14px}.dc-tip .ic{width:26px;height:26px;color:var(--accent);flex:none}.dc-err,.dc-lead{color:var(--muted);margin:14px 0}
.dc-g{display:grid;grid-template-columns:repeat(3,1fr);gap:12px 10px;margin-top:6px}.dc-g .dc-c{width:auto}
.dc-frg{display:grid;grid-template-columns:1fr 1fr;gap:10px}.fr-t{position:relative;aspect-ratio:16/11;border-radius:16px;overflow:hidden;background:linear-gradient(135deg,var(--a),var(--b));color:#fff;text-align:left;padding:12px;display:flex;flex-direction:column;justify-content:flex-end;box-shadow:0 8px 22px rgba(0,0,0,.28);transition:transform .2s}.fr-t:active{transform:scale(.96)}
.fr-bg{position:absolute;inset:0;background-size:cover;background-position:center;opacity:0;transition:opacity .7s}.fr-bg.dc-ld{opacity:.55}.fr-t::after{content:"";position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.78),transparent 70%)}.fr-t b,.fr-t small{position:relative;z-index:1}.fr-t b{font:400 24px/.95 "Bebas Neue",sans-serif;letter-spacing:.03em}.fr-t small{font-size:11px;opacity:.9;margin-top:4px}
.fr-pb{position:relative;z-index:1;height:4px;border-radius:9px;background:rgba(255,255,255,.25);margin-top:6px;overflow:hidden}.fr-pb i{display:block;height:100%;background:#ffd36b;border-radius:9px}
.fr-ov{position:absolute;inset:0;z-index:14;background:var(--bg);overflow-y:auto;transform:translateY(100%);visibility:hidden;transition:transform .3s ease,visibility 0s .3s}.fr-ov.open{transform:none;visibility:visible;transition:transform .3s ease}
.fr-hero{position:relative;height:340px;overflow:hidden;color:#fff;display:flex;align-items:flex-end;background:linear-gradient(135deg,var(--a),var(--b))}.fr-hbg{position:absolute;inset:0;background-size:cover;background-position:center top;opacity:.6}.fr-hsh{position:absolute;inset:0;background:linear-gradient(to top,rgba(10,5,8,.95),rgba(10,5,8,.2))}.fr-hc{position:relative;padding:0 16px 20px;width:100%}
.fr-k{font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#ffd36b}.fr-hc h1{font:400 44px/.92 "Bebas Neue",Impact,sans-serif;letter-spacing:.02em;margin:4px 0}.fr-meta{font-size:13px;opacity:.9}.fr-prog{margin:12px 0}.fr-bar{height:6px;border-radius:9px;background:rgba(255,255,255,.25);overflow:hidden}.fr-bar i{display:block;height:100%;width:0;border-radius:9px;background:linear-gradient(90deg,#ffd36b,#ff9f43);transition:width 1.2s cubic-bezier(.2,.8,.2,1)}.fr-prog small{display:block;margin-top:6px;font-size:12px;opacity:.9}.fr-hc .btn{flex:none;padding:11px 18px}.fr-done{display:inline-flex;align-items:center;gap:6px;font-weight:700;color:#86efac}
.fr-list{padding:18px 16px 40px}.fr-i{display:flex;gap:12px;width:100%;text-align:left;animation:dcup .5s backwards}.fr-y{flex:none;width:46px;position:relative;text-align:center;padding-top:14px}.fr-y b{font:400 20px "Bebas Neue",sans-serif;letter-spacing:.03em;color:var(--muted)}.fr-y i{position:absolute;left:50%;top:44px;bottom:-14px;width:2px;background:var(--line);transform:translateX(-50%)}.fr-i:last-child .fr-y i{display:none}
.fr-card{position:relative;flex:1;min-width:0;display:flex;gap:12px;padding:10px;margin-bottom:12px;border-radius:16px;background:var(--surface);border:1px solid var(--line)}.fr-i.fr-sn .fr-card{border-color:#22c55e}.fr-po{flex:none;width:64px;aspect-ratio:2/3;border-radius:9px;background-size:cover;background-position:center;background-color:var(--line);box-shadow:0 6px 14px rgba(0,0,0,.3)}.fr-tx{min-width:0;display:block}.fr-tx b{display:block;font-size:15px}.fr-tx em{display:block;font-style:normal;color:var(--muted);font-size:12px;margin:2px 0 4px}.fr-tx small{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;color:var(--muted);font-size:12px;line-height:1.35}
.fr-ck,.fr-soon{position:absolute;right:10px;top:10px;text-decoration:none;font-size:11px;font-weight:700;padding:3px 8px;border-radius:99px}.fr-ck{width:24px;height:24px;padding:0;display:grid;place-items:center;background:#22c55e;color:#fff;font-size:14px}.fr-soon{background:rgba(128,128,128,.25);color:var(--muted)}
@media (prefers-reduced-motion:reduce){.dc-sl .dc-bg,.dc-info>*,.fr-i{animation:none!important}.dc-rv{opacity:1;transform:none}}`;
  document.head.appendChild(st);

  function api(p) { return fetch("/api/" + p).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }); }
  var today = function () { return new Date().toLocaleDateString("sv-SE"); };
  root.innerHTML = '<div class="dc"><div class="dc-sb">' + IC("search") + '<input id="dc-q" type="search" placeholder="Rechercher un film…" aria-label="Rechercher un film" autocomplete="off"></div><div class="dc-tabs"><button class="dc-on" data-dt="home">Pour toi</button><button data-dt="fr">Franchises</button></div><div id="dc-body"></div></div>';

  // ---- Briques
  function card(m, n) {
    return '<button class="dc-c" data-id="' + m.id + '" aria-label="' + E(m.title) + '">' + (n ? '<b class="dc-n">' + n + '</b>' : "") + '<span class="dc-w"><span class="dc-p"><img loading="lazy" src="' + IMG + 'w342' + m.poster_path + '" alt="">' + (m.vote_average ? '<i class="dc-r">★ ' + nf(m.vote_average) + '</i>' : "") + '<u class="dc-s">' + IC("check") + '</u></span>' + (n ? "" : '<span class="dc-t">' + E(m.title) + '</span>') + '</span></button>';
  }
  function rowHTML(r) {
    var t10 = r.style === "top10";
    return '<section class="dc-row dc-rv' + (t10 ? " dc-t10" : "") + '"><h3>' + E(r.title) + (r.sub ? "<small>" + E(r.sub) + "</small>" : "") + '</h3><div class="dc-sc">' + r.items.map(function (m, i) { return card(m, t10 ? i + 1 : 0); }).join("") + '</div></section>';
  }
  function skeleton() { var sk = '<div class="dc-sc">' + new Array(6).join('<div class="dc-sk"></div>') + '</div>'; return '<div class="dc-skh"></div><div class="dc-row">' + sk + '</div><div class="dc-row">' + sk + '</div>'; }
  function markSeen() { document.querySelectorAll("#disc .dc-c[data-id]").forEach(function (b) { b.classList.toggle("dc-sn", seen.has(+b.dataset.id)); }); }
  var io = null;
  function observe() {
    if (!window.IntersectionObserver) return document.querySelectorAll("#disc .dc-rv").forEach(function (x) { x.classList.add("dc-in"); });
    if (!io) io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("dc-in"); io.unobserve(e.target); } }); }, { root: $("#disc"), threshold: .08 });
    document.querySelectorAll("#disc .dc-rv:not(.dc-in)").forEach(function (x) { io.observe(x); });
  }

  // ---- À la une
  var heroList = [];
  function heroHTML(l) {
    heroList = l; heroN = l.length; hi = 0;
    if (!l.length) return "";
    return '<div class="dc-hero" id="dc-hero"><div class="dc-slides">' + l.map(function (m, i) {
      return '<div class="dc-sl' + (i ? "" : " dc-act") + '" data-i="' + i + '"><div class="dc-bg" style="background-image:url(' + IMG + 'w1280' + m.backdrop_path + ')"></div><div class="dc-sh"></div><div class="dc-info"><span class="dc-kick">' + IC("star") + 'À la une · les mieux notés du moment</span><h2>' + E(m.title).toUpperCase() + '</h2><div class="dc-meta"><b>★ ' + nf(m.vote_average) + '</b><span>' + (m.release_date || "").slice(0, 4) + '</span>' + (m.genre_ids || []).slice(0, 2).map(function (id) { return GN[id] ? "<span>" + GN[id] + "</span>" : ""; }).join("") + '</div><p>' + E(m.overview) + '</p><div class="dc-btns"><button class="btn main" data-id="' + m.id + '">' + IC("film") + 'Voir la fiche</button><button class="btn" data-addl="' + i + '">' + IC("plus") + 'Liste</button></div></div></div>';
    }).join("") + '</div><div class="dc-dots">' + l.map(function (_, i) { return '<i class="' + (i ? "" : "dc-act") + '" data-d="' + i + '"></i>'; }).join("") + '</div></div>';
  }
  function goHero(i) {
    if (!heroN) return; hi = (i + heroN) % heroN;
    document.querySelectorAll("#dc-hero .dc-sl").forEach(function (s, k) { s.classList.toggle("dc-act", k === hi); });
    document.querySelectorAll("#dc-hero .dc-dots i").forEach(function (d, k) { d.classList.toggle("dc-act", k === hi); });
  }
  setInterval(function () { var d = $("#disc"); if (document.hidden || !d || !d.classList.contains("on") || tab !== "home" || searching || !$("#dc-hero")) return; goHero(hi + 1); }, 6500);
  var sx = null;
  root.addEventListener("pointerdown", function (e) { if (e.target.closest(".dc-hero")) sx = e.clientX; });
  root.addEventListener("pointerup", function (e) { if (sx == null) return; var dx = e.clientX - sx; sx = null; if (Math.abs(dx) > 45) goHero(hi + (dx < 0 ? 1 : -1)); });

  // ---- Accueil
  async function showHome() {
    var b = $("#dc-body"); b.innerHTML = skeleton();
    try { if (!home || Date.now() - homeAt > 10 * 60e3) { home = await api("home"); homeAt = Date.now(); } }
    catch (e) { b.innerHTML = '<p class="dc-err">Impossible de charger la découverte. Vérifie que le serveur tourne et que ta clé TMDB est bonne.</p>'; return; }
    if (tab !== "home" || searching) return;
    b.innerHTML = heroHTML(home.hero) + '<div id="dc-pers"></div><div id="dc-rows">' + home.rows.map(rowHTML).join("") + '</div>';
    observe(); markSeen(); personalize();
  }

  // ---- Recommandations personnelles : tes J'aime, tes notes, tes visionnages
  async function signals() {
    var me = A.me();
    var rs = await Promise.all([sb.from("film_reactions").select("tmdb_id,title,reaction").eq("user_id", me.id).limit(500), sb.from("watches").select("tmdb_id,title,rating,watched_on").eq("user_id", me.id).order("watched_on", { ascending: false }).limit(2000)]);
    var react = rs[0].data || [], W = rs[1].data || [], sc = {}, title = {}, disliked = new Set(), latest = {}, order = {};
    seen = new Set(W.map(function (w) { return w.tmdb_id; })); markSeen();
    W.forEach(function (w, i) { title[w.tmdb_id] = w.title; if (!(w.tmdb_id in order)) order[w.tmdb_id] = i; if (!(w.tmdb_id in latest) && w.rating != null) latest[w.tmdb_id] = Number(w.rating); });
    react.forEach(function (r) { title[r.tmdb_id] = r.title; if (r.reaction === 1) sc[r.tmdb_id] = (sc[r.tmdb_id] || 0) + 3; else { disliked.add(r.tmdb_id); sc[r.tmdb_id] = (sc[r.tmdb_id] || 0) - 3; } });
    Object.keys(latest).forEach(function (id) { var r = latest[id]; sc[id] = (sc[id] || 0) + (r >= 4.5 ? 3 : r >= 4 ? 2 : r >= 3.5 ? 1 : r <= 2 ? -2 : 0); if (r <= 1.5) disliked.add(+id); });
    var seeds = Object.keys(sc).filter(function (id) { return sc[id] >= 2; }).sort(function (a, b) { return sc[b] - sc[a] || (order[a] == null ? 9e9 : order[a]) - (order[b] == null ? 9e9 : order[b]); }).map(function (id) { return { id: +id, title: title[id] || "ce film", w: sc[id] }; });
    return { seeds: seeds, disliked: disliked };
  }
  async function personalize() {
    var host = $("#dc-pers"); if (!host || pbusy) return; if (!A.me()) { host.innerHTML = ""; return; } pbusy = true;
    try {
      var sig = await signals();
      if (!sig.seeds.length) { host.innerHTML = '<div class="dc-tip">' + IC("thumbup") + '<div><b>Pour toi</b><br>Aime ou note quelques films : cette page te proposera des films sur mesure (même genre, même réalisateur…).</div></div>'; return; }
      var seeds = sig.seeds.slice(0, 6), det = await Promise.all(seeds.map(function (s) { return api("movie/" + s.id).catch(function () { return null; }); })), recs = await Promise.all(seeds.slice(0, 4).map(function (s) { return api("recs/" + s.id).catch(function () { return { results: [] }; }); }));
      var ok = function (m) { return m.poster_path && !seen.has(m.id) && !sig.disliked.has(m.id); }, rows = [], mix = {};
      recs.forEach(function (r, i) { (r.results || []).forEach(function (m) { if (!ok(m)) return; var e = mix[m.id] || (mix[m.id] = { m: m, s: 0 }); e.s += seeds[i].w * (1 + (m.vote_average || 0) / 10); }); });
      var sel = Object.keys(mix).map(function (k) { return mix[k]; }).sort(function (a, b) { return b.s - a.s; }).slice(0, 20).map(function (x) { return x.m; });
      if (sel.length >= 4) rows.push({ id: "for-you", title: "Sélection pour toi", sub: "D’après tes J’aime et tes notes", items: sel });
      for (var i = 0; i < Math.min(2, recs.length); i++) { var it = (recs[i].results || []).filter(ok).slice(0, 18); if (it.length >= 4) rows.push({ id: "bc" + seeds[i].id, title: "Parce que tu as aimé " + seeds[i].title, sub: "", items: it }); }
      var gw = {}, gn = {}, dw = {};
      det.forEach(function (d, i) { if (!d) return; (d.genres || []).forEach(function (g) { gw[g.id] = (gw[g.id] || 0) + seeds[i].w; gn[g.id] = g.name; }); var dir = ((d.credits || {}).crew || []).filter(function (c) { return c.job === "Director"; })[0]; if (dir) dw[dir.name] = (dw[dir.name] || 0) + seeds[i].w; });
      var tg = Object.keys(gw).sort(function (a, b) { return gw[b] - gw[a]; }).slice(0, 2), td = Object.keys(dw).sort(function (a, b) { return dw[b] - dw[a]; }).slice(0, 2), jobs = [];
      if (tg[0]) jobs.push(api("discover?with_genres=" + tg[0] + "&sort_by=vote_average.desc&vote_count.gte=1500").then(function (r) { return { id: "g1", title: "Pour les amateurs de " + gn[tg[0]].toLowerCase(), sub: "Les mieux notés du genre", items: r.results }; }));
      if (tg[1]) jobs.push(api("discover?with_genres=" + tg[0] + "," + tg[1] + "&sort_by=vote_average.desc&vote_count.gte=800").then(function (r) { return { id: "g2", title: gn[tg[0]] + " et " + gn[tg[1]].toLowerCase(), sub: "Ton mélange préféré", items: r.results }; }));
      td.forEach(function (name) { jobs.push(api("person-search?q=" + encodeURIComponent(name)).then(function (r) { var p = (r.results || []).filter(function (x) { return x.known_for_department === "Directing"; })[0] || (r.results || [])[0]; return p ? api("discover?with_crew=" + p.id + "&sort_by=popularity.desc&vote_count.gte=100").then(function (d) { return { id: "dir" + p.id, title: "Les films de " + name, sub: "Parce que tu aimes son travail", items: d.results }; }) : null; })); });
      (await Promise.all(jobs.map(function (j) { return j.catch(function () { return null; }); }))).filter(Boolean).forEach(function (r) { r.items = (r.items || []).filter(ok).slice(0, 20); if (r.items.length >= 4) rows.push(r); });
      host.innerHTML = rows.map(rowHTML).join(""); observe(); markSeen();
    } finally { pbusy = false; }
  }

  // ---- Franchises
  var fq = [], fbusy = 0;
  function frTile(slug) {
    var d = frData[slug], t = document.querySelector('.fr-t[data-fr="' + slug + '"]'); if (!d || !t) return;
    if (!d.films.length) { t.style.display = "none"; return; }
    var n = d.films.filter(function (m) { return seen.has(m.id); }).length;
    if (d.backdrop) { var bg = t.querySelector(".fr-bg"); bg.style.backgroundImage = "url(" + IMG + "w500" + d.backdrop + ")"; bg.classList.add("dc-ld"); }
    t.querySelector("small").textContent = d.films.length + " films · " + d.from + (d.to !== d.from ? " – " + d.to : "");
    var pb = t.querySelector(".fr-pb"); pb.innerHTML = n ? '<i style="width:' + Math.round(n / d.films.length * 100) + '%"></i>' : "";
  }
  function pump() {
    while (fbusy < 3 && fq.length) {
      var s = fq.shift(); fbusy++;
      (frData[s] ? Promise.resolve(frData[s]) : api("franchise/" + s)).then(function (slug) { return function (d) { frData[slug] = d; frTile(slug); }; }(s)).catch(function () {}).then(function () { fbusy--; pump(); });
    }
  }
  var fio = null;
  async function showFr() {
    var b = $("#dc-body"); b.innerHTML = '<p class="dc-lead">Toutes les sagas, dans l’ordre de sortie.</p><div class="dc-frg">' + new Array(7).join('<div class="dc-sk" style="width:auto;aspect-ratio:16/11"></div>') + '</div>';
    try { if (!frList) frList = await api("franchises"); } catch (e) { b.innerHTML = '<p class="dc-err">Impossible de charger les franchises.</p>'; return; }
    if (tab !== "fr" || searching) return;
    b.innerHTML = '<p class="dc-lead">Toutes les sagas, dans l’ordre de sortie.</p><div class="dc-frg">' + frList.map(function (f) { return '<button class="fr-t" data-fr="' + f.slug + '" style="--a:' + f.colors[0] + ';--b:' + f.colors[1] + '"><i class="fr-bg"></i><b>' + E(f.name) + '</b><small>&nbsp;</small><span class="fr-pb"></span></button>'; }).join("") + '</div>';
    fq = []; if (fio) fio.disconnect();
    var go = function (t) { var s = t.dataset.fr; if (fq.indexOf(s) < 0 && !t.dataset.ld) { t.dataset.ld = 1; fq.push(s); pump(); } };
    if (window.IntersectionObserver) { fio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { go(e.target); fio.unobserve(e.target); } }); }, { root: $("#disc"), rootMargin: "200px" }); document.querySelectorAll(".fr-t").forEach(function (t) { fio.observe(t); }); }
    else document.querySelectorAll(".fr-t").forEach(go);
    Object.keys(frData).forEach(frTile);
  }
  var fr = document.createElement("section"); fr.id = "fr"; fr.className = "fr-ov"; app.insertBefore(fr, document.getElementById("film"));
  async function openFr(slug) {
    fr.innerHTML = '<div class="fp-wrap"><div class="fp-top"><button class="back" data-frx="1" aria-label="Retour">←</button></div><div class="fp-load"><img src="logo.svg" alt="Chargement"></div></div>'; fr.scrollTop = 0; fr.classList.add("open");
    try { if (!frData[slug]) frData[slug] = await api("franchise/" + slug); } catch (e) { fr.querySelector(".fp-load").innerHTML = '<p>Impossible de charger cette franchise.</p>'; return; }
    var d = frData[slug], n = d.films.filter(function (m) { return seen.has(m.id); }).length, t = today(), next = d.films.filter(function (m) { return !seen.has(m.id) && m.release_date <= t; })[0], pct = Math.round(n / d.films.length * 100);
    fr.innerHTML = '<div class="fp-wrap"><div class="fp-top"><button class="back" data-frx="1" aria-label="Retour">←</button><span class="fp-mini">' + E(d.name).toUpperCase() + '</span></div>' +
      '<div class="fr-hero" style="--a:' + d.colors[0] + ';--b:' + d.colors[1] + '">' + (d.backdrop ? '<div class="fr-hbg" style="background-image:url(' + IMG + 'w1280' + d.backdrop + ')"></div>' : "") + '<div class="fr-hsh"></div><div class="fr-hc"><span class="fr-k">Franchise</span><h1>' + E(d.name).toUpperCase() + '</h1><div class="fr-meta">' + d.films.length + ' films · ' + d.from + (d.to !== d.from ? " – " + d.to : "") + ' · dans l’ordre de sortie</div>' +
      '<div class="fr-prog"><div class="fr-bar"><i data-w="' + pct + '%"></i></div><small>' + (A.me() ? "Tu en as vu " + n + " sur " + d.films.length : d.films.length + " films") + '</small></div>' +
      (next ? '<button class="btn main" data-id="' + next.id + '">' + IC("play") + (n ? "Reprendre : " : "Commencer : ") + E(next.title) + '</button>' : (n === d.films.length ? '<span class="fr-done">' + IC("check") + 'Saga terminée</span>' : "")) + '</div></div>' +
      '<div class="fr-list">' + d.films.map(function (m, i) {
        var s = seen.has(m.id), fut = m.release_date > t;
        return '<button class="fr-i' + (s ? " fr-sn" : "") + '" style="animation-delay:' + Math.min(i, 12) * .04 + 's" data-id="' + m.id + '"><span class="fr-y"><b>' + m.release_date.slice(0, 4) + '</b><i></i></span><span class="fr-card"><span class="fr-po" style="background-image:url(' + IMG + 'w185' + m.poster_path + ')"></span><span class="fr-tx"><b>' + E(m.title) + '</b><em>' + (m.vote_average ? "★ " + nf(m.vote_average) + " · " : "") + new Date(m.release_date + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) + '</em><small>' + E(m.overview) + '</small></span>' + (s ? '<u class="fr-ck">' + IC("check") + '</u>' : fut ? '<u class="fr-soon">À venir</u>' : "") + '</span></button>';
      }).join("") + '</div></div>';
    requestAnimationFrame(function () { requestAnimationFrame(function () { fr.querySelectorAll("[data-w]").forEach(function (x) { x.style.width = x.dataset.w; }); }); });
  }
  fr.addEventListener("scroll", function () { var tp = fr.querySelector(".fp-top"); if (tp) tp.classList.toggle("fp-sc", fr.scrollTop > 200); }, { passive: true });

  // ---- Recherche
  var qt;
  async function doSearch(v) {
    var b = $("#dc-body");
    if (!v) { searching = false; return tab === "home" ? showHome() : showFr(); }
    searching = true; b.innerHTML = '<div class="dc-g">' + new Array(7).join('<div class="dc-sk" style="width:auto"></div>') + '</div>';
    try { var r = await api("search?q=" + encodeURIComponent(v)); if (!searching) return; var l = (r.results || []).filter(function (m) { return m.poster_path; });
      b.innerHTML = l.length ? '<div class="dc-g">' + l.map(function (m) { return card(m, 0); }).join("") + '</div>' : '<p class="dc-err">Aucun film trouvé pour « ' + E(v) + ' ».</p>'; markSeen(); }
    catch (e) { b.innerHTML = '<p class="dc-err">La recherche a échoué.</p>'; }
  }
  function switchTab(t) { tab = t; searching = false; var q = $("#dc-q"); if (q) q.value = ""; document.querySelectorAll(".dc-tabs button").forEach(function (b) { b.classList.toggle("dc-on", b.dataset.dt === t); }); t === "home" ? showHome() : showFr(); }

  // ---- Clics
  root.addEventListener("input", function (e) { if (e.target.id !== "dc-q") return; clearTimeout(qt); var v = e.target.value.trim(); qt = setTimeout(function () { doSearch(v); }, 350); });
  document.addEventListener("click", function (e) {
    var inFr = e.target.closest("#fr"), inDisc = e.target.closest("#disc"); if (!inFr && !inDisc) return;
    if (e.target.closest("[data-frx]")) return void fr.classList.remove("open");
    var dt = e.target.closest("[data-dt]"); if (dt && inDisc) return switchTab(dt.dataset.dt);
    var d = e.target.closest("[data-d]"); if (d) return goHero(+d.dataset.d);
    var al = e.target.closest("[data-addl]"); if (al) { var m = heroList[+al.dataset.addl]; return showAdd("", { tmdb_id: m.id, title: m.title, poster_path: m.poster_path }); }
    var f = e.target.closest("[data-fr]"); if (f) return void openFr(f.dataset.fr);
    var c = e.target.closest("[data-id]"); if (c) openFilm(Number(c.dataset.id));
  });

  // ---- Connexion, publication, retour sur l'onglet
  async function loadSeen() { var me = A.me(); if (!me) { seen = new Set(); return markSeen(); } var r = await sb.from("watches").select("tmdb_id").eq("user_id", me.id).limit(5000); if (!r.error) seen = new Set((r.data || []).map(function (x) { return x.tmdb_id; })); markSeen(); Object.keys(frData).forEach(frTile); }
  var prev = A.onUser; A.onUser = function () { if (prev) prev(); loadSeen().then(function () { if (tab === "home" && !searching) personalize(); }); };
  var pp = A.onPublish; A.onPublish = function () { if (pp) pp(); dirty = true; loadSeen(); };
  $('.tab[data-v="disc"]').addEventListener("click", function () { if (dirty && tab === "home" && !searching && $("#dc-pers")) { dirty = false; personalize(); } });
  showHome();
})();
