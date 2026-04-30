import { SESSION_COOKIE_NAME, verifyAdminCredentials } from "@/lib/auth";
import { signSession } from "@/lib/authCore";

function buildSessionCookie(token: string) {
  const parts = [
    `${SESSION_COOKIE_NAME}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${60 * 60 * 24 * 7}`,
  ];
  if (process.env.NODE_ENV === "production") parts.push("Secure");
  return parts.join("; ");
}

export async function POST(req: Request) {
  const formData = await req.formData();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const nextPath = String(formData.get("next") ?? "");

  const ok = await verifyAdminCredentials(email, password);
  if (!ok) {
    return Response.json({ error: "Credenciais inválidas." }, { status: 401 });
  }

  const token = await signSession({ email });
  const redirectTo = nextPath && nextPath.startsWith("/") ? nextPath : "/app";
  const headers = new Headers();
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("Cache-Control", "no-store");
  headers.append("Set-Cookie", buildSessionCookie(token));
  return new Response(JSON.stringify({ redirectTo }), { status: 200, headers });
}
