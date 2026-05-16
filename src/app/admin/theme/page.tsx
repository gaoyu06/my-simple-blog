import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeForm } from "@/components/admin/theme-form";
import { getSettings } from "@/lib/settings";
import { SETTINGS } from "@/lib/settings-keys";
import { getT } from "@/lib/i18n";

export const metadata = { title: "Theme" };

export default async function ThemeAdmin() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/admin");
  const [raw, { t }] = await Promise.all([
    getSettings([SETTINGS.THEME_PRIMARY, SETTINGS.THEME_DEFAULT_MODE, SETTINGS.CUSTOM_CSS]),
    getT(),
  ]);
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8">
        <p className="eyebrow mb-1">{t("admin.theme.eyebrow")}</p>
        <h1 className="font-serif text-3xl font-medium tracking-tight">{t("admin.theme.title")}</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Tune the primary color (OKLCH-friendly), default appearance, and inject custom CSS.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ThemeForm
            initial={{
              primary: (raw[SETTINGS.THEME_PRIMARY] as string) || "oklch(0.62 0.14 50)",
              defaultMode: ((raw[SETTINGS.THEME_DEFAULT_MODE] as string) || "system") as "system" | "light" | "dark",
              customCss: (raw[SETTINGS.CUSTOM_CSS] as string) || "",
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
