# Tetris Deploy — Agent Instructions

## Tech Stack (Default for All Web Development)

All web-related work in this project MUST use the following stack unless the user explicitly requests otherwise:

| Layer | Choice |
|-------|--------|
| Framework | **Next.js** (App Router, TypeScript) |
| Database | **SQLite** (local file-based) |
| ORM | **Prisma** |

### Next.js Conventions

- Use the **App Router** (`app/` directory), not the Pages Router.
- Prefer **Server Components** by default; add `"use client"` only when interactivity is required.
- Use **Server Actions** or **Route Handlers** (`app/api/`) for mutations and API endpoints.
- Keep environment variables in `.env` (never commit secrets). Use `DATABASE_URL` for Prisma.

### Prisma + SQLite Conventions

- Schema lives in `prisma/schema.prisma`.
- Local database file: `prisma/dev.db` (add to `.gitignore`).
- After schema changes: `npx prisma migrate dev` (or `db push` for prototyping).
- Import the client from `@/lib/prisma` (singleton with `@prisma/adapter-better-sqlite3`). Prisma Client is generated at `generated/prisma/client`.
- Prisma 7 requires a driver adapter — do not instantiate `PrismaClient` without one.
- Use Prisma Client for all database access — no raw SQL unless performance-critical.

### Project Commands

```bash
npm run dev          # Start Next.js dev server
npx prisma studio    # Open database GUI
npx prisma migrate dev  # Apply migrations
npm run build        # Production build
```

## Design System

Before generating or modifying any UI (components, pages, styles), read **`DESIGN.md`** at the project root.

- Use ONLY colors, typography, spacing, and component patterns defined in `DESIGN.md`.
- Never introduce visual values not present in the design system.
- Follow the Do's and Don'ts section strictly.

## File Structure

```
app/              # Next.js App Router pages and layouts
components/       # Reusable UI components
lib/              # Utilities (prisma client, helpers)
prisma/           # Schema, migrations, dev.db
public/           # Static assets
DESIGN.md         # Design system (visual source of truth)
```
