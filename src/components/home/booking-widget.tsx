"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Calendar, ChevronDown, MapPin, Users } from "lucide-react";
import { LOCATIONS, SERVICES, todayLabel } from "@/lib/widget-data";
import { cx } from "@/lib/format";

const inputBase =
  "w-full rounded-xl border border-navy-900/12 bg-white py-2.5 pl-9 pr-3 text-[13.5px] font-medium text-navy-900 placeholder:text-navy-300 transition focus:border-aqua-500 focus:outline-none focus:ring-2 focus:ring-aqua-500/25";

export function BookingWidget({ className }: { className?: string }) {
  const router = useRouter();
  const [service, setService] = useState(SERVICES[0].key);
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [passengers, setPassengers] = useState("2");

  const isTour = service === "tour";
  const minDate = useMemo(() => todayLabel(), []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set("service", service);
    if (pickup.trim()) params.set("pickup", pickup.trim());
    if (destination.trim() && !isTour) params.set("destination", destination.trim());
    if (date) params.set("date", date);
    params.set("pax", passengers);
    router.push(`/book?${params.toString()}`);
  }

  return (
    <form
      onSubmit={submit}
      className={cx(
        "w-full rounded-2xl border border-white/30 bg-white/95 p-4 shadow-[var(--shadow-lift)] backdrop-blur-md sm:p-5",
        className,
      )}
      aria-label="Quick booking search"
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.1fr_1.3fr_1.3fr_0.8fr_0.7fr_auto]">
        <label className="relative block">
          <span className="sr-only">Service type</span>
          <ChevronDown className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-aqua-600" />
          <select
            value={service}
            onChange={(e) => setService(e.target.value as typeof service)}
            className={cx(inputBase, "appearance-none pl-9 font-semibold")}
            aria-label="Service type"
          >
            {SERVICES.map((s) => (
              <option key={s.key} value={s.key}>
                {s.short}
              </option>
            ))}
          </select>
        </label>

        <label className="relative block">
          <span className="sr-only">Pickup location</span>
          <MapPin className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-navy-300" />
          <input
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
            list="widget-locations"
            placeholder={isTour ? "Hotel / pickup point" : "From — pickup location"}
            className={inputBase}
            aria-label="Pickup location"
          />
        </label>

        {!isTour ? (
          <label className="relative block">
            <span className="sr-only">Destination</span>
            <MapPin className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-navy-300" />
            <input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              list="widget-locations"
              placeholder="To — destination"
              className={inputBase}
              aria-label="Destination"
            />
          </label>
        ) : (
          <label className="relative block">
            <span className="sr-only">Tour preference</span>
            <ChevronDown className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-navy-300" />
            <select
              className={cx(inputBase, "appearance-none pl-9")}
              aria-label="Tour preference"
              defaultValue=""
              onChange={(e) => setDestination(e.target.value)}
            >
              <option value="">Pick a tour on the next step</option>
            </select>
          </label>
        )}

        <label className="relative block">
          <span className="sr-only">Pickup date</span>
          <Calendar className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-navy-300" />
          <input
            type="date"
            value={date}
            min={minDate}
            onChange={(e) => setDate(e.target.value)}
            className={inputBase}
            aria-label="Pickup date"
          />
        </label>

        <label className="relative block">
          <span className="sr-only">Passengers</span>
          <Users className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-navy-300" />
          <select
            value={passengers}
            onChange={(e) => setPassengers(e.target.value)}
            className={cx(inputBase, "appearance-none pl-9")}
            aria-label="Passengers"
          >
            {Array.from({ length: 15 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={String(n)}>
                {n} pax
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          className="inline-flex h-[42px] items-center justify-center gap-2 rounded-xl bg-navy-950 px-5 text-[13.5px] font-semibold text-white transition hover:bg-navy-800 sm:col-span-2 lg:col-span-1"
        >
          Book <ArrowRight className="size-4" />
        </button>
      </div>
      <datalist id="widget-locations">
        {LOCATIONS.map((l) => (
          <option key={l} value={l} />
        ))}
      </datalist>
    </form>
  );
}
