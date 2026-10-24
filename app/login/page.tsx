"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MrvnLogo } from "@/components/mrvn-logo";

function LoginInner() {
  const router = useRouter();
  const search = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(search.get("error") ?? "");
  const [loading, setLoading] = useState(false);
  const [edgeOnly, setEdgeOnly] = useState(false);

  useEffect(() => {
    // If Oathkeeper already authenticated, bounce into dashboard.
    void fetch("/api/auth/me")
      .then(async (res) => {
        if (res.ok) {
          router.replace("/dashboard");
          return;
        }
        if (res.status === 401) {
          const data = (await res.json().catch(() => ({}))) as {
            trustEdge?: boolean;
            passwordLogin?: boolean;
          };
          if (data.trustEdge && !data.passwordLogin) {
            setEdgeOnly(true);
          }
        }
      })
      .catch(() => undefined);
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      router.push("/dashboard");
    } else {
      const data = await res.json();
      setError(data.error ?? "Login failed");
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="glass-solid element-border-gradiented-top shadow-overlay flex w-full max-w-sm flex-col gap-5 rounded-[30px] p-6 text-left">
        <div className="flex flex-col gap-3">
          <MrvnLogo size="lg" />
          <div>
            <h1 className="text-lg font-medium tracking-tight">Id Admin</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Internal IdP console · behind Oathkeeper
            </p>
          </div>
        </div>

        {edgeOnly ? (
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>
              Sign in at{" "}
              <a className="soft-link" href="https://auth.mrvn.me/login">
                auth.mrvn.me
              </a>{" "}
              with group <code className="text-foreground">admins</code>, then
              return here.
            </p>
            <a
              className="inline-flex h-9 w-full items-center justify-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
              href="https://auth.mrvn.me/login?return_to=https%3A%2F%2Fid-admin.internal.mrvn.me%2F"
            >
              Continue to login
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-background"
              />
            </div>
            {error ? (
              <p className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </p>
            ) : null}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
          Loading…
        </div>
      }
    >
      <LoginInner />
    </Suspense>
  );
}
