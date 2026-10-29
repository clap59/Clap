// Comptes + critiques, likes et réponses enregistrés dans Supabase.
(function () {
  var sb = window.supabase.createClient(CLAP.url, CLAP.key), me = null, prof = null;
  var $ = function (s) { return document.querySelector(s); };
  var val = function (id) { return document.getElementById(id).value.trim(); };
  function col(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360; return "hsl(" + h + ",55%,40%)"; }
  function tr(m) {
    if (/Invalid login/i.test(m)) return "Email ou mot de passe incorrect.";
    if (/already registered/i.test(m)) return "Cet email a déjà un compte.";
    if (/Database error/i.test(m)) return "Ce pseudo est déjà pris ou invalide.";
    if (/at least 6/i.test(m)) return "Le mot de passe doit faire 6 caractères minimum.";
    return m;
  }
  var st = document.createElement("style");
  st.textContent = ".compose [data-p],#pp{display:none!important}.rv p{white-space:pre-line}";
  document.head.appendChild(st);

  var au = document.createElement("div"); au.className = "sheet"; au.id = "auth"; $(".app").appendChild(au);
  var btn = document.createElement("button"); btn.className = "ico"; btn.textContent = "👤";
  btn.setAttribute("aria-label", "Compte"); btn.style.cssText = "margin-left:auto;margin-right:8px";
  document.getElementById("theme").before(btn);

  function showAuth(mode, msg) {
    var up = mode === "up";
    au.innerHTML = '<h3>' + (up ? "Créer un compte" : "Connexion") + '</h3>' + (msg ? '<p style="color:var(--accent);margin:6px 0">' + esc(msg) + '</p>' : '') +
      (up ? '<input class="srch" id="a-u" placeholder="Pseudo (3 à 20 caractères)" maxlength="20" autocomplete="username">' : '') +
      '<input class="srch" id="a-e" type="email" placeholder="Email" autocomplete="email">' +
      '<input class="srch" id="a-p" type="password" placeholder="Mot de passe (6 caractères minimum)" autocomplete="' + (up ? "new" : "current") + '-password">' +
      '<button class="btn main" data-go="' + mode + '" style="width:100%">' + (up ? "Créer mon compte" : "Se connecter") + '</button>' +
      '<div style="margin-top:10px"><button class="chip" data-sw="' + (up ? "in" : "up") + '">' + (up ? "J’ai déjà un compte" : "Créer un compte") + '</button> <button class="chip" data-x="1">Fermer</button></div>';
    au.classList.add("open");
  }
  function showAcc() {
    au.innerHTML = '<h3>@' + esc(prof ? prof.username : "") + '</h3><p style="color:var(--muted);margin-bottom:12px">Tu es connecté·e.</p><button class="btn" data-out="1" style="width:100%">Se déconnecter</button><div style="margin-top:10px"><button class="chip" data-x="1">Fermer</button></div>';
    au.classList.add("open");
  }
  btn.addEventListener("click", function () { me ? showAcc() : showAuth("in"); });
  au.addEventListener("click", async function (e) {
    var t = e.target.closest("[data-go],[data-sw],[data-x],[data-out]"); if (!t) return;
    if (t.dataset.x) return au.classList.remove("open");
    if (t.dataset.sw) return showAuth(t.dataset.sw);
    if (t.dataset.out) { await sb.auth.signOut(); return au.classList.remove("open"); }
    var em = val("a-e"), pw = val("a-p");
    if (t.dataset.go === "up") {
      var u = val("a-u"); if (u.length < 3) return showAuth("up", "Choisis un pseudo d’au moins 3 caractères.");
      var r = await sb.auth.signUp({ email: em, password: pw, options: { data: { username: u } } });
      if (r.error) return showAuth("up", tr(r.error.message));
      if (!r.data.session) return showAuth("in", "Compte créé ! Confirme ton email, puis connecte-toi.");
    } else {
      var r2 = await sb.auth.signInWithPassword({ email: em, password: pw });
      if (r2.error) return showAuth("in", tr(r2.error.message));
    }
    au.classList.remove("open"); toast("Bienvenue sur Clap 🎬");
  });

  async function setUser(s) {
    me = s ? s.user : null; prof = null;
    if (me) {
      var FS = ["username,avatar_url,bio,fav_films,onboarded", "username,avatar_url,bio,onboarded", "username"], r; // essaie de la plus complète à la plus simple (anciennes bases)
      for (var i = 0; i < FS.length; i++) { r = await sb.from("profiles").select(FS[i]).eq("id", me.id).single(); if (!r.error) break; }
      prof = r.data;
    }
    btn.textContent = prof ? ini(prof.username) : "👤";
    if (window.CLAP_API && CLAP_API.onUser) CLAP_API.onUser();
    var h = $("#prof h2"), av = $("#prof .av"), nb = document.querySelectorAll("#prof .nums b");
    if (prof) {
      h.textContent = prof.username; av.textContent = prof.avatar_url ? "" : ini(prof.username); av.style.setProperty("--c", col(prof.username)); av.style.background = prof.avatar_url ? "url(" + prof.avatar_url + ") center/cover" : "";
      $("#prof .pad > p").textContent = prof.bio || "Membre de Clap";
      var c = await sb.from("reviews").select("id", { count: "exact", head: true }).eq("user_id", me.id);
      nb[2].textContent = c.count || 0;
    }
  }
  sb.auth.getSession().then(function (r) { setUser(r.data.session); });
  sb.auth.onAuthStateChange(function (_e, s) { setTimeout(function () { setUser(s); }, 0); });

  // ---- Critiques de la page film (lues dans la base)
  function rv(r) {
    var u = r.profiles.username, liked = me && r.likes.some(function (l) { return l.user_id === me.id; });
    var reps = r.replies.slice().sort(function (a, b) { return a.created_at < b.created_at ? -1 : 1; });
    return '<div class="rv"><div class="who"><div class="av" style="--c:' + col(u) + ';color:#fff">' + ini(u) + '</div><button class="un" data-u="' + esc(u) + '">' + esc(u) + '</button></div><div class="stars">' + stars(Number(r.rating)) + '</div>' +
      (r.body ? more(esc(r.body), "") : "") +
      '<div class="rx"><button class="xl' + (liked ? " on" : "") + '" data-i="' + r.id + '">♥ ' + r.likes.length + '</button><button class="xr" data-i="' + r.id + '">💬 ' + reps.length + ' Répondre</button></div>' +
      reps.map(function (p) { return '<div class="rp"><div class="av" style="--c:' + col(p.profiles.username) + '">' + ini(p.profiles.username) + '</div><div><button class="un" data-u="' + esc(p.profiles.username) + '">' + esc(p.profiles.username) + '</button><br>' + esc(p.body) + '</div></div>'; }).join("") +
      '<div class="rf" id="xf' + r.id + '"><input maxlength="500" placeholder="Répondre à ' + esc(u) + '…"><button class="xs" data-i="' + r.id + '">Envoyer</button></div></div>';
  }
  window.paintRv = async function () {
    var el = document.getElementById("rvs"), id = fEl._id; if (!el || !id) return;
    var r = await sb.from("reviews").select("id,rating,body,created_at,user_id,profiles!reviews_user_id_fkey(username),likes(user_id),replies(id,body,created_at,profiles(username))").eq("tmdb_id", id).order("created_at", { ascending: false });
    if (fEl._id !== id) return;
    if (r.error) { console.error(r.error); el.innerHTML = '<p style="color:var(--muted)">Impossible de charger les critiques.<br><small>Détail : ' + esc(r.error.message || "") + ' ' + esc(r.error.hint || "") + '</small></p>'; return; }
    el.innerHTML = r.data.length ? r.data.map(rv).join("") : '<p style="color:var(--muted)">Aucune critique pour l’instant. Sois la première personne à donner ton avis.</p>';
  };
  fEl.addEventListener("click", async function (e) {
    var el = e.target.closest(".xl,.xr,.xs"); if (!el) return;
    var id = +el.dataset.i;
    if (el.classList.contains("xr")) { var f = document.getElementById("xf" + id); f.classList.toggle("open"); if (f.classList.contains("open")) f.firstChild.focus(); return; }
    if (!me) return showAuth("in", "Connecte-toi pour participer.");
    if (el.classList.contains("xl")) {
      var r = await (el.classList.contains("on") ? sb.from("likes").delete().eq("review_id", id).eq("user_id", me.id) : sb.from("likes").insert({ review_id: id }));
      if (r.error) return toast("Oups, réessaie.");
    } else {
      var v = document.getElementById("xf" + id).firstChild.value.trim(); if (!v) return toast("Écris ta réponse");
      var r2 = await sb.from("replies").insert({ review_id: id, body: v }); if (r2.error) return toast("Oups, réessaie.");
      toast("Réponse envoyée");
    }
    paintRv();
  });

  // ---- Publier une critique (capture : remplace l'ancien comportement de démo)
  cEl.addEventListener("click", async function (e) {
    if (!e.target.closest('[data-a="pub"]')) return;
    e.stopPropagation();
    if (!me) return showAuth("in", "Connecte-toi pour publier ta critique.");
    if (!cs.n) return toast("Choisis une note");
    var t = document.getElementById("cf").value, ent = all.filter(function (a) { return a[0] === t; })[0], id = ent && ent[2], pp = ent && ent[3];
    if (!id) {
      try { var s = await (await fetch("/api/search?q=" + encodeURIComponent(t))).json(); id = s.results[0].id; pp = s.results[0].poster_path; }
      catch (x) { return toast("Film introuvable"); }
    }
    var r = await sb.from("reviews").upsert({ tmdb_id: id, title: t, poster_path: pp || null, rating: cs.n, body: document.getElementById("ct").value.trim() }, { onConflict: "user_id,tmdb_id" });
    if (r.error) return toast("Publication impossible : " + r.error.message);
    cEl.classList.remove("open"); toast("Critique publiée 🎬"); window.openFilm(id); if (window.CLAP_API && CLAP_API.onPublish) CLAP_API.onPublish();
  }, true);
  window.CLAP_API = { sb: sb, me: function () { return me; }, prof: function () { return prof; }, showAuth: showAuth, col: col };
})();
