(function () {
    const STORAGE_KEY = "autoseller-theme";
    const root = document.documentElement;

    function getPreferred() {
        return localStorage.getItem(STORAGE_KEY) || "light";
    }

    function setTheme(value) {
        root.setAttribute("data-theme", value);
        localStorage.setItem(STORAGE_KEY, value);
        const btn = document.querySelector(".theme-toggle-btn");
        if (btn) btn.setAttribute("aria-pressed", value === "dark");
    }

    function toggleTheme() {
        setTheme(getPreferred() === "dark" ? "light" : "dark");
    }

    function init() {
        setTheme(getPreferred());
        document.querySelector(".theme-toggle-btn")?.addEventListener("click", toggleTheme);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
