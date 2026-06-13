// Server-side data fetching shim — proxies queries to the Express API
// Pages can keep calling these functions unchanged; internally they fetch from the API server.
import { cookies } from "next/headers";
import { getMonthKey } from "@/lib/month";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

async function apiFetch<T = unknown>(path: string, params?: Record<string, string | undefined>): Promise<T> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  let url = `${API_URL}${path}`;
  if (params) {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v) sp.set(k, v); });
    const qs = sp.toString();
    if (qs) url += `?${qs}`;
  }

  const res = await fetch(url, {
    headers: { Cookie: `token=${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${path}`);
  }

  const json = await res.json();
  return json.data ?? json;
}

// --- Dashboard ---

export async function getAdminDashboardData(monthKey?: string) {
  return apiFetch("/dashboard/admin", { month: monthKey });
}

export async function getMemberDashboardData(_userId: string, monthKey?: string) {
  return apiFetch("/dashboard/member", { month: monthKey });
}

export async function getProfilePageData(_userId: string, monthKey?: string) {
  return apiFetch("/dashboard/profile", { month: monthKey });
}

export async function getHistoryPageData(_userId?: string, _role?: string) {
  return apiFetch("/dashboard/history");
}

export async function getMonthlyReportData(monthKey?: string) {
  return apiFetch("/dashboard/report", { month: monthKey });
}

// --- Meals ---

export async function getMealsPageData(monthKey?: string) {
  return apiFetch("/meals", { month: monthKey ?? getMonthKey() });
}

// --- Bazar ---

export async function getBazarPageData(monthKey?: string) {
  return apiFetch("/bazar", { month: monthKey ?? getMonthKey() });
}

// --- Rent ---

export async function getRentPageData(monthKey?: string) {
  return apiFetch("/rent", { month: monthKey ?? getMonthKey() });
}

// --- Expenses ---

export async function getOtherExpensesPageData(monthKey?: string) {
  return apiFetch("/expenses", { month: monthKey ?? getMonthKey() });
}

// --- Deposits ---

export async function getDepositsPageData(monthKey?: string) {
  return apiFetch("/deposits", { month: monthKey ?? getMonthKey() });
}

// --- Members ---

export async function getMembersPageData() {
  return apiFetch("/members");
}

// --- Notices ---

export async function getNoticesPageData() {
  return apiFetch("/notices");
}

// --- Important Info ---

export async function getImportantInfoRecord() {
  return apiFetch("/important-info");
}

// --- Chat ---

export async function getChatMessages() {
  return apiFetch("/chat");
}

// --- Community ---

export async function getBazarSchedulePageData(monthKey?: string) {
  return apiFetch("/community/bazar-schedule", { month: monthKey ?? getMonthKey() });
}

export async function getTimelinePageData() {
  return apiFetch("/community/timeline");
}
