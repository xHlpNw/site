(function () {
    var base = function () { return window.api ? api.getBaseUrl() : ""; };
    var t = function (key) { return window.i18n && window.i18n.t ? window.i18n.t(key) : null; };
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
        var photoLabel = t("carpage.photo") || "Фото";
        var noPhotoAlt = t("carpage.noPhoto") || "Нет фото";
        var prevPhotoLabel = t("carpage.prevPhoto") || "Предыдущее фото";
        var nextPhotoLabel = t("carpage.nextPhoto") || "Следующее фото";
        var thumbHtml = "";
        for (var i = 0; i < photoCount; i++) {
            var src = b + "/api/cars/" + car.id + "/photos/" + i;
            thumbHtml += "<img src=\"" + src + "\" alt=\"" + photoLabel + " " + (i + 1) + "\" class=\"" + (i === 0 ? "active-thumb" : "") + "\">";
        }
        if (thumbHtml === "") thumbHtml = "<img src=\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150'/%3E%3Crect fill='%23ddd' width='200' height='150'/%3E%3C/svg%3E\" alt=\"" + noPhotoAlt.replace(/"/g, "&quot;") + "\" class=\"active-thumb\">";
        var galleryArrowsHtml = photoCount > 1
            ? "<button type=\"button\" class=\"gallery-prev\" aria-label=\"" + prevPhotoLabel.replace(/"/g, "&quot;") + "\">&lt;</button>" +
              "<button type=\"button\" class=\"gallery-next\" aria-label=\"" + nextPhotoLabel.replace(/"/g, "&quot;") + "\">&gt;</button>" +
              "<span class=\"gallery-count\">1/" + photoCount + "</span>"
            : "";

        var noDesc = t("carpage.noDescription") || "Нет описания.";
        var publishedPrefix = t("carpage.published") || "Опубликовано: ";
        var mainColumn =
            "<div class=\"main-column\">" +
            "<h1>" + title.replace(/</g, "&lt;").replace(/>/g, "&gt;") + "</h1>" +
            "<section class=\"gallery\">" +
            "<figure class=\"gallery-figure\">" +
            "<img src=\"" + (mainImg || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400'/%3E%3Crect fill='%23eee' width='600' height='400'/%3E%3C/svg%3E") + "\" alt=\"" + title.replace(/"/g, "&quot;") + "\">" +
            galleryArrowsHtml +
            "</figure>" +
            "<div class=\"thumbnails\">" + thumbHtml + "</div>" +
            "</section>" +
            "<section class=\"characteristics\">" +
            "<h2 data-i18n=\"carpage.characteristics\">Характеристики</h2>" +
            "<div class=\"char-grid\">" +
            "<div class=\"char-item\"><img src=\"images/calendar-icon.png\" alt=\"\"><div class=\"char-text\"><p class=\"label\" data-i18n=\"carpage.year\">Год выпуска</p><p class=\"value\">" + car.year + "</p></div></div>" +
            "<div class=\"char-item\"><img src=\"images/speedometer-icon.png\" alt=\"\"><div class=\"char-text\"><p class=\"label\" data-i18n=\"carpage.mileage\">Пробег</p><p class=\"value\">" + new Intl.NumberFormat("ru-RU").format(car.mileage) + " км</p></div></div>" +
            "<div class=\"char-item\"><img src=\"images/settings.png\" alt=\"\"><div class=\"char-text\"><p class=\"label\" data-i18n=\"carpage.engine\">Двигатель</p><p class=\"value\">" + (car.engine ? car.engine.replace(/</g, "&lt;").replace(/>/g, "&gt;") : "—") + "</p></div></div>" +
            "<div class=\"char-item\"><img src=\"images/settings.png\" alt=\"\"><div class=\"char-text\"><p class=\"label\" data-i18n=\"carpage.gearbox\">Коробка</p><p class=\"value\">" + gearboxLabel(car.gearbox) + "</p></div></div>" +
            "<div class=\"char-item\"><img src=\"images/settings.png\" alt=\"\"><div class=\"char-text\"><p class=\"label\" data-i18n=\"carpage.drive\">Привод</p><p class=\"value\">" + driveLabel(car.driveType) + "</p></div></div>" +
            "<div class=\"char-item\"><img src=\"images/oil-icon.png\" alt=\"\"><div class=\"char-text\"><p class=\"label\" data-i18n=\"carpage.bodyType\">Тип кузова</p><p class=\"value\">" + bodyLabel(car.bodyType) + "</p></div></div>" +
            "</div></section>" +
            "<section class=\"description\">" +
            "<h2 data-i18n=\"carpage.description\">Описание</h2>" +
            "<p>" + (car.description ? car.description.replace(/</g, "&lt;").replace(/>/g, "&gt;") : noDesc) + "</p>" +
            "<small class=\"published\"><span data-i18n=\"carpage.published\">Опубликовано: </span>" + formatDate(car.createdAt) + "</small>" +
            "</section></div>";

        var seller = car.seller || {};
        var contacts = "";
        if (seller.phoneNumber) contacts += "<li><a href=\"tel:" + seller.phoneNumber + "\">" + seller.phoneNumber + "</a></li>";
        if (seller.email) contacts += "<li><a href=\"mailto:" + seller.email + "\">" + seller.email + "</a></li>";
        if (!contacts) contacts = "<li data-i18n=\"carpage.contactsNotSpecified\">Контакты не указаны</li>";

        var token = window.api ? api.getToken() : null;
        var user = window.api ? api.getUser() : null;
        var sellerId = seller.id !== undefined && seller.id !== null ? seller.id : (seller.Id !== undefined && seller.Id !== null ? seller.Id : null);
        var userId = user != null && (user.id !== undefined && user.id !== null ? user.id : user.Id);
        var isOwner = !!(token && user && sellerId != null && userId != null && String(sellerId) === String(userId));

        var deleteBtnText = t("carpage.deleteAd") || "Удалить объявление";
        var deleteBtnHtml = isOwner ? "<button type=\"button\" class=\"btn-delete-ad\" data-id=\"" + car.id + "\" data-i18n=\"carpage.deleteAd\">" + deleteBtnText + "</button>" : "";

        var toFavText = t("carpage.toFavourites") || "В избранное";
        var addCompareText = t("carpage.addToCompare") || "Добавить в сравнение";
        var sellerTitle = t("carpage.seller") || "Продавец";
        var sellerDefaultName = t("carpage.sellerDefault") || "Продавец";
        var sidebar =
            "<aside class=\"sidebar\">" +
            "<section class=\"offer\">" +
            "<p class=\"price\">" + priceStr + "</p>" +
            "<p class=\"car-title\">" + title.replace(/</g, "&lt;").replace(/>/g, "&gt;") + "</p>" +
            "<button type=\"button\" class=\"btn-favourite\" data-id=\"" + car.id + "\" data-i18n=\"carpage.toFavourites\">" + toFavText + "</button>" +
            "<button type=\"button\" class=\"btn-compare\" data-id=\"" + car.id + "\" data-i18n=\"carpage.addToCompare\">" + addCompareText + "</button>" +
            deleteBtnHtml +
            "</section>" +
            "<section class=\"seller\">" +
            "<h2 data-i18n=\"carpage.seller\">Продавец</h2>" +
            "<article><div class=\"seller-header\"><div class=\"seller-info\"><h3>" + (seller.fullName ? seller.fullName.replace(/</g, "&lt;").replace(/>/g, "&gt;") : sellerDefaultName) + "</h3></div></div><hr><ul class=\"contacts\">" + contacts + "</ul></article>" +
            "</section></aside>";

        root.innerHTML = mainColumn + sidebar;
        document.title = title + " — AutoSeller";
        if (window.i18n && window.i18n.apply) window.i18n.apply();

        initGallery(root);
        initFavouriteButton(root, car.id, car.seller);
        initCompareButton(root, car.id);
        if (isOwner) initDeleteButton(root, car.id);
    }

    function initGallery(root) {
        var figure = root.querySelector(".gallery figure");
        var mainImg = root.querySelector(".gallery figure img");
        var thumbs = root.querySelectorAll(".thumbnails img");
        var prevBtn = root.querySelector(".gallery-prev");
        var nextBtn = root.querySelector(".gallery-next");
        var countEl = root.querySelector(".gallery-count");
        if (!mainImg || thumbs.length === 0) return;

        var total = thumbs.length;
        var cur = 0;

        function updateMain(index) {
            cur = (index + total) % total;
            mainImg.src = thumbs[cur].src;
            thumbs.forEach(function (t, i) { t.classList.toggle("active-thumb", i === cur); });
            if (countEl) countEl.textContent = (cur + 1) + "/" + total;
        }

        thumbs.forEach(function (thumb, i) {
            thumb.addEventListener("click", function () {
                updateMain(i);
            });
        });

        if (prevBtn) {
            prevBtn.addEventListener("click", function () {
                updateMain(cur - 1);
            });
        }
        if (nextBtn) {
            nextBtn.addEventListener("click", function () {
                updateMain(cur + 1);
            });
        }
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
            var t = window.i18n && window.i18n.t ? window.i18n.t : function () { return null; };
            btn.textContent = inFavourites ? (t("carpage.inFavourites") || "В избранном") : (t("carpage.toFavourites") || "В избранное");
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
                }).catch(function (err) { alert((err && err.message) || (window.i18n && window.i18n.t ? window.i18n.t("carpage.errorGeneric") : null) || "Ошибка"); });
            } else {
                api.post("/api/favourites", { carId: carId }).then(function () {
                    setState(true);
                }).catch(function (err) { alert((err && err.message) || (window.i18n && window.i18n.t ? window.i18n.t("carpage.errorGeneric") : null) || "Ошибка"); });
            }
        });
    }

    function initCompareButton(root, carId) {
        var btn = root.querySelector(".btn-compare");
        if (!btn || !window.api) return;
        var token = api.getToken();
        function setState(inList) {
            var t = window.i18n && window.i18n.t ? window.i18n.t : function () { return null; };
            btn.textContent = inList ? (t("carpage.inComparison") || "В сравнении") : (t("carpage.addToCompare") || "Добавить в сравнение");
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
                }).catch(function (err) { alert((err && err.message) || (window.i18n && window.i18n.t ? window.i18n.t("carpage.errorGeneric") : null) || "Ошибка"); });
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

    function initDeleteButton(root, carId) {
        var btn = root.querySelector(".btn-delete-ad");
        if (!btn || !window.api) return;
        btn.addEventListener("click", function () {
            var msg = (window.i18n && window.i18n.t ? window.i18n.t("carpage.deleteConfirm") : null) || "Удалить объявление? Это действие нельзя отменить.";
            if (!confirm(msg)) return;
            btn.disabled = true;
            api.delete("/api/cars/" + carId)
                .then(function () {
                    window.location.href = "catalog.html";
                })
                .catch(function (err) {
                    btn.disabled = false;
                    alert((err && err.message) || (window.i18n && window.i18n.t ? window.i18n.t("carpage.deleteError") : null) || "Не удалось удалить объявление");
                });
        });
    }

    function run() {
        var id = getCarId();
        var root = document.getElementById("carpage-root");
        if (!id || !root) {
            if (root) {
                root.innerHTML = "<p class=\"carpage-error\"><span data-i18n=\"carpage.errorNoId\">Не указан id автомобиля.</span> <a href=\"catalog.html\" data-i18n=\"carpage.toCatalog\">В каталог</a></p>";
                if (window.i18n && window.i18n.apply) window.i18n.apply();
            }
            return;
        }
        api.get("/api/cars/" + id)
            .then(function (car) { render(car); })
            .catch(function () {
                root.innerHTML = "<p class=\"carpage-error\"><span data-i18n=\"carpage.errorNotFound\">Объявление не найдено.</span> <a href=\"catalog.html\" data-i18n=\"carpage.toCatalog\">В каталог</a></p>";
                if (window.i18n && window.i18n.apply) window.i18n.apply();
            });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", run);
    } else {
        run();
    }
})();
