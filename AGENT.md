<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# CRM Portal Frontend (`crm-frontend`) - Agent Guide & Progress Report

## Project Overview
The **CRM Portal Frontend** is a Next.js 15 application designed for household support operations, agent call management, ticket tracking, and automated rule monitoring.

### Tech Stack
- **Framework**: Next.js 15.5 (App Router)
- **UI & Styling**: React 18, Tailwind CSS v4
- **Language**: TypeScript 5
- **HTTP Client**: Axios (with cookies enabled for session handling)

---

## Directory & Architecture Overview

All application source code resides under `src/`:

```
src/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx            # Login page for CRM users
│   ├── (dashboard)/
│   │   ├── call-list/page.tsx        # Daily Call List dashboard & management
│   │   └── layout.tsx                # Dashboard wrapper layout (Sidebar & Auth Guard)
│   ├── globals.css                   # Global Tailwind CSS styles
│   ├── layout.tsx                    # Root App Layout
│   └── page.tsx                      # Root route (Redirects to /login)
├── components/
│   └── call-list/
│       └── HouseholdCard.tsx         # Interactive household call card & post-call logging form
├── hooks/
│   └── useAuth.ts                    # Hook for user auth state management
├── lib/
│   ├── api.ts                        # Configured Axios instance with 401 interceptor
│   └── auth.ts                       # Auth API service methods (login, logout, getMe)
└── types/
    └── index.ts                      # Shared TypeScript data models & enums
```

---

## What Has Been Completed So Far

1. **Routing & Directory Resolution**:
   - Fixed a route collision where a leftover root `./app` boilerplate directory was taking precedence over `./src/app`.
   - Cleaned up the project structure so Next.js correctly serves all pages from `./src/app`.

2. **TypeScript Path Aliasing**:
   - Configured `tsconfig.json` with `@/*` pointing to `./src/*` for clean imports.

3. **Authentication Flow**:
   - Implemented `login` page in `src/app/(auth)/login/page.tsx`.
   - Created `useAuth` hook and authenticated dashboard layout wrapper (`src/app/(dashboard)/layout.tsx`) that verifies logged-in user via `/auth/me` and handles logout.

4. **Call List Dashboard & Household Logging**:
   - Built the main call list UI (`src/app/(dashboard)/call-list/page.tsx`) with real-time stats counter (Assigned, Pending, Attempted, Resolved), filtering, and list generation.
   - Developed `HouseholdCard.tsx` component supporting:
     - Priority-based border highlighting (`HIGH`, `MEDIUM`, `LOW`).
     - Status badges (`PENDING`, `LOCKED`, `ATTEMPTED`, `RESOLVED`, `ESCALATED`).
     - Call locking (`PATCH /crm/call-list/:id/lock`).
     - Post-call outcome logging (outcome selection, issue tags, and notes submission).

5. **Build Optimization & Lint Cleanliness**:
   - Removed external Google Fonts network dependencies in `src/app/layout.tsx` for offline/sandbox build compatibility.
   - Refactored `useEffect` state synchronization hooks to satisfy React Compiler / ESLint rules (`set-state-in-effect`).
   - Verified clean static page generation with `npm run build`.

---

## API Contracts & Endpoint Mappings

| Method | Endpoint | Description | Used In |
|---|---|---|---|
| `POST` | `/auth/login` | Log in user with email & password | `src/lib/auth.ts` |
| `POST` | `/auth/logout` | Log out current user session | `src/lib/auth.ts` |
| `GET` | `/auth/me` | Fetch active user session profile | `src/lib/auth.ts` |
| `GET` | `/crm/call-list/today` | Fetch today's assigned call list entries | `src/app/(dashboard)/call-list/page.tsx` |
| `POST` | `/crm/call-list/generate` | Generate today's call list | `src/app/(dashboard)/call-list/page.tsx` |
| `PATCH` | `/crm/call-list/:id/lock` | Lock household before starting a call | `src/components/call-list/HouseholdCard.tsx` |
| `PATCH` | `/crm/call-list/:id/status` | Submit call outcome, issue tags, and notes | `src/components/call-list/HouseholdCard.tsx` |

---

## Development Guidelines for Future Tasks

1. **App Routes**:
   - Place all new routes inside `src/app/(dashboard)/<feature-name>/page.tsx`.
2. **Components**:
   - Place modular UI components under `src/components/<feature-name>/`.
3. **API Requests**:
   - Always import the preconfigured `api` instance from `@/lib/api` to maintain automatic cookie forwarding and 401 handling.
4. **Verification**:
   - Always verify build integrity with `npm run build` after completing UI changes or feature additions.

