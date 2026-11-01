// Journal des visionnages : un seul endroit pour ajouter, modifier, supprimer. + spoilers, confirmation, flèche « haut de page ».
(function () {
  var A = CLAP_API, sb = A.sb;
  var E = function (s) { return esc(String(s == null ? "" : s)); };
  var today = function () { return new Date().toLocaleDateString("sv-SE"); };
  var COLS = "id,watched_on,rating,body,spoiler,rewatch";
  var st = document.createElement("style");
  st.textContent = `.sp{position:relative;border-radius:10px;overflow:hidden}.sp .sp-t{filter:blur(9px);user-select:none;pointer-events:none;transition:filter .3s}
.sp .sp-b{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:6px;width:100%;font-weight:700;font-size:13px;color:inherit;background:rgba(128,128,128,.14)}.sp.sp-open .sp-t{filter:none;user-select:auto;pointer-events:auto}.sp.sp-open .sp-b{display:none}
#totop{position:absolute;right:10px;bottom:calc(env(safe-area-inset-bottom,0px) + 84px);z-index:16;width:38px;height:38px;border-radius:50%;background:var(--bar);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border:1px solid var(--line);color:var(--text);display:grid;place-items:center;font-size:18px;opacity:.88;box-shadow:0 6px 18px rgba(0,0,0,.25);animation:dyin .25s}#totop[hidden]{display:none}@keyframes dyin{from{opacity:0;transform:translateY(10px)}}
#cfm{position:absolute;inset:0;z-index:60;background:rgba(0,0,0,.62);display:grid;place-items:center;padding:24px;animation:dyin .2s}#cfm[hidden]{display:none}
.cfm-c{width:100%;max-width:340px;background:var(--surface);color:var(--text);border-radius:20px;padding:20px;border:1px solid var(--line);box-shadow:0 24px 60px rgba(0,0,0,.5)}.cfm-c b{font:400 26px/1 "Bebas Neue",sans-serif;letter-spacing:.04em}.cfm-c p{margin:8px 0 16px;color:var(--muted)}
.cfm-b{display:flex;gap:8px}.cfm-b button{flex:1;padding:12px;border-radius:12px;font-weight:700;border:1px solid var(--line);background:var(--bg)}.cfm-b .cfm-ok{background:#e5484d;border-color:#e5484d;color:#fff}`;
  document.head.appendChild(st);

  // ---- Spoilers : le texte est flouté derrière un bouton
  window.SPO = function (sp, html) { return sp ? '<div class="sp"><div class="sp-t">' + html + '</div><button class="sp-b" data-sp="1">' + IC("eyeoff") + 'Spoiler · Afficher</button></div>' : html; };
  document.addEventListener("click", function (e) { var b = e.target.closest("[data-sp]"); if (!b) return; e.stopPropagation(); e.preventDefault(); b.parentNode.classList.add("sp-open"); }, true);

  // ---- Fenêtre de confirmation
  var app = document.querySelector(".app"), cfm = document.createElement("div"); cfm.id = "cfm"; cfm.hidden = true; app.appendChild(cfm);
  window.CONFIRM = function (title, msg, ok) {
    return new Promise(function (res) {
      cfm.innerHTML = '<div class="cfm-c"><b>' + E(title) + '</b><p>' + E(msg) + '</p><div class="cfm-b"><button data-c="0">Annuler</button><button class="cfm-ok" data-c="1">' + E(ok || "Supprimer") + '</button></div></div>'; cfm.hidden = false;
      cfm.onclick = function (e) { var b = e.target.closest("[data-c]"); if (!b && e.target !== cfm) return; cfm.hidden = true; res(!!b && b.dataset.c === "1"); };
    });
  };

  // ---- Flèche discrète pour remonter en haut
  var tt = document.createElement("button"); tt.id = "totop"; tt.hidden = true; tt.setAttribute("aria-label", "Remonter en haut"); tt.innerHTML = IC("up"); app.appendChild(tt);
  function scroller() {
    var f = document.getElementById("film"), p = document.getElementById("pub");
    if (f && f.classList.contains("open")) return f; if (p && p.classList.contains("open")) return p;
    var v = document.querySelector(".view.on"); return v && v.id !== "feed" ? v : null;
  }
  setInterval(function () { if (document.hidden) return; var s = scroller(); tt.hidden = !(s && s.scrollTop > 500); }, 300);
  tt.addEventListener("click", function () { var s = scroller(); if (s) s.scrollTo({ top: 0, behavior: "smooth" }); });

  // ---- Journal
  function buildMeta(m) {
    var cr = (m.credits && m.credits.crew) || [], d = cr.filter(function (c) { return c.job === "Director"; }).map(function (c) { return c.name; })[0] || "";
    return { year: +((m.release_date || "").slice(0, 4)) || null, runtime: m.runtime || null, genres: (m.genres || []).map(function (g) { return g.name; }), countries: (m.production_countries || []).map(function (c) { return c.iso_3166_1; }), director: d };
  }
  async function enrich(id) {
    var me = A.me(); if (!me) return;
    try { var m = await (await fetch("/api/movie/" + id)).json(); await sb.from("watches").update({ meta: buildMeta(m) }).eq("user_id", me.id).eq("tmdb_id", id); } catch (e) {}
  }
  async function list(id) {
    var me = A.me(); if (!me) return [];
    var r = await sb.from("watches").select(COLS).eq("user_id", me.id).eq("tmdb_id", id).order("watched_on", { ascending: false }).order("id", { ascending: false });
    return r.error ? null : (r.data || []);
  }
  // La critique publique d'un film = la note du dernier visionnage noté + le dernier texte écrit.
  async function sync(f) {
    var me = A.me(), rows = await list(f.id); if (rows === null) return false;
    var rated = rows.filter(function (x) { return x.rating != null; })[0], texted = rows.filter(function (x) { return x.body; })[0];
    if (!rated) { await sb.from("reviews").delete().eq("user_id", me.id).eq("tmdb_id", f.id); return true; }
    await sb.from("reviews").upsert({ tmdb_id: f.id, title: f.title, poster_path: f.poster_path || null, rating: rated.rating, body: texted ? texted.body : "", spoiler: texted ? !!texted.spoiler : false }, { onConflict: "user_id,tmdb_id" });
    return true;
  }
  async function add(f, o) {
    var row = { tmdb_id: f.id, title: f.title, poster_path: f.poster_path || null, watched_on: o.date || today(), rating: o.rating == null ? null : o.rating, body: o.body || "", spoiler: !!o.body && !!o.spoiler, rewatch: !!o.rewatch };
    if (o.meta) row.meta = o.meta;
    var r = await sb.from("watches").insert(row); if (r.error) return { error: r.error };
    await sync(f); if (!o.meta) enrich(f.id); return {};
  }
  async function update(id, f, fields) { var r = await sb.from("watches").update(fields).eq("id", id); if (r.error) return { error: r.error }; await sync(f); return {}; }
  async function remove(id, f) { var r = await sb.from("watches").delete().eq("id", id); if (r.error) return { error: r.error }; await sync(f); return {}; }
  async function removeAll(f) { var me = A.me(); await sb.from("watches").delete().eq("user_id", me.id).eq("tmdb_id", f.id); await sb.from("reviews").delete().eq("user_id", me.id).eq("tmdb_id", f.id); return {}; }
  async function clearCritique(f) { var me = A.me(); var r = await sb.from("watches").update({ body: "", spoiler: false }).eq("user_id", me.id).eq("tmdb_id", f.id); if (r.error) return { error: r.error }; await sync(f); return {}; }
  async function rate(f, v, o) {
    o = o || {}; var rows = await list(f.id);
    if (rows && !o.again) { var open = rows.filter(function (w) { return w.rating == null; })[0]; if (open) return update(open.id, f, { rating: v, rewatch: open.rewatch || !!o.flag }); }
    return add(f, { date: today(), rating: v, rewatch: !!(o.again || o.flag), meta: o.meta });
  }
  function markSeen(f, meta) { return add(f, { date: today(), rating: null, meta: meta }); }
  window.CLAP_DIARY = { today: today, list: list, sync: sync, add: add, update: update, remove: remove, removeAll: removeAll, clearCritique: clearCritique, rate: rate, markSeen: markSeen, buildMeta: buildMeta, enrich: enrich };
})();
