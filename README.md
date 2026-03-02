# AutoSeller

**Стек:** backend — ASP.NET Core 7, PostgreSQL, JWT; frontend — HTML, CSS, JavaScript.

---

## Требования

- **.NET 7 SDK**
- **PostgreSQL**
- **Node.js** — для раздачи фронтенда через `npx serve`

---

## Запуск

### 1. База данных

Создайте базу в PostgreSQL и при необходимости измените строку подключения в **`backend/appsettings.json`**:

```sql
CREATE DATABASE autoseller;
```

```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Database=autoseller;Username=postgres;Password=postgres"
}
```

### 2. Backend

```bash
cd backend
dotnet restore
dotnet build
dotnet run --urls "http://0.0.0.0:5112"
```

API: **http://localhost:5112**. При первом запуске применяются миграции и заполняются справочники.

В **Cors:AllowedOrigins** в `appsettings.json` должен быть URL фронтенда (например `http://localhost:3000` или `http://localhost:5500`).

### 3. Frontend

Статические файлы в папке **`frontend`** нужно раздавать HTTP-сервером.

**Через Node.js:**

```bash
cd frontend
npx serve -l 3000
```