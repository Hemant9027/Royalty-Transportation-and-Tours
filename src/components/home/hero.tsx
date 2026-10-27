import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Languages, ShieldCheck, Star } from "lucide-react";
import { buttonClass } from "@/components/ui";
import { BookingWidget } from "./booking-widget";

export function Hero() {
  return (
    <section className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden bg-navy-950">
      <div className="absolute inset-0">
        <Image
          src="/images/hero.jpg"
          alt="Sunlit waves breaking along a tropical shoreline"
          fill
          priority
          sizes="100vw"
          className="animate-scale-in object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950/70 via-navy-950/25 to-navy-950/85" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950/55 via-transparent to-transparent" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-5 pb-14 pt-40 lg:px-8">
        <div className="max-w-3xl animate-fade-up">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-[11.5px] font-bold uppercase tracking-[0.22em] text-aqua-200 backdrop-blur-sm">
            <span className="size-1.5 rounded-full bg-aqua-400" />
            Nassau · Paradise Island · The Bahamas
          </p>
          <h1 className="font-display text-[42px] font-semibold leading-[1.04] tracking-tight text-white sm:text-6xl lg:text-[76px]">
            Discover Nassau.
            <br />
            Travel with <span className="text-aqua-300">Royalty.</span>
          </h1>
          <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-white/75 sm:text-lg">
            Airport transfers, private transportation, and island experiences designed around your
            Bahamas journey.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href="/book" className={buttonClass("primary", "lg")}>
              Book Your Ride
            </Link>
            <Link href="/#tours" className={buttonClass("outline", "lg", "border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:border-white/50")}>
              Explore Our Tours
            </Link>
          </div>
        </div>

        <div className="mt-12 animate-fade-up" style={{ animationDelay: "180ms" }}>
          <BookingWidget />
        </div>

        <div
          className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-[12.5px] font-semibold text-white/70 animate-fade-up"
          style={{ animationDelay: "300ms" }}
        >
          <span className="inline-flex items-center gap-2">
            <Star className="size-4 fill-aqua-400 text-aqua-400" /> Rated 5.0 on TripAdvisor
          </span>
          <span className="inline-flex items-center gap-2">
            <BadgeCheck className="size-4 text-aqua-400" /> Fares aligned with the Ministry of Public Works &amp; Transport
          </span>
          <span className="inline-flex items-center gap-2">
            <ShieldCheck className="size-4 text-aqua-400" /> Licensed, vetted local drivers
          </span>
          <span className="inline-flex items-center gap-2">
            <Languages className="size-4 text-aqua-400" /> English &amp; Spanish
          </span>
        </div>
      </div>
    </section>
  );
}
