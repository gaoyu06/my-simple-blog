import { notFound, redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageForm } from "@/components/admin/page-form";

export const metadata = { title: "Edit page" };

export default async function EditCustomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/admin");
  const page = await db.page.findUnique({ where: { id } });
  if (!page) notFound();
  return (
    <PageForm
      initial={{
        id: page.id,
        slug: page.slug,
        title: page.title,
        description: page.description ?? "",
        contentType: page.contentType,
        content: page.content,
        published: page.published,
        position: page.position,
      }}
    />
  );
}
