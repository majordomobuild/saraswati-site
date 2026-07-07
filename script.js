/* saraswati landing page — progressive enhancement only.
   With JS disabled: all content is visible and the header Download
   button ships as a solid accent link, so the download is always reachable.
   Version strings are static (v1.0.0) — there is no release manifest to sync. */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- 1. Masthead: violet hairline appears after a little scroll ---- */
  var masthead = document.getElementById("masthead");
  function onScroll() {
    if (masthead) masthead.classList.toggle("is-scrolled", window.scrollY > 24);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- 2. Ghost-header handoff: one accent element per viewport ----
     The header button is a ghost while a page-level CTA is on screen, and
     inherits the violet fill only once that CTA scrolls out of view. */
  var mastheadCta = document.getElementById("mastheadCta");
  var primaryCtas = [
    document.getElementById("heroCta"),
    document.getElementById("closeCta")
  ].filter(Boolean);
  if (mastheadCta && primaryCtas.length && "IntersectionObserver" in window) {
    var onscreen = new Set();
    var handoff = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { onscreen.add(e.target); } else { onscreen.delete(e.target); }
      });
      mastheadCta.classList.toggle("is-ghost", onscreen.size > 0);
    }, { threshold: 0 });
    primaryCtas.forEach(function (c) { handoff.observe(c); });
  }

  /* ---- 3. Scroll reveals (opacity + rise), fired once ---- */
  var revealables = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if (!reduceMotion && "IntersectionObserver" in window && revealables.length) {
    revealables.forEach(function (el) { el.classList.add("reveal--pending"); });

    var reveal = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        // gentle stagger for grouped rows (features)
        var siblings = el.parentNode ? el.parentNode.children : [];
        var idx = Array.prototype.indexOf.call(siblings, el);
        el.style.transitionDelay = (Math.min(idx, 6) * 60) + "ms";
        el.classList.remove("reveal--pending");
        el.classList.add("reveal--in");
        obs.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    revealables.forEach(function (el) { reveal.observe(el); });
  }
})();
