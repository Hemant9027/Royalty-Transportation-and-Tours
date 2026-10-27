import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { demoPricingRules } from "@/db/schema";
import { evaluateDemoPrice } from "@/lib/pricing";
import { SERVICE_KEYS } from "@/lib/constants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const quotePreviewSchema = z.object({
  serviceKey: z.enum(SERVICE_KEYS),
  pickupLocation: z.string().max(255).optional(),
  destination: z.string().max(255).optional(),
  passengers: z.coerce.number().int().min(1).max(45),
  tourGuests: z.coerce.number().int().min(0).max(60).optional(),
  tourName: z.string().max(255).optional(),
  returnTrip: z.boolean(),
  additionalStops: z.coerce.number().int().min(0).max(5),
});

/**
 * POST /api/quote — read-only demo pricing preview. Never a final fare.
 */
export async function POST(req: Request) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 });
  }

  const parsed = quotePreviewSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid quote request" }, { status: 400 });
  }

  try {
    const rules = await db.select().from(demoPricingRules);
    const quote = evaluateDemoPrice(parsed.data, rules);
    if (!quote) {
      return NextResponse.json({ ok: true, quote: null });
    }
    return NextResponse.json({
      ok: true,
      quote: {
        totalCents: quote.totalCents,
        currency: quote.currency,
        lines: quote.lines,
        isDemoEstimate: quote.isDemoEstimate,
        containsPublishedRate: quote.containsPublishedRate,
      },
    });
  } catch (err) {
    console.error("[api/quote] pricing engine error:", err);
    return NextResponse.json({ ok: false, error: "Pricing temporarily unavailable" }, { status: 500 });
  }
}
