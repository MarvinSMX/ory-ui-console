import { headers } from "next/headers";
import { getSession } from "@/lib/session";

export type AdminIdentity = {
  email: string;
  subject?: string;
  groups?: string[];
  mode: "edge-session" | "password" | "local-open";
};

function trustEdgeEnabled(): boolean {
  const v = (process.env.TRUST_EDGE ?? process.env.AUTH_ADMIN_TRUST_EDGE ?? "")
    .trim()
    .toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

function requiredGroup(): string {
  return (
    process.env.REQUIRED_ADMIN_GROUP ??
    process.env.AUTH_ADMIN_REQUIRED_GROUP ??
    "admins"
  ).trim();
}

function identityGroups(meta: unknown): string[] {
  if (!meta || typeof meta !== "object") return [];
  const groups = (meta as { groups?: unknown }).groups;
  if (Array.isArray(groups)) {
    return groups.filter((g): g is string => typeof g === "string");
  }
  if (typeof groups === "string" && groups.trim()) return [groups.trim()];
  return [];
}

async function fetchIdentity(subject: string): Promise<{
  id: string;
  traits?: { email?: string };
  metadata_public?: unknown;
} | null> {
  const base = (process.env.KRATOS_ADMIN_URL ?? "").replace(/\/$/, "");
  if (!base || !subject) return null;
  try {
    const res = await fetch(
      `${base}/admin/identities/${encodeURIComponent(subject)}`,
      { cache: "no-store" },
    );
    if (!res.ok) return null;
    return (await res.json()) as {
      id: string;
      traits?: { email?: string };
      metadata_public?: unknown;
    };
  } catch {
    return null;
  }
}

/** Resolve admin from Oathkeeper edge headers and/or iron-session password login. */
export async function resolveAdmin(): Promise<
  | { ok: true; admin: AdminIdentity }
  | { ok: false; status: number; error: string }
> {
  const h = await headers();
  const edgeOn = trustEdgeEnabled();
  const subject = h.get("x-user")?.trim() || "";
  const authed =
    h.get("x-authenticated")?.toLowerCase() === "true" || Boolean(subject);

  if (edgeOn && authed && subject) {
    const identity = await fetchIdentity(subject);
    if (!identity) {
      return {
        ok: false,
        status: 401,
        error: "Edge subject not found in Kratos.",
      };
    }
    const groups = identityGroups(identity.metadata_public);
    const need = requiredGroup();
    if (!groups.map((g) => g.toLowerCase()).includes(need.toLowerCase())) {
      return {
        ok: false,
        status: 403,
        error: `Requires group "${need}" (metadata_public.groups). You have: [${groups.join(", ") || "none"}].`,
      };
    }
    const email =
      (typeof identity.traits?.email === "string" && identity.traits.email) ||
      subject;
    return {
      ok: true,
      admin: { email, subject, groups, mode: "edge-session" },
    };
  }

  const session = await getSession();
  if (session.admin?.email) {
    return {
      ok: true,
      admin: { email: session.admin.email, mode: "password" },
    };
  }

  if (edgeOn) {
    return {
      ok: false,
      status: 401,
      error:
        "Admin requires Oathkeeper session (X-User) with group admins, or password login.",
    };
  }

  if (process.env.NODE_ENV === "production") {
    return {
      ok: false,
      status: 503,
      error: "Set TRUST_EDGE=1 (Oathkeeper) or ADMIN_EMAIL/PASSWORD before production.",
    };
  }

  return {
    ok: true,
    admin: { email: "local@dev", mode: "local-open" },
  };
}

export async function requireAdminJson(): Promise<
  | { ok: true; admin: AdminIdentity }
  | { ok: false; response: Response }
> {
  const result = await resolveAdmin();
  if (!result.ok) {
    return {
      ok: false,
      response: Response.json(
        { error: result.error },
        { status: result.status },
      ),
    };
  }
  return { ok: true, admin: result.admin };
}
