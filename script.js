// ---------- Переключение «Вход / Регистрация» ----------

const tabs = Array.from(document.querySelectorAll(".tab"));
const title = document.getElementById("form-title");
const subtitle = document.getElementById("form-subtitle");

const titles = {
  "login-form": ["Вход", "Войдите в свой аккаунт."],
  "register-form": ["Регистрация", "Создайте аккаунт — это займёт меньше минуты."]
};

function showPanel(targetId) {
  tabs.forEach((tab) => {
    const active = tab.dataset.target === targetId;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", String(active));
    tab.setAttribute("tabindex", active ? "0" : "-1");
  });

  document.querySelectorAll(".panel").forEach((panel) => {
    panel.hidden = panel.id !== targetId;
  });

  const [heading, text] = titles[targetId];
  title.textContent = heading;
  subtitle.textContent = text;
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => showPanel(tab.dataset.target));
});

// ---------- Кнопка «показать / скрыть пароль» ----------

document.querySelectorAll(".toggle-password").forEach((button) => {
  button.addEventListener("click", () => {
    const input = document.getElementById(button.dataset.target);
    if (!input) return;

    const willShow = input.type === "password";
    input.type = willShow ? "text" : "password";

    button.classList.toggle("is-visible", willShow);
    button.setAttribute("aria-pressed", String(willShow));
    button.setAttribute("aria-label", willShow ? "Скрыть пароль" : "Показать пароль");
    button.title = willShow ? "Скрыть пароль" : "Показать пароль";

    // Возвращаем курсор в поле, чтобы можно было продолжать печатать.
    input.focus({ preventScroll: true });
    const end = input.value.length;
    try {
      input.setSelectionRange(end, end);
    } catch {
      /* некоторые типы input не поддерживают выделение — не критично */
    }
  });
});

// ---------- Общие помощники для форм ----------

// После reset() пароли снова скрываются, а «глаз» возвращается в исходное состояние.
function hidePasswords(form) {
  form.querySelectorAll(".toggle-password").forEach((button) => {
    const input = document.getElementById(button.dataset.target);
    if (input) input.type = "password";

    button.classList.remove("is-visible");
    button.setAttribute("aria-pressed", "false");
    button.setAttribute("aria-label", "Показать пароль");
    button.title = "Показать пароль";
  });
}

function createFormController({ form, fields, message }) {
  function setFieldError(field, text) {
    field.error.textContent = text;
    field.input.classList.toggle("invalid", Boolean(text));
  }

  function clearErrors() {
    fields.forEach((field) => setFieldError(field, ""));
    message.textContent = "";
    message.className = "message";
  }

  function showMessage(text, type) {
    message.textContent = text;
    message.className = "message" + (type ? " " + type : "");
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

  return { setFieldError, clearErrors, showMessage };
}

// ---------- Форма регистрации ----------

const registerForm = document.getElementById("register-form");
const registerUsername = document.getElementById("username");
const registerPassword = document.getElementById("password");
const registerConfirm = document.getElementById("confirm");

const registerFields = [
  { input: registerUsername, error: document.getElementById("username-error") },
  { input: registerPassword, error: document.getElementById("password-error") },
  { input: registerConfirm, error: document.getElementById("confirm-error") }
];

const registerController = createFormController({
  form: registerForm,
  fields: registerFields,
  message: document.getElementById("message")
});

registerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  registerController.clearErrors();

  let valid = true;
  const name = registerUsername.value.trim();
  const pass = registerPassword.value;
  const confirmPass = registerConfirm.value;

  if (!name) {
    registerController.setFieldError(registerFields[0], "Введите имя пользователя.");
    valid = false;
  } else if (name.length < 3) {
    registerController.setFieldError(registerFields[0], "Имя должно содержать минимум 3 символа.");
    valid = false;
  }

  if (!pass) {
    registerController.setFieldError(registerFields[1], "Введите пароль.");
    valid = false;
  } else if (pass.length < 6) {
    registerController.setFieldError(registerFields[1], "Пароль должен содержать минимум 6 символов.");
    valid = false;
  }

  if (!confirmPass) {
    registerController.setFieldError(registerFields[2], "Подтвердите пароль.");
    valid = false;
  } else if (pass !== confirmPass) {
    registerController.setFieldError(registerFields[2], "Пароли не совпадают.");
    valid = false;
  }

  if (!valid) {
    registerController.showMessage("Проверьте выделенные поля.", "error");
    return;
  }

  // Демо-страница: данные никуда не отправляются.
  registerController.showMessage(`Готово! Аккаунт «${name}» создан (демо).`, "success");

  registerForm.reset();
  hidePasswords(registerForm);
  registerFields.forEach((field) => field.input.classList.remove("invalid"));
});

// ---------- Форма входа ----------

const loginForm = document.getElementById("login-form");
const loginUsername = document.getElementById("login-username");
const loginPassword = document.getElementById("login-password");

const loginFields = [
  { input: loginUsername, error: document.getElementById("login-username-error") },
  { input: loginPassword, error: document.getElementById("login-password-error") }
];

const loginController = createFormController({
  form: loginForm,
  fields: loginFields,
  message: document.getElementById("login-message")
});

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  loginController.clearErrors();

  let valid = true;
  const name = loginUsername.value.trim();
  const pass = loginPassword.value;

  if (!name) {
    loginController.setFieldError(loginFields[0], "Введите имя пользователя.");
    valid = false;
  }

  if (!pass) {
    loginController.setFieldError(loginFields[1], "Введите пароль.");
    valid = false;
  }

  if (!valid) {
    loginController.showMessage("Проверьте выделенные поля.", "error");
    return;
  }

  // Демо-страница: данные никуда не отправляются.
  loginController.showMessage(`Добро пожаловать, «${name}»! Вход выполнен (демо).`, "success");

  loginForm.reset();
  hidePasswords(loginForm);
  loginFields.forEach((field) => field.input.classList.remove("invalid"));
});
