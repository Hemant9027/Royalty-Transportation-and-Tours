import { NextResponse } from "next/server";
import { clearSessionCookie, destroyAdminSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await destroyAdminSession();
    await clearSessionCookie();
  } catch (err) {
    console.error("[api/admin/logout]", err);
  }
  return NextResponse.json({ ok: true });
}
