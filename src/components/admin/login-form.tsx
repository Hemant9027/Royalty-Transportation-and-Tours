"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogIn } from "lucide-react";

const inputCls =
  "w-full rounded-xl border border-white/15 bg-white/[0.07] px-4 py-3 text-[14px] text-white placeholder:text-white/35 transition focus:border-aqua-400 focus:outline-none focus:ring-2 focus:ring-aqua-400/25";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const body = await res.json();
      if (!res.ok || !body.ok) {
        setError(body.error ?? "Sign-in failed");
        return;
      }
      router.replace("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Network problem — please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-[12px] font-bold uppercase tracking-[0.12em] text-white/60">
          Demo admin email
        </span>
        <input
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@example.com"
          className={inputCls}
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-[12px] font-bold uppercase tracking-[0.12em] text-white/60">
          Password
        </span>
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className={inputCls}
        />
      </label>
      {error && (
        <p role="alert" className="rounded-xl bg-rose-500/15 px-4 py-3 text-[13px] font-medium text-rose-200">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={busy}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-aqua-500 text-[14.5px] font-bold text-navy-950 transition hover:bg-aqua-400 disabled:opacity-60"
      >
        {busy ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />}
        Sign in to demo console
      </button>
    </form>
  );
}
