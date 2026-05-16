import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getRegistrationPolicy } from "@/server/queries/site";
import { RegisterForm } from "@/components/auth/register-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getT } from "@/lib/i18n";

export const metadata = { title: "Create account" };

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) redirect("/");
  const [policy, { t }] = await Promise.all([getRegistrationPolicy(), getT()]);
  if (!policy.open) {
    return (
      <Card className="rise rise-1">
        <CardHeader>
          <CardTitle>{t("auth.register.closedTitle")}</CardTitle>
          <CardDescription>{t("auth.register.closedBody")}</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  return (
    <Card className="rise rise-1">
      <CardHeader>
        <CardTitle>{t("auth.register.title")}</CardTitle>
        <CardDescription>
          {policy.needsApproval ? t("auth.register.subtitleReview") : t("auth.register.subtitleOpen")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm />
      </CardContent>
    </Card>
  );
}
