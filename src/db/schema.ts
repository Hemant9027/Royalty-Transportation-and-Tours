import {
  pgTable,
  serial,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";

/**
 * Demo schema for the Royalty Transportation & Tours demo environment.
 * Every record created here is demo data — nothing represents a live
 * production reservation.
 */

export const demoServices = pgTable("demo_services", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  tagline: text("tagline").notNull().default(""),
  description: text("description").notNull().default(""),
  icon: text("icon").notNull().default("car"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const demoPricingRules = pgTable("demo_pricing_rules", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  /** fixed_route | per_person | per_vehicle | return_multiplier | additional_stop | surcharge */
  ruleType: text("rule_type").notNull(),
  /** null → rule applies to every service */
  serviceKey: text("service_key"),
  /** location keywords for fixed_route matching (case-insensitive substring) */
  matchFrom: text("match_from"),
  matchTo: text("match_to"),
  /** amount in USD cents for fixed / per-person / per-vehicle / stop / surcharge rules */
  unitAmountCents: integer("unit_amount_cents"),
  /** multiplier for return trips in basis-points style: 18000 => 1.8x */
  multiplierBps: integer("multiplier_bps"),
  isActive: boolean("is_active").notNull().default(true),
  /** "published" = appears on the business website | "demo" = simulated sample rule */
  source: text("source").notNull().default("demo"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const demoBookings = pgTable(
  "demo_bookings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    /** unique demo reference, e.g. ROY-DEMO-7K2QX4 */
    reference: text("reference").notNull().unique(),
    serviceKey: text("service_key").notNull(),
    serviceLabel: text("service_label").notNull(),
    /** requested journey date/time duplicated from journey for easy filtering & sorting */
    pickupDate: text("pickup_date").notNull(),
    pickupTime: text("pickup_time").notNull(),
    /** journey details (locations, dates, flight info, tour info, passengers...) */
    journey: jsonb("journey").notNull(),
    /** customer contact details */
    customer: jsonb("customer").notNull(),
    /** null → no configured rule matched, quote required */
    estimatedCents: integer("estimated_cents"),
    currency: text("currency").notNull().default("USD"),
    priceBreakdown: jsonb("price_breakdown"),
    /** true → seeded sample record, false → real demo submission from the public form */
    isSample: boolean("is_sample").notNull().default(false),
    /** pending | reviewing | quote_sent | confirmed | completed | cancelled */
    status: text("status").notNull().default("pending"),
    internalNotes: text("internal_notes"),
    /** not_configured | queued | sent | failed */
    notificationStatus: text("notification_status").notNull().default("not_configured"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("demo_bookings_status_idx").on(t.status),
    index("demo_bookings_created_idx").on(t.createdAt),
    index("demo_bookings_pickup_date_idx").on(t.pickupDate),
  ],
);

export const demoBookingStatusHistory = pgTable(
  "demo_booking_status_history",
  {
    id: serial("id").primaryKey(),
    bookingId: uuid("booking_id")
      .notNull()
      .references(() => demoBookings.id, { onDelete: "cascade" }),
    fromStatus: text("from_status"),
    toStatus: text("to_status").notNull(),
    changedBy: text("changed_by").notNull().default("system"),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("demo_booking_history_booking_idx").on(t.bookingId)],
);

export const demoAdminUsers = pgTable("demo_admin_users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  /** scrypt hash in the form scrypt:N:salt:hash */
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const demoAdminSessions = pgTable("demo_admin_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  /** sha256 hash of the opaque session token (raw token never stored) */
  tokenHash: text("token_hash").notNull().unique(),
  adminUserId: integer("admin_user_id")
    .notNull()
    .references(() => demoAdminUsers.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type DemoService = typeof demoServices.$inferSelect;
export type DemoPricingRule = typeof demoPricingRules.$inferSelect;
export type DemoBooking = typeof demoBookings.$inferSelect;
export type DemoBookingStatusHistoryRow = typeof demoBookingStatusHistory.$inferSelect;
