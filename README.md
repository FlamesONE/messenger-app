<p align="center">
  <img src="images/logo.png" alt="Fasty" />
</p>

<h1 align="center">Fasty Messenger</h1>

<p align="center">
  Мессенджер с личными сообщениями, беседами и профилями.<br/>
  Монорепо с отдельным <b>backend</b> и <b>frontend</b> для масштабируемости.
</p>

<p align="center">
  <a href="https://fasty.flute-cms.com"><b>🌐 Демо — fasty.flute-cms.com</b></a>
</p>

---

## Быстрый старт (Docker)

> Для запуска нужен только **Docker** и **Docker Compose**.

**1.** Склонируйте репозиторий и создайте `.env` из шаблона:

```bash
git clone <repo-url> && cd Messenger
cp .env.example .env
```

**2.** Запустите весь стек одной командой:

```bash
docker compose up -d
```

Это поднимет **все сервисы**: PostgreSQL, ScyllaDB, Redis, Meilisearch, MinIO, миграции и backend.

**3.** Backend будет доступен на `http://localhost:3000`.

**4.** Для frontend (dev-режим):

```bash
cd frontend
cp .env.example .env
bun install
bun run dev
```

Frontend будет доступен на `http://localhost:5173`, API проксируется автоматически.

### Полезные команды

| Команда | Описание |
|---|---|
| `docker compose up -d` | Запустить все сервисы |
| `docker compose down` | Остановить все сервисы |
| `docker compose logs -f backend` | Логи backend в реальном времени |
| `docker compose build --no-cache` | Пересобрать образы |

---

## Экраны

<p align="center">
  <img src="images/chat.png" alt="Чат" width="720" />
</p>

<p align="center">
  <em>Основной экран чата</em>
</p>

<p align="center">
  <img src="images/profile.png" alt="Профиль" width="360" />
  &nbsp;&nbsp;
  <img src="images/settings.png" alt="Настройки" width="360" />
</p>

<p align="center">
  <em>Профиль пользователя &nbsp;•&nbsp; Настройки</em>
</p>

<p align="center">
  <img src="images/notifications.png" alt="Уведомления" width="360" />
</p>

<p align="center">
  <em>Уведомления</em>
</p>

---

## Переменные окружения

### Корневой `.env` (для Docker Compose)

> Используется при `docker compose up`. Все сервисы ссылаются друг на друга по **имени контейнера**.

```env
# ── Приложение ──────────────────────────────────────────
NODE_ENV=development
PORT=3000

# ── PostgreSQL ──────────────────────────────────────────
POSTGRES_USER=messenger
POSTGRES_PASSWORD=messenger_secret
POSTGRES_DB=messenger
DATABASE_URL=postgresql://messenger:messenger_secret@postgres:5432/messenger

# ── ScyllaDB ────────────────────────────────────────────
SCYLLA_CONTACT_POINTS=scylla:9042
SCYLLA_DATACENTER=datacenter1
SCYLLA_KEYSPACE=messenger
SCYLLA_REPLICATION_FACTOR=1

# ── Redis ───────────────────────────────────────────────
REDIS_URL=redis://redis:6379

# ── JWT ─────────────────────────────────────────────────
JWT_SECRET=change-me-to-a-random-32-char-string!!
JWT_EXPIRES_IN=7d

# ── S3 / MinIO ─────────────────────────────────────────
S3_ENDPOINT=http://minio:9000
S3_REGION=us-east-1
S3_BUCKET=messenger-uploads
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin

# ── CORS ────────────────────────────────────────────────
CORS_ORIGIN=http://localhost:5173

# ── Meilisearch ────────────────────────────────────────
MEILISEARCH_URL=http://meilisearch:7700
MEILISEARCH_KEY=masterKey
```

### `backend/.env` (для локальной разработки без Docker)

> Используется при `bun run dev`. Хосты указывают на **localhost**.

```env
NODE_ENV=development
PORT=3000

DATABASE_URL=postgresql://user:password@localhost:5432/messenger

SCYLLA_CONTACT_POINTS=localhost:9042
SCYLLA_DATACENTER=datacenter1
SCYLLA_KEYSPACE=messenger
SCYLLA_REPLICATION_FACTOR=1

REDIS_URL=redis://localhost:6379

JWT_SECRET=change-me-to-a-secure-random-string-at-least-32-chars
JWT_EXPIRES_IN=7d

S3_ENDPOINT=http://localhost:9000
S3_REGION=us-east-1
S3_BUCKET=messenger-uploads
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin

CORS_ORIGIN=http://localhost:5173

MEILISEARCH_URL=http://localhost:7700
MEILISEARCH_KEY=masterKey
```

### `frontend/.env`

```env
# Адрес backend для Vite dev proxy
VITE_API_TARGET=http://localhost:3000
```

### Описание переменных

| Переменная | Описание |
|---|---|
| `DATABASE_URL` | Connection string для PostgreSQL |
| `SCYLLA_CONTACT_POINTS` | Адрес узла ScyllaDB (хост:порт) |
| `SCYLLA_KEYSPACE` | Keyspace в ScyllaDB для данных мессенджера |
| `REDIS_URL` | Connection string для Redis |
| `JWT_SECRET` | Секрет для подписи JWT-токенов (*минимум 32 символа*) |
| `JWT_EXPIRES_IN` | Время жизни токена (например `7d`, `24h`) |
| `S3_ENDPOINT` | URL S3-совместимого хранилища (MinIO в dev) |
| `S3_BUCKET` | Имя bucket для загрузки файлов |
| `CORS_ORIGIN` | Разрешённый origin для CORS |
| `MEILISEARCH_URL` | URL инстанса Meilisearch |
| `MEILISEARCH_KEY` | Master key для Meilisearch |

---

## Backend

Для Backend я старался придерживаться **Clean Architecture**, но с небольшой импровизацией.

#### Почему не DDD? Почему не MVC?

Все просто:
1. **DDD** - очень объемный и сложный архитектурный подход. Данный проект даже в будущем для серьезных систем не потребует столь значительного слоя абстракции (хотя некоторые проявления DDD я все-таки у себя сделал.)
2. **MVC** - слишком простой. Контроллеры раздуются до гигантских масштабов. Нельзя будет внедрить в будущем event-driven подход, да и в целом это уровень начинающих стартапов. Считать это серьезной архитектурой для подобного проекта довольно опрометчиво

Поэтому мой выбор пал на **Clean Architecture**. Я разделил некоторые части системы на интерфейсы и репозитории, некоторые части превратил в use-case.

### Подробнее про архитектуру и подход

В больших приложениях значительную роль в масштабировании системы выполняет как раз архитектура. На старте всегда функционала мало и поэтому люди ошибочно считают что если функций нет, можно и попроще, но в конце концов все приходят к одному - полному рефакторингу.

В общем как я упоминал ранее, я решил сделать чуть умнее, и подумать о будущей масштабируемости хотя бы на 30% чтобы в будущем дышалось легче 🤷‍♂️

Как я упоминал ранее, я следовал следующим подходам:
1. **Каждый компонент системы не должен быть завязан на определенной системе СУБД.**
Каждый мессенджер с развитием сталкивается с большим кол-вом проблем (кластеризаций, стоимость этих самых кластеров, задержки в запросах и т.п.). Примером тому -- Discord. Изначально жил на Postgres, потом перешел на Apache Cassandra, ну а после уже мигрировали полностью на SkyllaDB.
2. **Каждый вид запроса должен быть строго разделен.**
Мне показалось пихать WebSocket соединения и HTTP обработчики в одно место - это прямой путь в монолит и огромную кашу, поэтому я разделил отдельно систему на **transport**. Отдельный файл для добавления своего события в WebSocket и будущая обработка, второе - HTTP. Все они работают независимо друг от друга и в будущем легко взаимозаменить какую-либо часть системы. Каждый **transport** **автоматически** интегрируется в систему.
3. **Каждые обработчики должны быть обернуты в отдельные модули со своей зоной ответственности.**
Я решил разделить части систем на модули. Т.к. в прошлом я разработчик CMS, то для меня это очень знакомый и удобный подход. Вместо того, чтобы делать огромные связи и монолиты, проще всего сделать отдельно маленькие модули (хотя и в теории их можно назвать микросервисами 🧐) и подключать их к общей системе. Каждый модуль использует уже готовые инструменты из системы и работает независимо от других модулей. В общем это удобно.

### Структура Backend

```
backend/src/
├── index.ts                        # Entry point (кластеризация по CPU ядрам)
├── main.ts                         # Bootstrap: инициализация модулей и сервера
│
├── infrastructure/                 # Подключение к внешним системам
│   ├── di/                         #   Dependency Injection контейнер
│   │   └── container.ts            #     Синглтон AppContext со всеми зависимостями
│   ├── event-bus/                   #   Внутренняя шина событий (pub/sub)
│   │   ├── event-bus.ts            #     Реализация EventBus
│   │   └── broadcast.subscriber.ts #     Подписчик broadcast:chat → WebSocket
│   ├── bullmq/                     #   Очереди фоновых задач (BullMQ)
│   │   ├── connection.ts           #     Подключение к Redis для очередей
│   │   ├── bullmq-job-queue.ts     #     Абстракция очереди задач
│   │   ├── worker-registry.ts      #     Реестр воркеров
│   │   └── types.ts                #     Типы задач
│   ├── pg/                         #   PostgreSQL (Drizzle ORM)
│   │   ├── client.ts               #     Пул соединений + Drizzle клиент
│   │   ├── schema.ts               #     Схемы: users, chats, chat_members
│   │   ├── model.ts                #     Inferred типы из схем
│   │   └── utils.ts                #     Утилиты для запросов
│   ├── redis/                      #   Redis (кеширование)
│   │   ├── client.ts               #     Подключение IORedis
│   │   └── cache.service.ts        #     TTL-кеш сервис
│   └── scylla/                     #   ScyllaDB (cassandra-driver)
│       ├── client.ts               #     Подключение к кластеру
│       └── migrator.ts             #     Миграции keyspace/таблиц
│
├── modules/                        # Бизнес-модули (Clean Architecture)
│   ├── auth/                       #   Аутентификация
│   │   ├── auth.module.ts          #     Регистрация модуля
│   │   ├── auth.http.ts            #     POST /auth/register, /auth/login
│   │   ├── dto/                    #     Валидация входных данных
│   │   │   ├── login.dto.ts
│   │   │   └── register.dto.ts
│   │   └── use-cases/              #     login, register
│   │       ├── login.ts
│   │       └── register.ts
│   ├── chat/                       #   Чаты
│   │   ├── chat.module.ts
│   │   ├── chat.http.ts            #     CRUD чатов, инвайты, участники
│   │   ├── chat.ws.ts              #     WebSocket события чатов
│   │   ├── dto/
│   │   │   └── create-chat.dto.ts
│   │   └── use-cases/
│   │       ├── create-chat.ts
│   │       ├── add-member.ts
│   │       ├── get-user-chats.ts
│   │       ├── get-chat-members.ts
│   │       ├── leave-chat.ts
│   │       ├── delete-chat.ts
│   │       ├── generate-invite-link.ts
│   │       └── join-by-invite.ts
│   ├── message/                    #   Сообщения
│   │   ├── message.module.ts
│   │   ├── message.http.ts         #     REST API сообщений
│   │   ├── message.ws.ts           #     Real-time обмен сообщениями
│   │   ├── dto/
│   │   │   └── send-message.dto.ts
│   │   ├── jobs/                   #     Фоновые задачи (уведомления)
│   │   │   ├── notification.handler.ts
│   │   │   └── notification.types.ts
│   │   └── use-cases/
│   │       ├── send-message.ts
│   │       ├── delete-message.ts
│   │       ├── edit-message.ts
│   │       ├── get-history.ts
│   │       ├── search-messages.ts
│   │       ├── mark-as-read.ts
│   │       ├── toggle-reaction.ts
│   │       └── get-reactions.ts
│   ├── upload/                     #   Загрузка файлов
│   │   ├── upload.module.ts
│   │   ├── upload.http.ts          #     POST /upload
│   │   ├── files.http.ts           #     Раздача файлов
│   │   ├── jobs/                   #     Обработка медиа
│   │   │   ├── media-processing.handler.ts
│   │   │   └── media-processing.types.ts
│   │   └── use-cases/
│   │       └── upload-file.ts
│   └── user/                       #   Профиль пользователя
│       ├── user.module.ts
│       ├── user.http.ts            #     GET/PATCH профиля, поиск
│       └── use-cases/
│           ├── get-profile.ts
│           ├── update-profile.ts
│           └── search-users.ts
│
├── repositories/                   # Data Access Layer (абстракция от СУБД)
│   ├── interfaces/                 #   Контракты репозиториев
│   │   ├── user.repository.ts
│   │   ├── chat.repository.ts
│   │   ├── message.repository.ts
│   │   └── file-storage.ts
│   ├── cached/                     #   Кеширующие обёртки (Redis)
│   │   ├── cached-user.repository.ts
│   │   └── cached-chat.repository.ts
│   ├── postgres/                   #   Реализация для PostgreSQL
│   │   ├── pg-user.repository.ts
│   │   └── pg-chat.repository.ts
│   ├── scylla/                     #   Реализация для ScyllaDB
│   │   └── scylla-message.repository.ts
│   └── s3/                         #   Реализация для S3/MinIO
│       └── s3-file-storage.ts
│
├── transport/                      # HTTP и WebSocket слой
│   ├── http.server.ts              #   Elysia сервер (CORS, security, OpenAPI)
│   ├── ws.gateway.ts               #   WebSocket gateway
│   ├── ws.router.ts                #   Маршрутизация WS-событий
│   ├── ws.connection-manager.ts    #   Управление WS-соединениями
│   ├── ws.types.ts                 #   Типы WS-сообщений
│   ├── auth.guard.ts               #   JWT middleware
│   ├── error-mapper.ts             #   Маппинг ошибок → HTTP ответы
│   └── rate-limit.ts               #   Rate limiting
│
├── shared/                         # Общие утилиты
│   ├── config/
│   │   └── env.ts                  #   Zod-валидация переменных окружения
│   ├── errors.ts                   #   Кастомные ошибки (NotFound, Conflict, …)
│   ├── logger.ts                   #   Pino логер
│   └── types/
│       ├── common.ts               #   Paginated<T>, AuthContext
│       ├── api-types.ts            #   Типы API ответов
│       └── ws-events.ts            #   Типы WebSocket событий
│
└── migrations/                     # Миграции БД
    ├── pg/                         #   PostgreSQL (Drizzle Kit)
    └── scylla/                     #   ScyllaDB (ручные CQL)
```

### Технологии что я использовал

Для реализации всего Backend я использовал следующие библиотеки:
- [Bun](https://bun.sh) - для запуска и сборки проекта
- [Elysia](https://elysiajs.com) - для создания HTTP сервера
- [TypeScript](https://www.typescriptlang.org) - для типов
- [Drizzle ORM](https://orm.drizzle.team) - для работы с PostgreSQL
- [ScyllaDB](https://www.scylladb.com) - для хранения сообщений
- [IORedis](https://redis.io) - для кеширования данных
- [BullMQ](https://docs.bullmq.io) - для фоновых задач (уведомления, обработка медиа)
- [JWT](https://jwt.io) - для аутентификации и авторизации
- [S3](https://aws.amazon.com/s3) - для хранения файлов
- [Meilisearch](https://www.meilisearch.com) - для поиска данных
- [Biome](https://biomejs.dev) - для линтинга и форматирования кода
- [Pino](https://getpino.io) - для логирования
- [NanoID](https://github.com/ai/nanoid) - для генерации уникальных идентификаторов
- [Zod](https://zod.dev) - для валидации данных

и другие.

---

## Frontend

Frontend реализован достаточно просто.

Для архитектуры я не стал придумывать велосипед, и решил использовать обычный [FSD](https://fsd.how/docs/get-started/overview/) подход.

Подробнее об этом подходе можно почитать [на их сайте](https://fsd.how/docs/get-started/overview/), я заострять внимание на его описании не буду.

### Технологии что я использовал

Весь фронт реализован на React с использованием [Vite](https://vitejs.dev), [Tailwind CSS](https://tailwindcss.com) и [TypeScript](https://www.typescriptlang.org).

В качестве библиотек я использовал:
- [Eden Treaty](https://elysiajs.com/eden/treaty/overview.html) из Elysia для работы с API
- [Shadcn](https://ui.shadcn.com) для компонентов
- [Tailwind CSS](https://tailwindcss.com) для стилей
- [TypeScript](https://www.typescriptlang.org) для типов
- [React](https://react.dev) для UI
- [Vite](https://vitejs.dev) для сборки
- [Biome](https://biomejs.dev) для линтинга и форматирования кода
- [Zod](https://zod.dev) для валидации данных
- [Zustand](https://zustand-demo.pmnd.rs) для управления состоянием
- [React Query](https://tanstack.com/query/latest) для запросов к API
- [React Router](https://reactrouter.com) для маршрутизации

---

## Десктоп и Android (Tauri)

Ради эксперимента реализована обёртка на [Tauri](https://v2.tauri.app) — тот же фронтенд упаковывается в нативное приложение для **Windows**, **macOS** и **Android**.

- **Windows** — `.exe` / `.msi`
- **macOS** — `.dmg` / `.app`
- **Android** — `.apk`

Сборка происходит автоматически через GitHub Actions при создании тега `v*`. Готовые артефакты прикрепляются к [GitHub Release](../../releases).

Для локальной сборки:

```bash
cd frontend
bun install
bunx tauri build          # десктоп
bunx tauri android build  # android (нужен Android SDK + NDK)
```

---

## Docker-сервисы

Полный стек поднимается через `docker compose up -d`:

| Сервис | Образ | Порт | Назначение |
|---|---|---|---|
| **postgres** | `postgres:18-alpine` | `5432` | Основная БД (пользователи, чаты) |
| **scylla** | `scylladb/scylla:2025.1` | `9042` | Хранение сообщений |
| **redis** | `redis:8-alpine` | `6379` | Кеширование и pub/sub |
| **meilisearch** | `getmeili/meilisearch:v1.37` | `7700` | Полнотекстовый поиск |
| **minio** | `minio/minio:latest` | `9000` / `9001` | S3-совместимое файловое хранилище |
| **minio-init** | `minio/mc:latest` | — | Создание bucket при первом запуске |
| **migrate** | *backend image* | — | Применение миграций PostgreSQL |
| **backend** | *backend image* | `3000` | API-сервер приложения |

---

# Послесловие

Это было нелегко 🫠 Я никогда не использовал ElysiaJS и SkyllaDB, поэтому мне пришлось полностью изучить схему работы SkyllaDB и зачем он нужен вообще, да и синтаксис ElysiaJS тоже пришлось смотреть и понимать.

Сами инструменты прикольные и я точно возьму их к себе на вооружение в будущем, даже если мое тестовое задание покажется не самым лучшим вариантом для реализации, для себя я узнал достаточно много нового.

Не буду скрывать, я **использую ИИ как инструмент для разработки**, и считаю что принципиальный отказ от него - **путь в никуда**. ИИ банально может забирать на себя рутинное чтение документации новых библиотек и подходов (особенно учитывая сжатые сроки для реализации, изучить, придумать, сделать руками все это, так еще и удивить - без ИИ невозможно). Но я думаю все понимают, что использование ИИ бездумно и без понимания что ты делаешь тоже **путь в никуда**.

В общем спасибо за внимание, надеюсь вам понравилось. Буду рад любой обратной связи ❤️
