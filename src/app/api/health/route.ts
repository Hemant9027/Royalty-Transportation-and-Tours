import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { ensureSeeded } from "@/lib/seed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Platform health check — also guarantees demo seed data exists. */
export async function GET() {
  try {
    await db.execute(sql`select 1`);
    const seed = await ensureSeeded();
    return NextResponse.json({ ok: true, db: "up", seeded: seed.ok, adminConfigured: seed.adminConfigured });
  } catch (err) {
    console.error("[api/health]", err);
    return NextResponse.json({ ok: false, db: "down" }, { status: 503 });
  }
}
