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

export function getMonthOptions(count = 12, from = new Date()) {
  return Array.from({ length: count }, (_, index) => {
    const value = getMonthKey(subMonths(startOfMonth(from), index));

    return {
      value,
      label: formatMonthLabel(value),
    };
  });
}
