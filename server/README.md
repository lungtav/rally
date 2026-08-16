# Rally — Server

This is the backend API for Rally, a sports facility booking app where users reserve courts and pitches without double-booking conflicts. (The client lives in a separate directory)

Booking conflicts are prevented at the database level — not just checked in application code — using a PostgreSQL exclusion constraint, so overlapping bookings are physically impossible even under concurrent requests.

## Features

- **Authentication** — signup, OTP email verification (via Resend), login, refresh tokens (hashed at rest), logout
- **Facilities** — admin-managed courts/pitches with operating hours and typed categories
- **Bookings** — conflict-free scheduling enforced by a database exclusion constraint, with soft-cancel (booking history is preserved, not deleted)
- **Role-based access** — user vs. admin, enforced via middleware
- **Structured error handling** — a consistent `AppError` hierarchy mapped to proper HTTP status codes across the entire API

## Tech stack

- **Runtime**: Node.js, TypeScript
- **Framework**: Express
- **Database**: PostgreSQL (raw SQL, hand-rolled transactional migration runner)
- **Validation**: Zod
- **Auth**: JWT (access tokens) + hashed opaque refresh tokens
- **Email**: Resend

## Architecture

```
src/
  controllers/   → HTTP layer: parse request, call service, shape response
  services/      → business logic and database queries
  routes/        → route definitions and middleware wiring
  middleware/    → authenticate, requireAdmin, errorHandler, asyncHandler
  errors/        → AppError and its subclasses (NotFoundError, ConflictError, etc.)
  lib/           → framework-agnostic utilities (hashing, token generation, email)
  types/         → Zod schemas and inferred types, per resource
  config/        → env validation, database pool
migrations/      → numbered raw SQL migrations, applied by a custom transactional runner
```

Controllers never touch the database directly. Services never touch `req`/`res`. Every thrown error is either a recognized `AppError` subclass (mapped to a specific status code and message) or falls through to a generic, safe 500 — there is no unhandled error path.

## The core guarantee: no double bookings

```sql
ALTER TABLE bookings ADD CONSTRAINT no_overlapping_bookings
EXCLUDE USING gist (
    facility_id WITH =,
    tsrange(start_time, end_time) WITH &&
) WHERE (status = 'confirmed');
```

This constraint rejects any new booking whose time range overlaps an existing confirmed booking on the same facility — enforced by Postgres itself at insert time, not by a pre-check in application code. The application layer still validates input via Zod for a fast, friendly error message, but the database is the actual source of truth and cannot be bypassed by a race condition.




### Environment variables

| Variable | Description |
|---|---|
| `PORT` | Port the server listens on |
| `NODE_ENV` | `development` or `production` |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET_KEY` | Secret used to sign access tokens |
| `RESEND_API_KEY` | API key for sending OTP verification emails |

## API overview

| Resource | Routes |
|---|---|
| Auth | `POST /auth/signup`, `POST /auth/verify-otp`, `POST /auth/login`, `POST /auth/logout`, `POST /auth/refresh` |
| Users | `GET /users/me`, `PATCH /users/me`, `PATCH /users/me/password` |
| Facilities | `GET /facilities`, `GET /facilities/:id`, `GET /facilities/:id/availability`, `POST /facilities` (admin), `PUT /facilities/:id` (admin), `DELETE /facilities/:id` (admin) |
| Bookings | `POST /bookings`, `GET /bookings/me`, `GET /bookings/:id`, `GET /bookings` (admin) |

## What this project demonstrates

- Solving a real concurrency problem with a database constraint, not just application logic
- A hand-rolled, transactional SQL migration system (no ORM) with idempotent re-runs
- A consistent error-handling architecture across an entire API surface
- Security-conscious auth: hashed refresh tokens, generic error messages to prevent user enumeration, OTP expiry, role-based authorization