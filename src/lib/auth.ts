import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

import { signSession, verifySession } from "@/lib/authCore";

export const SESSION_COOKIE_NAME = "amparaseg_session";
export const SECURE_SESSION_COOKIE_NAME = "__Host-amparaseg_session";

export function getSessionCookieNames() {
  return [SECURE_SESSION_COOKIE_NAME, SESSION_COOKIE_NAME] as const;
}

export async function createSession(email: string) {
  const token = await signSession({ email });
  const cookieStore = await cookies();
  const isHttps = process.env.NODE_ENV === "production";
  cookieStore.set(isHttps ? SECURE_SESSION_COOKIE_NAME : SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: isHttps ? "none" : "lax",
    secure: isHttps,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  const isHttps = process.env.NODE_ENV === "production";
  for (const name of getSessionCookieNames()) {
    cookieStore.set(name, "", {
      httpOnly: true,
      sameSite: isHttps ? "none" : "lax",
      secure: isHttps,
      path: "/",
      maxAge: 0,
    });
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const token =
    cookieStore.get(SECURE_SESSION_COOKIE_NAME)?.value ??
    cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    return await verifySession(token);
  } catch {
    return null;
  }
}

export async function requireSession() {
  const session = await getSession();
  if (!session) {
    throw new Error("Não autenticado.");
  }
  return session;
}

export async function verifyAdminCredentials(email: string, password: string) {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPasswordOrHash =
    process.env.ADMIN_PASSWORD_HASH ?? process.env.ADMIN_PASSWORD;

  const normalizedEmail = email.trim().toLowerCase();

  if (!adminEmail || !adminPasswordOrHash) {
    if (process.env.NODE_ENV !== "production") {
      return normalizedEmail === "teste@amparaseg.com" && password === "123456";
    }
    return false;
  }

  if (normalizedEmail !== adminEmail.trim().toLowerCase()) return false;

  if (adminPasswordOrHash.startsWith("$2")) {
    return bcrypt.compare(password, adminPasswordOrHash);
  }

  return password === adminPasswordOrHash;
}
