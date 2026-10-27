import type { Metadata } from "next";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { demoPricingRules } from "@/db/schema";
import { demoAdminEmail } from "@/lib/auth";
import { notifyConfigSummary } from "@/lib/notify";
import { ensurePricingRulesSeeded } from "@/lib/seed";
import { ShieldCheck, CircleCheck, CircleDashed, FileWarning } from "lucide-react";
import { PricingRulesManager } from "@/components/admin/pricing-rules-manager";

export const metadata: Metadata = { title: "Settings & Pricing" };
export const dynamic = "force-dynamic";

const OWNER_VERIFICATION_ITEMS = [
  "Zone fares for airport transfers (the site publishes an SUV 'from $99' start price — per-zone rates unverified)",
  "The $150 and $250 figures shown on the current transportation page (context unclear — verify what they cover)",
  "Water Sports Adventure Package at $125/person (published) — confirm inclusions & child policy still current",
  "Tour pricing and availability for Ardastra, Atlantis, catamaran, fishing and swimming-pig excursions",
  "Fleet composition beyond the published 15-passenger Toyota Hiace vans and SUV service",
  "TripAdvisor review content and the '1,000+ tourists' milestone figure",
  "Operating hours, languages beyond English/Spanish, and meet-and-greet availability for late-night arrivals",
];

export default async function AdminSettingsPage() {
  await ensurePricingRulesSeeded();
  const rules = await db.select().from(demoPricingRules).orderBy(asc(demoPricingRules.id));

  const envChecks = [
    { label: "Demo admin account", ok: Boolean(process.env.DEMO_ADMIN_EMAIL && process.env.DEMO_ADMIN_PASSWORD) },
    { label: "Database connection", ok: Boolean(process.env.DATABASE_URL) },
    { label: "Email provider (Resend)", ok: process.env.NOTIFY_PROVIDER === "resend" && Boolean(process.env.RESEND_API_KEY) },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-navy-950">Settings &amp; Pricing</h1>
      <p className="mt-1.5 max-w-2xl text-[13.5px] text-navy-500">
        Demo configuration only — production values would be supplied by the operator and stored
        outside source control.
      </p>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        {/* Environment */}
        <section className="rounded-2xl border border-navy-900/10 bg-white p-6 shadow-[var(--shadow-card)]">
          <h2 className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.14em] text-navy-500">
            <ShieldCheck className="size-4 text-aqua-700" /> Environment
          </h2>
          <dl className="mt-4 space-y-3">
            <div className="flex items-center justify-between gap-4 rounded-xl bg-navy-50/70 px-4 py-3">
              <dt className="text-[13px] font-semibold text-navy-700">Demo admin email</dt>
              <dd className="font-mono text-[12.5px] font-bold text-navy-950">{demoAdminEmail() || "not configured"}</dd>
            </div>
            <div className="rounded-xl bg-navy-50/70 px-4 py-3">
              <dt className="text-[13px] font-semibold text-navy-700">Notifications</dt>
              <dd className="mt-1 text-[12.5px] font-medium text-navy-500">{notifyConfigSummary()}</dd>
            </div>
          </dl>
          <ul className="mt-4 space-y-2">
            {envChecks.map((c) => (
              <li key={c.label} className="flex items-center gap-2.5 text-[13px] font-semibold text-navy-800">
                {c.ok ? (
                  <CircleCheck className="size-4 text-emerald-600" />
                ) : (
                  <CircleDashed className="size-4 text-amber-500" />
                )}
                {c.label} {c.ok ? "configured" : "not configured"}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[11.5px] leading-relaxed text-navy-400">
            Values are never displayed — only configuration status. Passwords are stored as scrypt
            hashes; sessions are server-side tokens, hashed at rest.
          </p>
        </section>

        {/* Owner verification */}
        <section className="rounded-2xl border border-amber-300/40 bg-amber-400/[0.06] p-6 shadow-[var(--shadow-card)]">
          <h2 className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.14em] text-amber-700">
            <FileWarning className="size-4" /> Requires owner verification before go-live
          </h2>
          <ul className="mt-4 list-disc space-y-2.5 pl-5 text-[13px] leading-relaxed text-navy-700">
            {OWNER_VERIFICATION_ITEMS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>

      <div className="mt-8">
        <PricingRulesManager initial={rules} />
      </div>
    </div>
  );
}
