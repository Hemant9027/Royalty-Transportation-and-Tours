import type { ReactNode, ComponentProps } from "react";
import { cx } from "@/lib/format";

/* ---------------------------------- buttons ---------------------------------- */

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "whatsapp";
type ButtonSize = "sm" | "md" | "lg";

const buttonBase =
  "inline-flex items-center justify-center gap-2 font-semibold tracking-tight transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aqua-500 disabled:opacity-50 disabled:pointer-events-none select-none";

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-aqua-500 text-navy-950 hover:bg-aqua-400 active:bg-aqua-600 shadow-[0_10px_30px_-12px_rgba(29,188,179,0.55)]",
  secondary: "bg-navy-900 text-white hover:bg-navy-800 active:bg-navy-950",
  outline:
    "border border-navy-900/15 bg-white text-navy-900 hover:border-navy-900/30 hover:bg-navy-50",
  ghost: "text-navy-900 hover:bg-navy-900/5",
  danger: "bg-rose-600 text-white hover:bg-rose-500",
  whatsapp: "bg-[#1faa55] text-white hover:bg-[#189048]",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-[13px] rounded-lg",
  md: "h-11 px-5 text-sm rounded-xl",
  lg: "h-[52px] px-7 text-[15px] rounded-xl",
};

export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
  return cx(buttonBase, buttonVariants[variant], buttonSizes[size], className);
}

export function Button({
  variant,
  size,
  className,
  ...props
}: ComponentProps<"button"> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return <button className={buttonClass(variant, size, className)} {...props} />;
}

/* ----------------------------------- badge ----------------------------------- */

const badgeTones = {
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  sky: "bg-sky-50 text-sky-700 ring-sky-200",
  teal: "bg-aqua-100 text-aqua-800 ring-aqua-300",
  navy: "bg-navy-50 text-navy-700 ring-navy-200",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  rose: "bg-rose-50 text-rose-700 ring-rose-200",
  slate: "bg-slate-100 text-slate-600 ring-slate-200",
} as const;

export function Badge({
  tone = "navy",
  className,
  children,
}: {
  tone?: keyof typeof badgeTones;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] ring-1 ring-inset",
        badgeTones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/* --------------------------------- eyebrow ----------------------------------- */

export function Eyebrow({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <p className={cx("text-[12px] font-bold uppercase tracking-[0.22em] text-aqua-600", className)}>{children}</p>
  );
}

/* ----------------------------- form primitives ------------------------------- */

export function Field({
  label,
  error,
  hint,
  required,
  children,
  className,
}: {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cx("block", className)}>
      <span className="mb-1.5 flex items-baseline justify-between text-[13px] font-semibold text-navy-800">
        <span>
          {label}
          {required && <span className="ml-0.5 text-aqua-600" aria-hidden>*</span>}
        </span>
        {hint && <span className="text-[11px] font-medium text-navy-400">{hint}</span>}
      </span>
      {children}
      {error && (
        <span role="alert" className="mt-1.5 block text-[12px] font-medium text-rose-600">
          {error}
        </span>
      )}
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl border border-navy-900/15 bg-white px-3.5 py-2.5 text-[14px] text-navy-900 placeholder:text-navy-300 shadow-[inset_0_1px_2px_rgba(6,18,33,0.04)] transition focus:border-aqua-500 focus:outline-none focus:ring-2 focus:ring-aqua-500/25 disabled:bg-navy-50";

/* ----------------------------- panel / surface ------------------------------- */

export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cx("rounded-2xl border border-navy-900/10 bg-white shadow-[var(--shadow-card)]", className)}>
      {children}
    </div>
  );
}
