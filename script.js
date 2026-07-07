/* saraswati landing page — progressive enhancement only.
   With JS disabled: all content is visible and the header Download
   button ships as a solid accent link, so the download is always reachable. */
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
     The header button is a ghost while the hero CTA is on screen, and
     inherits the accent fill only once the hero CTA scrolls out of view. */
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
      // Ghost the masthead button whenever a page-level accent CTA is in view,
      // so there is only ever one solid accent element per viewport.
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

  /* ---- 4. Version sync: the page never goes stale ----
     Reads the same manifest the in-app updater uses and overwrites the
     version text, download links, and release date. The hardcoded values
     in the HTML are the fallback when JS or the fetch is unavailable. */
  var MANIFEST_URL = "https://majordomobuild.github.io/releases/latest-saraswati.json";

  function applyRelease(m) {
    if (!m || !/^\d+\.\d+\.\d+$/.test(String(m.version))) return;
    var v = m.version;
    var plat = m.platforms && m.platforms["darwin-aarch64"];
    var base = (plat && typeof plat.url === "string")
      ? plat.url.slice(0, plat.url.lastIndexOf("/"))
      : "https://github.com/majordomobuild/releases/releases/download/saraswati-v" + v;
    var dmg = base + "/Saraswati_" + v + "_aarch64.dmg";

    Array.prototype.slice.call(document.querySelectorAll("[data-saraswati-version]"))
      .forEach(function (el) {
        el.textContent = "v" + v;
        if (el.hasAttribute("aria-label")) el.setAttribute("aria-label", "version " + v);
      });
    Array.prototype.slice.call(document.querySelectorAll("a[data-saraswati-dl]"))
      .forEach(function (a) { a.href = dmg; });

    var rel = document.querySelector("[data-saraswati-reldate]");
    if (rel && m.pub_date) {
      var d = new Date(m.pub_date);
      if (!isNaN(d)) {
        rel.textContent = "released " + d.toLocaleDateString("en-US",
          { year: "numeric", month: "long", day: "numeric" });
      }
    }
  }

  if (window.fetch) {
    fetch(MANIFEST_URL, { cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(applyRelease)
      .catch(function () { /* keep the hardcoded fallback */ });
  }
})();
