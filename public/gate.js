// Porte d'entrée : il faut un compte pour accéder à Clap. Inscription, connexion, Google, mot de passe oublié.
(function () {
  var A = CLAP_API, sb = A.sb, IMG = "https://image.tmdb.org/t/p/w185";
  var recovering = !!window.__REC, view = "splash";
  var $ = function (s) { return document.querySelector(s); };
  var st = document.createElement("style");
  st.textContent = '#gate{position:fixed;inset:0;z-index:1000;background:#0f080b;color:#fff;overflow:hidden;font:400 15px/1.45 "DM Sans",system-ui,sans-serif}#gate[hidden]{display:none}' +
    '.g-bg{position:absolute;inset:-30%;display:flex;flex-direction:column;justify-content:center;gap:14px;transform:rotate(-12deg);filter:blur(2.5px) brightness(.5) saturate(1.15)}' +
    '.g-row{display:flex;gap:14px;width:max-content;animation:gl 80s linear infinite}.g-row:nth-child(even){animation-direction:reverse}.g-row:nth-child(3n){animation-duration:110s}' +
    '.g-row img{height:clamp(130px,21vh,220px);aspect-ratio:2/3;border-radius:12px;object-fit:cover;background:#2a1a20}@keyframes gl{to{transform:translateX(-50%)}}' +
    '.g-shade{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(15,8,11,.5),rgba(15,8,11,.12) 35%,rgba(15,8,11,.88))}' +
    '.g-main{position:relative;z-index:2;max-width:420px;height:100%;margin:0 auto;display:flex;flex-direction:column;padding:calc(env(safe-area-inset-top,0px) + 56px) 22px calc(env(safe-area-inset-bottom,0px) + 28px);overflow-y:auto}' +
    '.g-logo{display:flex;align-items:center;justify-content:center;gap:12px;font:400 64px/1 "Bebas Neue",Impact,sans-serif;letter-spacing:.05em}' +
    '.g-logo i{width:46px;height:36px;border-radius:5px;background:linear-gradient(135deg,#fff 0 38%,#ff4d5e 38% 50%,#fff 50% 62%,#ff4d5e 62% 74%,#fff 74%);transform:rotate(-8deg)}' +
    '.g-tag{text-align:center;opacity:.85;margin-top:8px}#g-view{margin-top:auto;padding-top:24px}' +
    '.g-card{background:rgba(15,8,11,.74);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border:1px solid rgba(255,255,255,.14);border-radius:22px;padding:20px}.g-card h2{margin:6px 0 4px}.g-card p{margin:6px 0}' +
    '.g-btn{display:block;width:100%;padding:15px;border-radius:14px;font-weight:700;font-size:16px;text-align:center;margin-top:12px}.g-btn.w{background:#fff;color:#111}.g-btn.o{border:2px solid rgba(255,255,255,.6);color:#fff}.g-btn.r{background:#ff4d5e;color:#fff}.g-btn:disabled{opacity:.4;cursor:not-allowed}' +
    '.g-btn.go{background:#fff;color:#222;display:flex;align-items:center;justify-content:center;gap:10px;margin-top:8px}' +
    '.g-in{width:100%;padding:14px;border-radius:12px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.08);color:#fff;font:inherit;font-size:16px;margin-top:10px}.g-in::placeholder{color:rgba(255,255,255,.55)}' +
    '.pw{position:relative}.pw .g-in{padding-right:50px}.eye{position:absolute;right:4px;top:10px;width:46px;height:50px;display:grid;place-items:center;color:rgba(255,255,255,.85)}' +
    '.g-or{display:flex;align-items:center;gap:10px;margin:14px 0 2px;opacity:.7;font-size:13px}.g-or::before,.g-or::after{content:"";flex:1;height:1px;background:rgba(255,255,255,.25)}' +
    '.g-rules{list-style:none;padding:0;margin:12px 0 0;font-size:13px}.g-rules li{padding:1px 0;color:#ff6b78}.g-rules li.ok{color:#5ee08a}' +
    '.g-bar{height:5px;border-radius:9px;background:rgba(255,255,255,.15);margin-top:10px;overflow:hidden}.g-bar b{display:block;height:100%;width:0;background:#ff4d5e;transition:width .25s,background .25s}' +
    '.g-msg{margin-top:10px;font-size:14px}.g-msg.err{color:#ff6b78}.g-msg.ok{color:#5ee08a}.g-link{color:#fff;text-decoration:underline;font-size:14px;opacity:.9}.g-sw{text-align:center;margin-top:14px}' +
    '@media (prefers-reduced-motion:reduce){.g-row{animation:none}}';
  document.head.appendChild(st);
  var g = document.createElement("div"); g.id = "gate";
  var LOGO = '<svg viewBox="0 0 64 64" role="img" aria-label="Clap"><defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff4d5e"/><stop offset="1" stop-color="#ff9f43"/></linearGradient><clipPath id="lc"><rect x="13" y="18" width="38" height="9" rx="2.5"/></clipPath></defs><path d="M16 2h32a14 14 0 0 1 14 14v22a14 14 0 0 1-14 14H30l-12 11V52h-2A14 14 0 0 1 2 38V16A14 14 0 0 1 16 2z" fill="url(#lg)"/><rect x="13" y="29" width="38" height="19" rx="3" fill="#fff"/><path d="M32 31.3L33.88 36.21L39.13 36.48L35.04 39.79L36.41 44.87L32 42L27.59 44.87L28.96 39.79L24.87 36.48L30.12 36.21z" fill="url(#lg)"/><g class="stick" style="transform-origin:13px 28px"><rect x="13" y="18" width="38" height="9" rx="2.5" fill="#fff"/><g clip-path="url(#lc)" fill="#1a0b10"><path d="M5 27h6l4-9H9zM17 27h6l4-9h-6zM29 27h6l4-9h-6zM41 27h6l4-9h-6z"/></g></g></svg>';
  g.innerHTML = '<div class="g-bg" id="g-bg"></div><div class="g-shade"></div><div class="g-blob b1"></div><div class="g-blob b2"></div><div class="g-grain"></div><div class="g-strip"></div><div class="g-strip r"></div><div class="g-main"><div class="g-logo">' + LOGO + '<span class="g-word" aria-label="CLAP"><span style="--i:0">C</span><span style="--i:1">L</span><span style="--i:2">A</span><span style="--i:3">P</span></span></div><p class="g-tag">Le réseau social des cinéphiles</p><p class="g-rot" id="g-rot"></p><div id="g-view"></div></div>';
  document.body.appendChild(g);
  var V = document.getElementById("g-view");

  // ---- Fond : lignes d'affiches en mouvement
  Promise.all([1, 2].map(function (p) { return fetch("/api/trending?page=" + p).then(function (r) { return r.json(); }).catch(function () { return {}; }); })).then(function (rs) {
    var ps = [].concat(rs[0].results || [], rs[1].results || []).filter(function (m) { return m.poster_path; }).map(function (m) { return IMG + m.poster_path; });
    if (ps.length < 10) return;
    var rows = "";
    for (var r = 0; r < 8; r++) {
      var o = (r * 5) % ps.length, s = ps.slice(o).concat(ps.slice(0, o)).slice(0, 20);
      var h = s.map(function (u) { return '<img src="' + u + '" alt="">'; }).join("");
      rows += '<div class="g-row">' + h + h + '</div>';
    }
    document.getElementById("g-bg").innerHTML = rows;
  });

  // ---- Briques
  var EYE = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
  var EYEOFF = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
  var GOOGLE = '<svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>';
  var gbtn = '<button class="g-btn go" data-google="1">' + GOOGLE + 'Continuer avec Google</button>';
  var pw = function (id, ph, ac) { return '<div class="pw"><input class="g-in" id="' + id + '" type="password" placeholder="' + ph + '" autocomplete="' + ac + '"><button type="button" class="eye" data-eye="' + id + '" aria-label="Afficher ou masquer le mot de passe">' + EYE + '</button></div>'; };
  var card = function (h) { return '<div class="g-card">' + h + '</div>'; };
  var back = '<button class="g-link" data-go="land">← Retour</button>';
  var rulesBox = '<ul class="g-rules" id="g-r"></ul><div class="g-bar"><b id="g-b"></b></div>';
  var T = {
    splash: function () { return ""; },
    land: function () { return '<button class="g-btn w" data-go="up">S’inscrire</button><button class="g-btn o" data-go="in">Connexion</button>'; },
    "in": function () { return card(back + '<h2>Connexion</h2>' + gbtn + '<div class="g-or">ou</div><input class="g-in" id="g-e" type="email" placeholder="Email" autocomplete="email">' + pw("g-p", "Mot de passe", "current-password") + '<div style="text-align:right;margin-top:10px"><button class="g-link" data-go="forgot">Mot de passe oublié ?</button></div><div class="g-msg err" id="g-m"></div><button class="g-btn r" data-do="in">Se connecter</button><p class="g-sw">Pas encore de compte ? <button class="g-link" data-go="up">S’inscrire</button></p>'); },
    up: function () { return card(back + '<h2>Créer un compte</h2>' + gbtn + '<div class="g-or">ou</div><input class="g-in" id="g-e" type="email" placeholder="Email" autocomplete="email"><input class="g-in" id="g-u" placeholder="Pseudo (3 à 20 : lettres, chiffres, _ . -)" maxlength="20" autocomplete="username">' + pw("g-p", "Mot de passe", "new-password") + rulesBox + '<div class="g-msg err" id="g-m"></div><button class="g-btn r" id="g-s" data-do="up" disabled>Créer mon compte</button><p class="g-sw">Déjà un compte ? <button class="g-link" data-go="in">Connexion</button></p>'); },
    forgot: function () { return card('<button class="g-link" data-go="in">← Retour</button><h2>Mot de passe oublié</h2><p>Entre ton email, on t’envoie un lien pour en choisir un nouveau.</p><input class="g-in" id="g-e" type="email" placeholder="Email" autocomplete="email"><div class="g-msg err" id="g-m"></div><button class="g-btn r" data-do="forgot">Envoyer le lien</button>'); },
    sent: function (m) { return card('<h2>C’est envoyé</h2><p>' + m + '</p><button class="g-btn w" data-go="in">Retour à la connexion</button>'); },
    reset: function () { return card('<h2>Nouveau mot de passe</h2><p>Choisis un mot de passe solide.</p>' + pw("g-p", "Nouveau mot de passe", "new-password") + rulesBox + '<div class="g-msg err" id="g-m"></div><button class="g-btn r" id="g-s" data-do="reset" disabled>Enregistrer</button>'); },
    pseudo: function () { return card('<h2>Dernière étape</h2><p>Choisis ton pseudo, il sera visible par les autres.</p><input class="g-in" id="g-u" placeholder="Pseudo (3 à 20 : lettres, chiffres, _ . -)" maxlength="20" autocomplete="username"><div class="g-msg err" id="g-m"></div><button class="g-btn r" data-do="pseudo">Continuer</button>'); }
  };
  function show(name, m) { if (!T[name]) return; view = name; g.hidden = false; g.classList.remove("out"); V.innerHTML = T[name](m); if (name === "up" || name === "reset") check(); }
  var val = function (id) { var e = document.getElementById(id); return e ? e.value.trim() : ""; };
  function msg(t, ok) { var m = $("#g-m"); if (m) { m.textContent = t; m.className = "g-msg " + (ok ? "ok" : "err"); if (!ok) { void m.offsetWidth; m.classList.add("shake"); } } }
  function tr(m) {
    if (/Invalid login/i.test(m)) return "Email ou mot de passe incorrect.";
    if (/already registered/i.test(m)) return "Cet email a déjà un compte.";
    if (/Database error/i.test(m)) return "Ce pseudo est déjà pris.";
    if (/not confirmed/i.test(m)) return "Confirme d’abord ton email avec le lien que tu as reçu.";
    if (/rate limit|too many/i.test(m)) return "Trop de tentatives, réessaie dans un moment.";
    if (/different from the old/i.test(m)) return "Choisis un mot de passe différent de l’ancien.";
    if (/at least|weak|password/i.test(m)) return "Ce mot de passe n’est pas assez solide.";
    return m;
  }

  // ---- Mot de passe robuste : indicateurs rouges / verts
  function rules() {
    var p = (document.getElementById("g-p") || {}).value || "", u = val("g-u").toLowerCase(), em = val("g-e").split("@")[0].toLowerCase(), lp = p.toLowerCase();
    var R = [["12 caractères minimum", p.length >= 12], ["Une majuscule", /[A-Z]/.test(p)], ["Une minuscule", /[a-z]/.test(p)], ["Un chiffre", /\d/.test(p)],
      ["Un symbole (! ? # @ …)", /[^A-Za-z0-9\s]/.test(p)], ["Aucun espace", p.length > 0 && !/\s/.test(p)],
      ["Ne contient pas ton pseudo ni ton email", p.length > 0 && !((u.length >= 3 && lp.indexOf(u) > -1) || (em.length >= 3 && lp.indexOf(em) > -1))],
      ["Pas un mot de passe courant", p.length > 0 && !/password|motdepasse|azerty|qwerty|123456|letmein|clap/i.test(p)]];
    $("#g-r").innerHTML = R.map(function (x) { return '<li class="' + (x[1] ? "ok" : "") + '">' + (x[1] ? "✓ " : "✗ ") + x[0] + '</li>'; }).join("");
    var n = R.filter(function (x) { return x[1]; }).length, b = $("#g-b");
    b.style.width = (n / R.length * 100) + "%"; b.style.background = n < 5 ? "#ff4d5e" : n < R.length ? "#ffb703" : "#5ee08a";
    return n === R.length;
  }
  var okPseudo = function (u) { return /^[A-Za-z0-9_.-]{3,20}$/.test(u); };
  var okMail = function (e) { return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e); };
  function check() { var ok = rules(); if (view === "up") ok = ok && okMail(val("g-e")) && okPseudo(val("g-u")); $("#g-s").disabled = !ok; }

  // ---- Actions
  var busy = function (b) { V.querySelectorAll("[data-do]").forEach(function (x) { x.disabled = b; }); };
  async function doIn() {
    var e = val("g-e"), p = document.getElementById("g-p").value;
    if (!e || !p) return msg("Renseigne ton email et ton mot de passe.");
    busy(true); var r = await sb.auth.signInWithPassword({ email: e, password: p }); busy(false);
    if (r.error) msg(tr(r.error.message));
  }
  async function doUp() {
    var e = val("g-e"), u = val("g-u"), p = document.getElementById("g-p").value;
    if (!rules() || !okMail(e) || !okPseudo(u)) return;
    busy(true);
    var r = await sb.auth.signUp({ email: e, password: p, options: { data: { username: u }, emailRedirectTo: location.origin } });
    if (r.error) { busy(false); check(); return msg(tr(r.error.message)); }
    if (!r.data.session) show("sent", "Compte créé ! Clique sur le lien dans le mail que tu viens de recevoir, puis connecte-toi.");
  }
  async function doForgot() {
    var e = val("g-e"); if (!okMail(e)) return msg("Entre une adresse email valide.");
    busy(true); var r = await sb.auth.resetPasswordForEmail(e, { redirectTo: location.origin }); busy(false);
    if (r.error) return msg(tr(r.error.message));
    show("sent", "Si un compte existe avec cette adresse, un mail avec un lien pour choisir un nouveau mot de passe vient de partir. Regarde aussi tes spams.");
  }
  async function doReset() {
    if (!rules()) return; busy(true);
    var r = await sb.auth.updateUser({ password: document.getElementById("g-p").value });
    if (r.error) { busy(false); check(); return msg(tr(r.error.message)); }
    recovering = false; history.replaceState(null, "", location.pathname); toast("Mot de passe modifié 🎬"); sync();
  }
  async function doPseudo() {
    var u = val("g-u"); if (!okPseudo(u)) return msg("3 à 20 caractères : lettres, chiffres, _ . -");
    busy(true); var r = await sb.from("profiles").update({ username: u }).eq("id", A.me().id);
    if (r.error) { busy(false); return msg(/duplicate|unique/i.test(r.error.message) ? "Ce pseudo est déjà pris." : r.error.message); }
    location.reload();
  }
  var DO = { "in": doIn, up: doUp, forgot: doForgot, reset: doReset, pseudo: doPseudo };
  V.addEventListener("click", function (e) {
    var b = e.target.closest("[data-go],[data-eye],[data-do],[data-google]"); if (!b) return;
    if (b.dataset.go) return show(b.dataset.go);
    if (b.dataset.eye) { var i = document.getElementById(b.dataset.eye), s = i.type === "password"; i.type = s ? "text" : "password"; b.innerHTML = s ? EYEOFF : EYE; return; }
    if (b.dataset.google) return sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo: location.origin } }).then(function (r) { if (r.error) msg(tr(r.error.message)); });
    DO[b.dataset["do"]]();
  });
  V.addEventListener("input", function () { if (view === "up" || view === "reset") check(); });
  V.addEventListener("keydown", function (e) { if (e.key === "Enter") { var b = V.querySelector("[data-do]:not(:disabled)"); if (b) b.click(); } });

  // ---- Ouvrir ou fermer la porte selon la connexion
  function sync() {
    var me = A.me(), p = A.prof();
    if (recovering) { if (view !== "reset") show("reset"); return; }
    if (!me) { if (view === "splash" || view === "pseudo" || view === "done") show("land"); else g.hidden = false; return; }
    if (p && /^user[0-9a-f]{6}$/.test(p.username)) { if (view !== "pseudo") show("pseudo"); return; }
    view = "done"; var pre = document.getElementById("pre"); if (pre) pre.remove(); g.classList.add("out"); setTimeout(function () { if (view === "done") { g.hidden = true; g.classList.remove("out"); } }, 550);
  }
  var prev = A.onUser;
  A.onUser = function () { if (prev) prev(); sync(); };
  sb.auth.onAuthStateChange(function (ev, s) { console.log("[clap auth]", ev, s ? "session" : "pas de session"); if (ev === "PASSWORD_RECOVERY") { recovering = true; setTimeout(sync, 0); } });
  if (recovering) show("reset");
  var qs = new URLSearchParams(location.search), hs = new URLSearchParams(location.hash.replace(/^#/, ""));
  var oerr = qs.get("error_description") || hs.get("error_description");
  if (oerr) { history.replaceState(null, "", location.pathname); show("in"); msg("Connexion Google impossible : " + oerr); }
  setTimeout(function () { if (view === "splash") show("land"); }, 6000);
  var fx = document.createElement("style");
  fx.textContent = '\n#gate .g-blob{position:absolute;border-radius:50%;filter:blur(80px);opacity:.45;pointer-events:none;animation:blob 16s ease-in-out infinite alternate}\n#gate .b1{width:46vmax;height:46vmax;left:-14vmax;top:-12vmax;background:#ff4d5e}\n#gate .b2{width:40vmax;height:40vmax;right:-12vmax;bottom:-12vmax;background:#ffa63d;animation-duration:20s}\n@keyframes blob{to{transform:translate(8vmax,6vmax) scale(1.15)}}\n#gate .g-grain{position:absolute;inset:0;opacity:.14;pointer-events:none;mix-blend-mode:overlay;background:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'160\' height=\'160\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'.9\' numOctaves=\'2\'/%3E%3C/filter%3E%3Crect width=\'160\' height=\'160\' filter=\'url(%23n)\'/%3E%3C/svg%3E")}\n#gate .g-strip{position:absolute;top:0;bottom:0;left:10px;width:14px;z-index:1;opacity:.4;border-radius:4px;background:repeating-linear-gradient(to bottom,transparent 0 10px,rgba(255,255,255,.6) 10px 22px);background-size:100% 22px;animation:strip 5s linear infinite}\n#gate .g-strip.r{left:auto;right:10px;animation-direction:reverse}\n@keyframes strip{to{background-position:0 22px}}\n@media (max-width:480px){#gate .g-strip{left:5px;width:10px}#gate .g-strip.r{right:5px;left:auto}}\n#gate .g-bg{transition:translate .5s ease-out}\n#gate .g-logo{gap:14px}\n#gate .g-logo svg{width:68px;height:68px;filter:drop-shadow(0 8px 26px rgba(255,77,94,.6));animation:drop .9s cubic-bezier(.2,.9,.3,1.35) backwards,glow 4.5s ease-in-out 1.2s infinite}\n@keyframes drop{from{opacity:0;transform:translateY(-36px) scale(.5) rotate(-12deg)}}\n@keyframes glow{50%{filter:drop-shadow(0 8px 38px rgba(255,140,60,.85))}}\n#gate .stick{animation:clap 4.5s ease-in-out 1.2s infinite}\n@keyframes clap{0%,52%{transform:rotate(0)}62%,80%{transform:rotate(-26deg)}84%{transform:rotate(1deg)}87%{transform:rotate(-5deg)}90%,100%{transform:rotate(0)}}\n#gate .g-word{text-shadow:0 0 34px rgba(255,77,94,.55)}\n#gate .g-word span{display:inline-block;animation:rise .7s cubic-bezier(.2,.9,.3,1.2) backwards;animation-delay:calc(.3s + var(--i)*.09s)}\n@keyframes rise{from{opacity:0;transform:translateY(26px) rotate(8deg)}}\n#gate .g-tag{animation:gin .8s .8s backwards}\n#gate .g-rot{text-align:center;height:1.5em;margin-top:4px;color:#ffb3ba;font-weight:500;transition:opacity .4s,transform .4s;animation:gin .8s 1s backwards}\n#gate .g-rot.fade{opacity:0;transform:translateY(6px)}\n@keyframes gin{from{opacity:0;transform:translateY(18px) scale(.98)}}\n#g-view>*{animation:gin .5s cubic-bezier(.2,.8,.2,1) backwards}\n#g-view>.g-btn:nth-child(1){animation-delay:.1s}#g-view>.g-btn:nth-child(2){animation-delay:.2s}\n@property --a{syntax:"<angle>";inherits:false;initial-value:0deg}\n@keyframes spin{to{--a:360deg}}\n.g-card{position:relative;box-shadow:0 24px 70px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,255,255,.12)}\n.g-card::before{content:"";position:absolute;inset:-1px;border-radius:inherit;padding:1px;pointer-events:none;background:conic-gradient(from var(--a),transparent 0 68%,rgba(255,77,94,.95),rgba(255,166,61,.95),transparent);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask:linear-gradient(#000 0 0) content-box exclude,linear-gradient(#000 0 0);animation:spin 6s linear infinite}\n.g-in{transition:border-color .2s,box-shadow .2s,background .2s}\n.g-in:focus{outline:none;border-color:#ff4d5e;box-shadow:0 0 0 4px rgba(255,77,94,.25);background:rgba(255,255,255,.12)}\n.g-btn{position:relative;overflow:hidden;transition:transform .15s,box-shadow .2s,background .2s}\n.g-btn:not(:disabled):hover{transform:translateY(-2px)}.g-btn:not(:disabled):active{transform:scale(.97)}\n.g-btn.o:hover{background:rgba(255,255,255,.1)}\n.g-btn.r{background:linear-gradient(135deg,#ff4d5e,#ff8a3d);box-shadow:0 10px 30px rgba(255,77,94,.35)}.g-btn.w{box-shadow:0 10px 30px rgba(255,255,255,.12)}\n.g-btn.r::after,.g-btn.w::after{content:"";position:absolute;top:0;bottom:0;left:-60%;width:40%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.55),transparent);transform:skewX(-20deg);animation:shine 3.5s ease-in-out infinite;pointer-events:none}\n.g-btn:disabled::after{display:none}\n@keyframes shine{0%,55%{left:-60%}100%{left:130%}}\n.g-rules li{transition:color .25s}.g-rules li.ok{animation:okpop .35s}\n@keyframes okpop{40%{transform:translateX(4px)}}\n.g-msg.shake{animation:shake .4s}\n@keyframes shake{20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}}\n#gate{transition:opacity .5s,transform .5s}#gate.out{opacity:0;transform:scale(1.06);pointer-events:none}\n@media (prefers-reduced-motion:reduce){#gate *,#gate *::before,#gate *::after{animation:none!important;transition:none!important}}\n';
  document.head.appendChild(fx);
  var words = ["Note tes films", "Partage tes critiques", "Découvre ce que regardent tes amis", "Compose tes listes"], wi = 0, rot = document.getElementById("g-rot");
  rot.textContent = words[0];
  setInterval(function () { rot.classList.add("fade"); setTimeout(function () { wi = (wi + 1) % words.length; rot.textContent = words[wi]; rot.classList.remove("fade"); }, 420); }, 3200);
  document.addEventListener("pointermove", function (e) { if (g.hidden) return; document.getElementById("g-bg").style.translate = ((e.clientX / innerWidth - .5) * -24) + "px " + ((e.clientY / innerHeight - .5) * -24) + "px"; });

})();
