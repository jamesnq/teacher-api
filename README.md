# Teacher API Assessment

NodeJS + Express + MySQL implementation of the teacher/student admin API.

## Tech stack

- NodeJS
- Express
- Sequelize (MySQL)
- Jest + Supertest for tests

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create MySQL databases:

```sql
CREATE DATABASE teacher_api;
CREATE DATABASE teacher_api_test;
```

3. Create a `.env` file (for local dev) based on `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` and set your MySQL username/password.

4. (Optional) Adjust `.env.test` for test DB credentials.

## Running the API

```bash
npm start
```

Server will start on `http://localhost:3000` (or `PORT` from `.env`).

On first run, Sequelize will create the tables automatically.

## Running tests

```bash
npm test
```

## Endpoints

All endpoints are prefixed with `/api`.

- `POST /api/register`
- `GET /api/commonstudents`
- `POST /api/suspend`
- `POST /api/retrievefornotifications`

Error responses follow the spec:

```json
{ "message": "Some meaningful error message" }
```
