import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { DotFieldAtmosphere } from "@/components/dot-field-atmosphere";
import "./globals.css";

export const metadata: Metadata = {
  title: "Id Admin · MRVN",
  description: "Internal IdP admin — Kratos identities, Hydra OAuth2",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="mrvn-atmosphere isolate min-h-dvh bg-background font-sans text-foreground antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <DotFieldAtmosphere />
          <div className="relative z-10">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
