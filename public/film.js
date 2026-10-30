// Page film : animations, sections bien séparées, tout ce que fournit TMDB.
(function () {
  var A = CLAP_API, sb = A.sb, IMG = "https://image.tmdb.org/t/p/";
  var E = function (s) { return esc(String(s == null ? "" : s)); };
  var $f = function (s) { return fEl.querySelector(s); };
  var st = document.createElement("style");
  st.textContent = `
@property --fpp{syntax:"<number>";inherits:false;initial-value:0}
.fp-wrap{--fpt:calc(56px + env(safe-area-inset-top,0px))}
.fp-top{position:sticky;top:0;z-index:7;height:var(--fpt);margin-bottom:calc(var(--fpt)*-1);display:flex;align-items:flex-end;padding:0 14px 12px 64px;transition:background .25s,box-shadow .25s}
.fp-top.fp-sc{background:var(--bar);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);box-shadow:0 1px 0 var(--line)}
.fp-mini{font:400 24px/1 "Bebas Neue",sans-serif;letter-spacing:.04em;opacity:0;transform:translateY(8px);transition:.25s;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.fp-sc .fp-mini{opacity:1;transform:none}
.fp-hero{position:relative;height:440px;overflow:hidden;color:#fff;display:flex;align-items:flex-end;background:#120a0e}
.fp-hpar{position:absolute;inset:0;will-change:transform}.fp-hbg{position:absolute;inset:-8% -6%;background-size:cover;background-position:center top;animation:fpkb 20s ease-in-out infinite alternate}
@keyframes fpkb{to{transform:scale(1.12) translate(-2%,1.5%)}}
.fp-hsh{position:absolute;inset:0;background:linear-gradient(to top,rgba(10,5,8,.92) 0,rgba(10,5,8,.45) 50%,rgba(10,5,8,.35) 100%)}
.fp-hc{position:relative;z-index:2;display:flex;gap:16px;align-items:flex-end;padding:0 16px 22px;width:100%}
.fp-poster{flex:none;width:118px;aspect-ratio:2/3;border-radius:14px;background-size:cover;background-position:center;box-shadow:0 18px 44px rgba(0,0,0,.65),0 0 0 1px rgba(255,255,255,.18);transition:transform .15s ease-out;animation:fpup .7s cubic-bezier(.2,.9,.3,1) backwards;touch-action:none}
.fp-ht{min-width:0;animation:fpup .7s .1s cubic-bezier(.2,.9,.3,1) backwards}.fp-ht h1{font:400 40px/.95 "Bebas Neue",Impact,sans-serif;letter-spacing:.02em;text-shadow:0 2px 22px rgba(0,0,0,.7)}
.fp-tag{font-style:italic;opacity:.88;margin:6px 0 9px;font-size:14px}.fp-chips{display:flex;flex-wrap:wrap;gap:6px}
.fp-chip{padding:4px 10px;border-radius:99px;background:rgba(255,255,255,.17);backdrop-filter:blur(6px);font-size:12px;font-weight:700}.fp-chip.fp-w{background:#fff;color:#111}
@keyframes fpup{from{opacity:0;transform:translateY(28px)}}
.fp-nav{position:sticky;top:var(--fpt);z-index:6;display:flex;gap:6px;overflow-x:auto;padding:10px 12px;background:var(--bar);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-bottom:1px solid var(--line);scrollbar-width:none}
.fp-nav button{flex:none;padding:7px 14px;border-radius:99px;font-weight:700;font-size:13px;color:var(--muted);transition:background .2s,color .2s}.fp-nav button.fp-on{background:var(--text);color:var(--bg)}
.fp-sec{padding:26px 16px;border-top:1px solid var(--line)}.fp-sec[hidden]{display:none}
.fp-rv{opacity:0;transform:translateY(26px);transition:opacity .65s,transform .65s cubic-bezier(.2,.8,.2,1)}.fp-rv.fp-in{opacity:1;transform:none}
.fp-h{display:flex;align-items:center;gap:10px;font:400 30px/1 "Bebas Neue",sans-serif;letter-spacing:.04em;margin:0 0 16px}
.fp-h i{font-style:normal;flex:none;width:34px;height:34px;border-radius:10px;display:grid;place-items:center;font-size:17px;background:linear-gradient(135deg,var(--accent),#ff9f43);box-shadow:0 6px 16px rgba(255,77,94,.3)}
.fp-h em{margin-left:auto;font:500 13px "DM Sans",sans-serif;color:var(--muted);font-style:normal;letter-spacing:0}
.fp-sub{font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;font-size:12px;margin:18px 0 8px}
.fp-scores{display:flex;justify-content:space-around;gap:10px}.fp-ringw{text-align:center;width:48%}
.fp-ring{--c:var(--accent);width:114px;height:114px;margin:0 auto 10px;border-radius:50%;position:relative;display:grid;place-items:center;background:conic-gradient(var(--c) calc(var(--fpp)*1%),rgba(128,128,128,.25) 0);transition:--fpp 1.6s cubic-bezier(.2,.8,.2,1)}
.fp-ring::before{content:"";position:absolute;inset:11px;border-radius:50%;background:var(--bg)}.fp-ring b{position:relative;font:400 38px "Bebas Neue",sans-serif;font-variant-numeric:tabular-nums}
.fp-ring.fp-gold{--c:var(--gold)}.fp-ring.fp-nd{background:none;border:3px dashed var(--line)}.fp-ring.fp-nd::before{display:none}
.fp-ring.fp-done{animation:fpglow 2.6s ease-in-out infinite}@keyframes fpglow{50%{box-shadow:0 0 30px 2px color-mix(in srgb,var(--c) 45%,transparent)}}
.fp-rl{font-weight:700;margin-bottom:4px}.fp-ringw small{color:var(--muted);font-size:12px;display:block;margin-top:2px}.fp-st{font-size:15px}.fp-st b{font-variant-numeric:tabular-nums}
.fp-s{display:inline-block;color:var(--gold)}.fp-s.fp-e{color:rgba(128,128,128,.45)}.fp-s.fp-h2{background:linear-gradient(90deg,var(--gold) 50%,rgba(128,128,128,.45) 50%);-webkit-background-clip:text;background-clip:text;color:transparent}
.fp-rv:not(.fp-in) .fp-s{opacity:0}.fp-rv.fp-in .fp-s{animation:fpstar .5s calc(.5s + var(--i)*.1s) cubic-bezier(.2,1.7,.4,1) backwards}@keyframes fpstar{from{opacity:0;transform:scale(.2) rotate(-40deg)}}
.fp-qr{margin:22px 0 4px;padding:14px;border-radius:18px;background:var(--surface);border:1px solid var(--line);text-align:center}.fp-qr span{display:block;font-weight:700;margin-bottom:6px}
.fp-q{display:flex;justify-content:center;gap:4px}.fp-q button{font-size:44px;line-height:1;color:rgba(128,128,128,.4);transition:transform .15s,color .15s}.fp-q button.fp-f{color:var(--gold);transform:scale(1.12)}.fp-q button.fp-hf{background:linear-gradient(90deg,var(--gold) 50%,rgba(128,128,128,.4) 50%);-webkit-background-clip:text;background-clip:text;color:transparent;transform:scale(1.12)}.fp-q button:active{transform:scale(.85)}
.fp-acts{display:flex;gap:8px;margin-top:14px}.fp-acts .btn{padding:12px 6px}
.fp-facts{display:flex;gap:8px;overflow-x:auto;margin:16px -16px 0;padding:2px 16px 6px;scrollbar-width:none}.fp-fact{flex:none;padding:9px 14px;border-radius:14px;background:var(--surface);border:1px solid var(--line);font-size:13px;font-weight:500}
.fp-tl{font-style:italic;color:var(--muted);margin-top:18px}.fp-syn{margin:8px 0 0;line-height:1.6;font-size:15.5px}
.fp-tiles{display:grid;grid-template-columns:1fr 1fr;gap:10px}.fp-tile{padding:12px 14px;border-radius:16px;background:var(--surface);border:1px solid var(--line);min-width:0}.fp-tile.fp-wide{grid-column:1/-1}
.fp-tile small{display:flex;align-items:center;gap:6px;color:var(--muted);font-size:12px;margin-bottom:3px}.fp-tile b{font-weight:700;overflow-wrap:anywhere}.fp-tile em{display:block;font-style:normal;color:var(--muted);font-size:12px;margin-top:2px}
.fp-mon{margin-top:10px;padding:14px;border-radius:16px;background:var(--surface);border:1px solid var(--line)}.fp-mr{display:grid;grid-template-columns:70px 1fr auto;gap:10px;align-items:center;font-size:13px;margin:6px 0}.fp-track{height:10px;border-radius:9px;background:rgba(128,128,128,.2);overflow:hidden}.fp-fill{display:block;height:100%;width:0;border-radius:9px;background:linear-gradient(90deg,var(--accent),#ff9f43);transition:width 1.3s cubic-bezier(.2,.8,.2,1)}.fp-fill.fp-g{background:linear-gradient(90deg,#22c55e,#86efac)}
.fp-badge{display:inline-block;margin-top:8px;padding:5px 12px;border-radius:99px;background:linear-gradient(135deg,var(--accent),#ff9f43);color:#fff;font-weight:700;font-size:13px}
.fp-cast,.fp-hs,.fp-sim{display:flex;gap:12px;overflow-x:auto;margin:0 -16px;padding:2px 16px 8px;scrollbar-width:none}
.fp-cc{flex:none;width:84px;text-align:center;font-size:12px;line-height:1.25;animation:fpup .5s calc(var(--i)*.05s) backwards}.fp-cc div{width:72px;height:72px;border-radius:50%;margin:0 auto 6px;display:grid;place-items:center;color:#fff;font:400 26px "Bebas Neue",sans-serif;background-size:cover;background-position:center;box-shadow:0 6px 16px rgba(0,0,0,.25);transition:transform .2s}.fp-cc:active div{transform:scale(.92)}.fp-cc small{color:var(--muted);display:block}
.fp-vd{flex:none;width:200px;text-align:left}.fp-vt{position:relative;aspect-ratio:16/9;border-radius:12px;background-size:cover;background-position:center;display:grid;place-items:center;color:#fff;font-size:26px;width:100%;box-shadow:0 8px 20px rgba(0,0,0,.3);transition:transform .2s}.fp-vt::before{content:"";position:absolute;inset:0;border-radius:12px;background:rgba(0,0,0,.3)}.fp-vt span{position:relative;width:44px;height:44px;border-radius:50%;background:rgba(255,77,94,.92);display:grid;place-items:center;font-size:18px;padding-left:3px}.fp-vd:active .fp-vt{transform:scale(.96)}.fp-vd small{display:block;margin-top:6px;color:var(--muted);font-size:12px}
.fp-gi{flex:none;width:230px;aspect-ratio:16/9;border-radius:12px;background-size:cover;background-position:center;box-shadow:0 8px 20px rgba(0,0,0,.25);transition:transform .2s}.fp-gi:active{transform:scale(.97)}
.fp-pv{display:flex;flex-wrap:wrap;gap:10px}.fp-pv div{text-align:center;width:62px;font-size:11px;line-height:1.2;color:var(--muted)}.fp-pv img{width:56px;height:56px;border-radius:14px;display:block;margin:0 auto 4px;box-shadow:0 4px 12px rgba(0,0,0,.25)}
.fp-hist{margin:4px 0 14px}.fp-hr{display:grid;grid-template-columns:34px 1fr 26px;gap:8px;align-items:center;font-size:12px;margin:4px 0;color:var(--muted)}
.fp-pw{flex:none;width:104px;font-size:12px;line-height:1.25}.fp-po2{position:relative;display:block;width:104px;aspect-ratio:2/3;border-radius:12px;background-size:cover;background-position:center;background-color:var(--line);box-shadow:0 8px 20px rgba(0,0,0,.3);transition:transform .2s;margin-bottom:6px}.fp-po2:active{transform:scale(.95)}.fp-po2.fp-cur{outline:3px solid var(--gold);outline-offset:2px}
.fp-po2 i{position:absolute;left:6px;bottom:6px;font-style:normal;font-size:11px;font-weight:700;padding:2px 7px;border-radius:99px;background:rgba(0,0,0,.7);color:#ffd36b}.fp-pw small{color:var(--muted)}
.fp-note{font-size:11px;color:var(--muted);margin-top:12px}.fp-foot{padding:22px 16px 40px;font-size:11px;color:var(--muted);border-top:1px solid var(--line)}
.fp-load{display:grid;place-items:center;height:70%}.fp-load img{width:76px;animation:fpbeat 1s ease-in-out infinite}@keyframes fpbeat{50%{transform:scale(1.15) rotate(-6deg)}}
#fp-modal{position:absolute;inset:0;z-index:40;background:rgba(0,0,0,.92);display:grid;place-items:center;animation:fpfade .25s}#fp-modal[hidden]{display:none}.fp-mb{width:100%}.fp-mb iframe{width:100%;aspect-ratio:16/9;border:0;display:block}.fp-mb img{width:100%;max-height:80vh;object-fit:contain;display:block}
.fp-mx{position:absolute;top:calc(env(safe-area-inset-top,0px) + 12px);right:12px;width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.15);color:#fff;font-size:18px;z-index:2}@keyframes fpfade{from{opacity:0}}
@media (prefers-reduced-motion:reduce){.fp-wrap *{animation:none!important;transition:none!important}.fp-rv{opacity:1;transform:none}.fp-rv:not(.fp-in) .fp-s{opacity:1}}`;
  document.head.appendChild(st);

  var app = document.querySelector(".app"), md = document.createElement("div");
  md.id = "fp-modal"; md.hidden = true; md.innerHTML = '<button class="fp-mx" aria-label="Fermer">✕</button><div class="fp-mb"></div>'; app.appendChild(md);
  function modal(h) { md.querySelector(".fp-mb").innerHTML = h; md.hidden = false; }
  md.addEventListener("click", function (e) { if (e.target.closest(".fp-mx") || e.target === md || e.target.classList.contains("fp-mb")) { md.hidden = true; md.querySelector(".fp-mb").innerHTML = ""; } });

  // ---- Outils
  function api(p) { return fetch("/api/" + p).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }); }
  function fmtDate(s) { return s ? new Date(s + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : ""; }
  function runtime(m) { return m ? Math.floor(m / 60) + " h " + String(m % 60).padStart(2, "0") : ""; }
  function money(n) { return n > 0 ? n.toLocaleString("fr-FR") + " $" : ""; }
  function rel(d) {
    if (!d) return ""; var days = Math.round((new Date(d + "T12:00:00") - new Date()) / 864e5);
    if (days > 0) return days > 60 ? "dans " + Math.round(days / 30) + " mois" : "dans " + days + " jour" + (days > 1 ? "s" : "");
    var y = Math.floor(-days / 365.25); if (y >= 1) return "il y a " + y + " an" + (y > 1 ? "s" : ""); var mo = Math.floor(-days / 30.4); return mo >= 1 ? "il y a " + mo + " mois" : "cette semaine";
  }
  function cert(m) {
    var r = ((m.release_dates || {}).results || []).filter(function (x) { return x.iso_3166_1 === "FR"; })[0]; if (!r) return "";
    var c = r.release_dates.map(function (d) { return d.certification; }).filter(Boolean)[0] || ""; return c === "TP" ? "Tous publics" : /^\d+$/.test(c) ? "-" + c : c;
  }
  var lang = function (c) { try { return new Intl.DisplayNames(["fr"], { type: "language" }).of(c); } catch (e) { return c; } };
  var region = function (c) { try { return new Intl.DisplayNames(["fr"], { type: "region" }).of(c); } catch (e) { return c; } };
  var STATUS = { "Released": "Sorti", "Post Production": "En post-production", "In Production": "En tournage", "Planned": "Prévu", "Rumored": "Rumeur", "Canceled": "Annulé" };
  var VT = { "Trailer": "Bande-annonce", "Teaser": "Teaser", "Clip": "Extrait", "Featurette": "Making-of", "Behind the Scenes": "Coulisses", "Bloopers": "Bêtisier" };
  function verdict(p) { return p >= 90 ? "Chef-d’œuvre 🏆" : p >= 80 ? "Excellent 🔥" : p >= 65 ? "Bon film 👍" : p >= 50 ? "Mitigé 😐" : "Décevant 🥶"; }
  function fpstars(n) { var h = ""; for (var i = 1; i <= 5; i++) h += '<i class="fp-s ' + (n >= i ? "" : n >= i - .5 ? "fp-h2" : "fp-e") + '" style="--i:' + i + ';font-style:normal">★</i>'; return h; }
  function countUp(el, to, suf, dec) { var t0 = null; (function f(t) { if (!t0) t0 = t; var k = Math.min(1, (t - t0) / 1500), v = to * (1 - Math.pow(1 - k, 3)); el.textContent = (dec ? v.toFixed(1).replace(".", ",") : Math.round(v)) + suf; if (k < 1) requestAnimationFrame(f); })(performance.now()); }
  function startRing(r) { var t = +r.dataset.t; r.style.setProperty("--fpp", t); countUp(r.querySelector("b"), t, "%"); setTimeout(function () { r.classList.add("fp-done"); }, 1700); }
  var tile = function (ic, l, v, extra, wide) { return v ? '<div class="fp-tile' + (wide ? " fp-wide" : "") + '"><small>' + ic + " " + l + '</small><b>' + v + '</b>' + (extra ? "<em>" + extra + "</em>" : "") + '</div>' : ""; };
  var sec = function (id, ic, title, body, em) { return '<section class="fp-sec fp-rv" id="' + id + '"><h2 class="fp-h"><i>' + ic + '</i>' + title + (em ? "<em>" + em + "</em>" : "") + '</h2>' + body + '</section>'; };

  // ---- Chargement
  window.openFilm = async function (x) {
    fEl.innerHTML = '<div class="fp-wrap"><div class="fp-top"><button class="back" aria-label="Retour">←</button></div><div class="fp-load"><img src="logo.svg" alt="Chargement"></div></div>';
    fEl.scrollTop = 0; fEl.classList.add("open");
    try {
      var id = x; if (isNaN(x)) { var s = await api("search?q=" + encodeURIComponent(x)); if (!s.results[0]) throw 0; id = s.results[0].id; }
      render(await api("movie/" + id));
    } catch (e) { fEl.innerHTML = '<div class="fp-wrap"><div class="fp-top"><button class="back" aria-label="Retour">←</button></div><div style="padding:90px 16px"><p>Impossible de charger ce film. Vérifie que le serveur tourne et que ta clé TMDB est bonne.</p></div></div>'; }
  };

  function render(m) {
    var posterCss = m.poster_path ? "url(" + IMG + "w342" + m.poster_path + ") center/cover" : "linear-gradient(160deg,#6c757d,#212529)";
    if (!all.some(function (a) { return a[0] === m.title; })) all.push([m.title, posterCss, m.id, m.poster_path]);
    fEl._t = m.title; fEl._id = m.id; fEl._p = m.poster_path;
    var cr = (m.credits || {}).crew || [], cast = ((m.credits || {}).cast || []).slice(0, 14), yr = (m.release_date || "").slice(0, 4);
    var names = function (re) { var o = []; cr.forEach(function (c) { if (re.test(c.job) && o.indexOf(c.name) < 0) o.push(c.name); }); return o.slice(0, 3).map(E).join(", "); };
    var vids = (((m.videos || {}).results) || []).filter(function (v) { return v.site === "YouTube"; });
    vids.sort(function (a, b) { return (b.type === "Trailer") - (a.type === "Trailer") || (b.official === true) - (a.official === true); });
    var trailer = vids[0], gal = (((m.images || {}).backdrops) || []).filter(function (b) { return b.width >= 1000; }).slice(0, 12);
    var recos = ((m.recommendations || {}).results || []).filter(function (r) { return r.poster_path; }); if (recos.length < 6) recos = recos.concat(((m.similar || {}).results || []).filter(function (r) { return r.poster_path; }));
    var seen = {}; recos = recos.filter(function (r) { if (seen[r.id]) return false; seen[r.id] = 1; return true; }).slice(0, 12);
    var wp = (((m["watch/providers"] || {}).results) || {}).FR || {};
    var p = m.vote_count ? Math.round(m.vote_average * 10) : -1, a5 = m.vote_average / 2, certif = cert(m);
    var bg = m.backdrop_path ? IMG + "w1280" + m.backdrop_path : (m.poster_path ? IMG + "w780" + m.poster_path : "");
    var facts = [];
    if (m.release_date) facts.push("📅 Sorti " + rel(m.release_date));
    if (m.budget > 0 && m.revenue > 0) facts.push("💰 " + (m.revenue / m.budget >= 1 ? "×" + (m.revenue / m.budget).toFixed(1).replace(".", ",") + " son budget" : "N’a pas couvert son budget"));
    if (m.runtime) facts.push("⏱ " + runtime(m.runtime) + " = " + (m.runtime / 45).toFixed(1).replace(".", ",") + " épisodes de 45 min");
    if (m.vote_count) facts.push("🗳 " + m.vote_count.toLocaleString("fr-FR") + " avis dans le monde");
    if ((m.spoken_languages || []).length > 1) facts.push("🌍 " + m.spoken_languages.length + " langues parlées");
    if (cast.length) facts.push("🎭 " + ((m.credits || {}).cast || []).length + " acteurs au casting");
    var provG = [["flatrate", "Streaming"], ["free", "Gratuit"], ["ads", "Gratuit avec pubs"], ["rent", "Location"], ["buy", "Achat"]].map(function (g) {
      var l = wp[g[0]]; return l && l.length ? '<div class="fp-sub">' + g[1] + '</div><div class="fp-pv">' + l.slice(0, 8).map(function (v) { return '<div><img src="' + IMG + 'w92' + v.logo_path + '" alt="' + E(v.provider_name) + '">' + E(v.provider_name) + '</div>'; }).join("") + '</div>' : "";
    }).join("");
    var hasMedia = vids.length || gal.length;

    var ov = '<div class="fp-scores"><div class="fp-ringw">' + (p >= 0 ? '<div class="fp-ring" data-t="' + p + '"><b>0%</b></div><div class="fp-rl">' + verdict(p) + '</div><div class="fp-st">' + fpstars(Math.round(a5 * 2) / 2) + ' <b>' + a5.toFixed(1).replace(".", ",") + '</b>/5</div><small>' + m.vote_count.toLocaleString("fr-FR") + ' notes · TMDB</small>' : '<div class="fp-ring fp-nd"><b>–</b></div><div class="fp-rl">Pas encore noté</div>') + '</div>' +
      '<div class="fp-ringw" id="fp-clap"><div class="fp-ring fp-nd"><b>?</b></div><div class="fp-rl">Communauté Clap</div><small>Chargement…</small></div></div>' +
      '<div class="fp-qr"><span>Ta note</span><div class="fp-q" id="fp-q">' + [1, 2, 3, 4, 5].map(function (n) { return '<button data-q="' + n + '" aria-label="' + n + ' étoiles">★</button>'; }).join("") + '</div></div>' +
      '<div class="fp-acts"><button class="btn" data-a="seen">👁 Vu</button><button class="btn" data-l="1">＋ Liste</button><button class="btn main" data-a="write">✎ Critiquer</button></div>' +
      (trailer ? '<div class="fp-acts"><button class="btn" data-v="' + E(trailer.key) + '" style="width:100%">▶ Voir la bande-annonce</button></div>' : "") +
      '<div class="fp-facts">' + facts.map(function (f) { return '<div class="fp-fact">' + E(f) + '</div>'; }).join("") + '</div>' +
      (m.tagline ? '<p class="fp-tl">« ' + E(m.tagline) + ' »</p>' : "") + more(E(m.overview || "Pas de synopsis en français pour le moment."), "fp-syn");

    var infos = '<div class="fp-sub" style="margin-top:0">Le film</div><div class="fp-tiles">' +
      tile("📅", "Sortie en France", fmtDate(m.release_date), rel(m.release_date), true) + tile("⏱", "Durée", runtime(m.runtime)) + tile("🔞", "Classification", E(certif)) +
      tile("🎞", "Statut", STATUS[m.status] || E(m.status)) + tile("🗣", "Langue originale", E(lang(m.original_language))) +
      tile("🔤", "Titre original", m.original_title !== m.title ? E(m.original_title) : "") + tile("🌍", "Pays", E((m.production_countries || []).map(function (c) { return region(c.iso_3166_1); }).join(", ")), "", true) + '</div>' +
      '<div class="fp-sub">L’équipe</div><div class="fp-tiles">' + tile("🎬", "Réalisation", names(/^Director$/)) + tile("✍️", "Scénario", names(/Screenplay|Writer|Story/)) + tile("🎵", "Musique", names(/Original Music Composer/)) +
      tile("📷", "Photographie", names(/Director of Photography/)) + tile("🏢", "Production", E((m.production_companies || []).slice(0, 3).map(function (c) { return c.name; }).join(", ")), "", true) + '</div>' +
      (m.budget > 0 || m.revenue > 0 ? '<div class="fp-sub">Les chiffres</div><div class="fp-mon">' +
        (m.budget > 0 ? '<div class="fp-mr"><span>Budget</span><span class="fp-track"><i class="fp-fill" data-w="' + (m.budget / Math.max(m.budget, m.revenue) * 100) + '%"></i></span><b>' + money(m.budget) + '</b></div>' : "") +
        (m.revenue > 0 ? '<div class="fp-mr"><span>Recettes</span><span class="fp-track"><i class="fp-fill fp-g" data-w="' + (m.revenue / Math.max(m.budget, m.revenue) * 100) + '%"></i></span><b>' + money(m.revenue) + '</b></div>' : "") +
        (m.budget > 0 && m.revenue > 0 ? '<span class="fp-badge">' + (m.revenue / m.budget >= 3 ? "🚀 Énorme succès" : m.revenue / m.budget >= 1 ? "✅ Rentable" : "📉 Déficitaire") + ' · ×' + (m.revenue / m.budget).toFixed(1).replace(".", ",") + '</span>' : "") + '</div>' : "");

    var castH = '<div class="fp-cast">' + cast.map(function (c, k) {
      return '<div class="fp-cc" style="--i:' + k + '"><div style="' + (c.profile_path ? "background-image:url(" + IMG + "w185" + c.profile_path + ")" : "background:hsl(" + (k * 67 + 10) + ",55%,40%)") + '">' + (c.profile_path ? "" : ii(c.name)) + '</div>' + E(c.name) + '<small>' + E(c.character) + '</small></div>';
    }).join("") + '</div>';
    var medH = (vids.length ? '<div class="fp-sub" style="margin-top:0">Vidéos</div><div class="fp-hs">' + vids.slice(0, 8).map(function (v) { return '<div class="fp-vd" data-v="' + E(v.key) + '"><div class="fp-vt" style="background-image:url(https://i.ytimg.com/vi/' + E(v.key) + '/mqdefault.jpg)"><span>▶</span></div><small>' + (VT[v.type] || E(v.type)) + '</small></div>'; }).join("") + '</div>' : "") +
      (gal.length ? '<div class="fp-sub">Galerie</div><div class="fp-hs">' + gal.map(function (b) { return '<div class="fp-gi" data-g="' + b.file_path + '" style="background-image:url(' + IMG + 'w500' + b.file_path + ')"></div>'; }).join("") + '</div>' : "");
    var rev = '<div class="fp-hist" id="fp-hist"></div><div class="fp-acts" style="margin:0 0 6px"><button class="btn main" data-a="write">✎ Écrire une critique</button></div><div id="rvs"></div>';
    var poster2 = function (r) { return '<div class="fp-pw"><button class="fp-po2" data-id="' + r.id + '" aria-label="' + E(r.title) + '" style="background-image:url(' + IMG + 'w342' + r.poster_path + ')">' + (r.vote_average ? '<i>★ ' + r.vote_average.toFixed(1).replace(".", ",") + '</i>' : "") + '</button>' + E(r.title) + '<small>' + (r.release_date || "").slice(0, 4) + '</small></div>'; };

    var nav = [["fp-ov", "Aperçu"], ["fp-inf", "Infos"], ["fp-cs", "Casting"]].concat(hasMedia ? [["fp-med", "Médias"]] : []).concat(provG ? [["fp-w", "Où voir"]] : []).concat([["fp-rev", "Critiques"]]).concat(recos.length ? [["fp-sim", "Plus"]] : []);
    fEl.innerHTML = '<div class="fp-wrap"><div class="fp-top"><button class="back" aria-label="Retour">←</button><span class="fp-mini">' + E(m.title).toUpperCase() + '</span></div>' +
      '<div class="fp-hero"><div class="fp-hpar"><div class="fp-hbg" style="background-image:url(' + bg + ')"></div></div><div class="fp-hsh"></div><div class="fp-hc"><div class="fp-poster" style="background-image:url(' + (m.poster_path ? IMG + "w342" + m.poster_path : "") + ')"></div><div class="fp-ht"><h1>' + E(m.title).toUpperCase() + '</h1><div class="fp-chips">' +
      (yr ? '<span class="fp-chip fp-w">' + yr + '</span>' : "") + (m.runtime ? '<span class="fp-chip">' + runtime(m.runtime) + '</span>' : "") + (certif ? '<span class="fp-chip">' + E(certif) + '</span>' : "") + (m.genres || []).map(function (g) { return '<span class="fp-chip">' + E(g.name) + '</span>'; }).join("") + '</div></div></div></div>' +
      '<nav class="fp-nav">' + nav.map(function (n) { return '<button data-s="' + n[0] + '">' + n[1] + '</button>'; }).join("") + '</nav>' +
      sec("fp-ov", "★", "Aperçu", ov) + sec("fp-inf", "ℹ️", "Infos", infos) + sec("fp-cs", "🎭", "Casting", castH, cast.length ? cast.length + " têtes d’affiche" : "") +
      (hasMedia ? sec("fp-med", "🎞", "Médias", medH) : "") + (provG ? sec("fp-w", "📺", "Où le voir", provG + '<p class="fp-note">Disponibilité en France · données JustWatch via TMDB.</p>') : "") +
      sec("fp-rev", "💬", "Critiques", rev, '<span id="fp-rstat"></span>') +
      '<section class="fp-sec fp-rv" id="fp-saga" hidden><h2 class="fp-h"><i>🎬</i>Saga</h2><div class="fp-sim" id="fp-sagab"></div></section>' +
      (recos.length ? sec("fp-sim", "✨", "Dans le même esprit", '<div class="fp-sim">' + recos.map(poster2).join("") + '</div>') : "") +
      '<div class="fp-foot">Ce produit utilise l’API TMDB mais n’est ni approuvé ni certifié par TMDB.</div></div>';
    fEl.scrollTop = 0; paintRv();

    // reveal + effets
    if (fEl._io) fEl._io.disconnect();
    var io = fEl._io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return; var el = en.target; io.unobserve(el); el.classList.add("fp-in");
        el.querySelectorAll(".fp-ring[data-t]").forEach(startRing); el.querySelectorAll("[data-w]").forEach(function (b) { b.style.width = b.dataset.w; });
      });
    }, { root: fEl, threshold: .12 });
    fEl.querySelectorAll(".fp-rv").forEach(function (s) { io.observe(s); });
    var ps = $f(".fp-poster");
    ps.addEventListener("pointermove", function (e) { var r = ps.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; ps.style.transform = "perspective(600px) rotateY(" + x * 20 + "deg) rotateX(" + (-y * 20) + "deg) scale(1.04)"; });
    ["pointerleave", "pointerup"].forEach(function (ev) { ps.addEventListener(ev, function () { ps.style.transform = ""; }); });
    if (fEl._sc) fEl.removeEventListener("scroll", fEl._sc);
    fEl._sc = function () {
      if (fEl._raf) return;
      fEl._raf = requestAnimationFrame(function () {
        fEl._raf = 0; var s = fEl.scrollTop, top = $f(".fp-top"), par = $f(".fp-hpar"); if (!top) return;
        top.classList.toggle("fp-sc", s > 250); par.style.transform = "translateY(" + s * .35 + "px)"; var cur = null;
        fEl.querySelectorAll(".fp-sec").forEach(function (x) { if (!x.hidden && x.offsetTop - 150 <= s) cur = x.id; });
        fEl.querySelectorAll(".fp-nav button").forEach(function (b) { b.classList.toggle("fp-on", b.dataset.s === cur); });
      });
    };
    fEl.addEventListener("scroll", fEl._sc, { passive: true }); fEl._sc();

    // communauté Clap + saga
    sb.from("reviews").select("rating").eq("tmdb_id", m.id).then(function (r) { if (fEl._id === m.id) paintCommunity(r.data || []); });
    if (m.belongs_to_collection) api("collection/" + m.belongs_to_collection.id).then(function (c) {
      if (fEl._id !== m.id) return; var parts = (c.parts || []).filter(function (x) { return x.poster_path; }).sort(function (x, y) { return (x.release_date || "9") < (y.release_date || "9") ? -1 : 1; });
      if (parts.length < 2) return; var s = document.getElementById("fp-saga"); s.querySelector("h2").innerHTML = "<i>🎬</i>" + E(c.name || "Saga");
      document.getElementById("fp-sagab").innerHTML = parts.map(function (x) { return poster2(x).replace('class="fp-po2"', 'class="fp-po2' + (x.id === m.id ? " fp-cur" : "") + '"'); }).join(""); s.hidden = false; io.observe(s);
    }).catch(function () {});
  }

  function paintCommunity(rs) {
    var n = rs.length, box = document.getElementById("fp-clap"), rc = document.getElementById("fp-rstat"), hist = document.getElementById("fp-hist"); if (!box) return;
    if (!n) { box.innerHTML = '<div class="fp-ring fp-nd"><b>?</b></div><div class="fp-rl">Communauté Clap</div><small>Sois la première personne à noter</small>'; if (rc) rc.textContent = "Aucune critique"; return; }
    var avg = rs.reduce(function (s, x) { return s + Number(x.rating); }, 0) / n, pos = Math.round(rs.filter(function (x) { return Number(x.rating) >= 3.5; }).length / n * 100);
    box.innerHTML = '<div class="fp-ring fp-gold" data-t="' + pos + '"><b>0%</b></div><div class="fp-rl">Communauté Clap</div><div class="fp-st">' + fpstars(Math.round(avg * 2) / 2) + ' <b>' + avg.toFixed(1).replace(".", ",") + '</b>/5</div><small>' + n + ' avis</small>';
    if (rc) rc.textContent = n + " critique" + (n > 1 ? "s" : "");
    var b = [0, 0, 0, 0, 0]; rs.forEach(function (x) { b[Math.min(4, Math.ceil(Number(x.rating)) - 1)]++; }); var mx = Math.max.apply(null, b);
    if (hist) hist.innerHTML = [4, 3, 2, 1, 0].map(function (i) { return '<div class="fp-hr"><span>' + (i + 1) + ' ★</span><span class="fp-track"><i class="fp-fill" data-w="' + (b[i] / mx * 100) + '%"></i></span><span>' + b[i] + '</span></div>'; }).join("");
    var s = box.closest(".fp-sec"), r = s.querySelector(".fp-ring[data-t]"); if (s.classList.contains("fp-in") && r) startRing(r);
    var hs = document.getElementById("fp-rev"); if (hs && hs.classList.contains("fp-in")) hs.querySelectorAll("[data-w]").forEach(function (x) { x.style.width = x.dataset.w; });
  }

  // ---- Interactions
  function quickRate(v) {
    openCompose(fEl._t); cs.n = v;
    cEl.querySelectorAll(".pick button").forEach(function (b) { var n = +b.dataset.n; b.classList.toggle("on", n <= v); b.classList.toggle("half", n - .5 === v); });
    var pv = document.getElementById("pv"); if (pv) pv.textContent = String(v).replace(".", ",") + " / 5";
  }
  fEl.addEventListener("click", function (e) {
    var t = e.target;
    var q = t.closest("[data-q]");
    if (q) {
      var r = q.getBoundingClientRect(), v = +q.dataset.q - (e.clientX - r.left < r.width / 2 ? .5 : 0);
      document.querySelectorAll("#fp-q button").forEach(function (b) { var n = +b.dataset.q; b.classList.toggle("fp-f", n <= v); b.classList.toggle("fp-hf", n - .5 === v); });
      return void setTimeout(function () { quickRate(v); }, 320);
    }
    var v2 = t.closest("[data-v]"); if (v2) return modal('<iframe src="https://www.youtube-nocookie.com/embed/' + encodeURIComponent(v2.dataset.v) + '?autoplay=1&rel=0&playsinline=1" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>');
    var g = t.closest("[data-g]"); if (g) return modal('<img src="' + IMG + 'w1280' + g.dataset.g + '" alt="">');
    var s = t.closest("[data-s]"); if (s) { var x = document.getElementById(s.dataset.s); if (x) fEl.scrollTo({ top: x.offsetTop - 118, behavior: "smooth" }); return; }
    var po = t.closest(".fp-po2[data-id]"); if (po) return window.openFilm(Number(po.dataset.id));
  });
})();
