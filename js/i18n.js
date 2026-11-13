/* ============================================================
   My-side — локализация сайта (RU / EN).

   Язык берётся из адреса (?hl=en), затем из localStorage,
   иначе используется русский. Переключатель в шапке меняет
   параметр hl и перезагружает страницу, чтобы каталог и гайды
   подгрузили данные на нужном языке.

   Файлы данных:
     data/languages.json      data/languages.en.json
     data/guides.json         data/guides.en.json
   ============================================================ */
(function () {
  "use strict";

  var STORAGE_KEY = "myside_lang";
  var SUPPORTED = ["ru", "en"];

  var DICT = {
    ru: {
      /* ---------- общее ---------- */
      "nav.aria": "Основная навигация",
      "nav.catalog": "Каталог",
      "nav.installPython": "Установка Python",
      "nav.installLinux": "Языки на Linux",
      "nav.openMenu": "Открыть меню",
      "theme.toLight": "Включить светлую тему",
      "theme.toDark": "Включить тёмную тему",
      "theme.lightTitle": "Светлая тема",
      "theme.darkTitle": "Тёмная тема",
      "lang.aria": "Язык сайта",
      "auth.greeting": "Привет, ",
      "auth.logout": "Выйти",
      "auth.login": "Войти",
      "auth.register": "Регистрация",
      "footer.catalog": "My-side · каталог гайдов по языкам программирования",
      "footer.data": "Данные о языках — в <code>data/languages.json</code> · гайды — в <code>data/guides.json</code>",
      "footer.demo": "My-side · демо без сервера · данные хранятся в localStorage",
      "footer.back": "Вернуться в каталог",

      /* ---------- каталог ---------- */
      "index.title": "Каталог гайдов по языкам программирования — My-side",
      "index.description": "Каталог гайдов по языкам программирования: Python, JavaScript, C++, Java, C#, Go, Rust и другие. Поиск, фильтры и пошаговые руководства на русском и английском.",
      "index.eyebrow": "Каталог гайдов",
      "index.h1": "Языки программирования",
      "index.lead": "Пошаговые руководства для тех, кто начинает с нуля: что это за язык, как установить окружение, написать первую программу и куда двигаться дальше. Выберите направление или найдите язык поиском.",
      "index.stat.languages": "языков",
      "index.stat.full": "полных гайдов",
      "index.stat.directions": "направления",
      "index.stat.lang": "🇷🇺 всё на русском",
      "index.installAria": "Установка языков",
      "index.installPython": "Как установить Python",
      "index.installPythonText": "Windows, macOS и Linux: PATH, pip и виртуальное окружение.",
      "index.installLinux": "Языки на Linux",
      "index.installLinuxText": "Команды apt, dnf и pacman для популярных языков.",
      "index.controlsAria": "Поиск и фильтры",
      "index.searchLabel": "Поиск по каталогу",
      "index.searchPlaceholder": "Найти язык: Python, веб, игры, анализ данных…",
      "index.clearSearch": "Очистить поиск",
      "index.sort": "Сортировка",
      "index.sort.popular": "По популярности",
      "index.sort.alphabet": "По алфавиту",
      "index.sort.year": "По году появления",
      "index.filterAria": "Фильтр по назначению",
      "index.chip.all": "Все",
      "index.chip.web": "Веб",
      "index.chip.games": "Игры",
      "index.chip.mobile": "Мобильные приложения",
      "index.chip.data": "Анализ данных",
      "index.gridAria": "Языки программирования",
      "index.loading": "Загрузка каталога…",
      "index.dataNote": "Данные о языках лежат в <code>data/languages.json</code>",
      "index.emptyTitle": "Ничего не найдено",
      "index.emptyText": "Попробуйте изменить запрос или сбросить фильтры.",
      "index.reset": "Сбросить фильтры",
      "index.count": "Найдено <strong>{found}</strong> из <strong>{total}</strong> языков",
      "index.dataUnavailable": "Данные недоступны",
      "index.errorTitle": "Не удалось загрузить каталог",
      "index.errorText": "Проверьте, что файл <code>data/languages.json</code> доступен. Если вы открыли сайт напрямую через <code>file://</code>, запустите локальный сервер или откройте сайт на GitHub Pages.",

      /* ---------- карточки ---------- */
      "card.wip": "Гайд в разработке",
      "card.since": "с {year}",
      "card.popularity": "Популярность {value}",
      "card.open": "Открыть гайд →",

      /* ---------- назначение ---------- */
      "purpose.web": "Веб",
      "purpose.games": "Игры",
      "purpose.mobile": "Мобильные приложения",
      "purpose.data": "Анализ данных",

      /* ---------- гайд ---------- */
      "guide.titleDefault": "Гайд по языку программирования — My-side",
      "guide.description": "Пошаговый гайд по языку программирования: установка окружения, первая программа, запуск и что учить дальше.",
      "guide.title": "{name} — гайд | My-side",
      "guide.loading": "Загрузка гайда…",
      "guide.breadcrumbsAria": "Хлебные крошки",
      "guide.catalog": "Каталог языков",
      "guide.full": "Полный гайд",
      "guide.wip": "Гайд в разработке",
      "guide.toc": "Содержание",
      "guide.tocAria": "Содержание гайда",
      "guide.allLanguages": "← Все языки",
      "guide.next": "Следующий гайд →",
      "guide.copy": "Копировать",
      "guide.copied": "Скопировано",
      "guide.copyFailed": "Не удалось",
      "guide.copyUnavailable": "Недоступно",
      "guide.visit": "Перейти →",
      "guide.stubTitle": "Гайд в разработке",
      "guide.stubText": "Полный разбор {name} появится позже. А пока можно изучить языки, для которых гайды уже готовы.",
      "topic.environment": "Установка окружения",
      "topic.firstProgram": "Первая программа",
      "topic.runDebug": "Запуск и отладка",
      "topic.variables": "Переменные и типы",
      "topic.conditions": "Условия и циклы",
      "topic.next": "Куда двигаться дальше",
      "guide.backCatalog": "← Вернуться в каталог",
      "guide.otherFull": "Другие полные гайды",
      "guide.open": "Открыть гайд →",
      "guide.error.noLangTitle": "Язык не выбран",
      "guide.error.noLangText": "Откройте гайд из каталога — там ссылки уже с нужным языком.",
      "guide.error.notFoundTitle": "Язык не найден",
      "guide.error.notFoundText": "В каталоге нет языка с кодом «{slug}».",
      "guide.error.loadTitle": "Не удалось загрузить гайд",
      "guide.error.loadText": "Проверьте, что файлы data/languages.json и data/guides.json доступны. При открытии через file:// нужен локальный сервер.",
      "guide.error.toCatalog": "Перейти в каталог",
      "code.terminal": "Терминал",
      "code.default": "код",

      /* ---------- установка ---------- */
      "installPython.title": "Как установить Python — My-side",
      "installPython.description": "Пошаговая инструкция по установке Python на Windows, macOS и Linux: PATH, pip, виртуальное окружение и решение частых проблем.",
      "installPython.crumb": "Установка Python",
      "installLinux.title": "Как установить языки программирования на Linux — My-side",
      "installLinux.description": "Команды установки Python, Node.js, C и C++, Java, C#, Go, Rust, PHP, Ruby и Kotlin для Ubuntu/Debian, Fedora и Arch Linux.",
      "installLinux.crumb": "Языки на Linux",

      /* ---------- вход ---------- */
      "login.title": "Вход — My-side",
      "login.h1": "Вход",
      "login.subtitle": "Войдите в аккаунт My-side.",
      "login.alreadyPrefix": "Вы уже вошли как",
      "login.alreadySuffix": "Можно войти под другим аккаунтом.",
      "login.identifier": "Имя пользователя или email",
      "login.identifierPlaceholder": "player_one или you@example.com",
      "login.password": "Пароль",
      "login.passwordPlaceholder": "Ваш пароль",
      "login.show": "Показать",
      "login.hide": "Скрыть",
      "login.showAria": "Показать пароль",
      "login.hideAria": "Скрыть пароль",
      "login.submit": "Войти",
      "login.submitting": "Проверяем…",
      "login.noAccount": "Нет аккаунта?",
      "login.registerLink": "Зарегистрироваться",
      "login.hint": "Данные проверяются в этом браузере: логин и хеш пароля лежат в <code>localStorage</code>.",

      /* ---------- регистрация ---------- */
      "register.title": "Регистрация — My-side",
      "register.h1": "Регистрация",
      "register.subtitle": "Создайте аккаунт — это займёт меньше минуты.",
      "register.alreadyPrefix": "Вы уже вошли как",
      "register.alreadySuffix": "Новая регистрация заменит текущий вход.",
      "register.login": "Логин",
      "register.loginPlaceholder": "например, player_one",
      "register.email": "Email",
      "register.emailPlaceholder": "you@example.com",
      "register.password": "Пароль",
      "register.passwordPlaceholder": "Минимум 6 символов",
      "register.submit": "Зарегистрироваться",
      "register.submitting": "Сохраняем…",
      "register.haveAccount": "Уже есть аккаунт?",
      "register.loginLink": "Войти",
      "register.hint": "Демо без сервера: логин, email и хеш пароля сохраняются только в этом браузере.",

      /* ---------- ошибки и сообщения ---------- */
      "err.enterIdentifier": "Введите имя пользователя или email.",
      "err.enterPassword": "Введите пароль.",
      "err.fillBoth": "Заполните оба поля.",
      "err.captchaLoad": "Капча не загрузилась. Проверьте интернет и обновите страницу.",
      "err.captchaUnavailable": "Капча недоступна.",
      "err.confirmHuman": "Подтвердите, что вы не робот.",
      "err.solveCaptcha": "Решите капчу.",
      "err.userNotFound": "Пользователь с таким именем или email не найден.",
      "err.passwordCheck": "Не удалось проверить пароль в этом браузере. Откройте сайт по https.",
      "err.wrongPassword": "Пароль не подошёл.",
      "err.wrongPasswordTry": "Неверный пароль. Попробуйте ещё раз.",
      "err.enterLogin": "Введите логин.",
      "err.loginShort": "Логин должен содержать минимум 3 символа.",
      "err.enterEmail": "Введите email.",
      "err.emailInvalid": "Введите корректный email.",
      "err.passwordShort": "Пароль должен содержать минимум 6 символов.",
      "err.checkFields": "Проверьте выделенные поля.",
      "err.loginTaken": "Пользователь с таким логином уже зарегистрирован.",
      "err.emailTaken": "Этот email уже зарегистрирован.",
      "err.dataTaken": "Такие данные уже зарегистрированы.",
      "err.storage": "Не удалось сохранить данные: хранилище браузера недоступно.",
      "msg.successLogin": "Успешно! Входим…",
      "msg.successRegister": "Регистрация успешна! Входим…",
      "msg.resetDone": "Данные сайта в этом браузере удалены."
    },

    en: {
      /* ---------- common ---------- */
      "nav.aria": "Main navigation",
      "nav.catalog": "Catalog",
      "nav.installPython": "Install Python",
      "nav.installLinux": "Languages on Linux",
      "nav.openMenu": "Open menu",
      "theme.toLight": "Switch to light theme",
      "theme.toDark": "Switch to dark theme",
      "theme.lightTitle": "Light theme",
      "theme.darkTitle": "Dark theme",
      "lang.aria": "Site language",
      "auth.greeting": "Hi, ",
      "auth.logout": "Log out",
      "auth.login": "Log in",
      "auth.register": "Sign up",
      "footer.catalog": "My-side · programming language guide catalog",
      "footer.data": "Language data in <code>data/languages.json</code> · guides in <code>data/guides.json</code>",
      "footer.demo": "My-side · serverless demo · data is stored in localStorage",
      "footer.back": "Back to catalog",

      /* ---------- catalog ---------- */
      "index.title": "Programming language guides — My-side",
      "index.description": "A catalog of programming language guides: Python, JavaScript, C++, Java, C#, Go, Rust and more. Search, filters and step-by-step tutorials in English and Russian.",
      "index.eyebrow": "Guide catalog",
      "index.h1": "Programming languages",
      "index.lead": "Step-by-step guides for beginners: what the language is, how to set up your environment, write your first program and where to go next. Pick a direction or find a language with search.",
      "index.stat.languages": "languages",
      "index.stat.full": "full guides",
      "index.stat.directions": "directions",
      "index.stat.lang": "🇬🇧 everything in English",
      "index.installAria": "Language installation",
      "index.installPython": "How to install Python",
      "index.installPythonText": "Windows, macOS and Linux: PATH, pip and virtual environments.",
      "index.installLinux": "Languages on Linux",
      "index.installLinuxText": "apt, dnf and pacman commands for popular languages.",
      "index.controlsAria": "Search and filters",
      "index.searchLabel": "Search the catalog",
      "index.searchPlaceholder": "Find a language: Python, web, games, data analysis…",
      "index.clearSearch": "Clear search",
      "index.sort": "Sort",
      "index.sort.popular": "By popularity",
      "index.sort.alphabet": "Alphabetically",
      "index.sort.year": "By year of creation",
      "index.filterAria": "Filter by purpose",
      "index.chip.all": "All",
      "index.chip.web": "Web",
      "index.chip.games": "Games",
      "index.chip.mobile": "Mobile apps",
      "index.chip.data": "Data analysis",
      "index.gridAria": "Programming languages",
      "index.loading": "Loading catalog…",
      "index.dataNote": "Language data lives in <code>data/languages.json</code>",
      "index.emptyTitle": "Nothing found",
      "index.emptyText": "Try a different query or reset the filters.",
      "index.reset": "Reset filters",
      "index.count": "Found <strong>{found}</strong> of <strong>{total}</strong> languages",
      "index.dataUnavailable": "Data unavailable",
      "index.errorTitle": "Could not load the catalog",
      "index.errorText": "Check that <code>data/languages.json</code> is available. If you opened the site directly via <code>file://</code>, start a local server or open the site on GitHub Pages.",

      /* ---------- cards ---------- */
      "card.wip": "Guide in progress",
      "card.since": "since {year}",
      "card.popularity": "Popularity {value}",
      "card.open": "Open guide →",

      /* ---------- purposes ---------- */
      "purpose.web": "Web",
      "purpose.games": "Games",
      "purpose.mobile": "Mobile apps",
      "purpose.data": "Data analysis",

      /* ---------- guide ---------- */
      "guide.titleDefault": "Programming language guide — My-side",
      "guide.description": "A step-by-step programming language guide: setting up your environment, your first program, running and debugging, and what to learn next.",
      "guide.title": "{name} guide — My-side",
      "guide.loading": "Loading guide…",
      "guide.breadcrumbsAria": "Breadcrumbs",
      "guide.catalog": "Language catalog",
      "guide.full": "Full guide",
      "guide.wip": "Guide in progress",
      "guide.toc": "Contents",
      "guide.tocAria": "Guide contents",
      "guide.allLanguages": "← All languages",
      "guide.next": "Next guide →",
      "guide.copy": "Copy",
      "guide.copied": "Copied",
      "guide.copyFailed": "Failed",
      "guide.copyUnavailable": "Unavailable",
      "guide.visit": "Visit →",
      "guide.stubTitle": "Guide in progress",
      "guide.stubText": "A full {name} guide is coming soon. In the meantime, explore the languages with complete guides.",
      "topic.environment": "Setting up the environment",
      "topic.firstProgram": "Your first program",
      "topic.runDebug": "Running and debugging",
      "topic.variables": "Variables and types",
      "topic.conditions": "Conditions and loops",
      "topic.next": "Where to go next",
      "guide.backCatalog": "← Back to catalog",
      "guide.otherFull": "Other full guides",
      "guide.open": "Open guide →",
      "guide.error.noLangTitle": "No language selected",
      "guide.error.noLangText": "Open a guide from the catalog — its links already include the right language.",
      "guide.error.notFoundTitle": "Language not found",
      "guide.error.notFoundText": "The catalog has no language with the code “{slug}”.",
      "guide.error.loadTitle": "Could not load the guide",
      "guide.error.loadText": "Check that data/languages.json and data/guides.json are available. Opening via file:// requires a local server.",
      "guide.error.toCatalog": "Go to catalog",
      "code.terminal": "Terminal",
      "code.default": "code",

      /* ---------- installation ---------- */
      "installPython.title": "How to install Python — My-side",
      "installPython.description": "Step-by-step guide to installing Python on Windows, macOS and Linux: PATH, pip, virtual environments and common problems.",
      "installPython.crumb": "Install Python",
      "installLinux.title": "How to install programming languages on Linux — My-side",
      "installLinux.description": "Install commands for Python, Node.js, C and C++, Java, C#, Go, Rust, PHP, Ruby and Kotlin on Ubuntu/Debian, Fedora and Arch Linux.",
      "installLinux.crumb": "Languages on Linux",

      /* ---------- login ---------- */
      "login.title": "Log in — My-side",
      "login.h1": "Log in",
      "login.subtitle": "Sign in to your My-side account.",
      "login.alreadyPrefix": "You are already signed in as",
      "login.alreadySuffix": "You can sign in with another account.",
      "login.identifier": "Username or email",
      "login.identifierPlaceholder": "player_one or you@example.com",
      "login.password": "Password",
      "login.passwordPlaceholder": "Your password",
      "login.show": "Show",
      "login.hide": "Hide",
      "login.showAria": "Show password",
      "login.hideAria": "Hide password",
      "login.submit": "Log in",
      "login.submitting": "Checking…",
      "login.noAccount": "No account?",
      "login.registerLink": "Sign up",
      "login.hint": "Credentials are checked in this browser: the username and password hash are stored in <code>localStorage</code>.",

      /* ---------- registration ---------- */
      "register.title": "Sign up — My-side",
      "register.h1": "Sign up",
      "register.subtitle": "Create an account — it takes less than a minute.",
      "register.alreadyPrefix": "You are already signed in as",
      "register.alreadySuffix": "A new registration will replace the current session.",
      "register.login": "Username",
      "register.loginPlaceholder": "for example, player_one",
      "register.email": "Email",
      "register.emailPlaceholder": "you@example.com",
      "register.password": "Password",
      "register.passwordPlaceholder": "At least 6 characters",
      "register.submit": "Sign up",
      "register.submitting": "Saving…",
      "register.haveAccount": "Already have an account?",
      "register.loginLink": "Log in",
      "register.hint": "Serverless demo: your username, email and password hash are stored only in this browser.",

      /* ---------- errors and messages ---------- */
      "err.enterIdentifier": "Enter your username or email.",
      "err.enterPassword": "Enter your password.",
      "err.fillBoth": "Fill in both fields.",
      "err.captchaLoad": "The captcha failed to load. Check your connection and refresh the page.",
      "err.captchaUnavailable": "Captcha is unavailable.",
      "err.confirmHuman": "Confirm that you are not a robot.",
      "err.solveCaptcha": "Solve the captcha.",
      "err.userNotFound": "No user with that username or email was found.",
      "err.passwordCheck": "Could not verify the password in this browser. Open the site over HTTPS.",
      "err.wrongPassword": "Incorrect password.",
      "err.wrongPasswordTry": "Wrong password. Try again.",
      "err.enterLogin": "Enter a username.",
      "err.loginShort": "The username must be at least 3 characters.",
      "err.enterEmail": "Enter an email.",
      "err.emailInvalid": "Enter a valid email.",
      "err.passwordShort": "The password must be at least 6 characters.",
      "err.checkFields": "Check the highlighted fields.",
      "err.loginTaken": "A user with that username is already registered.",
      "err.emailTaken": "That email is already registered.",
      "err.dataTaken": "These details are already registered.",
      "err.storage": "Could not save the data: browser storage is unavailable.",
      "msg.successLogin": "Success! Signing in…",
      "msg.successRegister": "Registration successful! Signing in…",
      "msg.resetDone": "Site data has been removed from this browser."
    }
  };

  function each(list, fn) {
    Array.prototype.forEach.call(list, fn);
  }

  function readStored() {
    try {
      return localStorage.getItem(STORAGE_KEY) || "";
    } catch (error) {
      return "";
    }
  }

  function detect() {
    try {
      var params = new URLSearchParams(window.location.search);
      var hl = params.get("hl");
      if (SUPPORTED.indexOf(hl) !== -1) return hl;
    } catch (error) {
      /* очень старый браузер — используем значение по умолчанию */
    }

    var stored = readStored();
    if (SUPPORTED.indexOf(stored) !== -1) return stored;
    return "ru";
  }

  var lang = detect();

  function t(key, vars) {
    var table = DICT[lang] || DICT.ru;
    var value = table[key];
    if (value == null) value = DICT.ru[key];
    if (value == null) return key;

    if (vars) {
      Object.keys(vars).forEach(function (name) {
        value = String(value).split("{" + name + "}").join(String(vars[name]));
      });
    }
    return value;
  }

  function isExternal(href) {
    return /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(href);
  }

  function link(url) {
    if (!url || lang !== "en") return url;
    if (isExternal(url) || url.indexOf("hl=") !== -1) return url;
    return url + (url.indexOf("?") === -1 ? "?" : "&") + "hl=en";
  }

  function decorateLinks(scope) {
    each(scope.querySelectorAll("a[href]"), function (anchor) {
      var href = anchor.getAttribute("href");
      if (!href || isExternal(href) || href.indexOf("hl=") !== -1) return;
      if (lang === "en") anchor.setAttribute("href", link(href));
    });
  }

  var LANG_LABELS = { en: "En", ru: "Ru" };

  function updateSwitcher() {
    /* Порядок: сначала En, затем Ru — даже если HTML пришёл из кэша. */
    each(document.querySelectorAll("[data-lang-switch]"), function (switcher) {
      var en = switcher.querySelector('[data-lang="en"]');
      var ru = switcher.querySelector('[data-lang="ru"]');
      if (!en || !ru) return;
      var enIsAfterRu = (ru.compareDocumentPosition(en) & 4) !== 0;
      if (enIsAfterRu) switcher.insertBefore(en, ru);
    });

    each(document.querySelectorAll("[data-lang-switch] [data-lang]"), function (button) {
      var code = button.getAttribute("data-lang");
      var active = code === lang;
      var label = LANG_LABELS[code];

      /* Подписи всегда сокращённые: En / Ru. */
      if (label && button.textContent.trim() !== label) {
        button.textContent = label;
      }

      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function apply(root) {
    var scope = root || document;

    each(scope.querySelectorAll("[data-i18n]"), function (element) {
      element.textContent = t(element.getAttribute("data-i18n"));
    });

    each(scope.querySelectorAll("[data-i18n-html]"), function (element) {
      element.innerHTML = t(element.getAttribute("data-i18n-html"));
    });

    each(scope.querySelectorAll("[data-i18n-placeholder]"), function (element) {
      element.setAttribute("placeholder", t(element.getAttribute("data-i18n-placeholder")));
    });

    each(scope.querySelectorAll("[data-i18n-aria]"), function (element) {
      element.setAttribute("aria-label", t(element.getAttribute("data-i18n-aria")));
    });

    each(scope.querySelectorAll("[data-i18n-title]"), function (element) {
      element.setAttribute("title", t(element.getAttribute("data-i18n-title")));
    });

    each(scope.querySelectorAll("[data-i18n-content]"), function (element) {
      element.setAttribute("content", t(element.getAttribute("data-i18n-content")));
    });

    var titleKey = document.documentElement.getAttribute("data-title-key");
    if (titleKey) document.title = t(titleKey);

    updateSwitcher();
    decorateLinks(scope);
  }

  function switchLang(next) {
    if (SUPPORTED.indexOf(next) === -1 || next === lang) return;

    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch (error) {
      /* приватный режим — язык всё равно применится через адрес */
    }

    var url;
    try {
      url = new URL(window.location.href);
    } catch (error) {
      url = null;
    }

    if (url) {
      if (next === "en") {
        url.searchParams.set("hl", "en");
      } else {
        url.searchParams.delete("hl");
      }
      /* Сбрасываем кэш GitHub Pages, чтобы подписи и тексты были свежими. */
      url.searchParams.set("v", String(Date.now()));
      window.location.href = url.toString();
      return;
    }

    window.location.reload();
  }

  function dataFile(base) {
    return base + (lang === "en" ? ".en" : "") + ".json";
  }

  document.documentElement.lang = lang;
  document.documentElement.setAttribute("data-lang", lang);

  function boot() {
    apply(document);

    each(document.querySelectorAll("[data-lang-switch] [data-lang]"), function (button) {
      button.addEventListener("click", function () {
        switchLang(button.getAttribute("data-lang"));
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  window.MYSIDE_I18N = {
    lang: lang,
    t: t,
    apply: apply,
    link: link,
    dataFile: dataFile,
    switchLang: switchLang
  };
})();
