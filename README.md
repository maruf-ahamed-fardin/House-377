# MessMate

MessMate is a full-stack mess and hostel management system built with Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Prisma, SQLite for local persistence, and Auth.js credentials authentication.

It supports:

- Admin and member login
- Member management with profile, room, guardian, and status fields
- Daily meal tracking with auto meal-rate calculation
- Bazar, rent, other expense, and deposit management
- Monthly final report export as CSV
- Notice board, important shared info, audit history, and internal group chat
- Responsive admin/member dashboards with charts and monthly summaries

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui-style components
- Prisma ORM
- SQLite through Prisma for zero-setup local data
- Auth.js / NextAuth credentials provider
- React Hook Form + Zod
- Recharts
- Sonner toasts

## Setup

1. Install dependencies

```bash
npm install
```

2. Copy the env file for local development

```bash
copy .env.example .env
```

3. Generate the Prisma client, create the local database, and seed demo data

```bash
npm run db:setup
```

This creates `prisma/dev.db`, which stores your members, meals, payments, expenses, notices, chat, and monthly report data locally.

You can also run the database commands separately:

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

4. Start the app

```bash
npm run dev
```

Open `http://localhost:3000`.

## Demo Credentials

- Admin: `admin@messmate.app` / `admin12345`
- Member: `rahim@messmate.app` / `member12345`

## Environment Variables

```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="messmate-local-dev-secret-change-before-production"
AUTH_URL="http://localhost:3000"

NEXT_PUBLIC_FIREBASE_API_KEY="your-firebase-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.firebasestorage.app"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-messaging-sender-id"
NEXT_PUBLIC_FIREBASE_APP_ID="your-firebase-app-id"
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="G-XXXXXXXXXX"
```

## Scripts

- `npm run dev` starts the local development server
- `npm run build` builds the production app
- `npm run lint` runs ESLint
- `npm run typecheck` runs TypeScript checks
- `npm run db:generate` regenerates Prisma client
- `npm run db:push` pushes the Prisma schema to the database
- `npm run db:migrate` creates a Prisma migration in development
- `npm run db:setup` creates and seeds the local database in one command
- `npm run db:seed` inserts demo data
- `npm run db:studio` opens Prisma Studio

## Main Routes

- `/login`
- `/dashboard`
- `/admin`
- `/admin/members`
- `/admin/meals`
- `/admin/bazar`
- `/admin/rent`
- `/admin/expenses`
- `/admin/deposits`
- `/admin/notices`
- `/admin/important-info`
- `/admin/monthly-report`
- `/chat`
- `/profile`
- `/history`

## Project Notes

- Protected routes are handled through Next.js `proxy.ts` with Auth.js session checks.
- Monthly calculations are centered around `monthKey` values in `YYYY-MM` format.
- Admin pages use query-string driven edit mode like `?edit=<id>` so CRUD stays inside the route structure requested for the app.
- Deactivating a member keeps historical records available for monthly reports and audit history.
- The CSV export endpoint lives at `/api/reports/monthly?month=YYYY-MM`.

## Database Models

The Prisma schema includes:

- `User`
- `MemberProfile`
- `MealRecord`
- `BazarExpense`
- `RentPayment`
- `OtherExpense`
- `Deposit`
- `Notice`
- `ImportantInfo`
- `ChatMessage`
- `MonthlySummary`
- `AuditLog`

## Recommended Next Steps

- Add PDF export if you want printable month-end statements in addition to CSV
- Add image domain allowlists in `next.config.ts` if you later enable trusted remote avatar/receipt sources
- Add Prisma migrations and a production database provider before deploying beyond local use
