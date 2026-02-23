# AutoSeller

Сайт объявлений о продаже автомобилей.

**Стек:** backend — ASP.NET Core 7 (C#), PostgreSQL, JWT; frontend — HTML, CSS, JavaScript (без сборки).

---

## Требования

- **.NET 7 SDK**
- **PostgreSQL**
- **Node.js** (опционально) — для раздачи фронтенда через `npx serve`;

---

## 1. База данных

Создайте базу в PostgreSQL:

```sql
CREATE DATABASE autoseller;
```

При необходимости измените строку подключения в файле **`backend/appsettings.json`**:

```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Database=autoseller;Username=postgres;Password=postgres"
}
```

Подставьте свой хост, имя БД, пользователя и пароль.

---

## 2. Запуск backend (API)

```bash
cd backend
dotnet restore
dotnet build
dotnet run
```

API будет доступен по адресу **http://localhost:5112**.

При первом запуске автоматически применяются миграции и заполняются справочники марок и моделей (Toyota, BMW, Audi и их модели).

**Доступ с других устройств в сети** (например, с телефона в той же Wi‑Fi):

```bash
dotnet run --urls "http://0.0.0.0:5112"
```

**Важно:** в `appsettings.json` в разделе **Cors:AllowedOrigins** должен быть URL, с которого открывается фронтенд (например `http://localhost:3000` или `http://192.168.1.199:3000`). При необходимости добавьте свой адрес в массив.

Для продакшена замените **Jwt:Key** в `appsettings.json` на свой длинный секрет (не менее 32 символов).

---

## 3. Запуск frontend

Фронтенд — статические файлы в папке **`frontend`**. Нужно раздавать их любым HTTP-сервером.

### Вариант A: через Node.js (npx serve)

```bash
cd frontend
npx serve -l 3000
```

Сайт откроется по адресу **http://localhost:3000**. По умолчанию фронт обращается к API по порту **5112** (см. `frontend/js/api.js`). Если backend запущен на том же хосте и порту 5112 — ничего дополнительно настраивать не нужно.

### Вариант B: Live Server (VS Code / Cursor)

Откройте папку `frontend` в редакторе, запустите расширение Live Server. Обычно фронт откроется на порту 5500. Добавьте в **backend/appsettings.json** в **Cors:AllowedOrigins** значение `http://localhost:5500` (или `http://127.0.0.1:5500`), если его там ещё нет.

### Указание другого адреса API

Если API доступен по другому адресу (другой хост или порт), перед подключением `api.js` задайте базовый URL. Например, в `frontend/index.html` в `<head>` добавьте:

```html
<script>window.API_BASE = "http://localhost:5112";</script>
```

(подставьте свой URL API). Этот скрипт должен быть **до** подключения `js/api.js`.

---

## 4. Проверка

1. Откройте в браузере адрес фронтенда (например http://localhost:3000).
2. Зарегистрируйтесь (**Регистрация**) или войдите (**Войти**).
3. В каталоге можно фильтровать по марке, модели, типу кузова и т.д.
4. Переход по карточке типа кузова на главной откроет каталог с уже выбранным фильтром по типу кузова.
5. «Подробнее» на карточке авто открывает страницу автомобиля; контакты продавца — из его профиля.
6. В личном кабинете (Профиль) отображаются ваши данные, можно указать/изменить телефон; там же список «Мои объявления».
7. Создать объявление можно через **Создать объявление** (доступно только авторизованным).

---

## Структура проекта

```
site/
├── backend/                 # ASP.NET Core 7 Web API
│   ├── Controllers/         # Auth, Cars, Brands, Models, Comparison
│   ├── Data/                # DbContext, миграции, сиды
│   ├── Models/              # Car, Brand, Model, User, DTO
│   ├── Services/            # JWT
│   ├── appsettings.json     # строка подключения, JWT, CORS
│   └── README.md            # описание API и миграций
├── frontend/                # Статический фронтенд
│   ├── css/
│   ├── js/                  # api.js, catalog, carpage, profile, index, add-car, ...
│   ├── index.html           # главная
│   ├── catalog.html         # каталог
│   ├── carpage.html         # страница автомобиля
│   ├── profile.html         # личный кабинет
│   ├── newpost.html         # создание объявления
│   └── ...
├── сайт.sln
└── README.md                # этот файл
```

Подробное описание API (эндпоинты, параметры, примеры) — в **backend/README.md**.
