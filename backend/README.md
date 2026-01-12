# Manager App — Backend

REST API для приложения управления задачами. Построен на **Fastify** + **Prisma** + **PostgreSQL**.

## 🛠 Стек технологий

| Технология | Назначение |
|------------|------------|
| **Fastify** | Быстрый веб-фреймворк |
| **Prisma** | ORM для работы с БД |
| **PostgreSQL** | База данных |
| **JWT** | Авторизация |
| **Zod** | Валидация данных |
| **TypeScript** | Типизация |

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
cd backend
npm install
```

### 2. Настройка окружения

Скопируй `env.example` в `.env` и настрой переменные:

```bash
cp env.example .env
```

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/manager_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
PORT=3000
HOST="0.0.0.0"
```

### 3. Запуск PostgreSQL

Если нет локального PostgreSQL, используй Docker:

```bash
docker run --name manager-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=manager_db \
  -p 5432:5432 \
  -d postgres:16-alpine
```

### 4. Миграции и генерация клиента

```bash
npm run db:generate   # Генерация Prisma Client
npm run db:migrate    # Применение миграций
```

### 5. Заполнение тестовыми данными

```bash
npm run db:seed
```

Создаст демо-аккаунты:
- **Менеджер:** `manager@example.com` / `manager123`
- **Сотрудник:** `emma@example.com` / `employee123`

### 6. Запуск сервера

```bash
npm run dev   # Development с hot-reload
npm run build && npm start   # Production
```

Сервер запустится на `http://localhost:3000`

## 📡 API Endpoints

### Auth
| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/auth/register` | Регистрация |
| POST | `/auth/login` | Вход |
| GET | `/auth/me` | Текущий пользователь |

### Employees (только менеджер)
| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/employees` | Список сотрудников |
| GET | `/employees/:id` | Профиль сотрудника |

### Tasks
| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/tasks` | Список задач |
| GET | `/tasks/:id` | Детали задачи |
| POST | `/tasks` | Создать задачу (менеджер) |
| PATCH | `/tasks/:id` | Обновить задачу |
| DELETE | `/tasks/:id` | Удалить задачу (менеджер) |
| POST | `/tasks/:id/comments` | Добавить комментарий |

### Routines (регулярные чек-листы)
| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/routines` | Список шаблонов |
| GET | `/routines/:id` | Детали шаблона |
| POST | `/routines` | Создать шаблон (менеджер) |
| PATCH | `/routines/:id` | Обновить шаблон (менеджер) |
| DELETE | `/routines/:id` | Удалить шаблон (менеджер) |
| GET | `/routines/:id/progress/:date` | Прогресс за день |
| POST | `/routines/:id/progress/:date/tasks/:taskId/complete` | Отметить задачу |

### Notifications
| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/notifications` | Список уведомлений |
| PATCH | `/notifications/:id/read` | Отметить как прочитанное |
| POST | `/notifications/read-all` | Прочитать все |

### Stats
| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/stats/dashboard` | Статистика для менеджера |
| GET | `/stats/employee` | Статистика для сотрудника |

### Health
| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/health` | Проверка состояния |

## 🔐 Авторизация

Все защищённые эндпоинты требуют JWT токен в заголовке:

```
Authorization: Bearer <token>
```

## 📂 Структура проекта

```
backend/
├── prisma/
│   ├── schema.prisma    # Схема БД
│   └── seed.ts          # Тестовые данные
├── src/
│   ├── config/
│   │   └── env.ts       # Конфигурация окружения
│   ├── lib/
│   │   └── prisma.ts    # Prisma Client
│   ├── plugins/
│   │   └── jwt.ts       # JWT плагин
│   ├── routes/
│   │   ├── auth.ts      # Авторизация
│   │   ├── employees.ts # Сотрудники
│   │   ├── tasks.ts     # Задачи
│   │   ├── routines.ts  # Регулярные чек-листы
│   │   ├── notifications.ts
│   │   └── stats.ts     # Статистика
│   └── index.ts         # Точка входа
├── package.json
├── tsconfig.json
└── env.example
```

## 🔧 Полезные команды

```bash
npm run db:studio    # Открыть Prisma Studio (GUI для БД)
npm run db:push      # Синхронизировать схему без миграций (dev)
```

