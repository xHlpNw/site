(function () {
    var PLACEHOLDER_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect fill='%23ddd' width='300' height='200'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='14'%3ENет фото%3C/text%3E%3C/svg%3E";

    function gearboxLabel(v) {
        var t = window.i18n && window.i18n.t;
        if (v === "at") return t ? t("catalog.gearboxAuto") : "Автомат";
        if (v === "mt") return t ? t("catalog.gearboxManual") : "Механика";
        return v || "—";
    }

    function formatPrice(n) {
        return new Intl.NumberFormat("ru-RU").format(n) + " ₽";
    }

    function buildListingCard(car) {
        var carId = car.id !== undefined && car.id !== null ? car.id : (car.Id !== undefined && car.Id !== null ? car.Id : null);
        if (carId == null) carId = "";
        var base = window.api ? api.getBaseUrl() : "";
        var photoCount = car.photoCount != null ? car.photoCount : (car.hasPhoto ? 1 : 0);
        var firstPhotoUrl = (car.hasPhoto && base && carId !== "" && photoCount > 0) ? base + "/api/cars/" + carId + "/photos/0" : PLACEHOLDER_IMG;
        var imgSrc = firstPhotoUrl;
        var title = car.brandName + " " + car.modelName;
        var price = formatPrice(car.price);
        var gearbox = gearboxLabel(car.gearbox);
        var link = carId !== "" ? ("carpage.html#" + encodeURIComponent(String(carId))) : "catalog.html";
        var countText = photoCount > 1 ? "1/" + photoCount : "1/1";

        var card = document.createElement("div");
        card.className = "listing-card";
        card.dataset.carId = String(carId);
        card.dataset.photoCount = String(photoCount);
        var t = window.i18n && window.i18n.t;
        var kmLabel = t ? t("home.km") : "км";
        var prevPhotoLabel = t ? t("catalog.prevPhoto") : "Предыдущее фото";
        var nextPhotoLabel = t ? t("catalog.nextPhoto") : "Следующее фото";
        var detailsLabel = t ? t("profile.details") : "Подробнее";

        card.innerHTML =
            "<div class=\"listing-card-image\">" +
            "<a href=\"" + link + "\"><img src=\"" + imgSrc + "\" alt=\"" + title.replace(/"/g, "&quot;") + "\" onerror=\"this.src='" + PLACEHOLDER_IMG.replace(/'/g, "\\'") + "'\"></a>" +
            "<button class=\"carousel-prev\" type=\"button\" aria-label=\"" + prevPhotoLabel.replace(/"/g, "&quot;") + "\">&lt;</button>" +
            "<button class=\"carousel-next\" type=\"button\" aria-label=\"" + nextPhotoLabel.replace(/"/g, "&quot;") + "\">&gt;</button>" +
            "<span class=\"carousel-count\">" + countText + "</span>" +
            "</div>" +
            "<div class=\"info-container\">" +
            "<p class=\"car-title\">" + title.replace(/</g, "&lt;").replace(/>/g, "&gt;") + "</p>" +
            "<p class=\"price\">" + price + "</p>" +
            "<ul class=\"details\">" +
            "<li><img src=\"images/calendar-icon.png\" alt=\"\"> " + car.year + "</li>" +
            "<li><img src=\"images/speedometer-icon.png\" alt=\"\"> " + new Intl.NumberFormat("ru-RU").format(car.mileage) + " " + kmLabel + "</li>" +
            "<li><img src=\"images/oil-icon.png\" alt=\"\"> " + gearbox + "</li>" +
            "</ul>" +
            "<a href=\"" + link + "\" class=\"btn\">" + detailsLabel + "</a>" +
            "</div>";
        return card;
    }

    function initListingCardSliders(container) {
        if (!container) return;
        var base = window.api ? api.getBaseUrl() : "";
        container.querySelectorAll(".listing-card").forEach(function (card) {
            var img = card.querySelector(".listing-card-image img");
            var prev = card.querySelector(".carousel-prev");
            var next = card.querySelector(".carousel-next");
            var count = card.querySelector(".carousel-count");
            var carId = card.dataset.carId || "";
            var photoCount = parseInt(card.dataset.photoCount, 10) || 0;
            if (photoCount <= 1) {
                if (prev) prev.style.display = "none";
                if (next) next.style.display = "none";
                if (count) count.style.display = "none";
                return;
            }
            var firstPhotoUrl = img ? img.src : "";
            var cache = {};
            var cur = 0;
            function setCount() {
                if (count) count.textContent = (cur + 1) + "/" + photoCount;
            }
            function showIndex(index) {
                cur = (index + photoCount) % photoCount;
                if (!img) return;
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
                var url = base + "/api/cars/" + carId + "/photos/" + cur;
                fetch(url, { method: "GET", headers: window.api && window.api.getAuthHeaders ? window.api.getAuthHeaders() : {} })
                    .then(function (r) { return r.ok ? r.blob() : Promise.reject(); })
                    .then(function (blob) {
                        cache[cur] = URL.createObjectURL(blob);
                        img.src = cache[cur];
                        setCount();
                    })
                    .catch(function () { setCount(); });
            }
            if (prev) prev.addEventListener("click", function (e) { e.preventDefault(); e.stopPropagation(); showIndex(cur - 1); });
            if (next) next.addEventListener("click", function (e) { e.preventDefault(); e.stopPropagation(); showIndex(cur + 1); });
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
        api.get("/api/cars?limit=4")
            .then(function (data) {
                var list = (data && data.items) ? data.items : (Array.isArray(data) ? data : []);
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
