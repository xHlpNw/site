(function () {
    var base = function () { return window.api ? api.getBaseUrl() : ""; };
    var formatPrice = function (n) { return new Intl.NumberFormat("ru-RU").format(n) + " ₽"; };
    var PLACEHOLDER_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect fill='%23ddd' width='300' height='200'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='14'%3ENет фото%3C/text%3E%3C/svg%3E";

    function getRoot() { return document.getElementById("favourites-root"); }

    function loadFavourites() {
        if (!window.api || !api.getToken()) return Promise.reject(new Error("Unauthorized"));
        return api.get("/api/favourites").then(function (list) { return list || []; });
    }

    function removeFromFavourites(carId) {
        return api.delete("/api/favourites/" + carId);
    }

    function render(list) {
        var root = getRoot();
        if (!root) return;

        if (!list || list.length === 0) {
            root.innerHTML = "<p class=\"favourites-empty\">В избранном пока нет автомобилей. <a href=\"catalog.html\">Перейти в каталог</a></p>";
            return;
        }

        var b = base();
        var gridHtml = "<div class=\"favourites-grid\">";
        list.forEach(function (car) {
            var carId = car.id !== undefined && car.id !== null ? car.id : (car.Id !== undefined && car.Id !== null ? car.Id : null);
            if (carId == null) return;
            carId = String(carId);
            var imgSrc = (car.hasPhoto || car.HasPhoto) && carId ? b + "/api/cars/" + carId + "/photos/0" : PLACEHOLDER_IMG;
            var title = (car.brandName || car.BrandName) + " " + (car.modelName || car.ModelName) + " " + (car.year || car.Year || "");
            var link = "carpage.html#" + encodeURIComponent(carId);
            gridHtml +=
                "<div class=\"favourite-card\" data-id=\"" + carId + "\">" +
                "<button type=\"button\" class=\"favourite-remove-btn\" aria-label=\"Убрать из избранного\" title=\"Убрать из избранного\">✕</button>" +
                "<a href=\"" + link + "\" class=\"favourite-card-image\">" +
                "<img src=\"" + imgSrc + "\" alt=\"" + title + "\" onerror=\"this.src='" + PLACEHOLDER_IMG.replace(/'/g, "\\'") + "'\">" +
                "</a>" +
                "<div class=\"favourite-card-content\">" +
                "<a href=\"" + link + "\" class=\"favourite-card-title\">" + title + "</a>" +
                "<p class=\"favourite-card-price\">" + formatPrice(car.price != null ? car.price : car.Price) + "</p>" +
                "<p class=\"favourite-card-meta\">" + new Intl.NumberFormat("ru-RU").format(car.mileage != null ? car.mileage : car.Mileage) + " км</p>" +
                "<a href=\"" + link + "\" class=\"favourite-card-details\">Подробнее</a>" +
                "</div></div>";
        });
        gridHtml += "</div>";
        root.innerHTML = gridHtml;

        root.querySelectorAll(".favourite-remove-btn").forEach(function (btn) {
            var card = btn.closest(".favourite-card");
            var id = card && parseInt(card.dataset.id, 10);
            if (!id) return;
            btn.addEventListener("click", function () {
                btn.disabled = true;
                removeFromFavourites(id).then(function () {
                    loadAndRender();
                }).catch(function (err) {
                    alert((err && err.message) || "Ошибка");
                    btn.disabled = false;
                });
            });
        });
    }

    function loadAndRender() {
        var root = getRoot();
        if (!root) return;

        if (!api.getToken()) {
            var returnUrl = encodeURIComponent(window.location.pathname.split("/").pop() || "favourites.html");
            window.location.replace("login.html?return=" + returnUrl);
            return;
        }

        root.innerHTML = "<p class=\"favourites-loading\">Загрузка...</p>";
        loadFavourites()
            .then(render)
            .catch(function (err) {
                if (err && (err.message === "Unauthorized" || err.status === 401)) {
                    var returnUrl = encodeURIComponent(window.location.pathname.split("/").pop() || "favourites.html");
                    window.location.replace("login.html?return=" + returnUrl);
                    return;
                }
                root.innerHTML = "<p class=\"favourites-error\">Не удалось загрузить избранное. <a href=\"catalog.html\">В каталог</a></p>";
            });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", loadAndRender);
    } else {
        loadAndRender();
    }
})();
