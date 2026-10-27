import "server-only";
import { getDemoStore } from "./demo-store";
import { SERVICE_KEYS, type BookingStatus } from "./constants";
import { todayInNassau } from "./booking-schema";
import type { CustomerDetails, JourneyDetails } from "./booking-schema";
import type { DemoBooking } from "./models";

export const BOOKINGS_PAGE_SIZE = 15;

export interface DashboardStats {
  total: number;
  pending: number;
  awaitingConfirmation: number;
  confirmed: number;
  cancelled: number;
  completed: number;
  upcomingJourneys: number;
  sampleRecords: number;
  realDemoRequests: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const bookings = getDemoStore().bookings;
  const awaiting = new Set(["pending", "reviewing", "quote_sent"]);
  const upcoming = bookings.filter(
    (booking) =>
      booking.pickupDate >= todayInNassau() &&
      (awaiting.has(booking.status) || booking.status === "confirmed"),
  );
  const count = (status: BookingStatus) => bookings.filter((booking) => booking.status === status).length;
  const samples = bookings.filter((booking) => booking.isSample).length;
  return {
    total: bookings.length,
    pending: count("pending"),
    awaitingConfirmation: bookings.filter((booking) => awaiting.has(booking.status)).length,
    confirmed: count("confirmed"),
    cancelled: count("cancelled"),
    completed: count("completed"),
    upcomingJourneys: upcoming.length,
    sampleRecords: samples,
    realDemoRequests: bookings.length - samples,
  };
}

export interface BookingListQuery {
  q?: string;
  status?: string;
  service?: string;
  origin?: string;
  from?: string;
  to?: string;
  sort?: string;
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
  let bookings = [...getDemoStore().bookings];
  if (query.q?.trim()) {
    const q = query.q.trim().toLocaleLowerCase();
    bookings = bookings.filter(
      (booking) =>
        booking.reference.toLocaleLowerCase().includes(q) ||
        booking.customer.fullName.toLocaleLowerCase().includes(q) ||
        booking.customer.email.toLocaleLowerCase().includes(q),
    );
  }
  if (query.status && ["pending", "reviewing", "quote_sent", "confirmed", "completed", "cancelled"].includes(query.status)) {
    bookings = bookings.filter((booking) => booking.status === query.status);
  }
  if (query.service && (SERVICE_KEYS as readonly string[]).includes(query.service)) {
    bookings = bookings.filter((booking) => booking.serviceKey === query.service);
  }
  if (query.origin === "sample") bookings = bookings.filter((booking) => booking.isSample);
  if (query.origin === "live") bookings = bookings.filter((booking) => !booking.isSample);
  if (query.from && /^\d{4}-\d{2}-\d{2}$/.test(query.from)) {
    bookings = bookings.filter((booking) => booking.pickupDate >= query.from!);
  }
  if (query.to && /^\d{4}-\d{2}-\d{2}$/.test(query.to)) {
    bookings = bookings.filter((booking) => booking.pickupDate <= query.to!);
  }

  const direction = query.dir === "asc" ? 1 : -1;
  bookings.sort((a, b) => {
    const comparison =
      query.sort === "pickupDate"
        ? a.pickupDate.localeCompare(b.pickupDate)
        : query.sort === "reference"
          ? a.reference.localeCompare(b.reference)
          : a.createdAt.getTime() - b.createdAt.getTime();
    return comparison * direction || b.id.localeCompare(a.id);
  });

  const pageSize = BOOKINGS_PAGE_SIZE;
  const total = bookings.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(totalPages, Math.max(1, query.page ?? 1));
  return {
    rows: bookings.slice((page - 1) * pageSize, page * pageSize),
    total,
    page,
    pageSize,
    totalPages,
  };
}

export async function recentBookings(limit = 6): Promise<DemoBooking[]> {
  return [...getDemoStore().bookings]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit);
}

export async function upcomingJourneys(limit = 6): Promise<DemoBooking[]> {
  return [...getDemoStore().bookings]
    .filter(
      (booking) =>
        booking.pickupDate >= todayInNassau() &&
        ["pending", "reviewing", "quote_sent", "confirmed"].includes(booking.status),
    )
    .sort((a, b) => a.pickupDate.localeCompare(b.pickupDate) || a.pickupTime.localeCompare(b.pickupTime))
    .slice(0, limit);
}

export function bookingCustomer(b: DemoBooking): CustomerDetails {
  return b.customer;
}

export function bookingJourney(b: DemoBooking): JourneyDetails {
  return b.journey;
}

export type { BookingStatus };
