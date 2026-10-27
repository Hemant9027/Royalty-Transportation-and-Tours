import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Clock3, FlaskConical, Info } from "lucide-react";
import { Eyebrow, Badge, buttonClass } from "@/components/ui";
import { Reveal } from "@/components/reveal";
import { TOURS, BUSINESS } from "@/lib/constants";

const TOUR_IMAGES: Record<string, { src: string; alt: string }> = {
  "Bahamas Water Sports Adventure Package": {
    src: "/images/tour-snorkel.jpg",
    alt: "Scuba diver exploring a tropical reef, shown as an illustrative tour image",
  },
  "Nassau Charm & Beauty City Tour": {
    src: "/images/beach-palms.jpg",
    alt: "Rocky tropical coastline, shown as an illustrative Nassau tour image",
  },
  "The Forts Heritage Tour": {
    src: "/images/beach-palms.jpg",
    alt: "Rocky tropical coastline, shown as an illustrative Nassau heritage-tour image",
  },
  "Ardastra Gardens & Wildlife": {
    src: "/images/beach-palms.jpg",
    alt: "Tropical coastline, shown as an illustrative wildlife-tour image",
  },
  "Swimming with the Pigs (Exuma Day Trip)": {
    src: "/images/tour-pigs.jpg",
    alt: "White-sand beach, shown as an illustrative Exuma tour image",
  },
  "Atlantis Aquaventure Day": {
    src: "/images/tour-atlantis.jpg",
    alt: "Tropical resort pool, shown as an illustrative Atlantis day-trip image",
  },
  "Discover Atlantis": {
    src: "/images/tour-atlantis.jpg",
    alt: "Tropical resort pool, shown as an illustrative Atlantis tour image",
  },
  "Flying Cloud Catamaran Sail": {
    src: "/images/tour-catamaran.jpg",
    alt: "Private yacht on turquoise water, shown as an illustrative sailing-tour image",
  },
  "Deep Sea Fishing": {
    src: "/images/tour-catamaran.jpg",
    alt: "Private yacht on turquoise water, shown as an illustrative fishing-tour image",
  },
  "Island Total Package": {
    src: "/images/beach-palms.jpg",
    alt: "Rocky tropical coastline, shown as an illustrative island-tour image",
  },
  "Snorkel & Scuba Excursion": {
    src: "/images/tour-snorkel.jpg",
    alt: "Scuba diver exploring a tropical reef, shown as an illustrative tour image",
  },
};

const FEATURED = TOURS.filter((t) => t.publishedPrice);
const GRID = TOURS.filter((t) => !t.publishedPrice).slice(0, 6);

export function ToursSection() {
  return (
    <section id="tours" className="relative overflow-hidden bg-navy-50/60 py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <Eyebrow>Nassau Tours &amp; Experiences</Eyebrow>
              <h2 className="mt-4 font-display text-4xl font-semibold leading-[1.08] tracking-tight text-navy-950 sm:text-5xl">
                The island, unlocked by locals.
              </h2>
              <p className="mt-5 text-[15.5px] leading-relaxed text-navy-600">
                Heritage forts, marching flamingos at Ardastra, swimming pigs, catamaran sails and
                Atlantis days — arranged with transportation and a guide who actually lives here.
              </p>
            </div>
            <Link href="/book?service=tour" className={buttonClass("secondary", "md")}>
              Plan an experience <ArrowRight className="size-4" />
            </Link>
          </div>
        </Reveal>

        {/* Featured verified-price package */}
        {FEATURED.map((t) => (
          <Reveal key={t.name} delay={60}>
            <div className="mt-14 overflow-hidden rounded-2xl border border-navy-900/10 bg-white shadow-[var(--shadow-card)] lg:grid lg:grid-cols-[1.15fr_1fr]">
              <div className="relative min-h-[280px] overflow-hidden lg:min-h-[420px]">
                <Image
                  src="/images/gallery-reef.jpg"
                  alt="Scuba diver exploring a tropical reef, shown as an illustrative tour image"
                  fill
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute left-5 top-5 flex flex-wrap gap-2">
                  <Badge tone="green" className="bg-emerald-500 text-white ring-transparent">
                    Published rate
                  </Badge>
                  <Badge tone="navy" className="bg-navy-950/85 text-white ring-transparent">
                    <Clock3 className="size-3" /> {t.duration}
                  </Badge>
                </div>
              </div>
              <div className="flex flex-col justify-center p-8 sm:p-10">
                <p className="text-[11.5px] font-bold uppercase tracking-[0.22em] text-aqua-700">Featured Package</p>
                <h3 className="mt-2.5 font-display text-3xl font-semibold tracking-tight text-navy-950">
                  {t.name}
                </h3>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="font-display text-5xl font-semibold text-navy-950">${t.publishedPrice}</span>
                  <span className="text-[13px] font-semibold text-navy-500">per person</span>
                </div>
                <p className="mt-3 text-[12.5px] font-medium text-navy-500">
                  Exactly as published on the operator&apos;s current website.
                </p>
                <p className="mt-4 text-[13.5px] leading-relaxed text-navy-600">{t.blurb}</p>
                <ul className="mt-5 grid gap-2 text-[13px] font-medium text-navy-700 sm:grid-cols-2">
                  {[
                    "Snorkelling experience",
                    "Swim with the famous pigs",
                    "Jet ski ride (15 min p.p.)",
                    "Paddle boarding",
                    "Banana boat ride",
                    "Beach chairs & umbrellas",
                    "Drinks, water & rum punch",
                    "Light snacks included",
                  ].map((inc) => (
                    <li key={inc} className="flex items-start gap-2">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-aqua-600" strokeWidth={3} />
                      {inc}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 flex items-start gap-2 rounded-xl bg-sand-100 px-3.5 py-2.5 text-[12px] font-medium text-sand-700">
                  <Info className="mt-0.5 size-3.5 shrink-0" />
                  Children 15 years &amp; under must ride with a parent or guardian (as published).
                </p>
                <div className="mt-7">
                  <Link
                    href={`/book?service=tour&tour=${encodeURIComponent(t.name)}`}
                    className={buttonClass("primary", "lg", "w-full sm:w-auto")}
                  >
                    Request this package <ArrowRight className="size-4" />
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        ))}

        {/* Tour grid */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {GRID.map((t, i) => {
            const img = TOUR_IMAGES[t.name];
            return (
              <Reveal key={t.name} delay={i * 70}>
                <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-navy-900/10 bg-white shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <span className="absolute left-4 top-4 rounded-full bg-navy-950/85 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur-sm">
                      {t.duration}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="font-display text-[19px] font-semibold leading-snug tracking-tight text-navy-950">
                      {t.name}
                    </h3>
                    <p className="mt-2.5 flex-1 text-[13.5px] leading-relaxed text-navy-600">{t.blurb}</p>
                    <div className="mt-5 flex items-center justify-between gap-3">
                      <span className="text-[12.5px] font-bold uppercase tracking-[0.1em] text-navy-500">
                        Request a quote
                      </span>
                      <Link
                        href={`/book?service=tour&tour=${encodeURIComponent(t.name)}`}
                        className="inline-flex items-center gap-1.5 text-[13px] font-bold text-aqua-700 transition hover:gap-2.5 hover:text-aqua-600"
                      >
                        Book tour <ArrowRight className="size-3.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={40}>
          <div className="mt-10 flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-navy-900/20 bg-white px-5 py-4">
            <FlaskConical className="size-4 shrink-0 text-aqua-700" />
            <p className="text-[13px] leading-relaxed text-navy-600">
              <span className="font-bold text-navy-900">Honest pricing:</span> only fares published on the
              operator&apos;s website are shown. All other tours are quoted by the team — call{" "}
              <a href={BUSINESS.phoneHref} className="font-semibold text-aqua-700 underline underline-offset-2">
                {BUSINESS.phone}
              </a>{" "}
              or request a quote in the booking flow.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
