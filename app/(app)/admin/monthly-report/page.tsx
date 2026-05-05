import { BanknoteArrowUp, CircleDollarSign, Receipt, ScrollText, UtensilsCrossed, Wallet } from "lucide-react";

import { ExpenseBreakdownChart } from "@/components/charts/expense-breakdown-chart";
import { MealHistoryChart } from "@/components/charts/meal-history-chart";
import { MonthlyReportTable } from "@/components/monthly/monthly-report-table";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatNumber } from "@/lib/format";
import { formatMonthLabel, getMonthKey } from "@/lib/month";
import { getMonthlyReportData } from "@/lib/queries/app-data";
import { requireAdmin } from "@/lib/rbac";
import { getSingleSearchParam } from "@/lib/utils";

export default async function MonthlyReportPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string | string[] }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const monthKey = getSingleSearchParam(params.month) ?? getMonthKey();
  const report = await getMonthlyReportData(monthKey);

  return (
    <div className="space-y-8 pb-8">
      <PageHeader
        title="Monthly Final Calculation"
        description={`Full month-end settlement for ${formatMonthLabel(report.monthKey)} across meals, bazar, rent, expenses, and member balances.`}
        action={
          <form className="flex items-center gap-3" method="GET">
            <Input className="w-[180px]" type="month" name="month" defaultValue={report.monthKey} />
            <Button type="submit" variant="outline">
              Apply month
            </Button>
          </form>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total meals" value={formatNumber(report.totalMeals)} description="Combined breakfast, lunch, and dinner count." icon={UtensilsCrossed} />
        <StatCard title="Meal rate" value={formatCurrency(report.mealRate)} description="Total bazar cost divided by total meals." icon={Receipt} />
        <StatCard title="Total payable pool" value={formatCurrency(report.totalHouseRent + report.totalOtherExpenses + report.totalBazarCost)} description="Rent, other expenses, and bazar combined." icon={Wallet} />
        <StatCard title="Mess balance" value={formatCurrency(report.messBalance)} description="Deposits plus rent payments minus month expenses." icon={CircleDollarSign} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-white/70 bg-white/80 dark:border-white/10 dark:bg-slate-950/75">
          <CardHeader>
            <CardTitle>Meal trend</CardTitle>
            <CardDescription>Day-wise meal movement for the selected month.</CardDescription>
          </CardHeader>
          <CardContent>
            <MealHistoryChart data={report.mealHistory} />
          </CardContent>
        </Card>

        <Card className="border-white/70 bg-white/80 dark:border-white/10 dark:bg-slate-950/75">
          <CardHeader>
            <CardTitle>Expense breakdown</CardTitle>
            <CardDescription>Bazar, utilities, and rent proportions for this month.</CardDescription>
          </CardHeader>
          <CardContent>
            <ExpenseBreakdownChart data={report.expenseBreakdown} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Bazar cost" value={formatCurrency(report.totalBazarCost)} description="Total grocery and food market spend." icon={Receipt} />
        <StatCard title="Other expenses" value={formatCurrency(report.totalOtherExpenses)} description="Utility, maintenance, and service spend." icon={BanknoteArrowUp} />
        <StatCard title="Pending dues" value={formatCurrency(report.pendingDues)} description="Amount still due from members with negative balance." icon={ScrollText} />
        <StatCard title="Positive balances" value={formatCurrency(report.positiveBalances)} description="Total money owed back to members with positive balance." icon={CircleDollarSign} />
      </div>

      <MonthlyReportTable monthKey={report.monthKey} rows={report.memberRows} />
    </div>
  );
}
