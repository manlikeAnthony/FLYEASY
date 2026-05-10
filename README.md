# FlyEasy ✈️

## Overview

FlyEasy is a full-stack flight booking system that enables users to search for flights, make reservations, and manage bookings. It provides a RESTful backend for data and authentication, and a responsive frontend for search, booking flows, and account management.

## Features

# FlyEasy ✈️

## Overview

FlyEasy is a TypeScript full-stack project providing a backend API and a React frontend. The repository implements a user authentication system (registration, login, email verification, password reset) and a request-management API used to create and manage travel requests.

All API routes are mounted under the `/api/v1` prefix in the backend.

## Current Features

- Authentication
  - User registration with email verification (verification token stored and emailed)
  - Login with password validation; server issues access and refresh tokens and attaches them as HTTP-only cookies
  - Logout (deletes stored refresh tokens and clears cookies)
  - Forgot-password and reset-password flows (tokens issued and validated)

- Request handling (flight/request resource)
  - Create requests (public endpoint)
  - Claim, update, delete, and retrieve requests
  - Search/list requests and retrieve by tracking ID
  - Admin-only metrics and list endpoints for requests

## Tech Stack

- Backend: Node.js, Express, TypeScript, MongoDB, Mongoose
  - Key libraries: `jsonwebtoken`, `bcryptjs`, `joi`, `nodemailer`, `winston`, `express-async-errors`
- Frontend: React, Vite
  - Key libraries: `axios`, `react-router-dom`, `@tanstack/react-query`

## Project Structure (backend)

```
backend/src
	auth/
		auth.controller.ts
		auth.route.ts
		auth.service.ts
		token.model.ts
		user.model.ts
	users/
		user.controller.ts
		user.route.ts
		user.service.ts
	request/
		request.controller.ts
		request.route.ts
		request.model.ts
		request.service.ts
	config/
		database.ts
		jwt.ts
		nodemailer.ts
	dto/
	errors/
	logger/
	middlewares/
		authenticate.ts
		error-handler.ts
		not-found.ts
		async-handler.ts
		validator.middleware.ts
	query/
	response/
	types/
	utils/
		jwt.ts
		cookies.ts
		email/
	validator/
	app.ts
	server.ts
```

The frontend is in the `frontend` folder (Vite + React). See `frontend/src` for UI components.

## Authentication Flow (implemented)

1. Registration: `POST /api/v1/auth/register` — controller calls `registerService` which creates a user, hashes the password (Mongoose pre-save), and generates a verification token (stored hashed on the user). A verification email is sent using the configured mailer.
2. Email verification: `POST /api/v1/auth/verify-email` — verifies token and marks the user as verified.
3. Login: `POST /api/v1/auth/login` — service validates credentials and `isVerified` flag, then returns a `tokenUser` object and a refresh token. The controller uses `attachCookiesToResponse` to set `accessToken` and `refreshToken` as HTTP-only cookies.
4. Protected routes: middleware `authenticateUser` reads the `accessToken` cookie and verifies the JWT using `verifyToken` from `utils/jwt.ts`. `authorizeRoles` checks user role where required.
5. Logout: `DELETE /api/v1/auth/logout` — deletes token records for the user and clears cookies.
6. Password reset: `POST /api/v1/auth/forgot-password` and `POST /api/v1/auth/reset-password` — generate and validate reset tokens; new passwords are saved after validation.

Notes: refresh tokens are created and persisted in the `Token` model on login. There is not an explicit refresh-token route implemented in `auth.route.ts`.

## API Endpoints (extracted from routes)

Base path: `/api/v1`

Auth (`/api/v1/auth`)

- `POST /register` — register new user
- `POST /login` — login user (sets cookies)
- `DELETE /logout` — logout (requires authentication)
- `POST /verify-email` — verify account with token
- `POST /resend-verification-email` — resend verification email
- `POST /forgot-password` — request password reset email
- `POST /reset-password` — reset password using token

Users (`/api/v1/users`)

- `GET /` — list all users (requires `ADMIN` role)
- `GET /metrics` — user metrics (requires `ADMIN` role)
- `GET /current-user` — current authenticated user
- `GET /:id` — get user by id (requires `ADMIN` role)
- `DELETE /:id` — delete user (requires `ADMIN` role)

Requests (`/api/v1/requests`)

- `POST /` — create a new request
- `POST /claim/:id` — claim a request (requires authentication)
- `GET /metrics` — request metrics (requires `ADMIN` role)
- `GET /` — list all requests (requires `ADMIN` role)
- `GET /my` — list authenticated user's requests
- `GET /:id` — get a request by id
- `GET /track/:trackingId` — retrieve a request by tracking id
- `PUT /:id` — update a request
- `DELETE /:id` — delete a request

## Setup Instructions

1. Clone the repository and install dependencies for backend and frontend:

```bash
git clone <repo-url>
cd flyeasy

# backend
cd backend
npm install

# frontend (separate terminal)
cd ../frontend
npm install
```

2. Environment variables

Create a `.env` file at the repository root or in `backend` (the backend loads environment variables via `dotenv` in `server.ts`). The code references the following environment variables:

- `PORT` — optional; server port (defaults to `3000`)
- `MONGO_URL` — MongoDB connection string (used in `config/database.ts`)
- `JWT_SECRET` — JWT signing secret (required by `config/jwt.ts`)
- `EMAIL_USER` — SMTP account user (used by nodemailer config)
- `EMAIL_PASS` — SMTP account password
- `MAPQUEST_API_KEY` — used by geocoder utilities (if used)
- `NODE_ENV` — affects cookie `secure`/`sameSite` behavior

3. Run

Backend (development):

```bash
cd backend
npm run dev
```

Frontend (development):

```bash
cd frontend
npm run dev
```

The backend exposes the API under `http://localhost:<PORT>/api/v1` by default.

## Notes

- The authentication system relies on HTTP-only cookies named `accessToken` and `refreshToken` (set by `attachCookiesToResponse`). The `authenticateUser` middleware expects the `accessToken` cookie.
- The code uses `MONGO_URL` as the connection variable; error messages in the database config may reference `MONGO_URI` inconsistently.
- Only the routes present in `backend/src/*/*.route.ts` are listed above; no other resource endpoints were found in the backend source.

## Author

Anthony — Software Engineering Student | Backend Developer
