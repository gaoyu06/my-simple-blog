// Dates are shown in Beijing time regardless of the server's timezone.
const ymd = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Shanghai" });

/** 2026-03-09 */
export function formatDate(d: Date | string | number): string {
  return ymd.format(new Date(d));
}

/** 03-09 */
export function formatMonthDay(d: Date | string): string {
  return formatDate(d).slice(5);
}

export function yearOf(d: Date | string | number): number {
  return Number(formatDate(d).slice(0, 4));
}
