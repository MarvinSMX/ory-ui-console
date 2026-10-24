import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const adminEmail = process.env.ADMIN_EMAIL?.trim();
  const adminPassword = process.env.ADMIN_PASSWORD ?? "";
  if (!adminEmail || !adminPassword) {
    return NextResponse.json(
      {
        error:
          "Password login disabled. Use Oathkeeper edge session (group admins).",
      },
      { status: 503 },
    );
  }

  let email: string, password: string;
  try {
    ({ email, password } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (email !== adminEmail || password !== adminPassword) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const session = await getSession();
  session.admin = { email };
  await session.save();

  return NextResponse.json({ ok: true });
}
