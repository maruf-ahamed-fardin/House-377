import { Bell, Receipt, UtensilsCrossed, Wallet } from "lucide-react";

import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";

export function MemberDashboard({
  data,
}: {
  data: Awaited<ReturnType<typeof import("@/lib/queries/app-data").getMemberDashboardData>>;
}) {
  const row = data.memberRow;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Meals this month"
          value={formatNumber(row?.mealTotal ?? 0)}
          description={row ? `Meal cost: ${formatCurrency(row.mealCost)}` : "No meals recorded yet."}
          icon={UtensilsCrossed}
        />
        <StatCard
          title="Deposits & payments"
          value={formatCurrency(row?.amountPaid ?? 0)}
          description="Money you have already paid into the mess."
          icon={Wallet}
        />
        <StatCard
          title="Bazar contribution"
          value={formatCurrency(row?.bazarContribution ?? 0)}
          description="Purchases you covered for the mess this month."
          icon={Receipt}
        />
        <StatCard
          title="Final balance"
          value={formatCurrency(row?.finalBalance ?? 0)}
          description="Positive means you should receive money back. Negative means you still owe."
          icon={Bell}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="border-white/70 bg-white/80 dark:border-white/10 dark:bg-slate-950/75">
          <CardHeader>
            <CardTitle>Recent notices</CardTitle>
            <CardDescription>Shared announcements from the admin team.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.recentNotices.map((notice) => (
              <div key={notice.id} className="rounded-3xl border border-border/70 bg-background/70 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{notice.title}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(notice.date)}</p>
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
            <CardTitle>Your recent meals</CardTitle>
            <CardDescription>Latest daily meal records for this month.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.recentMeals.map((record) => (
              <div key={record.id} className="rounded-3xl border border-border/70 bg-background/70 p-4">
                <p className="font-medium">{formatDate(record.date)}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Breakfast {formatNumber(Number(record.breakfastCount))}, lunch {formatNumber(Number(record.lunchCount))}, dinner{" "}
                  {formatNumber(Number(record.dinnerCount))}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {data.importantInfo ? (
        <Card className="border-white/70 bg-white/80 dark:border-white/10 dark:bg-slate-950/75">
          <CardHeader>
            <CardTitle>Important information</CardTitle>
            <CardDescription>Quick references shared by the admin for all members.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-border/70 bg-background/70 p-4">
              <p className="text-sm font-medium">Electricity</p>
              <p className="mt-2 text-sm text-muted-foreground">{data.importantInfo.electricityAccount ?? "Not set"}</p>
            </div>
            <div className="rounded-3xl border border-border/70 bg-background/70 p-4">
              <p className="text-sm font-medium">Gas</p>
              <p className="mt-2 text-sm text-muted-foreground">{data.importantInfo.gasCardNumber ?? "Not set"}</p>
            </div>
            <div className="rounded-3xl border border-border/70 bg-background/70 p-4">
              <p className="text-sm font-medium">WiFi</p>
              <p className="mt-2 text-sm text-muted-foreground">{data.importantInfo.wifiInfo ?? "Not set"}</p>
            </div>
            <div className="rounded-3xl border border-border/70 bg-background/70 p-4">
              <p className="text-sm font-medium">House owner</p>
              <p className="mt-2 text-sm text-muted-foreground">{data.importantInfo.houseOwnerPhone ?? "Not set"}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
