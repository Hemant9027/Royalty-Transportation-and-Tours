"use client";

import { useState } from "react";
import { BadgeDollarSign, Loader2, Plus, Trash2 } from "lucide-react";
import { SERVICES } from "@/lib/constants";
import { formatMoney, cx } from "@/lib/format";
import { Button } from "@/components/ui";

type RuleType = "fixed_route" | "per_person" | "per_vehicle" | "return_multiplier" | "additional_stop" | "surcharge";

interface Rule {
  id: number;
  name: string;
  ruleType: string;
  serviceKey: string | null;
  matchFrom: string | null;
  matchTo: string | null;
  unitAmountCents: number | null;
  multiplierBps: number | null;
  isActive: boolean;
  source: string;
  notes: string | null;
}

const TYPE_LABELS: Record<RuleType, string> = {
  fixed_route: "Fixed-price route",
  per_person: "Per-passenger",
  per_vehicle: "Per vehicle / group",
  return_multiplier: "Return-trip multiplier",
  additional_stop: "Additional stop",
  surcharge: "Surcharge",
};

const inputCls =
  "w-full rounded-xl border border-navy-900/12 bg-white px-3.5 py-2.5 text-[13.5px] transition focus:border-aqua-500 focus:outline-none focus:ring-2 focus:ring-aqua-500/25";

export function PricingRulesManager({ initial }: { initial: Rule[] }) {
  const [rules, setRules] = useState<Rule[]>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const emptyForm = {
    name: "",
    ruleType: "fixed_route" as RuleType,
    serviceKey: "",
    matchFrom: "",
    matchTo: "",
    amount: "",
    multiplier: "1.8",
    notes: "",
  };
  const [form, setForm] = useState(emptyForm);

  async function refreshList(nextRules: Rule[]) {
    setRules(nextRules);
  }

  async function toggle(rule: Rule) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/pricing-rules", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: rule.id, isActive: !rule.isActive }),
      });
      const body = await res.json();
      if (!res.ok || !body.ok) throw new Error(body.error ?? "Update failed");
      await refreshList(body.rules);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Toggle failed");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: number) {
    if (!confirm("Delete this demo pricing rule? This cannot be undone.")) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/pricing-rules?id=${id}`, { method: "DELETE" });
      const body = await res.json();
      if (!res.ok || !body.ok) throw new Error(body.error ?? "Delete failed");
      setRules((r) => r.filter((x) => x.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const dollars = parseFloat(form.amount.replace(/[^0-9.]/g, ""));
      const res = await fetch("/api/admin/pricing-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          ruleType: form.ruleType,
          serviceKey: form.serviceKey || null,
          matchFrom: form.matchFrom || null,
          matchTo: form.matchTo || null,
          unitAmountCents: Number.isFinite(dollars) ? Math.round(dollars * 100) : null,
          multiplierBps: form.ruleType === "return_multiplier" ? Math.round(parseFloat(form.multiplier) * 10000) : null,
          notes: form.notes || undefined,
        }),
      });
      const body = await res.json();
      if (!res.ok || !body.ok) throw new Error(body.error ?? "Could not create rule");
      setRules((r) => [...r, body.rule]);
      setForm(emptyForm);
      setShowForm(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Create failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl border border-navy-900/10 bg-white shadow-[var(--shadow-card)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-navy-900/10 px-6 py-4">
        <h2 className="flex items-center gap-2 text-[14px] font-bold tracking-tight text-navy-950">
          <BadgeDollarSign className="size-4.5 text-aqua-700" /> Demo pricing rules
        </h2>
        <Button size="sm" variant="outline" onClick={() => setShowForm((v) => !v)}>
          <Plus className="size-4" /> {showForm ? "Cancel" : "Add rule"}
        </Button>
      </div>

      <p className="border-b border-navy-900/8 bg-navy-50/60 px-6 py-3 text-[12px] leading-relaxed text-navy-500">
        Rules marked <span className="font-bold text-emerald-700">published</span> mirror figures on the
        operator&apos;s current website; rules marked{" "}
        <span className="font-bold text-amber-700">demo</span> are simulated samples. When no rule matches a
        journey, the customer sees “Request a Quote” — never an invented price.
      </p>

      {showForm && (
        <form onSubmit={create} className="grid gap-4 border-b border-navy-900/10 bg-navy-50/40 px-6 py-5 sm:grid-cols-2 lg:grid-cols-3">
          <label className="block sm:col-span-2 lg:col-span-1">
            <span className="mb-1 block text-[11.5px] font-bold uppercase tracking-[0.1em] text-navy-400">Name</span>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} placeholder="e.g. NAS → Cable Beach zone" />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11.5px] font-bold uppercase tracking-[0.1em] text-navy-400">Rule type</span>
            <select value={form.ruleType} onChange={(e) => setForm({ ...form, ruleType: e.target.value as RuleType })} className={inputCls}>
              {Object.entries(TYPE_LABELS).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-[11.5px] font-bold uppercase tracking-[0.1em] text-navy-400">Service scope</span>
            <select value={form.serviceKey} onChange={(e) => setForm({ ...form, serviceKey: e.target.value })} className={inputCls}>
              <option value="">All services</option>
              {SERVICES.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          {form.ruleType === "fixed_route" && (
            <>
              <label className="block">
                <span className="mb-1 block text-[11.5px] font-bold uppercase tracking-[0.1em] text-navy-400">
                  From keyword (or * / tour name)
                </span>
                <input value={form.matchFrom} onChange={(e) => setForm({ ...form, matchFrom: e.target.value })} className={inputCls} placeholder="airport" />
              </label>
              <label className="block">
                <span className="mb-1 block text-[11.5px] font-bold uppercase tracking-[0.1em] text-navy-400">To keyword</span>
                <input value={form.matchTo} onChange={(e) => setForm({ ...form, matchTo: e.target.value })} className={inputCls} placeholder="cable beach" />
              </label>
            </>
          )}
          {form.ruleType !== "return_multiplier" ? (
            <label className="block">
              <span className="mb-1 block text-[11.5px] font-bold uppercase tracking-[0.1em] text-navy-400">Amount (USD)</span>
              <input value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className={inputCls} placeholder="99.00" inputMode="decimal" />
            </label>
          ) : (
            <label className="block">
              <span className="mb-1 block text-[11.5px] font-bold uppercase tracking-[0.1em] text-navy-400">Multiplier (×)</span>
              <input value={form.multiplier} onChange={(e) => setForm({ ...form, multiplier: e.target.value })} className={inputCls} placeholder="1.8" inputMode="decimal" />
            </label>
          )}
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-[11.5px] font-bold uppercase tracking-[0.1em] text-navy-400">Notes</span>
            <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={inputCls} placeholder="Provenance, verification status…" />
          </label>
          <div className="flex items-end">
            <Button type="submit" variant="secondary" disabled={busy}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />} Create demo rule
            </Button>
          </div>
        </form>
      )}

      <ul className="divide-y divide-navy-900/6">
        {rules.map((r) => (
          <li key={r.id} className="grid gap-3 px-6 py-4 lg:grid-cols-[1.6fr_1fr_auto_auto] lg:items-center">
            <div className="min-w-0">
              <p className="text-[13.5px] font-bold text-navy-950">
                {r.name}{" "}
                <span
                  className={cx(
                    "ml-1 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                    r.source === "published" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700",
                  )}
                >
                  {r.source}
                </span>
              </p>
              <p className="mt-0.5 truncate text-[12px] text-navy-500">
                {TYPE_LABELS[r.ruleType as RuleType] ?? r.ruleType} ·{" "}
                {r.serviceKey ? SERVICES.find((s) => s.key === r.serviceKey)?.name ?? r.serviceKey : "All services"}
                {r.matchFrom ? ` · "${r.matchFrom}" → "${r.matchTo ?? "*"}"` : ""}
                {r.notes ? ` — ${r.notes}` : ""}
              </p>
            </div>
            <p className="text-[15px] font-bold text-navy-950">
              {r.ruleType === "return_multiplier"
                ? `${((r.multiplierBps ?? 10000) / 10000).toFixed(2)}×`
                : r.unitAmountCents != null
                  ? formatMoney(r.unitAmountCents)
                  : "—"}
            </p>
            <button
              type="button"
              onClick={() => void toggle(r)}
              disabled={busy}
              className={cx(
                "h-9 rounded-full px-4 text-[12px] font-bold ring-1 transition disabled:opacity-50",
                r.isActive
                  ? "bg-emerald-50 text-emerald-700 ring-emerald-200 hover:bg-emerald-100"
                  : "bg-slate-100 text-slate-500 ring-slate-200 hover:bg-slate-200",
              )}
            >
              {r.isActive ? "Active" : "Disabled"}
            </button>
            <button
              type="button"
              onClick={() => void remove(r.id)}
              disabled={busy}
              aria-label={`Delete rule ${r.name}`}
              className="grid size-9 place-items-center rounded-lg text-rose-500 transition hover:bg-rose-50 disabled:opacity-50"
            >
              <Trash2 className="size-4" />
            </button>
          </li>
        ))}
      </ul>

      {error && (
        <p role="alert" className="mx-6 mb-5 rounded-xl bg-rose-50 px-4 py-3 text-[13px] font-medium text-rose-700">
          {error}
        </p>
      )}
    </section>
  );
}
