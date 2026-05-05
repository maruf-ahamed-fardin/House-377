import type {
  BazarExpense,
  Deposit,
  MealRecord,
  MemberProfile,
  MonthlySummary,
  OtherExpense,
  RentPayment,
  User,
} from "@prisma/client";
import { format } from "date-fns";

import { decimalToNumber } from "@/lib/utils";

type MemberWithUser = MemberProfile & {
  user: User;
};

export type MonthlyMemberRow = {
  memberId: string;
  userId: string;
  name: string;
  email: string;
  roomNumber: string;
  status: MemberProfile["status"];
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

export function getMealTotal(record: MealRecord) {
  return decimalToNumber(record.breakfastCount) + decimalToNumber(record.lunchCount) + decimalToNumber(record.dinnerCount);
}

export function computeMonthlyReport({
  members,
  mealRecords,
  bazarExpenses,
  otherExpenses,
  deposits,
  rentPayments,
  summary,
}: {
  members: MemberWithUser[];
  mealRecords: MealRecord[];
  bazarExpenses: BazarExpense[];
  otherExpenses: OtherExpense[];
  deposits: Deposit[];
  rentPayments: RentPayment[];
  summary: MonthlySummary | null;
}) {
  const memberIdsWithActivity = new Set<string>();

  mealRecords.forEach((item) => memberIdsWithActivity.add(item.memberId));
  bazarExpenses.forEach((item) => item.boughtById && memberIdsWithActivity.add(item.boughtById));
  deposits.forEach((item) => memberIdsWithActivity.add(item.memberId));
  rentPayments.forEach((item) => memberIdsWithActivity.add(item.memberId));

  const includedMembers = members
    .filter((member) => member.status === "ACTIVE" || memberIdsWithActivity.has(member.id))
    .sort((a, b) => a.user.name.localeCompare(b.user.name));

  const activeMembers = includedMembers.filter((member) => member.status === "ACTIVE");
  const activeCount = activeMembers.length || Math.max(includedMembers.length, 1);

  const totalMeals = mealRecords.reduce((sum, record) => sum + getMealTotal(record), 0);
  const totalBazarCost = bazarExpenses.reduce((sum, item) => sum + decimalToNumber(item.price), 0);
  const totalOtherExpenses = otherExpenses.reduce((sum, item) => sum + decimalToNumber(item.amount), 0);
  const totalDeposits = deposits.reduce((sum, item) => sum + decimalToNumber(item.amount), 0);
  const totalRentPayments = rentPayments.reduce((sum, item) => sum + decimalToNumber(item.amount), 0);
  const totalHouseRent = decimalToNumber(summary?.totalHouseRent);
  const mealRate = totalMeals > 0 ? totalBazarCost / totalMeals : 0;
  const equalRentShare = activeCount > 0 ? totalHouseRent / activeCount : 0;
  const otherExpenseShare = activeCount > 0 ? totalOtherExpenses / activeCount : 0;

  const memberRows: MonthlyMemberRow[] = includedMembers.map((member) => {
    const memberMeals = mealRecords.filter((record) => record.memberId === member.id);
    const mealTotal = memberMeals.reduce((sum, record) => sum + getMealTotal(record), 0);
    const bazarContribution = bazarExpenses
      .filter((expense) => expense.boughtById === member.id)
      .reduce((sum, expense) => sum + decimalToNumber(expense.price), 0);
    const memberDeposits = deposits
      .filter((deposit) => deposit.memberId === member.id)
      .reduce((sum, deposit) => sum + decimalToNumber(deposit.amount), 0);
    const memberRentPayments = rentPayments
      .filter((payment) => payment.memberId === member.id)
      .reduce((sum, payment) => sum + decimalToNumber(payment.amount), 0);
    const rentAmount =
      summary?.rentDistributionMode === "PROFILE" ? decimalToNumber(member.monthlyRentShare) : member.status === "ACTIVE" ? equalRentShare : 0;
    const mealCost = mealTotal * mealRate;
    const payable = mealCost + rentAmount + (member.status === "ACTIVE" ? otherExpenseShare : 0);
    const amountPaid = memberDeposits + memberRentPayments;
    const finalBalance = amountPaid + bazarContribution - payable;

    return {
      memberId: member.id,
      userId: member.userId,
      name: member.user.name,
      email: member.user.email,
      roomNumber: member.roomNumber,
      status: member.status,
      mealTotal,
      mealCost,
      rentAmount,
      otherExpenseShare: member.status === "ACTIVE" ? otherExpenseShare : 0,
      payable,
      deposits: memberDeposits,
      rentPayments: memberRentPayments,
      amountPaid,
      bazarContribution,
      finalBalance,
    };
  });

  const mealHistory = Object.entries(
    mealRecords.reduce<Record<string, number>>((accumulator, record) => {
      const label = format(record.date, "dd MMM");
      accumulator[label] = (accumulator[label] ?? 0) + getMealTotal(record);
      return accumulator;
    }, {}),
  ).map(([label, total]) => ({
    label,
    total,
  }));

  const pendingDues = memberRows.filter((row) => row.finalBalance < 0).reduce((sum, row) => sum + Math.abs(row.finalBalance), 0);
  const positiveBalances = memberRows.filter((row) => row.finalBalance > 0).reduce((sum, row) => sum + row.finalBalance, 0);
  const messBalance = totalDeposits + totalRentPayments - totalBazarCost - totalOtherExpenses - totalHouseRent;

  return {
    memberRows,
    summary,
    totalMeals,
    totalBazarCost,
    totalOtherExpenses,
    totalDeposits,
    totalRentPayments,
    totalHouseRent,
    mealRate,
    otherExpenseShare,
    messBalance,
    pendingDues,
    positiveBalances,
    mealHistory,
    expenseBreakdown: [
      { name: "Bazar", value: totalBazarCost },
      { name: "Other Expenses", value: totalOtherExpenses },
      { name: "House Rent", value: totalHouseRent },
    ],
  };
}
