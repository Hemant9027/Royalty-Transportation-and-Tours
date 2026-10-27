# Royalty Transportation & Tours — Demo Website & Booking System

A concept redesign of [royaltytransportationandtours.com](https://www.royaltytransportationandtours.com/)
with a demo reservation workflow and protected admin console.

> **Demo only:** This project does not use a database. Booking requests, pricing changes, and
> service edits are held in server memory and may disappear whenever a server process restarts.
> Serverless deployments can run multiple isolated instances, so demo state is not guaranteed to
> be shared across requests. Do not use this demo to collect real booking or customer information.
> It does not create live reservations or take payments.

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS 4, Fraunces + Manrope |
| Validation | Zod (shared client + server schemas) |
| Demo storage | In-memory only; no persistence or database configuration |
| Admin auth | Environment-configured credentials and signed, expiring sessions |

Homepage photos in `public/images/` are illustrative stock imagery served locally. Replace them
with owner-approved fleet and destination photos before production use.

## Quick start

```bash
npm install
cp .env.example .env  # optional; configure credentials only if using the demo admin
npm run dev
```

Production build:

```bash
npm run build
npm start
```

No database, schema setup, or `DATABASE_URL` is required.

## Demo admin

To enable `/admin`, set `DEMO_ADMIN_EMAIL` and `DEMO_ADMIN_PASSWORD` in the deployment environment.
These credentials are not committed. Admin sessions are signed using the configured password and
expire after `DEMO_SESSION_TTL_HOURS` (12 hours by default).

## Main features

- Five-step, validated booking-request flow with demo quote estimates.
- Email-gated request lookup while the request exists in the current server process.
- Admin dashboard, booking status updates, service catalog, and demo pricing rules.
- Optional Resend notifications when explicitly configured.
- The health endpoint reports `storage: "ephemeral"` to make the non-persistent setup clear.

## Project layout

```text
src/
├── app/
│   ├── page.tsx                 # Homepage
│   ├── book/                    # Booking wizard
│   ├── request/                 # Request status lookup
│   ├── admin/                   # Protected admin console
│   └── api/                     # Booking, quote, admin, and health routes
└── lib/
    ├── demo-store.ts            # Ephemeral in-memory demo data
    ├── models.ts                # Demo model types
    ├── bookings.ts              # Request validation and in-memory operations
    ├── admin-data.ts            # In-memory dashboard and booking queries
    ├── auth.ts                  # Demo credentials and signed sessions
    ├── pricing.ts               # Demo pricing engine
    └── booking-schema.ts        # Shared booking validation
```

## Before production

The in-memory store is deliberately temporary and is not suitable for real customer requests or
reliable Vercel bookings. Add a persistent, shared database before collecting real customer details,
and verify all fares, fleet information, imagery, policies, and business claims with the operator.
See [docs/OWNER-VERIFICATION.md](docs/OWNER-VERIFICATION.md).
