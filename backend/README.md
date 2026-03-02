# AutoSeller API

Backend (ASP.NET Core Web API) для проекта AutoSeller.

## Шаг 6 выполнен

- **Сравнение** (только для авторизованных): `GET /api/comparison` — список авто в сравнении (те же поля, что в каталоге), `POST /api/comparison` (body: `{ "carId": number }`), `DELETE /api/comparison/{carId}`. Лимит — 5 автомобилей.

## Шаг 5 выполнен

- **Каталог и карточка авто**: `GET /api/cars` (фильтры: brandId, modelId, minPrice, maxPrice, yearFrom, yearTo, minMileage, maxMileage, gearbox, driveType, bodyType; сортировка: sort), `GET /api/cars/{id}`, `GET /api/cars/{id}/photos/{index}` (фото по индексу 0, 1, 2...).

## Шаг 4 выполнен

- **Справочники**: при первом запуске в БД заполняются марки (Toyota, BMW, Audi) и модели (Camry, Corolla, RAV4, 3/5 Series, X5, A3/A4/A6).
- **API**: `GET /api/brands`, `GET /api/models?brandId=1` — список марок и моделей (опционально по марке).

## Шаг 3 выполнен

- **Auth API**: регистрация, вход, текущий пользователь (JWT).
- Эндпоинты: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` (с заголовком `Authorization: Bearer <token>`).

## Шаг 2 выполнен

- Добавлены модели: **Brand**, **Model**, **Car**, **CarPhoto**, **Comparison**.
- В **ApplicationDbContext** зарегистрированы все сущности и связи (в т.ч. составной ключ для Comparison).
- Подключён пакет **Microsoft.EntityFrameworkCore.Design** для миграций.
- При старте приложения автоматически применяются миграции (`Database.Migrate()`).

## Миграции (первый раз)

1. Установите глобальный инструмент EF Core (один раз). Для проекта на .NET 7 укажите версию 7.x:
   ```bash
   dotnet tool install --global dotnet-ef --version 7.0.20
   ```
   Если `dotnet ef` не находится, добавьте в PATH и перезапустите терминал:
   ```bash
   export PATH="$PATH:$HOME/.dotnet/tools"
   ```

2. Создайте БД в PostgreSQL (например в psql или pgAdmin):
   ```sql
   CREATE DATABASE autoseller;
   ```

3. В папке `backend` создайте миграцию:
   ```bash
   dotnet ef migrations add InitialCreate --output-dir Data/Migrations
   ```

4. При следующем запуске приложения (`dotnet run`) миграции применятся автоматически. Либо выполните вручную:
   ```bash
   dotnet ef database update
   ```

## Перед запуском

1. **Восстановить пакеты и собрать**:
   ```bash
   dotnet restore
   dotnet build
   ```

2. **PostgreSQL**: создать БД `autoseller` и поправить строку подключения в `appsettings.json` при необходимости.

3. **JWT**: в проде заменить `Jwt:Key` на свой секрет (не менее 32 символов).

4. **CORS**: при необходимости добавить в `Cors:AllowedOrigins` URL фронтенда (например `http://localhost:5500` при запуске фронта через Live Server).

**Фронтенд**: если фронт открыт с другого порта (например `http://127.0.0.1:5500`), в `frontend/index.html` (или на любой странице) перед скриптом `api.js` задайте базовый URL API: `<script>window.API_BASE = "http://localhost:5112";</script>` (подставьте свой порт из `launchSettings.json`).

## Запуск

```bash
dotnet run
```

API будет доступен по адресу из `launchSettings.json` (например `http://localhost:5112`).

---

## API: Авторизация

| Метод | URL | Описание |
|-------|-----|----------|
| POST | `/api/auth/register` | Регистрация. Body: `{ "email", "password", "fullName", "phoneNumber"? }`. Ответ: `{ "token", "user" }`. |
| POST | `/api/auth/login` | Вход. Body: `{ "email", "password" }`. Ответ: `{ "token", "user" }`. |
| GET | `/api/auth/me` | Текущий пользователь. Заголовок: `Authorization: Bearer <token>`. Ответ: `{ "id", "email", "fullName", "phoneNumber" }`. |

### Справочники

| Метод | URL | Описание |
|-------|-----|----------|
| GET | `/api/brands` | Список марок. Ответ: `[{ "id", "name" }, ...]`. |
| GET | `/api/models` | Список моделей. Query: `brandId` (опционально). Ответ: `[{ "id", "name", "brandId" }, ...]`. |

### Каталог и карточка авто

| Метод | URL | Описание |
|-------|-----|----------|
| GET | `/api/cars` | Каталог. Query: `brandId`, `modelId`, `minPrice`, `maxPrice`, `yearFrom`, `yearTo`, `minMileage`, `maxMileage`, `gearbox`, `driveType`, `bodyType`, `sort` (priceAsc, priceDesc, yearDesc, yearAsc, mileageAsc, mileageDesc). Ответ: `[{ "id", "brandName", "modelName", "year", "mileage", "gearbox", "driveType", "bodyType", "price", "hasPhoto", "createdAt" }, ...]`. |
| GET | `/api/cars/{id}` | Карточка авто. Ответ: полные данные + `seller` (fullName, phoneNumber, email), `photoCount`. |
| GET | `/api/cars/{id}/photos/{index}` | Фото по индексу (0, 1, 2...). Ответ: binary image (Content-Type: image/jpeg и т.д.). |

### Сравнение (требуется авторизация)

| Метод | URL | Описание |
|-------|-----|----------|
| GET | `/api/comparison` | Список автомобилей в сравнении. Заголовок: `Authorization: Bearer <token>`. Ответ: `[{ "id", "brandName", "modelName", "year", "mileage", "gearbox", "driveType", "bodyType", "price", "hasPhoto", "createdAt" }, ...]`. |
| POST | `/api/comparison` | Добавить в сравнение. Body: `{ "carId": number }`. Лимит 5. 201 или 400/404. |
| DELETE | `/api/comparison/{carId}` | Удалить из сравнения. 204 или 404. |

### Избранное (требуется авторизация)

| Метод | URL | Описание |
|-------|-----|----------|
| GET | `/api/favourites` | Список автомобилей в избранном. Заголовок: `Authorization: Bearer <token>`. Ответ: `[{ "id", "brandName", "modelName", "year", "mileage", "gearbox", "driveType", "bodyType", "price", "hasPhoto", "createdAt" }, ...]`. |
| POST | `/api/favourites` | Добавить в избранное. Body: `{ "carId": number }`. 201 или 400/404. |
| DELETE | `/api/favourites/{carId}` | Удалить из избранного. 204 или 404. |
