document.addEventListener("DOMContentLoaded", () => {
    if (!window.api || !api.getToken()) {
        window.location.replace("login.html?return=" + encodeURIComponent("newpost.html"));
        return;
    }

    loadBrands();
    const brandSel = document.getElementById("brand");
    if (brandSel) brandSel.addEventListener("change", loadModels);

    (function initPublishRulesModal() {
        var rulesBtn = document.getElementById("btn-publish-rules");
        var rulesModal = document.getElementById("publish-rules-modal");
        var rulesOverlay = rulesModal ? rulesModal.querySelector(".publish-rules-overlay") : null;
        var rulesCloseBtn = rulesModal ? rulesModal.querySelector(".publish-rules-close") : null;
        var rulesBody = rulesModal ? rulesModal.querySelector(".publish-rules-body") : null;
        var rulesTitleEl = rulesModal ? rulesModal.querySelector(".publish-rules-title") : null;

        function escapeHtml(str) {
            var div = document.createElement("div");
            div.textContent = str == null ? "" : str;
            return div.innerHTML;
        }

        function renderRules(data) {
            var title = data && (data.title || data.Title);
            var sections = data && (data.sections || data.Sections);
            if (rulesTitleEl && title) rulesTitleEl.textContent = title;
            if (!sections || !sections.length) {
                if (rulesBody) rulesBody.innerHTML = "<p data-i18n=\"newpost.rulesNoData\">Нет данных.</p>";
                return;
            }
            var html = "";
            sections.forEach(function (s) {
                html += "<h3>" + escapeHtml(s.heading || s.Heading || "") + "</h3><p>" + escapeHtml(s.text || s.Text || "") + "</p>";
            });
            if (rulesBody) rulesBody.innerHTML = html;
        }

        function openRulesModal() {
            if (!rulesModal || !rulesBody) return;
            var base = (window.api && window.api.getBaseUrl) ? window.api.getBaseUrl() : "";
            if (!base) base = window.location.protocol + "//" + window.location.hostname + ":5112";
            var rulesUrl = base + "/api/publish-rules";
            rulesModal.classList.add("publish-rules-modal-open");
            rulesModal.setAttribute("aria-hidden", "false");
            if (rulesTitleEl) rulesTitleEl.textContent = "Правила публикации";
            rulesBody.innerHTML = "<p class=\"publish-rules-loading\">Загрузка…</p>";
            fetch(rulesUrl, { method: "GET", headers: (window.api && window.api.getAuthHeaders) ? window.api.getAuthHeaders() : {} })
                .then(function (res) {
                    if (!res.ok) throw new Error("HTTP " + res.status);
                    return res.json();
                })
                .then(renderRules)
                .catch(function () {
                    if (rulesBody) rulesBody.innerHTML = "<p class=\"publish-rules-error\">Не удалось загрузить правила с сервера. Проверьте подключение и повторите попытку.</p>";
                });
        }

        function closeRulesModal() {
            if (rulesModal) {
                rulesModal.classList.remove("publish-rules-modal-open");
                rulesModal.setAttribute("aria-hidden", "true");
            }
        }

        window.openPublishRules = openRulesModal;
        if (rulesBtn) rulesBtn.addEventListener("click", function (e) { e.preventDefault(); openRulesModal(); });
        if (rulesCloseBtn) rulesCloseBtn.addEventListener("click", closeRulesModal);
        if (rulesOverlay) rulesOverlay.addEventListener("click", closeRulesModal);
        if (rulesModal) rulesModal.addEventListener("keydown", function (e) { if (e.key === "Escape") closeRulesModal(); });
    })();

    const form = document.querySelector(".form");
    if (!form) return;

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        clearErrors();

        const brand = document.getElementById("brand");
        const model = document.getElementById("model");
        const year = document.getElementById("year");
        const mileage = document.getElementById("mileage");
        const gearbox = document.getElementById("gearbox");
        const engine = document.getElementById("engine");
        const drive = document.getElementById("drive");
        const body = document.getElementById("body");
        const price = document.getElementById("price");
        const description = document.getElementById("description");
        const photos = document.getElementById("photos");

        var t = window.i18n && window.i18n.t;
        if (!brand || !brand.value) markError(brand, t ? t("newpost.errSelectBrand") : "Выберите марку автомобиля");
        if (!model || !model.value) markError(model, t ? t("newpost.errSelectModel") : "Выберите модель");
        if (year && (Number(year.value) < 1950 || Number(year.value) > new Date().getFullYear()))
            markError(year, (t ? t("newpost.errYear") : "Год выпуска от 1950 до ") + new Date().getFullYear());
        if (mileage && Number(mileage.value) <= 0) markError(mileage, t ? t("newpost.errMileage") : "Введите корректный пробег");
        if (!gearbox || !gearbox.value) markError(gearbox, t ? t("newpost.errGearbox") : "Выберите тип коробки передач");
        if (engine && engine.value.trim().length < 2) markError(engine, t ? t("newpost.errEngine") : "Введите обозначение двигателя (минимум 2 символа)");
        if (!drive || !drive.value) markError(drive, t ? t("newpost.errDrive") : "Выберите тип привода");
        if (!body || !body.value) markError(body, t ? t("newpost.errBody") : "Выберите тип кузова");
        if (price && Number(price.value) <= 0) markError(price, t ? t("newpost.errPrice") : "Введите корректную цену");
        if (description && description.value.trim().length < 10) markError(description, t ? t("newpost.errDescription") : "Введите описание (минимум 10 символов)");
        if (!photos || photos.files.length === 0) markError(photos, t ? t("newpost.errPhotos") : "Загрузите хотя бы одну фотографию");

        const errors = document.querySelectorAll(".error");
        if (errors.length > 0) {
            errors[0].scrollIntoView({ behavior: "smooth", block: "center" });
            errors[0].classList.add("shake");
            setTimeout(() => errors[0].classList.remove("shake"), 500);
            return;
        }

        const btn = form.querySelector("button[type=submit]");
        if (btn) btn.disabled = true;

        readPhotosAsBase64(photos.files).then((photoList) => {
            const payload = {
                brandId: Number(brand.value),
                modelId: Number(model.value),
                year: Number(year.value),
                mileage: Number(mileage.value),
                gearbox: gearbox.value,
                driveType: drive.value,
                bodyType: body.value,
                engine: engine.value.trim(),
                price: Number(price.value),
                description: description.value.trim(),
                photos: photoList
            };
            return api.post("/api/cars", payload);
        }).then((created) => {
            var msg = (window.i18n && window.i18n.t) ? window.i18n.t("newpost.publishSuccess") : "Объявление успешно опубликовано!";
            alert(msg);
            var id = created && (created.id !== undefined && created.id !== null ? created.id : (created.Id !== undefined && created.Id !== null ? created.Id : null));
            if (id != null && String(id).trim() !== "") {
                window.location.href = "carpage.html#" + encodeURIComponent(String(id).trim());
            } else {
                window.location.href = "profile.html";
            }
        }).catch((err) => {
            const msg = (err && err.message) ? err.message : ((window.i18n && window.i18n.t) ? window.i18n.t("newpost.publishError") : "Ошибка публикации. Проверьте данные и попробуйте снова.");
            alert(msg);
        }).finally(() => {
            if (btn) btn.disabled = false;
        });
    });

    function loadBrands() {
        api.get("/api/brands").then((list) => {
            const sel = document.getElementById("brand");
            if (!sel) return;
            var selectBrandText = (window.i18n && window.i18n.t) ? window.i18n.t("newpost.selectBrand") : "Выберите марку";
            sel.innerHTML = "<option value=\"\" selected disabled data-i18n=\"newpost.selectBrand\">" + selectBrandText + "</option>";
            (list || []).forEach((b) => {
                const opt = document.createElement("option");
                opt.value = b.id;
                opt.textContent = b.name;
                sel.appendChild(opt);
            });
            if (window.i18n && window.i18n.apply) window.i18n.apply();
        }).catch(() => {});
    }

    function loadModels() {
        const brandSel = document.getElementById("brand");
        const modelSel = document.getElementById("model");
        var t = window.i18n && window.i18n.t;
        if (!brandSel || !modelSel || !brandSel.value) {
            var firstText = t ? t("newpost.selectModelFirst") : "Сначала выберите марку";
            modelSel.innerHTML = "<option value=\"\" selected disabled data-i18n=\"newpost.selectModelFirst\">" + firstText + "</option>";
            if (window.i18n && window.i18n.apply) window.i18n.apply();
            return;
        }
        api.get("/api/models?brandId=" + encodeURIComponent(brandSel.value)).then((list) => {
            var selectModelText = t ? t("newpost.selectModel") : "Выберите модель";
            modelSel.innerHTML = "<option value=\"\" selected disabled data-i18n=\"newpost.selectModel\">" + selectModelText + "</option>";
            (list || []).forEach((m) => {
                if (String(m.brandId) !== String(brandSel.value)) return;
                const opt = document.createElement("option");
                opt.value = m.id;
                opt.textContent = m.name;
                modelSel.appendChild(opt);
            });
            if (window.i18n && window.i18n.apply) window.i18n.apply();
        }).catch(() => {});
    }

    function readPhotosAsBase64(files) {
        const list = Array.from(files || []).filter((f) => f.type === "image/jpeg" || f.type === "image/png" || f.type === "image/jpg");
        return Promise.all(list.map((file) => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = () => {
                    const dataUrl = reader.result;
                    resolve({
                        dataBase64: typeof dataUrl === "string" ? dataUrl : "",
                        mimeType: file.type || "image/jpeg"
                    });
                };
                reader.onerror = () => resolve(null);
                reader.readAsDataURL(file);
            });
        })).then((results) => results.filter(Boolean));
    }

    function markError(input, message) {
        if (!input) return;
        input.classList.add("error");
        const error = document.createElement("small");
        error.className = "error-message";
        error.textContent = message;
        const oldError = input.parentElement.querySelector(".error-message");
        if (oldError) oldError.remove();
        input.parentElement.appendChild(error);
    }

    function clearErrors() {
        document.querySelectorAll(".error").forEach((el) => el.classList.remove("error"));
        document.querySelectorAll(".error-message").forEach((el) => el.remove());
    }
});

const uploadBox = document.querySelector(".upload-box");
const photosInput = document.getElementById("photos");

if (uploadBox && photosInput) {
    uploadBox.addEventListener("click", () => {
        photosInput.click();
    });
}

photosInput.addEventListener("change", () => {
    uploadBox.querySelectorAll(".upload-preview").forEach((el) => el.remove());

    const files = Array.from(photosInput.files);
    if (files.length === 0) {
        uploadBox.classList.remove("has-files");
        return;
    }

    uploadBox.classList.add("has-files");

    const previewContainer = document.createElement("div");
    previewContainer.classList.add("upload-preview");

    files.forEach((file) => {
        if (!file.type.startsWith("image/")) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.createElement("img");
            img.src = e.target.result;
            previewContainer.appendChild(img);
        };
        reader.readAsDataURL(file);
    });

    uploadBox.appendChild(previewContainer);
});

document.addEventListener("DOMContentLoaded", () => {
    const phoneInput = document.getElementById("phone");
    if (!phoneInput) return;

    phoneInput.addEventListener("input", handleInput);
    phoneInput.addEventListener("focus", handleFocus);
    phoneInput.addEventListener("blur", handleBlur);
    phoneInput.addEventListener("paste", handlePaste);

    function handleInput(e) {
        const input = e.target;
        const pos = input.selectionStart;

        let digits = input.value.replace(/\D/g, "").substring(0, 11);
        if (!digits.startsWith("7")) digits = "7" + digits;

        let formatted = formatPhone(digits);

        let digitCountBeforeCursor = countDigits(input.value.slice(0, pos));
        let newPos = findCaretPosByDigitIndex(formatted, digitCountBeforeCursor);

        input.value = formatted;
        input.setSelectionRange(newPos, newPos);
    }

    function handleFocus(e) {
        if (!e.target.value) {
            e.target.value = "+7 (";
            e.target.setSelectionRange(e.target.value.length, e.target.value.length);
        }
    }

    function handleBlur(e) {
        if (e.target.value === "+7 (" || e.target.value === "+7") e.target.value = "";
    }

    function handlePaste(e) {
        e.preventDefault();
        let pasted = (e.clipboardData || window.clipboardData).getData("text");
        pasted = pasted.replace(/\D/g, "").substring(0, 11);
        if (pasted.startsWith("8")) pasted = "7" + pasted.substring(1);
        if (!pasted.startsWith("7")) pasted = "7" + pasted;
        e.target.value = formatPhone(pasted);
        e.target.setSelectionRange(e.target.value.length, e.target.value.length);
    }

    function formatPhone(digits) {
        let formatted = "+7";
        if (digits.length > 1) formatted += " (" + digits.substring(1, 4);
        if (digits.length >= 5) formatted += ") " + digits.substring(4, 7);
        if (digits.length >= 8) formatted += "-" + digits.substring(7, 9);
        if (digits.length >= 10) formatted += "-" + digits.substring(9, 11);
        return formatted;
    }

    function countDigits(str) {
        return (str.match(/\d/g) || []).length;
    }

    function findCaretPosByDigitIndex(formatted, digitIndex) {
        let count = 0;
        for (let i = 0; i < formatted.length; i++) {
            if (/\d/.test(formatted[i])) count++;
            if (count >= digitIndex + 1) return i + 1;
        }
        return formatted.length;
    }
});