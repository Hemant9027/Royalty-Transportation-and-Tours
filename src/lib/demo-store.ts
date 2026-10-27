import "server-only";
import crypto from "node:crypto";
import { SERVICES } from "./constants";
import type {
  DemoAdminSession,
  DemoBooking,
  DemoBookingStatusHistoryRow,
  DemoPricingRule,
  DemoService,
} from "./models";

interface DemoStore {
  bookings: DemoBooking[];
  history: DemoBookingStatusHistoryRow[];
  pricingRules: DemoPricingRule[];
  services: DemoService[];
  sessions: Map<string, DemoAdminSession>;
}

const globalForDemoStore = globalThis as typeof globalThis & {
  __royaltyDemoStore?: DemoStore;
};

function createStore(): DemoStore {
  const now = new Date();
  return {
    bookings: [],
    history: [],
    services: SERVICES.map((service, index) => ({
      id: index + 1,
      key: service.key,
      name: service.name,
      tagline: service.tagline,
      description: service.description,
      icon: service.key,
      isActive: true,
      sortOrder: index,
      createdAt: now,
    })),
    pricingRules: [
      {
        id: 1,
        name: "SUV airport transfer — starting fare",
        ruleType: "fixed_route",
        serviceKey: "airport_arrival",
        matchFrom: "airport",
        matchTo: "*",
        unitAmountCents: 9900,
        multiplierBps: null,
        isActive: true,
        source: "published",
        notes: "Published starting price; route scope requires owner verification.",
        createdAt: now,
      },
      {
        id: 2,
        name: "Water Sports Adventure Package",
        ruleType: "per_person",
        serviceKey: "tour",
        matchFrom: "Water Sports",
        matchTo: null,
        unitAmountCents: 12500,
        multiplierBps: null,
        isActive: true,
        source: "published",
        notes: "Published price; verify inclusions and child policy before use.",
        createdAt: now,
      },
      {
        id: 3,
        name: "Airport departure — hotel zone (demo)",
        ruleType: "fixed_route",
        serviceKey: "airport_departure",
        matchFrom: "*",
        matchTo: "airport",
        unitAmountCents: 9900,
        multiplierBps: null,
        isActive: true,
        source: "demo",
        notes: "Simulated sample fare; replace with verified zone fares.",
        createdAt: now,
      },
      {
        id: 4,
        name: "Group transfer — per vehicle (demo)",
        ruleType: "per_vehicle",
        serviceKey: "group_transport",
        matchFrom: null,
        matchTo: null,
        unitAmountCents: 15000,
        multiplierBps: null,
        isActive: true,
        source: "demo",
        notes: "Simulated sample rule; requires owner verification.",
        createdAt: now,
      },
      {
        id: 5,
        name: "Return journey multiplier (demo)",
        ruleType: "return_multiplier",
        serviceKey: null,
        matchFrom: null,
        matchTo: null,
        unitAmountCents: null,
        multiplierBps: 18000,
        isActive: true,
        source: "demo",
        notes: "Simulated 1.8× return-trip multiplier.",
        createdAt: now,
      },
      {
        id: 6,
        name: "Additional stop (demo)",
        ruleType: "additional_stop",
        serviceKey: null,
        matchFrom: null,
        matchTo: null,
        unitAmountCents: 2500,
        multiplierBps: null,
        isActive: true,
        source: "demo",
        notes: "Simulated per-stop fee.",
        createdAt: now,
      },
      {
        id: 7,
        name: "After-hours surcharge 10pm–5am (demo, disabled)",
        ruleType: "surcharge",
        serviceKey: null,
        matchFrom: null,
        matchTo: null,
        unitAmountCents: 2000,
        multiplierBps: null,
        isActive: false,
        source: "demo",
        notes: "Disabled by default.",
        createdAt: now,
      },
    ],
    sessions: new Map(),
  };
}

export function getDemoStore(): DemoStore {
  globalForDemoStore.__royaltyDemoStore ??= createStore();
  return globalForDemoStore.__royaltyDemoStore;
}

export function createDemoId(): string {
  return crypto.randomUUID();
}

export function nextDemoRecordId(records: { id: number }[]): number {
  return records.reduce((max, record) => Math.max(max, record.id), 0) + 1;
}
