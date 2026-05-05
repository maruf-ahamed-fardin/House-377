import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AdminDashboard } from "@/components/dashboard/admin-dashboard";
import { MemberDashboard } from "@/components/dashboard/member-dashboard";
import { PageHeader } from "@/components/dashboard/page-header";
import { formatMonthLabel } from "@/lib/month";
import { getAdminDashboardData, getMemberDashboardData } from "@/lib/queries/app-data";
import { requireUser } from "@/lib/rbac";
import { getSingleSearchParam } from "@/lib/utils";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string | string[] }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const monthKey = getSingleSearchParam(params.month) ?? undefined;

  if (user.role === "ADMIN") {
    const data = await getAdminDashboardData(monthKey);

    return (
      <div className="pb-8">
        <PageHeader
          title="Admin Dashboard"
          description={`Live overview for ${formatMonthLabel(data.report.monthKey)} across meals, finance, dues, and notices.`}
          action={
            <Button asChild>
              <Link href="/admin">
                Open admin workspace
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          }
        />
        <AdminDashboard data={data} />
      </div>
    );
  }

  const data = await getMemberDashboardData(user.id, monthKey);

  return (
    <div className="pb-8">
      <PageHeader
        title="Member Dashboard"
        description={`Your meal, payment, notice, and balance summary for ${formatMonthLabel(data.report.monthKey)}.`}
      />
      <MemberDashboard data={data} />
    </div>
  );
}
