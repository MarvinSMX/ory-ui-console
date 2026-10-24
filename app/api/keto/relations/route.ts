import { NextRequest, NextResponse } from "next/server";
import { keto } from "@/lib/ory/keto";
import { requireAdminJson } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const access = await requireAdminJson();
  if (!access.ok) return access.response;
  const { searchParams } = req.nextUrl;
  const ns = searchParams.get("namespace") ?? "roles";
  const rel = searchParams.get("relation") ?? undefined;
  const subjectId = searchParams.get("subject_id") ?? undefined;
  try {
    const data = await keto.listRelations(ns, rel, subjectId);
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const access = await requireAdminJson();
  if (!access.ok) return access.response;
  try {
    const body = await req.json();
    await keto.createRelation(body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const access = await requireAdminJson();
  if (!access.ok) return access.response;
  try {
    const body = await req.json();
    await keto.deleteRelation(body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
