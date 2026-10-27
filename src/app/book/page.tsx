import type { Metadata } from "next";
import { FlaskConical } from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { BookingWizard } from "@/components/book/booking-wizard";
import type { WizardInitialParams } from "@/components/book/wizard-types";

export const metadata: Metadata = {
  title: "Book Your Ride",
  description:
    "Request an airport transfer, private ride, group shuttle or Nassau tour. Demo booking system — requests are confirmed by the operator, no payment is taken online.",
};

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const first = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);
  const initial: WizardInitialParams = {
    service: first(sp.service),
    pickup: first(sp.pickup),
    destination: first(sp.destination),
    date: first(sp.date),
    pax: first(sp.pax),
    tour: first(sp.tour),
  };

  return (
    <>
      <SiteHeader solid />
      <main className="min-h-screen bg-navy-50/60 pb-24 pt-28">
        <div className="mx-auto max-w-5xl px-5 lg:px-8">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-aqua-700">Demo Booking System</p>
              <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-navy-950 sm:text-5xl">
                Plan your Nassau ride.
              </h1>
            </div>
            <p className="flex max-w-xs items-start gap-2 rounded-xl border border-dashed border-navy-900/20 bg-white px-3.5 py-2.5 text-[11.5px] leading-relaxed text-navy-500">
              <FlaskConical className="mt-0.5 size-3.5 shrink-0" />
              Demo requests are temporary and may disappear when the server restarts. They are not
              sent to the operator; no payment is collected.
            </p>
          </div>
          <BookingWizard initial={initial} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
