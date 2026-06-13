// Typed API client for calling the Express backend from the Next.js frontend

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "/api";

type ApiOptions = RequestInit & {
  params?: Record<string, string | undefined>;
};

async function request<T>(path: string, options: ApiOptions = {}): Promise<{ success: true; data: T } | { success: false; message: string }> {
  const { params, ...init } = options;

  let url = `${API_BASE}${path}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) searchParams.set(key, value);
    });
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }

  const res = await fetch(url, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init.headers },
    ...init,
  });

  const json = await res.json();

  if (!res.ok || json.success === false) {
    return { success: false, message: json.message ?? `Request failed (${res.status})` };
  }

  return { success: true, data: json.data ?? json };
}

// Convenience helpers
export const api = {
  get: <T>(path: string, params?: Record<string, string | undefined>) =>
    request<T>(path, { method: "GET", params }),

  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),

  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),

  delete: <T>(path: string) =>
    request<T>(path, { method: "DELETE" }),
};

// --- Domain-specific API functions ---

import type { AuthUser, AuthResponse, MemberOption } from "../shared/types";

// Auth
export const authApi = {
  login: (email: string, password: string) => api.post<AuthResponse>("/auth/login", { email, password }),
  register: (data: { name: string; email: string; password: string; confirmPassword: string }) => api.post("/auth/register", data),
  logout: () => api.post("/auth/logout"),
  me: () => api.get<{ user: AuthUser }>("/auth/me"),
};

// Members
export const membersApi = {
  list: () => api.get("/members"),
  options: (includeInactive = true) => api.get<MemberOption[]>("/members/options", { includeInactive: String(includeInactive) }),
  save: (data: unknown) => api.post("/members", data),
  delete: (id: string) => api.delete(`/members/${id}`),
};

// Meals
export const mealsApi = {
  list: (month?: string) => api.get("/meals", { month }),
  save: (data: unknown) => api.post("/meals", data),
  delete: (id: string) => api.delete(`/meals/${id}`),
};

// Bazar
export const bazarApi = {
  list: (month?: string) => api.get("/bazar", { month }),
  save: (data: unknown) => api.post("/bazar", data),
  delete: (id: string) => api.delete(`/bazar/${id}`),
};

// Rent
export const rentApi = {
  list: (month?: string) => api.get("/rent", { month }),
  save: (data: unknown) => api.post("/rent", data),
  saveSummary: (data: unknown) => api.put("/rent/summary", data),
  delete: (id: string) => api.delete(`/rent/${id}`),
};

// Expenses
export const expensesApi = {
  list: (month?: string) => api.get("/expenses", { month }),
  save: (data: unknown) => api.post("/expenses", data),
  delete: (id: string) => api.delete(`/expenses/${id}`),
};

// Deposits
export const depositsApi = {
  list: (month?: string) => api.get("/deposits", { month }),
  save: (data: unknown) => api.post("/deposits", data),
  delete: (id: string) => api.delete(`/deposits/${id}`),
};

// Notices
export const noticesApi = {
  list: () => api.get("/notices"),
  save: (data: unknown) => api.post("/notices", data),
  delete: (id: string) => api.delete(`/notices/${id}`),
};

// Important Info
export const infoApi = {
  get: () => api.get("/important-info"),
  save: (data: unknown) => api.put("/important-info", data),
};

// Chat
export const chatApi = {
  messages: (limit?: number) => api.get("/chat", { limit: limit?.toString() }),
  send: (content: string) => api.post("/chat", { content }),
};

// Community (bazar schedule + timeline)
export const communityApi = {
  bazarSchedule: (month?: string) => api.get("/community/bazar-schedule", { month }),
  saveBazarSchedule: (data: unknown) => api.post("/community/bazar-schedule", data),
  deleteBazarSchedule: (id: string) => api.delete(`/community/bazar-schedule/${id}`),
  submitChangeRequest: (data: unknown) => api.post("/community/bazar-schedule/change-request", data),
  handleChangeRequest: (id: string, data: unknown) => api.put(`/community/bazar-schedule/change-request/${id}`, data),
  timeline: () => api.get("/community/timeline"),
  saveTimelinePost: (data: unknown) => api.post("/community/timeline", data),
  deleteTimelinePost: (id: string) => api.delete(`/community/timeline/${id}`),
  toggleResolved: (id: string) => api.put(`/community/timeline/${id}/toggle-resolved`),
};

// Dashboard
export const dashboardApi = {
  admin: (month?: string) => api.get("/dashboard/admin", { month }),
  member: (month?: string) => api.get("/dashboard/member", { month }),
  profile: (month?: string) => api.get("/dashboard/profile", { month }),
  history: () => api.get("/dashboard/history"),
  report: (month?: string) => api.get("/dashboard/report", { month }),
};

// Upload
export const uploadApi = {
  upload: async (file: File, folder: string) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_BASE}/upload?folder=${folder}`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    return res.json();
  },
};
