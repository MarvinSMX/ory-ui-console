import { NavSidebar } from "@/components/nav-sidebar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { resolveAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const access = await resolveAdmin();
  if (!access.ok) {
    if (access.status === 403) {
      redirect(`/login?error=${encodeURIComponent(access.error)}`);
    }
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 left-2 z-30 hidden py-2 lg:block">
        <NavSidebar />
      </aside>
      <div className="flex min-h-screen flex-1 flex-col lg:pl-72">
        <header className="sticky top-0 z-20">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <Sheet>
              <SheetTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon"
                    className="glass-control lg:hidden"
                    aria-label="Open navigation"
                  />
                }
              >
                <Menu />
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-80 border-r-0 bg-transparent p-0"
                showCloseButton={false}
              >
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <NavSidebar className="w-full rounded-none border-r-0" />
              </SheetContent>
            </Sheet>
            <div className="hidden text-sm text-muted-foreground lg:block">
              {access.admin.email}
              {access.admin.mode === "edge-session" ? " · edge" : ""}
            </div>
            <div className="text-xs text-muted-foreground">
              id-admin.internal.mrvn.me
            </div>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
