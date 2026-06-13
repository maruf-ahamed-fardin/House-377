// Shared constants used by both server and client

export const expenseCategoryLabels = {
  ELECTRICITY: "Electricity",
  GAS: "Gas",
  INTERNET: "Internet",
  CLEANING: "Cleaning",
  MAINTENANCE: "Maintenance",
  WATER: "Water",
  OTHER: "Other",
} as const;

export const noticePriorityClasses = {
  NORMAL: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200",
  IMPORTANT: "bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-200",
  URGENT: "bg-rose-100 text-rose-900 dark:bg-rose-500/15 dark:text-rose-200",
} as const;

export type ExpenseCategory = keyof typeof expenseCategoryLabels;
export type NoticePriority = keyof typeof noticePriorityClasses;
export type MemberStatus = "ACTIVE" | "INACTIVE";
export type Role = "ADMIN" | "MEMBER";
export type RentDistributionMode = "EQUAL" | "PROFILE";
export type RequestStatus = "PENDING" | "APPROVED" | "REJECTED";
