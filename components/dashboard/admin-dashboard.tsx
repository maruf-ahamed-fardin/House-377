import { Activity, Bell, CircleDollarSign, Receipt, TrendingUp, Users, UtensilsCrossed, Wallet } from "lucide-react";

import { ExpenseBreakdownChart } from "@/components/charts/expense-breakdown-chart";
import { MealHistoryChart } from "@/components/charts/meal-history-chart";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate, formatDateTime, formatNumber } from "@/lib/format";

export function AdminDashboard({ data }: { data: Awaited<ReturnType<typeof import("@/lib/queries/app-data").getAdminDashboardData>> }) {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total members" value={String(data.totalMembers)} description="Registered residents across the mess." icon={Users} />
        <StatCard title="Active members" value={String(data.activeMembers)} description="Members currently included in rent and expense sharing." icon={Activity} />
        <StatCard
          title="Current month meals"
          value={formatNumber(data.report.totalMeals)}
          description={`Meal rate is currently ${formatCurrency(data.report.mealRate)}.`}
          icon={UtensilsCrossed}
        />
        <StatCard
          title="Mess balance"
          value={formatCurrency(data.report.messBalance)}
          description={`Pending dues total ${formatCurrency(data.report.pendingDues)}.`}
          icon={CircleDollarSign}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-white/70 bg-white/80 dark:border-white/10 dark:bg-slate-950/75">
          <CardHeader>
            <CardTitle>Meal trend</CardTitle>
            <CardDescription>Daily meal totals for the selected month.</CardDescription>
          </CardHeader>
          <CardContent>
            <MealHistoryChart data={data.report.mealHistory} />
          </CardContent>
        </Card>

        <Card className="border-white/70 bg-white/80 dark:border-white/10 dark:bg-slate-950/75">
          <CardHeader>
            <CardTitle>Expense mix</CardTitle>
            <CardDescription>Bazar, utilities, and rent together for the current month.</CardDescription>
          </CardHeader>
          <CardContent>
            <ExpenseBreakdownChart data={data.report.expenseBreakdown} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="border-white/70 bg-white/80 dark:border-white/10 dark:bg-slate-950/75">
          <CardHeader>
            <CardTitle>Recent notices</CardTitle>
            <CardDescription>Latest announcements visible to members.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.recentNotices.map((notice) => (
              <div key={notice.id} className="rounded-3xl border border-border/70 bg-background/70 p-4">
                <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium">{notice.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(notice.date)} | by {notice.createdBy.name}
                    </p>
                  </div>
                  <Badge>{notice.priority}</Badge>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">{notice.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-white/70 bg-white/80 dark:border-white/10 dark:bg-slate-950/75">
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>Audit trail snapshots from across the app.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.recentActivity.map((activity) => (
              <div key={activity.id} className="rounded-3xl border border-border/70 bg-background/70 p-4">
                <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
                  <p className="min-w-0 font-medium">{activity.action.replaceAll("_", " ")}</p>
                  <Badge variant="outline">{activity.entityType}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {activity.performedBy?.name ?? "System"} | {formatDateTime(activity.timestamp)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Bazar cost" value={formatCurrency(data.report.totalBazarCost)} description="Food and grocery purchases for the month." icon={Receipt} />
        <StatCard title="Other expenses" value={formatCurrency(data.report.totalOtherExpenses)} description="Utilities, maintenance, and house services." icon={Wallet} />
        <StatCard title="House rent" value={formatCurrency(data.report.totalHouseRent)} description="Configured monthly house rent for distribution." icon={TrendingUp} />
        <StatCard title="Rent collected" value={formatCurrency(data.report.totalRentPayments)} description="Total rent payments received from members." icon={Bell} />
      </div>
    </div>
  );
}
