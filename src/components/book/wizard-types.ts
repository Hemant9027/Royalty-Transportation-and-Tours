import type { ServiceKey } from "@/lib/constants";

export interface WizardFlight {
  airline: string;
  flightNumber: string;
  arrivalAirport: string;
  arrivalTime: string;
  hotelAddress: string;
}

export interface WizardTour {
  tourName: string;
  adults: string;
  children: string;
  specialRequests: string;
}

export interface WizardJourney {
  pickupLocation: string;
  destination: string;
  pickupDate: string;
  pickupTime: string;
  passengers: string;
  bags: string;
  returnTrip: boolean;
  returnDate: string;
  returnTime: string;
  additionalStops: string;
  flight: WizardFlight;
  tour: WizardTour;
}

export interface WizardCustomer {
  fullName: string;
  email: string;
  phone: string;
  whatsapp: string;
  specialInstructions: string;
  consent: boolean;
}

export interface WizardData {
  serviceKey: ServiceKey | "";
  journey: WizardJourney;
  customer: WizardCustomer;
}

export const emptyFlight: WizardFlight = {
  airline: "",
  flightNumber: "",
  arrivalAirport: "Lynden Pindling International (NAS)",
  arrivalTime: "",
  hotelAddress: "",
};

export const emptyTour: WizardTour = {
  tourName: "",
  adults: "2",
  children: "0",
  specialRequests: "",
};

export interface WizardInitialParams {
  service?: string;
  pickup?: string;
  destination?: string;
  date?: string;
  pax?: string;
  tour?: string;
}

export function initialWizardData(params: WizardInitialParams): WizardData {
  const service = params.service as ServiceKey | undefined;
  return {
    serviceKey:
      service && ["airport_arrival", "airport_departure", "hotel_transfer", "private_transport", "group_transport", "tour"].includes(service)
        ? service
        : "",
    journey: {
      pickupLocation: params.pickup ?? "",
      destination: params.destination ?? "",
      pickupDate: params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date) ? params.date : "",
      pickupTime: "",
      passengers: params.pax && /^\d+$/.test(params.pax) ? params.pax : "2",
      bags: "2",
      returnTrip: false,
      returnDate: "",
      returnTime: "",
      additionalStops: "0",
      flight: { ...emptyFlight },
      tour: { ...emptyTour, tourName: params.tour ?? "" },
    },
    customer: {
      fullName: "",
      email: "",
      phone: "",
      whatsapp: "",
      specialInstructions: "",
      consent: false,
    },
  };
}

export function buildJourneyPayload(data: WizardData) {
  const j = data.journey;
  const isTour = data.serviceKey === "tour";
  return {
    serviceKey: data.serviceKey,
    pickupLocation: j.pickupLocation.trim(),
    destination: j.destination.trim(),
    pickupDate: j.pickupDate,
    pickupTime: j.pickupTime,
    passengers: isTour ? Number(j.tour.adults || 0) + Number(j.tour.children || 0) : Number(j.passengers || 1),
    bags: Number(j.bags || 0),
    returnTrip: j.returnTrip,
    returnDate: j.returnTrip ? j.returnDate : "",
    returnTime: j.returnTrip ? j.returnTime : "",
    additionalStops: Number(j.additionalStops || 0),
    flight:
      data.serviceKey === "airport_arrival" || j.flight.flightNumber.trim()
        ? {
            airline: j.flight.airline.trim(),
            flightNumber: j.flight.flightNumber.trim(),
            arrivalAirport: j.flight.arrivalAirport.trim() || "Lynden Pindling International (NAS)",
            arrivalTime: j.flight.arrivalTime,
            hotelAddress: j.flight.hotelAddress.trim(),
          }
        : undefined,
    tour: isTour
      ? {
          tourName: j.tour.tourName,
          adults: Number(j.tour.adults || 1),
          children: Number(j.tour.children || 0),
          specialRequests: j.tour.specialRequests.trim(),
        }
      : undefined,
  };
}

export function quotePayloadFromData(data: WizardData) {
  const j = data.journey;
  return {
    serviceKey: data.serviceKey,
    pickupLocation: j.pickupLocation.trim(),
    destination: j.destination.trim(),
    passengers: data.serviceKey === "tour" ? Number(j.tour.adults || 0) + Number(j.tour.children || 0) : Number(j.passengers || 1),
    tourGuests: data.serviceKey === "tour" ? Number(j.tour.adults || 0) + Number(j.tour.children || 0) : undefined,
    tourName: data.serviceKey === "tour" ? j.tour.tourName : undefined,
    returnTrip: j.returnTrip,
    additionalStops: Number(j.additionalStops || 0),
  };
}
