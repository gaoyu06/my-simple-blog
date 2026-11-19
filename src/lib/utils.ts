/** Route params can arrive percent-encoded (e.g. Chinese tag slugs). */
export function decodeParam(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
