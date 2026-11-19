// Run: node --experimental-strip-types scripts/check-markdown.mts
import assert from "node:assert/strict";
import { renderArticle, renderMarkdown } from "../src/lib/markdown.ts";

const evil = await renderMarkdown('hi <img src=x onerror="alert(1)"> <script>alert(2)</script>', { allowHtml: false });
assert.ok(!/<img|<script/.test(evil), evil);

const { html, headings } = await renderArticle("## 第一节\n\n![a](/uploads/posts/x/a.png)\n\n### 小节\n");
assert.deepEqual(headings.map((h) => [h.depth, h.text]), [[2, "第一节"], [3, "小节"]]);
assert.match(html, /loading="lazy"/);
assert.match(html, /\/_next\/image\?url=%2Fuploads%2Fposts%2Fx%2Fa\.png&#x26;w=1080/);
console.log("markdown ok");

const doubled = await renderArticle("```rust\nlet a = 1;\n\n    b();\n\n)?;\n\n```\n");
assert.equal((doubled.html.match(/data-line=""/g) ?? []).length, 3, doubled.html);
const spaced = await renderArticle("```text\na\n\nb\nc\n```\n");
assert.equal((spaced.html.match(/data-line=""/g) ?? []).length, 4);
console.log("fence repair ok");

const cjk = await renderMarkdown("使用Cursor的**BYOK （Bring Your Own Key）**功能");
assert.match(cjk, /<strong>BYOK （Bring Your Own Key）<\/strong>/, cjk);
const lead = await renderArticle("```text\n\n读取\n\n↓\n\n完成\n\n```\n");
assert.equal((lead.html.match(/data-line=""/g) ?? []).length, 3, lead.html);
console.log("cjk + leading blank ok");
