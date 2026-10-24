import { redirect } from "next/navigation";
import { resolveAdmin } from "@/lib/auth";

export default async function RootPage() {
  const access = await resolveAdmin();
  if (access.ok) redirect("/dashboard");
  redirect("/login");
}
