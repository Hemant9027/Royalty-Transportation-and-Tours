import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "roy_admin_session";
const SESSION_TTL_HOURS = Number(process.env.DEMO_SESSION_TTL_HOURS ?? 12);
const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEYLEN = 64;
let cachedPasswordHash: string | undefined;

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
    if (algo !== "scrypt" || !n || !r || !p || !salt || !expected) return false;
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

function sign(value: string): Buffer {
  const secret = process.env.DEMO_ADMIN_PASSWORD;
  if (!secret) throw new Error("Demo admin credentials are not configured");
  return crypto.createHmac("sha256", secret).update(value).digest();
}

export async function createAdminSession(_adminUserId: number): Promise<string> {
  const expiresAt = Date.now() + SESSION_TTL_HOURS * 3600_000;
  const payload = Buffer.from(`${demoAdminEmail()}:${expiresAt}`).toString("base64url");
  return `${payload}.${sign(payload).toString("base64url")}`;
}

export interface AdminIdentity {
  id: number;
  email: string;
}

export async function getAdminFromCookie(): Promise<AdminIdentity | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token || !demoAuthConfigured()) return null;
  const [payload, signature, ...rest] = token.split(".");
  if (!payload || !signature || rest.length > 0) return null;
  let actualSignature: Buffer;
  try {
    actualSignature = Buffer.from(signature, "base64url");
  } catch {
    return null;
  }
  const expectedSignature = sign(payload);
  if (
    actualSignature.length !== expectedSignature.length ||
    !crypto.timingSafeEqual(actualSignature, expectedSignature)
  ) {
    return null;
  }
  const decoded = Buffer.from(payload, "base64url").toString("utf8");
  const separator = decoded.lastIndexOf(":");
  const email = decoded.slice(0, separator);
  const expiresAt = Number(decoded.slice(separator + 1));
  if (
    separator < 0 ||
    email !== demoAdminEmail() ||
    !Number.isSafeInteger(expiresAt) ||
    expiresAt <= Date.now()
  ) {
    return null;
  }
  return { id: 1, email };
}

export async function destroyAdminSession(): Promise<void> {
  return;
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
  const normalizedEmail = email.toLowerCase().trim();
  if (!demoAuthConfigured() || normalizedEmail !== demoAdminEmail()) return null;
  const password = process.env.DEMO_ADMIN_PASSWORD!;
  if (!cachedPasswordHash) cachedPasswordHash = hashPassword(password);
  return {
    id: 1,
    email: normalizedEmail,
    passwordHash: cachedPasswordHash!,
  };
}

export function demoAdminEmail(): string {
  return (process.env.DEMO_ADMIN_EMAIL ?? "").toLowerCase().trim();
}

export function demoAuthConfigured(): boolean {
  return Boolean(process.env.DEMO_ADMIN_EMAIL && process.env.DEMO_ADMIN_PASSWORD);
}
