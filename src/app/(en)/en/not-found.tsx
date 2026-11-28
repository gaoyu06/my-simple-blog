import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-28 text-center sm:px-6">
      <p className="font-mono text-sm text-[var(--color-foreground-subtle)]">404</p>
      <h1 className="mt-2 text-2xl font-semibold">Page not found</h1>
      <p className="mt-6 text-sm">
        <Link href="/en" className="text-[var(--color-primary)]">Home</Link>
        <span className="mx-3 text-[var(--color-foreground-subtle)]">·</span>
        <Link href="/en/works" className="text-[var(--color-primary)]">Works</Link>
      </p>
    </div>
  );
}
