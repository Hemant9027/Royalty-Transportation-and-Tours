import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createAdminSession,
  demoAuthConfigured,
  findAdminByEmail,
  setSessionCookie,
  verifyPassword,
} from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const loginSchema = z.object({
  email: z.string().trim().min(3).max(160),
  password: z.string().min(1).max(200),
});

export async function POST(req: Request) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }
  const parsed = loginSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Enter your email and password" }, { status: 400 });
  }

  if (!demoAuthConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Demo admin credentials are not configured on this deployment (missing environment variables)." },
      { status: 503 },
    );
  }

  try {
    const user = await findAdminByEmail(parsed.data.email);

    // Uniform failure timing (also covers "no such user")
    const ok = user ? verifyPassword(parsed.data.password, user.passwordHash) : false;
    if (!user || !ok) {
      await new Promise((r) => setTimeout(r, 450));
      return NextResponse.json({ ok: false, error: "Incorrect email or password" }, { status: 401 });
    }

    const token = await createAdminSession(user.id);
    await setSessionCookie(token);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/admin/login]", err);
    return NextResponse.json({ ok: false, error: "Sign-in is temporarily unavailable" }, { status: 500 });
  }
}
