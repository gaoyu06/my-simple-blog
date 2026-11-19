export function PageHeading({ title, note }: { title: string; note?: string }) {
  return (
    <header className="mb-6 flex items-baseline justify-between gap-4 border-b border-[var(--color-border)] pb-5">
      <h1 className="text-2xl font-semibold sm:text-[28px]">{title}</h1>
      {note ? <p className="shrink-0 text-sm text-[var(--color-foreground-subtle)]">{note}</p> : null}
    </header>
  );
}
