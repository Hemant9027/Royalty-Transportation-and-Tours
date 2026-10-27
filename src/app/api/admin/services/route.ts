import { NextResponse } from "next/server";
import { z } from "zod";
import { getDemoStore } from "@/lib/demo-store";
import { getAdminFromCookie } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getAdminFromCookie();
  if (!admin) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const services = [...getDemoStore().services].sort((a, b) => a.sortOrder - b.sortOrder);
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

  const service = getDemoStore().services.find(({ id }) => id === parsed.data.id);
  if (!service) return NextResponse.json({ ok: false, error: "Service not found" }, { status: 404 });
  const { id: _id, ...changes } = parsed.data;
  Object.assign(service, changes);
  return NextResponse.json({ ok: true, service });
}
