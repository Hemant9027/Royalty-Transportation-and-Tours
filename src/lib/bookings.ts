import "server-only";
import crypto from "node:crypto";
import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import {
  demoBookings,
  demoBookingStatusHistory,
  demoPricingRules,
  type DemoBooking,
  type DemoBookingStatusHistoryRow,
} from "@/db/schema";
import {
  bookingInputSchema,
  type BookingInput,
  type CustomerDetails,
  type JourneyDetails,
} from "./booking-schema";
import { evaluateDemoPrice, pricingContextFromJourney, type PriceLine } from "./pricing";
import { serviceName, type BookingStatus } from "./constants";
import { sendBookingNotification, type NotificationStatus } from "./notify";
import { formatDate, formatTime } from "./format";

const REF_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no ambiguous 0/O/1/I/L

async function generateReference(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const bytes = crypto.randomBytes(5);
    const suffix = Array.from(bytes, (b) => REF_ALPHABET[b % REF_ALPHABET.length]).join("");
    const reference = `ROY-DEMO-${suffix}`;
    const clash = await db
      .select({ id: demoBookings.id })
      .from(demoBookings)
      .where(eq(demoBookings.reference, reference))
      .limit(1);
    if (clash.length === 0) return reference;
  }
  throw new Error("Could not allocate a unique booking reference");
}

export class BookingValidationError extends Error {
  fieldErrors: Record<string, string>;
  constructor(fieldErrors: Record<string, string>) {
    super("Validation failed");
    this.fieldErrors = fieldErrors;
  }
}

export interface CreateBookingResult {
  booking: DemoBooking;
  quote: { totalCents: number; lines: PriceLine[] } | null;
}

export async function createBooking(raw: unknown): Promise<CreateBookingResult> {
  const parsed = bookingInputSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "form";
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    throw new BookingValidationError(fieldErrors);
  }
  const input: BookingInput = parsed.data;

  // Demo pricing engine — null when no configured rule matches
  const rules = await db.select().from(demoPricingRules);
  const quote = evaluateDemoPrice(pricingContextFromJourney(input.journey), rules);

  const reference = await generateReference();
  const now = new Date();

  const [booking] = await db
    .insert(demoBookings)
    .values({
      reference,
      serviceKey: input.journey.serviceKey,
      serviceLabel: serviceName(input.journey.serviceKey),
      pickupDate: input.journey.pickupDate ?? "",
      pickupTime: input.journey.pickupTime ?? "",
      journey: input.journey,
      customer: input.customer,
      estimatedCents: quote?.totalCents ?? null,
      currency: "USD",
      priceBreakdown: quote ? { lines: quote.lines, isDemoEstimate: true } : null,
      isSample: false,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  await db.insert(demoBookingStatusHistory).values({
    bookingId: booking.id,
    fromStatus: null,
    toStatus: "pending",
    changedBy: "customer",
    note: "Booking request submitted through the demo booking form.",
    createdAt: now,
  });

  // Honest notification handling — only "sent" if the provider call succeeds
  const summaryLines = [
    `Requested: ${formatDate(input.journey.pickupDate)} at ${formatTime(input.journey.pickupTime)}`,
    input.journey.pickupLocation ? `From: ${input.journey.pickupLocation}` : "",
    input.journey.destination ? `To: ${input.journey.destination}` : "",
    input.journey.tour ? `Tour: ${input.journey.tour.tourName}` : "",
    quote ? `Demo estimate: $${(quote.totalCents / 100).toFixed(2)}` : "No pricing rule matched — quote required.",
  ].filter(Boolean);

  let notificationStatus: NotificationStatus = "not_configured";
  try {
    notificationStatus = await sendBookingNotification({
      reference,
      serviceLabel: booking.serviceLabel,
      customerName: input.customer.fullName,
      customerEmail: input.customer.email,
      summary: summaryLines.join("\n"),
    });
    if (notificationStatus !== "not_configured") {
      await db.update(demoBookings).set({ notificationStatus }).where(eq(demoBookings.id, booking.id));
    }
  } catch (err) {
    console.error("[bookings] notification error:", err);
  }

  return { booking, quote: quote ? { totalCents: quote.totalCents, lines: quote.lines } : null };
}

export async function getBookingByReference(reference: string): Promise<DemoBooking | null> {
  const rows = await db
    .select()
    .from(demoBookings)
    .where(eq(demoBookings.reference, reference.toUpperCase().trim()))
    .limit(1);
  return rows[0] ?? null;
}

export async function getBookingById(id: string): Promise<DemoBooking | null> {
  const rows = await db.select().from(demoBookings).where(eq(demoBookings.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getBookingHistory(bookingId: string): Promise<DemoBookingStatusHistoryRow[]> {
  return db
    .select()
    .from(demoBookingStatusHistory)
    .where(eq(demoBookingStatusHistory.bookingId, bookingId))
    .orderBy(desc(demoBookingStatusHistory.createdAt), desc(demoBookingStatusHistory.id));
}

export function isValidStatus(v: string): v is BookingStatus {
  return ["pending", "reviewing", "quote_sent", "confirmed", "completed", "cancelled"].includes(v);
}

export async function updateBookingStatus(
  id: string,
  toStatus: BookingStatus,
  changedBy: string,
  note?: string,
): Promise<DemoBooking | null> {
  const booking = await getBookingById(id);
  if (!booking) return null;
  const now = new Date();
  if (booking.status !== toStatus) {
    await db
      .update(demoBookings)
      .set({ status: toStatus, updatedAt: now })
      .where(eq(demoBookings.id, id));
    await db.insert(demoBookingStatusHistory).values({
      bookingId: id,
      fromStatus: booking.status,
      toStatus,
      changedBy,
      note: note ?? null,
      createdAt: now,
    });
  }
  return getBookingById(id);
}

export async function updateInternalNotes(id: string, notes: string): Promise<void> {
  await db
    .update(demoBookings)
    .set({ internalNotes: notes, updatedAt: new Date() })
    .where(eq(demoBookings.id, id));
}

/** Public, PII-safe view: only what a status page needs before email verification. */
export function maskedBookingView(b: DemoBooking) {
  const journey = b.journey as JourneyDetails;
  const customer = b.customer as CustomerDetails;
  return {
    reference: b.reference,
    serviceLabel: b.serviceLabel,
    status: b.status,
    pickupDate: b.pickupDate,
    pickupTime: b.pickupTime,
    customerFirstInitial: customer.fullName ? customer.fullName.trim()[0]!.toUpperCase() + "•••" : "—",
    createdAt: b.createdAt,
  };
}

/** Full booking view — only exposed after reference + matching email, or to admins. */
export function fullBookingView(b: DemoBooking) {
  const journey = b.journey as JourneyDetails;
  const customer = b.customer as CustomerDetails;
  return {
    reference: b.reference,
    serviceKey: b.serviceKey,
    serviceLabel: b.serviceLabel,
    status: b.status,
    isSample: b.isSample,
    journey,
    customer: {
      fullName: customer.fullName,
      email: customer.email,
      phone: customer.phone,
      whatsapp: customer.whatsapp ?? "",
      specialInstructions: customer.specialInstructions ?? "",
    },
    pickupDate: b.pickupDate,
    pickupTime: b.pickupTime,
    estimatedCents: b.estimatedCents,
    currency: b.currency,
    priceBreakdown: b.priceBreakdown,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
  };
}
