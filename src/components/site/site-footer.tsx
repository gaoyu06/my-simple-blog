import { Rss } from "lucide-react";

export function SiteFooter({ siteName, footerText }: { siteName: string; footerText: string }) {
  return (
    <footer className="mt-24 border-t border-[var(--color-border)]">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-8 text-[13px] text-[var(--color-foreground-subtle)] sm:px-6">
        <p>
          © {new Date().getFullYear()} {siteName}
          {footerText ? <span className="ml-3">{footerText}</span> : null}
        </p>
        <a href="/rss.xml" className="inline-flex items-center gap-1.5 hover:text-[var(--color-foreground)]">
          <Rss className="h-3.5 w-3.5" aria-hidden />
          RSS
        </a>
      </div>
    </footer>
  );
}
