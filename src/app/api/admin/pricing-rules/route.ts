import { NextResponse } from "next/server";
import { z } from "zod";
import { getDemoStore, nextDemoRecordId } from "@/lib/demo-store";
import { getAdminFromCookie } from "@/lib/auth";
import { pricingRuleInputSchema } from "@/lib/booking-schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getAdminFromCookie();
  if (!admin) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const rules = [...getDemoStore().pricingRules].sort((a, b) => a.id - b.id);
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

  const store = getDemoStore();
  const rule = {
    id: nextDemoRecordId(store.pricingRules),
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
    createdAt: new Date(),
  };
  store.pricingRules.push(rule);
  return NextResponse.json({ ok: true, rule }, { status: 201 });
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

  const store = getDemoStore();
  const rule = store.pricingRules.find(({ id }) => id === parsed.data.id);
  if (!rule) return NextResponse.json({ ok: false, error: "Rule not found" }, { status: 404 });
  rule.isActive = parsed.data.isActive;
  const rules = [...store.pricingRules].sort((a, b) => a.id - b.id);
  return NextResponse.json({ ok: true, rules });
}

export async function DELETE(req: Request) {
  const admin = await getAdminFromCookie();
  if (!admin) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const idParam = new URL(req.url).searchParams.get("id");
  const id = idParam && /^\d+$/.test(idParam) ? Number(idParam) : null;
  if (!id) return NextResponse.json({ ok: false, error: "Invalid rule id" }, { status: 400 });

  const store = getDemoStore();
  const initialLength = store.pricingRules.length;
  store.pricingRules = store.pricingRules.filter((rule) => rule.id !== id);
  if (store.pricingRules.length === initialLength) {
    return NextResponse.json({ ok: false, error: "Rule not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
