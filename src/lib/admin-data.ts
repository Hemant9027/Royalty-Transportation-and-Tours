import "server-only";
import { and, asc, desc, count, eq, gte, ilike, or, sql, inArray } from "drizzle-orm";
import { db } from "@/db";
import { demoBookings, type DemoBooking } from "@/db/schema";
import { SERVICE_KEYS, type BookingStatus } from "./constants";
import { todayInNassau } from "./booking-schema";
import type { CustomerDetails, JourneyDetails } from "./booking-schema";

export const BOOKINGS_PAGE_SIZE = 15;

export interface DashboardStats {
  total: number;
  pending: number;
  awaitingConfirmation: number; // pending + reviewing + quote_sent
  confirmed: number;
  cancelled: number;
  completed: number;
  upcomingJourneys: number;
  sampleRecords: number;
  realDemoRequests: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const rows = await db
    .select({
      total: count(),
      pending: sql<number>`count(*) filter (where ${demoBookings.status} = 'pending')`,
      awaiting: sql<number>`count(*) filter (where ${demoBookings.status} in ('pending','reviewing','quote_sent'))`,
      confirmed: sql<number>`count(*) filter (where ${demoBookings.status} = 'confirmed')`,
      cancelled: sql<number>`count(*) filter (where ${demoBookings.status} = 'cancelled')`,
      completed: sql<number>`count(*) filter (where ${demoBookings.status} = 'completed')`,
      upcoming: sql<number>`count(*) filter (where ${demoBookings.pickupDate} >= ${todayInNassau()} and ${demoBookings.status} in ('pending','reviewing','quote_sent','confirmed'))`,
      samples: sql<number>`count(*) filter (where ${demoBookings.isSample})`,
    })
    .from(demoBookings);
  const r = rows[0]!;
  return {
    total: Number(r.total),
    pending: Number(r.pending),
    awaitingConfirmation: Number(r.awaiting),
    confirmed: Number(r.confirmed),
    cancelled: Number(r.cancelled),
    completed: Number(r.completed),
    upcomingJourneys: Number(r.upcoming),
    sampleRecords: Number(r.samples),
    realDemoRequests: Number(r.total) - Number(r.samples),
  };
}

export interface BookingListQuery {
  q?: string;
  status?: string;
  service?: string;
  origin?: string; // "sample" | "live"
  from?: string; // pickup date from YYYY-MM-DD
  to?: string;
  sort?: string; // createdAt | pickupDate | reference
  dir?: "asc" | "desc";
  page?: number;
}

export interface BookingListResult {
  rows: DemoBooking[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function listBookings(query: BookingListQuery): Promise<BookingListResult> {
  const conditions = [];

  if (query.q?.trim()) {
    const q = query.q.trim();
    const like = `%${q.replaceAll("%", "\\%").replaceAll("_", "\\_")}%`;
    conditions.push(
      or(
        ilike(demoBookings.reference, like),
        sql`${demoBookings.customer}->>'fullName' ilike ${like}`,
        sql`${demoBookings.customer}->>'email' ilike ${like}`,
      )!,
    );
  }
  if (query.status && ["pending", "reviewing", "quote_sent", "confirmed", "completed", "cancelled"].includes(query.status)) {
    conditions.push(eq(demoBookings.status, query.status));
  }
  if (query.service && (SERVICE_KEYS as readonly string[]).includes(query.service)) {
    conditions.push(eq(demoBookings.serviceKey, query.service));
  }
  if (query.origin === "sample") conditions.push(eq(demoBookings.isSample, true));
  if (query.origin === "live") conditions.push(eq(demoBookings.isSample, false));
  if (query.from && /^\d{4}-\d{2}-\d{2}$/.test(query.from)) {
    conditions.push(gte(demoBookings.pickupDate, query.from));
  }
  if (query.to && /^\d{4}-\d{2}-\d{2}$/.test(query.to)) {
    conditions.push(sql`${demoBookings.pickupDate} <= ${query.to}`);
  }

  const where = conditions.length ? and(...conditions) : undefined;

  const sortCol =
    query.sort === "pickupDate"
      ? demoBookings.pickupDate
      : query.sort === "reference"
        ? demoBookings.reference
        : demoBookings.createdAt;
  const order = query.dir === "asc" ? asc(sortCol) : desc(sortCol);

  const page = Math.max(1, query.page ?? 1);
  const pageSize = BOOKINGS_PAGE_SIZE;

  const [{ total }] = await db.select({ total: count() }).from(demoBookings).where(where);
  const rows = await db
    .select()
    .from(demoBookings)
    .where(where)
    .orderBy(order, desc(demoBookings.id))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  const totalNum = Number(total);
  return {
    rows,
    total: totalNum,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(totalNum / pageSize)),
  };
}

export async function recentBookings(limit = 6): Promise<DemoBooking[]> {
  return db.select().from(demoBookings).orderBy(desc(demoBookings.createdAt)).limit(limit);
}

export async function upcomingJourneys(limit = 6): Promise<DemoBooking[]> {
  return db
    .select()
    .from(demoBookings)
    .where(
      and(
        gte(demoBookings.pickupDate, todayInNassau()),
        inArray(demoBookings.status, ["pending", "reviewing", "quote_sent", "confirmed"]),
      ),
    )
    .orderBy(asc(demoBookings.pickupDate), asc(demoBookings.pickupTime))
    .limit(limit);
}

export function bookingCustomer(b: DemoBooking): CustomerDetails {
  return b.customer as CustomerDetails;
}

export function bookingJourney(b: DemoBooking): JourneyDetails {
  return b.journey as JourneyDetails;
}

export type { BookingStatus };
