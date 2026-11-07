/* ============================================================
   My-side — общая логика сайта.

   Где хранятся данные:
     localStorage["registeredUsers"]   — массив пользователей.
                                        Сюда пишет регистрация.
                                        Запись: { login, email,
                                                  passwordHash,
                                                  passwordAlgo,
                                                  createdAt }
     localStorage["gitcom_currentUser"] — логин того, кто вошёл.
   ============================================================ */
(function () {
  "use strict";

  var USERS_KEY = "registeredUsers";
  var SESSION_KEY = "gitcom_currentUser";
  var SITE_KEY = "0x4AAAAAAF1yWfZCbvIg8Vsw";

  /* ---------------- пользователи ---------------- */

  function loadUsers() {
    try {
      var raw = localStorage.getItem(USERS_KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(function (item) {
        return item && typeof item === "object";
      });
    } catch (error) {
      return [];
    }
  }

  function saveUsers(users) {
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      return true;
    } catch (error) {
      return false;
    }
  }

  function normalize(value) {
    return String(value == null ? "" : value).trim().toLowerCase();
  }

  function findUser(identifier) {
    var needle = normalize(identifier);
    if (!needle) return null;

    var users = loadUsers();
    for (var i = 0; i < users.length; i += 1) {
      var user = users[i];
      if (normalize(user.login) === needle || normalize(user.email) === needle) {
        return user;
      }
    }
    return null;
  }

  function updateUser(login, patch) {
    var users = loadUsers();
    for (var i = 0; i < users.length; i += 1) {
      if (normalize(users[i].login) === normalize(login)) {
        users[i] = Object.assign({}, users[i], patch);
        saveUsers(users);
        return users[i];
      }
    }
    return null;
  }

  /* ---------------- пароль ---------------- */

  function toHex(buffer) {
    var bytes = new Uint8Array(buffer);
    var out = "";
    for (var i = 0; i < bytes.length; i += 1) {
      out += bytes[i].toString(16).padStart(2, "0");
    }
    return out;
  }

  function sha256Hex(text) {
    var data = new TextEncoder().encode("myside:" + text);
    return window.crypto.subtle.digest("SHA-256", data).then(toHex);
  }

  // Резервный вариант, если crypto.subtle недоступен (например, file://).
  function fnv1aHex(text) {
    var source = "myside:" + text;
    var hash = 0x811c9dc5;
    for (var i = 0; i < source.length; i += 1) {
      hash ^= source.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193) >>> 0;
    }
    return hash.toString(16);
  }

  function makePasswordHash(password) {
    var canSubtle = Boolean(
      window.crypto && window.crypto.subtle &&
      window.crypto.subtle.digest && window.TextEncoder
    );

    if (!canSubtle) {
      return Promise.resolve({ algo: "fnv1a", hash: fnv1aHex(password) });
    }

    return sha256Hex(password)
      .then(function (hash) {
        return { algo: "sha256", hash: hash };
      })
      .catch(function () {
        return { algo: "fnv1a", hash: fnv1aHex(password) };
      });
  }

  // true / false — пароль верный или нет, null — проверить невозможно.
  function verifyPassword(password, user) {
    var algo = user.passwordAlgo || "sha256";

    if (algo === "fnv1a") {
      return Promise.resolve(fnv1aHex(password) === user.passwordHash);
    }

    if (!(window.crypto && window.crypto.subtle && window.TextEncoder)) {
      return Promise.resolve(null);
    }

    return sha256Hex(password)
      .then(function (hash) {
        return hash === user.passwordHash;
      })
      .catch(function () {
        return null;
      });
  }

  /* ---------------- сессия ---------------- */

  function getSessionLogin() {
    try {
      var raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return "";

      // На случай, если значение когда-то записали как JSON.
      if (raw.charAt(0) === "{") {
        try {
          var parsed = JSON.parse(raw);
          return parsed && parsed.login ? String(parsed.login) : "";
        } catch (error) {
          return "";
        }
      }
      return raw;
    } catch (error) {
      return "";
    }
  }

  function setSession(login) {
    try {
      localStorage.setItem(SESSION_KEY, String(login));
    } catch (error) {
      /* приватный режим — не роняем страницу */
    }
  }

  function clearSession() {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch (error) {
      /* см. выше */
    }
  }

  function getCurrentUser() {
    var login = getSessionLogin();
    if (!login) return null;

    var user = findUser(login);
    if (!user) {
      clearSession();
      return null;
    }
    return user;
  }

  /* ---------------- шапка ---------------- */

  function renderAuthArea() {
    var areas = document.querySelectorAll("[data-auth-area]");
    if (!areas.length) return;

    var user = getCurrentUser();

    Array.prototype.forEach.call(areas, function (area) {
      area.textContent = "";

      if (user) {
        var greeting = document.createElement("span");
        greeting.className = "greeting";
        greeting.appendChild(document.createTextNode("Привет, "));

        var name = document.createElement("strong");
        name.textContent = user.login;
        greeting.appendChild(name);

        var logout = document.createElement("button");
        logout.type = "button";
        logout.className = "btn btn-ghost btn-sm";
        logout.setAttribute("data-logout", "");
        logout.textContent = "Выйти";

        area.appendChild(greeting);
        area.appendChild(logout);
      } else {
        var loginLink = document.createElement("a");
        loginLink.className = "btn btn-ghost btn-sm";
        loginLink.href = "login.html";
        loginLink.textContent = "Войти";

        var registerLink = document.createElement("a");
        registerLink.className = "btn btn-primary btn-sm";
        registerLink.href = "register.html";
        registerLink.textContent = "Регистрация";

        area.appendChild(loginLink);
        area.appendChild(registerLink);
      }
    });
  }

  function renderMainViews() {
    var guestView = document.getElementById("guest-view");
    var userView = document.getElementById("user-view");
    if (!guestView && !userView) return;

    var user = getCurrentUser();

    if (guestView) guestView.hidden = Boolean(user);
    if (userView) userView.hidden = !user;

    if (!user) return;

    setText("user-initial", String(user.login || "?").charAt(0).toUpperCase());
    setText("user-name", user.login);
    setText("user-login", user.login);
    setText("user-email", user.email || "—");
    setText("user-since", user.createdAt ? formatDate(user.createdAt) : "—");
  }

  function setText(id, value) {
    var element = document.getElementById(id);
    if (element) element.textContent = value == null ? "—" : String(value);
  }

  function formatDate(timestamp) {
    var date = new Date(timestamp);
    if (isNaN(date.getTime())) return "—";
    try {
      return date.toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "long",
        year: "numeric"
      });
    } catch (error) {
      return date.toLocaleDateString();
    }
  }

  /* ---------------- утилиты форм ---------------- */

  function setFieldError(input, errorElement, text) {
    if (errorElement) errorElement.textContent = text || "";
    if (input) input.classList.toggle("invalid", Boolean(text));
  }

  function setFormMessage(element, text, type) {
    if (!element) return;
    element.textContent = text || "";
    element.className = "form-message" + (type ? " " + type : "");
  }

  function shake(element) {
    if (!element) return;
    element.classList.remove("shake");
    void element.offsetWidth;
    element.classList.add("shake");
  }

  function initPasswordToggle() {
    var toggle = document.getElementById("password-toggle");
    var input = document.getElementById("password");
    if (!toggle || !input) return;

    toggle.addEventListener("click", function () {
      var visible = input.type === "text";
      input.type = visible ? "password" : "text";
      toggle.textContent = visible ? "Показать" : "Скрыть";
      toggle.setAttribute("aria-pressed", visible ? "false" : "true");
      toggle.setAttribute("aria-label", visible ? "Показать пароль" : "Скрыть пароль");
      input.focus();
    });
  }

  function showAlreadyLoggedIn() {
    var notice = document.getElementById("already-notice");
    var name = document.getElementById("already-name");
    if (!notice || !name) return;

    var user = getCurrentUser();
    notice.hidden = !user;
    if (user) name.textContent = user.login;
  }

  /* ---------------- страница входа ---------------- */

  function initLoginPage() {
    var form = document.getElementById("login-form");
    if (!form) return;

    var loginInput = document.getElementById("login");
    var passwordInput = document.getElementById("password");
    var loginError = document.getElementById("login-error");
    var passwordError = document.getElementById("password-error");
    var formMessage = document.getElementById("form-message");
    var submit = document.getElementById("login-submit");
    var card = form.closest(".auth-card");

    initPasswordToggle();
    showAlreadyLoggedIn();

    [loginInput, passwordInput].forEach(function (input) {
      if (!input) return;
      input.addEventListener("input", function () {
        if (input === loginInput) setFieldError(loginInput, loginError, "");
        if (input === passwordInput) setFieldError(passwordInput, passwordError, "");
        setFormMessage(formMessage, "", "");
      });
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      setFieldError(loginInput, loginError, "");
      setFieldError(passwordInput, passwordError, "");
      setFormMessage(formMessage, "", "");

      var identifier = loginInput ? loginInput.value.trim() : "";
      var password = passwordInput ? passwordInput.value : "";
      var valid = true;

      if (!identifier) {
        setFieldError(loginInput, loginError, "Введите имя пользователя или email.");
        valid = false;
      }

      if (!password) {
        setFieldError(passwordInput, passwordError, "Введите пароль.");
        valid = false;
      }

      if (!valid) {
        setFormMessage(formMessage, "Заполните оба поля.", "error");
        return;
      }

      var user = findUser(identifier);

      if (!user) {
        setFormMessage(
          formMessage,
          "Пользователь с таким именем или email не найден.",
          "error"
        );
        shake(card);
        return;
      }

      submit.disabled = true;
      submit.textContent = "Проверяем…";

      var check;

      if (user.passwordHash) {
        check = verifyPassword(password, user);
      } else {
        // Аккаунт создан до появления паролей: привязываем введённый пароль.
        check = makePasswordHash(password).then(function (result) {
          updateUser(user.login, {
            passwordHash: result.hash,
            passwordAlgo: result.algo,
            passwordSetAt: Date.now()
          });
          return true;
        });
      }

      check.then(function (ok) {
        if (ok === null) {
          submit.disabled = false;
          submit.textContent = "Войти";
          setFormMessage(
            formMessage,
            "Не удалось проверить пароль в этом браузере. Откройте сайт по https.",
            "error"
          );
          return;
        }

        if (!ok) {
          submit.disabled = false;
          submit.textContent = "Войти";
          setFieldError(passwordInput, passwordError, "Пароль не подошёл.");
          setFormMessage(formMessage, "Неверный пароль. Попробуйте ещё раз.", "error");
          shake(card);
          if (passwordInput) passwordInput.select();
          return;
        }

        setSession(user.login);
        setFormMessage(formMessage, "Успешно! Входим…", "success");
        window.location.href = "index.html";
      });
    });
  }

  /* ---------------- страница регистрации ---------------- */

  function initRegisterPage() {
    var form = document.getElementById("register-form");
    if (!form) return;

    var loginInput = document.getElementById("login");
    var emailInput = document.getElementById("email");
    var passwordInput = document.getElementById("password");
    var loginError = document.getElementById("login-error");
    var emailError = document.getElementById("email-error");
    var passwordError = document.getElementById("password-error");
    var captchaError = document.getElementById("captcha-error");
    var formMessage = document.getElementById("form-message");
    var submit = document.getElementById("register-submit");
    var card = form.closest(".auth-card");

    initPasswordToggle();
    showAlreadyLoggedIn();

    var widget = document.querySelector(".cf-turnstile");
    if (widget) widget.setAttribute("data-sitekey", SITE_KEY);

    // Если api.js отрисовал виджет с плейсхолдером — перерисовываем с ключом.
    window.addEventListener("load", function () {
      if (!widget || !window.turnstile) return;
      if (widget.querySelector("iframe")) return;
      try {
        window.turnstile.render(widget, { sitekey: SITE_KEY, theme: "dark" });
      } catch (error) {
        /* виджет уже отрисован — не критично */
      }
    });

    [
      { input: loginInput, error: loginError },
      { input: emailInput, error: emailError },
      { input: passwordInput, error: passwordError }
    ].forEach(function (field) {
      if (!field.input) return;
      field.input.addEventListener("input", function () {
        setFieldError(field.input, field.error, "");
        setFormMessage(formMessage, "", "");
      });
    });

    function getCaptchaToken() {
      if (!window.turnstile) return "";
      try {
        return window.turnstile.getResponse() || "";
      } catch (error) {
        return "";
      }
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      setFieldError(loginInput, loginError, "");
      setFieldError(emailInput, emailError, "");
      setFieldError(passwordInput, passwordError, "");
      setFieldError(null, captchaError, "");
      setFormMessage(formMessage, "", "");

      var login = loginInput ? loginInput.value.trim() : "";
      var email = emailInput ? emailInput.value.trim() : "";
      var password = passwordInput ? passwordInput.value : "";
      var valid = true;

      if (!login) {
        setFieldError(loginInput, loginError, "Введите логин.");
        valid = false;
      } else if (login.length < 3) {
        setFieldError(loginInput, loginError, "Логин должен содержать минимум 3 символа.");
        valid = false;
      }

      if (!email) {
        setFieldError(emailInput, emailError, "Введите email.");
        valid = false;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setFieldError(emailInput, emailError, "Введите корректный email.");
        valid = false;
      }

      if (!password) {
        setFieldError(passwordInput, passwordError, "Введите пароль.");
        valid = false;
      } else if (password.length < 6) {
        setFieldError(passwordInput, passwordError, "Пароль должен содержать минимум 6 символов.");
        valid = false;
      }

      if (!valid) {
        setFormMessage(formMessage, "Проверьте выделенные поля.", "error");
        return;
      }

      if (!window.turnstile) {
        setFieldError(null, captchaError, "Капча не загрузилась. Проверьте интернет и обновите страницу.");
        setFormMessage(formMessage, "Капча недоступна.", "error");
        return;
      }

      if (!getCaptchaToken()) {
        setFieldError(null, captchaError, "Подтвердите, что вы не робот.");
        setFormMessage(formMessage, "Решите капчу.", "error");
        return;
      }

      var users = loadUsers();
      var duplicateLogin = users.some(function (user) {
        return normalize(user.login) === normalize(login);
      });
      var duplicateEmail = users.some(function (user) {
        return normalize(user.email) === normalize(email);
      });

      if (duplicateLogin) {
        setFieldError(loginInput, loginError, "Пользователь с таким логином уже зарегистрирован.");
        setFormMessage(formMessage, "Проверьте выделенные поля.", "error");
        return;
      }

      if (duplicateEmail) {
        setFieldError(emailInput, emailError, "Этот email уже зарегистрирован.");
        setFormMessage(formMessage, "Проверьте выделенные поля.", "error");
        return;
      }

      submit.disabled = true;
      submit.textContent = "Сохраняем…";

      makePasswordHash(password).then(function (result) {
        var freshUsers = loadUsers();

        // Повторная проверка после асинхронного хеширования.
        var taken = freshUsers.some(function (user) {
          return normalize(user.login) === normalize(login) ||
                 normalize(user.email) === normalize(email);
        });

        if (taken) {
          submit.disabled = false;
          submit.textContent = "Зарегистрироваться";
          setFieldError(loginInput, loginError, "Такие данные уже зарегистрированы.");
          setFormMessage(formMessage, "Проверьте выделенные поля.", "error");
          return;
        }

        freshUsers.push({
          login: login,
          email: email,
          passwordHash: result.hash,
          passwordAlgo: result.algo,
          createdAt: Date.now()
        });

        if (!saveUsers(freshUsers)) {
          submit.disabled = false;
          submit.textContent = "Зарегистрироваться";
          setFormMessage(
            formMessage,
            "Не удалось сохранить данные: хранилище браузера недоступно.",
            "error"
          );
          return;
        }

        setSession(login);
        setFormMessage(formMessage, "Регистрация успешна! Входим…", "success");

        if (window.turnstile) {
          try { window.turnstile.reset(); } catch (error) { /* ignore */ }
        }

        window.setTimeout(function () {
          window.location.href = "index.html";
        }, 700);
      });
    });
  }

  /* ---------------- главная страница ---------------- */

  function initMainPage() {
    if (!document.getElementById("guest-view") && !document.getElementById("user-view")) {
      return;
    }
    renderMainViews();
  }

  /* ---------------- ?reset=1 ---------------- */

  function handleResetParam() {
    var params = new URLSearchParams(window.location.search);
    if (params.get("reset") !== "1") return;

    try {
      localStorage.removeItem(USERS_KEY);
      localStorage.removeItem(SESSION_KEY);
      sessionStorage.clear();
    } catch (error) {
      /* хранилище может быть недоступно — не критично */
    }

    var message = document.getElementById("form-message");
    if (message) {
      setFormMessage(message, "Данные сайта в этом браузере удалены.", "success");
    }

    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }

  /* ---------------- запуск ---------------- */

  function boot() {
    handleResetParam();
    renderAuthArea();
    initLoginPage();
    initRegisterPage();
    initMainPage();

    // Выход из аккаунта — общий обработчик для всех страниц.
    document.addEventListener("click", function (event) {
      var button = event.target.closest("[data-logout]");
      if (!button) return;

      clearSession();
      renderAuthArea();
      renderMainViews();
      showAlreadyLoggedIn();

      if (!document.getElementById("guest-view") && !document.getElementById("user-view")) {
        window.location.href = "login.html";
      }
    });

    // Синхронизация между вкладками.
    window.addEventListener("storage", function (event) {
      if (event.key !== USERS_KEY && event.key !== SESSION_KEY) return;
      renderAuthArea();
      renderMainViews();
      showAlreadyLoggedIn();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
