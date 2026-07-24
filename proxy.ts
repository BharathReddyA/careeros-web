import { NextRequest, NextResponse } from "next/server";
import { TOKEN_COOKIE } from "./lib/backend";

export function proxy(req: NextRequest) {
  const hasToken = req.cookies.has(TOKEN_COOKIE);

  if (req.nextUrl.pathname.startsWith("/app") && !hasToken) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (["/login", "/register"].includes(req.nextUrl.pathname) && hasToken) {
    return NextResponse.redirect(new URL("/app/jobs", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/login", "/register"],
};
