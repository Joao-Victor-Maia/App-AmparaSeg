import { NextResponse } from "next/server";

import { SESSION_COOKIE_NAME, verifyAdminCredentials } from "@/lib/auth";
import { signSession } from "@/lib/authCore";

export async function POST(req: Request) {
  const formData = await req.formData();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const nextPath = String(formData.get("next") ?? "");

  const ok = await verifyAdminCredentials(email, password);
  if (!ok) {
    return NextResponse.json({ error: "Credenciais inválidas." }, { status: 401 });
  }

  const token = await signSession({ email });
  const redirectTo = nextPath && nextPath.startsWith("/") ? nextPath : "/app";
  const res = NextResponse.json({ redirectTo }, { status: 200 });

  res.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return res;
}
