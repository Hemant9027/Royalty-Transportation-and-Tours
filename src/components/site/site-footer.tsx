import Link from "next/link";
import { Crown, FlaskConical, Mail, MapPin, Phone, Star } from "lucide-react";
import { BUSINESS, SERVICES, TOURS } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="bg-navy-950 text-white">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-aqua-500/15 ring-1 ring-aqua-400/40">
                <Crown className="size-5 text-aqua-400" strokeWidth={2.2} />
              </span>
              <div className="leading-tight">
                <p className="font-display text-[17px] font-semibold tracking-tight">
                  Royalty <span className="text-aqua-400">Transportation</span>
                </p>
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.24em] text-white/55">
                  &amp; Tours · Nassau, Bahamas
                </p>
              </div>
            </div>
            <p className="mt-5 max-w-sm text-[13.5px] leading-relaxed text-white/60">
              Ground transportation and island tours across Nassau and Paradise Island — airport
              transfers with meet &amp; greet, private rides, group shuttles and experiences designed
              around your journey.
            </p>
            <a
              href={BUSINESS.tripadvisorUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/15 px-3.5 py-1.5 text-[12px] font-semibold text-white/80 transition hover:border-aqua-400/50 hover:text-aqua-300"
            >
              <Star className="size-3.5 fill-aqua-400 text-aqua-400" />
              Rated 5.0 on TripAdvisor — read traveller reviews
            </a>
          </div>

          <div>
            <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] text-aqua-400">Services</h3>
            <ul className="mt-4 space-y-2.5">
              {SERVICES.map((s) => (
                <li key={s.key}>
                  <Link
                    href={`/book?service=${s.key}`}
                    className="text-[13.5px] font-medium text-white/65 transition hover:text-white"
                  >
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] text-aqua-400">Popular Tours</h3>
            <ul className="mt-4 space-y-2.5">
              {TOURS.slice(0, 6).map((t) => (
                <li key={t.name}>
                  <Link
                    href={`/book?service=tour&tour=${encodeURIComponent(t.name)}`}
                    className="text-[13.5px] font-medium text-white/65 transition hover:text-white"
                  >
                    {t.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] text-aqua-400">Contact</h3>
            <ul className="mt-4 space-y-3 text-[13.5px] font-medium text-white/65">
              <li>
                <a href={BUSINESS.phoneHref} className="flex items-start gap-2.5 transition hover:text-white">
                  <Phone className="mt-0.5 size-4 shrink-0 text-aqua-400" /> {BUSINESS.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${BUSINESS.email}`} className="flex items-start gap-2.5 transition hover:text-white">
                  <Mail className="mt-0.5 size-4 shrink-0 text-aqua-400" />
                  <span className="break-all">{BUSINESS.email}</span>
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-aqua-400" /> {BUSINESS.address}
              </li>
            </ul>
            <div className="mt-6 flex gap-3">
              <Link
                href="/book"
                className="inline-flex h-10 items-center rounded-xl bg-aqua-500 px-4 text-[13px] font-semibold text-navy-950 transition hover:bg-aqua-400"
              >
                Book Your Ride
              </Link>
              <Link
                href="/request"
                className="inline-flex h-10 items-center rounded-xl border border-white/20 px-4 text-[13px] font-semibold text-white/85 transition hover:border-aqua-400/50 hover:text-aqua-300"
              >
                Track a Request
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-6 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-[12px] text-white/45">
            © {new Date().getFullYear()} {BUSINESS.legalName}. Concept redesign prepared as a product demo.
            <span className="mt-1 block">
              Photos are illustrative stock imagery, not the operator&apos;s fleet or exact tour locations.
            </span>
          </p>
          <p className="inline-flex items-center gap-2 text-[12px] font-medium text-amber-200/90">
            <FlaskConical className="size-3.5" />
            Demo environment — booking requests submitted here are not live reservations and no payment is taken.
          </p>
        </div>
      </div>
    </footer>
  );
}
