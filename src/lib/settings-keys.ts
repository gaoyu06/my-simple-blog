export const SETTINGS = {
  // Site identity
  SITE_NAME: "site.name",
  SITE_DESCRIPTION: "site.description",
  SITE_LOGO: "site.logo",
  SITE_FAVICON: "site.favicon",
  SITE_FOOTER: "site.footer",
  SITE_KEYWORDS: "site.keywords",
  // Home hero — string overrides; empty = fallback to i18n defaults
  // Title supports a single *emphasis* span (rendered italic + primary color).
  HOME_HERO_EYEBROW: "home.hero.eyebrow",
  HOME_HERO_TITLE: "home.hero.title",
  HOME_HERO_LEDE: "home.hero.lede",
  HOME_CTA_PRIMARY_LABEL: "home.cta.primary.label",
  HOME_CTA_PRIMARY_HREF: "home.cta.primary.href",
  HOME_CTA_SECONDARY_LABEL: "home.cta.secondary.label",
  HOME_CTA_SECONDARY_HREF: "home.cta.secondary.href",
  // Registration / commenting policy
  REGISTRATION_OPEN: "auth.registration.open",
  REGISTRATION_NEEDS_APPROVAL: "auth.registration.needs_approval",
  COMMENT_NEEDS_APPROVAL: "comment.needs_approval",
  COMMENT_ALLOW_ANONYMOUS: "comment.allow_anonymous",
  // Theme
  THEME_DEFAULT_MODE: "theme.default_mode",
  THEME_PRIMARY: "theme.primary",
  CUSTOM_CSS: "theme.custom_css",
  // AI defaults
  AI_LLM_DEFAULT: "ai.llm.default",
  AI_IMAGE_DEFAULT: "ai.image.default",
  // SEO
  SEO_OG_IMAGE: "seo.og_image",
  // Install state
  SETUP_COMPLETED: "setup.completed",
} as const;

export type SettingKey = (typeof SETTINGS)[keyof typeof SETTINGS];
