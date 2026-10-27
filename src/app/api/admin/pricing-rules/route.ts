import { NextResponse } from "next/server";
import { z } from "zod";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { demoPricingRules } from "@/db/schema";
import { getAdminFromCookie } from "@/lib/auth";
import { pricingRuleInputSchema } from "@/lib/booking-schema";
import { ensurePricingRulesSeeded } from "@/lib/seed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getAdminFromCookie();
  if (!admin) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  await ensurePricingRulesSeeded();
  const rules = await db.select().from(demoPricingRules).orderBy(asc(demoPricingRules.id));
  return NextResponse.json({ ok: true, rules });
}

export async function POST(req: Request) {
  const admin = await getAdminFromCookie();
  if (!admin) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 });
  }
  const parsed = pricingRuleInputSchema.safeParse(payload);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Invalid rule";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }

  try {
    const [rule] = await db
      .insert(demoPricingRules)
      .values({
        name: parsed.data.name,
        ruleType: parsed.data.ruleType,
        serviceKey: parsed.data.serviceKey ?? null,
        matchFrom: parsed.data.matchFrom || null,
        matchTo: parsed.data.matchTo || null,
        unitAmountCents: parsed.data.unitAmountCents ?? null,
        multiplierBps: parsed.data.multiplierBps ?? null,
        isActive: parsed.data.isActive ?? true,
        source: "demo",
        notes: parsed.data.notes ?? null,
      })
      .returning();
    return NextResponse.json({ ok: true, rule }, { status: 201 });
  } catch (err) {
    console.error("[api/admin/pricing-rules POST]", err);
    return NextResponse.json({ ok: false, error: "Could not create rule" }, { status: 500 });
  }
}

const toggleSchema = z.object({ id: z.coerce.number().int().positive(), isActive: z.boolean() });

export async function PATCH(req: Request) {
  const admin = await getAdminFromCookie();
  if (!admin) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 });
  }
  const parsed = toggleSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid rule update" }, { status: 400 });
  }

  try {
    await db
      .update(demoPricingRules)
      .set({ isActive: parsed.data.isActive })
      .where(eq(demoPricingRules.id, parsed.data.id));
    const rules = await db.select().from(demoPricingRules).orderBy(asc(demoPricingRules.id));
    return NextResponse.json({ ok: true, rules });
  } catch (err) {
    console.error("[api/admin/pricing-rules PATCH]", err);
    return NextResponse.json({ ok: false, error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const admin = await getAdminFromCookie();
  if (!admin) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const idParam = new URL(req.url).searchParams.get("id");
  const id = idParam && /^\d+$/.test(idParam) ? Number(idParam) : null;
  if (!id) return NextResponse.json({ ok: false, error: "Invalid rule id" }, { status: 400 });

  try {
    await db.delete(demoPricingRules).where(eq(demoPricingRules.id, id));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/admin/pricing-rules DELETE]", err);
    return NextResponse.json({ ok: false, error: "Delete failed" }, { status: 500 });
  }
}
