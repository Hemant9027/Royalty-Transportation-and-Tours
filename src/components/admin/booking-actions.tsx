"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, MailWarning, Save } from "lucide-react";
import { BOOKING_STATUSES, STATUS_META, type BookingStatus } from "@/lib/constants";
import { Badge } from "@/components/ui";
import { cx } from "@/lib/format";

export function BookingActions({
  id,
  status,
  internalNotes,
  notificationStatus,
}: {
  id: string;
  status: string;
  internalNotes: string;
  notificationStatus: string;
}) {
  const router = useRouter();
  const [newStatus, setNewStatus] = useState<BookingStatus>(status as BookingStatus);
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState(internalNotes);
  const [busy, setBusy] = useState<"status" | "notes" | null>(null);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  async function patch(body: Record<string, unknown>, kind: "status" | "notes") {
    setBusy(kind);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setMessage({ tone: "error", text: data.error ?? "Update failed" });
        if (res.status === 401) router.replace("/admin/login");
        return;
      }
      setMessage({ tone: "ok", text: kind === "status" ? "Status updated for this demo instance." : "Notes saved for this demo instance." });
      setNote("");
      router.refresh();
    } catch {
      setMessage({ tone: "error", text: "Network problem — update could not be applied." });
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="rounded-2xl border border-navy-900/10 bg-white p-6 shadow-[var(--shadow-card)]">
      <h2 className="text-[13px] font-bold uppercase tracking-[0.14em] text-navy-500">Operator actions</h2>

      {/* Status */}
      <div className="mt-5">
        <label className="block">
          <span className="mb-1.5 block text-[12px] font-bold text-navy-800">Status</span>
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as BookingStatus)}
            className="h-11 w-full rounded-xl border border-navy-900/12 bg-white px-3 text-[14px] font-semibold text-navy-900 transition focus:border-aqua-500 focus:outline-none focus:ring-2 focus:ring-aqua-500/25"
          >
            {BOOKING_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_META[s].label}
              </option>
            ))}
          </select>
        </label>
        <label className="mt-3 block">
          <span className="mb-1.5 block text-[12px] font-bold text-navy-800">Note for the timeline (optional)</span>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Vehicle assigned — Thomas"
            maxLength={500}
            className="w-full rounded-xl border border-navy-900/12 px-3.5 py-2.5 text-[13.5px] transition focus:border-aqua-500 focus:outline-none focus:ring-2 focus:ring-aqua-500/25"
          />
        </label>
        <button
          type="button"
          onClick={() => patch({ status: newStatus, note: note || undefined }, "status")}
          disabled={busy !== null || newStatus === status}
          className={cx(
            "mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-navy-950 text-[14px] font-bold text-white transition hover:bg-navy-800",
            (busy !== null || newStatus === status) && "opacity-50",
          )}
        >
          {busy === "status" ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
          Update status
        </button>
        <p className="mt-2 text-[11.5px] leading-relaxed text-navy-400">
          Updates apply to temporary demo data and may be lost when the server restarts. No
          email/SMS/WhatsApp message is sent.
        </p>
      </div>

      {/* Notification honesty */}
      <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-dashed border-navy-900/20 px-4 py-3">
        <MailWarning className="mt-0.5 size-4 shrink-0 text-amber-600" />
        <p className="text-[12px] leading-relaxed text-navy-500">
          Notification status for this request:{" "}
          <Badge tone={notificationStatus === "sent" ? "green" : notificationStatus === "failed" ? "rose" : "slate"}>
            {notificationStatus === "not_configured"
              ? "No email provider configured"
              : notificationStatus === "sent"
                ? "Email sent"
                : "Email failed"}
          </Badge>
        </p>
      </div>

      {/* Internal notes */}
      <div className="mt-6 border-t border-navy-900/10 pt-5">
        <label className="block">
          <span className="mb-1.5 block text-[12px] font-bold text-navy-800">Internal notes (admin only)</span>
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Vehicle assignment, quote agreed by phone, driver notes…"
            maxLength={4000}
            className="w-full rounded-xl border border-navy-900/12 px-3.5 py-2.5 text-[13.5px] leading-relaxed transition focus:border-aqua-500 focus:outline-none focus:ring-2 focus:ring-aqua-500/25"
          />
        </label>
        <button
          type="button"
          onClick={() => patch({ internalNotes: notes }, "notes")}
          disabled={busy !== null || notes === internalNotes}
          className={cx(
            "mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-navy-900/15 text-[13.5px] font-bold text-navy-900 transition hover:bg-navy-50",
            (busy !== null || notes === internalNotes) && "opacity-50",
          )}
        >
          {busy === "notes" ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Save internal notes
        </button>
      </div>

      {message && (
        <p
          role="status"
          className={cx(
            "mt-4 rounded-xl px-4 py-3 text-[13px] font-medium",
            message.tone === "ok" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700",
          )}
        >
          {message.text}
        </p>
      )}
    </section>
  );
}
