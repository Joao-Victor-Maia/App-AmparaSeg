import { cookies } from "next/headers";

import { SECURE_SESSION_COOKIE_NAME, SESSION_COOKIE_NAME } from "@/lib/auth";
import { verifySession } from "@/lib/authCore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function json(data: unknown) {
  const headers = new Headers();
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("Cache-Control", "no-store");
  headers.set("Vary", "Cookie");
  return new Response(JSON.stringify(data), { status: 200, headers });
}

export async function GET() {
  const cookieStore = await cookies();
  const cookieNames = cookieStore.getAll().map((c) => c.name);
  const token =
    cookieStore.get(SECURE_SESSION_COOKIE_NAME)?.value ??
    cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return json({
      hasCookie: false,
      valid: false,
      error: "missing_cookie",
      cookieNames,
    });
  }

  try {
    const session = await verifySession(token);
    return json({
      hasCookie: true,
      valid: true,
      email: session.email,
      cookieNames,
    });
  } catch (err) {
    return json({
      hasCookie: true,
      valid: false,
      error: err instanceof Error ? err.message : String(err),
      cookieNames,
    });
  }
}
