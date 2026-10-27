import type { CustomerDetails, JourneyDetails } from "./booking-schema";
import type { BookingStatus } from "./constants";

export interface DemoService {
  id: number;
  key: string;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
}

export interface DemoPricingRule {
  id: number;
  name: string;
  ruleType: string;
  serviceKey: string | null;
  matchFrom: string | null;
  matchTo: string | null;
  unitAmountCents: number | null;
  multiplierBps: number | null;
  isActive: boolean;
  source: string;
  notes: string | null;
  createdAt: Date;
}

export interface DemoBooking {
  id: string;
  reference: string;
  serviceKey: string;
  serviceLabel: string;
  pickupDate: string;
  pickupTime: string;
  journey: JourneyDetails;
  customer: CustomerDetails;
  estimatedCents: number | null;
  currency: string;
  priceBreakdown: { lines: { label: string; amountCents: number }[]; isDemoEstimate: true } | null;
  isSample: boolean;
  status: BookingStatus;
  internalNotes: string | null;
  notificationStatus: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DemoBookingStatusHistoryRow {
  id: number;
  bookingId: string;
  fromStatus: BookingStatus | null;
  toStatus: BookingStatus;
  changedBy: string;
  note: string | null;
  createdAt: Date;
}

export interface DemoAdminSession {
  email: string;
  expiresAt: number;
}
