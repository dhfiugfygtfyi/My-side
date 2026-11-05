const form = document.getElementById("register-form");
const username = document.getElementById("username");
const password = document.getElementById("password");
const confirm = document.getElementById("confirm");

const usernameError = document.getElementById("username-error");
const passwordError = document.getElementById("password-error");
const confirmError = document.getElementById("confirm-error");
const message = document.getElementById("message");

const fields = [
  { input: username, error: usernameError },
  { input: password, error: passwordError },
  { input: confirm, error: confirmError }
];

function setFieldError(field, text) {
  field.error.textContent = text;
  field.input.classList.toggle("invalid", Boolean(text));
}

function clearErrors() {
  fields.forEach((field) => setFieldError(field, ""));
  message.textContent = "";
  message.className = "message";
}

function validate() {
  clearErrors();
  let valid = true;

  const name = username.value.trim();
  const pass = password.value;
  const confirmPass = confirm.value;

  if (!name) {
    setFieldError(fields[0], "Введите имя пользователя.");
    valid = false;
  } else if (name.length < 3) {
    setFieldError(fields[0], "Имя должно содержать минимум 3 символа.");
    valid = false;
  }

  if (!pass) {
    setFieldError(fields[1], "Введите пароль.");
    valid = false;
  } else if (pass.length < 6) {
    setFieldError(fields[1], "Пароль должен содержать минимум 6 символов.");
    valid = false;
  }

  if (!confirmPass) {
    setFieldError(fields[2], "Подтвердите пароль.");
    valid = false;
  } else if (pass !== confirmPass) {
    setFieldError(fields[2], "Пароли не совпадают.");
    valid = false;
  }

  return valid;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!validate()) {
    message.textContent = "Проверьте выделенные поля.";
    message.className = "message error";
    return;
  }

  // Демо-страница: данные никуда не отправляются.
  message.textContent = `Готово! Аккаунт «${username.value.trim()}» создан (демо).`;
  message.className = "message success";

  form.reset();
  fields.forEach((field) => field.input.classList.remove("invalid"));
});

// Убираем ошибку поля, как только пользователь начал его исправлять.
fields.forEach((field) => {
  field.input.addEventListener("input", () => {
    if (field.error.textContent) {
      setFieldError(field, "");
      message.textContent = "";
      message.className = "message";
    }
  });
});
