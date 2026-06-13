import { endOfMonth, format, parse, startOfMonth, subMonths } from "date-fns";

export function getMonthKey(date = new Date()) {
  return format(date, "yyyy-MM");
}

export function parseMonthKey(monthKey: string) {
  return parse(`${monthKey}-01`, "yyyy-MM-dd", new Date());
}

export function formatMonthLabel(monthKey: string) {
  return format(parseMonthKey(monthKey), "MMMM yyyy");
}

export function getMonthBounds(monthKey: string) {
  const start = startOfMonth(parseMonthKey(monthKey));
  const end = endOfMonth(start);
  return { start, end };
}

export function parseDateInput(value: string) {
  return new Date(`${value}T12:00:00`);
}

export function getMonthKeyFromDateInput(value: string) {
  return getMonthKey(parseDateInput(value));
}

export function normalizeText(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function decimalToNumber(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  if (value && typeof value === "object" && "toNumber" in value && typeof value.toNumber === "function") {
    return value.toNumber();
  }
  return 0;
}
