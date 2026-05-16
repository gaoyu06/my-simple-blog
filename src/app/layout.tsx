import type { Metadata } from "next";
import { Fraunces, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { Suspense } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { RouteProgress } from "@/components/route-progress";
import { I18nProvider } from "@/components/i18n-provider";
import {
  COLOR_THEME_COOKIE,
  DEFAULT_COLOR_THEME,
  isColorTheme,
  type ColorTheme,
} from "@/lib/color-theme";
import { getLocale } from "@/lib/i18n";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Blog", template: "%s — Blog" },
  description: "A blog powered by Next.js.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COLOR_THEME_COOKIE)?.value;
  const color: ColorTheme = isColorTheme(raw) ? raw : DEFAULT_COLOR_THEME;
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      data-color={color}
      className={`${fraunces.variable} ${hanken.variable} ${jetbrains.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh bg-[var(--color-canvas)] text-[var(--color-foreground)] antialiased">
        <I18nProvider locale={locale}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <Suspense fallback={null}>
              <RouteProgress />
            </Suspense>
            {children}
            <Toaster position="bottom-right" richColors closeButton theme="system" />
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
