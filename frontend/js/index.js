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
        var photoCount = car.photoCount != null ? car.photoCount : (car.hasPhoto ? 1 : 0);
        var images = [];
        if (car.hasPhoto && base && carId !== "" && photoCount > 0) {
            for (var i = 0; i < photoCount; i++) images.push(base + "/api/cars/" + carId + "/photos/" + i);
        }
        var imgSrc = images.length > 0 ? images[0] : PLACEHOLDER_IMG;
        var title = car.brandName + " " + car.modelName;
        var price = formatPrice(car.price);
        var gearbox = gearboxLabel(car.gearbox);
        var link = carId !== "" ? ("carpage.html#" + encodeURIComponent(String(carId))) : "catalog.html";
        var countText = images.length > 1 ? "1/" + images.length : "1/1";

        var card = document.createElement("div");
        card.className = "listing-card";
        card.dataset.images = JSON.stringify(images);
        card.innerHTML =
            "<div class=\"badge\">Новое</div>" +
            "<div class=\"listing-card-image\">" +
            "<a href=\"" + link + "\"><img src=\"" + imgSrc + "\" alt=\"" + title.replace(/"/g, "&quot;") + "\" onerror=\"this.src='" + PLACEHOLDER_IMG.replace(/'/g, "\\'") + "'\"></a>" +
            "<button class=\"carousel-prev\" type=\"button\" aria-label=\"Предыдущее фото\">&lt;</button>" +
            "<button class=\"carousel-next\" type=\"button\" aria-label=\"Следующее фото\">&gt;</button>" +
            "<span class=\"carousel-count\">" + countText + "</span>" +
            "</div>" +
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

    function initListingCardSliders(container) {
        if (!container) return;
        container.querySelectorAll(".listing-card").forEach(function (card) {
            var img = card.querySelector(".listing-card-image img");
            var prev = card.querySelector(".carousel-prev");
            var next = card.querySelector(".carousel-next");
            var count = card.querySelector(".carousel-count");
            var images = [];
            try { images = JSON.parse(card.dataset.images || "[]"); } catch (e) {}
            if (images.length <= 1) {
                if (prev) prev.style.display = "none";
                if (next) next.style.display = "none";
                if (count) count.style.display = "none";
                return;
            }
            var cur = 0;
            function update() {
                if (img) img.src = images[cur];
                if (count) count.textContent = (cur + 1) + "/" + images.length;
            }
            if (prev) prev.addEventListener("click", function (e) { e.preventDefault(); e.stopPropagation(); cur = (cur - 1 + images.length) % images.length; update(); });
            if (next) next.addEventListener("click", function (e) { e.preventDefault(); e.stopPropagation(); cur = (cur + 1) % images.length; update(); });
        });
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
        initListingCardSliders(grid);
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
