import { NextRequest, NextResponse } from "next/server";
import { hydra } from "@/lib/ory/hydra";
import { requireAdminJson } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const access = await requireAdminJson();
  if (!access.ok) return access.response;
  try {
    const body = await req.json();
    const client = await hydra.createClient(body);
    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
