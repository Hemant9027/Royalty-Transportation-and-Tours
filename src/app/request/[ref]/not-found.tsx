import Link from "next/link";
import { Compass } from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { buttonClass } from "@/components/ui";

export default function RequestNotFound() {
  return (
    <>
      <SiteHeader solid />
      <main className="flex min-h-[70vh] items-center justify-center bg-navy-50/60 px-5 pb-24 pt-28">
        <div className="max-w-md text-center">
          <Compass className="mx-auto size-10 text-navy-300" />
          <h1 className="mt-5 font-display text-3xl font-semibold tracking-tight text-navy-950">
            We can&apos;t find that reference
          </h1>
          <p className="mt-3 text-[14px] leading-relaxed text-navy-600">
            Double-check the reference from your confirmation (it starts with ROY-DEMO-). If you just
            submitted, allow a moment and refresh.
          </p>
          <div className="mt-7 flex justify-center gap-3">
            <Link href="/request" className={buttonClass("primary", "md")}>
              Look up a request
            </Link>
            <Link href="/" className={buttonClass("outline", "md")}>
              Home
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
