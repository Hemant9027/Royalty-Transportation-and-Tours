"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { RotateCcw, Search } from "lucide-react";
import { SERVICES } from "@/lib/constants";

const STATUSES = [
  ["", "All statuses"],
  ["pending", "Pending"],
  ["reviewing", "Reviewing"],
  ["quote_sent", "Quote Sent"],
  ["confirmed", "Confirmed"],
  ["completed", "Completed"],
  ["cancelled", "Cancelled"],
] as const;

const selectCls =
  "h-10 rounded-xl border border-navy-900/12 bg-white px-3 text-[13px] font-semibold text-navy-800 transition focus:border-aqua-500 focus:outline-none focus:ring-2 focus:ring-aqua-500/25";

export function BookingsFilterBar() {
  const sp = useSearchParams();
  // Remount on URL change so the search input re-syncs from the URL
  return <FilterBarInner key={sp.get("q") ?? ""} initialQ={sp.get("q") ?? ""} />;
}

function FilterBarInner({ initialQ }: { initialQ: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [q, setQ] = useState(initialQ);
  const [pending, startTransition] = useTransition();

  function apply(patch: Record<string, string | null>) {
    const params = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === "") params.delete(k);
      else params.set(k, v);
    }
    params.delete("page");
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  return (
    <form
      className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-navy-900/10 bg-white p-4 shadow-[var(--shadow-card)]"
      onSubmit={(e) => {
        e.preventDefault();
        apply({ q: q || null });
      }}
    >
      <label className="relative min-w-[220px] flex-1">
        <span className="sr-only">Search bookings</span>
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-navy-300" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search reference, name or email…"
          className="h-10 w-full rounded-xl border border-navy-900/12 bg-white pl-9 pr-3 text-[13px] font-medium text-navy-900 placeholder:text-navy-300 transition focus:border-aqua-500 focus:outline-none focus:ring-2 focus:ring-aqua-500/25"
        />
      </label>

      <select
        aria-label="Filter by status"
        value={sp.get("status") ?? ""}
        onChange={(e) => apply({ status: e.target.value || null })}
        className={selectCls}
      >
        {STATUSES.map(([v, label]) => (
          <option key={v} value={v}>
            {label}
          </option>
        ))}
      </select>

      <select
        aria-label="Filter by service type"
        value={sp.get("service") ?? ""}
        onChange={(e) => apply({ service: e.target.value || null })}
        className={selectCls}
      >
        <option value="">All services</option>
        {SERVICES.map((s) => (
          <option key={s.key} value={s.key}>
            {s.name}
          </option>
        ))}
      </select>

      <select
        aria-label="Filter by record origin"
        value={sp.get("origin") ?? ""}
        onChange={(e) => apply({ origin: e.target.value || null })}
        className={selectCls}
      >
        <option value="">Sample + submissions</option>
        <option value="live">Submitted demo requests</option>
        <option value="sample">Seeded samples only</option>
      </select>

      <input
        aria-label="Journeys from date"
        type="date"
        value={sp.get("from") ?? ""}
        onChange={(e) => apply({ from: e.target.value || null })}
        className={selectCls}
      />
      <input
        aria-label="Journeys until date"
        type="date"
        value={sp.get("to") ?? ""}
        onChange={(e) => apply({ to: e.target.value || null })}
        className={selectCls}
      />

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-10 items-center gap-2 rounded-xl bg-navy-950 px-4 text-[13px] font-semibold text-white transition hover:bg-navy-800 disabled:opacity-60"
      >
        <Search className="size-4" /> Search
      </button>
      <button
        type="button"
        onClick={() => {
          setQ("");
          startTransition(() => router.push(pathname));
        }}
        className="inline-flex h-10 items-center gap-2 rounded-xl border border-navy-900/12 px-4 text-[13px] font-semibold text-navy-700 transition hover:bg-navy-50"
      >
        <RotateCcw className="size-4" /> Reset
      </button>
    </form>
  );
}
