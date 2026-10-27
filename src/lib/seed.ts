import "server-only";
import { count, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  demoAdminUsers,
  demoBookings,
  demoBookingStatusHistory,
  demoPricingRules,
  demoServices,
} from "@/db/schema";
import { hashPassword, demoAdminEmail, demoAuthConfigured } from "./auth";
import { SERVICES, TOURS } from "./constants";

/**
 * Idempotent demo seeding. Runs from /api/health (bootstrap) and the admin
 * login flow so the demo always has its catalog, pricing rules, demo admin
 * account (from env), and a handful of clearly-labelled SAMPLE bookings.
 */

export async function ensureServicesSeeded(): Promise<void> {
  const [{ total }] = await db.select({ total: count() }).from(demoServices);
  if (Number(total) > 0) return;
  await db.insert(demoServices).values(
    SERVICES.map((s, i) => ({
      key: s.key,
      name: s.name,
      tagline: s.tagline,
      description: s.description,
      icon: s.key,
      isActive: true,
      sortOrder: i,
    })),
  );
}

export async function ensurePricingRulesSeeded(): Promise<void> {
  const [{ total }] = await db.select({ total: count() }).from(demoPricingRules);
  if (Number(total) > 0) return;
  await db.insert(demoPricingRules).values([
    {
      name: "SUV airport transfer — starting fare",
      ruleType: "fixed_route",
      serviceKey: "airport_arrival",
      matchFrom: "airport",
      matchTo: "*",
      unitAmountCents: 9900,
      source: "published",
      notes:
        "Mirrors the published 'SUV starting price $99' on royaltransportationandtours.com. Scope/zones must be verified with the owner before production use.",
    },
    {
      name: "Water Sports Adventure Package",
      ruleType: "per_person",
      serviceKey: "tour",
      matchFrom: "Water Sports",
      unitAmountCents: 12500,
      source: "published",
      notes:
        "Published on the business website at $125 per person. Only applied when the selected tour is the Water Sports Adventure Package.",
    },
    {
      name: "Airport departure — hotel zone (demo)",
      ruleType: "fixed_route",
      serviceKey: "airport_departure",
      matchFrom: "*",
      matchTo: "airport",
      unitAmountCents: 9900,
      source: "demo",
      notes: "Simulated sample rule for the demo. Replace with the operator's verified zone fares.",
    },
    {
      name: "Group transfer — per vehicle (demo)",
      ruleType: "per_vehicle",
      serviceKey: "group_transport",
      unitAmountCents: 15000,
      source: "demo",
      notes:
        "Simulated sample rule loosely based on the $150 figure shown on the website's transportation page. Requires owner verification.",
    },
    {
      name: "Return journey multiplier (demo)",
      ruleType: "return_multiplier",
      serviceKey: null,
      multiplierBps: 18000,
      source: "demo",
      notes: "Simulated 1.8× return-trip multiplier. For demo use only.",
    },
    {
      name: "Additional stop (demo)",
      ruleType: "additional_stop",
      serviceKey: null,
      unitAmountCents: 2500,
      source: "demo",
      notes: "Simulated per-stop fee. For demo use only.",
    },
    {
      name: "After-hours surcharge 10pm–5am (demo, disabled)",
      ruleType: "surcharge",
      serviceKey: null,
      unitAmountCents: 2000,
      isActive: false,
      source: "demo",
      notes: "Disabled by default so it never silently inflates demo estimates.",
    },
  ]);
}

export async function ensureAdminSeeded(): Promise<boolean> {
  if (!demoAuthConfigured()) return false;
  const email = demoAdminEmail();
  const [{ total }] = await db.select({ total: count() }).from(demoAdminUsers);
  if (Number(total) > 0) return true;
  await db.insert(demoAdminUsers).values({
    email,
    passwordHash: hashPassword(process.env.DEMO_ADMIN_PASSWORD!),
  });
  return true;
}

const SAMPLE_TOURS = TOURS.map((t) => t.name);

function d(offsetDays: number): string {
  const d = new Date(Date.now() + offsetDays * 86400_000);
  return d.toISOString().slice(0, 10);
}

export async function ensureSampleBookingsSeeded(): Promise<void> {
  const [{ total }] = await db
    .select({ total: count() })
    .from(demoBookings)
    .where(eq(demoBookings.isSample, true));
  if (Number(total) > 0) return;

  const now = new Date();
  const samples = [
    {
      reference: "ROY-DEMO-SMPL1",
      serviceKey: "airport_arrival",
      serviceLabel: "Airport Arrival Transfer",
      pickupDate: d(1),
      pickupTime: "13:25",
      status: "pending",
      estimatedCents: 9900,
      priceBreakdown: { isDemoEstimate: true, lines: [{ label: "SUV airport transfer — starting fare", amountCents: 9900 }] },
      journey: {
        serviceKey: "airport_arrival",
        pickupLocation: "Lynden Pindling International Airport (NAS)",
        destination: "Atlantis, Paradise Island",
        pickupDate: d(1),
        pickupTime: "13:25",
        passengers: 3,
        bags: 4,
        returnTrip: false,
        additionalStops: 0,
        flight: {
          airline: "American Airlines",
          flightNumber: "AA 1421",
          arrivalAirport: "Lynden Pindling International (NAS)",
          arrivalTime: "13:10",
          hotelAddress: "Atlantis Royal Towers, Paradise Island",
        },
      },
      customer: {
        fullName: "Sample Guest — Harper Quinn",
        email: "harper.quinn@example.com",
        phone: "+1 305 555 0147",
        whatsapp: "",
        specialInstructions: "Travelling with a toddler, car seat requested.",
        consent: true,
      },
    },
    {
      reference: "ROY-DEMO-SMPL2",
      serviceKey: "tour",
      serviceLabel: "Nassau Tour or Experience",
      pickupDate: d(3),
      pickupTime: "09:00",
      status: "confirmed",
      estimatedCents: 37500,
      priceBreakdown: {
        isDemoEstimate: true,
        lines: [{ label: "Water Sports Adventure Package — 3 guests", amountCents: 37500 }],
      },
      journey: {
        serviceKey: "tour",
        pickupLocation: "Baha Mar Resort, Cable Beach",
        destination: "",
        pickupDate: d(3),
        pickupTime: "09:00",
        passengers: 3,
        bags: 0,
        returnTrip: false,
        additionalStops: 0,
        tour: { tourName: SAMPLE_TOURS[0], adults: 2, children: 1 },
      },
      customer: {
        fullName: "Sample Guest — Mateo Alvarez",
        email: "mateo.alvarez@example.com",
        phone: "+34 600 555 011",
        whatsapp: "+34 600 555 011",
        specialInstructions: "Spanish-speaking guide preferred.",
        consent: true,
      },
    },
    {
      reference: "ROY-DEMO-SMPL3",
      serviceKey: "group_transport",
      serviceLabel: "Group Transportation",
      pickupDate: d(6),
      pickupTime: "16:45",
      status: "reviewing",
      estimatedCents: 15000,
      priceBreakdown: { isDemoEstimate: true, lines: [{ label: "Group transfer — per vehicle (demo)", amountCents: 15000 }] },
      journey: {
        serviceKey: "group_transport",
        pickupLocation: "Prince George Wharf (Cruise Port)",
        destination: "Junkanoo Beach",
        pickupDate: d(6),
        pickupTime: "16:45",
        passengers: 12,
        bags: 8,
        returnTrip: true,
        returnDate: d(6),
        returnTime: "20:30",
        additionalStops: 1,
      },
      customer: {
        fullName: "Sample Guest — Aisha Bello",
        email: "aisha.bello@example.com",
        phone: "+44 7700 555 018",
        whatsapp: "",
        specialInstructions: "Wedding party of 12; one grocery stop requested.",
        consent: true,
      },
    },
    {
      reference: "ROY-DEMO-SMPL4",
      serviceKey: "airport_departure",
      serviceLabel: "Airport Departure Transfer",
      pickupDate: d(2),
      pickupTime: "07:30",
      status: "confirmed",
      estimatedCents: 9900,
      priceBreakdown: { isDemoEstimate: true, lines: [{ label: "Airport departure — hotel zone (demo)", amountCents: 9900 }] },
      journey: {
        serviceKey: "airport_departure",
        pickupLocation: "Sandals Royal Bahamian",
        destination: "Lynden Pindling International Airport (NAS)",
        pickupDate: d(2),
        pickupTime: "07:30",
        passengers: 2,
        bags: 3,
        returnTrip: false,
        additionalStops: 0,
      },
      customer: {
        fullName: "Sample Guest — Noah Fitzgerald",
        email: "noah.fitz@example.com",
        phone: "+1 416 555 0198",
        whatsapp: "",
        specialInstructions: "",
        consent: true,
      },
    },
    {
      reference: "ROY-DEMO-SMPL5",
      serviceKey: "private_transport",
      serviceLabel: "Private Transportation",
      pickupDate: d(-2),
      pickupTime: "18:00",
      status: "completed",
      estimatedCents: null,
      priceBreakdown: null,
      journey: {
        serviceKey: "private_transport",
        pickupLocation: "Downtown Nassau / Straw Market",
        destination: "Fish Fry, Arawak Cay",
        pickupDate: d(-2),
        pickupTime: "18:00",
        passengers: 4,
        bags: 0,
        returnTrip: true,
        returnDate: d(-2),
        returnTime: "21:00",
        additionalStops: 0,
      },
      customer: {
        fullName: "Sample Guest — Sofia Laurent",
        email: "sofia.laurent@example.com",
        phone: "+33 6 55 50 10 22",
        whatsapp: "",
        specialInstructions: "Dinner transfer; sample completed journey.",
        consent: true,
      },
    },
    {
      reference: "ROY-DEMO-SMPL6",
      serviceKey: "hotel_transfer",
      serviceLabel: "Hotel Transfer",
      pickupDate: d(4),
      pickupTime: "11:00",
      status: "quote_sent",
      estimatedCents: null,
      priceBreakdown: null,
      journey: {
        serviceKey: "hotel_transfer",
        pickupLocation: "Grand Hyatt Baha Mar",
        destination: "Albany, New Providence",
        pickupDate: d(4),
        pickupTime: "11:00",
        passengers: 2,
        bags: 2,
        returnTrip: false,
        additionalStops: 0,
      },
      customer: {
        fullName: "Sample Guest — Liam Okafor",
        email: "liam.okafor@example.com",
        phone: "+1 242 555 0163",
        whatsapp: "",
        specialInstructions: "",
        consent: true,
      },
    },
    {
      reference: "ROY-DEMO-SMPL7",
      serviceKey: "tour",
      serviceLabel: "Nassau Tour or Experience",
      pickupDate: d(-6),
      pickupTime: "10:00",
      status: "cancelled",
      estimatedCents: null,
      priceBreakdown: null,
      journey: {
        serviceKey: "tour",
        pickupLocation: "Margaritaville Beach Resort",
        destination: "",
        pickupDate: d(-6),
        pickupTime: "10:00",
        passengers: 2,
        bags: 0,
        returnTrip: false,
        additionalStops: 0,
        tour: { tourName: SAMPLE_TOURS[1], adults: 2, children: 0 },
      },
      customer: {
        fullName: "Sample Guest — Emma Whitfield",
        email: "emma.whitfield@example.com",
        phone: "+1 646 555 0120",
        whatsapp: "",
        specialInstructions: "Sample record demonstrating a cancelled request.",
        consent: true,
      },
    },
  ] as const;

  for (const s of samples) {
    const [b] = await db
      .insert(demoBookings)
      .values({
        reference: s.reference,
        serviceKey: s.serviceKey,
        serviceLabel: s.serviceLabel,
        pickupDate: s.pickupDate,
        pickupTime: s.pickupTime,
        journey: s.journey as never,
        customer: s.customer as never,
        estimatedCents: s.estimatedCents,
        currency: "USD",
        priceBreakdown: s.priceBreakdown as never,
        isSample: true,
        status: s.status,
        notificationStatus: "not_configured",
        createdAt: new Date(now.getTime() - Math.floor(Math.random() * 72) * 3600_000),
        updatedAt: now,
      })
      .returning();
    await db.insert(demoBookingStatusHistory).values({
      bookingId: b.id,
      fromStatus: null,
      toStatus: s.status,
      changedBy: "demo-seed",
      note: "Seeded sample record for demonstration purposes only.",
      createdAt: b.createdAt,
    });
  }
}

export async function ensureSeeded(): Promise<{ ok: boolean; adminConfigured: boolean }> {
  await ensureServicesSeeded();
  await ensurePricingRulesSeeded();
  const adminOk = await ensureAdminSeeded();
  await ensureSampleBookingsSeeded();
  return { ok: true, adminConfigured: adminOk };
}
