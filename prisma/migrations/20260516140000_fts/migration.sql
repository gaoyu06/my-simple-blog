-- Article full-text search (SQLite FTS5)
-- Maintains a virtual contentless FTS5 table mirroring Article fields, kept in sync via triggers.

CREATE VIRTUAL TABLE IF NOT EXISTS "ArticleSearch" USING fts5(
  title,
  summary,
  contentMd,
  content='Article',
  content_rowid='rowid',
  tokenize = 'unicode61'
);

INSERT INTO "ArticleSearch"(rowid, title, summary, contentMd)
  SELECT rowid, title, IFNULL(summary, ''), contentMd FROM "Article";

CREATE TRIGGER IF NOT EXISTS "Article_ai" AFTER INSERT ON "Article" BEGIN
  INSERT INTO "ArticleSearch"(rowid, title, summary, contentMd)
  VALUES (new.rowid, new.title, IFNULL(new.summary, ''), new.contentMd);
END;

CREATE TRIGGER IF NOT EXISTS "Article_ad" AFTER DELETE ON "Article" BEGIN
  INSERT INTO "ArticleSearch"("ArticleSearch", rowid, title, summary, contentMd)
  VALUES('delete', old.rowid, old.title, IFNULL(old.summary, ''), old.contentMd);
END;

CREATE TRIGGER IF NOT EXISTS "Article_au" AFTER UPDATE ON "Article" BEGIN
  INSERT INTO "ArticleSearch"("ArticleSearch", rowid, title, summary, contentMd)
  VALUES('delete', old.rowid, old.title, IFNULL(old.summary, ''), old.contentMd);
  INSERT INTO "ArticleSearch"(rowid, title, summary, contentMd)
  VALUES (new.rowid, new.title, IFNULL(new.summary, ''), new.contentMd);
END;
