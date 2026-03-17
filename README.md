# AutoSeller

Платформа объявлений о продаже подержанных автомобилей.

**Стек:** Backend — ASP.NET Core 7, PostgreSQL, Entity Framework Core, JWT; Frontend — HTML, CSS, Vanilla JavaScript.

---

## Требования

| Инструмент | Версия | Назначение |
|---|---|---|
| [.NET SDK](https://dotnet.microsoft.com/download/dotnet/7.0) | 7.x | Запуск бэкенда |
| [PostgreSQL](https://www.postgresql.org/download/) | 14+ | База данных |
| [Node.js](https://nodejs.org/) | 18+ | Раздача фронтенда (опционально) |
| [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) | любая | Альтернатива Node.js для фронтенда |

---

## Быстрый старт

### 1. Клонировать репозиторий

```bash
git clone <url>
cd site
```

### 2. Создать базу данных PostgreSQL

```sql
CREATE DATABASE autoseller;
```

### 3. Настроить строку подключения

Откройте `backend/appsettings.json` и при необходимости измените:

```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Database=autoseller;Username=postgres;Password=postgres"
}
```

### 4. Запустить бэкенд

```bash
cd backend
dotnet restore
dotnet run --urls "http://0.0.0.0:5112"
```

При первом запуске автоматически применяются миграции и заполняются справочники (марки и модели автомобилей).

API будет доступен по адресу: **http://localhost:5112**

Swagger UI (только в режиме Development): **http://localhost:5112/swagger**

### 5. Запустить фронтенд

**Вариант A — через Node.js:**

```bash
cd frontend
npx serve -l 3000
```

Откройте **http://localhost:3000**

**Вариант B — через VS Code Live Server:**

Откройте папку `frontend` в VS Code и нажмите кнопку **Go Live** в статус-баре. Фронтенд откроется на порту `5500`.

---

## Настройка CORS

По умолчанию бэкенд разрешает запросы с `http://localhost:5500` и `http://127.0.0.1:5500`.

Если фронтенд запущен на другом порту (например `3000`), добавьте его в `backend/appsettings.json`:

```json
"Cors": {
  "AllowedOrigins": [
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "http://localhost:3000"
  ]
}
```

---

## Ручная настройка API_BASE (если нужно)

Если бэкенд запущен не на порту `5112`, укажите адрес явно — добавьте тег `<script>` перед подключением `api.js` на любой HTML-странице:

```html
<script>window.API_BASE = "http://localhost:5112";</script>
<script src="js/api.js" defer></script>
```

---

## Миграции (если нужно создать вручную)

Миграции уже включены в репозиторий и применяются автоматически при запуске. Если нужно создать новую:

```bash
# Установить инструмент EF Core глобально (один раз)
dotnet tool install --global dotnet-ef --version 7.0.20

# Добавить в PATH (macOS/Linux)
export PATH="$PATH:$HOME/.dotnet/tools"

# Создать миграцию (из папки backend)
cd backend
dotnet ef migrations add <НазваниеМиграции> --output-dir Data/Migrations

# Применить вручную
dotnet ef database update
```

---

## Структура проекта

```
site/
├── backend/                  # ASP.NET Core Web API
│   ├── Controllers/          # Контроллеры (Auth, Cars, Brands, Models, Favourites, Comparison)
│   ├── Data/                 # DbContext, миграции, сид данных
│   ├── Models/               # Сущности и DTO
│   ├── Services/             # JWT-сервис
│   ├── appsettings.json      # Конфигурация
│   └── Program.cs            # Точка входа
└── frontend/                 # Статический фронтенд
    ├── css/                  # Стили (переменные, темы, страницы)
    ├── js/                   # Скрипты (api.js, i18n.js, theme.js, ...)
    ├── data/                 # Переводы (lang-ru.json, lang-en.json)
    ├── images/               # Изображения
    └── *.html                # Страницы
```

---

## API

### Авторизация

| Метод | URL | Описание |
|---|---|---|
| `POST` | `/api/auth/register` | Регистрация. Body: `{ email, password, fullName, phoneNumber? }`. Возвращает `{ token, user }`. |
| `POST` | `/api/auth/login` | Вход. Body: `{ email, password }`. Возвращает `{ token, user }`. |
| `GET` | `/api/auth/me` | Текущий пользователь (требует токен). |
| `PATCH` | `/api/auth/me` | Обновить телефон. Body: `{ phoneNumber }`. |

> Требования к паролю: минимум 8 символов, минимум одна заглавная буква и одна цифра.

### Справочники

| Метод | URL | Описание |
|---|---|---|
| `GET` | `/api/brands` | Список марок. |
| `GET` | `/api/models?brandId=1` | Список моделей (опционально по марке). |

### Каталог

| Метод | URL | Описание |
|---|---|---|
| `GET` | `/api/cars` | Список объявлений с фильтрами и пагинацией. |
| `GET` | `/api/cars/{id}` | Карточка автомобиля с данными продавца. |
| `GET` | `/api/cars/{id}/photos/{index}` | Фото по индексу (0, 1, 2...). |
| `POST` | `/api/cars` | Создать объявление (требует токен). |
| `DELETE` | `/api/cars/{id}` | Удалить объявление (только владелец). |

Параметры фильтрации `GET /api/cars`: `brandId`, `modelId`, `minPrice`, `maxPrice`, `yearFrom`, `yearTo`, `minMileage`, `maxMileage`, `gearbox`, `driveType`, `bodyType`, `sort` (`priceAsc`, `priceDesc`, `yearDesc`, `yearAsc`, `mileageAsc`, `mileageDesc`), `limit`, `offset`.

### Избранное (требует авторизации)

| Метод | URL | Описание |
|---|---|---|
| `GET` | `/api/favourites` | Список избранных автомобилей. |
| `POST` | `/api/favourites` | Добавить. Body: `{ carId }`. |
| `DELETE` | `/api/favourites/{carId}` | Удалить. |

### Сравнение (требует авторизации, лимит — 5 автомобилей)

| Метод | URL | Описание |
|---|---|---|
| `GET` | `/api/comparison` | Список автомобилей в сравнении. |
| `POST` | `/api/comparison` | Добавить. Body: `{ carId }`. |
| `DELETE` | `/api/comparison/{carId}` | Удалить. |

### Правила публикации

| Метод | URL | Описание |
|---|---|---|
| `GET` | `/api/publish-rules` | Получить правила публикации объявлений. |

---

## Переменные окружения / конфигурация

Все настройки находятся в `backend/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=autoseller;Username=postgres;Password=postgres"
  },
  "Jwt": {
    "Key": "your-secret-key-min-32-chars",
    "Issuer": "AutoSeller",
    "Audience": "AutoSellerUsers"
  },
  "Cors": {
    "AllowedOrigins": ["http://localhost:5500", "http://127.0.0.1:5500"]
  }
}
```

> В продакшне замените `Jwt:Key` на надёжный секрет длиной не менее 32 символов.
