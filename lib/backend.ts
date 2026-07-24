export const BACKEND_URL = process.env.CAREEROS_BACKEND_URL ?? "http://localhost:3000";
export const TOKEN_COOKIE = "careeros_token";

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30, // 30d, matches backend JWT expiry
};

/** POSTs JSON to the backend, translating connection failures into a real error response instead of throwing. */
export async function backendPostJson(
  path: string,
  body: string
): Promise<{ status: number; data: Record<string, unknown> }> {
  try {
    const res = await fetch(`${BACKEND_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
    const data = await res.json();
    return { status: res.status, data };
  } catch {
    return { status: 502, data: { error: "Unable to reach the server. Please try again shortly." } };
  }
}
