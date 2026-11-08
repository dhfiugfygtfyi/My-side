/* ============================================================
   My-side — страница гайда.
   Адрес: pages/guide.html?lang=python&hl=en
   Содержимое берётся из data/languages(.en).json
   и data/guides(.en).json.
   ============================================================ */
(function () {
  "use strict";

  var CODE_LABELS = {
    python: "Python",
    javascript: "JavaScript",
    typescript: "TypeScript",
    cpp: "C++",
    c: "C",
    csharp: "C#",
    java: "Java",
    kotlin: "Kotlin",
    swift: "Swift",
    go: "Go",
    rust: "Rust",
    php: "PHP",
    ruby: "Ruby",
    sql: "SQL",
    bash: "Терминал",
    html: "HTML",
    css: "CSS",
    json: "JSON"
  };

  var root = document.getElementById("guide-root");

  function i18n() {
    return window.MYSIDE_I18N || null;
  }

  function tr(key, vars) {
    var api = i18n();
    return api && api.t ? api.t(key, vars) : key;
  }

  function langLink(url) {
    var api = i18n();
    return api && api.link ? api.link(url) : url;
  }

  function dataPath(base) {
    var api = i18n();
    return api && api.dataFile ? api.dataFile(base) : base + ".json";
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function purposeLabel(key) {
    return tr("purpose." + key);
  }

  function codeLabel(language) {
    if (language === "bash") return tr("code.terminal");
    if (CODE_LABELS[language]) return CODE_LABELS[language];
    return String(language || tr("code.default")).toUpperCase();
  }

  function fetchJson(path) {
    return fetch(path, { cache: "no-cache" }).then(function (response) {
      if (!response.ok) throw new Error("HTTP " + response.status + " for " + path);
      return response.json();
    });
  }

  /* ---------------- блоки контента ---------------- */

  function renderCode(block) {
    var language = block.language || "plaintext";
    return (
      '<div class="code-block">' +
        '<div class="code-block__bar">' +
          '<span class="code-block__lang">' + escapeHtml(codeLabel(language)) + "</span>" +
          '<button type="button" class="copy-btn" data-copy>' + escapeHtml(tr("guide.copy")) + "</button>" +
        "</div>" +
        "<pre><code class=\"language-" + escapeHtml(language) + "\">" +
          escapeHtml(block.code) +
        "</code></pre>" +
      "</div>"
    );
  }

  function renderBlock(block) {
    switch (block.type) {
      case "p":
        return "<p>" + escapeHtml(block.text) + "</p>";

      case "list":
        return "<ul>" + (block.items || []).map(function (item) {
          return "<li>" + escapeHtml(item) + "</li>";
        }).join("") + "</ul>";

      case "steps":
        return '<ol class="steps">' + (block.items || []).map(function (item) {
          return (
            "<li>" +
              "<h3>" + escapeHtml(item.title) + "</h3>" +
              "<p>" + escapeHtml(item.text) + "</p>" +
            "</li>"
          );
        }).join("") + "</ol>";

      case "code":
        return renderCode(block);

      case "lines":
        return '<div class="line-list">' + (block.items || []).map(function (item) {
          return (
            '<div class="line-item">' +
              "<code>" + escapeHtml(item.code) + "</code>" +
              "<p>" + escapeHtml(item.text) + "</p>" +
            "</div>"
          );
        }).join("") + "</div>";

      case "note":
        return '<div class="callout">' + escapeHtml(block.text) + "</div>";

      case "links":
        return '<div class="link-cards">' + (block.items || []).map(function (item) {
          return (
            '<a class="link-card" href="' + escapeHtml(item.href) + '">' +
              "<strong>" + escapeHtml(item.title) + "</strong>" +
              "<span>" + escapeHtml(item.text) + "</span>" +
              '<span class="arrow">' + escapeHtml(tr("guide.visit")) + "</span>" +
            "</a>"
          );
        }).join("") + "</div>";

      default:
        return "";
    }
  }

  function renderSection(section) {
    return (
      '<section class="guide-section" id="' + escapeHtml(section.id) + '">' +
        "<h2>" + escapeHtml(section.title) + "</h2>" +
        (section.blocks || []).map(renderBlock).join("") +
      "</section>"
    );
  }

  /* ---------------- шапка гайда ---------------- */

  function renderHero(language) {
    var meta = [];
    if (language.year) meta.push(tr("card.since", { year: language.year }));
    if (language.difficulty) meta.push(language.difficulty);
    if (language.paradigm) meta.push(language.paradigm);
    (language.purposes || []).forEach(function (key) {
      meta.push(purposeLabel(key));
    });

    var badges = meta.map(function (text) {
      return '<span class="badge">' + escapeHtml(text) + "</span>";
    });

    badges.push(
      language.full === false
        ? '<span class="badge badge--wip">' + escapeHtml(tr("guide.wip")) + "</span>"
        : '<span class="badge">' + escapeHtml(tr("guide.full")) + "</span>"
    );

    return (
      '<nav class="breadcrumbs" aria-label="' + escapeHtml(tr("guide.breadcrumbsAria")) + '">' +
        '<a href="' + escapeHtml(langLink("../index.html")) + '">' + escapeHtml(tr("guide.catalog")) + "</a>" +
        '<span class="sep">/</span>' +
        "<span>" + escapeHtml(language.name) + "</span>" +
      "</nav>" +
      '<section class="guide-hero" style="--guide-color: ' +
        escapeHtml(language.color || "#3b82f6") + '">' +
        '<div class="guide-hero__icon" aria-hidden="true">' +
          escapeHtml(language.icon || "◆") +
        "</div>" +
        "<div>" +
          "<h1>" + escapeHtml(language.name) + "</h1>" +
          '<p class="tagline">' + escapeHtml(language.tagline) + "</p>" +
          '<div class="guide-meta">' + badges.join("") + "</div>" +
        "</div>" +
      "</section>"
    );
  }

  /* ---------------- полный гайд ---------------- */

  function renderFull(language, guide) {
    var sections = guide.sections || [];

    var toc = sections.map(function (section) {
      return '<li><a href="#' + escapeHtml(section.id) + '">' +
        escapeHtml(section.title) + "</a></li>";
    }).join("");

    var content = sections.map(renderSection).join("");

    var nav =
      '<div class="guide-nav">' +
        '<a class="btn btn-ghost" href="' + escapeHtml(langLink("../index.html")) + '">' +
          escapeHtml(tr("guide.allLanguages")) + "</a>" +
        '<a class="btn btn-primary" href="' +
          escapeHtml(langLink("guide.html?lang=" + encodeURIComponent(nextLanguageSlug(language.slug)))) + '">' +
          escapeHtml(tr("guide.next")) + "</a>" +
      "</div>";

    return (
      '<div class="guide-layout">' +
        '<div class="guide-content">' + content + nav + "</div>" +
        '<aside class="guide-toc" aria-label="' + escapeHtml(tr("guide.tocAria")) + '">' +
          "<h2>" + escapeHtml(tr("guide.toc")) + "</h2>" +
          "<ol>" + toc + "</ol>" +
        "</aside>" +
      "</div>"
    );
  }

  /* ---------------- заглушка ---------------- */

  function renderStub(language, languages) {
    var fullGuides = languages.filter(function (item) {
      return item.full !== false && item.slug !== language.slug;
    }).slice(0, 3);

    var related = fullGuides.map(function (item) {
      return (
        '<a class="link-card" href="' +
          escapeHtml(langLink("guide.html?lang=" + encodeURIComponent(item.slug))) + '">' +
          "<strong>" + escapeHtml(item.icon || "") + " " + escapeHtml(item.name) + "</strong>" +
          "<span>" + escapeHtml(item.tagline) + "</span>" +
          '<span class="arrow">' + escapeHtml(tr("guide.open")) + "</span>" +
        "</a>"
      );
    }).join("");

    var topics = [
      "topic.environment",
      "topic.firstProgram",
      "topic.runDebug",
      "topic.variables",
      "topic.conditions",
      "topic.next"
    ].map(function (key) {
      return '<span class="badge">' + escapeHtml(tr(key)) + "</span>";
    }).join("");

    return (
      '<div class="stub-card">' +
        '<div class="stub-icon" aria-hidden="true">' + escapeHtml(language.icon || "🚧") + "</div>" +
        "<h2>" + escapeHtml(tr("guide.stubTitle")) + "</h2>" +
        "<p>" + escapeHtml(language.description) + "</p>" +
        "<p>" + escapeHtml(tr("guide.stubText", { name: language.name })) + "</p>" +
        '<div class="stub-topics">' + topics + "</div>" +
        '<div class="stub-actions">' +
          '<a class="btn btn-primary" href="' + escapeHtml(langLink("../index.html")) + '">' +
            escapeHtml(tr("guide.backCatalog")) + "</a>" +
        "</div>" +
      "</div>" +
      (related
        ? '<section class="guide-section" style="margin-top:18px">' +
            "<h2>" + escapeHtml(tr("guide.otherFull")) + "</h2>" +
            '<div class="link-cards">' + related + "</div>" +
          "</section>"
        : "")
    );
  }

  function nextLanguageSlug(currentSlug) {
    var languages = window.__mysideLanguages || [];
    if (!languages.length) return currentSlug;
    var index = -1;
    for (var i = 0; i < languages.length; i += 1) {
      if (languages[i].slug === currentSlug) {
        index = i;
        break;
      }
    }
    if (index === -1) return languages[0].slug;
    return languages[(index + 1) % languages.length].slug;
  }

  /* ---------------- ошибки ---------------- */

  function renderError(message, details) {
    if (!root) return;
    root.innerHTML =
      '<nav class="breadcrumbs"><a href="' + escapeHtml(langLink("../index.html")) + '">' +
        escapeHtml(tr("guide.catalog")) + "</a></nav>" +
      '<div class="stub-card">' +
        '<div class="stub-icon" aria-hidden="true">🤔</div>' +
        "<h2>" + escapeHtml(message) + "</h2>" +
        (details ? "<p>" + escapeHtml(details) + "</p>" : "") +
        '<div class="stub-actions">' +
          '<a class="btn btn-primary" href="' + escapeHtml(langLink("../index.html")) + '">' +
            escapeHtml(tr("guide.error.toCatalog")) + "</a>" +
        "</div>" +
      "</div>";
  }

  /* ---------------- подсветка и копирование ---------------- */

  function highlightAll() {
    if (!window.hljs || !root) return;
    var blocks = root.querySelectorAll("pre code");
    Array.prototype.forEach.call(blocks, function (block) {
      try {
        window.hljs.highlightElement(block);
      } catch (error) {
        /* если язык не распознан — оставляем простой текст */
      }
    });
  }

  function initCopyButtons() {
    if (!root) return;
    root.addEventListener("click", function (event) {
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

  function initTocTracking() {
    if (!root || !("IntersectionObserver" in window)) return;
    var links = root.querySelectorAll(".guide-toc a");
    if (!links.length) return;

    var map = {};
    Array.prototype.forEach.call(links, function (link) {
      var id = link.getAttribute("href").slice(1);
      map[id] = link;
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        Array.prototype.forEach.call(links, function (link) {
          link.classList.remove("is-active");
        });
        var link = map[entry.target.id];
        if (link) link.classList.add("is-active");
      });
    }, { rootMargin: "-90px 0px -65% 0px", threshold: 0 });

    Array.prototype.forEach.call(root.querySelectorAll(".guide-section[id]"), function (section) {
      observer.observe(section);
    });
  }

  /* ---------------- запуск ---------------- */

  function boot() {
    if (!root) return;

    var params = new URLSearchParams(window.location.search);
    var slug = params.get("lang");

    if (!slug) {
      renderError(tr("guide.error.noLangTitle"), tr("guide.error.noLangText"));
      return;
    }

    Promise.all([
      fetchJson(dataPath("../data/languages")),
      fetchJson(dataPath("../data/guides")).catch(function () {
        return {};
      })
    ])
      .then(function (results) {
        var languages = results[0];
        var guides = results[1] || {};

        window.__mysideLanguages = languages;

        var language = null;
        for (var i = 0; i < languages.length; i += 1) {
          if (languages[i].slug === slug) {
            language = languages[i];
            break;
          }
        }

        if (!language) {
          renderError(
            tr("guide.error.notFoundTitle"),
            tr("guide.error.notFoundText", { slug: slug })
          );
          return;
        }

        document.title = tr("guide.title", { name: language.name });
        document.documentElement.style.setProperty("--guide-color", language.color || "#3b82f6");

        var guide = guides[slug];
        var isFull = language.full !== false && guide && guide.sections && guide.sections.length;

        root.innerHTML =
          renderHero(language) +
          (isFull ? renderFull(language, guide) : renderStub(language, languages));

        highlightAll();
        initCopyButtons();
        initTocTracking();
      })
      .catch(function (error) {
        renderError(
          tr("guide.error.loadTitle"),
          tr("guide.error.loadText") + " " + (error && error.message ? error.message : "")
        );
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
