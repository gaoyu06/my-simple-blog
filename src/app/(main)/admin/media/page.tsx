import { formatDate } from "@/lib/date";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { getT } from "@/lib/i18n";

export const metadata = { title: "媒体" };

export default async function MediaAdmin() {
  const session = await auth();
  const role = session!.user.role;
  const where = role === "ADMIN" ? {} : { uploaderId: session!.user.id };
  const [media, { t }] = await Promise.all([
    db.media.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    getT(),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8">
        <p className="eyebrow mb-1">{t("admin.media.eyebrow")}</p>
        <h1 className="font-serif text-3xl font-medium tracking-tight">{t("admin.media.title")}</h1>
      </div>
      {media.length === 0 ? (
        <Card>
          <div className="p-10 text-center text-sm text-[var(--color-foreground-muted)]">
            还没有上传过图片。在文章编辑页的“封面”里上传后会出现在这里。
          </div>
        </Card>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {media.map((m) => (
            <li key={m.id} className="overflow-hidden rounded-[var(--radius-md)] bg-[var(--color-elevated)] shadow-[var(--shadow-card)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.path} alt={m.filename} className="h-32 w-full object-cover" />
              <div className="p-3 text-xs">
                <p className="truncate font-medium text-[var(--color-foreground)]">{m.filename}</p>
                <p className="text-[var(--color-foreground-subtle)]">
                  {(m.size / 1024).toFixed(1)} KB · {formatDate(m.createdAt)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
