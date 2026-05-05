import { BadgeCheck, Bell, CalendarDays, CreditCard, Home, Phone, Wallet } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import { formatMonthLabel } from "@/lib/month";
import { getProfilePageData } from "@/lib/queries/app-data";
import { requireUser } from "@/lib/rbac";
import { getSingleSearchParam } from "@/lib/utils";

function getInitials(name?: string | null) {
  return (
    name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "MM"
  );
}

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string | string[] }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const monthKey = getSingleSearchParam(params.month) ?? undefined;
  const data = await getProfilePageData(user.id, monthKey);
  const row = data.memberRow;

  return (
    <div className="space-y-8 pb-8">
      <PageHeader
        title="Profile"
        description={`Personal profile and month-based financial summary for ${formatMonthLabel(data.report.monthKey)}.`}
      />

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <Card className="border-white/70 bg-white/80 dark:border-white/10 dark:bg-slate-950/75">
          <CardHeader className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="size-20">
                <AvatarImage src={user.image ?? undefined} alt={user.name ?? "User"} />
                <AvatarFallback className="text-lg">{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <CardTitle className="text-2xl">{user.name}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
                <div className="flex flex-wrap gap-2">
                  <Badge>{user.role}</Badge>
                  <Badge variant="outline">{data.profile?.status ?? (user.isActive ? "ACTIVE" : "INACTIVE")}</Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-border/70 bg-background/70 p-4">
              <p className="text-sm font-medium">Phone</p>
              <p className="mt-2 text-sm text-muted-foreground">{user.phone ?? "Not set"}</p>
            </div>
            <div className="rounded-3xl border border-border/70 bg-background/70 p-4">
              <p className="text-sm font-medium">Room</p>
              <p className="mt-2 text-sm text-muted-foreground">{data.profile?.roomNumber ?? "Not assigned"}</p>
            </div>
            <div className="rounded-3xl border border-border/70 bg-background/70 p-4">
              <p className="text-sm font-medium">Joining date</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {data.profile ? formatDate(data.profile.joiningDate) : "Not available"}
              </p>
            </div>
            <div className="rounded-3xl border border-border/70 bg-background/70 p-4">
              <p className="text-sm font-medium">Monthly rent share</p>
              <p className="mt-2 text-sm text-muted-foreground">{formatCurrency(row?.rentAmount ?? 0)}</p>
            </div>
            <div className="md:col-span-2 rounded-3xl border border-border/70 bg-background/70 p-4">
              <p className="text-sm font-medium">Permanent address</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{data.profile?.permanentAddress ?? "Not available"}</p>
            </div>
            <div className="md:col-span-2 rounded-3xl border border-border/70 bg-background/70 p-4">
              <p className="text-sm font-medium">Guardian contact</p>
              <p className="mt-2 text-sm text-muted-foreground">{data.profile?.guardianPhone ?? "Not available"}</p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <StatCard title="Meals" value={formatNumber(row?.mealTotal ?? 0)} description="Total meal units for the selected month." icon={CalendarDays} />
            <StatCard
              title="Meal Cost"
              value={formatCurrency(row?.mealCost ?? 0)}
              description="Calculated from your meals multiplied by the monthly meal rate."
              icon={Wallet}
            />
            <StatCard
              title="Paid Amount"
              value={formatCurrency(row?.amountPaid ?? 0)}
              description="Deposits and rent payments already recorded for you."
              icon={CreditCard}
            />
            <StatCard
              title="Final Balance"
              value={formatCurrency(row?.finalBalance ?? 0)}
              description="Positive means you should receive money. Negative means you still owe."
              icon={BadgeCheck}
            />
          </div>

          <Card className="border-white/70 bg-white/80 dark:border-white/10 dark:bg-slate-950/75">
            <CardHeader>
              <CardTitle>Monthly settlement details</CardTitle>
              <CardDescription>Your individual position within the current monthly calculation.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Meal total</TableHead>
                    <TableHead>Meal cost</TableHead>
                    <TableHead>Rent</TableHead>
                    <TableHead>Other share</TableHead>
                    <TableHead>Payable</TableHead>
                    <TableHead>Bazar contribution</TableHead>
                    <TableHead>Paid total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>{formatNumber(row?.mealTotal ?? 0)}</TableCell>
                    <TableCell>{formatCurrency(row?.mealCost ?? 0)}</TableCell>
                    <TableCell>{formatCurrency(row?.rentAmount ?? 0)}</TableCell>
                    <TableCell>{formatCurrency(row?.otherExpenseShare ?? 0)}</TableCell>
                    <TableCell>{formatCurrency(row?.payable ?? 0)}</TableCell>
                    <TableCell>{formatCurrency(row?.bazarContribution ?? 0)}</TableCell>
                    <TableCell>{formatCurrency(row?.amountPaid ?? 0)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-white/70 bg-white/80 dark:border-white/10 dark:bg-slate-950/75">
              <CardHeader>
                <CardTitle>Recent rent payments</CardTitle>
                <CardDescription>Latest payment entries linked to your account.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.recentPayments.length ? (
                  data.recentPayments.map((payment) => (
                    <div key={payment.id} className="rounded-3xl border border-border/70 bg-background/70 p-4">
                      <p className="font-medium">{formatCurrency(Number(payment.amount))}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{formatDate(payment.date)}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No rent payments recorded for this month.</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-white/70 bg-white/80 dark:border-white/10 dark:bg-slate-950/75">
              <CardHeader>
                <CardTitle>Recent deposits</CardTitle>
                <CardDescription>Mess fund contributions recorded this month.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.recentDeposits.length ? (
                  data.recentDeposits.map((deposit) => (
                    <div key={deposit.id} className="rounded-3xl border border-border/70 bg-background/70 p-4">
                      <p className="font-medium">{formatCurrency(Number(deposit.amount))}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatDate(deposit.date)}
                        {deposit.purpose ? ` | ${deposit.purpose}` : ""}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No deposits recorded for this month.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {data.importantInfo ? (
            <Card className="border-white/70 bg-white/80 dark:border-white/10 dark:bg-slate-950/75">
              <CardHeader>
                <CardTitle>Important shared information</CardTitle>
                <CardDescription>Admin-provided household contacts and billing references.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="rounded-3xl border border-border/70 bg-background/70 p-4">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <Wallet className="size-4" />
                    Electricity
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">{data.importantInfo.electricityAccount ?? "Not set"}</p>
                </div>
                <div className="rounded-3xl border border-border/70 bg-background/70 p-4">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <Home className="size-4" />
                    WiFi / Gas
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {data.importantInfo.wifiInfo ?? "WiFi not set"}
                    <br />
                    {data.importantInfo.gasCardNumber ?? "Gas not set"}
                  </p>
                </div>
                <div className="rounded-3xl border border-border/70 bg-background/70 p-4">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <Phone className="size-4" />
                    House owner
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">{data.importantInfo.houseOwnerPhone ?? "Not set"}</p>
                </div>
                <div className="rounded-3xl border border-border/70 bg-background/70 p-4">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <Bell className="size-4" />
                    Emergency contacts
                  </p>
                  <p className="mt-2 text-sm whitespace-pre-wrap text-muted-foreground">
                    {Array.isArray(data.importantInfo.emergencyContacts)
                      ? data.importantInfo.emergencyContacts.join("\n")
                      : "Not set"}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
