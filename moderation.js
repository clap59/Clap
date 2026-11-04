// Filtre de texte (pseudo, description). Mêmes mots que supabase-4-profil.sql : à modifier aux deux endroits.
(function () {
  var RE = new RegExp("\\b(pute|putes|salope|salopes|connard|connards|connasse|encule|enculee|enculer|encules|niquer|nique|ntm|fdp|tapette|negro|negre|negres|bougnoule|bougnoules|bicot|youpin|youpins|chinetoque|pedophile|pedo|violeur|bite|bites|chatte|chattes|couille|couilles|branler|branleur|branlette|sucer|sodomie|zoophile|gouine|fuck|fucking|fucker|fucked|motherfucker|cunt|nigger|niggers|nigga|faggot|fag|whore|slut|dick|dickhead|pussy|cock|cum|porn|porno|nude|nudes|rape|rapist|bitch|asshole|blowjob|handjob|dildo|xxx|onlyfans|kys|retard|retarded|tranny)\\b");
  var LEET = { "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "@": "a", "$": "s" };
  function norm(s) {
    return String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[013457@$]/g, function (c) { return LEET[c]; }).replace(/[^a-z0-9]+/g, " ").replace(/(.)\1{2,}/g, "$1")
      .replace(/\b(?:[a-z] ){2,}[a-z]\b/g, function (m) { return m.replace(/ /g, ""); });
  }
  window.CLAP_MOD = { bad: function (t) { t = String(t || ""); return /(https?:|www\.)/i.test(t) || RE.test(norm(t)); } };
})();
