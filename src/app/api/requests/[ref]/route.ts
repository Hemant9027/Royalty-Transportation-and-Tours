import { NextResponse } from "next/server";
import { getBookingByReference, maskedBookingView, fullBookingView, getBookingHistory } from "@/lib/bookings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/requests/[ref]?email=...
 *
 * Privacy gate: without a matching email only a masked, PII-minimal view is
 * returned — so one customer's record can never be read by another visitor.
 */
export async function GET(req: Request, ctx: { params: Promise<{ ref: string }> }) {
  const { ref } = await ctx.params;
  const email = new URL(req.url).searchParams.get("email")?.trim().toLowerCase();

  try {
    const booking = await getBookingByReference(ref);
    if (!booking) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }

    if (email) {
      const stored = ((booking.customer as { email?: string }).email ?? "").toLowerCase();
      if (stored && stored === email) {
        const history = await getBookingHistory(booking.id);
        return NextResponse.json({
          ok: true,
          verified: true,
          booking: fullBookingView(booking),
          history: history.map((h) => ({
            fromStatus: h.fromStatus,
            toStatus: h.toStatus,
            createdAt: h.createdAt,
          })),
        });
      }
      return NextResponse.json({ ok: true, verified: false, booking: maskedBookingView(booking) }, { status: 403 });
    }

    return NextResponse.json({ ok: true, verified: false, booking: maskedBookingView(booking) });
  } catch (err) {
    console.error("[api/requests] lookup failed:", err);
    return NextResponse.json({ ok: false, error: "Lookup temporarily unavailable" }, { status: 500 });
  }
}
