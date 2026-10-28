// Branche Clap sur TMDB (via server.js) : recherche, tendances et fiche film complete.
(function () {
  var IMG = "https://image.tmdb.org/t/p/";
  var grid = document.getElementById("grid"), disc = document.querySelector("#disc .pad");
  var E = function (s) { return esc(String(s == null ? "" : s)); };
  var st = document.createElement("style");
  st.textContent = ".srch{width:100%;padding:12px 14px;border-radius:14px;border:1px solid var(--line);background:var(--surface);color:var(--text);font:inherit;margin-bottom:12px}.sim{display:flex;gap:8px;overflow-x:auto;padding-bottom:6px}.sim .po{flex:none;width:104px}.prov{display:flex;gap:10px;flex-wrap:wrap}.prov img{width:46px;height:46px;border-radius:10px}.gn{display:flex;gap:6px;flex-wrap:wrap;margin-top:12px}.att{font-size:11px;color:var(--muted);margin-top:22px}.tl{font-style:italic;color:var(--muted);margin-top:10px}.cm2 small{color:var(--muted)}a.btn{display:block;text-align:center;text-decoration:none;color:inherit;margin-top:8px}";
  document.head.appendChild(st);

  function api(p) { return fetch("/api/" + p).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }); }
  function fmtDate(s) { return s ? new Date(s + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "Date inconnue"; }
  function runtime(m) { return m ? Math.floor(m / 60) + " h " + String(m % 60).padStart(2, "0") : ""; }
  function money(n) { return n > 0 ? n.toLocaleString("fr-FR") + " $" : ""; }
  function poster(m) { return m.poster_path ? "url(" + IMG + "w342" + m.poster_path + ") center/cover" : "linear-gradient(160deg,#6c757d,#212529)"; }
  function reg(m) { if (!all.some(function (a) { return a[0] === m.title; })) all.push([m.title, poster(m), m.id, m.poster_path]); }
  function posters(list, cls) {
    return list.filter(function (m) { return m.poster_path; }).map(function (m) {
      reg(m); return '<button class="po" data-id="' + m.id + '" title="' + E(m.title) + '" style="--g:' + poster(m) + '"><span></span></button>';
    }).join("");
  }

  // ---- Découvrir : recherche + tendances
  var chips = document.getElementById("chips"); if (chips) chips.remove();
  disc.querySelector("h2").insertAdjacentHTML("afterend", '<input class="srch" id="q" type="search" placeholder="Rechercher un film…" aria-label="Rechercher un film">');
  var g2 = grid.cloneNode(false); grid.replaceWith(g2); grid = g2; // retire l'ancien clic (démo)
  function fill(list) { grid.innerHTML = posters(list) || '<p style="grid-column:1/-1;color:var(--muted)">Aucun résultat.</p>'; }
  function trending() { api("trending").then(function (r) { fill(r.results); }).catch(function () { grid.innerHTML = '<p style="grid-column:1/-1;color:var(--muted)">TMDB ne répond pas. Vérifie ta clé dans le fichier .env.</p>'; }); }
  var tm; document.getElementById("q").addEventListener("input", function (e) {
    clearTimeout(tm); var v = e.target.value.trim();
    tm = setTimeout(function () { if (!v) return trending(); api("search?q=" + encodeURIComponent(v)).then(function (r) { fill(r.results); }); }, 350);
  });
  grid.addEventListener("click", function (e) { var p = e.target.closest(".po"); if (p) window.openFilm(Number(p.dataset.id)); });
  trending();

  // ---- Fiche film complète
  fEl.addEventListener("click", function (e) { var p = e.target.closest(".sim .po"); if (p) window.openFilm(Number(p.dataset.id)); });
  window.openFilm = async function (x) {
    fEl.innerHTML = '<div class="hero" style="--g:linear-gradient(160deg,#6c757d,#212529)"><button class="back" aria-label="Retour">←</button><h1>…</h1></div>';
    fEl.scrollTop = 0; fEl.classList.add("open");
    try {
      var id = x;
      if (isNaN(x)) { var s = await api("search?q=" + encodeURIComponent(x)); if (!s.results[0]) throw 0; id = s.results[0].id; }
      render(await api("movie/" + id));
    } catch (err) {
      fEl.innerHTML = '<button class="back" aria-label="Retour">←</button><div class="pad" style="padding-top:70px"><p>Impossible de charger ce film. Vérifie que le serveur tourne et que ta clé TMDB est bonne.</p></div>';
    }
  };
  function render(m) {
    reg(m); fEl._t = m.title; fEl._id = m.id;
    var crew = m.credits.crew || [], cast = (m.credits.cast || []).slice(0, 12);
    var dir = crew.filter(function (c) { return c.job === "Director"; }).map(function (c) { return c.name; }).join(", ") || "–";
    var vids = (m.videos && m.videos.results) || [];
    var vid = vids.filter(function (v) { return v.site === "YouTube" && v.type === "Trailer"; })[0] || vids.filter(function (v) { return v.site === "YouTube"; })[0];
    var wp = ((m["watch/providers"] || {}).results || {}).FR || {};
    var prov = (wp.flatrate || []).concat(wp.rent || []).concat(wp.buy || []).filter(function (p, i, a) { return a.findIndex(function (q) { return q.provider_id === p.provider_id; }) === i; }).slice(0, 8);
    var p = Math.round(m.vote_average * 10), a = m.vote_average / 2;
    var bg = m.backdrop_path ? "url(" + IMG + "w780" + m.backdrop_path + ") center/cover" : poster(m);
    var yr = (m.release_date || "").slice(0, 4);
    var rows = [["Sortie", fmtDate(m.release_date)], ["Réalisation", E(dir)], ["Durée", runtime(m.runtime)],
      ["Titre original", m.original_title !== m.title ? E(m.original_title) : ""],
      ["Production", E((m.production_companies || []).slice(0, 3).map(function (c) { return c.name; }).join(", "))],
      ["Pays", E((m.production_countries || []).map(function (c) { return c.name; }).join(", "))],
      ["Budget", money(m.budget)], ["Recettes", money(m.revenue)]];
    fEl.innerHTML =
      '<div class="hero" style="--g:' + bg + '"><button class="back" aria-label="Retour">←</button><h1>' + E(m.title).toUpperCase() + '</h1><p>' + [yr, runtime(m.runtime)].filter(Boolean).join(" – ") + '</p></div><div class="pad">' +
      '<div class="gn">' + (m.genres || []).map(function (g) { return '<span class="chip">' + E(g.name) + '</span>'; }).join("") + '</div>' +
      '<div class="scores"><div style="text-align:center"><div class="ring2" style="--p:' + p + '"><b>' + p + '%</b></div><small>Avis positifs</small></div>' +
      '<div><div class="avg">' + a.toFixed(1).replace(".", ",") + '<small>/5</small></div><div class="stars">' + stars(Math.round(a * 2) / 2) + '</div><small>' + (m.vote_count || 0).toLocaleString("fr-FR") + ' notes (TMDB)</small></div></div>' +
      '<div class="btns"><button class="btn" data-a="seen">👁 Vu</button><button class="btn" data-l="1">＋ Liste</button><button class="btn main" data-a="write">✎ Critiquer</button></div>' +
      (vid ? '<a class="btn" href="https://www.youtube.com/watch?v=' + encodeURIComponent(vid.key) + '" target="_blank" rel="noopener">▶ Voir la bande-annonce</a>' : '') +
      (m.tagline ? '<p class="tl">' + E(m.tagline) + '</p>' : '') +
      '<p class="syn">' + E(m.overview || "Pas de synopsis en français pour le moment.") + '</p>' +
      '<h2>Infos</h2><div class="dl">' + rows.filter(function (r) { return r[1]; }).map(function (r) { return '<div><span>' + r[0] + '</span><b>' + r[1] + '</b></div>'; }).join("") + '</div>' +
      '<h2>Casting</h2><div class="cast">' + cast.map(function (c, k) {
        var ph = c.profile_path;
        return '<div class="cm2"><div style="background:' + (ph ? "url(" + IMG + "w185" + ph + ") center/cover" : "hsl(" + (k * 67 + 10) + ",55%,40%)") + '">' + (ph ? "" : ii(c.name)) + '</div>' + E(c.name) + '<br><small>' + E(c.character) + '</small></div>';
      }).join("") + '</div>' +
      '<h2>Où le voir</h2>' + (prov.length ? '<div class="prov">' + prov.map(function (v) { return '<img src="' + IMG + 'w92' + v.logo_path + '" alt="' + E(v.provider_name) + '" title="' + E(v.provider_name) + '">'; }).join("") + '</div><p class="att">Données de disponibilité : JustWatch, via TMDB.</p>' : '<p style="color:var(--muted)">Pas de plateforme en France pour le moment.</p>') +
      ((m.similar && m.similar.results.length) ? '<h2>Dans le même esprit</h2><div class="sim">' + posters(m.similar.results.slice(0, 10)) + '</div>' : '') +
      '<h2>Critiques</h2><div id="rvs"></div>' +
      '<p class="att">Ce produit utilise l’API TMDB mais n’est ni approuvé ni certifié par TMDB.</p></div>';
    paintRv(); fEl.scrollTop = 0;
  }
})();
