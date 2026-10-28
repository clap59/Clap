// Remplace les données de démo : vrai fil, vraies listes, vrai profil.
(function () {
  var A = CLAP_API, sb = A.sb, IMG = "https://image.tmdb.org/t/p/w185/".slice(0, -1), BIG = "https://image.tmdb.org/t/p/w500";
  var $ = function (s) { return document.querySelector(s); };
  var BACK = '<button class="back" aria-label="Retour">←</button>';
  var st = $("#stories"); if (st) st.remove();
  var po = function (i) { return '<button class="po" data-id="' + i.tmdb_id + '" title="' + esc(i.title) + '" style="--g:' + (i.poster_path ? "url(" + IMG + i.poster_path + ") center/cover" : "var(--line)") + '"><span>' + (i.poster_path ? "" : esc(i.title)) + '</span></button>'; };
  var cnt = function (l) { return l.items.length + " film" + (l.items.length > 1 ? "s" : ""); };
  function cv(l) { var c = ""; for (var k = 0; k < 4; k++) { var i = l.items[k]; c += '<i style="--g:' + (i && i.poster_path ? "url(" + IMG + i.poster_path + ") center/cover" : "var(--line)") + '"></i>'; } return '<div class="cov">' + c + '</div>'; }
  function norm(l) { return { id: l.id, name: l.name, items: (l.list_items || []).sort(function (a, b) { return a.added_at < b.added_at ? 1 : -1; }) }; }

  // ================= FIL
  var f2 = feed.cloneNode(false); feed.replaceWith(f2); feed = f2; // retire les anciens clics de démo
  var data = [];
  function card(r, k) {
    var u = r.profiles.username, me = A.me(), liked = me && r.likes.some(function (l) { return l.user_id === me.id; });
    var bg = r.poster_path ? "url(" + BIG + r.poster_path + ") center/cover" : "linear-gradient(160deg,#6c757d,#212529)";
    return '<article class="card" data-k="' + k + '" style="--g:' + bg + '"><div class="perf"></div><div class="perf r"></div>' +
      (r.poster_path ? "" : '<div class="big">' + esc(r.title).toUpperCase() + '</div>') + '<div class="pop">♥</div>' +
      '<div class="meta"><div class="who"><div class="av" style="--c:' + A.col(u) + '">' + ini(u) + '</div><button class="un" data-u="' + esc(u) + '">' + esc(u) + '</button>' +
      '<button class="open" style="margin-left:auto;font-size:13px;background:rgba(255,255,255,.18);padding:4px 10px;border-radius:99px;backdrop-filter:blur(6px)">' + esc(r.title) + ' ›</button></div>' +
      '<div class="stars">' + stars(Number(r.rating)) + '</div>' + (r.body ? more(esc(r.body), "txt") : "") + '</div>' +
      '<div class="rail"><button class="act like' + (liked ? " on" : "") + '"><b>♥</b><span>' + r.likes.length + '</span></button>' +
      '<button class="act cmt"><b>💬</b><span>' + r.replies.length + '</span></button><button class="act sv"><b>🔖</b><span>Liste</span></button><button class="act sh"><b>↗</b><span>Partager</span></button></div></article>';
  }
  async function loadFeed() {
    var r = await sb.from("reviews").select("id,tmdb_id,title,poster_path,rating,body,created_at,profiles!reviews_user_id_fkey(username),likes(user_id),replies(id)").order("created_at", { ascending: false }).limit(30);
    if (r.error) { f2.innerHTML = '<div class="pad"><p>Impossible de charger le fil.<br><small>Détail : ' + esc(r.error.message) + '</small></p></div>'; return; }
    data = r.data;
    f2.innerHTML = data.length ? data.map(card).join("") : '<div class="pad"><h2>Le fil est vide</h2><p style="color:var(--muted)">Sois la première personne à critiquer un film sur Clap.</p><button class="btn main" id="feedw" style="width:100%;margin-top:12px">Écrire une critique</button></div>';
  }
  async function like(c, r) {
    var me = A.me(); if (!me) return A.showAuth("in", "Connecte-toi pour liker.");
    var b = c.querySelector(".like"), on = b.classList.contains("on");
    var x = await (on ? sb.from("likes").delete().eq("review_id", r.id).eq("user_id", me.id) : sb.from("likes").insert({ review_id: r.id }));
    if (x.error) return toast("Oups, réessaie.");
    b.classList.toggle("on", !on);
    r.likes = on ? r.likes.filter(function (l) { return l.user_id !== me.id; }) : r.likes.concat({ user_id: me.id });
    b.querySelector("span").textContent = r.likes.length;
  }
  f2.addEventListener("click", function (e) {
    if (e.target.closest("#feedw")) return openCompose();
    var c = e.target.closest(".card"); if (!c) return;
    var r = data[c.dataset.k];
    if (e.target.closest(".open")) return openFilm(r.tmdb_id);
    var a = e.target.closest(".act");
    if (a) {
      if (a.classList.contains("like")) return like(c, r);
      if (a.classList.contains("cmt")) return openFilm(r.tmdb_id);
      if (a.classList.contains("sv")) return showAdd("", { tmdb_id: r.tmdb_id, title: r.title, poster_path: r.poster_path });
      var url = location.origin, txt = "Ma critique de " + r.title + " sur Clap";
      if (navigator.share) navigator.share({ title: r.title, text: txt, url: url }).catch(function () {});
      else if (navigator.clipboard) navigator.clipboard.writeText(url).then(function () { toast("Lien copié"); });
      return;
    }
    if (e.target.closest(".un,.mo")) return;
    var now = Date.now();
    if (c._t && now - c._t < 320) {
      if (!c.querySelector(".like.on")) like(c, r);
      var p = c.querySelector(".pop"); p.classList.remove("go"); void p.offsetWidth; p.classList.add("go");
    }
    c._t = now;
  });
  $('.tab[data-v="feed"]').addEventListener("click", loadFeed);

  // ================= LISTES
  var myLists = [], cur = null;
  var ls2 = ls.cloneNode(false); ls.replaceWith(ls2); ls = ls2;
  var ll = document.getElementById("lists"), ll2 = ll.cloneNode(false); ll.replaceWith(ll2);
  async function loadMyLists() {
    var me = A.me();
    if (!me) { myLists = []; return paintLists(); }
    var r = await sb.from("lists").select("id,name,list_items(tmdb_id,title,poster_path,added_at)").eq("user_id", me.id).order("created_at");
    myLists = (r.data || []).map(norm); paintLists();
  }
  window.paintLists = function () {
    var el = document.getElementById("lists"); if (!el) return;
    el.innerHTML = myLists.map(function (l, k) { return '<div class="lrow" data-k="' + k + '">' + cv(l) + '<div><b>' + esc(l.name) + '</b><br><small>' + cnt(l) + '</small></div></div>'; }).join("") +
      '<button class="lrow" data-new="1"><span class="cov plus2">+</span><b>Nouvelle liste</b></button>';
  };
  function renderSheet() {
    ls.innerHTML = '<h3>' + (cur ? "Ajouter à une liste" : "Nouvelle liste") + '</h3>' +
      (cur ? myLists.map(function (l, k) { var on = l.items.some(function (i) { return i.tmdb_id === cur.tmdb_id; }); return '<button class="lrow' + (on ? " on" : "") + '" data-add="' + k + '">' + cv(l) + '<div><b>' + esc(l.name) + '</b><br><small>' + cnt(l) + '</small></div><span class="ck">' + (on ? "✓" : "+") + '</span></button>'; }).join("") : "") +
      '<div class="nl"><input id="nln" maxlength="40" placeholder="Nom de la liste, ex : Soirée pop-corn"><button class="btn main" data-mk="1">Créer</button></div><button class="chip" data-x="1" style="margin-top:10px">Terminer</button>';
  }
  window.showAdd = function (t, item) {
    if (!A.me()) return A.showAuth("in", "Connecte-toi pour créer des listes.");
    cur = item || (t ? { tmdb_id: fEl._id, title: fEl._t, poster_path: fEl._p } : null);
    renderSheet(); ls.classList.add("open");
  };
  ls.addEventListener("click", async function (e) {
    if (e.target.closest("[data-x]")) return ls.classList.remove("open");
    var a = e.target.closest("[data-add]"), m = e.target.closest("[data-mk]");
    if (a) {
      var l = myLists[a.dataset.add], has = l.items.some(function (i) { return i.tmdb_id === cur.tmdb_id; });
      var r = await (has ? sb.from("list_items").delete().eq("list_id", l.id).eq("tmdb_id", cur.tmdb_id) : sb.from("list_items").insert({ list_id: l.id, tmdb_id: cur.tmdb_id, title: cur.title, poster_path: cur.poster_path || null }));
      if (r.error) return toast("Oups, réessaie.");
      toast(has ? "Retiré de « " + l.name + " »" : "Ajouté à « " + l.name + " »");
      await loadMyLists(); renderSheet(); return;
    }
    if (m) {
      var n = document.getElementById("nln").value.trim(); if (!n) return toast("Donne un nom à ta liste");
      var c = await sb.from("lists").insert({ name: n }).select("id").single(); if (c.error) return toast("Oups, réessaie.");
      if (cur) await sb.from("list_items").insert({ list_id: c.data.id, tmdb_id: cur.tmdb_id, title: cur.title, poster_path: cur.poster_path || null });
      toast("Liste « " + n + " » créée"); await loadMyLists();
      if (cur) renderSheet(); else ls.classList.remove("open");
    }
  });
  document.getElementById("lists").addEventListener("click", function (e) {
    var r = e.target.closest(".lrow"); if (!r) return;
    if (r.dataset.new) return showAdd("");
    openList(myLists[r.dataset.k].id);
  });
  async function openList(id) {
    var pub = document.getElementById("pub"); pub.scrollTop = 0; pub.classList.add("open");
    pub.innerHTML = BACK + '<div class="pad" style="padding-top:70px"><p style="color:var(--muted)">Chargement…</p></div>';
    var r = await sb.from("lists").select("id,name,user_id,profiles!lists_user_id_fkey(username),list_items(tmdb_id,title,poster_path,added_at)").eq("id", id).maybeSingle();
    if (!r.data) { pub.innerHTML = BACK + '<div class="pad" style="padding-top:70px"><p>Liste introuvable.<br><small>' + esc(r.error ? r.error.message : "") + '</small></p></div>'; return; }
    var l = norm(r.data), u = r.data.profiles.username, me = A.me(), mine = me && me.id === r.data.user_id;
    pub.innerHTML = BACK + '<div class="pad" style="padding-top:70px"><h2 style="margin:0">' + esc(l.name) + '</h2><p style="color:var(--muted)">Par <button class="un" data-u="' + esc(u) + '">' + esc(u) + '</button> – ' + cnt(l) + '</p>' +
      (mine ? '<button class="chip" data-del="' + l.id + '">Supprimer la liste</button>' : "") +
      '<div class="grid" style="margin-top:12px">' + l.items.map(po).join("") + '</div>' +
      (l.items.length ? "" : '<p style="color:var(--muted)">Cette liste est vide. Ajoute des films avec « ＋ Liste » sur une fiche film.</p>') + '</div>';
  }
  async function paintUser(uid) {
    var r = await sb.from("lists").select("id,name,list_items(tmdb_id,title,poster_path,added_at)").eq("user_id", uid).order("created_at");
    var arr = (r.data || []).map(norm), el = document.getElementById("ulists"); if (!arr.length || !el) return;
    el.innerHTML = "<h2>Listes</h2>" + arr.map(function (l) { return '<div class="lrow" data-lid="' + l.id + '">' + cv(l) + '<div><b>' + esc(l.name) + '</b><br><small>' + cnt(l) + '</small></div></div>'; }).join("");
  }
  window.CLAP_LISTS = { paintUser: paintUser };
  document.addEventListener("click", async function (e) {
    var lr = e.target.closest("#ulists .lrow"); if (lr) return openList(+lr.dataset.lid);
    var p = e.target.closest("#pub .po[data-id]"); if (p) { document.getElementById("pub").classList.remove("open"); return openFilm(Number(p.dataset.id)); }
    var d = e.target.closest("[data-del]");
    if (d && confirm("Supprimer cette liste ?")) {
      var r = await sb.from("lists").delete().eq("id", d.dataset.del); if (r.error) return toast("Oups, réessaie.");
      document.getElementById("pub").classList.remove("open"); toast("Liste supprimée"); loadMyLists();
    }
    if (e.target.closest("#proflogin")) A.showAuth("in");
  });

  // ================= PROFIL
  var fv = document.getElementById("favs"), fv2 = fv.cloneNode(false); fv.replaceWith(fv2);
  fv2.addEventListener("click", function (e) { var p = e.target.closest(".po[data-id]"); if (p) openFilm(Number(p.dataset.id)); });
  async function refreshProfile() {
    var me = A.me(), p = A.prof(), nums = $("#prof .nums"), ticket = $("#prof .ticket"), h = $("#prof h2"), av = $("#prof .av"), bio = $("#prof .pad > p");
    nums.hidden = ticket.hidden = !p;
    if (!p) {
      h.textContent = "Bienvenue sur Clap"; av.textContent = "🎬"; av.style.setProperty("--c", "var(--accent)");
      bio.textContent = "Connecte-toi pour retrouver tes critiques, tes listes et tes abonnés.";
      if (!$("#proflogin")) bio.insertAdjacentHTML("afterend", '<button class="btn main" id="proflogin" style="margin-top:12px;width:100%">Se connecter</button>');
      $("#proflogin").hidden = false; fv2.innerHTML = '<p style="grid-column:1/-1;color:var(--muted)">Tes films les mieux notés apparaîtront ici.</p>'; return;
    }
    if ($("#proflogin")) $("#proflogin").hidden = true;
    var res = await Promise.all([
      sb.from("follows").select("*", { count: "exact", head: true }).eq("followed_id", me.id),
      sb.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", me.id),
      sb.from("reviews").select("tmdb_id,title,poster_path,rating,created_at").eq("user_id", me.id).order("rating", { ascending: false }).order("created_at", { ascending: false }).limit(200)
    ]);
    var rv = res[2].data || [], avg = rv.length ? (rv.reduce(function (s, x) { return s + Number(x.rating); }, 0) / rv.length).toFixed(1).replace(".", ",") : "";
    nums.innerHTML = '<div><b>' + (res[0].count || 0) + '</b>abonnés</div><div><b>' + (res[1].count || 0) + '</b>abonnements</div><div><b>' + rv.length + '</b>critiques</div>';
    ticket.innerHTML = '<div><em>Ma carte cinéphile</em><strong>@' + esc(p.username) + '</strong><em>' + (avg ? "Note moyenne " + avg + " ★" : "Aucune critique pour l’instant") + '</em></div><div><em>Critiques</em><strong>' + rv.length + '</strong></div>';
    fv2.innerHTML = rv.slice(0, 4).map(po).join("") || '<p style="grid-column:1/-1;color:var(--muted)">Tes films les mieux notés apparaîtront ici.</p>';
  }

  // ================= Branchements
  var prev = A.onUser;
  A.onUser = function () { if (prev) prev(); loadFeed(); loadMyLists(); refreshProfile(); };
  A.onPublish = function () { loadFeed(); refreshProfile(); };
  f2.innerHTML = '<div class="pad"><p style="color:var(--muted)">Chargement…</p></div>';
  refreshProfile();
})();
