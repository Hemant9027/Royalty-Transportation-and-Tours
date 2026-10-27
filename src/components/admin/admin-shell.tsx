"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ClipboardList,
  Crown,
  FlaskConical,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Settings2,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { cx } from "@/lib/format";
import { BUSINESS } from "@/lib/constants";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/bookings", label: "Bookings", icon: ClipboardList },
  { href: "/admin/services", label: "Services & Catalog", icon: SlidersHorizontal },
  { href: "/admin/settings", label: "Settings & Pricing", icon: Settings2 },
];

export function AdminShell({ email, children }: { email: string; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      router.replace("/admin/login");
      router.refresh();
    }
  }

  const nav = (
    <nav className="flex flex-1 flex-col gap-1" aria-label="Admin">
      {NAV.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cx(
              "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13.5px] font-semibold transition",
              active ? "bg-aqua-500/15 text-aqua-300 ring-1 ring-aqua-400/30" : "text-white/60 hover:bg-white/5 hover:text-white",
            )}
          >
            <item.icon className="size-4.5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-navy-50/70 lg:grid lg:grid-cols-[256px_1fr]">
      {/* Sidebar (desktop) */}
      <aside className="hidden flex-col bg-navy-950 px-4 py-6 lg:sticky lg:top-0 lg:flex lg:h-screen">
        <div className="flex items-center gap-3 px-2">
          <span className="grid size-9 place-items-center rounded-xl bg-aqua-500/15 ring-1 ring-aqua-400/40">
            <Crown className="size-4.5 text-aqua-400" />
          </span>
          <div className="leading-tight">
            <p className="font-display text-[15px] font-semibold text-white">Royalty Demo Console</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">{BUSINESS.city}</p>
          </div>
        </div>

        <div className="mt-7 flex items-center gap-2 rounded-xl border border-amber-300/25 bg-amber-400/10 px-3.5 py-2.5">
          <FlaskConical className="size-4 shrink-0 text-amber-300" />
          <p className="text-[11px] font-semibold leading-snug text-amber-100">
            Demo environment — no live reservations
          </p>
        </div>

        <div className="mt-7 flex flex-1 flex-col">{nav}</div>

        <div className="mt-6 border-t border-white/10 pt-5">
          <p className="truncate px-2 text-[12px] font-medium text-white/45" title={email}>
            Signed in as {email}
          </p>
          <button
            onClick={logout}
            disabled={loggingOut}
            className="mt-2 flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13.5px] font-semibold text-white/60 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
          >
            {loggingOut ? <Loader2 className="size-4.5 animate-spin" /> : <LogOut className="size-4.5" />}
            Sign out
          </button>
          <Link
            href="/"
            className="mt-1 flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13.5px] font-semibold text-white/60 transition hover:bg-white/5 hover:text-white"
          >
            <Crown className="size-4.5" /> View website
          </Link>
        </div>
      </aside>

      {/* Mobile topbar */}
      <div className="sticky top-0 z-40 flex items-center justify-between bg-navy-950 px-4 py-3.5 lg:hidden">
        <div className="flex items-center gap-2.5">
          <Crown className="size-5 text-aqua-400" />
          <p className="font-display text-[15px] font-semibold text-white">Demo Console</p>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="grid size-10 place-items-center rounded-lg text-white"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      {open && (
        <div className="border-b border-white/10 bg-navy-950 px-4 pb-5 pt-1 lg:hidden">
          {nav}
          <button
            onClick={logout}
            className="mt-3 flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13.5px] font-semibold text-white/60 hover:bg-white/5"
          >
            <LogOut className="size-4.5" /> Sign out
          </button>
        </div>
      )}

      <main className="min-w-0 px-4 py-8 sm:px-6 lg:px-10 lg:py-10">{children}</main>
    </div>
  );
}
