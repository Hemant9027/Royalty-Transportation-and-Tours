import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  ClipboardList,
  FileClock,
  FlaskConical,
  Luggage,
  Mail,
  MapPin,
  MessageSquareText,
  Phone,
  PlaneLanding,
  Repeat2,
  Users,
} from "lucide-react";
import { getBookingById, getBookingHistory } from "@/lib/bookings";
import { bookingCustomer, bookingJourney } from "@/lib/admin-data";
import { STATUS_META, type BookingStatus } from "@/lib/constants";
import { Badge } from "@/components/ui";
import { formatDate, formatDateTime, formatMoney, formatTime } from "@/lib/format";
import type { PriceLine } from "@/lib/pricing";
import { BookingActions } from "@/components/admin/booking-actions";

export const metadata: Metadata = { title: "Booking Detail" };
export const dynamic = "force-dynamic";

export default async function AdminBookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const booking = await getBookingById(id);
  if (!booking) notFound();

  const customer = bookingCustomer(booking);
  const journey = bookingJourney(booking);
  const history = await getBookingHistory(booking.id);
  const statusMeta = STATUS_META[booking.status as BookingStatus] ?? STATUS_META.pending;
  const breakdown = (booking.priceBreakdown as { lines?: PriceLine[]; isDemoEstimate?: boolean } | null) ?? null;

  return (
    <div>
      <Link
        href="/admin/bookings"
        className="inline-flex items-center gap-2 text-[13px] font-bold text-navy-500 transition hover:text-navy-900"
      >
        <ArrowLeft className="size-4" /> Back to bookings
      </Link>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-navy-950">{booking.reference}</h1>
          <Badge tone={statusMeta.tone} className="px-3 py-1 text-[12px]">
            {statusMeta.label}
          </Badge>
          {booking.isSample && (
            <span className="rounded-lg bg-amber-100 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-amber-700">
              Seeded sample
            </span>
          )}
        </div>
        <p className="text-[12.5px] font-medium text-navy-400">
          Received {formatDateTime(booking.createdAt)} · last update {formatDateTime(booking.updatedAt)}
        </p>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          {/* Journey */}
          <section className="rounded-2xl border border-navy-900/10 bg-white p-6 shadow-[var(--shadow-card)]">
            <h2 className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.14em] text-navy-500">
              <ClipboardList className="size-4 text-aqua-700" /> Journey — {booking.serviceLabel}
            </h2>
            <dl className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2">
              <Detail icon={MapPin} label="Pickup" value={journey.pickupLocation || "—"} />
              <Detail icon={MapPin} label="Destination" value={journey.destination || (journey.tour ? "Tour route" : "—")} />
              <Detail icon={CalendarDays} label="Date & time" value={`${formatDate(journey.pickupDate)} · ${formatTime(journey.pickupTime)}`} />
              <Detail
                icon={Users}
                label="Passengers / bags"
                value={
                  journey.tour
                    ? `${journey.tour.adults} adults, ${journey.tour.children} children`
                    : `${journey.passengers} pax · ${journey.bags} bags`
                }
              />
              <Detail
                icon={Repeat2}
                label="Return journey"
                value={journey.returnTrip ? `${formatDate(journey.returnDate)} · ${formatTime(journey.returnTime)}` : "One way"}
              />
              <Detail icon={Luggage} label="Additional stops" value={String(journey.additionalStops ?? 0)} />
            </dl>

            {journey.flight && (
              <div className="mt-5 rounded-xl border border-aqua-500/25 bg-aqua-500/[0.05] p-4">
                <h3 className="flex items-center gap-2 text-[11.5px] font-bold uppercase tracking-[0.14em] text-aqua-800">
                  <PlaneLanding className="size-4" /> Flight details
                </h3>
                <dl className="mt-3 grid gap-x-8 gap-y-3 text-[13.5px] sm:grid-cols-2">
                  <div>
                    <dt className="text-navy-400">Airline / flight</dt>
                    <dd className="font-bold text-navy-950">
                      {journey.flight.airline} {journey.flight.flightNumber}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-navy-400">Arrival airport / time</dt>
                    <dd className="font-bold text-navy-950">
                      {journey.flight.arrivalAirport} · {formatTime(journey.flight.arrivalTime)}
                    </dd>
                  </div>
                  {journey.flight.hotelAddress && (
                    <div className="sm:col-span-2">
                      <dt className="text-navy-400">Hotel / destination address</dt>
                      <dd className="font-bold text-navy-950">{journey.flight.hotelAddress}</dd>
                    </div>
                  )}
                </dl>
              </div>
            )}

            {journey.tour && (
              <div className="mt-5 rounded-xl border border-aqua-500/25 bg-aqua-500/[0.05] p-4">
                <h3 className="text-[11.5px] font-bold uppercase tracking-[0.14em] text-aqua-800">Tour</h3>
                <p className="mt-2 text-[14px] font-bold text-navy-950">{journey.tour.tourName}</p>
                {journey.tour.specialRequests && (
                  <p className="mt-1.5 text-[13px] text-navy-600">Requests: {journey.tour.specialRequests}</p>
                )}
              </div>
            )}

            {/* Pricing */}
            <div className="mt-5 rounded-xl border border-dashed border-navy-900/20 bg-navy-50/60 p-4">
              <h3 className="text-[11.5px] font-bold uppercase tracking-[0.14em] text-navy-500">Demo pricing engine</h3>
              {booking.estimatedCents != null && breakdown?.lines ? (
                <>
                  <ul className="mt-3 space-y-1.5 text-[13px] text-navy-700">
                    {breakdown.lines.map((l) => (
                      <li key={l.label} className="flex items-baseline justify-between gap-4">
                        <span>{l.label}</span>
                        <span className="font-semibold text-navy-950">{formatMoney(l.amountCents)}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 flex items-baseline justify-between border-t border-navy-900/10 pt-2.5">
                    <span className="text-[12px] font-bold uppercase tracking-[0.1em] text-navy-500">Demo estimate</span>
                    <span className="font-display text-xl font-semibold text-navy-950">{formatMoney(booking.estimatedCents)}</span>
                  </p>
                  <p className="mt-2 text-[11.5px] text-navy-400">
                    Simulated estimate from demo pricing rules — not a final fare.
                  </p>
                </>
              ) : (
                <p className="mt-2 text-[13px] font-medium text-navy-600">
                  No configured pricing rule matched — this journey requires a manual quote.
                </p>
              )}
            </div>
          </section>

          {/* Customer */}
          <section className="rounded-2xl border border-navy-900/10 bg-white p-6 shadow-[var(--shadow-card)]">
            <h2 className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.14em] text-navy-500">
              <Users className="size-4 text-aqua-700" /> Customer
            </h2>
            <dl className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2">
              <Detail label="Full name" value={customer.fullName} />
              <Detail icon={Mail} label="Email" value={customer.email} href={`mailto:${customer.email}`} />
              <Detail icon={Phone} label="Phone" value={customer.phone} href={`tel:${customer.phone.replace(/[^+\d]/g, "")}`} />
              <Detail label="WhatsApp" value={customer.whatsapp || "—"} />
            </dl>
            {customer.specialInstructions && (
              <div className="mt-5 rounded-xl bg-sand-100 px-4 py-3.5">
                <p className="flex items-center gap-2 text-[11.5px] font-bold uppercase tracking-[0.14em] text-sand-700">
                  <MessageSquareText className="size-4" /> Special instructions
                </p>
                <p className="mt-2 text-[13.5px] leading-relaxed text-navy-800">{customer.specialInstructions}</p>
              </div>
            )}
            <p className="mt-4 flex items-center gap-2 text-[11.5px] font-medium text-navy-400">
              <FlaskConical className="size-3.5" />
              {booking.isSample
                ? "Seeded sample record — the customer details are fictional (example.com)."
                : "Real demo request submitted through the public booking form."}
            </p>
          </section>
        </div>

        <div className="space-y-6">
          <BookingActions
            id={booking.id}
            status={booking.status}
            internalNotes={booking.internalNotes ?? ""}
            notificationStatus={booking.notificationStatus}
          />

          {/* History */}
          <section className="rounded-2xl border border-navy-900/10 bg-white p-6 shadow-[var(--shadow-card)]">
            <h2 className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.14em] text-navy-500">
              <FileClock className="size-4 text-aqua-700" /> Status history
            </h2>
            <ol className="mt-5 space-y-4 border-l-2 border-navy-900/10 pl-4">
              {history.map((h) => (
                <li key={h.id} className="relative">
                  <span className="absolute -left-[21px] top-1 size-2.5 rounded-full bg-aqua-500 ring-4 ring-aqua-500/15" />
                  <p className="text-[13.5px] font-bold text-navy-900">
                    {h.fromStatus ? `${STATUS_META[h.fromStatus as BookingStatus]?.label ?? h.fromStatus} → ` : ""}
                    {STATUS_META[h.toStatus as BookingStatus]?.label ?? h.toStatus}
                  </p>
                  <p className="text-[12px] text-navy-500">
                    {formatDateTime(h.createdAt)} · by {h.changedBy}
                  </p>
                  {h.note && <p className="mt-0.5 text-[12px] italic text-navy-400">“{h.note}”</p>}
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}

function Detail({
  label,
  value,
  icon: Icon,
  href,
}: {
  label: string;
  value: string;
  icon?: typeof MapPin;
  href?: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      {Icon && <Icon className="mt-0.5 size-4 shrink-0 text-aqua-700" />}
      <div className="min-w-0">
        <dt className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-navy-400">{label}</dt>
        <dd className="mt-0.5 break-words text-[14px] font-semibold text-navy-950">
          {href ? (
            <a href={href} className="text-aqua-700 underline-offset-2 hover:underline">
              {value}
            </a>
          ) : (
            value
          )}
        </dd>
      </div>
    </div>
  );
}
