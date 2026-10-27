import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getAdminFromCookie } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";

export const dynamic = "force-dynamic";

/**
 * Route-group layout — server-side authorization guard for EVERY page under
 * /admin except /admin/login. Unauthenticated visitors are redirected before
 * any data renders.
 */
export default async function AuthedAdminLayout({ children }: { children: ReactNode }) {
  const admin = await getAdminFromCookie();
  if (!admin) redirect("/admin/login");

  return <AdminShell email={admin.email}>{children}</AdminShell>;
}
