import { NextRequest, NextResponse } from "next/server";
import { keto } from "@/lib/ory/keto";
import { requireAdminJson } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const access = await requireAdminJson();
  if (!access.ok) return access.response;
  const { searchParams } = req.nextUrl;
  const ns = searchParams.get("namespace") ?? "";
  const obj = searchParams.get("object") ?? "";
  const rel = searchParams.get("relation") ?? "";
  const sub = searchParams.get("subject_id") ?? "";
  try {
    const result = await keto.checkPermission(ns, obj, rel, sub);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
