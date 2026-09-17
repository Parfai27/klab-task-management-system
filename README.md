# Task Manager

A full-stack web app for managing personal tasks. The React UI talks to a Spring Boot REST API; tasks are stored in PostgreSQL.

## Features

- Kanban board: **Pending** and **Completed** columns
- Create, edit, and delete a task from a side drawer
- Mark a task complete (or open again) with one click
- Filter by status (`All` / `Pending` / `Completed`)
- Search by title or description
- Priority: `LOW`, `MEDIUM`, `HIGH`
- Form validation in the UI and on the API
- Swagger UI at `/swagger-ui.html`
- Integration tests for the REST endpoints

Each task stores:

`id` · `title` · `description` · `status` · `priority` · `createdAt`

## Tech stack

| Layer | Choice |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS |
| Backend | Java 21, Spring Boot 3.5, Spring Data JPA |
| API | REST (`/tasks`) |
| Database | PostgreSQL 16 (H2 in-memory for tests) |
| Docs | springdoc-openapi (Swagger UI) |

## Architecture

```text
Browser  →  Vite (:5173)  ──proxy /tasks──►  Spring Boot (:8080)
                                                    │
                                                    ▼
                                             PostgreSQL (task_manager)
```

In local development the UI calls `/tasks` on the same origin. Vite forwards those requests to the API, so CORS is not required for the board. Hibernate creates and updates the `tasks` table (`ddl-auto: update`).

## Prerequisites

- Node.js 20+
- Java 21
- Maven 3.9+
- PostgreSQL 14+, **or** Docker Desktop

## Database setup

### Option A — Docker Postgres (recommended if you already have a local install)

A local PostgreSQL service often occupies port `5432`. Publish the Compose database on `5433` instead:

```powershell
$env:POSTGRES_PORT = "5433"
docker compose up db -d
```

Then start the API with:

```powershell
$env:DB_URL = "jdbc:postgresql://localhost:5433/task_manager"
$env:DB_USERNAME = "postgres"
$env:DB_PASSWORD = "postgres"
mvn -f backend/pom.xml spring-boot:run
```

Compose creates the `task_manager` database (`postgres` / `postgres`).

### Option B — Local PostgreSQL on 5432

```sql
CREATE DATABASE task_manager;
```

Default connection (see `backend/src/main/resources/application.yml`):

```text
DB_URL=jdbc:postgresql://localhost:5432/task_manager
DB_USERNAME=postgres
DB_PASSWORD=postgres
```

Override those variables if your credentials differ.

## Run locally

Install frontend dependencies once:

```bash
npm --prefix frontend install
```

Start the API (from the repo root), with `DB_*` set if you are not using the defaults:

```bash
mvn -f backend/pom.xml spring-boot:run
```

Start the UI in another terminal:

```bash
npm --prefix frontend run dev
```

| What | URL |
| --- | --- |
| App | http://localhost:5173 |
| API | http://localhost:8080/tasks |
| Swagger | http://localhost:8080/swagger-ui.html |

Root scripts:

```bash
npm run frontend:dev
npm run backend:run
npm run backend:test
```

## Run the full stack with Docker

```bash
docker compose up --build
```

This starts PostgreSQL, the API on `8080`, and the UI on `5173`. If port `5432` is already in use:

```powershell
$env:POSTGRES_PORT = "5433"
docker compose up --build
```

The API container still talks to Postgres on the internal Docker network (`db:5432`). `POSTGRES_PORT` only changes the host mapping.

## Stop everything

- Local API / UI: `Ctrl+C` in each terminal
- Docker database or full stack:

```bash
docker compose down
```

## REST API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/tasks` | List tasks |
| `GET` | `/tasks?status=PENDING` | Filter by `PENDING` or `COMPLETED` |
| `GET` | `/tasks/{id}` | Get one task |
| `POST` | `/tasks` | Create a task |
| `PUT` | `/tasks/{id}` | Update a task |
| `DELETE` | `/tasks/{id}` | Delete a task |

### Create / update body

```json
{
  "title": "Prepare the demo",
  "description": "Walk through the UI, API, and database.",
  "status": "PENDING",
  "priority": "HIGH"
}
```

`status`: `PENDING` or `COMPLETED`. `priority`: `LOW`, `MEDIUM`, or `HIGH`.

```powershell
curl -X POST http://localhost:8080/tasks `
  -H "Content-Type: application/json" `
  -d "{\"title\":\"Prepare the demo\",\"description\":\"Walk through the app\",\"status\":\"PENDING\",\"priority\":\"HIGH\"}"
```

| Result | Status |
| --- | --- |
| Validation error | `400` |
| Task not found | `404` |
| Deleted | `204` |

## Tests

```bash
mvn -f backend/pom.xml test
```

Tests use H2 (`application-test.yml`), so PostgreSQL is not required. They cover create, filter, get, update, delete, not-found, and blank-title validation.

## Project structure

```text
backend/     Spring Boot API, JPA entity, tests, Dockerfile
frontend/    React + Vite UI (kanban board)
docker-compose.yml
```

## Technical decisions

- **Layered API** — Controller → Service → JPA repository.
- **Enums** for status and priority, so invalid values never reach the database.
- **`createdAt` via `@PrePersist`** — clients cannot overwrite the creation timestamp.
- **Vite proxy** in development; `VITE_API_URL` for a production build that calls the API directly.
- **CORS origin patterns** (`localhost` and `127.0.0.1`) for cases where the UI is not proxied.
- **H2 for tests only** — PostgreSQL for real data.
- **Status filter on the server** (`GET /tasks?status=`); search is applied in the browser.

## Optional extras

Search, UI + API validation, Swagger, integration tests, Docker, and a kanban layout with priority rails and a create/edit drawer.

Authentication, pagination, and a hosted demo of the API are not included with the static UI alone. Netlify hosts the React frontend; the Spring Boot API and PostgreSQL must run on a Java-capable host (Render, Railway, or a VPS). Set `VITE_API_URL` in the Netlify build to that API URL, and add the Netlify site origin to `CORS_ORIGINS`.

## Deploy on Netlify

The frontend is configured for Netlify via `netlify.toml` (build from `frontend/`, publish `dist`, SPA fallback).

1. Push this repository to GitHub.
2. In Netlify: **Add new site → Import an existing project** and select the repo.
3. Confirm base directory `frontend`, build command `npm run build`, publish directory `dist`.
4. Add environment variable `VITE_API_URL` = your public API URL (for example `https://your-api.onrender.com`).
5. Deploy.

Without `VITE_API_URL`, the built UI will call `/tasks` on the Netlify domain, which has no Spring Boot server.

