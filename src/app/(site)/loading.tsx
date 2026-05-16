export default function SiteLoading() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="space-y-4 animate-pulse">
        <div className="h-3 w-24 rounded bg-[var(--color-muted)]" />
        <div className="h-12 w-3/4 rounded bg-[var(--color-muted)]" />
        <div className="h-4 w-2/3 rounded bg-[var(--color-muted)]" />
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 rounded-[var(--radius-lg)] bg-[var(--color-muted)]" />
          ))}
        </div>
      </div>
    </div>
  );
}
