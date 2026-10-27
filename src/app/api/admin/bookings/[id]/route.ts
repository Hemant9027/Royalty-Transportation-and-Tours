import { NextResponse } from "next/server";
import { getAdminFromCookie } from "@/lib/auth";
import { demoBookingUpdateSchema } from "@/lib/booking-schema";
import {
  getBookingById,
  getBookingHistory,
  updateBookingStatus,
  updateInternalNotes,
  isValidStatus,
} from "@/lib/bookings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const admin = await getAdminFromCookie();
  if (!admin) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const booking = await getBookingById(id);
  if (!booking) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  const history = await getBookingHistory(booking.id);
  return NextResponse.json({ ok: true, booking, history });
}

/** Server-side authorization gate for every admin mutation. */
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const admin = await getAdminFromCookie();
  if (!admin) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 });
  }
  const parsed = demoBookingUpdateSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid update" }, { status: 400 });
  }

  const { status, internalNotes, note } = parsed.data;
  if (!status && internalNotes === undefined) {
    return NextResponse.json({ ok: false, error: "Nothing to update" }, { status: 400 });
  }

  try {
    const existing = await getBookingById(id);
    if (!existing) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

    if (status) {
      if (!isValidStatus(status)) {
        return NextResponse.json({ ok: false, error: "Invalid status" }, { status: 400 });
      }
      await updateBookingStatus(id, status, admin.email, note);
    }
    if (internalNotes !== undefined) {
      await updateInternalNotes(id, internalNotes);
    }
    const booking = await getBookingById(id);
    const history = await getBookingHistory(id);
    return NextResponse.json({ ok: true, booking, history });
  } catch (err) {
    console.error("[api/admin/bookings/:id]", err);
    return NextResponse.json({ ok: false, error: "Update failed — please retry" }, { status: 500 });
  }
}
