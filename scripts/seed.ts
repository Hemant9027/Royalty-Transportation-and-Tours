/**
 * Database seed script (idempotent).
 *   npm exec tsx scripts/seed.ts
 * Applies the Drizzle schema (run `npx drizzle-kit push` first) and inserts:
 *   - service catalog
 *   - demo pricing rules (labelled published / demo)
 *   - demo admin user from DEMO_ADMIN_EMAIL / DEMO_ADMIN_PASSWORD
 *   - clearly-labelled sample bookings
 */
import "dotenv/config";
import { ensureSeeded } from "../src/lib/seed";

ensureSeeded()
  .then((r) => {
    console.log("✔ Demo seed complete", r);
    process.exit(0);
  })
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
