/* ============================================================
   My-side — каталог языков.
   Данные берутся из data/languages.json (RU) или
   data/languages.en.json (EN): чтобы добавить новый язык,
   достаточно дописать объект в JSON, вёрстку менять не нужно.
   ============================================================ */
(function () {
  "use strict";

  var PURPOSE_KEYS = ["web", "games", "mobile", "data"];
  var SORT_KEYS = ["popular", "alphabet", "year"];

  var state = {
    languages: [],
    query: "",
    purpose: "all",
    sort: "popular"
  };

  var els = {};

  function i18n() {
    return window.MYSIDE_I18N || null;
  }

  function tr(key, vars) {
    var api = i18n();
    return api && api.t ? api.t(key, vars) : key;
  }

  function lang() {
    var api = i18n();
    return api && api.lang ? api.lang : "ru";
  }

  function langLink(url) {
    var api = i18n();
    return api && api.link ? api.link(url) : url;
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function normalize(value) {
    return String(value == null ? "" : value).toLowerCase().replace(/ё/g, "е").trim();
  }

  function purposeLabel(key) {
    return PURPOSE_KEYS.indexOf(key) === -1 ? key : tr("purpose." + key);
  }

  function readUrlState() {
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");
    var purpose = params.get("purpose");
    var sort = params.get("sort");

    if (q) state.query = q;
    if (purpose && (purpose === "all" || PURPOSE_KEYS.indexOf(purpose) !== -1)) {
      state.purpose = purpose;
    }
    if (sort && SORT_KEYS.indexOf(sort) !== -1) state.sort = sort;
  }

  function writeUrlState() {
    if (!window.history || !window.history.replaceState) return;

    var params = new URLSearchParams();
    if (state.query) params.set("q", state.query);
    if (state.purpose !== "all") params.set("purpose", state.purpose);
    if (state.sort !== "popular") params.set("sort", state.sort);
    if (lang() === "en") params.set("hl", "en");

    var query = params.toString();
    var url = window.location.pathname + (query ? "?" + query : "");
    window.history.replaceState(null, "", url);
  }

  function matchesQuery(language, needle) {
    if (!needle) return true;

    var haystack = [
      language.name,
      language.tagline,
      language.description,
      language.paradigm,
      language.difficulty,
      language.year
    ].join(" ");

    if (language.purposes && language.purposes.length) {
      haystack += " " + language.purposes.map(purposeLabel).join(" ");
    }

    return normalize(haystack).indexOf(needle) !== -1;
  }

  function getVisible() {
    var needle = normalize(state.query);

    var list = state.languages.filter(function (language) {
      if (state.purpose !== "all") {
        var purposes = language.purposes || [];
        if (purposes.indexOf(state.purpose) === -1) return false;
      }
      return matchesQuery(language, needle);
    });

    list.sort(function (a, b) {
      if (state.sort === "alphabet") {
        return String(a.name).localeCompare(String(b.name), lang() === "en" ? "en" : "ru");
      }
      if (state.sort === "year") {
        return (b.year || 0) - (a.year || 0);
      }
      return (b.popularity || 0) - (a.popularity || 0);
    });

    return list;
  }

  function cardTemplate(language) {
    var purposes = (language.purposes || []).map(function (key) {
      return '<span class="badge">' + escapeHtml(purposeLabel(key)) + "</span>";
    });

    if (language.full === false) {
      purposes.push('<span class="badge badge--wip">' + escapeHtml(tr("card.wip")) + "</span>");
    }

    var href = langLink("pages/guide.html?lang=" + encodeURIComponent(language.slug));
    var meta = [];
    if (language.year) meta.push(tr("card.since", { year: language.year }));
    if (language.difficulty) meta.push(language.difficulty);

    return (
      '<a class="lang-card" href="' + escapeHtml(href) + '" ' +
        'style="--card-color: ' + escapeHtml(language.color || "#3b82f6") + '">' +
        '<div class="lang-card__top">' +
          '<span class="lang-icon" aria-hidden="true">' + escapeHtml(language.icon || "◆") + "</span>" +
          '<div class="lang-card__title">' +
            "<h3>" + escapeHtml(language.name) + "</h3>" +
            '<span class="lang-card__year">' + escapeHtml(meta.join(" · ")) + "</span>" +
          "</div>" +
        "</div>" +
        "<p>" + escapeHtml(language.tagline) + "</p>" +
        '<div class="badges">' + purposes.join("") + "</div>" +
        '<div class="lang-card__footer">' +
          "<span>" + escapeHtml(tr("card.popularity", { value: language.popularity || "—" })) + "</span>" +
          '<span class="go">' + escapeHtml(tr("card.open")) + "</span>" +
        "</div>" +
      "</a>"
    );
  }

  function render() {
    var visible = getVisible();

    if (els.statTotal) {
      els.statTotal.textContent = state.languages.length;
    }

    if (els.statFull) {
      els.statFull.textContent = state.languages.filter(function (language) {
        return language.full !== false;
      }).length;
    }

    if (els.grid) {
      els.grid.innerHTML = visible.map(cardTemplate).join("");
    }

    if (els.empty) {
      els.empty.hidden = visible.length !== 0;
    }

    if (els.count) {
      var total = state.languages.length;
      var found = visible.length;
      els.count.innerHTML = tr("index.count", { found: found, total: total });
    }

    if (els.clear) {
      els.clear.hidden = state.query.length === 0;
    }
  }

  function setPurpose(purpose) {
    state.purpose = purpose;
    Array.prototype.forEach.call(els.chips, function (chip) {
      var active = chip.getAttribute("data-purpose") === purpose;
      chip.classList.toggle("is-active", active);
      chip.setAttribute("aria-pressed", active ? "true" : "false");
    });
    writeUrlState();
    render();
  }

  function bind() {
    els.search = document.getElementById("catalog-search");
    els.grid = document.getElementById("lang-grid");
    els.empty = document.getElementById("catalog-empty");
    els.count = document.getElementById("catalog-count");
    els.clear = document.getElementById("search-clear");
    els.sort = document.getElementById("catalog-sort");
    els.chips = document.querySelectorAll("[data-purpose]");
    els.reset = document.getElementById("catalog-reset");
    els.statTotal = document.getElementById("stat-total");
    els.statFull = document.getElementById("stat-full");

    if (els.search) {
      els.search.value = state.query;
      els.search.addEventListener("input", function () {
        state.query = els.search.value.trim();
        writeUrlState();
        render();
      });
    }

    if (els.clear) {
      els.clear.addEventListener("click", function () {
        state.query = "";
        if (els.search) {
          els.search.value = "";
          els.search.focus();
        }
        writeUrlState();
        render();
      });
    }

    if (els.sort) {
      els.sort.value = state.sort;
      els.sort.addEventListener("change", function () {
        state.sort = els.sort.value;
        writeUrlState();
        render();
      });
    }

    Array.prototype.forEach.call(els.chips, function (chip) {
      chip.addEventListener("click", function () {
        setPurpose(chip.getAttribute("data-purpose") || "all");
      });
    });

    if (els.reset) {
      els.reset.addEventListener("click", function () {
        state.query = "";
        if (els.search) els.search.value = "";
        if (els.sort) {
          state.sort = "popular";
          els.sort.value = "popular";
        }
        setPurpose("all");
        render();
      });
    }
  }

  function load() {
    var api = i18n();
    var path = api && api.dataFile ? api.dataFile("data/languages") : "data/languages.json";

    return fetch(path, { cache: "no-cache" })
      .then(function (response) {
        if (!response.ok) throw new Error("HTTP " + response.status);
        return response.json();
      })
      .then(function (data) {
        if (!Array.isArray(data)) throw new Error("Expected an array of languages");
        state.languages = data;
      });
  }

  function showError(error) {
    if (els.grid) els.grid.innerHTML = "";
    if (els.empty) {
      els.empty.hidden = false;
      els.empty.innerHTML =
        "<h2>" + escapeHtml(tr("index.errorTitle")) + "</h2>" +
        "<p>" + tr("index.errorText") + "</p>" +
        "<p class=\"muted\">" + escapeHtml(error && error.message ? error.message : "") + "</p>";
    }
    if (els.count) els.count.textContent = tr("index.dataUnavailable");
  }

  function boot() {
    readUrlState();
    bind();
    if (els.sort) els.sort.value = state.sort;
    Array.prototype.forEach.call(els.chips, function (chip) {
      var active = chip.getAttribute("data-purpose") === state.purpose;
      chip.classList.toggle("is-active", active);
      chip.setAttribute("aria-pressed", active ? "true" : "false");
    });

    load()
      .then(render)
      .catch(showError);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
