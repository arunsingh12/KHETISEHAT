# Kheti Sehat

A Next.js rebuild of the Kheti Sehat marketplace — verified agri and health
service providers for rural Uttar Pradesh — including the payment
module described in `docs/payment-module.md`.

## Stack

- **Next.js 16** (App Router, Server Actions, Turbopack)
- **TypeScript**, **Tailwind CSS v4**
- **Prisma 6** + **MongoDB** (Atlas) — Prisma 7 has no MongoDB support yet, so this stays on 6.x
- **Auth.js (next-auth v5)** — credentials login (phone/email + password), JWT sessions, four roles: `FARMER` (requester), `PROVIDER`, `COORDINATOR`, `ADMIN`
- **Razorpay** — collects farmers' payments into the Kheti Sehat (admin) account; the admin pays providers manually (see below)
- **Anthropic API** — the coordinator's "AI WhatsApp to Booking" intake tool, with a heuristic fallback when no key is set

## Getting started

You need a MongoDB database — a free [MongoDB Atlas](https://www.mongodb.com/atlas)
cluster works. Prisma needs a replica set (Atlas always is one) and a database
name in the URL, e.g. `mongodb+srv://user:pass@cluster.mongodb.net/khetisehat?appName=...`.

```bash
npm install
cp .env.example .env        # then fill in DATABASE_URL and AUTH_SECRET
npm run db:push             # creates collections + indexes in MongoDB
npm run db:seed             # demo providers, hospitals, and sample bookings
npm run dev
```

Open http://localhost:3000.

Generate an `AUTH_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Demo accounts (from `prisma/seed.ts`)

All seeded accounts use the password `password123`.

| Role | Phone | Notes |
|---|---|---|
| Admin | `9900000000` | Anita Admin — platform-wide dashboard |
| Farmer (requester) | `9900000002` | Ramesh Yadav — has bookings in every stage of the payment lifecycle |
| Coordinator | `9900000001` | Sunita Coordinator — full dashboard access |
| Provider | `9871234567` | Priya Sharma, Drone Services (Agri) |
| Provider | `9812341234` | Kavita Gupta, Doctor (Health) |

The seed script creates ~19 providers total across every Agri/Health category
(mirroring the original prototype's directory), 12 hospitals, and a handful
of bookings spanning Pending → Awaiting Payment → Paid to Kheti Sehat → Awaiting
Confirmation → Settled → Cancelled, so every dashboard has something to look
at immediately.

## Roles & dashboards

| Role | Lands at | What they can do |
|---|---|---|
| **Farmer** (requester) | `/farmer` | Dashboard of bookings, payments and updates; browse Agri/Health directories and Hospitals, request a service, pay, confirm work done or dispute it, rate the provider |
| **Provider** | `/provider` | See their own request queue, set a price, update status, view **My Payouts**, edit their profile + payout details (UPI / bank account) |
| **Coordinator** | `/coordinator` | Everything a provider can manage, plus: AI WhatsApp intake, provider verification, cancellations/disputes, the payout ledger, and provider listings |
| **Admin** | `/admin` | Platform-wide visibility: manage every user's role and active/disabled status, verify providers and set their commission rate, **pay providers and record payouts** (`/admin/payouts`), full CRUD on the hospital directory, every booking on the platform, and read-only integration status (Razorpay/Anthropic configured or simulated) |

A disabled user (`User.active = false`, toggled from `/admin/users`) is rejected at login with the same generic error as a wrong password — it doesn't reveal that the account exists.

Public sign-up at `/register` only offers Farmer, Provider, and Coordinator
(`PUBLIC_REGISTRATION_ROLES` in `src/lib/constants.ts`) — Admin is provisioned
directly (seeded, or promoted by an existing admin from `/admin/users`), not
self-registered. This is enforced on the server in `registerSchema`
(`src/lib/validation.ts`) as well as hidden from the dropdown, so a raw POST
can't request the Admin role either.

## Payments — Kheti Sehat's Razorpay account as the middleman

The farmer pays into the Kheti Sehat (admin) Razorpay account. Once the
farmer confirms the work, the admin sends the provider their share
(amount minus the platform fee) **manually** by bank transfer or UPI, then
records it on **Admin → Payouts** with **Mark as Paid** and the UTR /
reference number. See `docs/payment-module.md` for the full lifecycle.

`RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` are optional for local
development — leave them blank and the Pay button and refunds return a
**simulated** result, so the whole flow runs without a Razorpay account.

To take real payments:

1. Put the Kheti Sehat Razorpay keys in `RAZORPAY_KEY_ID` /
   `RAZORPAY_KEY_SECRET` (test mode first).
2. Add a webhook in Razorpay (Settings → Webhooks) pointing at
   `/api/payments/razorpay/webhook`, subscribed to `payment.captured`, and
   put its secret in `RAZORPAY_WEBHOOK_SECRET`.
3. Ask providers to fill in their UPI ID or bank account + IFSC under
   Account Settings — the Payouts page shows these to the admin.

If the farmer neither confirms nor disputes within 72 hours of the provider
marking the job complete, it is auto-confirmed — the admin still pays the
provider as usual. The sweep runs two ways:

- `GET /api/cron/auto-release` with `Authorization: Bearer $CRON_SECRET` — point a scheduler (Vercel Cron, GitHub Actions, cron-job.org) at this in production.
- The **Run Auto-Confirm Now** button on `/coordinator/payouts`, for testing without waiting.

## Project structure

```
prisma/schema.prisma      Data model — see the enums for the booking/payment state machine
prisma/seed.ts            Demo data
src/app/                  Routes (App Router). Public pages, auth pages, and
                           role-gated /provider, /coordinator and /admin
                           dashboards (each with its own layout.tsx guard).
src/actions/               Server actions — one file per domain area
src/lib/escrow.ts          The booking payment state machine (pay → confirm → admin payout / refund / dispute)
src/lib/payments/razorpay.ts  Razorpay Orders + refunds (with the simulated fallback)
src/lib/ai/extractBooking.ts  AI WhatsApp-to-Booking extractor (Anthropic + heuristic fallback)
src/lib/queries.ts          All Prisma read queries, one place per dashboard/page
src/components/            UI, grouped by area (booking/, coordinator/, dashboard/, site/, ui/)
```

## Deploying to Netlify

This is a fully server-rendered app (Server Actions, API routes, a database) —
not a static site, so there's no static "build folder" to drag-and-drop onto
Netlify's upload UI. It deploys as serverless functions via the official
Next.js runtime, already configured in `netlify.toml`.

1. **Push this repo to GitHub/GitLab/Bitbucket**, then in the Netlify
   dashboard: **Add a new site → Import an existing project**, pick the repo.
   Netlify detects `netlify.toml` and `@netlify/plugin-nextjs` automatically —
   no build settings to fill in.
2. **Set the environment variables** under Site configuration → Environment
   variables — everything in `.env.example`, at minimum `DATABASE_URL` and
   `AUTH_SECRET`. Set `APP_URL` to the Netlify URL Netlify gives you (or your
   custom domain) once the first deploy finishes.
3. **Provision the database once** against the same `DATABASE_URL` you set
   above, from your machine: `npm run db:push && npm run db:seed`.
4. **Trigger a deploy** (push to the branch Netlify is watching, or "Trigger
   deploy" in the dashboard).
5. (Optional) point a scheduler at `/api/cron/auto-release` with
   `Authorization: Bearer <CRON_SECRET>` — e.g. a
   [Netlify Scheduled Function](https://docs.netlify.com/functions/scheduled-functions/)
   or any external cron service — for the 72-hour auto-confirm to run
   without a coordinator clicking "Run Auto-Confirm Now".

Prefer the CLI over connecting a git repo? `npx netlify-cli deploy --build`
from this folder builds and uploads the same thing — it still needs you to
log in with `netlify login` first and set the environment variables in the
Netlify dashboard (or via `netlify env:set`), since the CLI won't read your
local `.env` file for you.

## What's simplified vs. a production build

- **Email** isn't wired up. Password-reset links are logged to the server console and shown directly on the "forgot password" page instead of emailed — see the comment in `src/actions/auth.ts`.
- **Provider onboarding KYC** (bank/UPI + PAN) is captured in Account Settings but isn't verified against any real KYC provider.
- **Inbound WhatsApp** isn't connected — the coordinator pastes messages by hand into the AI intake tool, same as the original prototype.
- Coordinator "Manage Booking" status changes are blocked once a booking has moved past payment until the farmer has actually paid (`escrowStatus = HELD`) — money-moving transitions (confirm, cancel, dispute resolution) only happen through the dedicated payment functions in `src/lib/escrow.ts`, never the generic status dropdown.

## Known dev-dependency advisory

`npm audit` flags `mysql2`/`deepmerge-ts` pulled in transitively by the Prisma
CLI (a dev-only dependency, not shipped to users). Fixing it would downgrade
`prisma` to a version that doesn't support the driver-adapter architecture
this project uses — leave it unless a newer `prisma` release resolves it
upstream.
