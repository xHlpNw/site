(function () {
    var PLACEHOLDER_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect fill='%23ddd' width='300' height='200'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='14'%3ENет фото%3C/text%3E%3C/svg%3E";
    var PAGE_SIZE = 12;

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

    function renderCars(list, total, currentPage) {
        var grid = document.getElementById("cars-grid");
        var loading = document.getElementById("catalog-loading");
        if (!grid) return;
        if (loading) loading.remove();
        grid.innerHTML = "";
        if (!list || list.length === 0) {
            grid.innerHTML = "<p class=\"catalog-empty\">Объявлений не найдено</p>";
            renderPagination(0, 1);
            return;
        }
        list.forEach(function (car) {
            grid.appendChild(buildCard(car));
        });
        if (window.initComparisonCardButtons) window.initComparisonCardButtons();
        initCardSliders(grid);
        initViewToggle();
        renderPagination(total, currentPage);
    }

    function renderPagination(total, currentPage) {
        var container = document.getElementById("catalog-pagination");
        if (!container) return;
        var totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
        currentPage = Math.max(1, Math.min(currentPage, totalPages));
        container.innerHTML = "";
        if (totalPages <= 1 && total <= PAGE_SIZE) {
            var info = document.createElement("p");
            info.className = "catalog-pagination-info";
            info.textContent = "Найдено: " + total + " " + (total === 1 ? "объявление" : total < 5 ? "объявления" : "объявлений");
            container.appendChild(info);
            return;
        }
        var info = document.createElement("p");
        info.className = "catalog-pagination-info";
        info.textContent = "Найдено: " + total + " " + (total === 1 ? "объявление" : total < 5 ? "объявления" : "объявлений");
        container.appendChild(info);
        var nav = document.createElement("nav");
        nav.className = "pagination-nav";
        nav.setAttribute("aria-label", "Страницы каталога");
        var ul = document.createElement("ul");
        ul.className = "pagination-list";
        function addPageItem(content, pageNum, isCurrent, isDisabled) {
            var li = document.createElement("li");
            var a = document.createElement("a");
            a.href = "#";
            if (isDisabled) {
                a.classList.add("pagination-disabled");
                a.setAttribute("aria-disabled", "true");
            } else {
                a.addEventListener("click", function (e) {
                    e.preventDefault();
                    loadCars(pageNum);
                    var url = "catalog.html" + getQueryParams(pageNum);
                    if (window.history && window.history.replaceState) {
                        window.history.replaceState({}, "", url);
                    }
                    var grid = document.getElementById("cars-grid");
                    if (grid) grid.scrollIntoView({ behavior: "smooth", block: "start" });
                });
            }
            if (isCurrent) a.classList.add("pagination-current");
            a.textContent = content;
            li.appendChild(a);
            ul.appendChild(li);
        }
        addPageItem("« Предыдущая", currentPage - 1, false, currentPage <= 1);
        var start = Math.max(1, currentPage - 2);
        var end = Math.min(totalPages, currentPage + 2);
        if (start > 1) {
            addPageItem("1", 1, false, false);
            if (start > 2) addPageItem("…", 0, false, true);
        }
        for (var p = start; p <= end; p++) addPageItem(String(p), p, p === currentPage, false);
        if (end < totalPages) {
            if (end < totalPages - 1) addPageItem("…", 0, false, true);
            addPageItem(String(totalPages), totalPages, false, false);
        }
        addPageItem("Следующая »", currentPage + 1, false, currentPage >= totalPages);
        nav.appendChild(ul);
        container.appendChild(nav);
    }

    function getQueryParams(page) {
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
        var pageNum = page != null && page > 0 ? page : (parseInt(urlParams.get("page"), 10) || 1);
        params.push("limit=" + PAGE_SIZE);
        params.push("offset=" + ((pageNum - 1) * PAGE_SIZE));
        if (pageNum > 1) params.push("page=" + pageNum);
        return "?" + params.join("&");
    }

    function loadCars(page) {
        var grid = document.getElementById("cars-grid");
        var loading = document.getElementById("catalog-loading");
        if (!grid) return;
        var pageNum = page != null && page > 0 ? page : 1;
        grid.innerHTML = "<p class=\"catalog-loading\" id=\"catalog-loading\">Загрузка...</p>";
        var loadingEl = document.getElementById("catalog-loading");
        if (loadingEl) loadingEl.textContent = "Загрузка...";
        api.get("/api/cars" + getQueryParams(pageNum))
            .then(function (data) {
                var list = (data && data.items) ? data.items : (Array.isArray(data) ? data : []);
                var total = (data && data.total != null) ? data.total : list.length;
                renderCars(list, total, pageNum);
            })
            .catch(function (err) {
                if (grid) grid.innerHTML = "<p class=\"catalog-error\">Ошибка загрузки. Проверьте подключение к API.</p>";
                document.getElementById("catalog-pagination").innerHTML = "";
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
            form.addEventListener("submit", function (e) { e.preventDefault(); loadCars(1); });
            var btnApply = form.querySelector(".btn-apply");
            if (btnApply) btnApply.addEventListener("click", function (e) { e.preventDefault(); loadCars(1); });
        }
        var pageFromUrl = parseInt(urlParams.get("page"), 10) || 1;
        loadCars(pageFromUrl);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
