import {
  SESSION_COOKIE_NAME,
  verifyAdminCredentials,
} from "@/lib/auth";
import { signSession } from "@/lib/authCore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function cookieNameFor() {
  return SESSION_COOKIE_NAME;
}

function buildSessionCookie(token: string, url: URL) {
  const isHttps = url.protocol === "https:";
  const name = cookieNameFor();
  const parts = [
    `${name}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${60 * 60 * 24 * 7}`,
  ];
  if (isHttps) parts.push("Secure");
  return parts.join("; ");
}

function redirect303(url: URL, cookie?: string) {
  const headers = new Headers();
  headers.set("Location", url.toString());
  headers.set("Cache-Control", "no-store");
  if (cookie) headers.append("Set-Cookie", cookie);
  return new Response(null, { status: 303, headers });
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  const formData = await req.formData();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const nextPath = String(formData.get("next") ?? "");

  const ok = await verifyAdminCredentials(email, password);
  if (!ok) {
    const loginUrl = new URL("/login", url);
    loginUrl.searchParams.set("error", "1");
    if (nextPath) loginUrl.searchParams.set("next", nextPath);
    return redirect303(loginUrl);
  }

  const token = await signSession({ email });
  const redirectTo = nextPath && nextPath.startsWith("/") ? nextPath : "/app";
  return redirect303(
    new URL(redirectTo, url),
    buildSessionCookie(token, url),
  );
}
