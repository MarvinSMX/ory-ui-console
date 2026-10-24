import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { SessionData, sessionOptions } from "@/lib/session";

function trustEdgeEnabled(): boolean {
  const v = (process.env.TRUST_EDGE ?? process.env.AUTH_ADMIN_TRUST_EDGE ?? "")
    .trim()
    .toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

/**
 * Edge gate for /dashboard. Full group check happens in server components / API
 * via lib/auth (needs Kratos admin). Here we only require a session cookie or
 * Oathkeeper X-User so anonymous browsers bounce to /login.
 */
export async function proxy(req: NextRequest) {
  if (trustEdgeEnabled()) {
    const subject = req.headers.get("x-user")?.trim() || "";
    const authed =
      req.headers.get("x-authenticated")?.toLowerCase() === "true" ||
      Boolean(subject);
    if (authed && subject) {
      return NextResponse.next();
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const session = await getIronSession<SessionData>(
    req.cookies as any,
    sessionOptions,
  );

  if (!session.admin) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
