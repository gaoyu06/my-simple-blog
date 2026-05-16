export const COLOR_THEMES = ["pink", "mono", "blue", "green"] as const;
export type ColorTheme = (typeof COLOR_THEMES)[number];

export const DEFAULT_COLOR_THEME: ColorTheme = "pink";
export const COLOR_THEME_COOKIE = "bc-color";

export const COLOR_THEME_LABELS: Record<ColorTheme, string> = {
  pink: "Rose",
  mono: "Mono",
  blue: "Blue",
  green: "Green",
};

export const COLOR_THEME_SWATCH: Record<ColorTheme, string> = {
  pink: "oklch(0.74 0.12 8)",
  mono: "oklch(0.30 0.005 80)",
  blue: "oklch(0.62 0.14 250)",
  green: "oklch(0.60 0.13 150)",
};

export function isColorTheme(v: unknown): v is ColorTheme {
  return typeof v === "string" && (COLOR_THEMES as readonly string[]).includes(v);
}
