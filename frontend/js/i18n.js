(function () {
    const STORAGE_KEY = "autoseller-lang";
    const DEFAULT_LANG = "ru";
    const LANG_URLS = {
        ru: "data/lang-ru.json",
        en: "data/lang-en.json"
    };

    let currentLang = DEFAULT_LANG;
    let translations = {};

    function getNested(path, obj) {
        if (!obj) return undefined;
        const parts = path.split(".");
        let result = obj;
        for (let i = 0; i < parts.length; i++) {
            const key = parts[i];
            if (result && Object.prototype.hasOwnProperty.call(result, key)) {
                result = result[key];
            } else {
                return undefined;
            }
        }
        return result;
    }

    function updateLangSwitcher() {
        const buttons = document.querySelectorAll(".lang-btn[data-lang]");
        buttons.forEach(function (btn) {
            const lang = btn.getAttribute("data-lang");
            const isActive = lang === currentLang;
            btn.classList.toggle("active", isActive);
            btn.setAttribute("aria-pressed", String(isActive));
        });
    }

    function applyTranslations() {
        if (!translations) return;

        // Основной текст (textContent)
        document.querySelectorAll("[data-i18n]").forEach(function (el) {
            const key = el.getAttribute("data-i18n");
            const value = getNested(key, translations);
            if (value != null) {
                el.textContent = value;
            }
        });

        // Плейсхолдеры
        document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
            const key = el.getAttribute("data-i18n-placeholder");
            const value = getNested(key, translations);
            if (value != null) {
                el.placeholder = value;
            }
        });

        // title-атрибуты
        document.querySelectorAll("[data-i18n-title]").forEach(function (el) {
            const key = el.getAttribute("data-i18n-title");
            const value = getNested(key, translations);
            if (value != null) {
                el.title = value;
            }
        });

        // alt у изображений
        document.querySelectorAll("[data-i18n-alt]").forEach(function (el) {
            const key = el.getAttribute("data-i18n-alt");
            const value = getNested(key, translations);
            if (value != null) {
                el.alt = value;
            }
        });

        // aria-label
        document.querySelectorAll("[data-i18n-aria-label]").forEach(function (el) {
            const key = el.getAttribute("data-i18n-aria-label");
            const value = getNested(key, translations);
            if (value != null) {
                el.setAttribute("aria-label", value);
            }
        });

        // Заголовок страницы
        var titleEl = document.querySelector("title[data-i18n]");
        if (titleEl) {
            const key = titleEl.getAttribute("data-i18n");
            const value = getNested(key, translations);
            if (value != null) {
                document.title = value;
            }
        }

        // Атрибут lang у html
        document.documentElement.lang = currentLang;

        updateLangSwitcher();
    }

    async function setLanguage(lang) {
        if (!LANG_URLS[lang]) {
            lang = DEFAULT_LANG;
        }

        if (lang === currentLang && Object.keys(translations).length > 0) {
            return;
        }

        try {
            const response = await fetch(LANG_URLS[lang], { cache: "no-store" });
            if (!response.ok) {
                throw new Error("Failed to load language file: " + response.status);
            }
            translations = await response.json();
            currentLang = lang;
            try {
                localStorage.setItem(STORAGE_KEY, lang);
            } catch (e) {
                // ignore
            }
            applyTranslations();
        } catch (error) {
            console.error("i18n: error loading language", error);
        }
    }

    function initLanguageSwitcher() {
        document.addEventListener("click", function (event) {
            const target = event.target.closest(".lang-btn[data-lang]");
            if (!target) return;
            const lang = target.getAttribute("data-lang");
            setLanguage(lang);
        });
    }

    function init() {
        initLanguageSwitcher();

        let initial = DEFAULT_LANG;
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved && LANG_URLS[saved]) {
                initial = saved;
            } else if (!saved && typeof navigator !== "undefined") {
                const navLang = (navigator.language || navigator.userLanguage || "").toLowerCase();
                if (navLang.indexOf("ru") === 0) {
                    initial = "ru";
                } else {
                    initial = "en";
                }
            }
        } catch (e) {
            // ignore
        }

        setLanguage(initial);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

    window.i18n = {
        apply: applyTranslations,
        t: function (key) {
            var v = getNested(key, translations);
            return v != null ? v : key;
        }
    };
})();

