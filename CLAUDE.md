# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project overview

Teacher API Assessment — a Node.js + Express REST API for teacher/student
administrative functions (registering students to teachers, finding common
students, suspending students, and resolving notification recipients).
Persistence is MySQL via Sequelize.

## Tech stack

- **Runtime:** Node.js (Docker image pins `node:20-alpine`)
- **Framework:** Express 4
- **ORM / DB:** Sequelize 6 over MySQL (`mysql2` driver)
- **Config:** `dotenv`
- **API docs:** `swagger-jsdoc` + `swagger-ui-express`, served at `/api-docs`
- **Tests:** Jest + Supertest
- Code is CommonJS (`require`/`module.exports`), not ESM.

## Commands

```bash
npm install        # install dependencies
npm start          # run the server (node src/server.js)
npm run dev        # run with nodemon (auto-reload)
npm test           # run Jest tests serially (--runInBand)
```

There is no lint or build step configured.

## Running tests

- Tests load env from `.env.test` and hit a **real MySQL database** via
  Supertest against the Express app — they are integration tests, not mocked.
- `sequelize.sync({ force: true })` runs in `beforeAll`, so the configured test
  database is dropped and recreated. Point `.env.test` at a disposable DB only.
- Jest runs with `--runInBand` because the tests share one database and cannot
  run in parallel safely.

## Architecture

Request flow: `src/server.js` → `src/app.js` → `src/routes/index.js` →
`src/controllers/teacherController.js` → Sequelize models.

- `src/server.js` — entrypoint; loads env, calls `sequelize.sync()`, starts the
  listener on `PORT` (default 3000).
- `src/app.js` — builds the Express app, mounts the inline Swagger spec at
  `/api-docs`, `express.json()`, routes under `/api`, then the error handler.
  The OpenAPI paths are defined inline here (not via JSDoc annotations), so
  **update this spec when you change an endpoint's shape**.
- `src/routes/index.js` — maps the four `/api` routes to controller functions.
- `src/controllers/teacherController.js` — all business logic.
- `src/config/database.js` — single Sequelize instance from `DB_*` env vars.
- `src/models/` — `Teacher`, `Student`, `TeacherStudent` (join table) plus
  `index.js`, which wires the `belongsToMany` relationship and is the one place
  models should be imported from (`require('../models')`).
- `src/middlewares/errorHandler.js` — final middleware; sends
  `{ "message": ... }` using `err.status` (default 500).

### Conventions

- Controllers throw an `Error` with a numeric `.status` and delegate to the
  error handler via `next(err)` rather than formatting responses themselves.
- Success responses: `204` (no body) for register/suspend, `200` with JSON for
  reads.
- Error responses follow the spec shape `{ "message": "..." }`.
- Teachers and students are keyed by unique, validated email addresses;
  `findOrCreate` is used so repeated registrations are idempotent.
- `retrievefornotifications` treats `@email` mentions in the notification text
  as additional recipients (see `extractMentionedEmails`) and excludes
  suspended students.

## Endpoints

All prefixed with `/api`:

- `POST /register` — register students to a teacher → 204
- `GET  /commonstudents?teacher=...` — students common to all listed teachers
- `POST /suspend` — suspend a student → 204
- `POST /retrievefornotifications` — recipients for a notification

## Environment variables

Copy `.env.example` to `.env`. Required: `DB_HOST`, `DB_PORT`, `DB_NAME`,
`DB_USER`, `DB_PASSWORD`; optional `PORT` (default 3000). `.env*` files are
gitignored — never commit real credentials.

## Docker

`docker build -t teacher-api .` then run with the `DB_*` env vars supplied.
The image installs production deps only and runs `npm start`.

## Notes for changes

- Keep the inline Swagger definition in `src/app.js` in sync with route/payload
  changes.
- Schema changes rely on `sequelize.sync()` — there are no migration files.
- Add new models through `src/models/index.js` so associations stay in one place.
