"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { enPathOf, zhPathOf } from "@/lib/lang-paths";

const CLS =
  "inline-flex h-9 items-center rounded-[var(--radius-md)] px-2 text-[13px] text-[var(--color-foreground-muted)] transition-colors hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]";

/** Links to the same page in the other language, or to that language's home page. */
export function LangSwitch({ lang, enSlugs = [] }: { lang: "zh" | "en"; enSlugs?: readonly string[] }) {
  const pathname = usePathname();
  return lang === "zh" ? (
    <Link href={enPathOf(pathname, enSlugs)} hrefLang="en" lang="en" className={CLS}>
      EN
    </Link>
  ) : (
    <Link href={zhPathOf(pathname)} hrefLang="zh-CN" lang="zh-CN" className={CLS}>
      中文
    </Link>
  );
}
