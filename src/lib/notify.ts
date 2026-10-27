import "server-only";
import { BUSINESS } from "./constants";

/**
 * Integration-ready notification layer (demo).
 *
 * Behaviour is deliberately honest:
 *  - If NOTIFY_PROVIDER=resend and RESEND_API_KEY is set, a booking notification
 *    email is attempted via the Resend API and the result ("sent" | "failed") is
 *    persisted on the booking record.
 *  - Otherwise the function returns "not_configured" and NOTHING is claimed to
 *    have been sent. The booking is still stored and visible in the dashboard.
 */

export type NotificationStatus = "not_configured" | "sent" | "failed";

export function notifyConfigured(): boolean {
  return process.env.NOTIFY_PROVIDER === "resend" && Boolean(process.env.RESEND_API_KEY);
}

export function notifyConfigSummary(): string {
  if (notifyConfigured()) return "Resend email delivery is configured.";
  return "No email provider configured — requests appear in the dashboard only.";
}

export async function sendBookingNotification(input: {
  reference: string;
  serviceLabel: string;
  customerName: string;
  customerEmail: string;
  summary: string;
}): Promise<NotificationStatus> {
  if (!notifyConfigured()) {
    return "not_configured";
  }

  const to = process.env.NOTIFY_TO ?? BUSINESS.email;
  const from = process.env.NOTIFY_FROM ?? "notifications@demo.royalty-transportation.local";

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: `[DEMO] New booking request ${input.reference} — ${input.serviceLabel}`,
        text: [
          "DEMO NOTIFICATION — not a live reservation.",
          "",
          `Reference: ${input.reference}`,
          `Service: ${input.serviceLabel}`,
          `Customer: ${input.customerName} <${input.customerEmail}>`,
          "",
          input.summary,
          "",
          "Review this request in the demo admin dashboard.",
        ].join("\n"),
      }),
    });
    return res.ok ? "sent" : "failed";
  } catch (err) {
    console.error("[notify] booking notification failed:", err);
    return "failed";
  }
}
