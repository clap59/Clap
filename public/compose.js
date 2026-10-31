// Écran « Nouvelle critique » : recherche de film, date de visionnage, revisionnage.
(function () {
  var A = CLAP_API, sb = A.sb, TM = "https://image.tmdb.org/t/p/w92";
  window.CLAP_COMPOSE = true; // désactive l'ancien envoi (auth.js)
  var E = function (s) { return esc(String(s == null ? "" : s)); };
  var $ = function (s) { return cEl.querySelector(s); };
  var today = function () { return new Date().toLocaleDateString("sv-SE"); };
  var st = document.createElement("style");
  st.textContent = '.cs-bar{display:flex;align-items:center;gap:10px;background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:8px 10px;transition:border-color .2s,box-shadow .2s}.cs-bar:focus-within{border-color:var(--accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 25%,transparent)}' +
    '.cs-bar input{flex:1;min-width:0;background:none;border:0;outline:none;color:var(--text);font:inherit;font-size:16px;padding:6px 0;text-overflow:ellipsis}.cs-th{width:32px;height:46px;border-radius:6px;background-size:cover;background-position:center;background-color:var(--line);flex:none}' +
    '.cs-ic{width:30px;display:grid;place-items:center;color:var(--muted);flex:none;font-size:18px}.cs-x{width:28px;height:28px;border-radius:50%;background:rgba(128,128,128,.28);color:var(--text);display:grid;place-items:center;font-size:14px;flex:none;transition:transform .15s}.cs-x:active{transform:scale(.88)}' +
    '.cs-res{margin-top:8px;border-radius:14px;background:var(--surface);border:1px solid var(--line);overflow-y:auto;max-height:52vh}.cs-res[hidden]{display:none}.cs-lab{padding:10px 14px 4px;color:var(--muted);font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em}' +
    '.cs-r{display:flex;align-items:center;gap:12px;width:100%;padding:8px 12px;text-align:left;border-top:1px solid var(--line)}.cs-r:active{background:rgba(128,128,128,.15)}.cs-r small{color:var(--muted)}' +
    '.cs-date{width:100%;background:var(--surface);color:var(--text);border:1px solid var(--line);border-radius:14px;padding:12px;font:inherit;font-size:16px}' +
    '.cs-rw{display:flex;align-items:center;gap:12px;margin-top:14px;padding:12px 14px;border-radius:14px;background:var(--surface);border:1px solid var(--line)}.cs-rw .ic{width:22px;height:22px;color:var(--accent)}' +
    '.cs-sw{position:relative;width:48px;height:28px;border-radius:99px;background:rgba(128,128,128,.4);flex:none;transition:background .2s}.cs-sw::after{content:"";position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:50%;background:#fff;transition:transform .2s;box-shadow:0 2px 6px rgba(0,0,0,.3)}.cs-sw.cs-on{background:var(--accent)}.cs-sw.cs-on::after{transform:translateX(20px)}';
  document.head.appendChild(st);

  var sel = null, cur = { count: 0, lastId: null, mine: null, rewatch: false }, results = [], wantRw = false, tm;
  function tpl() {
    return '<div class="cbar"><button class="ico" data-a="x" aria-label="Fermer">' + IC("x") + '</button><b>Nouvelle critique</b><button class="btn main" data-a="pub">Publier</button></div><div class="pad">' +
      '<p class="lbl" style="margin-top:4px">Film</p><div class="cs-bar" id="cs-bar"></div><div class="cs-res" id="cs-res" hidden></div>' +
      '<p class="lbl">Date de visionnage</p><input class="cs-date" id="cd" type="date" max="' + today() + '" aria-label="Date de visionnage"><div id="cs-rwbox"></div>' +
      '<p class="lbl">Ta note <span id="pv" style="color:var(--gold)"></span></p><div class="pick">' + [1, 2, 3, 4, 5].map(function (n) { return '<button data-n="' + n + '" aria-label="Note ' + n + '">★</button>'; }).join("") + '</div><small style="color:var(--muted)">Touche la moitié gauche d’une étoile pour une demi-note.</small>' +
      '<label class="lbl" for="ct">Ta critique (facultatif)</label><textarea id="ct" placeholder="Ton avis, aussi long que tu veux."></textarea><div class="cnt" id="cc">0 caractère</div>' +
      '<p class="lbl">Tags (3 maximum)</p><div class="chips" style="flex-wrap:wrap">' + tagList.map(function (g) { return '<button class="chip" data-g="' + g + '">' + g + '</button>'; }).join("") + '</div></div>';
  }
  function bar() {
    var b = document.getElementById("cs-bar");
    b.innerHTML = sel
      ? (sel.poster_path ? '<div class="cs-th" style="background-image:url(' + TM + sel.poster_path + ')"></div>' : '<div class="cs-ic">' + IC("film") + '</div>') + '<input id="cq" value="' + E(sel.title + (sel.year ? " (" + sel.year + ")" : "")) + '" readonly aria-label="Film choisi"><button class="cs-x" data-cx="1" aria-label="Changer de film">' + IC("x") + '</button>'
      : '<div class="cs-ic">' + IC("search") + '</div><input id="cq" placeholder="Rechercher un film…" autocomplete="off" aria-label="Rechercher un film">';
  }
  function setRating(v) {
    cs.n = v; cEl.querySelectorAll(".pick button").forEach(function (b) { var n = +b.dataset.n; b.classList.toggle("on", n <= v); b.classList.toggle("half", n - .5 === v); });
    var pv = document.getElementById("pv"); if (pv) pv.textContent = v ? String(v).replace(".", ",") + " / 5" : "";
  }
  function setText(t) { var ct = document.getElementById("ct"), cc = document.getElementById("cc"); if (ct) ct.value = t; if (cc) cc.textContent = t.length + " caractère" + (t.length > 1 ? "s" : ""); }
  function toggleRw(on) {
    cur.rewatch = on; var sw = document.getElementById("cs-sw"); if (sw) { sw.classList.toggle("cs-on", on); sw.setAttribute("aria-checked", String(on)); }
    if (cur.mine) { if (on) { setRating(0); setText(""); } else { setRating(Number(cur.mine.rating)); setText(cur.mine.body || ""); } }
  }
  function paintRw() {
    document.getElementById("cs-rwbox").innerHTML = '<div class="cs-rw">' + IC("rotate") + '<div style="flex:1"><b>J’ai revu ce film</b><br><small style="color:var(--muted)">Déjà vu ' + cur.count + ' fois. Active pour ajouter un nouveau visionnage à la date choisie.</small></div><button class="cs-sw" id="cs-sw" data-rw2="1" role="switch" aria-checked="false" aria-label="Revisionnage"></button></div>';
  }
  async function pick(f) {
    sel = f; cur = { count: 0, lastId: null, mine: null, rewatch: false }; bar(); document.getElementById("cs-res").hidden = true; document.getElementById("cs-rwbox").innerHTML = "";
    var me = A.me(); if (!me) return;
    var rs = await Promise.all([
      sb.from("reviews").select("rating,body").eq("tmdb_id", f.id).eq("user_id", me.id).maybeSingle(),
      sb.from("watches").select("id,watched_on", { count: "exact" }).eq("tmdb_id", f.id).eq("user_id", me.id).order("watched_on", { ascending: false }).order("id", { ascending: false }).limit(1)
    ]);
    if (sel !== f) return;
    cur.mine = rs[0].data || null; cur.count = rs[1].error ? (cur.mine ? 1 : 0) : (rs[1].count || 0); cur.lastId = rs[1].data && rs[1].data[0] ? rs[1].data[0].id : null;
    var ct = document.getElementById("ct");
    if (cur.mine) { if (!cs.n) setRating(Number(cur.mine.rating)); if (ct && !ct.value && cur.mine.body) setText(cur.mine.body); }
    if (cur.count > 0) { paintRw(); if (wantRw) toggleRw(true); }
  }
  function search(q) {
    fetch("/api/" + (q ? "search?q=" + encodeURIComponent(q) : "trending")).then(function (r) { return r.json(); }).then(function (r) {
      if (sel) return; results = (r.results || []).filter(function (m) { return m.title; }).slice(0, 8);
      var box = document.getElementById("cs-res"); if (!box) return;
      box.innerHTML = (q ? "" : '<div class="cs-lab">Films du moment</div>') + (results.length ? results.map(function (m, i) {
        return '<button class="cs-r" data-i="' + i + '"><div class="cs-th" style="background-image:url(' + (m.poster_path ? TM + m.poster_path : "") + ')"></div><div><b>' + E(m.title) + '</b><br><small>' + E((m.release_date || "").slice(0, 4) || "Année inconnue") + '</small></div></button>';
      }).join("") : '<div class="cs-lab">Aucun résultat</div>'); box.hidden = false;
    }).catch(function () {});
  }
  window.openCompose = function (f, opts) {
    opts = opts || {}; cs = { n: 0, tags: [], p: "" }; sel = null; wantRw = !!opts.rewatch; cur = { count: 0, lastId: null, mine: null, rewatch: false };
    cEl.innerHTML = tpl(); document.getElementById("cd").value = opts.date || today(); bar();
    if (typeof f === "string") { var a = all.filter(function (x) { return x[0] === f; })[0]; f = a && a[2] ? { id: a[2], title: a[0], poster_path: a[3] || null } : null; }
    if (f) pick({ id: f.id, title: f.title, poster_path: f.poster_path || null, year: f.year || (f.release_date || "").slice(0, 4) });
    cEl.scrollTop = 0; cEl.classList.add("open");
  };
  cEl.addEventListener("input", function (e) { if (e.target.id !== "cq" || sel) return; clearTimeout(tm); var q = e.target.value.trim(); tm = setTimeout(function () { search(q); }, 300); });
  cEl.addEventListener("focusin", function (e) { if (e.target.id === "cq" && !sel && !e.target.value) search(""); });
  cEl.addEventListener("click", function (e) {
    var x = e.target.closest("[data-cx]");
    if (x) { var had = !!cur.mine; sel = null; cur = { count: 0, lastId: null, mine: null, rewatch: false }; if (had) { setRating(0); setText(""); } bar(); document.getElementById("cs-rwbox").innerHTML = ""; $("#cq").focus(); return; }
    var r = e.target.closest(".cs-r");
    if (r) { var m = results[+r.dataset.i]; return void pick({ id: m.id, title: m.title, poster_path: m.poster_path || null, year: (m.release_date || "").slice(0, 4) }); }
    if (e.target.closest("[data-rw2]")) toggleRw(!cur.rewatch);
  });
  cEl.addEventListener("click", async function (e) {
    var b = e.target.closest('[data-a="pub"]'); if (!b) return; e.stopPropagation();
    if (!A.me()) return A.showAuth("in", "Connecte-toi pour publier ta critique.");
    if (!sel) { toast("Choisis d’abord un film"); var q = $("#cq"); if (q) q.focus(); return; }
    if (!cs.n) return toast("Choisis une note");
    var d = document.getElementById("cd").value || today(); if (d > today()) return toast("La date ne peut pas être dans le futur");
    var body = document.getElementById("ct").value.trim(); b.disabled = true;
    var row = { tmdb_id: sel.id, title: sel.title, poster_path: sel.poster_path || null, rating: cs.n };
    if (!(cur.rewatch && !body)) row.body = body;
    var r = await sb.from("reviews").upsert(row, { onConflict: "user_id,tmdb_id" });
    if (r.error) { b.disabled = false; return toast("Publication impossible : " + r.error.message); }
    if (!cur.count || cur.rewatch) await sb.from("watches").insert({ tmdb_id: sel.id, title: sel.title, poster_path: sel.poster_path || null, rating: cs.n, watched_on: d });
    else if (cur.lastId) await sb.from("watches").update({ rating: cs.n, watched_on: d }).eq("id", cur.lastId);
    b.disabled = false; var id = sel.id; cEl.classList.remove("open"); toast("Critique publiée"); window.openFilm(id); if (A.onPublish) A.onPublish();
  }, true);
})();
