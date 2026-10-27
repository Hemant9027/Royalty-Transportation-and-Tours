import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Bus,
  CalendarCheck,
  Car,
  ClipboardList,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  PhoneCall,
  Search,
  Snowflake,
  Star,
  UserRoundCheck,
} from "lucide-react";
import { Eyebrow, buttonClass } from "@/components/ui";
import { Reveal } from "@/components/reveal";
import { BUSINESS } from "@/lib/constants";

const STEPS = [
  {
    icon: Search,
    title: "Tell us the journey",
    copy: "Pick a service, your route or tour, date and party size. Flight details go in for arrivals.",
  },
  {
    icon: CalendarCheck,
    title: "We confirm personally",
    copy: "The Royalty team reviews the request and confirms your driver, vehicle and fare — nothing is auto-booked.",
  },
  {
    icon: UserRoundCheck,
    title: "Meet your greeter",
    copy: "Arrivals find a name sign outside the terminal. Departures get a punctual lobby pickup window.",
  },
  {
    icon: BadgeCheck,
    title: "Travel like royalty",
    copy: "Air-conditioned ride, luggage handled, local tips included — settle the confirmed fare directly.",
  },
];

const FLEET = [
  {
    icon: Bus,
    name: "Toyota Hiace — 15 passengers",
    copy: "The group workhorse: brand-new 15-seat Hiace vans, fully air-conditioned with generous luggage space.",
    tags: ["15 seats", "Full A/C", "Luggage space"],
  },
  {
    icon: Car,
    name: "SUV — private service",
    copy: "Private SUV service from a published $99 starting fare, with free refreshments and Capri Sun for the kids.",
    tags: ["Private", "From $99 (published)", "Refreshments"],
  },
  {
    icon: Snowflake,
    name: "Spotless & serviced",
    copy: "Vehicles are cleaned between trips and serviced on schedule — safety and presentation are the standard.",
    tags: ["Sanitised", "Maintained", "Insured"],
  },
];

const GALLERY = [
  { src: "/images/cta-nassau.jpg", alt: "Palm-lined tropical beach and sailboat" },
  { src: "/images/beach-palms.jpg", alt: "Rocky tropical coastline with turquoise water" },
  { src: "/images/gallery-island.jpg", alt: "Tropical resort pool among green gardens" },
  { src: "/images/gallery-reef.jpg", alt: "Scuba diver exploring a tropical reef" },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow className="justify-center">How It Works</Eyebrow>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-[1.08] tracking-tight text-navy-950 sm:text-5xl">
              Four steps to the perfect arrival.
            </h2>
          </div>
        </Reveal>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <Reveal key={s.title} delay={i * 90}>
              <div className="relative h-full rounded-2xl border border-navy-900/10 bg-white p-7 shadow-[var(--shadow-card)]">
                <span className="absolute right-6 top-6 font-display text-5xl font-semibold text-navy-900/8">
                  0{i + 1}
                </span>
                <span className="grid size-11 place-items-center rounded-xl bg-aqua-500/12 text-aqua-700 ring-1 ring-aqua-500/25">
                  <s.icon className="size-5" />
                </span>
                <h3 className="mt-5 text-[16px] font-bold tracking-tight text-navy-950">{s.title}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-navy-600">{s.copy}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={100}>
          <div className="mt-12 text-center">
            <Link href="/book" className={buttonClass("primary", "lg")}>
              Start a booking request <ArrowRight className="size-4" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function FleetGallerySection() {
  return (
    <section id="fleet" className="bg-navy-950 py-24 text-white lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <Eyebrow className="text-aqua-300">Fleet &amp; Gallery</Eyebrow>
              <h2 className="mt-4 font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">
                Clean, cool, and ready for your crew.
              </h2>
              <p className="mt-5 text-[15px] leading-relaxed text-white/65">
                The operator&apos;s published fleet: 15-passenger Toyota Hiace vans and private SUVs —
                fully air-conditioned with room for every bag.
              </p>
              <p className="mt-3 text-[12px] leading-relaxed text-white/45">
                Demo photos are illustrative stock imagery and do not depict the operator&apos;s fleet
                or exact tour locations.
              </p>
            </div>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {FLEET.map((f, i) => (
            <Reveal key={f.name} delay={i * 90}>
              <div className="h-full rounded-2xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur-sm transition-colors hover:border-aqua-400/40">
                <span className="grid size-11 place-items-center rounded-xl bg-aqua-500/15 text-aqua-300 ring-1 ring-aqua-400/30">
                  <f.icon className="size-5" />
                </span>
                <h3 className="mt-5 font-display text-xl font-semibold tracking-tight">{f.name}</h3>
                <p className="mt-2.5 text-[13.5px] leading-relaxed text-white/65">{f.copy}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {f.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/70"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={80}>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {GALLERY.map((g) => (
              <div key={g.src} className="group relative h-56 overflow-hidden rounded-2xl">
                <Image
                  src={g.src}
                  alt={g.alt}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-navy-950/10 transition group-hover:bg-transparent" />
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function ReviewsSection() {
  return (
    <section className="bg-navy-50/60 py-24 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal>
          <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <Eyebrow>What Travellers Say</Eyebrow>
              <h2 className="mt-4 font-display text-4xl font-semibold leading-[1.08] tracking-tight text-navy-950 sm:text-5xl">
                A five-star record you can read yourself.
              </h2>
              <p className="mt-5 max-w-xl text-[15.5px] leading-relaxed text-navy-600">
                Royalty Transportation and Tours holds a 5.0 rating on TripAdvisor. Rather than
                screenshotting quotes, we&apos;d rather you read the verified reviews at the source.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-4">
                <a
                  href={BUSINESS.tripadvisorUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonClass("secondary", "md")}
                >
                  <Star className="size-4 fill-aqua-400 text-aqua-400" /> Read reviews on TripAdvisor
                </a>
                <div className="flex items-center gap-1.5" aria-label="Rating: 5 out of 5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-5 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="ml-1.5 text-[13.5px] font-bold text-navy-800">5.0 / 5</span>
                </div>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <div className="rounded-2xl border border-navy-900/10 bg-white p-6 shadow-[var(--shadow-card)]">
                <p className="font-display text-4xl font-semibold text-navy-950">5.0</p>
                <p className="mt-1 text-[12.5px] font-semibold uppercase tracking-[0.12em] text-navy-500">
                  TripAdvisor rating
                </p>
              </div>
              <div className="rounded-2xl border border-navy-900/10 bg-white p-6 shadow-[var(--shadow-card)]">
                <p className="font-display text-4xl font-semibold text-navy-950">1,000+</p>
                <p className="mt-1 text-[12.5px] font-semibold uppercase tracking-[0.12em] text-navy-500">
                  Travellers hosted*
                </p>
              </div>
              <p className="text-[11.5px] leading-relaxed text-navy-400 sm:col-span-2">
                *Milestone figure published on the operator&apos;s current website — flagged for owner
                verification before production use.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function ContactSection() {
  return (
    <section id="contact" className="relative overflow-hidden">
      <div className="absolute inset-0">
        <Image src="/images/cta-nassau.jpg" alt="Palm-lined tropical beach and sailboat" fill sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-navy-950/78" />
      </div>
      <div className="relative mx-auto max-w-7xl px-5 py-24 lg:px-8 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <Reveal>
            <Eyebrow className="text-aqua-300">Talk To A Local</Eyebrow>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-[1.08] tracking-tight text-white sm:text-5xl">
              Landing soon? Let&apos;s get your ride ready.
            </h2>
            <p className="mt-5 max-w-lg text-[15.5px] leading-relaxed text-white/70">
              Call, WhatsApp, or request online — the Nassau team answers directly, in English or
              Spanish.
            </p>
            <div className="mt-9 grid gap-4 sm:grid-cols-2">
              <a
                href={BUSINESS.phoneHref}
                className="group rounded-2xl border border-white/15 bg-white/[0.06] p-5 backdrop-blur-sm transition hover:border-aqua-400/50"
              >
                <Phone className="size-5 text-aqua-300" />
                <p className="mt-3 text-[12px] font-bold uppercase tracking-[0.16em] text-white/55">Call dispatch</p>
                <p className="mt-1 text-[15px] font-bold text-white">{BUSINESS.phone}</p>
              </a>
              <a
                href={BUSINESS.whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="group rounded-2xl border border-white/15 bg-white/[0.06] p-5 backdrop-blur-sm transition hover:border-aqua-400/50"
              >
                <MessageCircle className="size-5 text-aqua-300" />
                <p className="mt-3 text-[12px] font-bold uppercase tracking-[0.16em] text-white/55">WhatsApp</p>
                <p className="mt-1 text-[15px] font-bold text-white">Message the team</p>
              </a>
              <a
                href={`mailto:${BUSINESS.email}`}
                className="group rounded-2xl border border-white/15 bg-white/[0.06] p-5 backdrop-blur-sm transition hover:border-aqua-400/50"
              >
                <Mail className="size-5 text-aqua-300" />
                <p className="mt-3 text-[12px] font-bold uppercase tracking-[0.16em] text-white/55">Email</p>
                <p className="mt-1 break-all text-[13.5px] font-bold text-white">{BUSINESS.email}</p>
              </a>
              <div className="rounded-2xl border border-white/15 bg-white/[0.06] p-5 backdrop-blur-sm">
                <MapPin className="size-5 text-aqua-300" />
                <p className="mt-3 text-[12px] font-bold uppercase tracking-[0.16em] text-white/55">Based at</p>
                <p className="mt-1 text-[13.5px] font-bold text-white">Buttonwood, Pinewood Gardens, Nassau</p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="rounded-2xl bg-white p-8 shadow-[var(--shadow-lift)] sm:p-10">
              <h3 className="font-display text-2xl font-semibold tracking-tight text-navy-950">
                Prefer to plan online?
              </h3>
              <p className="mt-3 text-[14px] leading-relaxed text-navy-600">
                Send a structured booking request — service, route, flight and party size — and the
                team responds with a confirmed plan and fare.
              </p>
              <div className="mt-7 space-y-3">
                <Link href="/book" className={buttonClass("primary", "lg", "w-full")}>
                  <ClipboardList className="size-4" /> Start a booking request
                </Link>
                <a href={BUSINESS.whatsappHref} target="_blank" rel="noreferrer" className={buttonClass("whatsapp", "lg", "w-full")}>
                  <MessageCircle className="size-4" /> Continue on WhatsApp
                </a>
                <a href={BUSINESS.phoneHref} className={buttonClass("outline", "lg", "w-full")}>
                  <PhoneCall className="size-4" /> {BUSINESS.phone}
                </a>
              </div>
              <p className="mt-5 text-center text-[12px] text-navy-400">
                No payment taken online — requests are confirmed by the operator first.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
