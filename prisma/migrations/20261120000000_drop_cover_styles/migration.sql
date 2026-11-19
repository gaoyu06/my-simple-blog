-- Covers are now chosen by hand only. Drop the auto-generated text covers
-- (image files stay on disk under public/uploads/covers).
UPDATE "Article" SET "coverImage" = NULL WHERE "coverImage" LIKE '/uploads/covers/%';

-- DropForeignKey
ALTER TABLE "Article" DROP CONSTRAINT "Article_coverStyleId_fkey";

-- DropForeignKey
ALTER TABLE "CoverStyle" DROP CONSTRAINT "CoverStyle_createdById_fkey";

-- AlterTable
ALTER TABLE "Article" DROP COLUMN "coverStyleId";

-- DropTable
DROP TABLE "CoverStyle";

-- DropEnum
DROP TYPE "CoverKind";

