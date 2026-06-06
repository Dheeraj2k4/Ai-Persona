# Blog Platform

**Repository:** https://github.com/Dheeraj2k4/Blog_Platform
**Primary Languages:** TypeScript (93%), PLpgSQL
**Year:** 2025

## Purpose
Full-stack blogging platform with complete CRUD operations, markdown live preview editor, authentication (email + OAuth), and SEO optimization. Demonstrates modern full-stack TypeScript architecture.

## Tech Stack
- **Framework:** Next.js 15 (App Router)
- **UI:** React 18 + Tailwind CSS + shadcn/ui
- **API:** tRPC v11 (end-to-end type safety)
- **ORM:** Drizzle ORM (PostgreSQL)
- **Auth:** Supabase Auth (email + Google/GitHub OAuth)
- **State:** Zustand + TanStack Query
- **Validation:** Zod
- **Database:** PostgreSQL (via Supabase)
- **Storage:** Supabase Storage (image uploads)

## Architecture
- End-to-end type-safe with tRPC — no manual API types needed
- Server/client separation via Next.js App Router (React Server Components)
- Database schema: posts, users, categories with many-to-many junction tables
- Drizzle ORM for type-safe migrations and queries
- Zustand for client-side state, TanStack Query for server state caching

## Design Tradeoffs
- **tRPC over REST:** Full type safety from DB to frontend. Tradeoff: less standard, harder for non-TS clients.
- **Drizzle over Prisma:** Lighter weight, closer to SQL, better performance. Tradeoff: less mature ecosystem.
- **Zustand over Redux:** Minimal boilerplate, simpler mental model. Tradeoff: less tooling (no Redux DevTools equivalent).
- **Supabase over custom auth:** Faster to implement, handles OAuth complexity. Tradeoff: vendor lock-in.
- **shadcn/ui over custom components:** Consistent design system, accessible. Tradeoff: less unique styling.

## What I'd Do Differently
- Add full-text search with PostgreSQL tsvector
- Implement comments and reactions
- Add analytics dashboard for authors
- Server-side rendering for better SEO on individual posts
- Implement rate limiting and abuse protection
