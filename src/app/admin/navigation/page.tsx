import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NavItemsEditor } from "@/components/admin/nav-items-editor";

export const metadata = { title: "Navigation" };

export default async function NavigationAdmin() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/admin");
  const items = await db.navItem.findMany({
    where: { parentId: null },
    orderBy: { position: "asc" },
    select: { id: true, label: true, href: true, position: true, external: true },
  });

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8">
        <p className="eyebrow mb-1">Configuration</p>
        <h1 className="font-serif text-3xl font-medium tracking-tight">Navigation</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Top nav items</CardTitle>
          <CardDescription>Reorder by arrows, edit or remove as needed. Changes are reflected immediately.</CardDescription>
        </CardHeader>
        <CardContent>
          <NavItemsEditor items={items} />
        </CardContent>
      </Card>
    </div>
  );
}
