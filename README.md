# TaskFlow — Task Management System

A full-stack Task Management System where users register, log in, and manage their personal tasks. Built with Next.js, Express, and PostgreSQL. The database and API run via Docker Compose; the Next.js frontend runs/deploys separately.

## Features

- **Authentication** — Register / Login with JWT-based sessions and bcrypt-hashed passwords.
- **Task management** — Create, edit, delete, and mark tasks as completed.
- **Dashboard** — View all tasks, filter by *pending* / *completed*, and search by title or description.
- **Modern responsive UI** — Next.js + Tailwind CSS, loading states, and client + server-side form validation.
- **Clean REST API** — Structured Express backend with controllers, routes, models, middleware, and centralized error handling.
- **Dockerized data + API** — One command (`docker compose up`) brings up PostgreSQL and the API.

## Tech Stack

| Layer    | Technology                                       |
| -------- | ------------------------------------------------ |
| Frontend | Next.js 14 (App Router), Axios, Tailwind CSS     |
| Backend  | Node.js, Express, JWT, bcryptjs, express-validator |
| Database | PostgreSQL 16                                    |
| Infra    | Docker, Docker Compose (db + api)               |

## Project Structure

```
TMS/
├── docker-compose.yml         # Runs db + api (credentials + build)
├── api/                       # Express REST API
│   ├── Dockerfile
│   ├── .env.example
│   └── src/
│       ├── index.js           # Server entry (DB wait + schema init + listen)
│       ├── app.js             # Express app, middleware, route mounting
│       ├── config/            # db pool + schema initialization
│       ├── models/            # SQL data-access layer (users, tasks)
│       ├── controllers/       # Request handlers
│       ├── routes/            # Route definitions + validation rules
│       └── middleware/        # auth, validation, error handling
└── web/                       # Next.js frontend (App Router)
    ├── Dockerfile             # Optional: standalone Next.js image
    ├── .env.example
    ├── next.config.mjs
    ├── lib/api.js             # Axios instance + JWT interceptors
    ├── context/               # AuthContext
    ├── components/            # Navbar, TaskForm, TaskItem, TaskList, etc.
    └── app/                   # Routes: / (dashboard), /login, /register
```

## Quick Start

Requires Docker (for the database + API) and Node.js 18+ (for the Next.js frontend).

### 1. Start the database + API (Docker)

```bash
# From the project root
docker compose up --build
```

This starts:
- **PostgreSQL** on `localhost:5432`
- **API** on `localhost:5000` (health check: http://localhost:5000/api/health)

The schema is created automatically on first API start; data persists in the `pgdata` volume.
DB credentials and `JWT_SECRET` are set directly in `docker-compose.yml` — change them for anything beyond local use.

To stop: `docker compose down` (add `-v` to also remove the database volume).

### 2. Start the frontend (Next.js)

```bash
cd web
cp .env.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:5000/api
npm install
npm run dev                  # http://localhost:3000
```

Open http://localhost:3000 and register an account.

> For a production build: `npm run build && npm start`.

## Local Development (API on host)

If you prefer to run the API on your host with hot reload, start only the database in Docker:

```bash
docker compose up -d db

cd api
cp .env.example .env     # set DATABASE_URL host to localhost
npm install
npm run dev              # http://localhost:5000
```

> When running the API on the host, set `DATABASE_URL=postgresql://tms_user:tms_password@localhost:5432/tms_db` in `api/.env`.

## Environment Variables

### `docker-compose.yml` (db + api)

Credentials are defined inline in the compose file:

| Variable      | Description                              | Value (default)             |
| ------------- | ---------------------------------------- | --------------------------- |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | Database credentials | `tms_user` / `tms_password` / `tms_db` |
| `DATABASE_URL`  | API → DB connection string             | points at the `db` service  |
| `JWT_SECRET`    | Secret used to sign JWTs (**change it**) | `change_me_to_a_long_random_secret` |

### `web/.env.local` (Next.js)

| Variable               | Description                          | Default                     |
| ---------------------- | ------------------------------------ | --------------------------- |
| `NEXT_PUBLIC_API_URL`  | Base URL of the backend API          | `http://localhost:5000/api` |

## API Reference

**Interactive docs (Swagger UI):** http://localhost:5000/api/docs
**Raw OpenAPI spec:** http://localhost:5000/api/docs.json

Use the **Authorize** button in Swagger UI to paste a JWT (from register/login) and try the task endpoints directly.

Base URL: `http://localhost:5000/api`

### Auth

| Method | Endpoint         | Auth | Body                          | Description              |
| ------ | ---------------- | ---- | ----------------------------- | ----------------------- |
| POST   | `/auth/register` | No   | `{ name, email, password }`   | Create account, returns JWT |
| POST   | `/auth/login`    | No   | `{ email, password }`         | Log in, returns JWT     |
| GET    | `/auth/me`       | Yes  | —                             | Current user profile    |

### Tasks (all require `Authorization: Bearer <token>`)

| Method | Endpoint       | Body                                      | Description                          |
| ------ | -------------- | ----------------------------------------- | ------------------------------------ |
| GET    | `/tasks`       | — (query: `status`, `search`)             | List tasks (filter + search)         |
| GET    | `/tasks/:id`   | —                                         | Get a single task                    |
| POST   | `/tasks`       | `{ title, description? }`                  | Create a task                        |
| PUT    | `/tasks/:id`   | `{ title?, description?, completed? }`     | Update / mark complete (partial)     |
| DELETE | `/tasks/:id`   | —                                         | Delete a task                        |

**Query params for `GET /tasks`:**
- `status` — `pending` or `completed` (omit for all)
- `search` — case-insensitive match on title/description

### Example

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Ada","email":"ada@example.com","password":"secret123"}'

# Create a task (use the token from the response above)
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"title":"Write docs","description":"Finish the README"}'
```

## Deployment

**Database + API** — `docker compose up --build -d` on any Docker host (VPS, EC2, etc.). Update the credentials and `JWT_SECRET` in `docker-compose.yml` (or point `DATABASE_URL` at a managed PostgreSQL instance) before going live. The API can also run on any Node host (Render, Railway, Fly.io).

**Frontend (Next.js)** — Deploy `web/` to Vercel (zero-config) or any Node host:
- Set `NEXT_PUBLIC_API_URL` to your deployed API URL.
- Build/run with `npm run build && npm start`, or use the included `web/Dockerfile` (Next.js standalone output) for a container.

> Remember to allow the frontend's origin in the API's CORS config (`CLIENT_URL` in `api/.env`) when deploying to public URLs.

## License

MIT
