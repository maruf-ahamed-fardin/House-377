"use server";

import { revalidatePath } from "next/cache";

import { getMonthKey } from "@/lib/month";

export type ActionResult = {
  success: boolean;
  message: string;
};

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

export function revalidateAppPaths(...paths: string[]) {
  const uniquePaths = new Set(["/dashboard", "/admin", "/history", ...paths]);

  uniquePaths.forEach((path) => revalidatePath(path));
}

export function actionError(message: string, error: unknown): ActionResult {
  console.error(message, error);
  return {
    success: false,
    message,
  };
}
