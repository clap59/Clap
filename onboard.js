// Écran de bienvenue : âge, photo (recadrage rond), 5 films favoris, description. + photos de profil partout.
(function () {
  var A = CLAP_API, sb = A.sb, TM = "https://image.tmdb.org/t/p/w185", C = 640, R = Math.round(C * .78), M = (C - R) / 2;
  var $ = function (s) { return document.querySelector(s); };
  var E = function (s) { return esc(String(s == null ? "" : s)); };
  var BAD_MSG = "Ce texte ne respecte pas les règles de la communauté.";
  var calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var st = document.createElement("style");
  st.textContent = '#onb{position:fixed;inset:0;z-index:900;background:#0f080b;color:#fff;overflow-y:auto;font:400 15px/1.45 "DM Sans",system-ui,sans-serif;transition:opacity .5s,transform .5s}#onb[hidden]{display:none}#onb.out{opacity:0;transform:scale(1.05);pointer-events:none}' +
    '#onb .ob-bg{position:fixed;inset:0;pointer-events:none;background:radial-gradient(60vmax 60vmax at 10% -10%,rgba(255,77,94,.35),transparent 60%),radial-gradient(50vmax 50vmax at 100% 110%,rgba(255,166,61,.3),transparent 60%)}' +
    '#onb .ob-main{position:relative;max-width:420px;margin:0 auto;padding:calc(env(safe-area-inset-top,0px) + 24px) 22px calc(env(safe-area-inset-bottom,0px) + 28px);min-height:100%;display:flex;flex-direction:column;justify-content:center}' +
    '.ob-top{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;margin-bottom:14px}#ob-all{justify-self:end}#ob-back{justify-self:start}.ob-dots{display:flex;gap:7px}' +
    '.ob-dots i{width:22px;height:5px;border-radius:9px;background:rgba(255,255,255,.2);transition:background .3s,width .3s}.ob-dots i.done{background:rgba(255,77,94,.55)}.ob-dots i.on{background:#ff4d5e;width:38px}' +
    '#ob-card>*{animation:obIn .5s cubic-bezier(.2,.8,.2,1) backwards}#ob-card>*:nth-child(2){animation-delay:.04s}#ob-card>*:nth-child(3){animation-delay:.08s}#ob-card>*:nth-child(4){animation-delay:.12s}#ob-card>*:nth-child(5){animation-delay:.16s}#ob-card>*:nth-child(n+6){animation-delay:.2s}' +
    '@keyframes obIn{from{opacity:0;transform:translateX(calc(var(--d,1)*44px)) scale(.98)}}#ob-card.leave>*{animation:obOut .24s ease-in forwards!important;animation-delay:0s!important}@keyframes obOut{to{opacity:0;transform:translateX(calc(var(--d,1)*-44px))}}' +
    '#ob-card p{margin:4px 0;opacity:.85}.ob-range{-webkit-appearance:none;appearance:none;width:100%;height:8px;border-radius:9px;outline:none;background:linear-gradient(90deg,#ff4d5e var(--p,0%),rgba(255,255,255,.18) var(--p,0%))}' +
    '.ob-range::-webkit-slider-thumb{-webkit-appearance:none;width:26px;height:26px;border-radius:50%;background:#fff;border:4px solid #ff4d5e;box-shadow:0 4px 14px rgba(255,77,94,.55);cursor:grab}.ob-range::-moz-range-thumb{width:20px;height:20px;border-radius:50%;background:#fff;border:4px solid #ff4d5e;box-shadow:0 4px 14px rgba(255,77,94,.55);cursor:grab}.ob-range:disabled{opacity:.35}' +
    '.ob-agev{margin:16px 0 14px;text-align:center;font:400 104px/1 "Bebas Neue",Impact,sans-serif;letter-spacing:.04em;padding:12px 0;border-radius:22px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.16);text-shadow:0 5px 0 rgba(255,77,94,.55),0 0 34px rgba(255,77,94,.4)}' +
    '.ob-row{display:flex;align-items:center;gap:12px}.ob-arr,.ob-zb{flex:none;width:46px;height:46px;border-radius:50%;background:rgba(255,255,255,.1);font-size:26px;line-height:1;display:grid;place-items:center;transition:transform .12s,background .2s;user-select:none;touch-action:manipulation}.ob-arr:active,.ob-zb:active{transform:scale(.88);background:rgba(255,77,94,.4)}.ob-zb{width:38px;height:38px;font-size:22px}' +
    '.ob-crop{position:relative;width:min(100%,340px);aspect-ratio:1;margin:14px auto 10px;border-radius:22px;overflow:hidden;touch-action:none;cursor:grab;background:#120a0e;box-shadow:0 18px 50px rgba(0,0,0,.5),0 0 0 1px rgba(255,255,255,.12)}.ob-crop canvas{width:100%;height:100%;display:block}' +
    '.ob-zl{display:flex;justify-content:space-between;align-items:center;margin:6px 4px 0;font-size:14px}.ob-zl b{color:#ffb703;font-variant-numeric:tabular-nums}' +
    '.ob-done{position:absolute;inset:0;display:grid;place-items:center;background:rgba(15,8,11,.94);animation:obFade .25s}.ob-done img{width:62%;aspect-ratio:1;border-radius:50%;object-fit:cover;box-shadow:0 0 0 4px #fff,0 0 60px rgba(255,77,94,.65);animation:obPop .55s cubic-bezier(.2,1.4,.4,1)}.ob-done svg{position:absolute;right:19%;bottom:15%;animation:obPop .5s .25s cubic-bezier(.2,1.4,.4,1) backwards}.ob-done path{stroke-dasharray:1;stroke-dashoffset:1;animation:obDraw .4s .5s forwards}' +
    '@keyframes obPop{from{transform:scale(.3);opacity:0}}@keyframes obFade{from{opacity:0}}@keyframes obDraw{to{stroke-dashoffset:0}}' +
    '.ob-slots{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin:12px 0 6px}.ob-slot{aspect-ratio:2/3;border-radius:8px;border:2px dashed rgba(255,255,255,.25);background-size:cover;background-position:center;transition:border-color .2s}.ob-slot.f{border:2px solid #ffb703;animation:obPop .3s cubic-bezier(.2,1.4,.4,1)}' +
    '.ob-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px;max-height:40vh;overflow-y:auto}.ob-po{position:relative;aspect-ratio:2/3;border-radius:10px;background-size:cover;background-position:center;border:3px solid transparent;transition:transform .15s,border-color .15s}.ob-po.on{border-color:#ffb703;transform:scale(.95)}' +
    '.ob-b{position:absolute;top:4px;right:4px;width:22px;height:22px;border-radius:50%;background:#ffb703;color:#111;font:700 12px/22px "DM Sans",sans-serif;text-align:center}.ob-ta{min-height:120px;resize:none}' +
    '@media (prefers-reduced-motion:reduce){#onb *{animation:none!important;transition:none!important}}';
  document.head.appendChild(st);
  var o = document.createElement("div"); o.id = "onb"; o.hidden = true;
  o.innerHTML = '<div class="ob-bg"></div><div class="ob-main"><div class="ob-top"><button class="g-link" id="ob-back" data-ob="back">‹ Retour</button><div class="ob-dots"></div><button class="g-link" id="ob-all" data-ob="all">Tout passer</button></div><div class="g-card" id="ob-card"></div></div>';
  document.body.appendChild(o);

  var ST = [], step = 0, mode = "full", F = { favs: [] }, S = {}, cv, shown = false, nsfwP = null;
  var skip = '<p style="text-align:center;margin-top:12px"><button class="g-link" data-ob="skip">Passer</button></p>';
  var T = {
    age: function () { return '<h2>Quel âge as-tu ?</h2><p>Clap est réservé aux personnes de 13 ans et plus. Ton âge reste privé.</p><div class="ob-agev" id="ob-av">18</div><div class="ob-row"><button class="ob-arr" data-age="-1" aria-label="Moins">‹</button><input class="ob-range" id="ob-as" type="range" min="5" max="100" value="18" aria-label="Âge"><button class="ob-arr" data-age="1" aria-label="Plus">›</button></div><div class="g-msg err" id="ob-m"></div><button class="g-btn r" data-ob="next">Continuer</button>'; },
    photo: function () { return '<h2>Ta photo de profil</h2><p>Déplace et zoome pour cadrer ton visage dans le cercle.</p><div class="ob-crop" id="ob-crop"><canvas id="ob-cv" width="' + C + '" height="' + C + '"></canvas></div><div class="ob-row"><button class="ob-zb" data-z="-1" aria-label="Dézoomer">−</button><input class="ob-range" id="ob-z" type="range" min="100" max="400" step="1" value="100" disabled aria-label="Zoom"><button class="ob-zb" data-z="1" aria-label="Zoomer">+</button></div><div class="ob-zl"><span>Zoom <b id="ob-zp">100 %</b></span><button class="g-link" data-ob="reset">Recentrer</button></div><button class="g-btn w" data-ob="pick">Choisir une photo</button><input type="file" id="ob-f" accept="image/*" hidden><div class="g-msg err" id="ob-m"></div><button class="g-btn r" id="ob-n" data-ob="next" disabled>Continuer</button>' + skip; },
    films: function () { return '<h2>Tes films favoris</h2><p>Choisis-en jusqu’à 5.</p><div class="ob-slots" id="ob-sel"></div><input class="g-in" id="ob-q" type="search" placeholder="Rechercher un film…" aria-label="Rechercher un film"><div class="ob-grid" id="ob-g"></div><div class="g-msg err" id="ob-m"></div><button class="g-btn r" id="ob-n" data-ob="next" disabled>Continuer</button>' + skip; },
    bio: function () { return '<h2>Parle-nous de toi</h2><p>Une phrase suffit.</p><textarea class="g-in ob-ta" id="ob-t" maxlength="160" placeholder="Ex : Fan de thrillers et de films des années 80."></textarea><div class="cnt" id="ob-c">0 / 160</div><div class="g-msg err" id="ob-m"></div><button class="g-btn r" data-ob="next">Terminer</button>' + skip; }
  };
  var B = {};
  function msg(t, ok) { var m = $("#ob-m"); if (m) { m.textContent = t || ""; m.className = "g-msg " + (ok ? "ok" : "err"); } }
  function fill(s) { s.style.setProperty("--p", ((s.value - s.min) / (s.max - s.min) * 100) + "%"); }
  function burst(el) {
    if (calm || !el) return; var r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, cols = ["#ff4d5e", "#ffb703", "#ffffff", "#ff8a3d"];
    for (var i = 0; i < 18; i++) {
      var d = document.createElement("i"), a = i / 18 * 6.283 + Math.random() * .4, dist = 70 + Math.random() * 80;
      d.style.cssText = "position:fixed;left:" + cx + "px;top:" + cy + "px;width:8px;height:8px;border-radius:2px;z-index:1100;pointer-events:none;background:" + cols[i % 4];
      document.body.appendChild(d);
      (function (n) { d.animate([{ transform: "translate(-50%,-50%) scale(1)", opacity: 1 }, { transform: "translate(calc(-50% + " + Math.cos(a) * dist + "px),calc(-50% + " + Math.sin(a) * dist + "px)) rotate(240deg) scale(.4)", opacity: 0 }], { duration: 650 + Math.random() * 300, easing: "cubic-bezier(.2,.8,.3,1)" }).onfinish = function () { n.remove(); }; })(d);
    }
  }
  function render(dir) {
    var name = ST[step], c = $("#ob-card"); c.style.setProperty("--d", dir || 1); c.innerHTML = T[name]();
    $(".ob-dots").innerHTML = ST.length > 1 ? ST.map(function (_, i) { return '<i class="' + (i === step ? "on" : i < step ? "done" : "") + '"></i>'; }).join("") : "";
    $("#ob-back").style.visibility = step > (ST[0] === "age" ? 1 : 0) ? "visible" : "hidden";
    $("#ob-all").style.visibility = name !== "age" && ST.length > 1 ? "visible" : "hidden";
    o.scrollTop = 0; B[name]();
  }
  function goTo(n) { var c = $("#ob-card"), dir = n > step ? 1 : -1; c.style.setProperty("--d", dir); c.classList.add("leave"); setTimeout(function () { c.classList.remove("leave"); step = n; render(dir); }, calm ? 0 : 240); }
  function next() { if (step >= ST.length - 1) return finish(); goTo(step + 1); }
  function open(m, skipAge) {
    var p = A.prof() || {}; mode = m; S = {}; step = 0; F = { favs: (p.fav_films || []).slice(0, 5), bio: undefined };
    ST = m === "age" ? ["age"] : (skipAge ? [] : ["age"]).concat(["photo", "films", "bio"]);
    o.classList.remove("blk"); o.hidden = false; render(1); if (ST.indexOf("photo") > -1) loadNsfw().catch(function () {});
  }

  // ---- Âge (écran neutre : on ne donne pas l'âge minimum à l'avance)
  B.age = function () {
    var s = $("#ob-as"), v = $("#ob-av");
    function upd(x) { x = Math.max(5, Math.min(100, x)); s.value = x; v.textContent = x >= 100 ? "99+" : x; if (!calm && v.animate) v.animate([{ transform: "scale(1)" }, { transform: "scale(1.06)" }, { transform: "scale(1)" }], { duration: 180 }); fill(s); }
    s.addEventListener("input", function () { upd(+s.value); });
    o.querySelectorAll("[data-age]").forEach(function (b) {
      var d = +b.dataset.age, to, iv, stop = function () { clearTimeout(to); clearInterval(iv); };
      b.addEventListener("pointerdown", function () { upd(+s.value + d); to = setTimeout(function () { iv = setInterval(function () { upd(+s.value + d); }, 90); }, 380); });
      ["pointerup", "pointerleave", "pointercancel"].forEach(function (ev) { b.addEventListener(ev, stop); });
    });
    fill(s);
  };
  async function saveAge(btn) {
    var v = +$("#ob-as").value, age = v >= 100 ? 99 : v; btn.disabled = true;
    var r = await sb.from("user_private").insert({ age: age });
    if (r.error && !/duplicate|unique/i.test(r.error.message)) { btn.disabled = false; return msg("Oups, réessaie : " + r.error.message); }
    if (age < 13) return blocked();
    burst(btn); setTimeout(next, calm ? 0 : 380);
  }
  function blocked() {
    o.hidden = false; o.classList.add("blk"); $(".ob-top").style.visibility = "hidden";
    $("#ob-card").innerHTML = '<h2>Oups…</h2><p>Clap est réservé aux personnes de 13 ans et plus. Reviens quand tu auras l’âge 🎬</p><button class="g-btn w" data-ob="out">OK</button>';
  }

  // ---- Photo : recadrage rond (déplacer, zoomer, pincer)
  function draw() {
    var c = cv.getContext("2d"); c.fillStyle = "#120a0e"; c.fillRect(0, 0, C, C);
    if (!S.img) {
      c.strokeStyle = "rgba(255,255,255,.4)"; c.lineWidth = 4; c.setLineDash([16, 14]); c.beginPath(); c.arc(C / 2, C / 2, R / 2, 0, 6.283); c.stroke(); c.setLineDash([]);
      c.fillStyle = "rgba(255,255,255,.6)"; c.font = '600 34px "DM Sans",sans-serif'; c.textAlign = "center"; c.fillText("Ta photo ici", C / 2, C / 2 + 12); return;
    }
    var s = S.base * S.z; c.drawImage(S.img, S.ox, S.oy, S.img.width * s, S.img.height * s);
    c.fillStyle = "rgba(10,5,8,.64)"; c.beginPath(); c.rect(0, 0, C, C); c.arc(C / 2, C / 2, R / 2, 0, 6.283); c.fill("evenodd");
    if (S.drag) { c.save(); c.beginPath(); c.arc(C / 2, C / 2, R / 2, 0, 6.283); c.clip(); c.strokeStyle = "rgba(255,255,255,.35)"; c.lineWidth = 2; for (var i = 1; i < 3; i++) { c.beginPath(); c.moveTo(M + R * i / 3, M); c.lineTo(M + R * i / 3, M + R); c.moveTo(M, M + R * i / 3); c.lineTo(M + R, M + R * i / 3); c.stroke(); } c.restore(); }
    c.lineWidth = 5; c.strokeStyle = "#fff"; c.shadowColor = "rgba(255,77,94,.8)"; c.shadowBlur = 18; c.beginPath(); c.arc(C / 2, C / 2, R / 2, 0, 6.283); c.stroke(); c.shadowBlur = 0;
  }
  function clamp() { var s = S.base * S.z; S.ox = Math.min(M, Math.max(M + R - S.img.width * s, S.ox)); S.oy = Math.min(M, Math.max(M + R - S.img.height * s, S.oy)); }
  function setZ(z) {
    z = Math.min(4, Math.max(1, z)); var s0 = S.base * S.z, cx = (C / 2 - S.ox) / s0, cy = (C / 2 - S.oy) / s0; S.z = z; var s1 = S.base * z; S.ox = C / 2 - cx * s1; S.oy = C / 2 - cy * s1; clamp();
    var sl = $("#ob-z"); sl.value = Math.round(z * 100); fill(sl); $("#ob-zp").textContent = Math.round(z * 100) + " %"; draw();
  }
  function center() { var w = S.img.width * S.base, h = S.img.height * S.base; S.z = 1; S.ox = (C - w) / 2; S.oy = (C - h) / 2; setZ(1); }
  B.photo = function () {
    cv = $("#ob-cv"); draw(); var P = {}, f = function () { return C / cv.clientWidth; }, ids = function () { return Object.keys(P); };
    var dist = function () { var a = P[ids()[0]], b = P[ids()[1]]; return Math.hypot(a.x - b.x, a.y - b.y); };
    cv.addEventListener("pointerdown", function (e) { if (!S.img) return; P[e.pointerId] = { x: e.clientX, y: e.clientY }; cv.setPointerCapture(e.pointerId); S.drag = true; if (ids().length === 2) { S.d0 = dist(); S.z0 = S.z; } draw(); });
    cv.addEventListener("pointermove", function (e) {
      if (!P[e.pointerId]) return; var n = ids().length;
      if (n === 1) { S.ox += (e.clientX - P[e.pointerId].x) * f(); S.oy += (e.clientY - P[e.pointerId].y) * f(); P[e.pointerId] = { x: e.clientX, y: e.clientY }; clamp(); draw(); }
      else if (n === 2) { P[e.pointerId] = { x: e.clientX, y: e.clientY }; setZ(S.z0 * dist() / S.d0); }
    });
    ["pointerup", "pointercancel"].forEach(function (ev) { cv.addEventListener(ev, function (e) { delete P[e.pointerId]; if (!ids().length) { S.drag = false; if (S.img) draw(); } }); });
    cv.addEventListener("wheel", function (e) { if (!S.img) return; e.preventDefault(); setZ(S.z * (e.deltaY < 0 ? 1.07 : .93)); }, { passive: false });
    $("#ob-z").addEventListener("input", function (e) { setZ(+e.target.value / 100); });
    $("#ob-f").addEventListener("change", function (e) {
      var file = e.target.files[0]; if (!file) return; msg("");
      if (!/^image\//.test(file.type) || file.size > 15e6) return msg("Choisis une image (JPG, PNG…) de moins de 15 Mo.");
      var im = new Image();
      im.onload = function () { S.img = im; S.base = Math.max(R / im.width, R / im.height); $("#ob-z").disabled = false; $("#ob-n").disabled = false; center(); URL.revokeObjectURL(im.src); };
      im.onerror = function () { msg("Impossible de lire cette photo. Essaie un JPG ou un PNG."); };
      im.src = URL.createObjectURL(file);
    });
  };
  function exportCanvas() {
    var out = document.createElement("canvas"); out.width = out.height = 480; var f = 480 / R, s = S.base * S.z, x = out.getContext("2d");
    x.imageSmoothingQuality = "high"; x.drawImage(S.img, (S.ox - M) * f, (S.oy - M) * f, S.img.width * s * f, S.img.height * s * f); return out;
  }
  function loadNsfw() {
    if (nsfwP) return nsfwP;
    nsfwP = new Promise(function (res, rej) {
      var s = document.createElement("script"); s.src = "/vendor/nsfw/nsfwjs.min.js";
      s.onload = function () { nsfwjs.load(location.origin + "/vendor/nsfw/mobilenet_v2/", { size: 224 }).then(res, rej); };
      s.onerror = rej; document.head.appendChild(s);
    });
    nsfwP.catch(function () { nsfwP = null; }); return nsfwP;
  }
  async function isBad(canvas) {
    var p = await (await loadNsfw()).classify(canvas), k = {}; p.forEach(function (x) { k[x.className] = x.probability; });
    return (k.Porn || 0) + (k.Hentai || 0) >= .4 || (k.Sexy || 0) >= .8;
  }
  async function savePhoto() {
    var n = $("#ob-n"), out = exportCanvas(); n.disabled = true; msg("Vérification de la photo…", true);
    try { if (await isBad(out)) { msg("Cette photo ne respecte pas les règles de la communauté. Choisis-en une autre."); n.disabled = false; return; } }
    catch (e) { msg("Vérification indisponible, réessaie dans un instant ou passe cette étape."); n.disabled = false; return; }
    var blob = await new Promise(function (r) { out.toBlob(r, "image/jpeg", .86); }), path = A.me().id + "/avatar.jpg";
    var up = await sb.storage.from("avatars").upload(path, blob, { upsert: true, contentType: "image/jpeg", cacheControl: "3600" });
    if (up.error) { msg("Envoi impossible : " + up.error.message); n.disabled = false; return; }
    F.avatar_url = sb.storage.from("avatars").getPublicUrl(path).data.publicUrl + "?v=" + Date.now(); msg("");
    var c = $("#ob-crop"); c.insertAdjacentHTML("beforeend", '<div class="ob-done"><img src="' + out.toDataURL("image/jpeg", .8) + '" alt=""><svg viewBox="0 0 52 52" width="64" height="64"><circle cx="26" cy="26" r="24" fill="#22c55e"/><path d="M14 27l8 8 16-17" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" pathLength="1"/></svg></div>');
    burst(c); setTimeout(next, calm ? 0 : 1100);
  }

  // ---- Films favoris (5 maximum)
  function films(q) {
    fetch("/api/" + (q ? "search?q=" + encodeURIComponent(q) : "trending")).then(function (r) { return r.json(); }).then(function (r) {
      var g = $("#ob-g"); if (!g) return;
      g.innerHTML = (r.results || []).filter(function (m) { return m.poster_path; }).slice(0, 18).map(function (m) {
        return '<button class="ob-po" data-id="' + m.id + '" data-t="' + E(m.title) + '" data-p="' + m.poster_path + '" style="background-image:url(' + TM + m.poster_path + ')" aria-label="' + E(m.title) + '"></button>';
      }).join("") || '<p style="grid-column:1/-1">Aucun résultat.</p>'; mark();
    }).catch(function () {});
  }
  function mark() {
    document.querySelectorAll("#ob-g .ob-po").forEach(function (b) {
      var i = F.favs.findIndex(function (x) { return x.id === +b.dataset.id; }); b.classList.toggle("on", i > -1);
      var t = b.querySelector(".ob-b"); if (i > -1) { if (!t) { t = document.createElement("b"); t.className = "ob-b"; b.appendChild(t); } t.textContent = i + 1; } else if (t) t.remove();
    });
  }
  function paintSel() {
    var h = ""; for (var i = 0; i < 5; i++) { var x = F.favs[i]; h += x ? '<button class="ob-slot f" data-rm="' + x.id + '" aria-label="Retirer ' + E(x.title) + '" style="background-image:url(' + (x.poster ? TM + x.poster : "") + ')"></button>' : '<div class="ob-slot"></div>'; }
    $("#ob-sel").innerHTML = h; var n = $("#ob-n"); n.disabled = !F.favs.length; n.textContent = F.favs.length ? "Continuer (" + F.favs.length + "/5)" : "Continuer"; mark();
  }
  B.films = function () {
    var q = $("#ob-q"), tm; paintSel(); films("");
    q.addEventListener("input", function () { clearTimeout(tm); tm = setTimeout(function () { films(q.value.trim()); }, 350); });
    $("#ob-g").addEventListener("click", function (e) {
      var b = e.target.closest(".ob-po"); if (!b) return; var id = +b.dataset.id, i = F.favs.findIndex(function (x) { return x.id === id; });
      if (i > -1) F.favs.splice(i, 1); else if (F.favs.length >= 5) return toast("5 films maximum"); else F.favs.push({ id: id, title: b.dataset.t, poster: b.dataset.p || null });
      paintSel();
    });
    $("#ob-sel").addEventListener("click", function (e) { var b = e.target.closest("[data-rm]"); if (!b) return; F.favs = F.favs.filter(function (x) { return x.id !== +b.dataset.rm; }); paintSel(); });
  };

  // ---- Description
  B.bio = function () {
    var t = $("#ob-t"), p = A.prof() || {}; t.value = F.bio !== undefined ? F.bio : (p.bio || ""); $("#ob-c").textContent = t.value.length + " / 160";
    t.addEventListener("input", function () { $("#ob-c").textContent = t.value.length + " / 160"; });
  };
  function saveBio(btn) { var t = $("#ob-t").value.trim(); if (t && window.CLAP_MOD && CLAP_MOD.bad(t)) return msg(BAD_MSG); F.bio = t; burst(btn); setTimeout(next, calm ? 0 : 300); }

  async function finish() {
    if (mode === "age") return close(false);
    var p = { onboarded: true, fav_films: F.favs };
    if (F.avatar_url) p.avatar_url = F.avatar_url; if (F.bio !== undefined) p.bio = F.bio || null;
    var r = await sb.from("profiles").update(p).eq("id", A.me().id);
    if (r.error) {
      var bi = ST.indexOf("bio");
      if (/inappropriate/i.test(r.error.message) && bi > -1) { goTo(bi); return setTimeout(function () { msg(BAD_MSG); }, 320); }
      return msg("Oups, réessaie : " + r.error.message);
    }
    close(true);
  }
  function close(refresh) { burst($("#ob-card")); o.classList.add("out"); setTimeout(function () { o.hidden = true; o.classList.remove("out"); }, calm ? 0 : 500); toast("Bienvenue sur Clap 🎬"); if (refresh) sb.auth.refreshSession(); }
  o.addEventListener("click", function (e) {
    var z = e.target.closest("[data-z]"); if (z && S.img) return setZ(S.z + .1 * +z.dataset.z);
    var b = e.target.closest("[data-ob]"); if (!b) return; var a = b.dataset.ob, name = ST[step];
    if (a === "pick") return $("#ob-f").click();
    if (a === "reset") return S.img && center();
    if (a === "back") return goTo(step - 1);
    if (a === "all") return finish();
    if (a === "skip") return next();
    if (a === "out") { o.hidden = true; return sb.auth.signOut(); }
    if (name === "age") saveAge(b); else if (name === "photo") savePhoto(); else if (name === "bio") saveBio(b); else { burst(b); setTimeout(next, calm ? 0 : 300); }
  });

  // ---- Contrôle de l'âge à la connexion
  var checking = false;
  async function ageCheck() {
    var p = A.prof(), me = A.me(); if (!p || !me || checking) return; checking = true;
    var r = await sb.from("user_private").select("age").eq("user_id", me.id).maybeSingle(); checking = false;
    if (r.error) { if (p.onboarded === false && !shown) { shown = true; open("full", true); } return; } // base pas encore mise à jour : pas de contrôle d'âge
    if (r.data) { if (r.data.age < 13) return blocked(); if (p.onboarded === false && !shown) { shown = true; open("full", true); } return; }
    if (!shown) { shown = true; open(p.onboarded === false ? "full" : "age"); }
  }

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

  // ---- Mon profil : bouton « Modifier », photo du bouton 👤
  function extras() {
    var p = A.prof(), bio = $("#prof .pad > p"); if (!bio) return;
    if (!document.getElementById("editprof")) bio.insertAdjacentHTML("afterend", '<button class="chip" id="editprof" style="margin-top:10px">Modifier mon profil</button>');
    document.getElementById("editprof").hidden = !p;
  }
  document.addEventListener("click", function (e) { if (e.target.closest("#editprof")) open("full", true); });
  var prev = A.onUser;
  A.onUser = function () {
    if (prev) prev();
    var p = A.prof(), b = document.getElementById("theme").previousElementSibling; AVC = {};
    if (b && p && p.avatar_url) { b.style.background = "url(" + p.avatar_url + ") center/cover"; b.textContent = ""; } else if (b) b.style.background = "";
    setTimeout(extras, 350); setTimeout(enhance, 300); ageCheck();
  };
})();
