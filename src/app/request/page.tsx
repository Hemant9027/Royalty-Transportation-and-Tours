import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { RequestLookup } from "@/components/book/request-lookup";

export const metadata: Metadata = {
  title: "Track Your Request",
  description: "Check the status of a demo booking request with Royalty Transportation & Tours.",
};

export default async function RequestPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const ref = typeof sp.ref === "string" ? sp.ref : "";

  return (
    <>
      <SiteHeader solid />
      <main className="min-h-[80vh] bg-navy-50/60 pb-24 pt-32">
        <div className="mx-auto max-w-xl px-5">
          <div className="text-center">
            <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-aqua-700">Demo Request Tracker</p>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-navy-950">
              Where is my request?
            </h1>
            <p className="mt-3 text-[14.5px] leading-relaxed text-navy-600">
              Enter your booking reference and the email on the request. Statuses update when the
              team reviews your booking.
            </p>
          </div>
          <div className="mt-8 rounded-2xl border border-navy-900/10 bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
            <RequestLookup initialRef={ref} />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
