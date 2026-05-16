import sanitizeHtml from "sanitize-html";

const baseAllowed = sanitizeHtml.defaults.allowedTags ?? [];

const allowedTags = [
  ...baseAllowed,
  "img",
  "figure",
  "figcaption",
  "video",
  "source",
  "audio",
  "iframe",
  "section",
  "article",
  "aside",
  "header",
  "footer",
  "nav",
  "main",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "span",
  "del",
  "ins",
  "kbd",
  "mark",
  "sub",
  "sup",
  "abbr",
];

export function sanitizeRichHtml(input: string): string {
  return sanitizeHtml(input, {
    allowedTags,
    allowedAttributes: {
      "*": ["id", "class", "style", "title", "lang", "dir", "data-*"],
      a: ["href", "name", "target", "rel"],
      img: ["src", "alt", "width", "height", "loading", "decoding"],
      video: ["src", "poster", "controls", "loop", "muted", "playsinline", "preload"],
      audio: ["src", "controls", "loop"],
      source: ["src", "type", "media"],
      iframe: ["src", "width", "height", "allow", "allowfullscreen", "loading", "referrerpolicy"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel", "data"],
    allowedSchemesByTag: { img: ["http", "https", "data"], iframe: ["https"] },
    allowProtocolRelative: false,
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          rel: attribs.target === "_blank" ? "noopener noreferrer" : (attribs.rel ?? ""),
        },
      }),
    },
    parser: { lowerCaseTags: true, lowerCaseAttributeNames: true },
  });
}

export function sanitizeCommentHtml(input: string): string {
  return sanitizeHtml(input, {
    allowedTags: ["p", "br", "strong", "em", "u", "del", "a", "code", "pre", "blockquote", "ul", "ol", "li"],
    allowedAttributes: { a: ["href", "title", "target", "rel"] },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          rel: "noopener noreferrer nofollow ugc",
          target: "_blank",
        },
      }),
    },
  });
}
