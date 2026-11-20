export function PageHeading({ title, note }: { title: string; note?: string }) {
  return (
    <header className="mb-8 flex items-end justify-between gap-4 border-b border-[var(--color-border)] pb-6">
      <h1 className="text-[32px] font-semibold leading-none tracking-[-0.03em] sm:text-[40px]">{title}</h1>
      {note ? (
        <p className="shrink-0 font-mono text-[13px] tabular-nums text-[var(--color-foreground-subtle)]">{note}</p>
      ) : null}
    </header>
  );
}
