/* ============================================================
   My-side — страницы установки.

   Копирование команд из блоков кода и подсветка синтаксиса.
   ============================================================ */
(function () {
  "use strict";

  function tr(key) {
    var api = window.MYSIDE_I18N;
    return api && api.t ? api.t(key) : key;
  }

  function initCopyButtons() {
    document.addEventListener("click", function (event) {
      var button = event.target.closest("[data-copy]");
      if (!button) return;

      var block = button.closest(".code-block");
      var code = block ? block.querySelector("code") : null;
      if (!code) return;

      var text = code.textContent;
      var done = function () {
        button.textContent = tr("guide.copied");
        button.classList.add("is-copied");
        window.setTimeout(function () {
          button.textContent = tr("guide.copy");
          button.classList.remove("is-copied");
        }, 1600);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(function () {
          button.textContent = tr("guide.copyFailed");
        });
      } else {
        button.textContent = tr("guide.copyUnavailable");
      }
    });
  }

  function highlightCode() {
    if (!window.hljs) return;
    var blocks = document.querySelectorAll(".code-block pre code");
    Array.prototype.forEach.call(blocks, function (block) {
      try {
        window.hljs.highlightElement(block);
      } catch (error) {
        /* если язык не распознан — оставляем простой текст */
      }
    });
  }

  function initTocTracking() {
    if (!("IntersectionObserver" in window)) return;

    var links = document.querySelectorAll(".guide-toc a");
    if (!links.length) return;

    var byId = {};
    Array.prototype.forEach.call(links, function (link) {
      var id = (link.getAttribute("href") || "").slice(1);
      var target = id ? document.getElementById(id) : null;
      if (target) byId[id] = link;
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        Array.prototype.forEach.call(links, function (link) {
          link.classList.remove("is-active");
        });
        var active = byId[entry.target.id];
        if (active) active.classList.add("is-active");
      });
    }, { rootMargin: "-90px 0px -60% 0px", threshold: 0 });

    Object.keys(byId).forEach(function (id) {
      observer.observe(document.getElementById(id));
    });
  }

  function boot() {
    initCopyButtons();
    highlightCode();
    initTocTracking();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
