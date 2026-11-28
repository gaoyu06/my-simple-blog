export default function AdminLoading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="space-y-6 animate-pulse">
        <div className="space-y-2">
          <div className="h-3 w-20 rounded bg-[var(--color-muted)]" />
          <div className="h-9 w-1/3 rounded bg-[var(--color-muted)]" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 rounded-[var(--radius-lg)] bg-[var(--color-muted)]" />
          ))}
        </div>
        <div className="h-72 rounded-[var(--radius-lg)] bg-[var(--color-muted)]" />
      </div>
    </div>
  );
}
