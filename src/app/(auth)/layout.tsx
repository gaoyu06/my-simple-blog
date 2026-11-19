import Link from "next/link";
import { redirect } from "next/navigation";
import { isInitialized } from "@/lib/install-state";
import { Toaster } from "@/components/toaster";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  if (!(await isInitialized())) redirect("/setup");
  return (
    <div className="relative flex min-h-dvh items-center justify-center px-6 py-12">
      <Link
        href="/"
        className="absolute left-6 top-6 text-base font-semibold text-[var(--color-foreground)] no-underline"
      >
        Blog
      </Link>
      <div className="relative z-10 w-full max-w-sm">{children}</div>
      <Toaster />
    </div>
  );
}
