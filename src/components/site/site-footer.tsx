import { GitBranch, Rss } from "lucide-react";
import { getT } from "@/lib/i18n";

interface SiteFooterProps {
  siteName?: string;
  footerText?: string;
}

export async function SiteFooter({ siteName = "Blog", footerText }: SiteFooterProps) {
  const { t } = await getT();
  return (
    <footer className="border-t border-[var(--color-border)] py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-[var(--color-foreground-muted)]">
          © {new Date().getFullYear()} {siteName}.{" "}
          {footerText ?? t("footer.builtWith")}
        </p>
        <div className="flex items-center gap-1">
          <a
            href="#"
            aria-label={t("footer.source.aria")}
            className="rounded-md p-2 text-[var(--color-foreground-muted)] no-underline transition-colors hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]"
          >
            <GitBranch className="h-4 w-4" aria-hidden />
          </a>
          <a
            href="/rss.xml"
            aria-label={t("footer.rss.aria")}
            className="rounded-md p-2 text-[var(--color-foreground-muted)] no-underline transition-colors hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]"
          >
            <Rss className="h-4 w-4" aria-hidden />
          </a>
        </div>
      </div>
    </footer>
  );
}
