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
- **UI & Styling**: React 18, Tailwind CSS v4 (using `@import "tailwindcss";`)
- **Language**: TypeScript 5
- **HTTP Client**: Axios (with cookies enabled for session handling)

---

## Directory & Architecture Overview

All application source code resides under `src/`:

```
src/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx            # Atlassian-styled login page for CRM users
│   ├── (dashboard)/
│   │   ├── call-list/page.tsx        # Daily Call List dashboard & management
│   │   ├── rules/page.tsx            # Dynamic Telemetry Rules Management & Rule Builder
│   │   └── layout.tsx                # Dashboard wrapper layout (Atlassian Sidebar & Auth Guard)
│   ├── globals.css                   # Global Tailwind CSS v4 stylesheet (@import "tailwindcss";)
│   ├── layout.tsx                    # Root App Layout
│   └── page.tsx                      # Landing Page (Atlassian Design System Overhaul)
├── components/
│   ├── call-list/
│   │   └── HouseholdCard.tsx         # Interactive household call card & post-call logging form
│   └── ui/
│       └── ChangedPasswordDialog.tsx # First-login password change modal
├── hooks/
│   └── useAuth.ts                    # Hook for user auth state management
├── lib/
│   ├── api.ts                        # Configured Axios instance with 401 interceptor
│   └── auth.ts                       # Auth API service methods (login, logout, getMe)
└── types/
    ├── global.d.ts                   # CSS ambient module declarations for TypeScript
    └── index.ts                      # Shared TypeScript data models & rule schemas
```

---

## What Has Been Completed So Far

1. **Atlassian Design System Overhaul**:
   - **Landing Page (`src/app/page.tsx`)**: Hero headline, stat counters, interactive workstation preview (Call List, Rules Engine, Field Tickets), telemetry pipeline diagram, feature cards, and Atlassian footer.
   - **Login Page (`src/app/(auth)/login/page.tsx`)**: Atlassian card layout, focus rings, security badge, and supported role badges.
   - **Dashboard Layout (`src/app/(dashboard)/layout.tsx`)**: Atlassian sidebar navigation, user initials avatar, role badge, and active route pills (`#DEEBFF`).
   - **Tailwind v4 Fix**: Configured `src/app/globals.css` with `@import "tailwindcss";` for Tailwind v4 compilation.

2. **CRM Rules Management & Dynamic Rule Builder**:
   - **Data Table & Controls (`src/app/(dashboard)/rules/page.tsx`)**: Search bar, priority filter (`HIGH`, `MEDIUM`, `LOW`), event type badges, lookback days, optimistic status toggle switch (`PATCH /crm/rules/:id/toggle`), and action buttons.
   - **Step-by-Step Dynamic Rule Builder Modal (`CreateEditRuleModal`)**:
     - *Step 1: Basic Information*: Name, description, priority select, lookback window (1-30 days).
     - *Step 2: Event Type Selection*: Populated dynamically from `GET /crm/rules/schema` (with fallback schema).
     - *Step 3: Dynamic Condition Builder*: Parameter/field selection, operator selection (`no_event`, `all_inactive`, `equals`, `less_than`, `greater_than`, `contains`), adaptive value input (boolean select, number, text), and `min_days` threshold input.
   - **Live Rule Preview Impact Modal (`PreviewRuleModal`)**:
     - Evaluates rule via `GET /crm/rules/:id/preview`.
     - Displays Total Evaluated, Matched Devices, and Impact Ratio ($\frac{\text{Matching}}{\text{Total}} \times 100\%$).
     - Paginated matched devices table.
   - **Toast System**: Feedback for Create, Edit, Toggle Status, and Delete actions.

3. **Authentication & Password Guard**:
   - Password change enforcement for first-time login users (`mustChangePassword`).

---

## API Contracts & Endpoint Mappings

| Method | Endpoint | Description | Used In |
|---|---|---|---|
| `POST` | `/auth/login` | Log in user with email & password | `src/lib/auth.ts` |
| `POST` | `/auth/logout` | Log out current user session | `src/lib/auth.ts` |
| `GET` | `/auth/me` | Fetch active user session profile | `src/lib/auth.ts` |
| `GET` | `/crm/rules/schema` | Fetch dynamic rule schema & event type fields | `src/app/(dashboard)/rules/page.tsx` |
| `GET` | `/crm/rules` | Fetch existing telemetry rules | `src/app/(dashboard)/rules/page.tsx` |
| `POST` | `/crm/rules` | Create a new telemetry rule | `src/app/(dashboard)/rules/page.tsx` |
| `PUT` | `/crm/rules/:id` | Update an existing telemetry rule | `src/app/(dashboard)/rules/page.tsx` |
| `PATCH` | `/crm/rules/:id/toggle` | Toggle rule active status | `src/app/(dashboard)/rules/page.tsx` |
| `DELETE` | `/crm/rules/:id` | Delete a telemetry rule | `src/app/(dashboard)/rules/page.tsx` |
| `GET` | `/crm/rules/:id/preview` | Preview live rule impact against telemetry events | `src/app/(dashboard)/rules/page.tsx` |
| `GET` | `/crm/call-list/today` | Fetch today's assigned call list entries | `src/app/(dashboard)/call-list/page.tsx` |
| `POST` | `/crm/call-list/generate` | Generate today's call list | `src/app/(dashboard)/call-list/page.tsx` |
| `PATCH` | `/crm/call-list/:id/lock` | Lock household before starting a call | `src/components/call-list/HouseholdCard.tsx` |
| `PATCH` | `/crm/call-list/:id/status` | Submit call outcome, issue tags, and notes | `src/components/call-list/HouseholdCard.tsx` |

---

## Development Guidelines for Future Tasks

1. **App Routes**: Place new routes inside `src/app/(dashboard)/<feature-name>/page.tsx`.
2. **API Calls**: Always import `api` from `@/lib/api` to inherit cookie headers & 401 handling.
3. **Tailwind v4**: Ensure `src/app/globals.css` keeps `@import "tailwindcss";`.
4. **Verification**: Run `npm run build` after changes.

