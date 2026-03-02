(function () {
    var PLACEHOLDER_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect fill='%23ddd' width='300' height='200'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='14'%3ENет фото%3C/text%3E%3C/svg%3E";

    function gearboxLabel(v) {
        return v === "at" ? "Автомат" : v === "mt" ? "Механика" : v || "—";
    }

    function bodyLabel(v) {
        var map = { sedan: "Седан", suv: "Кроссовер", coupe: "Купе", pickup: "Пикап", cabrio: "Кабриолет", sport: "Спорткар" };
        return map[v] || v || "—";
    }

    function formatPrice(n) {
        return new Intl.NumberFormat("ru-RU").format(n) + " ₽";
    }

    function buildCard(car) {
        var carId = car.id !== undefined && car.id !== null ? car.id : (car.Id !== undefined && car.Id !== null ? car.Id : null);
        if (carId == null) carId = "";
        var base = api.getBaseUrl();
        var photoCount = car.photoCount != null ? car.photoCount : (car.hasPhoto ? 1 : 0);
        var images = [];
        if (car.hasPhoto && carId !== "" && photoCount > 0) {
            for (var i = 0; i < photoCount; i++) images.push(base + "/api/cars/" + carId + "/photos/" + i);
        }
        var imgSrc = images.length > 0 ? images[0] : PLACEHOLDER_IMG;
        var title = car.brandName + " " + car.modelName;
        var price = formatPrice(car.price);
        var badge = bodyLabel(car.bodyType);
        var gearbox = gearboxLabel(car.gearbox);
        var link = carId !== "" ? ("carpage.html#" + encodeURIComponent(String(carId))) : "catalog.html";
        var countText = images.length > 1 ? "1/" + images.length : "1/1";

        var card = document.createElement("div");
        card.className = "card";
        card.dataset.id = String(carId);
        card.dataset.images = JSON.stringify(images);
        card.innerHTML =
            "<div class=\"card-image\">" +
            "<span class=\"badge\">" + badge + "</span>" +
            "<img src=\"" + imgSrc + "\" alt=\"" + title.replace(/"/g, "&quot;") + "\" onerror=\"this.src='" + PLACEHOLDER_IMG.replace(/'/g, "\\'") + "'\">" +
            "<button class=\"prev\" type=\"button\" aria-label=\"Предыдущее фото\">&lt;</button>" +
            "<button class=\"next\" type=\"button\" aria-label=\"Следующее фото\">&gt;</button>" +
            "<span class=\"count\">" + countText + "</span>" +
            "</div>" +
            "<div class=\"card-content\">" +
            "<p class=\"car-title\">" + title.replace(/</g, "&lt;").replace(/>/g, "&gt;") + "</p>" +
            "<p class=\"car-price\">" + price + "</p>" +
            "<div class=\"car-info\">" +
            "<div><img src=\"images/calendar-icon.png\" alt=\"year\">" + car.year + "</div>" +
            "<div><img src=\"images/speedometer-icon.png\" alt=\"km\">" + new Intl.NumberFormat("ru-RU").format(car.mileage) + " км</div>" +
            "<div><img src=\"images/settings.png\" alt=\"kpp\">" + gearbox + "</div>" +
            "</div>" +
            "<div class=\"card-footer\">" +
            "<div class=\"card-actions\">" +
            "<button type=\"button\" class=\"btn-compare-card\" data-id=\"" + String(carId).replace(/"/g, "&quot;") + "\" title=\"В сравнение\" aria-label=\"Добавить в сравнение\"><span class=\"compare-icon\" aria-hidden=\"true\">⇄</span></button>" +
            "<a class=\"btn-details\" href=\"" + link.replace(/"/g, "&quot;") + "\">Подробнее</a>" +
            "</div>" +
            "</div>" +
            "</div>";
        return card;
    }

    function renderCars(list) {
        var grid = document.getElementById("cars-grid");
        var loading = document.getElementById("catalog-loading");
        if (!grid) return;
        if (loading) loading.remove();
        grid.innerHTML = "";
        if (!list || list.length === 0) {
            grid.innerHTML = "<p class=\"catalog-empty\">Объявлений не найдено</p>";
            return;
        }
        list.forEach(function (car) {
            grid.appendChild(buildCard(car));
        });
        var sentinel = document.createElement("div");
        sentinel.className = "catalog-sentinel";
        sentinel.setAttribute("aria-hidden", "true");
        grid.appendChild(sentinel);
        if (window.initComparisonCardButtons) window.initComparisonCardButtons();
        initCardSliders(grid);
        initViewToggle();
        initLazyLoad(grid);
    }

    function getQueryParams() {
        var form = document.getElementById("catalog-filters");
        var fd = form ? new FormData(form) : null;
        var urlParams = new URLSearchParams(window.location.search);
        var brandId = fd ? fd.get("brand") : null;
        var modelId = fd ? fd.get("model") : null;
        var minPrice = fd ? fd.get("min-price") : null;
        var maxPrice = fd ? fd.get("max-price") : null;
        var yearFrom = fd ? fd.get("min-year") : null;
        var yearTo = fd ? fd.get("max-year") : null;
        var minMileage = fd ? fd.get("min-km") : null;
        var maxMileage = fd ? fd.get("max-km") : null;
        var gearbox = fd ? fd.get("gearbox") : null;
        var bodyType = urlParams.get("bodyType") || (fd ? fd.get("bodyType") : null);
        var sort = fd ? fd.get("sort") : null;
        var params = [];
        if (brandId) params.push("brandId=" + encodeURIComponent(brandId));
        if (modelId) params.push("modelId=" + encodeURIComponent(modelId));
        if (minPrice) params.push("minPrice=" + encodeURIComponent(minPrice));
        if (maxPrice) params.push("maxPrice=" + encodeURIComponent(maxPrice));
        if (yearFrom) params.push("yearFrom=" + encodeURIComponent(yearFrom));
        if (yearTo) params.push("yearTo=" + encodeURIComponent(yearTo));
        if (minMileage) params.push("minMileage=" + encodeURIComponent(minMileage));
        if (maxMileage) params.push("maxMileage=" + encodeURIComponent(maxMileage));
        if (gearbox) params.push("gearbox=" + encodeURIComponent(gearbox));
        if (bodyType) params.push("bodyType=" + encodeURIComponent(bodyType));
        if (sort) params.push("sort=" + encodeURIComponent(sort));
        return params.length ? "?" + params.join("&") : "";
    }

    function loadCars() {
        var grid = document.getElementById("cars-grid");
        var loading = document.getElementById("catalog-loading");
        if (loading) loading.textContent = "Загрузка...";
        api.get("/api/cars" + getQueryParams())
            .then(function (list) {
                renderCars(list);
            })
            .catch(function (err) {
                if (grid) grid.innerHTML = "<p class=\"catalog-error\">Ошибка загрузки. Проверьте подключение к API.</p>";
            });
    }

    function loadBrandsAndModels() {
        api.get("/api/brands").then(function (brands) {
            var sel = document.getElementById("brand");
            if (!sel) return;
            sel.innerHTML = "<option value=\"\">Выберите марку</option>";
            (brands || []).forEach(function (b) {
                var opt = document.createElement("option");
                opt.value = b.id;
                opt.textContent = b.name;
                sel.appendChild(opt);
            });
        });
        api.get("/api/models").then(function (models) {
            var sel = document.getElementById("model");
            if (!sel) return;
            sel.innerHTML = "<option value=\"\">Выберите модель</option>";
            (models || []).forEach(function (m) {
                var opt = document.createElement("option");
                opt.value = m.id;
                opt.textContent = m.name;
                opt.dataset.brandId = String(m.brandId);
                sel.appendChild(opt);
            });
        });
    }

    function filterModelsByBrand() {
        var brandSel = document.getElementById("brand");
        var modelSel = document.getElementById("model");
        if (!brandSel || !modelSel) return;
        var brandId = brandSel.value;
        var options = modelSel.querySelectorAll("option[data-brand-id]");
        modelSel.value = "";
        options.forEach(function (opt) {
            opt.hidden = brandId ? opt.dataset.brandId !== brandId : false;
        });
    }

    function initCardSliders(container) {
        if (!container) container = document.querySelector(".cars-grid");
        if (!container) return;
        container.querySelectorAll(".card").forEach(function (card) {
            var img = card.querySelector(".card-image img");
            var prev = card.querySelector(".prev");
            var next = card.querySelector(".next");
            var count = card.querySelector(".count");
            var images = [];
            try { images = JSON.parse(card.dataset.images || "[]"); } catch (e) {}
            if (images.length <= 1) {
                if (prev) prev.style.display = "none";
                if (next) next.style.display = "none";
                if (count) count.textContent = "1/1";
                return;
            }
            var cur = 0;
            function update() {
                img.src = images[cur];
                count.textContent = (cur + 1) + "/" + images.length;
            }
            prev.addEventListener("click", function (e) { e.stopPropagation(); cur = (cur - 1 + images.length) % images.length; update(); });
            next.addEventListener("click", function (e) { e.stopPropagation(); cur = (cur + 1) % images.length; update(); });
        });
    }

    function initViewToggle() {
        var viewOptions = document.querySelectorAll(".view-option");
        var carsGrid = document.querySelector(".cars-grid");
        if (!carsGrid) return;
        viewOptions.forEach(function (opt) {
            opt.addEventListener("click", function () {
                viewOptions.forEach(function (o) { o.classList.remove("active"); });
                opt.classList.add("active");
                if (opt.dataset.view === "list") carsGrid.classList.add("list-view");
                else carsGrid.classList.remove("list-view");
            });
        });
    }

    function initLazyLoad(grid) {
        var CARDS_PER_PAGE = 8;
        var cards = grid ? Array.from(grid.querySelectorAll(".card")) : [];
        var sentinel = grid ? grid.querySelector(".catalog-sentinel") : null;
        var loadStatus = document.querySelector(".catalog-load-status");
        var btnLoadMore = document.querySelector(".btn-load-more");
        cards.forEach(function (card, i) {
            if (i >= CARDS_PER_PAGE) card.classList.add("catalog-card-lazy");
        });
        function updateUI() {
            var hidden = cards.filter(function (c) { return c.classList.contains("catalog-card-lazy"); });
            if (loadStatus) loadStatus.textContent = hidden.length === 0 && cards.length ? "Все объявления загружены" : "";
            if (btnLoadMore) btnLoadMore.style.display = hidden.length ? "inline-block" : "none";
        }
        function loadMore() {
            var hidden = cards.filter(function (c) { return c.classList.contains("catalog-card-lazy"); });
            hidden.slice(0, CARDS_PER_PAGE).forEach(function (c) { c.classList.remove("catalog-card-lazy"); });
            updateUI();
        }
        if (sentinel) {
            var obs = new IntersectionObserver(function (entries) {
                if (!entries[0].isIntersecting) return;
                var hidden = cards.filter(function (c) { return c.classList.contains("catalog-card-lazy"); });
                if (hidden.length) loadMore();
            }, { rootMargin: "100px", threshold: 0 });
            obs.observe(sentinel);
        }
        if (btnLoadMore) btnLoadMore.addEventListener("click", loadMore);
        updateUI();
    }

    function init() {
        var urlParams = new URLSearchParams(window.location.search);
        var bodyTypeFromUrl = urlParams.get("bodyType");
        var bodySelect = document.getElementById("body-type");
        if (bodyTypeFromUrl && bodySelect) {
            bodySelect.value = bodyTypeFromUrl;
        }
        loadBrandsAndModels();
        var brandSel = document.getElementById("brand");
        if (brandSel) brandSel.addEventListener("change", filterModelsByBrand);
        var form = document.getElementById("catalog-filters");
        if (form) {
            form.addEventListener("submit", function (e) { e.preventDefault(); loadCars(); });
            var btnApply = form.querySelector(".btn-apply");
            if (btnApply) btnApply.addEventListener("click", function (e) { e.preventDefault(); loadCars(); });
        }
        loadCars();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
