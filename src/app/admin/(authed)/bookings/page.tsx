import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpDown, ChevronLeft, ChevronRight, ClipboardList, Inbox } from "lucide-react";
import { listBookings, bookingCustomer } from "@/lib/admin-data";
import { STATUS_META, type BookingStatus } from "@/lib/constants";
import { Badge } from "@/components/ui";
import { formatDate, formatTime, formatMoney, cx } from "@/lib/format";
import { todayInNassau } from "@/lib/booking-schema";
import { BookingsFilterBar } from "@/components/admin/bookings-filter-bar";

export const metadata: Metadata = { title: "Bookings" };
export const dynamic = "force-dynamic";

type SP = Record<string, string | string[] | undefined>;
const str = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);

export default async function AdminBookingsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;

  const query = {
    q: str(sp.q),
    status: str(sp.status),
    service: str(sp.service),
    origin: str(sp.origin),
    from: str(sp.from) === "today" ? todayInNassau() : str(sp.from),
    to: str(sp.to),
    sort: str(sp.sort),
    dir: str(sp.dir) === "asc" ? ("asc" as const) : ("desc" as const),
    page: str(sp.page) ? Math.max(1, Number(str(sp.page))) : 1,
  };

  const result = await listBookings(query);

  function pageHref(params: Record<string, string | undefined>) {
    const p = new URLSearchParams();
    const base: Record<string, string | undefined> = {
      q: query.q,
      status: query.status,
      service: query.service,
      origin: query.origin,
      from: str(sp.from),
      to: query.to,
      ...params,
    };
    for (const [k, v] of Object.entries(base)) if (v) p.set(k, v);
    return `/admin/bookings?${p.toString()}`;
  }

  function sortHref(col: string) {
    const dir = query.sort === col && query.dir === "desc" ? "asc" : "desc";
    return pageHref({ sort: col, dir, page: "1" });
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-navy-950">Bookings</h1>
          <p className="mt-1.5 text-[13.5px] text-navy-500">
            Search, filter and action demo booking requests. Sample records are labelled.
          </p>
        </div>
        <p className="rounded-xl border border-navy-900/10 bg-white px-4 py-2 text-[13px] font-bold text-navy-800">
          {result.total} result{result.total === 1 ? "" : "s"}
        </p>
      </div>

      <BookingsFilterBar />

      <div className="mt-5 overflow-hidden rounded-2xl border border-navy-900/10 bg-white shadow-[var(--shadow-card)]">
        {/* Desktop table */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[860px] border-collapse text-left">
            <thead>
              <tr className="border-b border-navy-900/10 bg-navy-50/60 text-[11px] font-bold uppercase tracking-[0.12em] text-navy-500">
                <th className="px-5 py-3.5">
                  <Link href={sortHref("reference")} className="inline-flex items-center gap-1 hover:text-navy-800">
                    Reference <ArrowUpDown className="size-3" />
                  </Link>
                </th>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Service</th>
                <th className="px-5 py-3.5">
                  <Link href={sortHref("pickupDate")} className="inline-flex items-center gap-1 hover:text-navy-800">
                    Journey date <ArrowUpDown className="size-3" />
                  </Link>
                </th>
                <th className="px-5 py-3.5 text-right">Demo estimate</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">
                  <Link href={sortHref("createdAt")} className="inline-flex items-center gap-1 hover:text-navy-800">
                    Received <ArrowUpDown className="size-3" />
                  </Link>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-900/6">
              {result.rows.map((b) => (
                <tr key={b.id} className="group transition hover:bg-navy-50/50">
                  <td className="px-5 py-4">
                    <Link href={`/admin/bookings/${b.id}`} className="text-[13.5px] font-bold text-navy-950 underline-offset-2 hover:underline">
                      {b.reference}
                    </Link>
                    {b.isSample && (
                      <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                        Sample
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-[13.5px] font-semibold text-navy-900">{bookingCustomer(b).fullName}</p>
                    <p className="text-[12px] text-navy-400">{bookingCustomer(b).email}</p>
                  </td>
                  <td className="px-5 py-4 text-[13px] font-medium text-navy-700">{b.serviceLabel}</td>
                  <td className="px-5 py-4 text-[13px] font-semibold text-navy-900">
                    {formatDate(b.pickupDate)} <span className="font-medium text-navy-400">{formatTime(b.pickupTime)}</span>
                  </td>
                  <td className="px-5 py-4 text-right text-[13.5px] font-semibold text-navy-900">
                    {b.estimatedCents != null ? formatMoney(b.estimatedCents) : <span className="text-[12px] font-medium text-navy-400">Quote needed</span>}
                  </td>
                  <td className="px-5 py-4">
                    <Badge tone={STATUS_META[b.status as BookingStatus]?.tone ?? "slate"}>
                      {STATUS_META[b.status as BookingStatus]?.label ?? b.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-[12.5px] font-medium text-navy-400">
                    {new Date(b.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <ul className="divide-y divide-navy-900/8 md:hidden">
          {result.rows.map((b) => (
            <li key={b.id}>
              <Link href={`/admin/bookings/${b.id}`} className="block px-5 py-4 transition active:bg-navy-50">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[13.5px] font-bold text-navy-950">{b.reference}</p>
                  <Badge tone={STATUS_META[b.status as BookingStatus]?.tone ?? "slate"}>
                    {STATUS_META[b.status as BookingStatus]?.label ?? b.status}
                  </Badge>
                </div>
                <p className="mt-1 text-[13px] font-semibold text-navy-800">
                  {bookingCustomer(b).fullName}
                  {b.isSample && (
                    <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                      Sample
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-[12px] font-medium text-navy-500">
                  {b.serviceLabel} · {formatDate(b.pickupDate)} {formatTime(b.pickupTime)}
                </p>
              </Link>
            </li>
          ))}
        </ul>

        {result.rows.length === 0 && (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <Inbox className="size-10 text-navy-300" />
            <p className="mt-4 text-[15px] font-bold text-navy-900">No bookings match these filters</p>
            <p className="mt-1 text-[13px] text-navy-500">Try widening the search, or submit a request from the booking flow.</p>
            <Link href="/admin/bookings" className="mt-5 text-[13px] font-bold text-aqua-700 underline underline-offset-2">
              Clear all filters
            </Link>
          </div>
        )}
      </div>

      {/* Pagination */}
      {result.totalPages > 1 && (
        <div className="mt-5 flex items-center justify-between">
          <p className="text-[12.5px] font-medium text-navy-500">
            Page {result.page} of {result.totalPages}
          </p>
          <div className="flex gap-2">
            <Link
              href={pageHref({ page: String(Math.max(1, result.page - 1)) })}
              aria-disabled={result.page <= 1}
              className={cx(
                "inline-flex h-9 items-center gap-1.5 rounded-lg border border-navy-900/10 bg-white px-3.5 text-[13px] font-semibold text-navy-800 transition hover:bg-navy-50",
                result.page <= 1 && "pointer-events-none opacity-40",
              )}
            >
              <ChevronLeft className="size-4" /> Prev
            </Link>
            <Link
              href={pageHref({ page: String(Math.min(result.totalPages, result.page + 1)) })}
              aria-disabled={result.page >= result.totalPages}
              className={cx(
                "inline-flex h-9 items-center gap-1.5 rounded-lg border border-navy-900/10 bg-white px-3.5 text-[13px] font-semibold text-navy-800 transition hover:bg-navy-50",
                result.page >= result.totalPages && "pointer-events-none opacity-40",
              )}
            >
              Next <ChevronRight className="size-4" />
            </Link>
          </div>
        </div>
      )}

      <p className="mt-6 flex items-center gap-2 text-[12px] font-medium text-navy-400">
        <ClipboardList className="size-3.5" /> Every status change updates the stored record and is visible
        to the customer on their request page — instantly.
      </p>
    </div>
  );
}
