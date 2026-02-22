(function () {
    var PLACEHOLDER_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect fill='%23ddd' width='300' height='200'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='14'%3ENет фото%3C/text%3E%3C/svg%3E";

    function gearboxLabel(v) {
        return v === "at" ? "Автомат" : v === "mt" ? "Механика" : v || "—";
    }

    function formatPrice(n) {
        return new Intl.NumberFormat("ru-RU").format(n) + " ₽";
    }

    function buildListingCard(car) {
        var carId = car.id !== undefined && car.id !== null ? car.id : (car.Id !== undefined && car.Id !== null ? car.Id : null);
        if (carId == null) carId = "";
        var base = window.api ? api.getBaseUrl() : "";
        var imgSrc = car.hasPhoto && base && carId !== "" ? base + "/api/cars/" + carId + "/photos/0" : PLACEHOLDER_IMG;
        var title = car.brandName + " " + car.modelName;
        var price = formatPrice(car.price);
        var gearbox = gearboxLabel(car.gearbox);
        var link = carId !== "" ? ("carpage.html#" + encodeURIComponent(String(carId))) : "catalog.html";

        var card = document.createElement("div");
        card.className = "listing-card";
        card.innerHTML =
            "<div class=\"badge\">Новое</div>" +
            "<a href=\"" + link + "\"><img src=\"" + imgSrc + "\" alt=\"" + title.replace(/"/g, "&quot;") + "\" onerror=\"this.src='" + PLACEHOLDER_IMG.replace(/'/g, "\\'") + "'\"></a>" +
            "<div class=\"info-container\">" +
            "<p class=\"car-title\">" + title.replace(/</g, "&lt;").replace(/>/g, "&gt;") + "</p>" +
            "<p class=\"price\">" + price + "</p>" +
            "<ul class=\"details\">" +
            "<li><img src=\"images/calendar-icon.png\" alt=\"год\"> " + car.year + " год</li>" +
            "<li><img src=\"images/speedometer-icon.png\" alt=\"пробег\"> " + new Intl.NumberFormat("ru-RU").format(car.mileage) + " км</li>" +
            "<li><img src=\"images/oil-icon.png\" alt=\"КПП\"> " + gearbox + "</li>" +
            "</ul>" +
            "<a href=\"" + link + "\" class=\"btn\">Подробнее</a>" +
            "</div>";
        return card;
    }

    function renderListings(list) {
        var grid = document.getElementById("listings-grid");
        var loading = document.getElementById("listings-loading");
        if (!grid) return;
        if (loading) loading.remove();
        grid.innerHTML = "";
        if (!list || list.length === 0) {
            grid.innerHTML = "<p class=\"listings-empty\">Пока нет объявлений. <a href=\"newpost.html\">Разместить объявление</a></p>";
            return;
        }
        list.forEach(function (car) {
            grid.appendChild(buildListingCard(car));
        });
    }

    function loadListings() {
        var grid = document.getElementById("listings-grid");
        var loading = document.getElementById("listings-loading");
        if (loading) loading.textContent = "Загрузка...";
        if (!window.api) {
            if (loading) loading.textContent = "Ошибка: API не загружен.";
            return;
        }
        api.get("/api/cars?limit=8")
            .then(function (list) {
                renderListings(list);
            })
            .catch(function () {
                if (grid) grid.innerHTML = "<p class=\"listings-error\">Не удалось загрузить объявления. Проверьте подключение к API.</p>";
            });
    }

    function init() {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", loadListings);
        } else {
            loadListings();
        }
    }
    init();
})();
