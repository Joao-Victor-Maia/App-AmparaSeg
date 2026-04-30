import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

import { signSession, verifySession } from "@/lib/authCore";

export const SESSION_COOKIE_NAME = "amparaseg_session";

export async function createSession(email: string) {
  const token = await signSession({ email });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
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
