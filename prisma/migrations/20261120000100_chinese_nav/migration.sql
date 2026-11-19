-- The site is Chinese-only now: rename the seeded nav labels (custom labels
-- are left alone) and link the published 作品集 / 关于我 pages.
UPDATE "NavItem" SET "label" = '首页' WHERE "href" = '/' AND "label" = 'Home';
UPDATE "NavItem" SET "label" = '文章' WHERE "href" = '/archive' AND "label" = 'Archive';
UPDATE "NavItem" SET "label" = '分类' WHERE "href" = '/categories' AND "label" = 'Categories';
UPDATE "NavItem" SET "label" = '标签' WHERE "href" = '/tags' AND "label" = 'Tags';

INSERT INTO "NavItem" ("id", "label", "href", "position")
SELECT 'nav' || md5(random()::text), '作品', '/' || p."slug", 4
FROM "Page" p
WHERE p."slug" = 'works' AND p."published"
  AND NOT EXISTS (SELECT 1 FROM "NavItem" n WHERE n."href" = '/' || p."slug");

INSERT INTO "NavItem" ("id", "label", "href", "position")
SELECT 'nav' || md5(random()::text), '关于', '/' || p."slug", 5
FROM "Page" p
WHERE p."title" = '关于我' AND p."published"
  AND NOT EXISTS (SELECT 1 FROM "NavItem" n WHERE n."href" = '/' || p."slug");
