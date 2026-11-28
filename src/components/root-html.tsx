import { Hanken_Grotesk, JetBrains_Mono } from "next/font/google";

import "@/app/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { getSettings } from "@/lib/settings";
import { SETTINGS } from "@/lib/settings-keys";

const hanken = Hanken_Grotesk({ variable: "--font-hanken", subsets: ["latin"], display: "swap" });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"], display: "swap" });

/** The <html> shell shared by the Chinese and English root layouts. */
export async function RootHtml({ lang, children }: { lang: string; children: React.ReactNode }) {
  const theme = await getSettings([SETTINGS.THEME_PRIMARY, SETTINGS.THEME_DEFAULT_MODE]);
  const primary = theme[SETTINGS.THEME_PRIMARY] as string | undefined;
  const defaultMode = (theme[SETTINGS.THEME_DEFAULT_MODE] as string | undefined) || "system";

  return (
    <html lang={lang} className={`${hanken.variable} ${jetbrains.variable}`} suppressHydrationWarning>
      <body>
        {primary ? <style>{`:root{--color-primary:${primary}}`}</style> : null}
        <ThemeProvider attribute="class" defaultTheme={defaultMode} enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
