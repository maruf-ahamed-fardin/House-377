// Shared API response types used by both server and client

export type ApiResponse<T = unknown> =
  | { success: true; data: T }
  | { success: false; message: string };

export type ActionResult = {
  success: boolean;
  message: string;
};

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  role: "ADMIN" | "MEMBER";
  memberProfileId?: string | null;
  phone?: string | null;
  isActive: boolean;
  memberStatus?: "ACTIVE" | "INACTIVE" | null;
};

export type AuthResponse = {
  user: AuthUser;
  token: string;
};

export type MemberOption = {
  value: string;
  label: string;
  status: "ACTIVE" | "INACTIVE";
  userId: string;
};

export type MonthlyMemberRow = {
  memberId: string;
  userId: string;
  name: string;
  email: string;
  roomNumber: string;
  status: "ACTIVE" | "INACTIVE";
  mealTotal: number;
  mealCost: number;
  rentAmount: number;
  otherExpenseShare: number;
  payable: number;
  deposits: number;
  rentPayments: number;
  amountPaid: number;
  bazarContribution: number;
  finalBalance: number;
};
