(function () {
    var base = function () { return window.api ? api.getBaseUrl() : ""; };
    var gearboxLabel = function (v) { return v === "at" ? "АКПП" : v === "mt" ? "Механика" : v || "—"; };
    var driveLabel = function (v) {
        var map = { fwd: "Передний", rwd: "Задний", awd: "Полный" };
        return map[v] || v || "—";
    };
    var bodyLabel = function (v) {
        var map = { sedan: "Седан", suv: "Кроссовер", coupe: "Купе" };
        return map[v] || v || "—";
    };
    var formatPrice = function (n) { return new Intl.NumberFormat("ru-RU").format(n) + " ₽"; };
    var formatDate = function (d) {
        try {
            return new Date(d).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
        } catch (e) { return d; }
    };

    function getCarId() {
        var hash = (window.location.hash || "").slice(1).trim();
        if (hash) {
            var m = /^id=(\d+)$/i.exec(hash) || /^(\d+)$/.exec(hash);
            if (m) return m[1];
        }
        var params = new URLSearchParams(window.location.search);
        var id = params.get("id") || "";
        if (id === "undefined" || id === "null" || id.trim() === "") return "";
        return id.trim();
    }

    function render(car) {
        var root = document.getElementById("carpage-root");
        if (!root) return;
        var b = base();
        var title = car.brandName + " " + car.modelName + " " + car.year;
        var priceStr = formatPrice(car.price);
        var photoCount = car.photoCount || 0;
        var mainImg = photoCount > 0 ? b + "/api/cars/" + car.id + "/photos/0" : "";
        var thumbHtml = "";
        for (var i = 0; i < photoCount; i++) {
            var src = b + "/api/cars/" + car.id + "/photos/" + i;
            thumbHtml += "<img src=\"" + src + "\" alt=\"Фото " + (i + 1) + "\" class=\"" + (i === 0 ? "active-thumb" : "") + "\">";
        }
        if (thumbHtml === "") thumbHtml = "<img src=\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150'/%3E%3Crect fill='%23ddd' width='200' height='150'/%3E%3C/svg%3E\" alt=\"Нет фото\" class=\"active-thumb\">";

        var mainColumn =
            "<div class=\"main-column\">" +
            "<h1>" + title + "</h1>" +
            "<section class=\"gallery\">" +
            "<figure><img src=\"" + (mainImg || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400'/%3E%3Crect fill='%23eee' width='600' height='400'/%3E%3C/svg%3E") + "\" alt=\"" + title + "\"></figure>" +
            "<div class=\"thumbnails\">" + thumbHtml + "</div>" +
            "</section>" +
            "<section class=\"characteristics\">" +
            "<h2>Характеристики</h2>" +
            "<div class=\"char-grid\">" +
            "<div class=\"char-item\"><img src=\"images/calendar-icon.png\" alt=\"\"><div class=\"char-text\"><p class=\"label\">Год выпуска</p><p class=\"value\">" + car.year + "</p></div></div>" +
            "<div class=\"char-item\"><img src=\"images/speedometer-icon.png\" alt=\"\"><div class=\"char-text\"><p class=\"label\">Пробег</p><p class=\"value\">" + new Intl.NumberFormat("ru-RU").format(car.mileage) + " км</p></div></div>" +
            "<div class=\"char-item\"><img src=\"images/settings.png\" alt=\"\"><div class=\"char-text\"><p class=\"label\">Двигатель</p><p class=\"value\">" + (car.engine || "—") + "</p></div></div>" +
            "<div class=\"char-item\"><img src=\"images/settings.png\" alt=\"\"><div class=\"char-text\"><p class=\"label\">Коробка</p><p class=\"value\">" + gearboxLabel(car.gearbox) + "</p></div></div>" +
            "<div class=\"char-item\"><img src=\"images/settings.png\" alt=\"\"><div class=\"char-text\"><p class=\"label\">Привод</p><p class=\"value\">" + driveLabel(car.driveType) + "</p></div></div>" +
            "<div class=\"char-item\"><img src=\"images/oil-icon.png\" alt=\"\"><div class=\"char-text\"><p class=\"label\">Тип кузова</p><p class=\"value\">" + bodyLabel(car.bodyType) + "</p></div></div>" +
            "</div></section>" +
            "<section class=\"description\">" +
            "<h2>Описание</h2>" +
            "<p>" + (car.description || "Нет описания.") + "</p>" +
            "<small class=\"published\">Опубликовано: " + formatDate(car.createdAt) + "</small>" +
            "</section></div>";

        var seller = car.seller || {};
        var contacts = "";
        if (seller.phoneNumber) contacts += "<li><a href=\"tel:" + seller.phoneNumber + "\">" + seller.phoneNumber + "</a></li>";
        if (seller.email) contacts += "<li><a href=\"mailto:" + seller.email + "\">" + seller.email + "</a></li>";
        if (!contacts) contacts = "<li>Контакты не указаны</li>";

        var sidebar =
            "<aside class=\"sidebar\">" +
            "<section class=\"offer\">" +
            "<p class=\"price\">" + priceStr + "</p>" +
            "<p class=\"car-title\">" + title + "</p>" +
            "<button type=\"button\" class=\"btn-favourite\" data-id=\"" + car.id + "\">В избранное</button>" +
            "<button type=\"button\" class=\"btn-compare\" data-id=\"" + car.id + "\">Добавить в сравнение</button>" +
            "</section>" +
            "<section class=\"seller\">" +
            "<h2>Продавец</h2>" +
            "<article><div class=\"seller-header\"><div class=\"seller-info\"><h3>" + (seller.fullName || "Продавец") + "</h3></div></div><hr><ul class=\"contacts\">" + contacts + "</ul></article>" +
            "</section></aside>";

        root.innerHTML = mainColumn + sidebar;
        document.title = title + " — AutoSeller";

        initGallery(root);
        initFavouriteButton(root, car.id, car.seller);
        initCompareButton(root, car.id);
    }

    function initGallery(root) {
        var mainImg = root.querySelector(".gallery figure img");
        var thumbs = root.querySelectorAll(".thumbnails img");
        if (!mainImg || thumbs.length === 0) return;
        thumbs.forEach(function (thumb, i) {
            thumb.addEventListener("click", function () {
                mainImg.src = thumb.src;
                thumbs.forEach(function (t) { t.classList.remove("active-thumb"); });
                thumb.classList.add("active-thumb");
            });
        });
    }

    function initFavouriteButton(root, carId, seller) {
        var btn = root.querySelector(".btn-favourite");
        if (!btn || !window.api) return;
        var token = api.getToken();
        if (!token) {
            btn.style.display = "none";
            return;
        }
        var user = api.getUser();
        var sellerId = seller != null && (seller.id !== undefined && seller.id !== null ? seller.id : seller.Id);
        var userId = user != null && (user.id !== undefined && user.id !== null ? user.id : user.Id);
        if (sellerId != null && userId != null && String(sellerId) === String(userId)) {
            btn.style.display = "none";
            return;
        }
        function setState(inFavourites) {
            btn.textContent = inFavourites ? "В избранном" : "В избранное";
            btn.classList.toggle("in-favourites", inFavourites);
        }
        api.get("/api/favourites").then(function (list) {
            var ids = (list || []).map(function (c) { return c.id; });
            setState(ids.indexOf(carId) !== -1);
        }).catch(function () { setState(false); });

        btn.addEventListener("click", function () {
            var inFavourites = btn.classList.contains("in-favourites");
            if (inFavourites) {
                api.delete("/api/favourites/" + carId).then(function () {
                    setState(false);
                }).catch(function (err) { alert((err && err.message) || "Ошибка"); });
            } else {
                api.post("/api/favourites", { carId: carId }).then(function () {
                    setState(true);
                }).catch(function (err) { alert((err && err.message) || "Ошибка"); });
            }
        });
    }

    function initCompareButton(root, carId) {
        var btn = root.querySelector(".btn-compare");
        if (!btn || !window.api) return;
        var token = api.getToken();
        function setState(inList) {
            btn.textContent = inList ? "В сравнении" : "Добавить в сравнение";
            btn.disabled = inList;
        }
        if (token) {
            api.get("/api/comparison").then(function (list) {
                var ids = (list || []).map(function (c) { return c.id; });
                setState(ids.indexOf(carId) !== -1);
            }).catch(function () { setState(false); });
        } else {
            var ids = api.getCompareIds().map(function (x) { return parseInt(x, 10); });
            setState(ids.indexOf(carId) !== -1);
        }
        btn.addEventListener("click", function () {
            if (btn.disabled) return;
            if (token) {
                api.post("/api/comparison", { carId: carId }).then(function () {
                    setState(true);
                    api.updateCompareCount();
                }).catch(function (err) { alert((err && err.message) || "Ошибка"); });
            } else {
                var ids = api.getCompareIds();
                var s = String(carId);
                if (ids.indexOf(s) === -1) ids.push(s);
                api.setCompareIds(ids);
                setState(true);
                api.updateCompareCount();
            }
        });
    }

    function run() {
        var id = getCarId();
        var root = document.getElementById("carpage-root");
        if (!id || !root) {
            if (root) root.innerHTML = "<p class=\"carpage-error\">Не указан id автомобиля. <a href=\"catalog.html\">В каталог</a></p>";
            return;
        }
        api.get("/api/cars/" + id)
            .then(function (car) { render(car); })
            .catch(function () {
                root.innerHTML = "<p class=\"carpage-error\">Объявление не найдено. <a href=\"catalog.html\">В каталог</a></p>";
            });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", run);
    } else {
        run();
    }
})();
