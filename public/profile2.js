// Profil : notes et critiques (« Afficher plus ») + statistiques complètes.
(function () {
  var A = CLAP_API, sb = A.sb, D = function () { return window.CLAP_DIARY; };
  var E = function (s) { return esc(String(s == null ? "" : s)); };
  var nf = function (v, d) { return Number(v).toFixed(d == null ? 1 : d).replace(".", ","); };
  var MO = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."], MOL = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"], DAYS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
  var st = document.createElement("style");
  st.textContent = `.act-ctl{display:flex;gap:8px;margin-top:6px}.act-ctl button{width:32px;height:32px;border-radius:50%;border:1px solid var(--line);display:grid;place-items:center;color:var(--muted)}.st-cnt{font:500 13px "DM Sans",sans-serif;color:var(--muted);letter-spacing:0;margin-left:6px}
.stx{text-align:left}.st-g{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.st-t{padding:12px 8px;border-radius:16px;background:var(--surface);border:1px solid var(--line);text-align:center;min-width:0}.st-t b{display:block;font:400 30px/1 "Bebas Neue",sans-serif;letter-spacing:.03em}.st-t span{display:block;font-size:11px;color:var(--muted);margin-top:4px;line-height:1.25}.st-t small{display:block;font-size:10px;color:var(--muted);margin-top:2px}
.st-h{font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;font-size:12px;margin:20px 0 8px}.st-card{padding:14px;border-radius:18px;background:var(--surface);border:1px solid var(--line)}
.st-r{display:grid;grid-template-columns:88px 1fr 30px;gap:8px;align-items:center;font-size:13px;margin:6px 0}.st-r span:first-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.st-tr{height:10px;border-radius:9px;background:rgba(128,128,128,.2);overflow:hidden}.st-tr i{display:block;height:100%;width:0;border-radius:9px;background:linear-gradient(90deg,var(--accent),#ff9f43);transition:width 1s cubic-bezier(.2,.8,.2,1)}.st-r b{text-align:right;font-variant-numeric:tabular-nums}
.st-cols{display:flex;align-items:flex-end;gap:4px;height:110px}.st-col{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;font-size:10px;color:var(--muted);min-width:0}.st-col i{display:block;width:100%;min-height:2px;height:0;border-radius:5px 5px 2px 2px;background:linear-gradient(180deg,#ff9f43,var(--accent));transition:height 1s cubic-bezier(.2,.8,.2,1)}.st-col em{font-style:normal;font-size:10px;margin-bottom:2px;color:var(--text)}.st-col span{margin-top:4px}
.st-rec{display:flex;justify-content:space-between;gap:10px;padding:9px 0;border-top:1px solid var(--line);font-size:14px}.st-rec:first-child{border-top:0}.st-rec span{color:var(--muted)}.st-rec b{text-align:right}.st-note{color:var(--muted);font-size:12px;margin-top:10px}`;
  document.head.appendChild(st);

  // ===== Notes et critiques, avec « Afficher plus »
  function crit(el, uid, mine) {
    var list = [], shown = 8, STEP = 8;
    async function load() {
      var r = await sb.from("reviews").select("id,tmdb_id,title,poster_path,rating,body,spoiler,rewatched,views,created_at").eq("user_id", uid).order("created_at", { ascending: false }).limit(300);
      list = r.error ? [] : (r.data || []); paint();
    }
    function paint() {
      var n = list.length;
      el.innerHTML = '<h2 style="text-align:left;margin:20px 0 8px">' + (mine ? "Mes notes et critiques" : "Notes et critiques") + (n ? '<span class="st-cnt">' + n + '</span>' : "") + '</h2>' +
        (n ? list.slice(0, shown).map(function (x) { return CLAP_ITEM(x, null, mine); }).join("") : '<p style="color:var(--muted)">Aucune note pour l’instant.</p>') +
        (n > shown ? '<button class="chip" data-more="1" style="width:100%;margin-top:10px">Afficher plus (' + (n - shown) + ')</button>' : "");
    }
    el.onclick = async function (e) {
      if (e.target.closest("[data-more]")) { shown += STEP; return paint(); }
      var ce = e.target.closest("[data-ce]"), cd = e.target.closest("[data-cd]"); if (!ce && !cd) return; e.stopPropagation();
      var id = +(ce || cd).dataset[ce ? "ce" : "cd"], it = list.filter(function (x) { return x.tmdb_id === id; })[0]; if (!it) return;
      var film = { id: id, title: it.title, poster_path: it.poster_path };
      if (ce) { var rows = await D().list(id) || [], tx = rows.filter(function (w) { return w.body; })[0] || rows[0]; return openCompose(film, tx ? { editId: tx.id } : {}); }
      var ok = it.body ? await CONFIRM("Supprimer ta critique ?", "Ton texte sera effacé. Ta note et tes visionnages sont conservés.", "Supprimer") : await CONFIRM("Supprimer cette note ?", "Le film sera retiré de tes films vus, avec tous ses visionnages.", "Supprimer");
      if (!ok) return; if (it.body) await D().clearCritique(film); else await D().removeAll(film); toast("Supprimé"); load(); if (A.onPublish) A.onPublish();
    };
    load(); return { reload: load };
  }

  // ===== Statistiques
  function stats(el, uid, mine) {
    var tried = {}, busy = false;
    async function load() {
      var rs = await Promise.all([
        sb.from("watches").select("tmdb_id,watched_on,rating,rewatch,meta").eq("user_id", uid).order("watched_on", { ascending: true }).order("id", { ascending: true }).limit(5000),
        sb.from("reviews").select("id", { count: "exact", head: true }).eq("user_id", uid).neq("body", ""),
        sb.from("film_reactions").select("reaction").eq("user_id", uid),
        sb.from("lists").select("id", { count: "exact", head: true }).eq("user_id", uid)]);
      if (rs[0].error) { el.innerHTML = mine ? '<p class="st-note">Les statistiques seront disponibles après la mise à jour de la base de données.</p>' : ""; return; }
      var W = rs[0].data || [];
      if (!W.length) { el.innerHTML = '<p style="color:var(--muted)">' + (mine ? "Marque des films comme vus ou note-les : tes statistiques apparaîtront ici." : "Pas encore de statistiques.") + '</p>'; return; }
      render(W, rs[1].count || 0, rs[2].data || [], rs[3].count || 0); enrich(W);
    }
    function render(W, written, reacts, lists) {
      var by = {}; W.forEach(function (w) { (by[w.tmdb_id] = by[w.tmdb_id] || []).push(w); });
      var ids = Object.keys(by), films = ids.length, rew = 0, ratings = [], minutes = 0;
      ids.forEach(function (id) {
        by[id].forEach(function (w, i) { if (i > 0 || w.rewatch) rew++; minutes += (w.meta && w.meta.runtime) || 0; });
        var l = by[id].slice().reverse().filter(function (w) { return w.rating != null; })[0]; if (l) ratings.push(Number(l.rating));
      });
      var avg = ratings.length ? ratings.reduce(function (a, b) { return a + b; }, 0) / ratings.length : null;
      var dist = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; ratings.forEach(function (r) { dist[Math.round(r * 2) - 1]++; });
      var gen = {}, dec = {}, dir = {}, analysed = 0;
      ids.forEach(function (id) {
        var mt = by[id].map(function (w) { return w.meta; }).filter(function (x) { return x && Object.keys(x).length; })[0]; if (!mt) return; analysed++;
        (mt.genres || []).forEach(function (g) { gen[g] = (gen[g] || 0) + 1; }); if (mt.year) { var d = Math.floor(mt.year / 10) * 10 + "s"; dec[d] = (dec[d] || 0) + 1; } if (mt.director) dir[mt.director] = (dir[mt.director] || 0) + 1;
      });
      var top = function (o, n) { return Object.keys(o).map(function (k) { return [k, o[k]]; }).sort(function (a, b) { return b[1] - a[1]; }).slice(0, n); };
      var now = new Date(), mon = [], i, k; for (i = 11; i >= 0; i--) { var d0 = new Date(now.getFullYear(), now.getMonth() - i, 1); mon.push({ k: d0.getFullYear() + "-" + String(d0.getMonth() + 1).padStart(2, "0"), l: MO[d0.getMonth()], n: 0 }); }
      var wd = [0, 0, 0, 0, 0, 0, 0], perMonth = {}, days = {};
      W.forEach(function (w) { var key = w.watched_on.slice(0, 7); perMonth[key] = (perMonth[key] || 0) + 1; mon.forEach(function (m) { if (m.k === key) m.n++; }); wd[new Date(w.watched_on + "T12:00:00").getDay()]++; days[w.watched_on] = 1; });
      var ds = Object.keys(days).sort(), best = 0, run = 0, prev = null;
      ds.forEach(function (d) { var t = Date.parse(d + "T12:00:00"); run = prev !== null && Math.round((t - prev) / 864e5) === 1 ? run + 1 : 1; best = Math.max(best, run); prev = t; });
      var last = Date.parse(ds[ds.length - 1] + "T12:00:00"), cur = Math.round((Date.parse(new Date().toLocaleDateString("sv-SE") + "T12:00:00") - last) / 864e5) <= 1 ? run : 0;
      var bm = top(perMonth, 1)[0], bd = wd.indexOf(Math.max.apply(null, wd));
      var up = reacts.filter(function (x) { return x.reaction === 1; }).length, down = reacts.filter(function (x) { return x.reaction === -1; }).length;
      var hrs = Math.round(minutes / 60), t = function (n, l, s) { return '<div class="st-t"><b>' + n + '</b><span>' + l + '</span>' + (s ? "<small>" + s + "</small>" : "") + '</div>'; };
      var hb = function (l) { var mx = Math.max.apply(null, l.map(function (x) { return x[1]; })) || 1; return l.map(function (x) { return '<div class="st-r"><span>' + E(x[0]) + '</span><span class="st-tr"><i data-w="' + (x[1] / mx * 100) + '%"></i></span><b>' + x[1] + '</b></div>'; }).join(""); };
      var mxd = Math.max.apply(null, dist) || 1, mxm = Math.max.apply(null, mon.map(function (m) { return m.n; })) || 1;
      el.innerHTML = '<div class="stx"><div class="st-g">' + t(films, "films vus") + t(W.length, "visionnages") + t(rew, "revisionnages") +
        t(minutes ? hrs + " h" : "–", "temps passé", minutes ? "≈ " + nf(minutes / 1440) + " jours" : "") + t(avg != null ? nf(avg) : "–", "note moyenne", ratings.length + " films notés") + t(written, "critiques écrites") +
        t(up, "J’aime") + t(down, "Je n’aime pas") + t(lists, "listes") + '</div>' +
        (ratings.length ? '<div class="st-h">Répartition des notes</div><div class="st-card"><div class="st-cols">' + dist.map(function (n, j) { return '<div class="st-col"><em>' + (n || "") + '</em><i data-h="' + (n / mxd * 100) + '%"></i><span>' + nf((j + 1) / 2, j % 2 ? 0 : 1) + '</span></div>'; }).join("") + '</div></div>' : "") +
        '<div class="st-h">Activité sur 12 mois</div><div class="st-card"><div class="st-cols">' + mon.map(function (m) { return '<div class="st-col"><em>' + (m.n || "") + '</em><i data-h="' + (m.n / mxm * 100) + '%"></i><span>' + m.l.replace(".", "").slice(0, 3) + '</span></div>'; }).join("") + '</div></div>' +
        (analysed ? '<div class="st-h">Genres les plus vus</div><div class="st-card">' + hb(top(gen, 6)) + '</div>' : "") +
        (analysed && Object.keys(dec).length ? '<div class="st-h">Par décennie</div><div class="st-card">' + hb(Object.keys(dec).sort().map(function (d) { return [d, dec[d]]; })) + '</div>' : "") +
        (Object.keys(dir).length ? '<div class="st-h">Réalisateurs les plus vus</div><div class="st-card">' + hb(top(dir, 3)) + '</div>' : "") +
        '<div class="st-h">Records</div><div class="st-card"><div class="st-rec"><span>Plus longue série</span><b>' + best + " jour" + (best > 1 ? "s" : "") + '</b></div><div class="st-rec"><span>Série en cours</span><b>' + cur + " jour" + (cur > 1 ? "s" : "") + '</b></div><div class="st-rec"><span>Jour préféré</span><b>' + DAYS[bd] + '</b></div>' +
        (bm ? '<div class="st-rec"><span>Mois le plus actif</span><b>' + MOL[+bm[0].slice(5) - 1] + " " + bm[0].slice(0, 4) + " (" + bm[1] + ")</b></div>" : "") + '</div>' +
        (analysed < films ? '<p class="st-note">' + (mine ? "Analyse de tes films en cours… " : "") + analysed + " film" + (analysed > 1 ? "s" : "") + " sur " + films + " pris en compte pour les genres, décennies et le temps passé.</p>" : "") + '</div>';
      requestAnimationFrame(function () { requestAnimationFrame(function () { el.querySelectorAll("[data-w]").forEach(function (b) { b.style.width = b.dataset.w; }); el.querySelectorAll("[data-h]").forEach(function (b) { b.style.height = b.dataset.h; }); }); });
    }
    async function enrich(W) {
      if (!mine || busy) return; var by = {}; W.forEach(function (w) { (by[w.tmdb_id] = by[w.tmdb_id] || []).push(w); });
      var miss = Object.keys(by).filter(function (id) { return !tried[id] && !by[id].some(function (w) { return w.meta && Object.keys(w.meta).length; }); }).slice(0, 12); if (!miss.length) return; busy = true;
      for (var i = 0; i < miss.length; i++) { tried[miss[i]] = 1; try { var m = await (await fetch("/api/movie/" + miss[i])).json(); await sb.from("watches").update({ meta: D().buildMeta(m) }).eq("user_id", uid).eq("tmdb_id", +miss[i]); } catch (e) {} }
      busy = false; load();
    }
    load(); return { reload: load };
  }

  // ===== Montage : mon profil et profils publics
  var mc = null, ms = null;
  function mountMine() {
    var a = document.getElementById("mycrit"), b = document.getElementById("mystat"), me = A.me(), p = A.prof(); if (!a) return;
    if (!me || !p) { a.innerHTML = ""; b.innerHTML = ""; mc = ms = null; return; }
    a.innerHTML = '<div id="mycrit-in"></div>'; b.innerHTML = '<h2 style="text-align:left;margin:22px 0 8px">Statistiques</h2><div id="mystat-in"></div>';
    mc = crit(document.getElementById("mycrit-in"), me.id, true); ms = stats(document.getElementById("mystat-in"), me.id, true);
  }
  window.CLAP_PROF = { paintUser: function (uid, isMe) {
    var a = document.getElementById("ucrit"), b = document.getElementById("ustat"); if (!a) return;
    a.innerHTML = '<div id="ucrit-in"></div>'; b.innerHTML = '<h2 style="text-align:left;margin:22px 0 8px">Statistiques</h2><div id="ustat-in"></div>';
    crit(document.getElementById("ucrit-in"), uid, !!isMe); stats(document.getElementById("ustat-in"), uid, !!isMe);
  } };
  var prev = A.onUser; A.onUser = function () { if (prev) prev(); mountMine(); };
  var pp = A.onPublish; A.onPublish = function () { if (pp) pp(); if (mc) mc.reload(); if (ms) ms.reload(); };
  document.querySelector('.tab[data-v="prof"]').addEventListener("click", function () { if (mc) mc.reload(); if (ms) ms.reload(); });
})();
