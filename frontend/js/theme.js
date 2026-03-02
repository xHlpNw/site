(function () {
    const STORAGE_KEY = "autoseller-theme";
    const THEME_STYLE_ID = "theme-style";
    const THEME_URLS = {
        light: "/css/theme-light.css",
        dark: "/css/theme-dark.css"
    };

    const root = document.documentElement;

    function getPreferred() {
        return localStorage.getItem(STORAGE_KEY) || "light";
    }

    function getThemeStyleElement() {
        let styleEl = document.getElementById(THEME_STYLE_ID);
        if (!styleEl) {
            styleEl = document.createElement("style");
            styleEl.id = THEME_STYLE_ID;
            document.head.appendChild(styleEl);
        }
        return styleEl;
    }

    async function loadThemeCss(value) {
        const url = THEME_URLS[value];
        if (!url) {
            console.warn("Unknown theme:", value);
            return;
        }

        try {
            const response = await fetch(url, { cache: "no-store" });
            if (!response.ok) {
                console.error("Failed to load theme css:", response.status, response.statusText);
                return;
            }
            const cssText = await response.text();
            const styleEl = getThemeStyleElement();
            styleEl.textContent = cssText;
        } catch (error) {
            console.error("Error loading theme css:", error);
        }
    }

    async function setTheme(value) {
        root.setAttribute("data-theme", value);
        localStorage.setItem(STORAGE_KEY, value);
        const btn = document.querySelector(".theme-toggle-btn");
        if (btn) btn.setAttribute("aria-pressed", value === "dark");

        await loadThemeCss(value);
    }

    function toggleTheme() {
        const next = getPreferred() === "dark" ? "light" : "dark";
        setTheme(next);
    }

    function init() {
        const preferred = getPreferred();
        setTheme(preferred);
        document.querySelector(".theme-toggle-btn")?.addEventListener("click", toggleTheme);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
