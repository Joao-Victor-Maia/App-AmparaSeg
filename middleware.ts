import { NextResponse, type NextRequest } from "next/server";

import { verifySession } from "./src/lib/authCore";

const SESSION_COOKIE_NAMES = [
  "__Host-amparaseg_session_v2",
  "amparaseg_session_v2",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token =
    req.cookies.get(SESSION_COOKIE_NAMES[0])?.value ??
    req.cookies.get(SESSION_COOKIE_NAMES[1])?.value;

  if (pathname === "/login") {
    return NextResponse.next();
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
    } catch {
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
