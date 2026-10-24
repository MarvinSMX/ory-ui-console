import { NextRequest, NextResponse } from "next/server";
import { kratos } from "@/lib/ory/kratos";
import { hydra } from "@/lib/ory/hydra";
import { requireAdminJson } from "@/lib/auth";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await requireAdminJson();
  if (!access.ok) return access.response;
  try {
    const { id } = await params;
    // Revoke Kratos sessions and Hydra OAuth2 consent/tokens in parallel
    await Promise.all([
      kratos.revokeAllSessions(id),
      hydra.revokeAllConsentForSubject(id).catch(() => null), // non-fatal if Hydra unreachable
    ]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
