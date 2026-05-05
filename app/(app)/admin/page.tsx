import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { AdminDashboard } from "@/components/dashboard/admin-dashboard";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { navigationItems } from "@/lib/constants";
import { formatMonthLabel } from "@/lib/month";
import { getAdminDashboardData } from "@/lib/queries/app-data";
import { requireAdmin } from "@/lib/rbac";
import { getSingleSearchParam } from "@/lib/utils";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string | string[] }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const monthKey = getSingleSearchParam(params.month) ?? undefined;
  const data = await getAdminDashboardData(monthKey);

  const shortcuts = navigationItems.filter(
    (item) => item.roles.includes("ADMIN") && item.href.startsWith("/admin/") && item.href !== "/admin",
  );

  return (
    <div className="space-y-8 pb-8">
      <PageHeader
        title="Admin Workspace"
        description={`Management center for ${formatMonthLabel(data.report.monthKey)} with direct access to every operational area.`}
        action={
          <Button asChild variant="outline">
            <Link href="/admin/monthly-report">Open monthly report</Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {shortcuts.map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.href} className="border-white/70 bg-white/80 dark:border-white/10 dark:bg-slate-950/75">
              <CardHeader className="space-y-4">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-lg">{item.label}</CardTitle>
                  <CardDescription>Open {item.label.toLowerCase()} management.</CardDescription>
                </div>
                <Button asChild variant="outline" className="w-fit">
                  <Link href={item.href}>
                    Go there
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      <AdminDashboard data={data} />
    </div>
  );
}
