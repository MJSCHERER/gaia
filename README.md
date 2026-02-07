# Gaiamundi Frontend

![React](https://img.shields.io/badge/React-19.2.4-blue)
![Vite](https://img.shields.io/badge/Vite-7.3.1-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.19-purple)

This is the **frontend application for the Gaiamundi Artist Portfolio platform**, built with **React, TypeScript, Vite, and TailwindCSS**. It provides a fast, modular, and fully responsive SPA for users, artists, and collectors.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Folder Structure](#folder-structure)
- [Linting & Formatting](#linting--formatting)
- [Testing](#testing)
- [License](#license)

---

## Features

- SPA with React 19 + TypeScript
- Routing with `react-router-dom`
- State management with `zustand` and `react-query`
- Form handling via `react-hook-form` + `@hookform/resolvers`
- Theme switching with `next-themes`
- Responsive design with TailwindCSS + `tailwind-merge`
- Carousel & 3D visualization with `embla-carousel-react` and `react-three/fiber`
- Modular UI components via `@radix-ui/react`
- Stripe payments integration (`@stripe/react-stripe-js`)
- Dynamic page chunking & optimized build with Vite
- Code inspection and dev tools via `kimi-plugin-inspect-react`
- Production compression with gzip & Brotli, build stats via Rollup visualizer

---

## Tech Stack

- **Frontend Framework:** React 19 + TypeScript
- **Bundler:** Vite
- **Styling:** TailwindCSS + Tailwind Animations
- **State Management:** Zustand + React Query
- **Forms:** React Hook Form + Zod
- **Routing:** React Router DOM
- **3D / Visualizations:** Three.js, @react-three/fiber, @react-three/drei
- **UI Components:** Radix UI
- **Payments:** Stripe
- **Utilities:** clsx, date-fns, vaul
- **Dev Tools:** Kimi Plugin Inspect, Vite Plugin Compression, Rollup Visualizer
- **Linting & Formatting:** ESLint, Prettier

---

## Getting Started

1. **Clone the repository**

```bash
git clone https://github.com/MJSCHERER/gaiamundi.git
cd gaiamundi
```

2. **Install dependencies**

```bash
pnpm install
# or npm install
```

3. **Set up environment variables**

Copy `.env.example` to `.env` and fill in your secrets:

```bash
cp .env.example .env
```

4. **Run development server**

```bash
pnpm dev:all
```

App runs by default on `http://localhost:4173`.

5. **Run build**

```bash
pnpm build:all
```

6. **Preview production build**

```bash
pnpm preview:all
```

---

## Environment Variables

```env
VITE_API_URL=http://localhost:5000/api
```

---

## Scripts

| Script             | Description                                  |
| ------------------ | -------------------------------------------- |
| `dev:frontend`     | Start frontend development server (Vite)     |
| `dev:all`          | Start frontend + backend concurrently        |
| `build:frontend`   | Build frontend for production                |
| `build:all`        | Build frontend + backend concurrently        |
| `preview:frontend` | Preview frontend production build            |
| `preview:all`      | Preview frontend + backend concurrently      |
| `lint:frontend`    | ESLint frontend code                         |
| `lint:fix`         | Fix ESLint errors                            |
| `format:frontend`  | Prettier format frontend code                |
| `check:all`        | Run lint + format checks                     |
| `fix:all`          | Fix lint + format for frontend + backend     |
| `clean`            | Remove `node_modules`, `dist` and lock files |

---

## Folder Structure

```
src/
├─ assets/           # Images, icons, fonts
├─ components/       # Reusable UI components
├─ hooks/            # Custom React hooks
├─ pages/            # Route pages
├─ routes/           # React Router configuration
├─ store/            # Zustand / React Query stores
├─ styles/           # Tailwind / global styles
├─ utils/            # Utility functions
└─ App.tsx           # Root application
```

---

## Linting & Formatting

- **ESLint configuration** (frontend + backend):

```js
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist', 'backend/dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
]);
```

- **Prettier configuration** (`.prettierrc`):

```json
{
  "semi": true,
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "trailingComma": "all",
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

- React Compiler is **not enabled** by default due to performance. See [React Compiler docs](https://react.dev/learn/react-compiler/installation) to add it.

---

## Testing

- Currently relies on manual testing and dev tools.
- Unit & integration testing planned with Vitest + React Testing Library.

---

## License

© Gaiamundi
