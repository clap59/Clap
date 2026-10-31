// Calendrier : les films vus, jour par jour (profil perso et profils publics).
(function () {
  var A = CLAP_API, sb = A.sb, TM = "https://image.tmdb.org/t/p/w185";
  var MO = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"], DW = ["L", "M", "M", "J", "V", "S", "D"];
  var pad = function (n) { return String(n).padStart(2, "0"); };
  var iso = function (y, m, d) { var x = new Date(y, m, d); return x.getFullYear() + "-" + pad(x.getMonth() + 1) + "-" + pad(x.getDate()); };
  var todayIso = function () { return new Date().toLocaleDateString("sv-SE"); };
  var E = function (s) { return esc(String(s == null ? "" : s)); };
  var st = document.createElement("style");
  st.textContent = '.cal{text-align:left;margin-bottom:6px}.cal-top{display:flex;align-items:center;justify-content:space-between;margin:2px 0 4px}.cal-top b{font:400 26px/1 "Bebas Neue",sans-serif;letter-spacing:.04em;text-transform:capitalize}' +
    '.cal-nav{width:36px;height:36px;border-radius:50%;background:var(--surface);border:1px solid var(--line);display:grid;place-items:center;transition:transform .15s}.cal-nav:active{transform:scale(.9)}.cal-nav:disabled{opacity:.3}' +
    '.cal-sum{color:var(--muted);font-size:13px;margin:0 0 10px}.cal-g{display:grid;grid-template-columns:repeat(7,1fr);gap:5px}.cal-w{text-align:center;font-size:11px;color:var(--muted);font-weight:700;padding-bottom:2px}' +
    '.cal-d{position:relative;aspect-ratio:3/4;border-radius:9px;background:var(--surface);border:1px solid var(--line);overflow:hidden;color:var(--muted);font-size:11px;text-align:left;padding:4px 5px;transition:transform .15s,box-shadow .2s}.cal-d:disabled{opacity:.45}' +
    '.cal-d.cal-has{background:var(--cp,linear-gradient(160deg,#6c757d,#212529)) center/cover;border-color:transparent;color:#fff;box-shadow:0 4px 12px rgba(0,0,0,.25)}.cal-d.cal-has::after{content:"";position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,.6),transparent 55%)}' +
    '.cal-d i{position:relative;z-index:1;font-style:normal;font-weight:700}.cal-d b{position:absolute;z-index:1;right:4px;bottom:4px;font-size:10px;padding:1px 6px;border-radius:99px;background:rgba(0,0,0,.72);color:#fff}' +
    '.cal-d.cal-t{outline:2px solid var(--accent);outline-offset:1px}.cal-d.cal-s{transform:scale(.92);box-shadow:0 0 0 2px var(--gold)}.cal-d:not(:disabled):active{transform:scale(.94)}' +
    '.cal-day{margin-top:14px;padding:14px;border-radius:18px;background:var(--surface);border:1px solid var(--line);animation:calin .3s cubic-bezier(.2,.8,.2,1)}@keyframes calin{from{opacity:0;transform:translateY(10px)}}.cal-day h3{font:400 22px/1 "Bebas Neue",sans-serif;letter-spacing:.04em;text-transform:capitalize;margin-bottom:10px}' +
    '.cal-li{display:flex;align-items:center;gap:12px;width:100%;text-align:left;padding:6px 0}.cal-th{width:40px;height:58px;border-radius:7px;background-size:cover;background-position:center;background-color:var(--line);flex:none;box-shadow:0 4px 10px rgba(0,0,0,.25)}.cal-day .btn{margin-top:10px;width:100%}.cal-hint{color:var(--muted);font-size:13px;margin-top:10px}';
  document.head.appendChild(st);

  function make(el, uid, mine) {
    var now = new Date(), y = now.getFullYear(), m = now.getMonth(), data = [], selDay = null;
    async function load() {
      var r = await sb.from("watches").select("id,tmdb_id,title,poster_path,watched_on,rating").eq("user_id", uid).gte("watched_on", iso(y, m, 1)).lte("watched_on", iso(y, m + 1, 0)).order("watched_on").order("id");
      data = r.error ? null : (r.data || []); paint();
    }
    function paint() {
      if (data === null) { el.innerHTML = mine ? '<p class="cal-hint">Le calendrier sera disponible après la mise à jour de la base de données.</p>' : ""; return; }
      var by = {}; data.forEach(function (w) { (by[w.watched_on] = by[w.watched_on] || []).push(w); });
      var lead = (new Date(y, m, 1).getDay() + 6) % 7, days = new Date(y, m + 1, 0).getDate(), t = todayIso(), cells = "", i, d;
      for (i = 0; i < lead; i++) cells += '<div></div>';
      for (d = 1; d <= days; d++) {
        var k = iso(y, m, d), ws = by[k] || [], last = ws[ws.length - 1], fut = k > t;
        cells += '<button class="cal-d' + (ws.length ? " cal-has" : "") + (k === t ? " cal-t" : "") + (k === selDay ? " cal-s" : "") + '" data-day="' + k + '"' + (fut || (!ws.length && !mine) ? " disabled" : "") + (last && last.poster_path ? ' style="--cp:url(' + TM + last.poster_path + ')"' : "") + ' aria-label="' + d + " " + MO[m] + (ws.length ? ", " + ws.length + " film" + (ws.length > 1 ? "s" : "") : "") + '"><i>' + d + '</i>' + (ws.length > 1 ? '<b>+' + (ws.length - 1) + '</b>' : "") + '</button>';
      }
      var detail = "";
      if (selDay) {
        var l = by[selDay] || [];
        detail = '<div class="cal-day"><h3>' + new Date(selDay + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }) + '</h3>' +
          (l.length ? l.map(function (w) { return '<button class="cal-li" data-id="' + w.tmdb_id + '"><div class="cal-th" style="background-image:url(' + (w.poster_path ? TM + w.poster_path : "") + ')"></div><div><b>' + E(w.title) + '</b><div class="stars">' + (w.rating ? stars(Number(w.rating)) : "") + '</div></div></button>'; }).join("") : '<p class="cal-hint" style="margin-top:0">Aucun film ce jour-là.</p>') +
          (mine ? '<button class="btn main" data-add="' + selDay + '">' + IC("plus") + 'Ajouter un film</button>' : "") + '</div>';
      }
      var isNow = y === now.getFullYear() && m === now.getMonth();
      el.innerHTML = '<div class="cal-top"><button class="cal-nav" data-n="-1" aria-label="Mois précédent">' + IC("chevl") + '</button><b>' + MO[m] + " " + y + '</b><button class="cal-nav" data-n="1" aria-label="Mois suivant"' + (isNow ? " disabled" : "") + '>' + IC("chevr") + '</button></div>' +
        '<div class="cal-sum">' + (data.length ? data.length + " visionnage" + (data.length > 1 ? "s" : "") + " ce mois-ci" : "Aucun film ce mois-ci") + '</div>' +
        '<div class="cal-g">' + DW.map(function (x) { return '<div class="cal-w">' + x + '</div>'; }).join("") + cells + '</div>' + detail +
        (mine && !selDay ? '<p class="cal-hint">Touche un jour pour voir ou ajouter un film.</p>' : "");
    }
    el.onclick = function (e) {
      var n = e.target.closest("[data-n]"); if (n && !n.disabled) { m += +n.dataset.n; if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; } selDay = null; return void load(); }
      var d = e.target.closest(".cal-d"); if (d && !d.disabled) { selDay = selDay === d.dataset.day ? null : d.dataset.day; return paint(); }
      var li = e.target.closest(".cal-li"); if (li) { var p = document.getElementById("pub"); if (p) p.classList.remove("open"); return void window.openFilm(Number(li.dataset.id)); }
      var ad = e.target.closest("[data-add]"); if (ad) openCompose(null, { date: ad.dataset.add });
    };
    load(); return { reload: load };
  }

  var mineCal = null;
  function mountMine() {
    var el = document.getElementById("mycal"), me = A.me(), p = A.prof(); if (!el) return;
    if (!me || !p) { el.innerHTML = ""; mineCal = null; return; }
    el.innerHTML = '<h2 style="text-align:left">Calendrier</h2><div class="cal" id="mycal-in"></div>'; mineCal = make(document.getElementById("mycal-in"), me.id, true);
  }
  window.CLAP_CAL = { paintUser: function (uid) { var el = document.getElementById("ucal"); if (!el) return; el.innerHTML = '<h2 style="text-align:left;margin:14px 0 8px">Calendrier</h2><div class="cal" id="ucal-in"></div>'; make(document.getElementById("ucal-in"), uid, false); } };
  var prev = A.onUser; A.onUser = function () { if (prev) prev(); mountMine(); };
  var pp = A.onPublish; A.onPublish = function () { if (pp) pp(); if (mineCal) mineCal.reload(); };
  document.querySelector('.tab[data-v="prof"]').addEventListener("click", function () { if (mineCal) mineCal.reload(); });
})();
