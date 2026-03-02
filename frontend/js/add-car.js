document.addEventListener("DOMContentLoaded", () => {
    if (!window.api || !api.getToken()) {
        window.location.replace("login.html?return=" + encodeURIComponent("newpost.html"));
        return;
    }

    loadBrands();
    const brandSel = document.getElementById("brand");
    if (brandSel) brandSel.addEventListener("change", loadModels);

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

document.addEventListener("DOMContentLoaded", function () {
    const btn = document.getElementById("btn-publish-rules");
    const modal = document.getElementById("publish-rules-modal");
    const overlay = modal ? modal.querySelector(".publish-rules-overlay") : null;
    const closeBtn = modal ? modal.querySelector(".publish-rules-close") : null;
    const bodyEl = modal ? modal.querySelector(".publish-rules-body") : null;
    const titleEl = modal ? modal.querySelector(".publish-rules-title") : null;
    const RULES_URL = "data/publish-rules.json";

    function renderRulesFromI18n() {
        var t = window.i18n && window.i18n.t;
        if (!t || !titleEl || !bodyEl) return false;
        var title = t("newpost.rulesTitle");
        var s1h = t("newpost.rulesSection1Heading");
        var s1t = t("newpost.rulesSection1Text");
        if (!s1h || !s1t) return false;
        if (titleEl) titleEl.textContent = title;
        var html = "";
        for (var i = 1; i <= 5; i++) {
            var h = t("newpost.rulesSection" + i + "Heading");
            var txt = t("newpost.rulesSection" + i + "Text");
            if (h) html += "<h3>" + escapeHtml(h) + "</h3>";
            if (txt) html += "<p>" + escapeHtml(txt) + "</p>";
        }
        bodyEl.innerHTML = html || ("<p>" + t("newpost.rulesNoData") + "</p>");
        return true;
    }

    function renderRules(data) {
        var t = window.i18n && window.i18n.t;
        if (titleEl && data.title) titleEl.textContent = data.title;
        if (!data.sections || !data.sections.length) {
            bodyEl.innerHTML = "<p data-i18n=\"newpost.rulesNoData\">" + (t ? t("newpost.rulesNoData") : "Нет данных.") + "</p>";
            if (window.i18n && window.i18n.apply) window.i18n.apply();
            return;
        }
        var html = "";
        data.sections.forEach(function (s) {
            html += "<h3>" + escapeHtml(s.heading || "") + "</h3><p>" + escapeHtml(s.text || "") + "</p>";
        });
        bodyEl.innerHTML = html;
    }

    function openModal() {
        var t = window.i18n && window.i18n.t;
        if (!modal || !bodyEl) return;
        modal.classList.add("publish-rules-modal-open");
        modal.setAttribute("aria-hidden", "false");
        if (titleEl) titleEl.textContent = t ? t("newpost.rulesModalTitle") : "Правила публикации";
        if (renderRulesFromI18n()) return;
        bodyEl.innerHTML = "<p class=\"publish-rules-loading\" data-i18n=\"newpost.rulesLoading\">" + (t ? t("newpost.rulesLoading") : "Загрузка…") + "</p>";
        fetch(RULES_URL)
            .then(function (res) {
                if (!res.ok) throw new Error("Не удалось загрузить правила");
                return res.json();
            })
            .then(renderRules)
            .catch(function () {
                var errText = (window.i18n && window.i18n.t) ? window.i18n.t("newpost.rulesLoadError") : "Не удалось загрузить правила. Попробуйте позже.";
                var fallback = document.getElementById("publish-rules-fallback");
                if (fallback && fallback.textContent) {
                    try {
                        renderRules(JSON.parse(fallback.textContent));
                    } catch (e) {
                        bodyEl.innerHTML = "<p class=\"publish-rules-error\" data-i18n=\"newpost.rulesLoadError\">" + errText + "</p>";
                        if (window.i18n && window.i18n.apply) window.i18n.apply();
                    }
                } else {
                    bodyEl.innerHTML = "<p class=\"publish-rules-error\" data-i18n=\"newpost.rulesLoadError\">" + errText + "</p>";
                    if (window.i18n && window.i18n.apply) window.i18n.apply();
                }
            });
    }

    function escapeHtml(str) {
        var div = document.createElement("div");
        div.textContent = str;
        return div.innerHTML;
    }

    function closeModal() {
        if (!modal) return;
        modal.classList.remove("publish-rules-modal-open");
        modal.setAttribute("aria-hidden", "true");
    }

    if (btn) btn.addEventListener("click", openModal);
    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (overlay) overlay.addEventListener("click", closeModal);
    if (modal) {
        modal.addEventListener("keydown", function (e) {
            if (e.key === "Escape") closeModal();
        });
    }
});