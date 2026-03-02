(function () {
    var PLACEHOLDER_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect fill='%23ddd' width='300' height='200'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='14'%3ENет фото%3C/text%3E%3C/svg%3E";

    function formatPrice(n) {
        return new Intl.NumberFormat("ru-RU").format(n) + " ₽";
    }

    function buildAdCard(car) {
        var carId = car.id !== undefined && car.id !== null ? car.id : (car.Id !== undefined && car.Id !== null ? car.Id : null);
        if (carId == null) carId = "";
        var base = api.getBaseUrl();
        var imgSrc = car.hasPhoto && carId !== "" ? base + "/api/cars/" + carId + "/photos/0" : PLACEHOLDER_IMG;
        var title = car.brandName + " " + car.modelName;
        var price = formatPrice(car.price);
        var link = carId !== "" ? ("carpage.html#" + encodeURIComponent(String(carId))) : "catalog.html";

        var card = document.createElement("div");
        card.className = "ad-card";
        card.innerHTML =
            "<a href=\"" + link + "\" class=\"ad-photo-link\">" +
            "<img class=\"ad-photo\" src=\"" + imgSrc + "\" alt=\"" + title + "\" onerror=\"this.src='" + PLACEHOLDER_IMG.replace(/'/g, "\\'") + "'\">" +
            "</a>" +
            "<div class=\"ad-info\">" +
            "<p class=\"car-title\">" + title + "</p>" +
            "<p class=\"price\">" + price + "</p>" +
            "<ul class=\"meta\">" +
            "<li><img src=\"images/calendar-icon.png\" alt=\"год\">" + car.year + "</li>" +
            "<li><img src=\"images/speedometer-icon.png\" alt=\"пробег\">" + new Intl.NumberFormat("ru-RU").format(car.mileage) + " км</li>" +
            "</ul>" +
            "</div>" +
            "<div class=\"ad-actions\">" +
            "<a href=\"" + link + "\" class=\"btn-details-inline\" data-i18n=\"profile.details\">Подробнее</a>" +
            "<button type=\"button\" class=\"btn-delete-my-ad\" data-id=\"" + carId + "\" data-i18n=\"profile.delete\">Удалить</button>" +
            "</div>";
        return card;
    }

    function renderProfile(user, myCars, favouritesCount) {
        var root = document.getElementById("profile-root");
        if (!root) return;

        if (user) {
            api.setUser(user);
            var authContainer = document.querySelector(".auth-buttons");
            if (authContainer) authContainer.innerHTML = "<a href=\"profile.html\" class=\"btn-profile\"><span data-i18n=\"header.profile\">Профиль</span></a>";
        }

        var fullName = (user && user.fullName) ? user.fullName : "Пользователь";
        var email = (user && user.email) ? user.email : "";
        var phone = (user && user.phoneNumber) ? user.phoneNumber : "";
        var totalAds = myCars ? myCars.length : 0;
        var activeAds = totalAds;
        if (myCars && myCars.length > 0 && myCars[0].status !== undefined) {
            activeAds = myCars.filter(function (c) { return (c.status || "").toLowerCase() === "active"; }).length;
        }
        var favCount = favouritesCount !== undefined ? favouritesCount : 0;

        var welcomePrefix = (window.i18n && window.i18n.t) ? window.i18n.t("profile.welcome") : "Добро пожаловать, ";
        root.innerHTML =
            "<section class=\"welcome\">" +
            "<div class=\"welcome-left\">" +
            "<div class=\"welcome-text-block\">" +
            "<p class=\"welcome-text\">" + welcomePrefix + escapeHtml(fullName) + "!</p>" +
            "</div>" +
            "</div>" +
            "<button class=\"logout\" type=\"button\" data-i18n=\"profile.logout\">Выйти</button>" +
            "</section>" +

            "<section class=\"profile-data\">" +
            "<h2 data-i18n=\"profile.myData\">Мои данные</h2>" +
            "<div class=\"profile-data-grid\">" +
            "<div class=\"profile-data-item\"><span class=\"profile-data-label\" data-i18n=\"profile.email\">Email</span><span class=\"profile-data-value\">" + (email ? escapeHtml(email) : "—") + "</span></div>" +
            "<div class=\"profile-data-item profile-data-phone\">" +
            "<span class=\"profile-data-label\" data-i18n=\"profile.phone\">Телефон</span>" +
            "<div class=\"profile-phone-row\">" +
            "<input type=\"tel\" class=\"profile-phone-input\" id=\"profile-phone-input\" placeholder=\"+7 (999) 123-45-67\" value=\"" + (phone ? escapeHtml(phone) : "") + "\" maxlength=\"20\">" +
            "<button type=\"button\" class=\"profile-phone-save\" id=\"profile-phone-save\" data-i18n=\"profile.save\">Сохранить</button>" +
            "</div>" +
            "<span class=\"profile-phone-message\" id=\"profile-phone-message\" aria-live=\"polite\"></span>" +
            "</div>" +
            "</div>" +
            "</section>" +

            "<section class=\"stats\">" +
            "<div class=\"stat-card\"><img src=\"images/listings-icon.png\" class=\"stat-icon\" alt=\"Объявления\"><div class=\"stat-text\"><p class=\"data\">" + totalAds + "</p><p data-i18n=\"profile.totalAds\">Всего объявлений</p></div></div>" +
            "<div class=\"stat-card\"><img src=\"images/active-listings-icon.png\" class=\"stat-icon\" alt=\"Активные\"><div class=\"stat-text\"><p class=\"data\">" + activeAds + "</p><p data-i18n=\"profile.activeAds\">Активных</p></div></div>" +
            "<a href=\"favourites.html\" class=\"stat-card stat-card-link\"><img src=\"images/favourite-listings-icon.png\" class=\"stat-icon\" alt=\"Избранные\"><div class=\"stat-text\"><p class=\"data\">" + favCount + "</p><p data-i18n=\"profile.inFavourites\">В избранном</p></div></a>" +
            "</section>" +

            "<section class=\"quick-actions\">" +
            "<a href=\"favourites.html\" class=\"action-card\"><img src=\"images/favourite-listings-icon.png\" alt=\"Избранное\"><p class=\"bold-text\" data-i18n=\"profile.favourites\">Избранное</p><p class=\"gray-text\" data-i18n=\"profile.favouritesSub\">Ваши избранные авто</p></a>" +
            "<a href=\"comparison.html\" class=\"action-card\"><img src=\"images/favourite-listings-icon.png\" alt=\"Сравнение\"><p class=\"bold-text\" data-i18n=\"header.comparison\">Сравнение</p><p class=\"gray-text\" data-i18n=\"profile.comparisonSub\">Сравнить авто</p></a>" +
            "<a href=\"newpost.html\" class=\"action-card\"><img src=\"images/profile-settings-icon.png\" alt=\"Добавить\"><p class=\"bold-text\" data-i18n=\"profile.createAd\">Создать объявление</p><p class=\"gray-text\" data-i18n=\"profile.addCar\">Добавить авто</p></a>" +
            "</section>" +

            "<section class=\"ads\">" +
            "<p class=\"ads-label\"><img src=\"images/car-icon.png\" alt=\"\"><span data-i18n=\"profile.myAds\">Мои объявления</span></p>" +
            "<div id=\"profile-ads-list\"></div>" +
            "</section>";

        var listEl = document.getElementById("profile-ads-list");
        if (listEl) {
            if (!myCars || myCars.length === 0) {
                listEl.innerHTML = "<p class=\"profile-empty-ads\"><span data-i18n=\"profile.noAds\">У вас пока нет объявлений. </span><a href=\"newpost.html\" data-i18n=\"profile.createAdLink\">Создать объявление</a></p>";
            } else {
                myCars.forEach(function (car) {
                    var card = buildAdCard(car);
                    listEl.appendChild(card);
                    var deleteBtn = card.querySelector(".btn-delete-my-ad");
                    if (deleteBtn) {
                        var carId = car.id !== undefined && car.id !== null ? car.id : (car.Id !== undefined && car.Id !== null ? car.Id : null);
                        if (carId != null) {
                            deleteBtn.addEventListener("click", function (e) {
                                e.preventDefault();
                                var confirmMsg = (window.i18n && window.i18n.t) ? window.i18n.t("profile.deleteConfirm") : "Удалить объявление? Это действие нельзя отменить.";
                                if (!confirm(confirmMsg)) return;
                                deleteBtn.disabled = true;
                                api.delete("/api/cars/" + carId)
                                    .then(function () {
                                        card.remove();
                                        var totalEl = root.querySelector(".stats .stat-card .data");
                                        if (totalEl) {
                                            var n = parseInt(totalEl.textContent, 10);
                                            if (!isNaN(n) && n > 0) totalEl.textContent = n - 1;
                                        }
                                        var activeCards = root.querySelectorAll(".stats .stat-card");
                                        if (activeCards.length > 1 && activeCards[1].querySelector(".data")) {
                                            var activeEl = activeCards[1].querySelector(".data");
                                            var an = parseInt(activeEl.textContent, 10);
                                            if (!isNaN(an) && an > 0) activeEl.textContent = an - 1;
                                        }
                                        if (listEl.children.length === 0) {
                                            listEl.innerHTML = "<p class=\"profile-empty-ads\"><span data-i18n=\"profile.noAds\">У вас пока нет объявлений. </span><a href=\"newpost.html\" data-i18n=\"profile.createAdLink\">Создать объявление</a></p>";
                                            if (window.i18n && window.i18n.apply) window.i18n.apply();
                                        }
                                    })
                                    .catch(function (err) {
                                        deleteBtn.disabled = false;
                                        alert((err && err.message) || ((window.i18n && window.i18n.t) ? window.i18n.t("profile.deleteError") : "Не удалось удалить объявление"));
                                    });
                            });
                        }
                    }
                });
            }
        }

        var logoutBtn = root.querySelector(".logout");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", function () {
                api.setToken(null);
                api.setUser(null);
                window.location.href = "index.html";
            });
        }

        var savePhoneBtn = document.getElementById("profile-phone-save");
        var phoneInput = document.getElementById("profile-phone-input");
        var phoneMessage = document.getElementById("profile-phone-message");
        if (savePhoneBtn && phoneInput) {
            savePhoneBtn.addEventListener("click", function () {
                var value = (phoneInput.value || "").trim();
                if (phoneMessage) phoneMessage.textContent = "";
                savePhoneBtn.disabled = true;
                api.patch("/api/auth/me", { phoneNumber: value || null })
                    .then(function (updatedUser) {
                        if (updatedUser) {
                            api.setUser(updatedUser);
                            if (authContainer) authContainer.innerHTML = "<a href=\"profile.html\" class=\"btn-profile\"><span data-i18n=\"header.profile\">Профиль</span></a>";
                        }
                        if (phoneMessage) {
                            phoneMessage.textContent = (window.i18n && window.i18n.t) ? window.i18n.t("profile.phoneSaved") : "Номер телефона сохранён";
                            phoneMessage.className = "profile-phone-message profile-phone-message-ok";
                        }
                    })
                    .catch(function (err) {
                        if (phoneMessage) {
                            phoneMessage.textContent = (err && err.message) ? err.message : ((window.i18n && window.i18n.t) ? window.i18n.t("profile.saveError") : "Ошибка сохранения");
                            phoneMessage.className = "profile-phone-message profile-phone-message-err";
                        }
                    })
                    .finally(function () { savePhoneBtn.disabled = false; });
            });
        }
    }

    function escapeHtml(s) {
        var div = document.createElement("div");
        div.textContent = s;
        return div.innerHTML;
    }

    function run() {
        var root = document.getElementById("profile-root");
        if (!root) return;

        if (!api.getToken()) {
            var returnUrl = encodeURIComponent(window.location.pathname.split("/").pop() || "profile.html");
            window.location.replace("login.html?return=" + returnUrl);
            return;
        }

        root.innerHTML = "<p class=\"profile-loading\" data-i18n=\"profile.loading\">Загрузка...</p>";
            if (window.i18n && window.i18n.apply) window.i18n.apply();

        Promise.all([
            api.get("/api/auth/me"),
            api.get("/api/cars/my"),
            api.get("/api/favourites")
        ]).then(function (results) {
            var user = results[0];
            var myCars = results[1];
            var favouritesList = results[2] || [];
            renderProfile(user, myCars, favouritesList.length);
            if (window.i18n && window.i18n.apply) window.i18n.apply();
        }).catch(function (err) {
            if (err && (err.status === 401 || err.message === "Unauthorized")) {
                api.setToken(null);
                api.setUser(null);
                window.location.replace("login.html?return=profile.html");
                return;
            }
            root.innerHTML = "<p class=\"profile-error\" data-i18n=\"profile.error\">Не удалось загрузить данные. Проверьте подключение к API.</p>";
            if (window.i18n && window.i18n.apply) window.i18n.apply();
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", run);
    } else {
        run();
    }
})();
