(function () {
    function getIds() {
        if (window.api && api.getCompareIds) return api.getCompareIds();
        try {
            var raw = localStorage.getItem("autoseller-compare");
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }

    function saveIds(ids) {
        if (window.api && api.setCompareIds) api.setCompareIds(ids);
        else localStorage.setItem("autoseller-compare", JSON.stringify(ids));
    }

    function updateHeaderCount() {
        if (window.api && api.updateCompareCount) {
            api.updateCompareCount();
            return;
        }
        var ids = getIds();
        document.querySelectorAll(".compare-count").forEach(function (el) {
            el.textContent = "(" + ids.length + ")";
        });
    }

    function setButtonState(btn, inList) {
        var t = window.i18n && window.i18n.t ? window.i18n.t : function () { return null; };
        btn.classList.toggle("in-compare", inList);
        var removeLabel = t("comparison.removeFromCompare") || "Убрать из сравнения";
        var addLabel = t("comparison.addToCompare") || "Добавить в сравнение";
        btn.title = inList ? removeLabel : addLabel;
        btn.setAttribute("aria-label", inList ? removeLabel : addLabel);
    }

    function initCardButtons() {
        var buttons = document.querySelectorAll(".btn-compare-card");
        var token = window.api && api.getToken();

        if (token) {
            api.get("/api/comparison").then(function (list) {
                var ids = (list || []).map(function (c) { return String(c.id); });
                buttons.forEach(function (btn) {
                    var id = btn.getAttribute("data-id");
                    if (!id) return;
                    setButtonState(btn, ids.indexOf(id) !== -1);
                    btn.onclick = function () {
                        var inList = btn.classList.contains("in-compare");
                        var carId = parseInt(id, 10);
                        var req = inList ? api.delete("/api/comparison/" + carId) : api.post("/api/comparison", { carId: carId });
                        req.then(function () {
                            setButtonState(btn, !inList);
                            api.updateCompareCount();
                        }).catch(function (err) {
                            var msg = (err && err.message) ? err.message : (window.i18n && window.i18n.t ? window.i18n.t("carpage.errorGeneric") : null) || "Ошибка";
                            alert(msg);
                        });
                    };
                });
            }).catch(function () {
                buttons.forEach(function (btn) {
                    setButtonState(btn, false);
                });
            });
        } else {
            buttons.forEach(function (btn) {
                var id = btn.getAttribute("data-id");
                if (!id) return;
                var ids = getIds();
                setButtonState(btn, ids.indexOf(String(id)) !== -1);
                btn.onclick = function () {
                    var ids = getIds();
                    var s = String(id);
                    var i = ids.indexOf(s);
                    if (i === -1) ids.push(s);
                    else ids.splice(i, 1);
                    saveIds(ids);
                    updateHeaderCount();
                    setButtonState(btn, ids.indexOf(s) !== -1);
                };
            });
        }
    }

    function init() {
        updateHeaderCount();
        initCardButtons();
    }

    window.initComparisonCardButtons = initCardButtons;

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
