"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileSearch, Loader2 } from "lucide-react";
import { Field, inputClass, buttonClass } from "@/components/ui";

export function RequestLookup({ initialRef = "" }: { initialRef?: string }) {
  const router = useRouter();
  const [reference, setReference] = useState(initialRef);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const ref = reference.trim().toUpperCase();
    if (!/^ROY-DEMO-[A-Z0-9]{4,10}$/.test(ref)) {
      setError("Enter a valid reference, e.g. ROY-DEMO-7K2QX");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Enter the email address used on the request");
      return;
    }
    setBusy(true);
    // Existence pre-check for honest, user-friendly errors
    try {
      const res = await fetch(`/api/requests/${encodeURIComponent(ref)}`);
      if (res.status === 404) {
        setError("We couldn't find that reference — please check it and try again.");
        setBusy(false);
        return;
      }
    } catch {
      setError("Network problem — please try again.");
      setBusy(false);
      return;
    }
    router.push(`/request/${encodeURIComponent(ref)}?email=${encodeURIComponent(email.trim())}`);
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <Field label="Booking reference" required hint="e.g. ROY-DEMO-7K2QX">
        <input
          value={reference}
          onChange={(e) => setReference(e.target.value.toUpperCase())}
          placeholder="ROY-DEMO-XXXXX"
          className={inputClass}
          autoComplete="off"
          spellCheck={false}
        />
      </Field>
      <Field label="Email on the request" required>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          className={inputClass}
          autoComplete="email"
        />
      </Field>
      {error && (
        <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-[13px] font-medium text-rose-700">
          {error}
        </p>
      )}
      <button type="submit" disabled={busy} className={buttonClass("primary", "lg", "w-full")}>
        {busy ? <Loader2 className="size-4 animate-spin" /> : <FileSearch className="size-4" />}
        View my demo request
      </button>
      <p className="text-center text-[12px] leading-relaxed text-navy-400">
        Full details are only shown after email verification — other travellers can never see your
        information.
      </p>
    </form>
  );
}
