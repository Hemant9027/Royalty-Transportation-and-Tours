# Royalty Transportation & Tours — Premium Demo Website & Booking System

A concept redesign of [royaltytransportationandtours.com](https://www.royaltytransportationandtours.com/)
with a fully functional **demo reservation workflow** and a **protected admin console**.

> ⚠️ **This is a demo environment.** Bookings submitted here are stored as demo requests in a demo
> database. Nothing here triggers a live reservation, payment, email, SMS or WhatsApp message
> unless the business operator explicitly configures production integrations.

---

## Stack

| Layer       | Choice                                              |
| ----------- | --------------------------------------------------- |
| Framework   | Next.js 16 (App Router) + React 19 + TypeScript     |
| Styling     | Tailwind CSS 4, Fraunces + Manrope                  |
| Database    | PostgreSQL via Drizzle ORM (`node-postgres`)        |
| Validation  | Zod (shared client + server schemas)                |
| Auth        | scrypt-hashed demo admin + DB-backed sessions       |

Homepage photos in `public/images/` are illustrative stock imagery served locally. Replace them
with owner-approved fleet and destination photos before production use.

## Quick start

```bash
npm install
cp .env.example .env          # fill in DATABASE_URL + DEMO_ADMIN_* values

npx drizzle-kit push          # create tables
npx tsx scripts/seed.ts       # idempotent demo seed (services, pricing rules, admin, samples)

npm run dev                   # or: npm run build && npm start
```

The platform also seeds automatically: `GET /api/health` and the `/admin` shell both call the
idempotent `ensureSeeded()`, so a fresh deployment self-initialises on first request.

## Demo admin account

Sign in at `/admin/login` using `DEMO_ADMIN_EMAIL` / `DEMO_ADMIN_PASSWORD` from your environment.
The password is only ever stored as a **scrypt hash**; sessions are 256-bit tokens stored
**hashed (SHA-256)** in PostgreSQL with expiry. No credentials live in source control.

## Where things live

```
src/
├── app/
│   ├── page.tsx                     # redesigned homepage
│   ├── book/                        # 5-step booking wizard (client) + page
│   ├── request/                     # customer status tracker (email-gated)
│   ├── admin/
│   │   ├── login/                   # sign-in
│   │   └── (authed)/                # guarded by a server-side layout
│   │       ├── dashboard/           # stats, upcoming journeys, recent requests
│   │       ├── bookings/            # search / filter / sort / pagination
│   │       │   └── [id]/            # detail, status updates, notes, history
│   │       ├── services/            # catalog toggles & copy
│   │       └── settings/            # env status, owner-verification list, pricing rules
│   └── api/
│       ├── bookings/                # POST create booking (public, zod-validated)
│       ├── quote/                   # POST demo pricing preview
│       ├── requests/[ref]/          # GET masked view; ?email= gates full view
│       ├── admin/                   # login/logout/bookings/stats/services/pricing-rules
│       └── health/                  # healthcheck + auto-seed
├── db/schema.ts                     # demo_* tables
└── lib/
    ├── constants.ts                 # verified business facts & catalog
    ├── booking-schema.ts            # zod schemas (shared client/server)
    ├── pricing.ts                   # configurable demo pricing engine
    ├── bookings.ts                  # create/read/update + reference generator
    ├── admin-data.ts                # dashboard stats + filtered queries
    ├── auth.ts                      # scrypt + sessions
    ├── notify.ts                    # honest notification layer (Resend optional)
    └── seed.ts                      # idempotent seeding
```

## Demo pricing engine

Rules live in `demo_pricing_rules` and are editable in `/admin/settings`:

| Type                | Behaviour                                                        |
| ------------------- | ---------------------------------------------------------------- |
| `fixed_route`       | Origin/destination keywords (airport aliases included), one-way  |
| `per_person`        | Unit price × guests (tours match optionally on tour name)        |
| `per_vehicle`       | Flat group/vehicle rate                                          |
| `return_multiplier` | Multiplies the base fare for return journeys (e.g. 1.8×)         |
| `additional_stop`   | Unit fee × selected stops                                        |
| `surcharge`         | Flat surcharge (seeded example is disabled by default)           |

Only rules labelled **published** mirror figures found on the operator's website
($99 SUV start price, $125/person Water Sports package). Everything else is a **demo** sample.
If no rule matches a journey the customer sees **Request a Quote** — never an invented price.
All computed figures are labelled **demo estimates** and no payment is ever collected.

## Honesty guarantees built in

- Pending requests are never described as confirmed rides ("pending operator confirmation").
- If email isn't configured, the UI says so — it never claims a message was sent.
  `notificationStatus` (`not_configured|sent|failed`) is persisted per booking.
- Customer detail pages require the booking email; without it only a masked summary is shown.
- Admin APIs return `401` without a valid server-side session; admin pages redirect to login.
- Seeded bookings are flagged `isSample` and visually labelled **Sample** everywhere.

## End-to-end test checklist (all exercised for this demo)

1. Select a service and complete the 5-step booking flow.
2. Required-field inline validation on each step.
3. Invalid dates/past dates/malformed emails are rejected client **and** server-side.
4. Submission returns a unique reference (`ROY-DEMO-XXXXX`).
5. Refresh `/request/<ref>?email=…` — data persists (PostgreSQL).
6. Request appears in `/admin/dashboard` + `/admin/bookings`.
7. Admin search, status/service/origin/date filters and sortable columns work.
8. Admin opens a booking and updates status (+ timeline note).
9. Status change persists after refresh and appears in the history table.
10. `/request/<ref>` shows the new status to the customer without exposing other records.
11. `GET/PATCH /api/admin/*` without a session → `401`.
12. Responsive layouts audited at mobile/tablet/desktop breakpoints.
13. Unreachable DB → honest 500/503 responses + inline error UI; email not configured → explicit notice.

Quick API smoke test (server running):

```bash
# submit a demo booking
curl -X POST localhost:3000/api/bookings -H 'Content-Type: application/json' -d @tests/sample-booking.json
# admin login → cookie jar
curl -c /tmp/jar -X POST localhost:3000/api/admin/login -H 'Content-Type: application/json' \
  -d '{"email":"$DEMO_ADMIN_EMAIL","password":"$DEMO_ADMIN_PASSWORD"}'
# list / update
curl -b /tmp/jar localhost:3000/api/admin/bookings?status=pending
curl -b /tmp/jar -X PATCH localhost:3000/api/admin/bookings/<id> \
  -H 'Content-Type: application/json' -d '{"status":"reviewing","note":"Checking driver availability"}'
```

## Items requiring business-owner verification

The full list is also surfaced in the admin console at **`/admin/settings`**.
See [`docs/OWNER-VERIFICATION.md`](docs/OWNER-VERIFICATION.md).

## Deployment notes

- Required env: `DATABASE_URL`, `DEMO_ADMIN_EMAIL`, `DEMO_ADMIN_PASSWORD`.
- Optional: `NOTIFY_PROVIDER=resend`, `RESEND_API_KEY`, `NOTIFY_FROM`, `NOTIFY_TO`,
  `NEXT_PUBLIC_SITE_URL`, `DEMO_SESSION_TTL_HOURS`.
- Apply schema with `npx drizzle-kit push` (see `drizzle.config.json`).
- No payment provider is integrated by design. To go live the operator would connect Stripe (or
  similar) and a transactional email provider, then replace demo pricing rules with verified fares.
