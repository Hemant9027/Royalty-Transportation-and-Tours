import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { eq, and, gt, lt } from "drizzle-orm";
import { db } from "@/db";
import { demoAdminSessions, demoAdminUsers } from "@/db/schema";

/**
 * Demo admin authentication.
 *
 * - Opaque 256-bit session tokens; only SHA-256(token) is stored in the DB.
 * - Passwords hashed with scrypt + random salt (never stored in plain text).
 * - Credentials come from environment variables — nothing is hard-coded.
 * - Every admin route/page validates the session server-side.
 */

export const SESSION_COOKIE = "roy_admin_session";
const SESSION_TTL_HOURS = Number(process.env.DEMO_SESSION_TTL_HOURS ?? 12);

// ---------------------------------------------------------------- passwords
const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEYLEN = 64;

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .scryptSync(password, salt, KEYLEN, { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P })
    .toString("hex");
  return `scrypt:${SCRYPT_N}:${SCRYPT_R}:${SCRYPT_P}:${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [algo, n, r, p, salt, expected] = stored.split(":");
    if (algo !== "scrypt") return false;
    const hash = crypto.scryptSync(password, salt, KEYLEN, {
      N: Number(n),
      r: Number(r),
      p: Number(p),
    });
    const expectedBuf = Buffer.from(expected, "hex");
    return hash.length === expectedBuf.length && crypto.timingSafeEqual(hash, expectedBuf);
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------- sessions
function sha256(v: string): string {
  return crypto.createHash("sha256").update(v).digest("hex");
}

export async function createAdminSession(adminUserId: number): Promise<string> {
  await db.delete(demoAdminSessions).where(lt(demoAdminSessions.expiresAt, new Date()));
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_HOURS * 3600_000);
  await db.insert(demoAdminSessions).values({
    tokenHash: sha256(token),
    adminUserId,
    expiresAt,
  });
  return token;
}

export interface AdminIdentity {
  id: number;
  email: string;
}

export async function getAdminFromCookie(): Promise<AdminIdentity | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const tokenHash = sha256(token);
  const rows = await db
    .select({ id: demoAdminUsers.id, email: demoAdminUsers.email })
    .from(demoAdminSessions)
    .innerJoin(demoAdminUsers, eq(demoAdminSessions.adminUserId, demoAdminUsers.id))
    .where(and(eq(demoAdminSessions.tokenHash, tokenHash), gt(demoAdminSessions.expiresAt, new Date())))
    .limit(1);
  return rows[0] ?? null;
}

export async function destroyAdminSession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.delete(demoAdminSessions).where(eq(demoAdminSessions.tokenHash, sha256(token)));
  }
}

export async function setSessionCookie(token: string): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_HOURS * 3600,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function findAdminByEmail(email: string) {
  const rows = await db
    .select()
    .from(demoAdminUsers)
    .where(eq(demoAdminUsers.email, email.toLowerCase().trim()))
    .limit(1);
  return rows[0] ?? null;
}

export function demoAdminEmail(): string {
  return (process.env.DEMO_ADMIN_EMAIL ?? "").toLowerCase().trim();
}

export function demoAuthConfigured(): boolean {
  return Boolean(process.env.DEMO_ADMIN_EMAIL && process.env.DEMO_ADMIN_PASSWORD);
}
