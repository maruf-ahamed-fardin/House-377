import { format } from "date-fns";

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value: number, maximumFractionDigits = 2) {
  return new Intl.NumberFormat("en-BD", {
    maximumFractionDigits,
  }).format(value);
}

export function formatDate(value: Date | string) {
  return format(new Date(value), "dd MMM yyyy");
}

export function formatDateTime(value: Date | string) {
  return format(new Date(value), "dd MMM yyyy, hh:mm a");
}
