import { NextRequest, NextResponse } from "next/server";
import { kratos } from "@/lib/ory/kratos";
import { requireAdminJson } from "@/lib/auth";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await requireAdminJson();
  if (!access.ok) return access.response;
  try {
    const { id } = await params;
    await kratos.deleteIdentity(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
