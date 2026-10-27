import { NextResponse } from "next/server";
import { getAdminFromCookie } from "@/lib/auth";
import { getDashboardStats } from "@/lib/admin-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getAdminFromCookie();
  if (!admin) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  try {
    const stats = await getDashboardStats();
    return NextResponse.json({ ok: true, stats });
  } catch (err) {
    console.error("[api/admin/stats]", err);
    return NextResponse.json({ ok: false, error: "Stats unavailable" }, { status: 500 });
  }
}
