# Architecture & Docker

## Overview

A 3-tier app:

```
Next.js (browser)  ──HTTP/JSON──>  Express API  ──SQL──>  PostgreSQL
   :3000                            :5000                   :5432
   (host)                         └──── Docker Compose ────┘
```

The frontend sends a JWT with each request; the stateless API verifies it and reads/writes Postgres.

## Technologies

- **Frontend:** Next.js 14 (App Router), React Context (auth), Axios, Tailwind CSS
- **Backend:** Node.js + Express, JWT auth, bcrypt, express-validator, Swagger docs
- **Database:** PostgreSQL 16 (`users` 1—∞ `tasks`)
- **Infra:** Docker + Docker Compose

## How Docker fits in

Docker runs the **database + API** as containers, so there's nothing to install locally. The Next.js frontend stays on the host (fast hot-reload) or deploys to Vercel.

`docker compose up` does three things:

1. **Starts Postgres** (`postgres:16-alpine`) with the credentials set in `docker-compose.yml`, storing data in the `pgdata` volume so it survives restarts.
2. **Builds + runs the API** from `api/Dockerfile` (Node image → `npm install` → `npm start`).
3. **Connects them on a private network**, where the API reaches the DB by service name `db` (not `localhost`). Host ports `5000` (API) and `5432` (DB) are published so you can reach them from your machine.

The API waits for the DB on boot and auto-creates its schema on first run — no migration step.

## Common commands

```bash
docker compose up --build      # start everything
docker compose up -d --build api   # rebuild API after code changes
docker compose logs -f api     # view logs
docker compose down            # stop (keeps data)
docker compose down -v         # stop and wipe the DB volume
```
