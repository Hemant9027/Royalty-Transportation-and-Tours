import { z } from "zod";
import { SERVICE_KEYS } from "./constants";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export function isValidDateString(v: string): boolean {
  if (!DATE_RE.test(v)) return false;
  const d = new Date(`${v}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
}

/** Today's date (YYYY-MM-DD) in America/Nassau — where the operator runs the business. */
export function todayInNassau(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Nassau",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

const text255 = z.string().trim().min(1, "Required").max(255, "Too long");

export const flightSchema = z.object({
  airline: text255,
  flightNumber: z
    .string()
    .trim()
    .min(2, "Flight number is required")
    .max(12, "Flight number looks too long")
    .regex(/^[A-Za-z0-9]{2}\s?\d{1,5}[A-Za-z]?$/, "Enter a valid flight number, e.g. AA 1421"),
  arrivalAirport: text255,
  arrivalTime: z.string().regex(TIME_RE, "Enter a valid time (HH:MM)"),
  hotelAddress: z.string().trim().max(500, "Too long").optional().or(z.literal("")),
});

export const tourSchema = z.object({
  tourName: z.string().trim().min(2, "Please choose a tour or experience").max(255),
  adults: z.coerce.number().int().min(1, "At least 1 adult").max(50, "Too many"),
  children: z.coerce.number().int().min(0, "Cannot be negative").max(50, "Too many"),
  specialRequests: z.string().trim().max(500, "Please keep it under 500 characters").optional().or(z.literal("")),
});

const TRANSFER_KEYS = [
  "airport_arrival",
  "airport_departure",
  "hotel_transfer",
  "private_transport",
  "group_transport",
] as const;

export const journeySchema = z
  .object({
    serviceKey: z.enum(SERVICE_KEYS),
    pickupLocation: z.string().trim().max(255, "Too long").optional().or(z.literal("")),
    destination: z.string().trim().max(255, "Too long").optional().or(z.literal("")),
    pickupDate: z.string().optional().or(z.literal("")),
    pickupTime: z.string().optional().or(z.literal("")),
    passengers: z.coerce.number().int().min(1, "At least 1 passenger").max(45, "For larger groups, please call us"),
    bags: z.coerce.number().int().min(0, "Cannot be negative").max(45, "Too many"),
    returnTrip: z.boolean(),
    returnDate: z.string().optional().or(z.literal("")),
    returnTime: z.string().optional().or(z.literal("")),
    additionalStops: z.coerce.number().int().min(0).max(5, "Max 5 additional stops"),
    flight: flightSchema.optional(),
    tour: tourSchema.optional(),
  })
  .superRefine((j, ctx) => {
    const isTransfer = (TRANSFER_KEYS as readonly string[]).includes(j.serviceKey);
    const isTour = j.serviceKey === "tour";

    if (isTransfer) {
      if (!j.pickupLocation?.trim()) {
        ctx.addIssue({ code: "custom", path: ["pickupLocation"], message: "Pickup location is required" });
      }
      if (!j.destination?.trim()) {
        ctx.addIssue({ code: "custom", path: ["destination"], message: "Destination is required" });
      }
    }
    if (!j.pickupDate || !isValidDateString(j.pickupDate)) {
      ctx.addIssue({ code: "custom", path: ["pickupDate"], message: "Enter a valid date (YYYY-MM-DD)" });
    } else if (j.pickupDate < todayInNassau()) {
      ctx.addIssue({ code: "custom", path: ["pickupDate"], message: "The date cannot be in the past" });
    }
    if (!j.pickupTime || !TIME_RE.test(j.pickupTime)) {
      ctx.addIssue({ code: "custom", path: ["pickupTime"], message: "Enter a valid time (HH:MM)" });
    }

    if (j.serviceKey === "airport_arrival") {
      if (!j.flight) {
        ctx.addIssue({ code: "custom", path: ["flight.airline"], message: "Flight details are required for arrival pickups" });
      } else {
        const res = flightSchema.safeParse(j.flight);
        if (!res.success) {
          for (const issue of res.error.issues) {
            ctx.addIssue({ code: "custom", path: ["flight", ...issue.path], message: issue.message });
          }
        }
        if (j.flight.arrivalTime && j.pickupDate) {
          // arrivalTime sanity is covered by flightSchema
        }
      }
    }

    if (isTransfer && j.serviceKey !== "airport_arrival" && j.flight?.flightNumber) {
      if (!/^[A-Za-z0-9]{2}\s?\d{1,5}[A-Za-z]?$/.test(j.flight.flightNumber)) {
        ctx.addIssue({ code: "custom", path: ["flight.flightNumber"], message: "Enter a valid flight number, e.g. AA 1421" });
      }
    }

    if (isTour) {
      if (!j.tour) {
        ctx.addIssue({ code: "custom", path: ["tour.tourName"], message: "Please choose a tour or experience" });
      } else {
        const res = tourSchema.safeParse(j.tour);
        if (!res.success) {
          for (const issue of res.error.issues) {
            ctx.addIssue({ code: "custom", path: ["tour", ...issue.path], message: issue.message });
          }
        }
      }
    }

    if (j.returnTrip) {
      if (!j.returnDate || !isValidDateString(j.returnDate)) {
        ctx.addIssue({ code: "custom", path: ["returnDate"], message: "Enter a valid return date" });
      } else if (j.pickupDate && isValidDateString(j.pickupDate) && j.returnDate < j.pickupDate) {
        ctx.addIssue({ code: "custom", path: ["returnDate"], message: "The return date cannot be before the pickup date" });
      }
      if (!j.returnTime || !TIME_RE.test(j.returnTime)) {
        ctx.addIssue({ code: "custom", path: ["returnTime"], message: "Enter a valid return time" });
      }
    }
  });

export const customerSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter the lead passenger's full name").max(120, "Too long"),
  email: z
    .string()
    .trim()
    .min(3, "Email is required")
    .max(160, "Too long")
    .regex(EMAIL_RE, "Enter a valid email address, e.g. name@example.com"),
  phone: z
    .string()
    .trim()
    .min(7, "Phone number is required (include country code)")
    .max(20, "Phone number looks too long")
    .regex(/^\+?[0-9\s().-]{7,20}$/, "Enter digits with a country code, e.g. +1 242 555 0123"),
  whatsapp: z
    .string()
    .trim()
    .max(20, "Too long")
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || /^\+?[0-9\s().-]{7,20}$/.test(v), "Enter a valid WhatsApp number or leave it empty"),
  specialInstructions: z.string().trim().max(1000, "Please keep it under 1000 characters").optional().or(z.literal("")),
  consent: z.literal(true, {
    error: "Please accept the privacy notice to submit your request",
  }),
});

export const bookingInputSchema = z.object({
  journey: journeySchema,
  customer: customerSchema,
});

export type FlightDetails = z.infer<typeof flightSchema>;
export type TourDetails = z.infer<typeof tourSchema>;
export type JourneyDetails = z.infer<typeof journeySchema>;
export type CustomerDetails = z.infer<typeof customerSchema>;
export type BookingInput = z.infer<typeof bookingInputSchema>;

/** Convert zod issues to a flat map of dotted-path -> message. */
export function issuesToFieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export const demoBookingUpdateSchema = z.object({
  status: z.enum(["pending", "reviewing", "quote_sent", "confirmed", "completed", "cancelled"]).optional(),
  internalNotes: z.string().max(4000).optional(),
  note: z.string().max(500).optional(),
});

export const pricingRuleInputSchema = z
  .object({
    name: z.string().trim().min(2).max(160),
    ruleType: z.enum(["fixed_route", "per_person", "per_vehicle", "return_multiplier", "additional_stop", "surcharge"]),
    serviceKey: z.enum(SERVICE_KEYS).nullable().optional(),
    matchFrom: z.string().trim().max(160).nullable().optional(),
    matchTo: z.string().trim().max(160).nullable().optional(),
    unitAmountCents: z.coerce.number().int().min(0).max(10_000_000).nullable().optional(),
    multiplierBps: z.coerce.number().int().min(100).max(100000).nullable().optional(),
    isActive: z.boolean().optional(),
    notes: z.string().trim().max(500).optional(),
  })
  .superRefine((r, ctx) => {
    if (r.ruleType === "fixed_route" && (!r.matchFrom || !r.matchTo)) {
      ctx.addIssue({ code: "custom", path: ["matchTo"], message: "Fixed-route rules need origin and destination keywords" });
    }
    if (r.ruleType === "return_multiplier" && (r.multiplierBps == null || r.multiplierBps < 100)) {
      ctx.addIssue({ code: "custom", path: ["multiplierBps"], message: "Return rules need a multiplier (e.g. 18000 = 1.8×)" });
    }
    if (["fixed_route", "per_person", "per_vehicle", "additional_stop", "surcharge"].includes(r.ruleType) && r.unitAmountCents == null) {
      ctx.addIssue({ code: "custom", path: ["unitAmountCents"], message: "This rule type needs an amount" });
    }
  });

export type PricingRuleInput = z.infer<typeof pricingRuleInputSchema>;
