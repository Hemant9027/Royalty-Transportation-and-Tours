"use client";

import { useState } from "react";
import { Loader2, Save, ToggleLeft, ToggleRight } from "lucide-react";
import { cx } from "@/lib/format";

export interface ServiceRow {
  id: number;
  key: string;
  name: string;
  tagline: string;
  description: string;
  isActive: boolean;
}

export function ServicesEditor({ initial }: { initial: ServiceRow[] }) {
  const [rows, setRows] = useState(initial);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [savedId, setSavedId] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function patch(id: number, changes: Partial<ServiceRow>) {
    setBusyId(id);
    setError("");
    try {
      const res = await fetch("/api/admin/services", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...changes }),
      });
      const body = await res.json();
      if (!res.ok || !body.ok) throw new Error(body.error ?? "Update failed");
      setSavedId(id);
      setTimeout(() => setSavedId(null), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mt-6 space-y-4">
      {rows.map((s) => (
        <div
          key={s.id}
          className={cx(
            "rounded-2xl border bg-white p-6 shadow-[var(--shadow-card)] transition",
            s.isActive ? "border-navy-900/10" : "border-navy-900/10 opacity-70",
          )}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-[16px] font-bold tracking-tight text-navy-950">{s.name}</h2>
              <span className="rounded bg-navy-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-navy-600">
                {s.key}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                const next = !s.isActive;
                setRows((r) => r.map((x) => (x.id === s.id ? { ...x, isActive: next } : x)));
                void patch(s.id, { isActive: next });
              }}
              className={cx(
                "inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[12.5px] font-bold transition",
                s.isActive ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" : "bg-slate-100 text-slate-500 ring-1 ring-slate-200",
              )}
              aria-pressed={s.isActive}
            >
              {busyId === s.id ? (
                <Loader2 className="size-4 animate-spin" />
              ) : s.isActive ? (
                <ToggleRight className="size-4.5" />
              ) : (
                <ToggleLeft className="size-4.5" />
              )}
              {s.isActive ? "Bookable" : "Hidden from booking flow"}
            </button>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-[11.5px] font-bold uppercase tracking-[0.1em] text-navy-400">
                Tagline
              </span>
              <input
                value={s.tagline}
                onChange={(e) => setRows((r) => r.map((x) => (x.id === s.id ? { ...x, tagline: e.target.value } : x)))}
                className="w-full rounded-xl border border-navy-900/12 px-3.5 py-2.5 text-[13.5px] transition focus:border-aqua-500 focus:outline-none focus:ring-2 focus:ring-aqua-500/25"
              />
            </label>
            <div className="flex items-end justify-end gap-3">
              {savedId === s.id && <span className="pb-2 text-[12px] font-bold text-emerald-600">Saved ✓</span>}
              <button
                type="button"
                onClick={() => void patch(s.id, { tagline: s.tagline, description: s.description })}
                disabled={busyId !== null}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-navy-950 px-4 text-[13px] font-semibold text-white transition hover:bg-navy-800 disabled:opacity-50"
              >
                <Save className="size-4" /> Save copy
              </button>
            </div>
          </div>
          <label className="mt-4 block">
            <span className="mb-1 block text-[11.5px] font-bold uppercase tracking-[0.1em] text-navy-400">
              Description
            </span>
            <textarea
              rows={2}
              value={s.description}
              onChange={(e) => setRows((r) => r.map((x) => (x.id === s.id ? { ...x, description: e.target.value } : x)))}
              className="w-full rounded-xl border border-navy-900/12 px-3.5 py-2.5 text-[13.5px] leading-relaxed transition focus:border-aqua-500 focus:outline-none focus:ring-2 focus:ring-aqua-500/25"
            />
          </label>
        </div>
      ))}
      {error && (
        <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-[13px] font-medium text-rose-700">
          {error}
        </p>
      )}
    </div>
  );
}
