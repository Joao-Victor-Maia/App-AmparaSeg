import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { SECURE_SESSION_COOKIE_NAME, SESSION_COOKIE_NAME } from "@/lib/auth";
import { verifySession } from "@/lib/authCore";

export const runtime = "nodejs";

export async function GET() {
  const cookieStore = await cookies();
  const token =
    cookieStore.get(SECURE_SESSION_COOKIE_NAME)?.value ??
    cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json(
      { hasCookie: false, valid: false, error: "missing_cookie" },
      { status: 200 },
    );
  }

  try {
    const session = await verifySession(token);
    return NextResponse.json(
      { hasCookie: true, valid: true, email: session.email },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json(
      {
        hasCookie: true,
        valid: false,
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 200 },
    );
  }
}
