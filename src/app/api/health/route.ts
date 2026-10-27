import { NextResponse } from "next/server";
import { demoAuthConfigured } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Platform health check for the database-free demo. */
export async function GET() {
  return NextResponse.json({ ok: true, storage: "ephemeral", adminConfigured: demoAuthConfigured() });
}
