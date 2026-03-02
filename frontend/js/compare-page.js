(function () {
    var base = function () { return window.api ? api.getBaseUrl() : ""; };
    var formatPrice = function (n) { return new Intl.NumberFormat("ru-RU").format(n) + " ₽"; };
    var gearboxLabel = function (v) { return v === "at" ? "Автомат" : v === "mt" ? "Механика" : v || "—"; };
    var driveLabel = function (v) { var map = { fwd: "Передний", rwd: "Задний", awd: "Полный" }; return map[v] || v || "—"; };
    var bodyLabel = function (v) { var map = { sedan: "Седан", suv: "Кроссовер", coupe: "Купе" }; return map[v] || v || "—"; };

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
        root.querySelectorAll(".compare-card:not(.add-card)").forEach(function (card) {
            var imagesJson = card.dataset.images;
            var images = [];
            try {
                if (imagesJson) images = JSON.parse(decodeURIComponent(imagesJson));
            } catch (e) {}
            if (images.length <= 1) return;
            var img = card.querySelector(".car-image img");
            var prevBtn = card.querySelector(".compare-carousel-prev");
            var nextBtn = card.querySelector(".compare-carousel-next");
            var countEl = card.querySelector(".compare-carousel-count");
            if (!img || !prevBtn || !nextBtn) return;
            var cur = 0;
            function update() {
                img.src = images[cur];
                if (countEl) countEl.textContent = (cur + 1) + "/" + images.length;
            }
            prevBtn.addEventListener("click", function (e) {
                e.preventDefault();
                e.stopPropagation();
                cur = (cur - 1 + images.length) % images.length;
                update();
            });
            nextBtn.addEventListener("click", function (e) {
                e.preventDefault();
                e.stopPropagation();
                cur = (cur + 1) % images.length;
                update();
            });
        });
    }

    function render(list) {
        var root = getRoot();
        if (!root) return;
        if (!list || list.length === 0) {
            root.innerHTML = "<p class=\"compare-empty\">В сравнении пока нет автомобилей. <a href=\"catalog.html\">Перейти в каталог</a></p>";
            document.getElementById("compare-actions").style.display = "none";
            return;
        }
        var b = base();
        var gridHtml = "";
        list.forEach(function (car) {
            var photoCount = car.photoCount != null ? car.photoCount : (car.hasPhoto ? 1 : 0);
            var images = [];
            if (car.hasPhoto && b && photoCount > 0) {
                for (var i = 0; i < photoCount; i++) images.push(b + "/api/cars/" + car.id + "/photos/" + i);
            }
            var imgSrc = images.length > 0 ? images[0] : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150'/%3E%3Crect fill='%23ddd' width='200' height='150'/%3E%3C/svg%3E";
            var title = car.brandName + " " + car.modelName;
            var countText = images.length > 1 ? "1/" + images.length : "";
            gridHtml += "<div class=\"compare-card\" data-id=\"" + car.id + "\" data-images=\"" + (encodeURIComponent(JSON.stringify(images)) || "") + "\">" +
                "<button type=\"button\" class=\"remove-btn\" aria-label=\"Убрать из сравнения\">✕</button>" +
                "<div class=\"car-image compare-carousel\">" +
                "<a href=\"carpage.html?id=" + car.id + "\"><img src=\"" + imgSrc + "\" alt=\"" + title.replace(/"/g, "&quot;") + "\"></a>" +
                (images.length > 1
                    ? "<button type=\"button\" class=\"compare-carousel-prev\" aria-label=\"Предыдущее фото\">&lt;</button>" +
                      "<button type=\"button\" class=\"compare-carousel-next\" aria-label=\"Следующее фото\">&gt;</button>" +
                      "<span class=\"compare-carousel-count\">1/" + images.length + "</span>"
                    : "") +
                "</div>" +
                "<div class=\"car-info\">" +
                "<p class=\"car-title\">" + title.replace(/</g, "&lt;").replace(/>/g, "&gt;") + "</p>" +
                "<p class=\"price\">" + formatPrice(car.price) + "</p>" +
                "<p class=\"badge\">" + bodyLabel(car.bodyType) + "</p>" +
                "</div></div>";
        });
        gridHtml += "<div class=\"compare-card add-card\"><a href=\"catalog.html\" class=\"add-content\">＋ Добавить ещё авто</a></div>";

        var headers = list.map(function (c) { return c.brandName + " " + c.modelName; });
        var thCells = headers.map(function (h) { return "<th>" + h + "</th>"; }).join("");
        var rows = [
            { label: "Цена", icon: "price-icon.png", key: "price", fmt: formatPrice },
            { label: "Год выпуска", icon: "calendar-icon.png", key: "year", fmt: function (v) { return v; } },
            { label: "Пробег", icon: "speedometer-icon.png", key: "mileage", fmt: function (v) { return new Intl.NumberFormat("ru-RU").format(v) + " км"; } },
            { label: "Коробка передач", icon: "settings.png", key: "gearbox", fmt: gearboxLabel },
            { label: "Привод", icon: "settings.png", key: "driveType", fmt: driveLabel },
            { label: "Тип кузова", icon: "settings.png", key: "bodyType", fmt: bodyLabel }
        ];
        var tbody = rows.map(function (r) {
            var cells = list.map(function (c) { return "<td>" + (r.fmt(c[r.key]) || "—") + "</td>"; }).join("");
            return "<tr><th scope=\"row\"><img class=\"icon\" src=\"images/" + r.icon + "\" alt=\"\">" + r.label + "</th>" + cells + "</tr>";
        }).join("");

        root.innerHTML =
            "<div class=\"compare-grid\">" + gridHtml + "</div>" +
            "<section class=\"compare-table\">" +
            "<table><thead><tr><th>Характеристики</th>" + thCells + "</tr></thead><tbody>" + tbody + "</tbody></table>" +
            "</section>";

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
        if (root) root.innerHTML = "<p class=\"compare-loading\">Загрузка...</p>";
        loadComparisonList().then(render).catch(function () {
            if (root) root.innerHTML = "<p class=\"compare-error\">Ошибка загрузки. <a href=\"catalog.html\">В каталог</a></p>";
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", loadAndRender);
    } else {
        loadAndRender();
    }
})();
