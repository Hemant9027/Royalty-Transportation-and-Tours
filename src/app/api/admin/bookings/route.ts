import { NextResponse } from "next/server";
import { getAdminFromCookie } from "@/lib/auth";
import { listBookings } from "@/lib/admin-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const admin = await getAdminFromCookie();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const sp = new URL(req.url).searchParams;
  const num = (v: string | null) => (v && /^\d+$/.test(v) ? Number(v) : undefined);
  try {
    const result = await listBookings({
      q: sp.get("q") ?? undefined,
      status: sp.get("status") ?? undefined,
      service: sp.get("service") ?? undefined,
      origin: sp.get("origin") ?? undefined,
      from: sp.get("from") ?? undefined,
      to: sp.get("to") ?? undefined,
      sort: sp.get("sort") ?? undefined,
      dir: sp.get("dir") === "asc" ? "asc" : "desc",
      page: num(sp.get("page")),
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[api/admin/bookings]", err);
    return NextResponse.json({ ok: false, error: "Could not load bookings" }, { status: 500 });
  }
}
