// Profils publics, abonnements et onglet Activité.
(function () {
  var A = CLAP_API, sb = A.sb, IMG = "https://image.tmdb.org/t/p/w185";
  var $ = function (s) { return document.querySelector(s); };
  var st = document.createElement("style");
  st.textContent = ".act-i{display:flex;gap:12px;padding:12px 0;border-top:1px solid var(--line);cursor:pointer;text-align:left}.act-i img,.act-i .nop{width:56px;height:84px;border-radius:8px;object-fit:cover;flex:none;background:var(--line)}.un{font:inherit;font-weight:700;color:inherit}.fw{background:var(--accent);color:#fff;border-radius:99px;padding:7px 16px;font-weight:700;font-size:13px;margin-top:4px}.fw.on{background:none;color:var(--text);border:1px solid var(--line)}.lrow .fw{margin:0}";
  document.head.appendChild(st);

  $(".views").insertAdjacentHTML("beforeend", '<section class="view" id="act" aria-label="Activité"></section>');
  var pub = document.createElement("section"); pub.className = "film"; pub.id = "pub"; $(".app").appendChild(pub);

  function ago(d) {
    var s = (Date.now() - new Date(d)) / 1000;
    if (s < 60) return "à l’instant"; if (s < 3600) return "il y a " + Math.floor(s / 60) + " min";
    if (s < 86400) return "il y a " + Math.floor(s / 3600) + " h"; if (s < 2592000) return "il y a " + Math.floor(s / 86400) + " j";
    return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  }
  function av(u, size) { return '<div class="av" style="--c:' + A.col(u) + ';color:#fff;width:' + size + 'px;height:' + size + 'px;font-size:' + Math.round(size * .36) + 'px;flex:none">' + ini(u) + '</div>'; }
  function item(r, u) {
    return '<div class="act-i" data-f="' + r.tmdb_id + '">' + (r.poster_path ? '<img src="' + IMG + r.poster_path + '" alt="">' : '<div class="nop"></div>') +
      '<div style="min-width:0;flex:1">' + (u ? '<div class="who" style="margin:0 0 4px">' + av(u, 26) + '<button class="un" data-u="' + esc(u) + '">' + esc(u) + '</button><small style="color:var(--muted);margin-left:auto">' + ago(r.created_at) + '</small></div>' : '<small style="color:var(--muted)">' + ago(r.created_at) + '</small><br>') +
      '<b>' + esc(r.title) + '</b><div class="stars">' + stars(Number(r.rating)) + '</div>' + (r.body ? more(esc(r.body), "") : "") + '</div></div>';
  }
  var cols = "id,tmdb_id,title,poster_path,rating,body,created_at";
  function bioHTML(u) { return (u.bio ? '<p style="margin:8px 0">' + esc(u.bio) + '</p>' : "") + (u.fav_title ? '<span class="chip">★ Film préféré : ' + esc(u.fav_title) + '</span>' : ""); }

  // ---- Onglet Activité (remplace « Séances », qui reviendra plus tard)
  var old = document.getElementById("seance"), tab = old.cloneNode(true);
  tab.removeAttribute("id"); tab.dataset.v = "act"; tab.innerHTML = "<span>🔔</span>Activité"; old.replaceWith(tab);
  tab.addEventListener("click", function () { show("act"); loadAct(); });

  async function loadAct() {
    var el = $("#act"), me = A.me();
    if (!me) { el.innerHTML = '<div class="pad"><h2>Activité</h2><p style="color:var(--muted)">Connecte-toi pour voir ce que postent les gens que tu suis.</p><button class="btn main" id="actlogin" style="margin-top:12px;width:100%">Se connecter</button></div>'; return; }
    el.innerHTML = '<div class="pad"><h2>Activité</h2><p style="color:var(--muted)">Chargement…</p></div>';
    var f = await sb.from("follows").select("followed_id").eq("follower_id", me.id);
    var ids = (f.data || []).map(function (x) { return x.followed_id; }), h = '<div class="pad"><h2>Activité</h2>';
    if (ids.length) {
      var r = await sb.from("reviews").select(cols + ",profiles!reviews_user_id_fkey(username)").in("user_id", ids).order("created_at", { ascending: false }).limit(30);
      h += (r.data && r.data.length) ? r.data.map(function (x) { return item(x, x.profiles.username); }).join("") : '<p style="color:var(--muted)">Tes abonnements n’ont encore rien posté.</p>';
    } else h += '<p style="color:var(--muted)">Tu ne suis personne pour l’instant. Commence par les membres ci-dessous.</p>';
    var s = await sb.from("profiles").select("id,username").neq("id", me.id).order("created_at", { ascending: false }).limit(12);
    var sug = (s.data || []).filter(function (p) { return ids.indexOf(p.id) < 0; });
    if (sug.length) h += '<h2>À suivre</h2>' + sug.map(function (p) {
      return '<div class="lrow">' + av(p.username, 40) + '<button class="un" data-u="' + esc(p.username) + '" style="margin-right:auto">' + esc(p.username) + '</button><button class="fw" data-fid="' + p.id + '">Suivre</button></div>';
    }).join("");
    el.innerHTML = h + '</div>';
  }

  // ---- Profil public
  async function openProfile(name) {
    try { await openProfile2(name); }
    catch (err) { console.error(err); pub.innerHTML = '<button class="back" aria-label="Retour">←</button><div class="pad" style="padding-top:70px"><p>Impossible de charger ce profil.<br><small>Détail : ' + esc(String(err && err.message || err)) + '</small></p></div>'; }
  }
  async function openProfile2(name) {
    pub._uid = null; pub.scrollTop = 0; pub.classList.add("open");
    pub.innerHTML = '<button class="back" aria-label="Retour">←</button><div class="pad" style="padding-top:70px"><p style="color:var(--muted)">Chargement…</p></div>';
    var p = await sb.from("profiles").select("id,username,created_at,avatar_url,bio,fav_title").eq("username", name).maybeSingle();
    if (p.error) p = await sb.from("profiles").select("id,username,created_at").eq("username", name).maybeSingle(); // avant la mise à jour de la base
    if (!p.data) { pub.innerHTML = '<button class="back" aria-label="Retour">←</button><div class="pad" style="padding-top:70px"><p>Ce profil est introuvable.<br><small>' + esc(p.error ? p.error.message : "") + '</small></p></div>'; return; }
    var u = p.data, me = A.me(); pub._uid = u.id;
    var res = await Promise.all([
      sb.from("reviews").select(cols).eq("user_id", u.id).order("created_at", { ascending: false }).limit(50),
      sb.from("follows").select("*", { count: "exact", head: true }).eq("followed_id", u.id),
      sb.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", u.id),
      me ? sb.from("follows").select("followed_id").eq("follower_id", me.id).eq("followed_id", u.id).maybeSingle() : Promise.resolve({ data: null })
    ]);
    var rv = res[0].data || [], isMe = me && me.id === u.id, fol = !!res[3].data;
    var avg = rv.length ? rv.reduce(function (s, x) { return s + Number(x.rating); }, 0) / rv.length : 0;
    pub.innerHTML = '<button class="back" aria-label="Retour">←</button><div class="pad me" style="padding-top:70px">' +
      '<div class="av" style="--c:' + A.col(u.username) + ';color:#fff' + (u.avatar_url ? ';background:url(' + u.avatar_url + ') center/cover' : "") + '">' + (u.avatar_url ? "" : ini(u.username)) + '</div><h2 style="margin:0">' + esc(u.username) + '</h2>' +
      '<p style="color:var(--muted)">Membre depuis ' + new Date(u.created_at).toLocaleDateString("fr-FR", { month: "long", year: "numeric" }) + '</p>' +
      bioHTML(u) + '<div class="nums" style="gap:20px"><div><b>' + rv.length + '</b>critiques</div><div><b>' + (avg ? avg.toFixed(1).replace(".", ",") : "–") + '</b>note moyenne</div><div><b id="nfol">' + (res[1].count || 0) + '</b>abonnés</div><div><b>' + (res[2].count || 0) + '</b>abonnements</div></div>' +
      (isMe ? '<p style="color:var(--muted)">C’est ton profil</p>' : '<button class="fw' + (fol ? " on" : "") + '" data-fid="' + u.id + '">' + (fol ? "Suivi" : "Suivre") + '</button>') +
      '<div id="ulists" style="text-align:left"></div><div style="text-align:left"><h2>Critiques</h2>' + (rv.length ? rv.map(function (x) { return item(x, null); }).join("") : '<p style="color:var(--muted)">Aucune critique pour l’instant.</p>') + '</div></div>';
    if (window.CLAP_LISTS) CLAP_LISTS.paintUser(u.id);
  }

  // ---- Clics (délégués)
  document.addEventListener("click", async function (e) {
    var un = e.target.closest(".un"); if (un) return openProfile(un.dataset.u);
    var fw = e.target.closest(".fw");
    if (fw) {
      var me = A.me(); if (!me) return A.showAuth("in", "Connecte-toi pour suivre des gens.");
      var uid = fw.dataset.fid, on = fw.classList.contains("on");
      var r = await (on ? sb.from("follows").delete().eq("follower_id", me.id).eq("followed_id", uid) : sb.from("follows").insert({ followed_id: uid }));
      if (r.error) return toast("Oups, réessaie.");
      fw.classList.toggle("on", !on); fw.textContent = on ? "Suivre" : "Suivi";
      var c = document.getElementById("nfol"); if (c && pub._uid === uid) c.textContent = (+c.textContent) + (on ? -1 : 1);
      return;
    }
    var it = e.target.closest(".act-i"); if (it) { pub.classList.remove("open"); return window.openFilm(Number(it.dataset.f)); }
    if (e.target.closest("#actlogin")) return A.showAuth("in", "Connecte-toi pour suivre des gens.");
    if (e.target.closest("#mypub")) return openProfile(A.prof().username);
    if (e.target.closest("#pub .back")) pub.classList.remove("open");
  });

  // ---- Quand la connexion change
  A.onUser = function () {
    var p = A.prof(), bio = $("#prof .pad > p");
    if (!$("#mypub") && bio) bio.insertAdjacentHTML("afterend", '<button class="chip" id="mypub" style="margin-top:10px">Voir mon profil public</button>');
    if ($("#mypub")) $("#mypub").hidden = !p;
    if ($("#act").classList.contains("on")) loadAct();
  };
})();
