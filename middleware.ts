import { NextResponse, type NextRequest } from "next/server";

import { verifySession } from "./src/lib/authCore";

const SESSION_COOKIE_NAME = "amparaseg_session";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (pathname === "/login") {
    if (!token) return NextResponse.next();
    try {
      await verifySession(token);
      return NextResponse.redirect(new URL("/app", req.url));
    } catch (err) {
      console.error("auth middleware: invalid session at /login", {
        pathname,
        error: err instanceof Error ? err.message : String(err),
      });
      return NextResponse.next();
    }
  }

  if (pathname.startsWith("/app")) {
    if (!token) {
      const url = new URL("/login", req.url);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    try {
      await verifySession(token);
      return NextResponse.next();
    } catch (err) {
      console.error("auth middleware: invalid session at /app", {
        pathname,
        error: err instanceof Error ? err.message : String(err),
      });
      const url = new URL("/login", req.url);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app", "/app/:path*", "/login"],
};
