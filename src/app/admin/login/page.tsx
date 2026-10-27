import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Crown } from "lucide-react";
import { getAdminFromCookie, demoAuthConfigured } from "@/lib/auth";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = { title: "Demo Admin — Sign In" };
export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const admin = await getAdminFromCookie();
  if (admin) redirect("/admin/dashboard");

  const configured = demoAuthConfigured();

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-950 px-5">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-1/3 size-[480px] rounded-full bg-aqua-500/10 blur-[120px]" />
        <div className="absolute -right-32 bottom-0 size-[420px] rounded-full bg-navy-500/20 blur-[120px]" />
      </div>
      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-aqua-500/15 ring-1 ring-aqua-400/40">
            <Crown className="size-6 text-aqua-400" />
          </span>
          <h1 className="mt-5 font-display text-3xl font-semibold tracking-tight text-white">
            Demo Admin Console
          </h1>
          <p className="mt-2 text-[13.5px] text-white/55">
            Royalty Transportation &amp; Tours — evaluation environment
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-7 shadow-[var(--shadow-lift)] backdrop-blur-md sm:p-8">
          {configured ? (
            <LoginForm />
          ) : (
            <div className="rounded-xl border border-amber-300/30 bg-amber-400/10 px-4 py-4 text-[13px] leading-relaxed text-amber-100">
              <p className="font-bold">Admin credentials are not configured.</p>
              <p className="mt-1.5 text-amber-100/80">
                Set <code className="rounded bg-white/10 px-1">DEMO_ADMIN_EMAIL</code> and{" "}
                <code className="rounded bg-white/10 px-1">DEMO_ADMIN_PASSWORD</code> in the
                environment, then reload. See <code className="rounded bg-white/10 px-1">.env.example</code>.
              </p>
            </div>
          )}
          <p className="mt-5 text-center text-[11.5px] leading-relaxed text-white/40">
            Demo account credentials come from environment variables only. Sessions are stored
            server-side and expire automatically.
          </p>
        </div>

        <p className="mt-6 text-center">
          <Link href="/" className="text-[13px] font-semibold text-white/50 transition hover:text-aqua-300">
            ← Back to the website
          </Link>
        </p>
      </div>
    </div>
  );
}
