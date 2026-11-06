// вставь свой Site Key из dash.cloudflare.com
const SITE_KEY = "0x4AAAAAAF1yWfZCbvIg8Vsw";

const STORAGE_KEY = "registeredUsers";
const TURNSTILE_THEME = "light";

const form = document.getElementById("register-form");
const loginInput = document.getElementById("login");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const loginError = document.getElementById("login-error");
const emailError = document.getElementById("email-error");
const passwordError = document.getElementById("password-error");
const captchaError = document.getElementById("captcha-error");
const message = document.getElementById("message");

const widget = document.querySelector(".cf-turnstile");

const fields = [
  { input: loginInput, error: loginError },
  { input: emailInput, error: emailError },
  { input: passwordInput, error: passwordError }
];

const siteKeyIsPlaceholder = !SITE_KEY || SITE_KEY === "SITE_KEY";

// Подставляем ключ в разметку до того, как Turnstile нарисует виджет.
if (widget && !siteKeyIsPlaceholder) {
  widget.setAttribute("data-sitekey", SITE_KEY);
}

// Если api.js уже успел отрисовать виджет с плейсхолдером — перерисовываем с настоящим ключом.
window.addEventListener("load", () => {
  if (!widget || !window.turnstile || siteKeyIsPlaceholder) return;
  if (widget.querySelector("iframe")) return;

  turnstile.render(widget, {
    sitekey: SITE_KEY,
    theme: TURNSTILE_THEME
  });
});

function setFieldError(field, text) {
  field.error.textContent = text;
  field.input.classList.toggle("invalid", Boolean(text));
}

function setCaptchaError(text) {
  captchaError.textContent = text;
}

function clearErrors() {
  fields.forEach((field) => setFieldError(field, ""));
  setCaptchaError("");
  message.textContent = "";
  message.className = "message";
}

function showMessage(text, type) {
  message.textContent = text;
  message.className = "message" + (type ? " " + type : "");
}

function getCaptchaToken() {
  if (!window.turnstile) return "";
  try {
    return turnstile.getResponse() || "";
  } catch {
    return "";
  }
}

function loadUsers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveUser(user) {
  const users = loadUsers();
  users.push(user);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

// Убираем ошибку поля, как только пользователь начал его исправлять.
fields.forEach((field) => {
  field.input.addEventListener("input", () => {
    if (field.error.textContent) {
      setFieldError(field, "");
      showMessage("", "");
    }
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  clearErrors();

  let valid = true;

  const login = loginInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!login) {
    setFieldError(fields[0], "Введите логин.");
    valid = false;
  } else if (login.length < 3) {
    setFieldError(fields[0], "Логин должен содержать минимум 3 символа.");
    valid = false;
  }

  if (!email) {
    setFieldError(fields[1], "Введите email.");
    valid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setFieldError(fields[1], "Введите корректный email.");
    valid = false;
  }

  if (!password) {
    setFieldError(fields[2], "Введите пароль.");
    valid = false;
  } else if (password.length < 6) {
    setFieldError(fields[2], "Пароль должен содержать минимум 6 символов.");
    valid = false;
  }

  if (!valid) {
    showMessage("Проверьте выделенные поля.", "error");
    return;
  }

  // Капча: Turnstile должен вернуть непустой токен.
  if (siteKeyIsPlaceholder) {
    setCaptchaError("Укажите Site Key в app.js (см. README.md).");
    showMessage("Капча не настроена.", "error");
    return;
  }

  if (!window.turnstile) {
    setCaptchaError("Капча не загрузилась. Проверьте интернет и обновите страницу.");
    showMessage("Капча недоступна.", "error");
    return;
  }

  const token = getCaptchaToken();
  if (!token) {
    setCaptchaError("Подтвердите, что вы не робот.");
    showMessage("Решите капчу.", "error");
    return;
  }

  // Дубликаты проверяем до сохранения, чтобы не плодить одинаковые записи.
  const users = loadUsers();
  const duplicateLogin = users.some(
    (user) => String(user.login).toLowerCase() === login.toLowerCase()
  );
  const duplicateEmail = users.some(
    (user) => String(user.email).toLowerCase() === email.toLowerCase()
  );

  if (duplicateLogin) {
    setFieldError(fields[0], "Пользователь с таким логином уже зарегистрирован.");
    showMessage("Проверьте выделенные поля.", "error");
    return;
  }

  if (duplicateEmail) {
    setFieldError(fields[1], "Этот email уже зарегистрирован.");
    showMessage("Проверьте выделенные поля.", "error");
    return;
  }

  // Пароль не сохраняем — только логин и email.
  saveUser({ login: login, email: email });

  showMessage("Регистрация успешна!", "success");

  form.reset();
  fields.forEach((field) => field.input.classList.remove("invalid"));

  // Сбрасываем виджет, чтобы токен нельзя было использовать повторно.
  if (window.turnstile) {
    try {
      turnstile.reset();
    } catch {
      /* виджет мог ещё не отрисоваться — не критично */
    }
  }
});
