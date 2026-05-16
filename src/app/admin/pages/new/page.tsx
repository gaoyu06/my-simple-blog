import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { PageForm } from "@/components/admin/page-form";

export const metadata = { title: "New page" };

export default async function NewCustomPage() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/admin");
  return (
    <PageForm
      initial={{
        slug: "",
        title: "",
        description: "",
        contentType: "MARKDOWN",
        content: "",
        published: true,
        position: 0,
      }}
    />
  );
}
