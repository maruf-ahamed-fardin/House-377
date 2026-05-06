import type { Role } from "@prisma/client";
import {
  BanknoteArrowUp,
  Bell,
  BookOpen,
  CalendarDays,
  ChartColumnBig,
  CreditCard,
  LayoutDashboard,
  MessageSquareText,
  Receipt,
  ScrollText,
  Settings2,
  ShieldCheck,
  Users,
  UtensilsCrossed,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: Role[];
};

export const navigationItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["ADMIN", "MEMBER"] },
  { href: "/admin", label: "Admin Overview", icon: ChartColumnBig, roles: ["ADMIN"] },
  { href: "/admin/members", label: "Members", icon: Users, roles: ["ADMIN"] },
  { href: "/admin/meals", label: "Meals", icon: UtensilsCrossed, roles: ["ADMIN"] },
  { href: "/admin/bazar", label: "Bazar", icon: Receipt, roles: ["ADMIN"] },
  { href: "/admin/bazar-schedule", label: "Bazar Schedule", icon: CalendarDays, roles: ["ADMIN"] },
  { href: "/admin/rent", label: "Rent", icon: Wallet, roles: ["ADMIN"] },
  { href: "/admin/expenses", label: "Other Expenses", icon: CreditCard, roles: ["ADMIN"] },
  { href: "/admin/deposits", label: "Deposits", icon: BanknoteArrowUp, roles: ["ADMIN"] },
  { href: "/admin/notices", label: "Notices", icon: Bell, roles: ["ADMIN"] },
  { href: "/admin/important-info", label: "Important Info", icon: ShieldCheck, roles: ["ADMIN"] },
  { href: "/admin/monthly-report", label: "Monthly Report", icon: ScrollText, roles: ["ADMIN"] },
  { href: "/bazar-schedule", label: "Bazar Schedule", icon: CalendarDays, roles: ["MEMBER"] },
  { href: "/timeline", label: "Timeline", icon: MessageSquareText, roles: ["ADMIN", "MEMBER"] },
  { href: "/chat", label: "Chat", icon: MessageSquareText, roles: ["ADMIN", "MEMBER"] },
  { href: "/profile", label: "Profile", icon: BookOpen, roles: ["ADMIN", "MEMBER"] },
  { href: "/history", label: "History", icon: Settings2, roles: ["ADMIN", "MEMBER"] },
];

export const noticePriorityClasses = {
  NORMAL: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200",
  IMPORTANT: "bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-200",
  URGENT: "bg-rose-100 text-rose-900 dark:bg-rose-500/15 dark:text-rose-200",
} as const;

export const expenseCategoryLabels = {
  ELECTRICITY: "Electricity",
  GAS: "Gas",
  INTERNET: "Internet",
  CLEANING: "Cleaning",
  MAINTENANCE: "Maintenance",
  WATER: "Water",
  OTHER: "Other",
} as const;
