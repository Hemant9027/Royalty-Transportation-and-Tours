"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Crown, Menu, Phone, X } from "lucide-react";
import { BUSINESS } from "@/lib/constants";
import { buttonClass } from "@/components/ui";
import { cx } from "@/lib/format";

const NAV = [
  { label: "Services", href: "/#services" },
  { label: "Tours", href: "/#tours" },
  { label: "Fleet", href: "/#fleet" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Contact", href: "/#contact" },
];

export function SiteHeader({ solid = false }: { solid?: boolean }) {
  const [scrolled, setScrolled] = useState(solid);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (solid) return;
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [solid]);

  const dark = !scrolled && !open;

  return (
    <header
      className={cx(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled || open ? "bg-navy-950/90 shadow-lg shadow-navy-950/20 backdrop-blur-md" : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-5 lg:px-8">
        <Link href="/" className="group flex items-center gap-3" aria-label="Royalty Transportation and Tours — home">
          <span className="grid size-10 place-items-center rounded-xl bg-aqua-500/15 ring-1 ring-aqua-400/40 transition group-hover:bg-aqua-500/25">
            <Crown className="size-5 text-aqua-400" strokeWidth={2.2} />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-[17px] font-semibold tracking-tight text-white">
              Royalty <span className="text-aqua-400">Transportation</span>
            </span>
            <span className="block text-[10.5px] font-semibold uppercase tracking-[0.24em] text-white/60">
              &amp; Tours · Nassau, Bahamas
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cx(
                "text-[13.5px] font-semibold tracking-tight transition-colors",
                dark ? "text-white/80 hover:text-white" : "text-white/75 hover:text-aqua-300",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={BUSINESS.phoneHref}
            className="hidden items-center gap-2 text-[13.5px] font-semibold text-white/85 transition hover:text-white md:flex"
          >
            <Phone className="size-4" /> {BUSINESS.phone}
          </a>
          <Link href="/book" className={buttonClass("primary", "md", "hidden sm:inline-flex")}>
            Book Your Ride
          </Link>
          <button
            className="grid size-10 place-items-center rounded-lg text-white lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-navy-950/95 px-5 pb-6 pt-3 backdrop-blur-md lg:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-[15px] font-semibold text-white/85 hover:bg-white/5 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
            <Link href="/book" onClick={() => setOpen(false)} className={buttonClass("primary", "lg", "mt-3 w-full")}>
              Book Your Ride
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
