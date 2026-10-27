import type { DemoPricingRule } from "./models";
import type { JourneyDetails } from "./booking-schema";

/**
 * Demo pricing engine.
 *
 * Rules live in the `demo_pricing_rules` table (demo configuration ONLY — these
 * are not the operator's live rates). Engine behaviour:
 *
 *  1. Find candidate "base" rules in priority order:
 *       fixed_route → per_person → per_vehicle
 *     Service-specific rules outrank global rules. Only ONE base rule applies.
 *  2. Apply additional-stop fees and surcharges (all matching, active rules).
 *  3. If a return multiplier rule applies and the journey is a return trip,
 *     the base is multiplied (extras are not multiplied).
 *  4. No base rule matched → return null → the UI shows "Request a Quote"
 *     instead of inventing a price.
 */

export interface PriceLine {
  label: string;
  amountCents: number;
}

export interface DemoQuote {
  totalCents: number;
  currency: "USD";
  lines: PriceLine[];
  matchedRuleIds: number[];
  /** true whenever ANY overlaying part of the quote is simulated demo configuration */
  isDemoEstimate: boolean;
  containsPublishedRate: boolean;
}

const TYPE_PRIORITY: Record<string, number> = {
  fixed_route: 0,
  per_person: 1,
  per_vehicle: 2,
};

function norm(v: string | null | undefined): string {
  return (v ?? "").toLowerCase().replace(/\s+/g, " ").trim();
}

function locationMatches(keyword: string, location: string): boolean {
  if (keyword === "*") return true;
  const k = norm(keyword);
  const l = norm(location);
  if (!l) return false;
  // airport aliases so "NAS" / "Lynden Pindling" / "airport" rules behave sensibly
  const AIRPORT = ["airport", "nas", "lynden pindling", "lpia"];
  if (AIRPORT.includes(k)) return AIRPORT.some((a) => l.includes(a));
  return l.includes(k);
}

function fixedRouteMatches(rule: DemoPricingRule, pickup: string, destination: string): boolean {
  const from = rule.matchFrom ?? "";
  const to = rule.matchTo ?? "";
  const outbound = locationMatches(from, pickup) && locationMatches(to, destination);
  const inbound = locationMatches(from, destination) && locationMatches(to, pickup);
  return outbound || inbound;
}

export interface PricingContext {
  serviceKey: string;
  pickupLocation?: string;
  destination?: string;
  passengers: number;
  tourGuests?: number;
  returnTrip: boolean;
  additionalStops: number;
  tourName?: string;
}

export function evaluateDemoPrice(ctx: PricingContext, rules: DemoPricingRule[]): DemoQuote | null {
  const active = rules.filter((r) => r.isActive);
  const applies = (r: DemoPricingRule) => r.serviceKey === null || r.serviceKey === ctx.serviceKey;

  // 1. Base rule
  const baseCandidates = active
    .filter((r) => applies(r) && ["fixed_route", "per_person", "per_vehicle"].includes(r.ruleType))
    .filter((r) => {
      if (r.ruleType === "fixed_route") {
        return fixedRouteMatches(r, ctx.pickupLocation ?? "", ctx.destination ?? "");
      }
      // Tour-scoped rules may target a specific experience via matchFrom
      if (ctx.serviceKey === "tour" && r.matchFrom) {
        return norm(ctx.tourName).includes(norm(r.matchFrom));
      }
      return true;
    })
    .sort((a, b) => {
      const sa = a.serviceKey === ctx.serviceKey ? 0 : 1;
      const sb = b.serviceKey === ctx.serviceKey ? 0 : 1;
      if (sa !== sb) return sa - sb;
      const ta = TYPE_PRIORITY[a.ruleType] ?? 9;
      const tb = TYPE_PRIORITY[b.ruleType] ?? 9;
      if (ta !== tb) return ta - tb;
      return a.id - b.id;
    });

  const base = baseCandidates[0];
  if (!base || base.unitAmountCents == null) return null;

  const lines: PriceLine[] = [];
  const matchedRuleIds: number[] = [base.id];
  let containsPublished = base.source === "published";
  let baseTotal = base.unitAmountCents;

  if (base.ruleType === "per_person") {
    const guests = ctx.serviceKey === "tour" ? (ctx.tourGuests ?? ctx.passengers) : ctx.passengers;
    baseTotal = base.unitAmountCents * guests;
    lines.push({
      label: `${base.name} — ${guests} guest${guests === 1 ? "" : "s"}`,
      amountCents: baseTotal,
    });
  } else {
    lines.push({ label: base.name, amountCents: baseTotal });
  }

  // 2. Extras
  let extras = 0;
  for (const rule of active) {
    if (!applies(rule) || rule.unitAmountCents == null) continue;
    if (rule.ruleType === "additional_stop" && ctx.additionalStops > 0) {
      const amt = rule.unitAmountCents * ctx.additionalStops;
      extras += amt;
      matchedRuleIds.push(rule.id);
      containsPublished = containsPublished || rule.source === "published";
      lines.push({
        label: `${rule.name} × ${ctx.additionalStops}`,
        amountCents: amt,
      });
    }
    if (rule.ruleType === "surcharge") {
      extras += rule.unitAmountCents;
      matchedRuleIds.push(rule.id);
      containsPublished = containsPublished || rule.source === "published";
      lines.push({ label: rule.name, amountCents: rule.unitAmountCents });
    }
  }

  // 3. Return multiplier (applies to base only)
  let returnDelta = 0;
  if (ctx.returnTrip) {
    const mult = active.find((r) => applies(r) && r.ruleType === "return_multiplier" && r.multiplierBps != null);
    if (mult && mult.multiplierBps != null) {
      const multiplied = Math.round((baseTotal * mult.multiplierBps) / 10000);
      returnDelta = multiplied - baseTotal;
      matchedRuleIds.push(mult.id);
      containsPublished = containsPublished || mult.source === "published";
      lines.push({
        label: `Return journey (${(mult.multiplierBps / 10000).toFixed(2)}× base)`,
        amountCents: returnDelta,
      });
    }
  }

  const totalCents = baseTotal + extras + returnDelta;

  return {
    totalCents,
    currency: "USD",
    lines,
    matchedRuleIds,
    isDemoEstimate: true,
    containsPublishedRate: containsPublished,
  };
}

export function pricingContextFromJourney(j: JourneyDetails): PricingContext {
  return {
    serviceKey: j.serviceKey,
    pickupLocation: j.pickupLocation ?? "",
    destination: j.destination ?? "",
    passengers: j.passengers,
    tourGuests: j.tour ? j.tour.adults + j.tour.children : undefined,
    returnTrip: j.returnTrip,
    additionalStops: j.additionalStops,
    tourName: j.tour?.tourName,
  };
}
