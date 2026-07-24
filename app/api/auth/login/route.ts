import { NextRequest, NextResponse } from "next/server";
import { TOKEN_COOKIE, cookieOptions, backendPostJson } from "../../../../lib/backend";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const { status, data } = await backendPostJson("/auth/login", body);

  if (status < 200 || status >= 300) {
    return NextResponse.json(data, { status });
  }

  const res = NextResponse.json({ user: data.user });
  res.cookies.set(TOKEN_COOKIE, data.token as string, cookieOptions);
  return res;
}
