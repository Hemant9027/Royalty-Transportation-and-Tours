import { LOCATIONS as LOC, SERVICES as SVC } from "./constants";

/**
 * Client-safe re-exports for the booking widget (avoids importing
 * server-marked modules into client components).
 */
export const LOCATIONS = LOC;
export const SERVICES = SVC.map(({ key, name, short }) => ({ key, name, short }));

export function todayLabel(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
