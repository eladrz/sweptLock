/*
 * SweptLock marketing site — app URL configuration (single source of truth).
 *
 * This file is the ONLY place the SweptLock web-app URLs are defined. The
 * marketing site is fully decoupled from the app: it merely NAVIGATES to the
 * app's public login URL. There is no app code, auth logic, or shared build
 * step here — just a couple of constants and a tiny link resolver.
 *
 * To point the site at a different app deployment, change the URLs below and
 * nothing else.
 */
(function () {
  "use strict";

  /* ---------------------------------------------------------------------------
   * Config — the single source of truth for app URLs.
   * ------------------------------------------------------------------------- */
  window.SWEPTLOCK = {
    DEV_APP_URL: "https://sweptlock-dev-844f2.web.app",
    PROD_APP_URL: "https://sweptlock-prod.web.app",
  };

  // Marketing attribution value. Only this non-sensitive source (and an
  // optional campaign, see below) is ever appended to the app URL.
  var MARKETING_SOURCE = "marketing";

  /* ---------------------------------------------------------------------------
   * Resolve which environment's app URL to use.
   * Priority: explicit ?env=dev|prod  ->  dev-looking hostnames  ->  PROD.
   * PROD is always the safe default.
   * ------------------------------------------------------------------------- */
  function resolveAppBaseUrl() {
    var env = (new URLSearchParams(window.location.search).get("env") || "")
      .toLowerCase();
    if (env === "dev") return window.SWEPTLOCK.DEV_APP_URL;
    if (env === "prod") return window.SWEPTLOCK.PROD_APP_URL;

    // Treat local previews and non-production hosts as dev.
    var host = window.location.hostname;
    var isDevHost =
      host === "localhost" ||
      host === "127.0.0.1" ||
      host.endsWith(".local") ||
      host.indexOf("dev") !== -1 ||
      host.indexOf("staging") !== -1;

    return isDevHost
      ? window.SWEPTLOCK.DEV_APP_URL
      : window.SWEPTLOCK.PROD_APP_URL;
  }

  /* ---------------------------------------------------------------------------
   * Build a full app entry URL with marketing attribution.
   * NEVER attaches sensitive data — only source=marketing and an optional,
   * non-sensitive campaign value passed through from the current URL.
   * ------------------------------------------------------------------------- */
  function buildAppUrl() {
    var base = resolveAppBaseUrl().replace(/\/+$/, ""); // drop trailing slash
    var url = new URL(base + "/");
    url.searchParams.set("source", MARKETING_SOURCE);

    var campaign = new URLSearchParams(window.location.search).get("campaign");
    if (campaign) url.searchParams.set("campaign", campaign);

    return url.toString();
  }

  // Expose resolvers for reuse/testing without duplicating the raw URLs.
  window.SWEPTLOCK.resolveAppBaseUrl = resolveAppBaseUrl;
  window.SWEPTLOCK.buildAppUrl = buildAppUrl;

  /* ---------------------------------------------------------------------------
   * Wire every app entry point ([data-app-link]) to the resolved URL.
   * Buttons ship with no hard-coded URL in the HTML — the href is set here so
   * the config above stays the single source of truth.
   * ------------------------------------------------------------------------- */
  function wireAppLinks() {
    var href = buildAppUrl();
    document.querySelectorAll("[data-app-link]").forEach(function (el) {
      el.setAttribute("href", href);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", wireAppLinks);
  } else {
    wireAppLinks();
  }
})();
