/* ============================================================
   My-side — тема оформления и мобильное меню.
   Скрипт подключается в <head>, чтобы тема применялась до отрисовки
   страницы и не было «вспышки» светлого фона.
   ============================================================ */
(function () {
  "use strict";

  var THEME_KEY = "myside_theme";
  var root = document.documentElement;

  function readTheme() {
    try {
      var saved = localStorage.getItem(THEME_KEY);
      if (saved === "light" || saved === "dark") return saved;
    } catch (error) {
      /* localStorage может быть недоступен */
    }
    return "dark";
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);

    var darkSheet = document.getElementById("hljs-dark");
    var lightSheet = document.getElementById("hljs-light");
    if (darkSheet) darkSheet.disabled = theme === "light";
    if (lightSheet) lightSheet.disabled = theme !== "light";

    var toggles = document.querySelectorAll("[data-theme-toggle]");
    Array.prototype.forEach.call(toggles, function (button) {
      var nextIsLight = theme === "dark";
      button.textContent = nextIsLight ? "☀️" : "🌙";
      button.setAttribute(
        "aria-label",
        nextIsLight ? "Включить светлую тему" : "Включить тёмную тему"
      );
      button.setAttribute("title", nextIsLight ? "Светлая тема" : "Тёмная тема");
      button.setAttribute("aria-pressed", theme === "light" ? "true" : "false");
    });
  }

  function saveTheme(theme) {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (error) {
      /* не критично */
    }
  }

  // Применяем тему сразу, ещё до загрузки body.
  applyTheme(readTheme());

  function initThemeToggle() {
    var toggles = document.querySelectorAll("[data-theme-toggle]");
    Array.prototype.forEach.call(toggles, function (button) {
      button.addEventListener("click", function () {
        var current = root.getAttribute("data-theme") === "light" ? "light" : "dark";
        var next = current === "light" ? "dark" : "light";
        applyTheme(next);
        saveTheme(next);
      });
    });
  }

  function initNavToggle() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var nav = document.getElementById("site-nav");
    if (!toggle || !nav) return;

    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  function boot() {
    applyTheme(readTheme());
    initThemeToggle();
    initNavToggle();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
