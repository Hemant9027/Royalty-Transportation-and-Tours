import { NextResponse } from "next/server";
import { createBooking, BookingValidationError } from "@/lib/bookings";
import { ensureSeeded } from "@/lib/seed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/bookings
 * Public endpoint used by the booking wizard. Server-side validation only;
 * persists the request and attempts a notification if configured.
 */
export async function POST(req: Request) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 });
  }

  try {
    await ensureSeeded();
    const { booking, quote } = await createBooking(payload);
    return NextResponse.json(
      {
        ok: true,
        reference: booking.reference,
        status: booking.status,
        quote: quote
          ? { totalCents: quote.totalCents, currency: booking.currency, lines: quote.lines, isDemoEstimate: true }
          : null,
      },
      { status: 201 },
    );
  } catch (err) {
    if (err instanceof BookingValidationError) {
      return NextResponse.json({ ok: false, error: "validation", fieldErrors: err.fieldErrors }, { status: 400 });
    }
    console.error("[api/bookings] failed to create booking:", err);
    return NextResponse.json(
      { ok: false, error: "We couldn't store your request right now. Please try again, or call +1 242-828-6196." },
      { status: 500 },
    );
  }
}
