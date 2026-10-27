import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Bus,
  Car,
  ClipboardCheck,
  Compass,
  ConciergeBell,
  CreditCard,
  Luggage,
  PhoneCall,
  PlaneLanding,
  PlaneTakeoff,
  Snowflake,
  UserRound,
} from "lucide-react";
import { Eyebrow, buttonClass } from "@/components/ui";
import { Reveal } from "@/components/reveal";

const SERVICES_CARDS = [
  {
    key: "airport_arrival",
    icon: PlaneLanding,
    title: "Airport Arrival Transfer",
    copy: "Land at Lynden Pindling International, walk out of arrivals, and find your name on our sign. Bags handled, route planned — you just exhale.",
    image: "/images/airport-transfer.jpg",
    alt: "White SUV parked on a scenic road, shown as a transportation demo image",
  },
  {
    key: "hotel_transfer",
    icon: Building2,
    title: "Private Rides & Hotel Transfers",
    copy: "Resort-to-resort moves, dinners, beach clubs and grocery or liquor-store stops — a private vehicle that works around your plans.",
    image: "/images/private-ride.jpg",
    alt: "Blue compact car parked on a city street, shown as a private-ride demo image",
  },
  {
    key: "group_transport",
    icon: Bus,
    title: "Group Transportation",
    copy: "Air-conditioned 15-passenger Toyota Hiace vans with room for luggage — weddings, reunions, corporate groups and cruise excursions.",
    image: "/images/group-transport.jpg",
    alt: "Tour coach at a mountain destination, shown as a group-transport demo image",
  },
  {
    key: "tour",
    icon: Compass,
    title: "Nassau Tours & Experiences",
    copy: "City and heritage tours, swimming pigs, catamaran days and water-sport packages with local guides — in English or Spanish.",
    image: "/images/tour-pigs.jpg",
    alt: "White-sand tropical beach used as an illustrative Exuma tour image",
  },
];

export function ServicesSection() {
  return (
    <section id="services" className="bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal>
          <div className="max-w-2xl">
            <Eyebrow>Ground Transport, Done Properly</Eyebrow>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-[1.08] tracking-tight text-navy-950 sm:text-5xl">
              Every mile of your stay, taken care of.
            </h2>
            <p className="mt-5 text-[15.5px] leading-relaxed text-navy-600">
              From the moment your flight lands to your last ride back to the airport, one team
              handles the road so you can focus on the water.
            </p>
          </div>
        </Reveal>

        {/* Meet & greet spotlight */}
        <Reveal delay={80}>
          <div className="mt-14 overflow-hidden rounded-2xl bg-navy-950 lg:grid lg:grid-cols-2">
            <div className="relative min-h-[300px] lg:min-h-[440px]">
              <Image
                src="/images/airport-transfer.jpg"
                alt="White SUV on a scenic road, used as an illustrative airport-transfer image"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 to-transparent lg:bg-gradient-to-r" />
            </div>
            <div className="relative p-8 text-white sm:p-12">
              <Eyebrow className="text-aqua-300">Signature Service</Eyebrow>
              <h3 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                Airport meet &amp; greet, included as standard.
              </h3>
              <p className="mt-4 text-[14.5px] leading-relaxed text-white/70">
                A dedicated greeter waits outside the arrivals entrance at NAS with your name on a
                sign. Flight tracking means we adjust when your plane does — early or late.
              </p>
              <ul className="mt-7 grid gap-3.5 text-[13.5px] font-medium text-white/80 sm:grid-cols-2">
                {[
                  { icon: ClipboardCheck, label: "Name-sign welcome outside arrivals" },
                  { icon: PlaneLanding, label: "Flight monitored for delays" },
                  { icon: Luggage, label: "Luggage assistance to the vehicle" },
                  { icon: Snowflake, label: "Air-conditioned, spotless vehicles" },
                  { icon: UserRound, label: "Licensed, vetted local drivers" },
                  { icon: ConciergeBell, label: "Grocery & liquor-store stops on request" },
                ].map((f) => (
                  <li key={f.label} className="flex items-start gap-2.5">
                    <f.icon className="mt-0.5 size-4 shrink-0 text-aqua-400" />
                    {f.label}
                  </li>
                ))}
              </ul>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/book?service=airport_arrival" className={buttonClass("primary", "md")}>
                  Book an Arrival Transfer <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/book?service=airport_departure"
                  className={buttonClass("outline", "md", "border-white/25 bg-transparent text-white hover:bg-white/10")}
                >
                  Departure transfer
                </Link>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Service grid */}
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {SERVICES_CARDS.map((s, i) => (
            <Reveal key={s.key} delay={i * 90}>
              <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-navy-900/10 bg-white shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]">
                <div className="relative h-44 overflow-hidden">
                  <Image
                    src={s.image}
                    alt={s.alt}
                    fill
                    sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <span className="absolute left-4 top-4 grid size-10 place-items-center rounded-xl bg-navy-950/85 text-aqua-300 backdrop-blur-sm">
                    <s.icon className="size-5" />
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-display text-[19px] font-semibold tracking-tight text-navy-950">{s.title}</h3>
                  <p className="mt-2.5 flex-1 text-[13.5px] leading-relaxed text-navy-600">{s.copy}</p>
                  <Link
                    href={`/book?service=${s.key}`}
                    className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-bold text-aqua-700 transition hover:gap-2.5 hover:text-aqua-600"
                  >
                    Request this service <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        {/* Assurance strip */}
        <Reveal delay={60}>
          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-navy-900/10 bg-navy-900/10 sm:grid-cols-3">
            {[
              {
                icon: BadgeCheck,
                title: "Ministry-aligned fares",
                copy: "Group travel fares follow the Ministry of Public Works & Transport guidelines.",
              },
              {
                icon: PhoneCall,
                title: "Real people, fast answers",
                copy: "Call or WhatsApp the Nassau dispatch line — no chatbots, no waiting queues.",
              },
              {
                icon: CreditCard,
                title: "Book now, settle with the team",
                copy: "Requests are confirmed by the operator first. This demo never takes payment.",
              },
            ].map((a) => (
              <div key={a.title} className="flex flex-col bg-white p-7">
                <a.icon className="size-6 text-aqua-600" />
                <h3 className="mt-4 text-[15px] font-bold tracking-tight text-navy-950">{a.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-navy-600">{a.copy}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
