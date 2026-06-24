// Display formatting helpers.

const dayMonthYear: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" };

export function formatDate(value?: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", dayMonthYear);
}

export function formatDateTime(value?: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-GB", { ...dayMonthYear, hour: "2-digit", minute: "2-digit" });
}

export function formatDateRange(start?: string, end?: string): string {
  if (!start && !end) return "";
  if (start && end && start !== end) return `${formatDate(start)} – ${formatDate(end)}`;
  return formatDate(start ?? end);
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function compactNumber(value: number): string {
  return new Intl.NumberFormat("en", { notation: "compact" }).format(value);
}
