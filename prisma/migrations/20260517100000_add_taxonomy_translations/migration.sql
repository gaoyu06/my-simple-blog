-- Add per-locale name/description JSON overrides for Category and Tag.
ALTER TABLE "Category" ADD COLUMN "translations" TEXT;
ALTER TABLE "Tag" ADD COLUMN "translations" TEXT;
