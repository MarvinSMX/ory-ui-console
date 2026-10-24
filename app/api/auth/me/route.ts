import { NextResponse } from "next/server";
import { resolveAdmin } from "@/lib/auth";

export async function GET() {
  const trustEdge = ["1", "true", "yes"].includes(
    (process.env.TRUST_EDGE ?? process.env.AUTH_ADMIN_TRUST_EDGE ?? "")
      .trim()
      .toLowerCase(),
  );
  const passwordLogin = Boolean(
    process.env.ADMIN_EMAIL?.trim() && process.env.ADMIN_PASSWORD,
  );

  const access = await resolveAdmin();
  if (!access.ok) {
    return NextResponse.json(
      { error: access.error, trustEdge, passwordLogin },
      { status: access.status },
    );
  }

  return NextResponse.json({
    ok: true,
    admin: access.admin,
    trustEdge,
    passwordLogin,
  });
}
