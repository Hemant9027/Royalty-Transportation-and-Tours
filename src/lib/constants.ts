/**
 * Business facts verified against royaltytransportationandtours.com
 * (audited content) plus clearly-labelled demo-only values.
 */

export const BUSINESS = {
  name: "Royalty Transportation & Tours",
  legalName: "Royalty Transportation and Tours",
  phone: "+1 242-828-6196",
  phoneHref: "tel:+12428286196",
  whatsappHref: "https://wa.me/12428286196",
  email: "royaltytransportationandtours@yahoo.com",
  address: "Buttonwood, Pinewood Gardens, Nassau, The Bahamas",
  city: "Nassau",
  country: "The Bahamas",
  tripadvisorUrl:
    "https://www.tripadvisor.com/Attraction_Review-g147416-d25339950-Reviews-Royalty_Transportation_And_Tours-Nassau_New_Providence_Island_Bahamas.html",
  website: "https://www.royaltytransportationandtours.com/",
} as const;

export const SERVICE_KEYS = [
  "airport_arrival",
  "airport_departure",
  "hotel_transfer",
  "private_transport",
  "group_transport",
  "tour",
] as const;

export type ServiceKey = (typeof SERVICE_KEYS)[number];

export interface ServiceDef {
  key: ServiceKey;
  name: string;
  short: string;
  tagline: string;
  description: string;
}

export const SERVICES: ServiceDef[] = [
  {
    key: "airport_arrival",
    name: "Airport Arrival Transfer",
    short: "Arrival Transfer",
    tagline: "Meet & greet at NAS arrivals",
    description:
      "A greeter welcomes you outside arrivals at Lynden Pindling International Airport with a name sign, then a licensed driver takes you straight to your hotel or villa in air-conditioned comfort.",
  },
  {
    key: "airport_departure",
    name: "Airport Departure Transfer",
    short: "Departure Transfer",
    tagline: "Hotel-to-airport, on schedule",
    description:
      "Relaxed, punctual pickup from your hotel, resort, or residence to Lynden Pindling International Airport, timed around your flight.",
  },
  {
    key: "hotel_transfer",
    name: "Hotel Transfer",
    short: "Hotel Transfer",
    tagline: "Resort-to-resort moves",
    description:
      "Seamless transfers between hotels, resorts, villas, and the cruise port across Nassau and Paradise Island — including grocery and liquor-store stops on request.",
  },
  {
    key: "private_transport",
    name: "Private Transportation",
    short: "Private Rides",
    tagline: "Your own driver, your own pace",
    description:
      "A private vehicle and professional driver for dinners, shopping, beach days, or a custom itinerary built entirely around you.",
  },
  {
    key: "group_transport",
    name: "Group Transportation",
    short: "Group Transport",
    tagline: "Room for the whole party",
    description:
      "Air-conditioned vans seating up to 15 passengers with generous luggage space for weddings, family reunions, corporate groups, and cruise excursions.",
  },
  {
    key: "tour",
    name: "Nassau Tour or Experience",
    short: "Tours & Experiences",
    tagline: "The island, with a local guide",
    description:
      "Guided Nassau city tours, heritage forts, swimming pigs, catamaran sailing, and water-sport packages — in English or Spanish.",
  },
];

export function isServiceKey(v: string): v is ServiceKey {
  return (SERVICE_KEYS as readonly string[]).includes(v);
}

export function serviceName(key: ServiceKey): string {
  return SERVICES.find((s) => s.key === key)?.name ?? key;
}

/** Popular pickup / destination suggestions for the booking form. */
export const LOCATIONS = [
  "Lynden Pindling International Airport (NAS)",
  "Atlantis, Paradise Island",
  "Baha Mar Resort, Cable Beach",
  "Sandals Royal Bahamian",
  "Grand Hyatt Baha Mar",
  "RIU Palace Paradise Island",
  "Warwick Paradise Island",
  "Margaritaville Beach Resort",
  "British Colonial Nassau",
  "Downtown Nassau / Straw Market",
  "Prince George Wharf (Cruise Port)",
  "Paradise Island",
  "Cable Beach",
  "Albany, New Providence",
  "Palm Cay",
  "Old Fort Bay",
] as const;

export interface TourDef {
  name: string;
  blurb: string;
  duration: string;
  publishedPrice?: number; // USD whole dollars, only when published on the business website
  source?: string;
}

export const TOURS: TourDef[] = [
  {
    name: "Bahamas Water Sports Adventure Package",
    blurb:
      "Snorkelling, swimming with the famous pigs, jet ski, paddle boarding, banana boat, beach chairs and umbrellas, soft drinks, rum punch & light snacks.",
    duration: "Full day",
    publishedPrice: 125,
    source: "Published on the business website ($125 per person)",
  },
  {
    name: "Nassau Charm & Beauty City Tour",
    blurb:
      "Rawson & Parliament Squares, the Supreme Court, Senate Chambers, and a guided visit to John Watling's Distillery with a sample tasting.",
    duration: "Approx. 2–3 hours",
  },
  {
    name: "The Forts Heritage Tour",
    blurb:
      "Fort Charlotte, Fort Fincastle & the Queen's Staircase, and Fort Montagu — 18th-century Nassau with live reenactments on Wednesdays & Fridays.",
    duration: "Approx. 2–3 hours",
  },
  {
    name: "Ardastra Gardens & Wildlife",
    blurb:
      "Five and a half acres of tropical gardens with over 50 species — home of the world-famous marching flamingos.",
    duration: "Approx. 2 hours",
  },
  {
    name: "Swimming with the Pigs (Exuma Day Trip)",
    blurb:
      "Multi-island speedboat adventure: iguanas, the famous swimming pigs, sharks, lunch at Staniel Cay, and a sand-bar stop with snorkelling.",
    duration: "Full day",
  },
  {
    name: "Atlantis Aquaventure Day",
    blurb:
      "The Caribbean's largest water-themed park — river rapids, seven-storey slides, water coasters, pools and beach access at Atlantis.",
    duration: "Full day",
  },
  {
    name: "Discover Atlantis",
    blurb:
      "Explore the Dig — a replica archaeological excavation — and Predator Lagoon's sharks, barracudas and deep-sea creatures.",
    duration: "Half day",
  },
  {
    name: "Flying Cloud Catamaran Sail",
    blurb:
      "Half or full day aboard a 57-foot catamaran to Rose Island: shallow-reef snorkelling, gear, tropical drinks and dry snacks included.",
    duration: "Half / full day",
  },
  {
    name: "Deep Sea Fishing",
    blurb:
      "Half-day trips (full day on request) with an experienced captain and mate — bait and tackle included, six guests per boat.",
    duration: "Half day",
  },
  {
    name: "Island Total Package",
    blurb:
      "Narrated harbour cruise to a private island — swim, snorkel, then a Bahamian lunch of peas & rice, BBQ chicken, fruit or rum punch.",
    duration: "Full day",
  },
  {
    name: "Snorkel & Scuba Excursion",
    blurb:
      "Underwater discovery around Lyford Cay, Nassau & Paradise Island — daily trips, round-trip transportation included.",
    duration: "Half day",
  },
];

export const BOOKING_STATUSES = [
  "pending",
  "reviewing",
  "quote_sent",
  "confirmed",
  "completed",
  "cancelled",
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const STATUS_META: Record<
  BookingStatus,
  { label: string; tone: "amber" | "sky" | "teal" | "navy" | "green" | "rose" }
> = {
  pending: { label: "Pending", tone: "amber" },
  reviewing: { label: "Reviewing", tone: "sky" },
  quote_sent: { label: "Quote Sent", tone: "teal" },
  confirmed: { label: "Confirmed", tone: "green" },
  completed: { label: "Completed", tone: "navy" },
  cancelled: { label: "Cancelled", tone: "rose" },
};

export const DEMO_TAG = "Demo environment — requests are not live reservations.";
