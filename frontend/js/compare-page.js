(function () {
    var base = function () { return window.api ? api.getBaseUrl() : ""; };
    var t = function (key) { return window.i18n && window.i18n.t ? window.i18n.t(key) : null; };
    var formatPrice = function (n) { return new Intl.NumberFormat("ru-RU").format(n) + " ₽"; };
    var gearboxLabel = function (v) {
        if (v === "at") return t("catalog.gearboxAuto") || "Автомат";
        if (v === "mt") return t("catalog.gearboxManual") || "Механика";
        return v || "—";
    };
    var driveLabel = function (v) {
        var map = { fwd: t("newpost.driveFwd") || "Передний", rwd: t("newpost.driveRwd") || "Задний", awd: t("newpost.driveAwd") || "Полный" };
        return map[v] || v || "—";
    };
    var bodyLabel = function (v) {
        var map = {
            sedan: t("catalog.bodySedan") || "Седан",
            suv: t("catalog.bodySuv") || "Кроссовер",
            coupe: t("catalog.bodyCoupe") || "Купе",
            pickup: t("catalog.bodyPickup") || "Пикап",
            cabrio: t("catalog.bodyCabrio") || "Кабриолет",
            sport: t("catalog.bodySport") || "Спорткар"
        };
        return map[v] || v || "—";
    };

    function getRoot() { return document.getElementById("compare-root"); }

    function loadComparisonList() {
        var token = window.api && api.getToken();
        if (token) {
            return api.get("/api/comparison").then(function (list) {
                return list || [];
            });
        }
        var ids = api.getCompareIds();
        if (ids.length === 0) return Promise.resolve([]);
        return Promise.all(ids.map(function (id) {
            return api.get("/api/cars/" + id).catch(function () { return null; });
        })).then(function (results) {
            return results.filter(Boolean);
        });
    }

    function removeCar(carId) {
        var token = api.getToken();
        if (token) {
            return api.delete("/api/comparison/" + carId).then(function () {
                api.updateCompareCount();
            });
        }
        var ids = api.getCompareIds().filter(function (x) { return x !== String(carId); });
        api.setCompareIds(ids);
        api.updateCompareCount();
        return Promise.resolve();
    }

    function clearAll(cars) {
        var token = api.getToken();
        if (token) {
            return Promise.all(cars.map(function (c) { return api.delete("/api/comparison/" + c.id); })).then(function () {
                api.updateCompareCount();
            });
        }
        api.setCompareIds([]);
        api.updateCompareCount();
        return Promise.resolve();
    }

    function initCompareCardCarousels(root) {
        if (!root) return;
        var b = base();
        root.querySelectorAll(".compare-card:not(.add-card)").forEach(function (card) {
            var carId = card.dataset.carId || card.dataset.id || "";
            var photoCount = parseInt(card.dataset.photoCount, 10) || 0;
            if (photoCount <= 1) return;
            var img = card.querySelector(".car-image img");
            var prevBtn = card.querySelector(".compare-carousel-prev");
            var nextBtn = card.querySelector(".compare-carousel-next");
            var countEl = card.querySelector(".compare-carousel-count");
            if (!img || !prevBtn || !nextBtn) return;
            var firstPhotoUrl = img.src;
            var cache = {};
            var cur = 0;
            function setCount() {
                if (countEl) countEl.textContent = (cur + 1) + "/" + photoCount;
            }
            function showIndex(index) {
                cur = (index + photoCount) % photoCount;
                if (cur === 0) {
                    img.src = firstPhotoUrl;
                    setCount();
                    return;
                }
                if (cache[cur]) {
                    img.src = cache[cur];
                    setCount();
                    return;
                }
                var url = b + "/api/cars/" + carId + "/photos/" + cur;
                fetch(url, { method: "GET", headers: window.api && window.api.getAuthHeaders ? window.api.getAuthHeaders() : {} })
                    .then(function (r) { return r.ok ? r.blob() : Promise.reject(); })
                    .then(function (blob) {
                        cache[cur] = URL.createObjectURL(blob);
                        img.src = cache[cur];
                        setCount();
                    })
                    .catch(function () { setCount(); });
            }
            prevBtn.addEventListener("click", function (e) {
                e.preventDefault();
                e.stopPropagation();
                showIndex(cur - 1);
            });
            nextBtn.addEventListener("click", function (e) {
                e.preventDefault();
                e.stopPropagation();
                showIndex(cur + 1);
            });
        });
    }

    function render(list) {
        var root = getRoot();
        if (!root) return;
        if (!list || list.length === 0) {
            root.innerHTML = "<p class=\"compare-empty\"><span data-i18n=\"comparison.empty\">В сравнении пока нет автомобилей. </span><a href=\"catalog.html\" data-i18n=\"comparison.toCatalog\">Перейти в каталог</a></p>";
            document.getElementById("compare-actions").style.display = "none";
            if (window.i18n && window.i18n.apply) window.i18n.apply();
            return;
        }
        var b = base();
        var gridHtml = "";
        list.forEach(function (car) {
            var photoCount = car.photoCount != null ? car.photoCount : (car.hasPhoto ? 1 : 0);
            var firstPhotoUrl = (car.hasPhoto && b && photoCount > 0) ? b + "/api/cars/" + car.id + "/photos/0" : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150'/%3E%3Crect fill='%23ddd' width='200' height='150'/%3E%3C/svg%3E";
            var title = car.brandName + " " + car.modelName;
            var countText = photoCount > 1 ? "1/" + photoCount : "";
            var removeLabel = (t("comparison.removeFromCompare") || "Убрать из сравнения").replace(/"/g, "&quot;");
            var prevPhotoLabel = (t("catalog.prevPhoto") || "Предыдущее фото").replace(/"/g, "&quot;");
            var nextPhotoLabel = (t("catalog.nextPhoto") || "Следующее фото").replace(/"/g, "&quot;");
            gridHtml += "<div class=\"compare-card\" data-id=\"" + car.id + "\" data-car-id=\"" + car.id + "\" data-photo-count=\"" + photoCount + "\">" +
                "<button type=\"button\" class=\"remove-btn\" aria-label=\"" + removeLabel + "\">✕</button>" +
                "<div class=\"car-image compare-carousel\">" +
                "<a href=\"carpage.html?id=" + car.id + "\"><img src=\"" + firstPhotoUrl + "\" alt=\"" + title.replace(/"/g, "&quot;") + "\"></a>" +
                (photoCount > 1
                    ? "<button type=\"button\" class=\"compare-carousel-prev\" aria-label=\"" + prevPhotoLabel + "\">&lt;</button>" +
                      "<button type=\"button\" class=\"compare-carousel-next\" aria-label=\"" + nextPhotoLabel + "\">&gt;</button>" +
                      "<span class=\"compare-carousel-count\">1/" + photoCount + "</span>"
                    : "") +
                "</div>" +
                "<div class=\"car-info\">" +
                "<p class=\"car-title\">" + title.replace(/</g, "&lt;").replace(/>/g, "&gt;") + "</p>" +
                "<p class=\"price\">" + formatPrice(car.price) + "</p>" +
                "<p class=\"badge\">" + bodyLabel(car.bodyType) + "</p>" +
                "</div></div>";
        });
        gridHtml += "<div class=\"compare-card add-card\"><a href=\"catalog.html\" class=\"add-content\">" + (t("comparison.addMore") || "＋ Добавить ещё авто").replace(/</g, "&lt;").replace(/>/g, "&gt;") + "</a></div>";

        var charLabel = t("comparison.characteristics") || "Характеристики";
        var headers = list.map(function (c) { return c.brandName + " " + c.modelName; });
        var thCells = headers.map(function (h) { return "<th>" + h.replace(/</g, "&lt;").replace(/>/g, "&gt;") + "</th>"; }).join("");
        var rows = [
            { labelKey: "comparison.price", icon: "price-icon.png", key: "price", fmt: formatPrice },
            { labelKey: "comparison.year", icon: "calendar-icon.png", key: "year", fmt: function (v) { return v; } },
            { labelKey: "comparison.mileage", icon: "speedometer-icon.png", key: "mileage", fmt: function (v) { return new Intl.NumberFormat("ru-RU").format(v) + " км"; } },
            { labelKey: "comparison.gearbox", icon: "settings.png", key: "gearbox", fmt: gearboxLabel },
            { labelKey: "comparison.drive", icon: "settings.png", key: "driveType", fmt: driveLabel },
            { labelKey: "comparison.bodyType", icon: "settings.png", key: "bodyType", fmt: bodyLabel }
        ];
        var tbody = rows.map(function (r) {
            var label = t(r.labelKey) || r.labelKey;
            var cells = list.map(function (c) { return "<td>" + (r.fmt(c[r.key]) || "—") + "</td>"; }).join("");
            return "<tr><th scope=\"row\"><img class=\"icon\" src=\"images/" + r.icon + "\" alt=\"\">" + label.replace(/</g, "&lt;").replace(/>/g, "&gt;") + "</th>" + cells + "</tr>";
        }).join("");

        root.innerHTML =
            "<div class=\"compare-grid\">" + gridHtml + "</div>" +
            "<section class=\"compare-table\">" +
            "<table><thead><tr><th>" + (charLabel.replace(/</g, "&lt;").replace(/>/g, "&gt;")) + "</th>" + thCells + "</tr></thead><tbody>" + tbody + "</tbody></table>" +
            "</section>";

        if (window.i18n && window.i18n.apply) window.i18n.apply();

        root.querySelectorAll(".remove-btn").forEach(function (btn) {
            var card = btn.closest(".compare-card");
            var id = card && parseInt(card.dataset.id, 10);
            if (!id) return;
            btn.addEventListener("click", function () {
                removeCar(id).then(function () { loadAndRender(); });
            });
        });

        initCompareCardCarousels(root);

        var clearBtn = document.querySelector("#compare-actions .clear-btn");
        if (clearBtn) {
            clearBtn.onclick = function () {
                clearAll(list).then(function () { loadAndRender(); });
            };
        }
        document.getElementById("compare-actions").style.display = "block";
    }

    function loadAndRender() {
        var root = getRoot();
        if (root) {
            root.innerHTML = "<p class=\"compare-loading\" data-i18n=\"comparison.loading\">Загрузка...</p>";
            if (window.i18n && window.i18n.apply) window.i18n.apply();
        }
        loadComparisonList().then(render).catch(function () {
            if (root) {
                root.innerHTML = "<p class=\"compare-error\"><span data-i18n=\"comparison.loadError\">Ошибка загрузки. </span><a href=\"catalog.html\" data-i18n=\"comparison.toCatalog\">В каталог</a></p>";
                if (window.i18n && window.i18n.apply) window.i18n.apply();
            }
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", loadAndRender);
    } else {
        loadAndRender();
    }
})();
