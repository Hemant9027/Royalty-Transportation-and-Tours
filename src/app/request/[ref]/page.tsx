import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, CalendarDays, FlaskConical, Lock, MailCheck, MapPin, ShieldCheck, Users } from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Badge, buttonClass } from "@/components/ui";
import { STATUS_META, type BookingStatus } from "@/lib/constants";
import { formatDate, formatDateTime, formatMoney, formatTime } from "@/lib/format";
import { getBookingByReference, getBookingHistory, fullBookingView } from "@/lib/bookings";
import { bookingCustomer } from "@/lib/admin-data";
import type { JourneyDetails } from "@/lib/booking-schema";

export const metadata: Metadata = { title: "Your Demo Request" };
export const dynamic = "force-dynamic";

export default async function RequestDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ ref: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { ref } = await params;
  const sp = await searchParams;
  const email = typeof sp.email === "string" ? sp.email.trim().toLowerCase() : "";

  const booking = await getBookingByReference(ref);
  if (!booking) notFound();

  const verified = email !== "" && bookingCustomer(booking).email.toLowerCase() === email;
  const statusMeta = STATUS_META[booking.status as BookingStatus] ?? STATUS_META.pending;
  const history = verified ? await getBookingHistory(booking.id) : [];
  const view = verified ? fullBookingView(booking) : null;
  const journey = booking.journey as JourneyDetails;

  return (
    <>
      <SiteHeader solid />
      <main className="min-h-[80vh] bg-navy-50/60 pb-24 pt-28">
        <div className="mx-auto max-w-3xl px-5">
          {/* Status header */}
          <div className="rounded-2xl border border-navy-900/10 bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-navy-400">Demo booking request</p>
                <h1 className="mt-1.5 font-display text-3xl font-semibold tracking-tight text-navy-950">
                  {booking.reference}
                </h1>
                <p className="mt-1 text-[13px] font-medium text-navy-500">{booking.serviceLabel}</p>
              </div>
              <Badge tone={statusMeta.tone} className="px-3.5 py-1.5 text-[12px]">
                {statusMeta.label}
              </Badge>
            </div>

            <div className="mt-6 flex items-start gap-2.5 rounded-xl bg-navy-50/70 px-4 py-3 text-[12.5px] leading-relaxed text-navy-600">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-aqua-700" />
              {booking.status === "pending" && "Your request is pending operator confirmation — nothing is booked yet."}
              {booking.status === "reviewing" && "The team is reviewing your request right now."}
              {booking.status === "quote_sent" && "A quote has been recorded for your request by the team (demo view)."}
              {booking.status === "confirmed" &&
                "This demo request is marked confirmed in the demo dashboard. Remember: this environment is not a live reservation system."}
              {booking.status === "completed" && "This demo journey has been marked completed."}
              {booking.status === "cancelled" && "This request has been cancelled."}
            </div>

            {!verified && (
              <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-4">
                <p className="flex items-center gap-2 text-[13px] font-bold text-amber-800">
                  <Lock className="size-4" /> Details are private
                </p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-amber-800/90">
                  {email
                    ? "That email doesn't match the one on this request, so we're only showing a masked summary."
                    : "Add your booking email to reveal pickup details, flight info and status history."}
                </p>
                <Link
                  href={`/request?ref=${encodeURIComponent(booking.reference)}`}
                  className="mt-3 inline-flex items-center gap-2 text-[12.5px] font-bold text-navy-900 underline underline-offset-2"
                >
                  <MailCheck className="size-4" /> Verify with your email
                </Link>
              </div>
            )}
          </div>

          {/* Masked summary (always safe) */}
          <div className="mt-6 rounded-2xl border border-navy-900/10 bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
            <h2 className="text-[12px] font-bold uppercase tracking-[0.16em] text-navy-500">Journey</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <CalendarDays className="mt-0.5 size-4 text-aqua-700" />
                <div>
                  <dt className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-navy-400">Date & time</dt>
                  <dd className="mt-0.5 text-[14.5px] font-bold text-navy-950">
                    {formatDate(booking.pickupDate)} · {formatTime(booking.pickupTime)}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="mt-0.5 size-4 text-aqua-700" />
                <div>
                  <dt className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-navy-400">Party</dt>
                  <dd className="mt-0.5 text-[14.5px] font-bold text-navy-950">
                    {verified ? `${journey.passengers} passenger${journey.passengers === 1 ? "" : "s"}` : "Verified travellers only"}
                  </dd>
                </div>
              </div>
              {verified && journey.pickupLocation && (
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 size-4 text-aqua-700" />
                  <div>
                    <dt className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-navy-400">Pickup</dt>
                    <dd className="mt-0.5 text-[14.5px] font-bold text-navy-950">{journey.pickupLocation}</dd>
                  </div>
                </div>
              )}
              {verified && journey.destination && (
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 size-4 text-aqua-700" />
                  <div>
                    <dt className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-navy-400">Destination</dt>
                    <dd className="mt-0.5 text-[14.5px] font-bold text-navy-950">{journey.destination}</dd>
                  </div>
                </div>
              )}
            </dl>

            {verified && view && (
              <div className="mt-6 space-y-6 border-t border-navy-900/10 pt-6">
                {journey.flight && (
                  <div>
                    <h3 className="text-[12px] font-bold uppercase tracking-[0.16em] text-navy-500">Flight</h3>
                    <p className="mt-2 text-[14px] font-semibold text-navy-900">
                      {journey.flight.airline} {journey.flight.flightNumber} · arrives {journey.flight.arrivalAirport}{" "}
                      at {formatTime(journey.flight.arrivalTime)}
                    </p>
                    {journey.flight.hotelAddress && (
                      <p className="mt-1 text-[13px] text-navy-600">Staying at: {journey.flight.hotelAddress}</p>
                    )}
                  </div>
                )}
                {journey.tour && (
                  <div>
                    <h3 className="text-[12px] font-bold uppercase tracking-[0.16em] text-navy-500">Tour</h3>
                    <p className="mt-2 text-[14px] font-semibold text-navy-900">{journey.tour.tourName}</p>
                    <p className="mt-1 text-[13px] text-navy-600">
                      {journey.tour.adults} adult{journey.tour.adults === 1 ? "" : "s"}
                      {journey.tour.children > 0 ? ` + ${journey.tour.children} children` : ""}
                    </p>
                  </div>
                )}
                <div>
                  <h3 className="text-[12px] font-bold uppercase tracking-[0.16em] text-navy-500">Pricing</h3>
                  {booking.estimatedCents != null ? (
                    <p className="mt-2 text-[14px] font-semibold text-navy-900">
                      {formatMoney(booking.estimatedCents, booking.currency)}{" "}
                      <span className="ml-1 text-[12px] font-semibold text-amber-600">(demo estimate — final fare confirmed by the operator)</span>
                    </p>
                  ) : (
                    <p className="mt-2 text-[14px] font-semibold text-navy-900">
                      Quote pending — the team will share the fare directly.
                    </p>
                  )}
                </div>
                <div>
                  <h3 className="text-[12px] font-bold uppercase tracking-[0.16em] text-navy-500">Status history</h3>
                  <ol className="mt-3 space-y-3 border-l-2 border-navy-900/10 pl-4">
                    {history.map((h) => (
                      <li key={h.id} className="relative">
                        <span className="absolute -left-[21px] top-1.5 size-2.5 rounded-full bg-aqua-500 ring-4 ring-aqua-500/15" />
                        <p className="text-[13.5px] font-bold text-navy-900">
                          {STATUS_META[h.toStatus as BookingStatus]?.label ?? h.toStatus}
                        </p>
                        <p className="text-[12px] text-navy-500">{formatDateTime(h.createdAt)}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex items-start gap-2.5 rounded-2xl border border-dashed border-navy-900/20 bg-white px-5 py-4">
            <FlaskConical className="mt-0.5 size-4 shrink-0 text-aqua-700" />
            <p className="text-[12.5px] leading-relaxed text-navy-500">
              <span className="font-bold text-navy-800">This is a demo record.</span> Statuses are updated
              in the demo dashboard for evaluation purposes and do not constitute a live reservation.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/" className={buttonClass("secondary", "md")}>
              Back to homepage
            </Link>
            <Link href="/book" className={buttonClass("outline", "md")}>
              Make another request
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
