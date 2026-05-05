import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { formatCurrency, formatNumber } from "@/lib/format";
import { formatMonthLabel } from "@/lib/month";
import { getMonthlyReportData } from "@/lib/queries/app-data";

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const monthKey = new URL(request.url).searchParams.get("month") ?? undefined;
  const report = await getMonthlyReportData(monthKey);

  const headers = [
    "Member",
    "Email",
    "Room",
    "Meals",
    "Meal Cost",
    "Rent",
    "Other Share",
    "Total Payable",
    "Deposits",
    "Rent Payments",
    "Paid Total",
    "Bazar Contribution",
    "Final Balance",
  ];

  const rows = report.memberRows.map((row) => [
    row.name,
    row.email,
    row.roomNumber,
    formatNumber(row.mealTotal),
    formatNumber(row.mealCost),
    formatNumber(row.rentAmount),
    formatNumber(row.otherExpenseShare),
    formatNumber(row.payable),
    formatNumber(row.deposits),
    formatNumber(row.rentPayments),
    formatNumber(row.amountPaid),
    formatNumber(row.bazarContribution),
    formatNumber(row.finalBalance),
  ]);

  const summaryRows = [
    [],
    ["Month", formatMonthLabel(report.monthKey)],
    ["Total Meals", formatNumber(report.totalMeals)],
    ["Meal Rate", formatCurrency(report.mealRate)],
    ["Total Bazar Cost", formatCurrency(report.totalBazarCost)],
    ["Total Other Expenses", formatCurrency(report.totalOtherExpenses)],
    ["Total House Rent", formatCurrency(report.totalHouseRent)],
    ["Mess Balance", formatCurrency(report.messBalance)],
  ];

  const csv = [headers, ...rows, ...summaryRows]
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="messmate-monthly-report-${report.monthKey}.csv"`,
    },
  });
}
