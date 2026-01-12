# 🚀 Развертывание Manager App

## Требования

- **Node.js** >= 18.x
- **Docker Desktop** (для PostgreSQL)
- **Expo Go** на телефоне

---

## Быстрый старт

### 1. Клонирование
```bash
git clone https://github.com/Saifulla2313/manager-app.git
cd manager-app
git checkout saif
```

### 2. Бэкенд
```bash
cd backend
cp env.example .env
npm install
npm run dev
```

### 3. Фронтенд
```bash
cd manager-app
cp .env.example .env
npm install
npx expo start --lan
```

---

## Переменные окружения

### backend/.env
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/manager_db?schema=public"
JWT_SECRET="your-secret-key"
PORT=3000
HOST="0.0.0.0"
WAPPI_API_KEY="your-wappi-key"
WAPPI_PROFILE_ID="your-profile-id"
```

### manager-app/.env
```env
EXPO_PUBLIC_API_URL=http://192.168.x.x:3000
```

---

## Тестовые аккаунты

| Роль | Email | Пароль |
|------|-------|--------|
| Менеджер | manager@example.com | password123 |
| Сотрудник | employee@example.com | password123 |

---

## API Endpoints

### Аутентификация
- POST /auth/login
- POST /auth/register
- GET /auth/me

### Организации
- POST /api/organizations
- POST /api/organizations/invites
- POST /api/organizations/register-by-invite

### Задачи
- GET/POST /tasks
- GET/PUT/DELETE /tasks/:id

### Сотрудники
- GET /employees
- GET /employees/:id

---

## Структура проекта

```
manager/
├── backend/          # Fastify + Prisma + PostgreSQL
├── manager-app/      # Expo + React Native
└── DEPLOYMENT.md
```
