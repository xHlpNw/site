document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirm-password");
    const termsCheckbox = document.getElementById("terms");

    function getPasswordStrength(password) {
        if (!password.length) return { level: "none", text: "" };
        const hasLower = /[a-z]/.test(password);
        const hasUpper = /[A-Z]/.test(password);
        const hasDigit = /\d/.test(password);
        const hasSpecial = /[^A-Za-z0-9]/.test(password);
        const len = password.length;
        if (len < 8) return { level: "weak", text: "Слабый пароль" };
        const score = (hasLower ? 1 : 0) + (hasUpper ? 1 : 0) + (hasDigit ? 1 : 0) + (hasSpecial ? 1 : 0);
        if (score >= 3 && len >= 10) return { level: "strong", text: "Надёжный пароль" };
        if (score >= 2 || len >= 8) return { level: "medium", text: "Средний пароль" };
        return { level: "weak", text: "Слабый пароль" };
    }

    function updatePasswordStrength() {
        const container = document.querySelector(".password-strength");
        const bar = container.querySelector(".password-strength-bar");
        const textEl = container.querySelector(".password-strength-text");
        const { level, text } = getPasswordStrength(passwordInput.value);
        bar.classList.remove("weak", "medium", "strong");
        if (level !== "none") bar.classList.add(level);
        bar.setAttribute("data-level", level === "none" ? "0" : level === "weak" ? "1" : level === "medium" ? "2" : "3");
        textEl.textContent = text;
    }

    passwordInput.addEventListener("input", updatePasswordStrength);
    passwordInput.addEventListener("focus", updatePasswordStrength);

    function showError(input, message) {
        const group = input.closest(".input-group");
        const error = group.querySelector(".error-message");
        error.textContent = message;
        input.classList.add("invalid");
    }

    function clearError(input) {
        const group = input.closest(".input-group");
        const error = group.querySelector(".error-message");
        error.textContent = "";
        input.classList.remove("invalid");
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        let valid = true;

        if (nameInput.value.trim() === "") {
            showError(nameInput, "Введите имя");
            valid = false;
        } else {
            clearError(nameInput);
        }

        if (emailInput.value.trim() === "") {
            showError(emailInput, "Введите email");
            valid = false;
        } else if (!isValidEmail(emailInput.value.trim())) {
            showError(emailInput, "Некорректный формат email");
            valid = false;
        } else {
            clearError(emailInput);
        }

        if (passwordInput.value.length < 8) {
            showError(passwordInput, "Пароль должен содержать не менее 8 символов");
            valid = false;
        } else if (!/[A-Z]/.test(passwordInput.value)) {
            showError(passwordInput, "Пароль должен содержать хотя бы одну заглавную букву");
            valid = false;
        } else if (!/\d/.test(passwordInput.value)) {
            showError(passwordInput, "Пароль должен содержать хотя бы одну цифру");
            valid = false;
        } else {
            clearError(passwordInput);
        }

        if (confirmPasswordInput.value !== passwordInput.value) {
            showError(confirmPasswordInput, "Пароли не совпадают");
            valid = false;
        } else {
            clearError(confirmPasswordInput);
        }

        if (!termsCheckbox.checked) {
            alert("Необходимо согласиться с правилами сервиса");
            valid = false;
        }

        if (valid && window.api) {
            var btn = form.querySelector("button[type=submit]");
            if (btn) btn.disabled = true;
            api.post("/api/auth/register", {
                fullName: nameInput.value.trim(),
                email: emailInput.value.trim(),
                password: passwordInput.value
            }).then(function (data) {
                if (data.token) api.setToken(data.token);
                if (data.user) api.setUser(data.user);
                window.location.href = "catalog.html";
            }).catch(function (err) {
                var errors = err && err.errors;
                var message = err && err.message;
                if (errors && Array.isArray(errors)) {
                    message = errors.join(" ");
                } else if (!message) message = "Ошибка регистрации";
                showError(emailInput, message);
                if (btn) btn.disabled = false;
            });
        } else if (valid && !window.api) {
            form.submit();
        }
    });

    [nameInput, emailInput, passwordInput, confirmPasswordInput].forEach(input => {
        input.addEventListener("input", () => clearError(input));
    });
});