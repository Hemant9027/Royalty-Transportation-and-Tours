import "server-only";
import crypto from "node:crypto";
import { getDemoStore, createDemoId, nextDemoRecordId } from "./demo-store";
import type { DemoBooking, DemoBookingStatusHistoryRow } from "./models";
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

const REF_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function generateReference(): string {
  const store = getDemoStore();
  for (let attempt = 0; attempt < 10; attempt++) {
    const bytes = crypto.randomBytes(5);
    const suffix = Array.from(bytes, (b) => REF_ALPHABET[b % REF_ALPHABET.length]).join("");
    const reference = `ROY-DEMO-${suffix}`;
    if (!store.bookings.some((booking) => booking.reference === reference)) return reference;
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
  const store = getDemoStore();
  const quote = evaluateDemoPrice(pricingContextFromJourney(input.journey), store.pricingRules);
  const reference = generateReference();
  const now = new Date();
  const booking: DemoBooking = {
    id: createDemoId(),
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
    internalNotes: null,
    notificationStatus: "not_configured",
    createdAt: now,
    updatedAt: now,
  };
  store.bookings.unshift(booking);
  store.history.unshift({
    id: nextDemoRecordId(store.history),
    bookingId: booking.id,
    fromStatus: null,
    toStatus: "pending",
    changedBy: "customer",
    note: "Booking request submitted through the demo booking form.",
    createdAt: now,
  });

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
    booking.notificationStatus = notificationStatus;
  } catch (err) {
    console.error("[bookings] notification error:", err);
  }

  return { booking, quote: quote ? { totalCents: quote.totalCents, lines: quote.lines } : null };
}

export async function getBookingByReference(reference: string): Promise<DemoBooking | null> {
  return (
    getDemoStore().bookings.find(
      (booking) => booking.reference === reference.toUpperCase().trim(),
    ) ?? null
  );
}

export async function getBookingById(id: string): Promise<DemoBooking | null> {
  return getDemoStore().bookings.find((booking) => booking.id === id) ?? null;
}

export async function getBookingHistory(bookingId: string): Promise<DemoBookingStatusHistoryRow[]> {
  return getDemoStore()
    .history.filter((entry) => entry.bookingId === bookingId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime() || b.id - a.id);
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
  if (booking.status !== toStatus) {
    const now = new Date();
    getDemoStore().history.unshift({
      id: nextDemoRecordId(getDemoStore().history),
      bookingId: id,
      fromStatus: booking.status,
      toStatus,
      changedBy,
      note: note ?? null,
      createdAt: now,
    });
    booking.status = toStatus;
    booking.updatedAt = now;
  }
  return booking;
}

export async function updateInternalNotes(id: string, notes: string): Promise<void> {
  const booking = await getBookingById(id);
  if (!booking) return;
  booking.internalNotes = notes;
  booking.updatedAt = new Date();
}

/** Public, PII-safe view: only what a status page needs before email verification. */
export function maskedBookingView(b: DemoBooking) {
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
