import { NextResponse } from "next/server";
import { z } from "zod";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { demoServices } from "@/db/schema";
import { getAdminFromCookie } from "@/lib/auth";
import { ensureServicesSeeded } from "@/lib/seed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getAdminFromCookie();
  if (!admin) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  await ensureServicesSeeded();
  const services = await db.select().from(demoServices).orderBy(asc(demoServices.sortOrder));
  return NextResponse.json({ ok: true, services });
}

const patchSchema = z.object({
  id: z.coerce.number().int().positive(),
  isActive: z.boolean().optional(),
  tagline: z.string().trim().max(200).optional(),
  description: z.string().trim().max(2000).optional(),
});

export async function PATCH(req: Request) {
  const admin = await getAdminFromCookie();
  if (!admin) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 });
  }
  const parsed = patchSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid service update" }, { status: 400 });
  }

  try {
    const { id, ...changes } = parsed.data;
    await db.update(demoServices).set(changes).where(eq(demoServices.id, id));
    const [service] = await db.select().from(demoServices).where(eq(demoServices.id, id));
    return NextResponse.json({ ok: true, service });
  } catch (err) {
    console.error("[api/admin/services]", err);
    return NextResponse.json({ ok: false, error: "Service update failed" }, { status: 500 });
  }
}
