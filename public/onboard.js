// Écran de bienvenue (photo, film préféré, description) + affichage des photos de profil partout.
(function () {
  var A = CLAP_API, sb = A.sb, IMG = "https://image.tmdb.org/t/p/w185", C = 520;
  var $ = function (s) { return document.querySelector(s); };
  var E = function (s) { return esc(String(s == null ? "" : s)); };
  var BAD_MSG = "Ce texte ne respecte pas les règles de la communauté.";
  var st = document.createElement("style");
  st.textContent = '#onb{position:fixed;inset:0;z-index:900;background:#0f080b;color:#fff;overflow-y:auto;font:400 15px/1.45 "DM Sans",system-ui,sans-serif}#onb[hidden]{display:none}' +
    '#onb .ob-bg{position:fixed;inset:0;pointer-events:none;background:radial-gradient(60vmax 60vmax at 10% -10%,rgba(255,77,94,.35),transparent 60%),radial-gradient(50vmax 50vmax at 100% 110%,rgba(255,166,61,.3),transparent 60%)}' +
    '#onb .ob-main{position:relative;max-width:420px;margin:0 auto;padding:calc(env(safe-area-inset-top,0px) + 28px) 22px calc(env(safe-area-inset-bottom,0px) + 28px);min-height:100%;display:flex;flex-direction:column;justify-content:center}' +
    '.ob-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}.ob-dots{display:flex;gap:8px}.ob-dots i{width:26px;height:5px;border-radius:9px;background:rgba(255,255,255,.2);transition:background .3s,width .3s}.ob-dots i.on{background:#ff4d5e;width:40px}' +
    '#ob-card>*{animation:gin .45s cubic-bezier(.2,.8,.2,1) backwards}#ob-card p{margin:4px 0;opacity:.85}' +
    '.ob-crop{position:relative;width:260px;height:260px;margin:14px auto;border-radius:50%;overflow:hidden;box-shadow:0 0 0 3px rgba(255,255,255,.25),0 18px 50px rgba(255,77,94,.3);touch-action:none;cursor:grab;background:#1b1015}.ob-crop canvas{width:100%;height:100%;display:block}' +
    '.ob-zoom{width:100%;accent-color:#ff4d5e;margin-top:4px}.ob-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px;max-height:44vh;overflow-y:auto}' +
    '.ob-po{aspect-ratio:2/3;border-radius:10px;background-size:cover;background-position:center;border:3px solid transparent;transition:transform .15s,border-color .15s}.ob-po.on{border-color:#ffb703;transform:scale(.95)}' +
    '.ob-fav{display:inline-flex;margin-top:10px;padding:6px 12px;border-radius:99px;background:rgba(255,183,3,.15);color:#ffd36b;font-weight:700}.ob-ta{min-height:120px;resize:none}';
  document.head.appendChild(st);
  var o = document.createElement("div"); o.id = "onb"; o.hidden = true;
  o.innerHTML = '<div class="ob-bg"></div><div class="ob-main"><div class="ob-top"><div class="ob-dots"><i></i><i></i><i></i></div><button class="g-link" data-ob="all">Tout passer</button></div><div class="g-card" id="ob-card"></div></div>';
  document.body.appendChild(o);

  var D = {}, step = 0, S = {}, cv, shown = false, nsfwP = null;
  var skip = '<p style="text-align:center;margin-top:12px"><button class="g-link" data-ob="skip">Passer</button></p>';
  var STEPS = [
    function () { return '<h2>Ta photo de profil</h2><p>Zoome et déplace ta photo pour la placer dans le cercle.</p><div class="ob-crop"><canvas id="ob-cv" width="' + C + '" height="' + C + '"></canvas></div><input class="ob-zoom" id="ob-z" type="range" min="1" max="4" step="0.01" value="1" disabled aria-label="Zoom"><button class="g-btn w" data-ob="pick">Choisir une photo</button><input type="file" id="ob-f" accept="image/*" hidden><div class="g-msg err" id="ob-m"></div><button class="g-btn r" id="ob-n" data-ob="next" disabled>Continuer</button>' + skip; },
    function () { return '<h2>Ton film préféré</h2><p>Celui que tu pourrais revoir mille fois.</p><input class="g-in" id="ob-q" type="search" placeholder="Rechercher un film…" aria-label="Rechercher un film"><div id="ob-sel"></div><div class="ob-grid" id="ob-g"></div><div class="g-msg err" id="ob-m"></div><button class="g-btn r" id="ob-n" data-ob="next" disabled>Continuer</button>' + skip; },
    function () { return '<h2>Parle-nous de toi</h2><p>Une phrase suffit.</p><textarea class="g-in ob-ta" id="ob-t" maxlength="160" placeholder="Ex : Fan de thrillers et de films des années 80."></textarea><div class="cnt" id="ob-c">0 / 160</div><div class="g-msg err" id="ob-m"></div><button class="g-btn r" data-ob="next">Terminer</button>' + skip; }
  ];
  function msg(t, ok) { var m = $("#ob-m"); if (m) { m.textContent = t || ""; m.className = "g-msg " + (ok ? "ok" : "err"); } }
  function render() {
    $("#ob-card").innerHTML = STEPS[step]();
    o.querySelectorAll(".ob-dots i").forEach(function (d, i) { d.classList.toggle("on", i === step); });
    o.scrollTop = 0;
    if (step === 0) bindCrop(); else if (step === 1) bindFilms(); else bindBio();
  }
  function open() { D = {}; S = {}; step = 0; o.hidden = false; render(); loadNsfw().catch(function () {}); }

  // ---- Recadrage rond : déplacer + zoomer
  function draw() {
    var c = cv.getContext("2d"); c.fillStyle = "#1b1015"; c.fillRect(0, 0, C, C);
    if (!S.img) { c.fillStyle = "rgba(255,255,255,.55)"; c.font = '600 30px "DM Sans",sans-serif'; c.textAlign = "center"; c.fillText("Ta photo ici", C / 2, C / 2 + 10); return; }
    var s = S.base * S.z; c.drawImage(S.img, S.ox, S.oy, S.img.width * s, S.img.height * s);
  }
  function clamp() { var s = S.base * S.z; S.ox = Math.min(0, Math.max(C - S.img.width * s, S.ox)); S.oy = Math.min(0, Math.max(C - S.img.height * s, S.oy)); }
  function setZ(z) { var s0 = S.base * S.z, cx = (C / 2 - S.ox) / s0, cy = (C / 2 - S.oy) / s0; S.z = z; var s1 = S.base * z; S.ox = C / 2 - cx * s1; S.oy = C / 2 - cy * s1; clamp(); draw(); }
  function bindCrop() {
    cv = $("#ob-cv"); draw(); var down = null, f = function () { return C / cv.clientWidth; };
    cv.addEventListener("pointerdown", function (e) { if (!S.img) return; down = { x: e.clientX, y: e.clientY }; cv.setPointerCapture(e.pointerId); });
    cv.addEventListener("pointermove", function (e) { if (!down) return; S.ox += (e.clientX - down.x) * f(); S.oy += (e.clientY - down.y) * f(); down = { x: e.clientX, y: e.clientY }; clamp(); draw(); });
    ["pointerup", "pointercancel"].forEach(function (ev) { cv.addEventListener(ev, function () { down = null; }); });
    cv.addEventListener("wheel", function (e) { if (!S.img) return; e.preventDefault(); var z = Math.min(4, Math.max(1, S.z * (e.deltaY < 0 ? 1.08 : .92))); $("#ob-z").value = z; setZ(z); }, { passive: false });
    $("#ob-z").addEventListener("input", function (e) { setZ(+e.target.value); });
    $("#ob-f").addEventListener("change", function (e) {
      var file = e.target.files[0]; if (!file) return; msg("");
      if (!/^image\//.test(file.type) || file.size > 15e6) return msg("Choisis une image (JPG, PNG…) de moins de 15 Mo.");
      var im = new Image();
      im.onload = function () {
        S.img = im; S.base = Math.max(C / im.width, C / im.height); S.z = 1; S.ox = (C - im.width * S.base) / 2; S.oy = (C - im.height * S.base) / 2;
        var z = $("#ob-z"); z.disabled = false; z.value = 1; $("#ob-n").disabled = false; draw(); URL.revokeObjectURL(im.src);
      };
      im.onerror = function () { msg("Impossible de lire cette photo. Essaie un JPG ou un PNG."); };
      im.src = URL.createObjectURL(file);
    });
  }

  // ---- Contrôle anti-nudité (modèle gratuit hébergé sur ton site, tourne dans le navigateur)
  function loadNsfw() {
    if (nsfwP) return nsfwP;
    nsfwP = new Promise(function (res, rej) {
      var s = document.createElement("script"); s.src = "/vendor/nsfw/nsfwjs.min.js";
      s.onload = function () { nsfwjs.load(location.origin + "/vendor/nsfw/mobilenet_v2/", { size: 224 }).then(res, rej); };
      s.onerror = rej; document.head.appendChild(s);
    });
    nsfwP.catch(function () { nsfwP = null; });
    return nsfwP;
  }
  async function isBad(canvas) {
    var p = await (await loadNsfw()).classify(canvas), k = {};
    p.forEach(function (x) { k[x.className] = x.probability; });
    return (k.Porn || 0) + (k.Hentai || 0) >= .4 || (k.Sexy || 0) >= .8;
  }
  async function savePhoto() {
    var n = $("#ob-n"); n.disabled = true; msg("Vérification de la photo…", true);
    try { if (await isBad(cv)) { msg("Cette photo ne respecte pas les règles de la communauté. Choisis-en une autre."); n.disabled = false; return; } }
    catch (e) { msg("Vérification indisponible, réessaie dans un instant ou passe cette étape."); n.disabled = false; return; }
    var blob = await new Promise(function (r) { cv.toBlob(r, "image/jpeg", .86); });
    var path = A.me().id + "/avatar.jpg";
    var up = await sb.storage.from("avatars").upload(path, blob, { upsert: true, contentType: "image/jpeg", cacheControl: "3600" });
    if (up.error) { msg("Envoi impossible : " + up.error.message); n.disabled = false; return; }
    D.avatar_url = sb.storage.from("avatars").getPublicUrl(path).data.publicUrl + "?v=" + Date.now();
    go();
  }

  // ---- Film préféré
  function films(q) {
    fetch("/api/" + (q ? "search?q=" + encodeURIComponent(q) : "trending")).then(function (r) { return r.json(); }).then(function (r) {
      var g = $("#ob-g"); if (!g) return;
      var l = (r.results || []).filter(function (m) { return m.poster_path; }).slice(0, 18);
      g.innerHTML = l.map(function (m) { return '<button class="ob-po' + (D.fav && D.fav.id === m.id ? " on" : "") + '" data-id="' + m.id + '" data-t="' + E(m.title) + '" data-p="' + m.poster_path + '" style="background-image:url(' + IMG + m.poster_path + ')" aria-label="' + E(m.title) + '"></button>'; }).join("") || '<p style="grid-column:1/-1">Aucun résultat.</p>';
    }).catch(function () {});
  }
  function paintSel() { $("#ob-sel").innerHTML = D.fav ? '<span class="ob-fav">★ ' + E(D.fav.title) + '</span>' : ""; $("#ob-n").disabled = !D.fav; }
  function bindFilms() {
    var q = $("#ob-q"), tm; paintSel(); films("");
    q.addEventListener("input", function () { clearTimeout(tm); tm = setTimeout(function () { films(q.value.trim()); }, 350); });
    $("#ob-g").addEventListener("click", function (e) {
      var b = e.target.closest(".ob-po"); if (!b) return;
      D.fav = { id: +b.dataset.id, title: b.dataset.t, poster: b.dataset.p || null }; paintSel();
      document.querySelectorAll("#ob-g .ob-po").forEach(function (x) { x.classList.toggle("on", +x.dataset.id === D.fav.id); });
    });
  }

  // ---- Description
  function bindBio() { var t = $("#ob-t"); t.addEventListener("input", function () { $("#ob-c").textContent = t.value.length + " / 160"; }); }
  function saveBio() { var t = $("#ob-t").value.trim(); if (t && window.CLAP_MOD && CLAP_MOD.bad(t)) return msg(BAD_MSG); if (t) D.bio = t; finish(); }

  async function finish() {
    var p = { onboarded: true };
    if (D.avatar_url) p.avatar_url = D.avatar_url; if (D.bio) p.bio = D.bio;
    if (D.fav) { p.fav_tmdb_id = D.fav.id; p.fav_title = D.fav.title; p.fav_poster = D.fav.poster; }
    var r = await sb.from("profiles").update(p).eq("id", A.me().id);
    if (r.error) { if (/inappropriate/i.test(r.error.message)) { step = 2; render(); return msg(BAD_MSG); } return msg("Oups, réessaie : " + r.error.message); }
    o.hidden = true; toast("Bienvenue sur Clap 🎬"); sb.auth.refreshSession();
  }
  function go() { if (step >= 2) return finish(); step++; render(); }
  o.addEventListener("click", function (e) {
    var b = e.target.closest("[data-ob]"); if (!b) return; var a = b.dataset.ob;
    if (a === "pick") return $("#ob-f").click();
    if (a === "all") return finish();
    if (a === "skip") return go();
    if (step === 0) savePhoto(); else if (step === 2) saveBio(); else go();
  });

  // ---- Photos de profil affichées partout (à côté des pseudos)
  var AVC = {}, pend = false;
  function apply() {
    document.querySelectorAll(".un[data-u]").forEach(function (u) {
      var url = AVC[u.dataset.u]; if (!url) return;
      var p = u.previousElementSibling, av = p && p.classList.contains("av") ? p : (u.closest(".rp,.lrow,.who") || u.parentElement).querySelector(".av");
      if (av && !av.dataset.img) { av.style.background = "url(" + url + ") center/cover"; av.textContent = ""; av.dataset.img = "1"; }
    });
  }
  function enhance() {
    pend = false; var need = [];
    document.querySelectorAll(".un[data-u]").forEach(function (u) { var n = u.dataset.u; if (!(n in AVC) && need.indexOf(n) < 0) need.push(n); });
    if (!need.length) return apply();
    sb.from("profiles").select("username,avatar_url").in("username", need).then(function (r) {
      need.forEach(function (n) { AVC[n] = ""; }); (r.data || []).forEach(function (p) { AVC[p.username] = p.avatar_url || ""; }); apply();
    });
  }
  new MutationObserver(function () { if (!pend) { pend = true; setTimeout(enhance, 250); } }).observe(document.body, { childList: true, subtree: true });

  // ---- Mon profil : photo du bouton, film préféré, bouton « Modifier »
  function extras() {
    var p = A.prof(), bio = $("#prof .pad > p"); if (!bio) return;
    var f = document.getElementById("myfav");
    if (!f) { bio.insertAdjacentHTML("afterend", '<div id="myfav" style="margin-top:8px"></div><button class="chip" id="editprof" style="margin-top:10px">Modifier mon profil</button>'); f = document.getElementById("myfav"); }
    f.innerHTML = p && p.fav_title ? '<span class="chip">★ Film préféré : ' + E(p.fav_title) + '</span>' : "";
    document.getElementById("editprof").hidden = !p;
  }
  document.addEventListener("click", function (e) { if (e.target.closest("#editprof")) open(); });
  var prev = A.onUser;
  A.onUser = function () {
    if (prev) prev();
    var p = A.prof(), b = document.getElementById("theme").previousElementSibling; AVC = {};
    if (b && p && p.avatar_url) { b.style.background = "url(" + p.avatar_url + ") center/cover"; b.textContent = ""; } else if (b) b.style.background = "";
    setTimeout(extras, 350); setTimeout(enhance, 300);
    if (p && p.onboarded === false && !shown) { shown = true; open(); }
  };
})();
