import { TagChip } from "@/components/ui/tag-chip";
import { listTagsWithCounts } from "@/server/queries/taxonomy";
import { getT } from "@/lib/i18n";
import { localizedName } from "@/lib/taxonomy-i18n";

export const metadata = { title: "Tags" };

export default async function TagsPage() {
  const [tags, { t, locale }] = await Promise.all([listTagsWithCounts(), getT()]);
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="mb-10">
        <p className="eyebrow mb-2">{t("tags.eyebrow")}</p>
        <h1 className="font-serif text-4xl font-medium tracking-tight">{t("tags.title")}</h1>
        <p className="mt-2 text-sm text-[var(--color-foreground-muted)]">
          {tags.length === 1 ? t("tags.totalOne") : t("tags.total", { count: tags.length })}
        </p>
      </div>
      {tags.length === 0 ? (
        <p className="text-sm text-[var(--color-foreground-muted)]">{t("tags.empty")}</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <TagChip
              key={tag.id}
              name={localizedName(tag, locale)}
              count={tag.articleCount}
              href={`/tags/${tag.slug}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
