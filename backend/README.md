# Gaiamundi Backend API

![Node.js](https://img.shields.io/badge/Node.js->=23.9.0-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Express](https://img.shields.io/badge/Express-4.18-yellowgreen)
![Prisma](https://img.shields.io/badge/Prisma-5.7-blue)

This is the **backend API for the Gaiamundi Artist Portfolio platform**, providing a full-featured REST API for users, artists, artworks, purchases, payments, subscriptions, and interactions. Built with **Node.js, Express, TypeScript, and Prisma**.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Scripts](#scripts)
- [API Security & Roles](#api-security--roles)
- [Testing](#testing)
- [Logging & Error Handling](#logging--error-handling)
- [License](#license)

---

## Features

- User authentication (JWT + OAuth2: Google, Facebook)
- Role-based access control (GUEST, COLLECTOR, ARTIST, ADMIN)
- Full CRUD for Users, Artists, Artworks
- Cart, Wishlist, Purchases with digital download support
- Payment integration with **Stripe** and **PayPal**
- Newsletter subscription & hidden interaction tracking
- Image uploads via **Cloudinary**
- Email verification and password reset functionality
- Rate limiting, security headers, and request logging

---

## Tech Stack

- **Backend:** Node.js + Express.js + TypeScript
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** JWT, Passport.js (Google & Facebook OAuth)
- **Payments:** Stripe, PayPal
- **File Storage:** Cloudinary
- **Security:** Helmet, express-rate-limit, cors
- **Logging:** Morgan, Winston
- **Validation:** Zod
- **Testing:** Vitest

---

## Getting Started

1. **Clone the repository**

```bash
git clone https://github.com/MJSCHERER/gaiamundi.git
cd gaiamundi-backend
```

2. **Install dependencies - from root**

```bash
pnpm install
```

3. **Set up environment variables**

Copy `.env.example` to `.env` and fill in your secrets:

```bash
cp .env.example .env
```

4. **Setup the database**

```bash
pnpm db:generate   # Generate Prisma client
pnpm db:migrate    # Run migrations
pnpm db:seed       # Optional: seed database
```

5. **Run the server**

```bash
pnpm dev           # Development mode with TSX watch
pnpm build         # Build production code
pnpm start         # Start production server
```

Server runs by default on `http://localhost:5000`.

---

## Environment Variables

Key variables include:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:4173

DATABASE_URL=postgresql://username:password@localhost:5432/gaiamundi?schema=public

JWT_SECRET=
JWT_REFRESH_SECRET=
JWT_EXPIRES_IN=
JWT_REFRESH_EXPIRES_IN=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=noreply@gaiamundi.com

STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

SESSION_SECRET=
```

---

## Database Setup

- **Prisma models** include:
  - Users, Roles, Accounts
  - Artist Profiles, Artworks, Exhibitions, Publications
  - Purchases, Purchase Items, Cart Items, Wishlist
  - Reviews, Addresses
  - Newsletter Subscribers, Hidden Interactions
  - Tokens: Email Verification & Password Reset

- **Enums:**
  - `UserRole` → `GUEST | COLLECTOR | ARTIST | ADMIN`
  - `AccountStatus` → `PENDING | ACTIVE | SUSPENDED | DELETED`
  - `ArtworkCategory` → `NATURE | PORTRAIT | ILLUSTRATION | FANTASY`
  - `PurchaseStatus` → `PENDING | COMPLETED | FAILED | REFUNDED | CANCELLED`

---

## Scripts

| Script        | Description                          |
| ------------- | ------------------------------------ |
| `dev`         | Start development server (tsx watch) |
| `build`       | Compile TypeScript to JS             |
| `start`       | Run compiled production server       |
| `test`        | Run Vitest tests                     |
| `test:ui`     | Start Vitest UI                      |
| `lint`        | Run ESLint                           |
| `lint:fix`    | Run ESLint with auto-fix             |
| `format`      | Format code with Prettier            |
| `db:migrate`  | Apply database migrations            |
| `db:generate` | Generate Prisma client               |
| `db:seed`     | Seed database                        |

---

## API Security & Roles

- **Authentication** required for sensitive endpoints (JWT or OAuth2)
- **Role-based access** for admin/artist functionality
- **Rate limiting** applied globally and stricter on auth endpoints
- **Controller-level checks** ensure data ownership

**Example Endpoint Security:**

| Module    | Endpoint               | Auth | Role                          |
| --------- | ---------------------- | ---- | ----------------------------- |
| Users     | GET /users             | ✅   | Admin only                    |
| Users     | PATCH /users/:id       | ✅   | Owner/Admin                   |
| Artworks  | POST /artworks         | ✅   | ARTIST / ADMIN                |
| Purchases | GET /purchases         | ✅   | Owner only                    |
| Payments  | POST /payments/webhook | ❌   | Stripe signature verification |

A full [HTML Security Map](docs/API_SECURITY_MAP.html) is available in the repo.

---

## Testing

- **Unit & Integration:** Vitest + Supertest
- **E2E (planned):** Playwright / Cypress
- Run tests with:

```bash
pnpm run test
pnpm run test:ui
```

---

## Logging & Error Handling

- **Request logging:** Morgan + custom requestLogger middleware
- **Error handling:** Centralized `errorHandler` middleware
- **Winston** for structured logging in production

---

## License

© Gaiamundi
