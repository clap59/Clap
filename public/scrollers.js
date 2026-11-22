// Confort ordinateur : flèches sur les lignes qui défilent, Échap pour fermer, fermeture des pages en changeant d'onglet.
(function () {
  var fine = matchMedia("(hover:hover) and (pointer:fine)").matches, SEL = ".dc-sc,.fp-cast,.fp-hs,.fp-sim";
  function enhance() {
    if (!fine) return;
    document.querySelectorAll(SEL).forEach(function (s) {
      if (s.dataset.nav) return; s.dataset.nav = "1"; var p = s.parentElement; if (!p) return; if (getComputedStyle(p).position === "static") p.style.position = "relative";
      function mk(d) {
        var b = document.createElement("button"); b.className = "sc-nav " + (d < 0 ? "sc-l" : "sc-r"); b.setAttribute("aria-label", d < 0 ? "Défiler vers la gauche" : "Défiler vers la droite"); b.innerHTML = IC(d < 0 ? "chevl" : "chevr");
        b.addEventListener("click", function (e) { e.stopPropagation(); s.scrollBy({ left: d * s.clientWidth * .8, behavior: "smooth" }); }); p.appendChild(b); return b;
      }
      var l = mk(-1), r = mk(1);
      function upd() { l.hidden = s.scrollLeft < 8; r.hidden = s.scrollLeft + s.clientWidth >= s.scrollWidth - 8; l.style.top = r.style.top = (s.offsetTop + s.offsetHeight / 2 - 21) + "px"; }
      s.addEventListener("scroll", upd, { passive: true }); if (window.ResizeObserver) new ResizeObserver(upd).observe(s); setTimeout(upd, 60);
    });
  }
  var t; new MutationObserver(function () { clearTimeout(t); t = setTimeout(enhance, 150); }).observe(document.body, { childList: true, subtree: true }); enhance();
  document.querySelectorAll(".tab").forEach(function (b) { var l = b.textContent.trim(); if (l) { b.title = l; b.setAttribute("aria-label", l); } });
  document.querySelector(".bar").addEventListener("click", function (e) { if (!e.target.closest(".tab")) return; ["film", "pub", "fr"].forEach(function (id) { var x = document.getElementById(id); if (x) x.classList.remove("open"); }); }, true);
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return; var q = function (s) { return document.querySelector(s); }, hide = function (s) { var x = q(s); if (x && !x.hidden) { x.hidden = true; return true; } return false; }, close = function (s) { var x = q(s); if (x && x.classList.contains("open")) { x.classList.remove("open"); return true; } return false; };
    if (hide("#cfm") || hide("#fp-modal") || close("#lsheet") || close("#sheet") || close("#auth") || close("#compose") || close("#film") || close("#pub") || close("#fr")) e.preventDefault();
  });
})();
