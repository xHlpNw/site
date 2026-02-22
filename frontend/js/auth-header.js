(function () {
    function updateAuthButtons() {
        var container = document.querySelector(".auth-buttons");
        if (!container) return;
        var token = window.api && api.getToken();
        var user = window.api && api.getUser();
        if (token && user) {
            container.innerHTML = "<a href=\"profile.html\" class=\"btn-profile\">Профиль</a>";
        }
        if (window.api) api.updateCompareCount();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", updateAuthButtons);
    } else {
        updateAuthButtons();
    }
})();
