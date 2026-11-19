import type { Metadata } from "next";
import { Hanken_Grotesk, JetBrains_Mono } from "next/font/google";

import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { getSiteMeta } from "@/server/queries/site";
import { getSettings } from "@/lib/settings";
import { SETTINGS } from "@/lib/settings-keys";

const hanken = Hanken_Grotesk({ variable: "--font-hanken", subsets: ["latin"], display: "swap" });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"], display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const meta = await getSiteMeta();
  return {
    metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
    title: { default: meta.name, template: `%s - ${meta.name}` },
    description: meta.description || undefined,
    keywords: meta.keywords.length ? meta.keywords : undefined,
    alternates: { types: { "application/rss+xml": "/rss.xml" } },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const theme = await getSettings([SETTINGS.THEME_PRIMARY, SETTINGS.THEME_DEFAULT_MODE]);
  const primary = theme[SETTINGS.THEME_PRIMARY] as string | undefined;
  const defaultMode = (theme[SETTINGS.THEME_DEFAULT_MODE] as string | undefined) || "system";

  return (
    <html lang="zh-CN" className={`${hanken.variable} ${jetbrains.variable}`} suppressHydrationWarning>
      <body>
        {primary ? <style>{`:root{--color-primary:${primary}}`}</style> : null}
        <ThemeProvider attribute="class" defaultTheme={defaultMode} enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
