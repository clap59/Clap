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
  g.innerHTML = '<div class="g-bg" id="g-bg"></div><div class="g-shade"></div><div class="g-main"><div class="g-logo"><i></i>CLAP</div><p class="g-tag">Le réseau social des cinéphiles</p><div id="g-view"></div></div>';
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
  function show(name, m) { if (!T[name]) return; view = name; g.hidden = false; V.innerHTML = T[name](m); if (name === "up" || name === "reset") check(); }
  var val = function (id) { var e = document.getElementById(id); return e ? e.value.trim() : ""; };
  function msg(t, ok) { var m = $("#g-m"); if (m) { m.textContent = t; m.className = "g-msg " + (ok ? "ok" : "err"); } }
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
    g.hidden = true; view = "done"; var pre = document.getElementById("pre"); if (pre) pre.remove();
  }
  var prev = A.onUser;
  A.onUser = function () { if (prev) prev(); sync(); };
  sb.auth.onAuthStateChange(function (ev, s) { console.log("[clap auth]", ev, s ? "session" : "pas de session"); if (ev === "PASSWORD_RECOVERY") { recovering = true; setTimeout(sync, 0); } });
  if (recovering) show("reset");
  var qs = new URLSearchParams(location.search), hs = new URLSearchParams(location.hash.replace(/^#/, ""));
  var oerr = qs.get("error_description") || hs.get("error_description");
  if (oerr) { history.replaceState(null, "", location.pathname); show("in"); msg("Connexion Google impossible : " + oerr); }
  setTimeout(function () { if (view === "splash") show("land"); }, 6000);
})();
