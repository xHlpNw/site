(function () {
    var SAFE_PAGES = [
        "index.html", "catalog.html", "profile.html", "favourites.html",
        "comparison.html", "newpost.html", "aboutUs.html", "carpage.html"
    ];

    function getReturnUrl() {
        var params = new URLSearchParams(window.location.search);
        var ret = params.get("return");
        if (!ret) return "catalog.html";
        var decoded = decodeURIComponent(ret);
        var page = decoded.split("?")[0].split("#")[0];
        return SAFE_PAGES.indexOf(page) !== -1 ? decoded : "catalog.html";
    }

    function init() {
        if (!window.api) return;

        if (api.getToken()) {
            window.location.replace(getReturnUrl());
            return;
        }

        var form = document.querySelector("form");
        if (!form) return;

        form.addEventListener("submit", function (e) {
            e.preventDefault();
            var email = (form.querySelector("[name=email]") || form.querySelector("#email")).value.trim();
            var password = (form.querySelector("[name=password]") || form.querySelector("#password")).value;
            var btn = form.querySelector("button[type=submit]");
            var msg = form.querySelector(".login-error") || (function () {
                var p = document.createElement("p");
                p.className = "login-error";
                p.setAttribute("role", "alert");
                form.insertBefore(p, form.firstChild);
                return p;
            })();
            msg.textContent = "";
            if (!email || !password) {
                msg.textContent = "Введите email и пароль";
                return;
            }
            if (btn) btn.disabled = true;
            api.post("/api/auth/login", { email: email, password: password })
                .then(function (data) {
                    if (data.token) api.setToken(data.token);
                    if (data.user) api.setUser(data.user);
                    window.location.href = getReturnUrl();
                })
                .catch(function (err) {
                    msg.textContent = (err && err.message) ? err.message : "Ошибка входа. Проверьте данные.";
                    if (btn) btn.disabled = false;
                });
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
