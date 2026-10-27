"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  Bus,
  Calendar,
  Car,
  Check,
  Compass,
  FlaskConical,
  Home,
  Loader2,
  MapPin,
  Pencil,
  PlaneLanding,
  PlaneTakeoff,
  ReceiptText,
  ShieldCheck,
} from "lucide-react";
import { SERVICES, TOURS, LOCATIONS, STATUS_META, type ServiceKey } from "@/lib/constants";
import { journeySchema, customerSchema, todayInNassau } from "@/lib/booking-schema";
import { formatDate, formatMoney, formatTime, cx } from "@/lib/format";
import { Field, inputClass, buttonClass, Badge, Eyebrow } from "@/components/ui";
import {
  initialWizardData,
  buildJourneyPayload,
  quotePayloadFromData,
  type WizardData,
  type WizardInitialParams,
} from "./wizard-types";

const SERVICE_ICONS: Record<ServiceKey, typeof PlaneLanding> = {
  airport_arrival: PlaneLanding,
  airport_departure: PlaneTakeoff,
  hotel_transfer: Building2,
  private_transport: Car,
  group_transport: Bus,
  tour: Compass,
};

const STEPS = ["Service", "Journey", "Your details", "Review", "Confirmed"] as const;

interface QuoteState {
  status: "idle" | "loading" | "ok" | "none" | "error";
  totalCents?: number;
  lines?: { label: string; amountCents: number }[];
}

export function BookingWizard({ initial }: { initial: WizardInitialParams }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<WizardData>(() => initialWizardData(initial));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [reference, setReference] = useState("");
  const [quote, setQuote] = useState<QuoteState>({ status: "idle" });
  const topRef = useRef<HTMLDivElement>(null);

  const serviceDef = data.serviceKey ? SERVICES.find((s) => s.key === data.serviceKey) : undefined;
  const isTour = data.serviceKey === "tour";
  const isArrival = data.serviceKey === "airport_arrival";

  function scrollTop() {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function setJourney(patch: Partial<WizardData["journey"]>) {
    setData((d) => ({ ...d, journey: { ...d.journey, ...patch } }));
  }
  function setFlight(patch: Partial<WizardData["journey"]["flight"]>) {
    setData((d) => ({ ...d, journey: { ...d.journey, flight: { ...d.journey.flight, ...patch } } }));
  }
  function setTour(patch: Partial<WizardData["journey"]["tour"]>) {
    setData((d) => ({ ...d, journey: { ...d.journey, tour: { ...d.journey.tour, ...patch } } }));
  }
  function setCustomer(patch: Partial<WizardData["customer"]>) {
    setData((d) => ({ ...d, customer: { ...d.customer, ...patch } }));
  }

  const err = (k: string) => errors[k];

  function validateJourney(): boolean {
    const payload = buildJourneyPayload(data);
    const res = journeySchema.safeParse(payload);
    if (res.success) {
      setErrors({});
      return true;
    }
    const fe: Record<string, string> = {};
    for (const issue of res.error.issues) {
      const key = issue.path.join(".") || "form";
      if (!fe[key]) fe[key] = issue.message;
    }
    setErrors(fe);
    return false;
  }

  function validateCustomer(): boolean {
    const res = customerSchema.safeParse(data.customer);
    if (res.success) {
      setErrors({});
      return true;
    }
    const fe: Record<string, string> = {};
    for (const issue of res.error.issues) {
      const key = issue.path.join(".") || "form";
      if (!fe[key]) fe[key] = issue.message;
    }
    setErrors(fe);
    return false;
  }

  function next() {
    if (step === 0 && !data.serviceKey) {
      setErrors({ serviceKey: "Choose a service to continue" });
      return;
    }
    if (step === 1 && !validateJourney()) {
      scrollTop();
      return;
    }
    if (step === 2 && !validateCustomer()) {
      scrollTop();
      return;
    }
    setErrors({});
    setStep((s) => s + 1);
    scrollTop();
  }

  function back() {
    setErrors({});
    setStep((s) => Math.max(0, s - 1));
    scrollTop();
  }

  // -- demo quote preview at the review step --------------------------------
  useEffect(() => {
    if (step !== 3 || !data.serviceKey) return;
    let cancelled = false;
    setQuote({ status: "loading" });
    fetch("/api/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quotePayloadFromData(data)),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("quote failed");
        return res.json();
      })
      .then((body) => {
        if (cancelled) return;
        if (body.quote) {
          setQuote({ status: "ok", totalCents: body.quote.totalCents, lines: body.quote.lines });
        } else {
          setQuote({ status: "none" });
        }
      })
      .catch(() => !cancelled && setQuote({ status: "error" }));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  async function submit() {
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ journey: buildJourneyPayload(data), customer: data.customer }),
      });
      const body = await res.json();
      if (res.status === 400 && body.fieldErrors) {
        const serverErrors = body.fieldErrors as Record<string, string>;
        const normalized: Record<string, string> = {};
        let journeyErr = false;
        for (const [key, msg] of Object.entries(serverErrors)) {
          if (key.startsWith("journey.")) {
            journeyErr = true;
            normalized[key.slice("journey.".length)] = msg;
          } else if (key.startsWith("customer.")) {
            normalized[key.slice("customer.".length)] = msg;
          } else {
            normalized[key] = msg;
          }
        }
        setErrors(normalized);
        setSubmitError("Some details need attention — review the highlighted fields.");
        setStep(journeyErr ? 1 : 2);
        scrollTop();
        return;
      }
      if (!res.ok || !body.ok) {
        setSubmitError(body.error ?? "Something went wrong. Please try again.");
        return;
      }
      setReference(body.reference);
      setStep(4);
      scrollTop();
    } catch {
      setSubmitError("Network problem. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const minDate = useMemo(() => todayInNassau(), []);

  return (
    <div ref={topRef} className="mx-auto max-w-5xl">
      {/* Progress */}
      <ol className="mb-8 flex items-center gap-1 sm:gap-2" aria-label="Booking progress">
        {STEPS.map((label, i) => {
          const done = i < step;
          const current = i === step;
          return (
            <li key={label} className="flex flex-1 items-center gap-2 last:flex-none">
              <span
                className={cx(
                  "grid size-7 shrink-0 place-items-center rounded-full text-[11.5px] font-bold transition-colors sm:size-8",
                  done
                    ? "bg-aqua-500 text-navy-950"
                    : current
                      ? "bg-navy-950 text-white ring-4 ring-navy-950/10"
                      : "bg-white text-navy-400 ring-1 ring-navy-900/12",
                )}
                aria-current={current ? "step" : undefined}
              >
                {done ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
              </span>
              <span
                className={cx(
                  "hidden text-[11.5px] font-bold uppercase tracking-[0.1em] sm:block",
                  current ? "text-navy-950" : "text-navy-400",
                )}
              >
                {label}
              </span>
              {i < STEPS.length - 1 && <span className={cx("h-px flex-1", done ? "bg-aqua-500" : "bg-navy-900/12")} />}
            </li>
          );
        })}
      </ol>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="rounded-2xl border border-navy-900/10 bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
            {step === 0 && (
              <StepService
                selected={data.serviceKey}
                error={err("serviceKey")}
                onSelect={(k) => {
                  setData((d) => ({ ...d, serviceKey: k }));
                  setErrors({});
                }}
              />
            )}

            {step === 1 && data.serviceKey && (
              <StepJourney
                data={data}
                err={err}
                isTour={isTour}
                isArrival={isArrival}
                minDate={minDate}
                setJourney={setJourney}
                setFlight={setFlight}
                setTour={setTour}
                serviceLabel={serviceDef?.name ?? ""}
              />
            )}

            {step === 2 && <StepCustomer data={data} err={err} setCustomer={setCustomer} />}

            {step === 3 && (
              <StepReview
                data={data}
                quote={quote}
                submitting={submitting}
                submitError={submitError}
                onEdit={setStep}
                onSubmit={submit}
              />
            )}

            {step === 4 && <StepConfirmation reference={reference} data={data} />}

            {/* Nav buttons */}
            {step < 3 && (
              <div className="mt-8 flex items-center justify-between border-t border-navy-900/10 pt-6">
                <button
                  type="button"
                  onClick={back}
                  disabled={step === 0}
                  className={cx(buttonClass("ghost", "md"), step === 0 && "invisible")}
                >
                  <ArrowLeft className="size-4" /> Back
                </button>
                <button type="button" onClick={next} className={buttonClass("primary", "lg")}>
                  Continue <ArrowRight className="size-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Live summary rail */}
        <aside className="lg:sticky lg:top-24 lg:self-start" aria-label="Request summary">
          <SummaryRail data={data} quote={quote} step={step} />
        </aside>
      </div>
    </div>
  );
}

/* ============================== STEP 1 ============================== */

function StepService({
  selected,
  error,
  onSelect,
}: {
  selected: ServiceKey | "";
  error?: string;
  onSelect: (k: ServiceKey) => void;
}) {
  return (
    <div>
      <Eyebrow>Step 1</Eyebrow>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-navy-950">Choose your service</h1>
      <p className="mt-2 text-[14px] text-navy-600">
        Every request is reviewed by the Royalty team before anything is confirmed.
      </p>
      <div role="radiogroup" aria-label="Service type" className="mt-7 grid gap-4 sm:grid-cols-2">
        {SERVICES.map((s) => {
          const Icon = SERVICE_ICONS[s.key];
          const active = selected === s.key;
          return (
            <button
              key={s.key}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onSelect(s.key)}
              className={cx(
                "group flex items-start gap-4 rounded-2xl border p-5 text-left transition-all",
                active
                  ? "border-aqua-500 bg-aqua-500/[0.06] ring-2 ring-aqua-500/30"
                  : "border-navy-900/12 bg-white hover:border-navy-900/30 hover:bg-navy-50/50",
              )}
            >
              <span
                className={cx(
                  "grid size-11 shrink-0 place-items-center rounded-xl transition",
                  active ? "bg-aqua-500 text-navy-950" : "bg-navy-900/6 text-navy-700 group-hover:bg-navy-900/10",
                )}
              >
                <Icon className="size-5" />
              </span>
              <span>
                <span className="block text-[15px] font-bold tracking-tight text-navy-950">{s.name}</span>
                <span className="mt-1 block text-[12.5px] font-medium text-navy-500">{s.tagline}</span>
              </span>
              {active && <Check className="ml-auto size-5 shrink-0 text-aqua-600" strokeWidth={3} />}
            </button>
          );
        })}
      </div>
      {error && (
        <p role="alert" className="mt-4 flex items-center gap-2 text-[13px] font-semibold text-rose-600">
          <AlertTriangle className="size-4" /> {error}
        </p>
      )}
    </div>
  );
}

/* ============================== STEP 2 ============================== */

function StepJourney({
  data,
  err,
  isTour,
  isArrival,
  minDate,
  setJourney,
  setFlight,
  setTour,
  serviceLabel,
}: {
  data: WizardData;
  err: (k: string) => string | undefined;
  isTour: boolean;
  isArrival: boolean;
  minDate: string;
  serviceLabel: string;
  setJourney: (p: Partial<WizardData["journey"]>) => void;
  setFlight: (p: Partial<WizardData["journey"]["flight"]>) => void;
  setTour: (p: Partial<WizardData["journey"]["tour"]>) => void;
}) {
  const j = data.journey;
  const transferRoute = j.returnTrip || ["airport_departure", "hotel_transfer", "private_transport", "group_transport"].includes(String(data.serviceKey));

  return (
    <div>
      <Eyebrow>Step 2 — {serviceLabel}</Eyebrow>
      <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-navy-950">Journey details</h2>

      {/* Route */}
      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <Field label={isTour ? "Pickup hotel / meeting point" : "Pickup location"} required error={err("pickupLocation")}>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-navy-300" />
            <input
              value={j.pickupLocation}
              onChange={(e) => setJourney({ pickupLocation: e.target.value })}
              list="book-locations"
              placeholder={isTour ? "e.g. Baha Mar Resort, Cable Beach" : "e.g. Lynden Pindling Airport (NAS)"}
              className={cx(inputClass, "pl-9")}
              aria-invalid={Boolean(err("pickupLocation"))}
            />
          </div>
        </Field>

        {!isTour && (
          <Field label="Destination" required error={err("destination")}>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-navy-300" />
              <input
                value={j.destination}
                onChange={(e) => setJourney({ destination: e.target.value })}
                list="book-locations"
                placeholder="e.g. Atlantis, Paradise Island"
                className={cx(inputClass, "pl-9")}
                aria-invalid={Boolean(err("destination"))}
              />
            </div>
          </Field>
        )}
      </div>

      {/* Flight block for airport arrivals */}
      {isArrival && (
        <fieldset className="mt-6 rounded-2xl border border-aqua-500/30 bg-aqua-500/[0.05] p-5">
          <legend className="-ml-1 flex items-center gap-2 rounded-lg bg-white px-3 py-1 text-[12px] font-bold uppercase tracking-[0.14em] text-aqua-700 ring-1 ring-aqua-500/30">
            <PlaneLanding className="size-3.5" /> Arrival flight — we track it for you
          </legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Airline" required error={err("flight.airline")}>
              <input
                value={j.flight.airline}
                onChange={(e) => setFlight({ airline: e.target.value })}
                placeholder="e.g. American Airlines"
                className={inputClass}
                aria-invalid={Boolean(err("flight.airline"))}
              />
            </Field>
            <Field label="Flight number" required error={err("flight.flightNumber")}>
              <input
                value={j.flight.flightNumber}
                onChange={(e) => setFlight({ flightNumber: e.target.value.toUpperCase() })}
                placeholder="e.g. AA 1421"
                className={inputClass}
                aria-invalid={Boolean(err("flight.flightNumber"))}
              />
            </Field>
            <Field label="Arrival airport" required error={err("flight.arrivalAirport")}>
              <input
                value={j.flight.arrivalAirport}
                onChange={(e) => setFlight({ arrivalAirport: e.target.value })}
                className={inputClass}
                aria-invalid={Boolean(err("flight.arrivalAirport"))}
              />
            </Field>
            <Field label="Scheduled arrival time" required error={err("flight.arrivalTime")}>
              <input
                type="time"
                value={j.flight.arrivalTime}
                onChange={(e) => setFlight({ arrivalTime: e.target.value })}
                className={inputClass}
                aria-invalid={Boolean(err("flight.arrivalTime"))}
              />
            </Field>
            <Field
              label="Hotel / villa address"
              hint="Optional"
              error={err("flight.hotelAddress")}
              className="sm:col-span-2"
            >
              <input
                value={j.flight.hotelAddress}
                onChange={(e) => setFlight({ hotelAddress: e.target.value })}
                placeholder="Helps the greeter plan your drop-off"
                className={inputClass}
              />
            </Field>
          </div>
        </fieldset>
      )}

      {/* Tour block */}
      {isTour && (
        <fieldset className="mt-6 rounded-2xl border border-aqua-500/30 bg-aqua-500/[0.05] p-5">
          <legend className="-ml-1 flex items-center gap-2 rounded-lg bg-white px-3 py-1 text-[12px] font-bold uppercase tracking-[0.14em] text-aqua-700 ring-1 ring-aqua-500/30">
            <Compass className="size-3.5" /> Tour &amp; party
          </legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Tour or experience" required error={err("tour.tourName")} className="sm:col-span-2">
              <select
                value={j.tour.tourName}
                onChange={(e) => setTour({ tourName: e.target.value })}
                className={inputClass}
                aria-invalid={Boolean(err("tour.tourName"))}
              >
                <option value="">Select an experience…</option>
                {TOURS.map((t) => (
                  <option key={t.name} value={t.name}>
                    {t.name}
                    {t.publishedPrice ? ` — $${t.publishedPrice}/person (published)` : ""}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Adults" required error={err("tour.adults")}>
              <input
                type="number"
                min={1}
                max={50}
                value={j.tour.adults}
                onChange={(e) => setTour({ adults: e.target.value })}
                className={inputClass}
                aria-invalid={Boolean(err("tour.adults"))}
              />
            </Field>
            <Field label="Children (0–15)" error={err("tour.children")} hint="Under 15s ride with a guardian">
              <input
                type="number"
                min={0}
                max={50}
                value={j.tour.children}
                onChange={(e) => setTour({ children: e.target.value })}
                className={inputClass}
                aria-invalid={Boolean(err("tour.children"))}
              />
            </Field>
            <Field label="Special requests" hint="Optional" error={err("tour.specialRequests")} className="sm:col-span-2">
              <textarea
                rows={3}
                value={j.tour.specialRequests}
                onChange={(e) => setTour({ specialRequests: e.target.value })}
                placeholder="Accessibility needs, celebrations, dietary notes…"
                className={inputClass}
              />
            </Field>
          </div>
        </fieldset>
      )}

      {/* Schedule & party */}
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <Field label={isTour ? "Preferred date" : "Pickup date"} required error={err("pickupDate")}>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-navy-300" />
            <input
              type="date"
              min={minDate}
              value={j.pickupDate}
              onChange={(e) => setJourney({ pickupDate: e.target.value })}
              className={cx(inputClass, "pl-9")}
              aria-invalid={Boolean(err("pickupDate"))}
            />
          </div>
        </Field>
        <Field label={isTour ? "Preferred start time" : "Pickup time"} required error={err("pickupTime")}>
          <input
            type="time"
            value={j.pickupTime}
            onChange={(e) => setJourney({ pickupTime: e.target.value })}
            className={inputClass}
            aria-invalid={Boolean(err("pickupTime"))}
          />
        </Field>
        {!isTour && (
          <>
            <Field label="Passengers" required error={err("passengers")}>
              <input
                type="number"
                min={1}
                max={45}
                value={j.passengers}
                onChange={(e) => setJourney({ passengers: e.target.value })}
                className={inputClass}
                aria-invalid={Boolean(err("passengers"))}
              />
            </Field>
            <Field label="Bags" error={err("bags")}>
              <input
                type="number"
                min={0}
                max={45}
                value={j.bags}
                onChange={(e) => setJourney({ bags: e.target.value })}
                className={inputClass}
                aria-invalid={Boolean(err("bags"))}
              />
            </Field>
          </>
        )}
      </div>

      {/* Return trip */}
      {!isTour && (
        <div className="mt-6">
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-navy-900/12 px-4 py-3.5 transition hover:bg-navy-50/60">
            <input
              type="checkbox"
              checked={j.returnTrip}
              onChange={(e) => setJourney({ returnTrip: e.target.checked })}
              className="size-4 accent-[#159a94]"
            />
            <span className="text-[14px] font-semibold text-navy-900">Add a return journey</span>
          </label>
          {j.returnTrip && (
            <div className="mt-4 grid gap-5 rounded-xl border border-navy-900/10 bg-navy-50/50 p-5 sm:grid-cols-2">
              <Field label="Return date" required error={err("returnDate")}>
                <input
                  type="date"
                  min={j.pickupDate || minDate}
                  value={j.returnDate}
                  onChange={(e) => setJourney({ returnDate: e.target.value })}
                  className={inputClass}
                  aria-invalid={Boolean(err("returnDate"))}
                />
              </Field>
              <Field label="Return pickup time" required error={err("returnTime")}>
                <input
                  type="time"
                  value={j.returnTime}
                  onChange={(e) => setJourney({ returnTime: e.target.value })}
                  className={inputClass}
                  aria-invalid={Boolean(err("returnTime"))}
                />
              </Field>
            </div>
          )}
        </div>
      )}

      {/* Additional stops (pricing-aware) */}
      {transferRoute && !isTour && (
        <div className="mt-6 sm:max-w-xs">
          <Field label="Additional stops" hint="Grocery / liquor store, ATM…">
            <select
              value={j.additionalStops}
              onChange={(e) => setJourney({ additionalStops: e.target.value })}
              className={inputClass}
            >
              {[0, 1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n === 0 ? "No extra stops" : `${n} stop${n > 1 ? "s" : ""}`}
                </option>
              ))}
            </select>
          </Field>
        </div>
      )}

      <datalist id="book-locations">
        {LOCATIONS.map((l) => (
          <option key={l} value={l} />
        ))}
      </datalist>
    </div>
  );
}

/* ============================== STEP 3 ============================== */

function StepCustomer({
  data,
  err,
  setCustomer,
}: {
  data: WizardData;
  err: (k: string) => string | undefined;
  setCustomer: (p: Partial<WizardData["customer"]>) => void;
}) {
  const c = data.customer;
  return (
    <div>
      <Eyebrow>Step 3</Eyebrow>
      <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-navy-950">Your details</h2>
      <p className="mt-2 text-[14px] text-navy-600">
        The team uses these to reach you about this request only.
      </p>
      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <Field label="Full name (lead passenger)" required error={err("fullName")}>
          <input
            value={c.fullName}
            onChange={(e) => setCustomer({ fullName: e.target.value })}
            placeholder="e.g. Jordan Miller"
            autoComplete="name"
            className={inputClass}
            aria-invalid={Boolean(err("fullName"))}
          />
        </Field>
        <Field label="Email address" required error={err("email")}>
          <input
            type="email"
            value={c.email}
            onChange={(e) => setCustomer({ email: e.target.value })}
            placeholder="name@example.com"
            autoComplete="email"
            className={inputClass}
            aria-invalid={Boolean(err("email"))}
          />
        </Field>
        <Field label="Phone (with country code)" required error={err("phone")} hint="e.g. +1 242 555 0123">
          <input
            type="tel"
            value={c.phone}
            onChange={(e) => setCustomer({ phone: e.target.value })}
            placeholder="+1 242 555 0123"
            autoComplete="tel"
            className={inputClass}
            aria-invalid={Boolean(err("phone"))}
          />
        </Field>
        <Field label="WhatsApp number" hint="Optional" error={err("whatsapp")}>
          <input
            type="tel"
            value={c.whatsapp}
            onChange={(e) => setCustomer({ whatsapp: e.target.value })}
            placeholder="Same as phone? Leave empty"
            className={inputClass}
            aria-invalid={Boolean(err("whatsapp"))}
          />
        </Field>
        <Field label="Special instructions" hint="Optional" error={err("specialInstructions")} className="sm:col-span-2">
          <textarea
            rows={3}
            value={c.specialInstructions}
            onChange={(e) => setCustomer({ specialInstructions: e.target.value })}
            placeholder="Child seats, accessibility, oversized luggage, celebration notes…"
            className={inputClass}
          />
        </Field>
      </div>

      <div className="mt-6">
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-navy-900/12 px-4 py-3.5 transition hover:bg-navy-50/60">
          <input
            type="checkbox"
            checked={c.consent}
            onChange={(e) => setCustomer({ consent: e.target.checked })}
            className="mt-0.5 size-4 accent-[#159a94]"
            aria-invalid={Boolean(err("consent"))}
          />
          <span className="text-[13.5px] leading-relaxed text-navy-700">
            I agree that Royalty Transportation &amp; Tours may use these details to respond to this
            demo booking request. Demo data may be reset at any time; no payment is collected.
          </span>
        </label>
        {err("consent") && (
          <p role="alert" className="mt-2 text-[12.5px] font-medium text-rose-600">
            {err("consent")}
          </p>
        )}
      </div>
    </div>
  );
}

/* ============================== STEP 4 ============================== */

function StepReview({
  data,
  quote,
  submitting,
  submitError,
  onEdit,
  onSubmit,
}: {
  data: WizardData;
  quote: QuoteState;
  submitting: boolean;
  submitError: string;
  onEdit: (step: number) => void;
  onSubmit: () => void;
}) {
  const j = data.journey;
  const c = data.customer;
  const isTour = data.serviceKey === "tour";
  const service = SERVICES.find((s) => s.key === data.serviceKey);

  return (
    <div>
      <Eyebrow>Step 4</Eyebrow>
      <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-navy-950">Review your request</h2>
      <p className="mt-2 text-[14px] text-navy-600">
        Nothing is booked yet — the operator confirms every request personally.
      </p>

      <div className="mt-7 space-y-4">
        <ReviewBlock title="Service" onEdit={() => onEdit(0)}>
          <ReviewRow label="Service" value={service?.name} />
        </ReviewBlock>

        <ReviewBlock title="Journey" onEdit={() => onEdit(1)}>
          {isTour ? (
            <>
              <ReviewRow label="Tour / experience" value={j.tour.tourName || "—"} />
              <ReviewRow label="Pickup point" value={j.pickupLocation || "—"} />
              <ReviewRow label="Date & time" value={`${formatDate(j.pickupDate)} · ${formatTime(j.pickupTime)}`} />
              <ReviewRow
                label="Party"
                value={`${j.tour.adults} adult${Number(j.tour.adults) !== 1 ? "s" : ""}${
                  Number(j.tour.children) > 0 ? `, ${j.tour.children} child${Number(j.tour.children) !== 1 ? "ren" : ""}` : ""
                }`}
              />
              {j.tour.specialRequests && <ReviewRow label="Special requests" value={j.tour.specialRequests} />}
            </>
          ) : (
            <>
              <ReviewRow label="From" value={j.pickupLocation || "—"} />
              <ReviewRow label="To" value={j.destination || "—"} />
              <ReviewRow label="Date & time" value={`${formatDate(j.pickupDate)} · ${formatTime(j.pickupTime)}`} />
              <ReviewRow label="Passengers / bags" value={`${j.passengers} pax · ${j.bags} bags`} />
              <ReviewRow
                label="Return journey"
                value={j.returnTrip ? `${formatDate(j.returnDate)} · ${formatTime(j.returnTime)}` : "One way"}
              />
              {Number(j.additionalStops) > 0 && <ReviewRow label="Additional stops" value={j.additionalStops} />}
              {data.serviceKey === "airport_arrival" && (
                <>
                  <ReviewRow label="Airline / flight" value={`${j.flight.airline} ${j.flight.flightNumber}`} />
                  <ReviewRow label="Arrives" value={`${j.flight.arrivalAirport} · ${formatTime(j.flight.arrivalTime)}`} />
                  {j.flight.hotelAddress && <ReviewRow label="Hotel address" value={j.flight.hotelAddress} />}
                </>
              )}
            </>
          )}
        </ReviewBlock>

        <ReviewBlock title="Your details" onEdit={() => onEdit(2)}>
          <ReviewRow label="Name" value={c.fullName} />
          <ReviewRow label="Email" value={c.email} />
          <ReviewRow label="Phone" value={c.phone} />
          {c.whatsapp && <ReviewRow label="WhatsApp" value={c.whatsapp} />}
          {c.specialInstructions && <ReviewRow label="Instructions" value={c.specialInstructions} />}
        </ReviewBlock>

        {/* Estimate */}
        <div className="rounded-2xl border border-dashed border-navy-900/20 bg-navy-50/60 p-5">
          <div className="flex items-start justify-between gap-4">
            <p className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.14em] text-navy-700">
              <ReceiptText className="size-4 text-aqua-700" /> Pricing
            </p>
            {quote.status === "ok" && <Badge tone="amber">Demo estimate</Badge>}
          </div>
          {quote.status === "loading" && (
            <p className="mt-3 flex items-center gap-2 text-[13.5px] font-medium text-navy-500">
              <Loader2 className="size-4 animate-spin" /> Checking configured pricing rules…
            </p>
          )}
          {quote.status === "ok" && quote.totalCents != null && quote.lines && (
            <div className="mt-3">
              <ul className="space-y-1.5 text-[13.5px] text-navy-700">
                {quote.lines.map((l) => (
                  <li key={l.label} className="flex items-baseline justify-between gap-4">
                    <span>{l.label}</span>
                    <span className="font-semibold text-navy-950">{formatMoney(l.amountCents)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex items-baseline justify-between border-t border-navy-900/10 pt-3">
                <span className="text-[13px] font-bold uppercase tracking-[0.1em] text-navy-600">Demo estimate</span>
                <span className="font-display text-2xl font-semibold text-navy-950">{formatMoney(quote.totalCents)}</span>
              </div>
              <p className="mt-3 text-[12px] leading-relaxed text-navy-500">
                This estimate comes from demo pricing rules. It is not a final fare — the operator
                confirms the exact price when they confirm your request. No payment is taken.
              </p>
            </div>
          )}
          {quote.status === "none" && (
            <p className="mt-3 text-[13.5px] leading-relaxed text-navy-600">
              <span className="font-bold text-navy-900">Request a quote.</span> No configured demo
              pricing rule matches this journey, so the team will confirm the fare personally rather
              than guessing.
            </p>
          )}
          {quote.status === "error" && (
            <p className="mt-3 flex items-center gap-2 text-[13.5px] font-medium text-amber-700">
              <AlertTriangle className="size-4" /> Pricing preview is unavailable right now — the team
              will quote your request directly.
            </p>
          )}
        </div>

        {submitError && (
          <div role="alert" className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3.5">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-rose-600" />
            <p className="text-[13.5px] font-medium text-rose-700">{submitError}</p>
          </div>
        )}

        <div className="flex flex-col items-stretch gap-3 border-t border-navy-900/10 pt-6 sm:flex-row sm:justify-between">
          <button type="button" onClick={() => onEdit(1)} className={buttonClass("ghost", "md")}>
            <Pencil className="size-4" /> Edit details
          </button>
          <button type="button" onClick={onSubmit} disabled={submitting} className={buttonClass("primary", "lg")}>
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Submitting…
              </>
            ) : (
              <>
                Submit booking request <ArrowRight className="size-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function ReviewBlock({ title, onEdit, children }: { title: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-navy-900/10">
      <div className="flex items-center justify-between border-b border-navy-900/10 px-5 py-3">
        <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-navy-700">{title}</p>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-aqua-700 transition hover:text-aqua-600"
        >
          <Pencil className="size-3.5" /> Edit
        </button>
      </div>
      <dl className="grid gap-x-6 gap-y-3 px-5 py-4 sm:grid-cols-2">{children}</dl>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <dt className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-navy-400">{label}</dt>
      <dd className="mt-0.5 text-[14px] font-semibold text-navy-900">{value ?? "—"}</dd>
    </div>
  );
}

/* ============================== STEP 5 ============================== */

function StepConfirmation({ reference, data }: { reference: string; data: WizardData }) {
  const j = data.journey;
  return (
    <div className="py-4 text-center">
      <span className="mx-auto grid size-16 place-items-center rounded-full bg-aqua-500/15 text-aqua-700 ring-1 ring-aqua-500/40">
        <BadgeCheck className="size-8" />
      </span>
      <Eyebrow className="mt-6 justify-center">Step 5 — Request received</Eyebrow>
      <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-navy-950 sm:text-4xl">
        Your request is with the Royalty team.
      </h2>
      <p className="mx-auto mt-3 max-w-md text-[14.5px] leading-relaxed text-navy-600">
        This is a <strong>pending demo request</strong> — not a confirmed ride. The operator reviews
        every request and confirms availability and the final fare directly.
      </p>

      <div className="mx-auto mt-7 max-w-sm rounded-2xl border border-navy-900/10 bg-navy-50/60 px-6 py-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-navy-500">Your demo reference</p>
        <p className="mt-1.5 select-all font-display text-[28px] font-semibold tracking-tight text-navy-950">
          {reference}
        </p>
        <p className="mt-1 text-[12px] text-navy-500">Keep it to check your request status anytime.</p>
      </div>

      <dl className="mx-auto mt-7 grid max-w-md gap-y-3 text-left">
        <div className="flex items-baseline justify-between border-b border-navy-900/8 pb-2.5">
          <dt className="text-[12px] font-semibold uppercase tracking-[0.1em] text-navy-400">Service</dt>
          <dd className="text-[14px] font-semibold text-navy-900">
            {SERVICES.find((s) => s.key === data.serviceKey)?.name}
          </dd>
        </div>
        <div className="flex items-baseline justify-between border-b border-navy-900/8 pb-2.5">
          <dt className="text-[12px] font-semibold uppercase tracking-[0.1em] text-navy-400">When</dt>
          <dd className="text-[14px] font-semibold text-navy-900">
            {formatDate(j.pickupDate)} · {formatTime(j.pickupTime)}
          </dd>
        </div>
        {j.pickupLocation && (
          <div className="flex items-baseline justify-between border-b border-navy-900/8 pb-2.5">
            <dt className="text-[12px] font-semibold uppercase tracking-[0.1em] text-navy-400">From</dt>
            <dd className="max-w-[60%] text-right text-[14px] font-semibold text-navy-900">{j.pickupLocation}</dd>
          </div>
        )}
        <div className="flex items-center justify-between border-b border-navy-900/8 pb-2.5">
          <dt className="text-[12px] font-semibold uppercase tracking-[0.1em] text-navy-400">Status</dt>
          <dd>
            <Badge tone={STATUS_META.pending.tone}>{STATUS_META.pending.label}</Badge>
          </dd>
        </div>
      </dl>

      <p className="mx-auto mt-6 flex max-w-md items-start justify-center gap-2 text-[12.5px] leading-relaxed text-navy-500">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-aqua-700" />
        No email has been sent from this demo unless email delivery is configured by the operator.
        For immediate help call +1 242-828-6196.
      </p>

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link href="/" className={buttonClass("outline", "lg")}>
          <Home className="size-4" /> Return home
        </Link>
        <Link href={`/request?ref=${encodeURIComponent(reference)}`} className={buttonClass("secondary", "lg")}>
          View my demo request <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}

/* ============================ Summary rail ============================ */

function SummaryRail({ data, quote, step }: { data: WizardData; quote: QuoteState; step: number }) {
  const j = data.journey;
  const service = SERVICES.find((s) => s.key === data.serviceKey);
  const Icon = data.serviceKey ? SERVICE_ICONS[data.serviceKey] : Compass;
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-navy-900/10 bg-navy-950 p-6 text-white shadow-[var(--shadow-card)]">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-aqua-300">Your request</p>
        <div className="mt-4 flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-white/10 text-aqua-300">
            <Icon className="size-5" />
          </span>
          <p className="text-[15px] font-bold">{service?.name ?? "Choose a service"}</p>
        </div>
        <dl className="mt-5 space-y-2.5 text-[13px]">
          {j.pickupLocation && (
            <div className="flex justify-between gap-4">
              <dt className="text-white/50">From</dt>
              <dd className="max-w-[60%] text-right font-semibold">{j.pickupLocation}</dd>
            </div>
          )}
          {j.destination && (
            <div className="flex justify-between gap-4">
              <dt className="text-white/50">To</dt>
              <dd className="max-w-[60%] text-right font-semibold">{j.destination}</dd>
            </div>
          )}
          {j.tour.tourName && data.serviceKey === "tour" && (
            <div className="flex justify-between gap-4">
              <dt className="text-white/50">Tour</dt>
              <dd className="max-w-[60%] text-right font-semibold">{j.tour.tourName}</dd>
            </div>
          )}
          {j.pickupDate && (
            <div className="flex justify-between gap-4">
              <dt className="text-white/50">When</dt>
              <dd className="font-semibold">
                {formatDate(j.pickupDate)} {j.pickupTime ? `· ${formatTime(j.pickupTime)}` : ""}
              </dd>
            </div>
          )}
          {j.returnTrip && j.returnDate && (
            <div className="flex justify-between gap-4">
              <dt className="text-white/50">Return</dt>
              <dd className="font-semibold">
                {formatDate(j.returnDate)} {j.returnTime ? `· ${formatTime(j.returnTime)}` : ""}
              </dd>
            </div>
          )}
          {quote.status === "ok" && quote.totalCents != null && step >= 3 && (
            <div className="flex justify-between gap-4 border-t border-white/10 pt-3">
              <dt className="text-white/50">Demo estimate</dt>
              <dd className="font-display text-lg font-semibold text-aqua-300">{formatMoney(quote.totalCents)}</dd>
            </div>
          )}
        </dl>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-dashed border-navy-900/20 bg-white px-4 py-3.5">
        <FlaskConical className="mt-0.5 size-4 shrink-0 text-aqua-700" />
        <p className="text-[12px] leading-relaxed text-navy-500">
          <span className="font-bold text-navy-800">Demo booking system.</span> Requests are stored in a
          demo database for evaluation — no live reservation or payment is triggered.
        </p>
      </div>
    </div>
  );
}
