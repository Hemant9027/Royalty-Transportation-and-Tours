import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  ClipboardList,
  FlaskConical,
  Hourglass,
  PlaneLanding,
  Server,
  XCircle,
} from "lucide-react";
import { getDashboardStats, recentBookings, upcomingJourneys, bookingCustomer } from "@/lib/admin-data";
import { STATUS_META, type BookingStatus } from "@/lib/constants";
import { Badge } from "@/components/ui";
import { formatDate, formatTime, formatMoney, timeAgo, cx } from "@/lib/format";

export const metadata: Metadata = { title: "Dashboard" };

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();
  const recent = await recentBookings(6);
  const upcoming = await upcomingJourneys(6);

  const cards = [
    { label: "Total demo requests", value: stats.total, icon: ClipboardList },
    { label: "Pending", value: stats.pending, icon: Hourglass, tone: "text-amber-600 bg-amber-500/10 ring-amber-500/25" },
    { label: "Awaiting confirmation", value: stats.awaitingConfirmation, icon: CircleAlert, tone: "text-sky-700 bg-sky-500/10 ring-sky-500/25" },
    { label: "Confirmed", value: stats.confirmed, icon: CheckCircle2, tone: "text-emerald-700 bg-emerald-500/10 ring-emerald-500/25" },
    { label: "Cancelled", value: stats.cancelled, icon: XCircle, tone: "text-rose-600 bg-rose-500/10 ring-rose-500/25" },
    { label: "Upcoming journeys", value: stats.upcomingJourneys, icon: PlaneLanding, tone: "text-aqua-700 bg-aqua-500/10 ring-aqua-500/25" },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-navy-950">Dashboard</h1>
          <p className="mt-1.5 text-[13.5px] text-navy-500">
            Temporary view of demo requests held in this server instance.
          </p>
        </div>
        <Link
          href="/admin/bookings"
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-navy-950 px-4 text-[13px] font-semibold text-white transition hover:bg-navy-800"
        >
          Manage bookings <ArrowRight className="size-4" />
        </Link>
      </div>

      {/* Data provenance strip */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-2xl border border-aqua-500/30 bg-aqua-500/[0.06] px-5 py-4">
          <Server className="size-5 shrink-0 text-aqua-700" />
          <p className="text-[13px] font-semibold text-navy-900">
            {stats.realDemoRequests} demo request{stats.realDemoRequests === 1 ? "" : "s"} currently held in memory
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-amber-300/40 bg-amber-400/[0.08] px-5 py-4">
          <FlaskConical className="size-5 shrink-0 text-amber-600" />
          <p className="text-[13px] font-semibold text-navy-900">
            Demo data is temporary and can reset on server restarts or between serverless instances.
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-navy-900/10 bg-white p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between">
              <span className={cx("grid size-10 place-items-center rounded-xl ring-1", c.tone ?? "bg-navy-900/5 text-navy-700 ring-navy-900/10")}>
                <c.icon className="size-5" />
              </span>
            </div>
            <p className="mt-4 font-display text-4xl font-semibold tracking-tight text-navy-950">{c.value}</p>
            <p className="mt-1 text-[12.5px] font-semibold uppercase tracking-[0.1em] text-navy-500">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        {/* Upcoming */}
        <section className="rounded-2xl border border-navy-900/10 bg-white shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between border-b border-navy-900/10 px-6 py-4">
            <h2 className="flex items-center gap-2 text-[14px] font-bold tracking-tight text-navy-950">
              <CalendarClock className="size-4.5 text-aqua-700" /> Upcoming requested journeys
            </h2>
            <Link href="/admin/bookings?from=today" className="text-[12.5px] font-bold text-aqua-700 hover:text-aqua-600">
              View all
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <p className="px-6 py-10 text-center text-[13.5px] text-navy-400">
              No upcoming journeys yet — new demo requests will appear here instantly.
            </p>
          ) : (
            <ul className="divide-y divide-navy-900/6">
              {upcoming.map((b) => (
                <li key={b.id}>
                  <Link href={`/admin/bookings/${b.id}`} className="flex items-center gap-4 px-6 py-3.5 transition hover:bg-navy-50/60">
                    <span className="grid min-w-[64px] place-items-center rounded-xl bg-navy-950 px-2 py-1.5 text-center">
                      <span className="block text-[10px] font-bold uppercase text-white/50">
                        {formatDate(b.pickupDate).split(" ")[0]}
                      </span>
                      <span className="block font-display text-[17px] font-semibold leading-none text-aqua-300">
                        {formatDate(b.pickupDate).split(" ")[1]?.replace(",", "")}
                      </span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] font-bold text-navy-950">
                        {bookingCustomer(b).fullName}
                      </span>
                      <span className="block truncate text-[12px] font-medium text-navy-500">
                        {b.serviceLabel} · {formatTime(b.pickupTime)}
                      </span>
                    </span>
                    <Badge tone={STATUS_META[b.status as BookingStatus]?.tone ?? "slate"}>
                      {STATUS_META[b.status as BookingStatus]?.label ?? b.status}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Recent requests */}
        <section className="rounded-2xl border border-navy-900/10 bg-white shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between border-b border-navy-900/10 px-6 py-4">
            <h2 className="flex items-center gap-2 text-[14px] font-bold tracking-tight text-navy-950">
              <ClipboardList className="size-4.5 text-aqua-700" /> Latest demo requests
            </h2>
            <Link href="/admin/bookings" className="text-[12.5px] font-bold text-aqua-700 hover:text-aqua-600">
              View all
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="px-6 py-10 text-center text-[13.5px] text-navy-400">
              No requests yet — submit one from the public booking flow to see it here.
            </p>
          ) : (
            <ul className="divide-y divide-navy-900/6">
              {recent.map((b) => (
                <li key={b.id}>
                  <Link href={`/admin/bookings/${b.id}`} className="flex items-center gap-4 px-6 py-3.5 transition hover:bg-navy-50/60">
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-[13.5px] font-bold text-navy-950">{b.reference}</span>
                        {b.isSample && (
                          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                            Sample
                          </span>
                        )}
                      </span>
                      <span className="block truncate text-[12px] font-medium text-navy-500">
                        {b.serviceLabel} · {timeAgo(b.createdAt)}
                        {b.estimatedCents != null ? ` · ${formatMoney(b.estimatedCents)} demo est.` : ""}
                      </span>
                    </span>
                    <Badge tone={STATUS_META[b.status as BookingStatus]?.tone ?? "slate"}>
                      {STATUS_META[b.status as BookingStatus]?.label ?? b.status}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
