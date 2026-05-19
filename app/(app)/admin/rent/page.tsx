import Link from "next/link";
import { Home, Pencil, ReceiptText, Trash2, Wallet } from "lucide-react";

import { DeleteButton } from "@/components/forms/delete-button";
import { RentPaymentForm } from "@/components/forms/rent-payment-form";
import { RentSummaryForm } from "@/components/forms/rent-summary-form";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deleteRentPaymentAction } from "@/lib/actions/rent";
import { formatCurrency, formatDate } from "@/lib/format";
import { formatMonthLabel, getMonthKey } from "@/lib/month";
import { getRentPageData } from "@/lib/queries/app-data";
import { requireAdmin } from "@/lib/rbac";
import { createQueryString, decimalToNumber, getSingleSearchParam } from "@/lib/utils";

const filterSelectClassName =
  "flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:w-auto";

export default async function RentPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string | string[]; member?: string | string[]; edit?: string | string[] }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const monthKey = getSingleSearchParam(params.month) ?? getMonthKey();
  const selectedMemberId = getSingleSearchParam(params.member) ?? "";
  const editId = getSingleSearchParam(params.edit);
  const data = await getRentPageData(monthKey);
  const redirectPath = `/admin/rent${createQueryString({ month: monthKey, member: selectedMemberId || undefined })}`;
  const editingPayment = data.payments.find((payment) => payment.id === editId);
  const filteredPayments = selectedMemberId ? data.payments.filter((payment) => payment.memberId === selectedMemberId) : data.payments;
  const totalRentDue = data.report.memberRows.reduce((sum, row) => sum + Math.max(row.rentAmount - row.rentPayments, 0), 0);

  const summaryInitialData = {
    monthKey,
    totalHouseRent: data.report.summary ? decimalToNumber(data.report.summary.totalHouseRent) : 0,
    rentDistributionMode: data.report.summary?.rentDistributionMode ?? "EQUAL",
    notes: data.report.summary?.notes ?? "",
  } as const;

  const paymentInitialData = editingPayment
    ? {
        id: editingPayment.id,
        memberId: editingPayment.memberId,
        amount: decimalToNumber(editingPayment.amount),
        date: editingPayment.date.toISOString().slice(0, 10),
        notes: editingPayment.notes ?? "",
      }
    : undefined;

  return (
    <div className="space-y-8 pb-8">
      <PageHeader
        title="Rent Management"
        description={`Configure house rent distribution and track who has paid for ${formatMonthLabel(monthKey)}.`}
        action={
          <form className="flex flex-wrap items-center gap-3" method="GET">
            <Input className="w-full sm:w-[180px]" type="month" name="month" defaultValue={monthKey} />
            <select className={filterSelectClassName} name="member" defaultValue={selectedMemberId}>
              <option value="">All members</option>
              {data.options.map((member) => (
                <option key={member.value} value={member.value}>
                  {member.label}
                </option>
              ))}
            </select>
            <Button type="submit" variant="outline">
              Apply filters
            </Button>
          </form>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="House rent" value={formatCurrency(data.report.totalHouseRent)} description="Configured total rent for the selected month." icon={Home} />
        <StatCard title="Rent collected" value={formatCurrency(data.report.totalRentPayments)} description="Total rent payments already recorded." icon={Wallet} />
        <StatCard title="Pending rent due" value={formatCurrency(totalRentDue)} description="Remaining rent-only due across members." icon={ReceiptText} />
        <StatCard title="Distribution mode" value={data.report.summary?.rentDistributionMode ?? "EQUAL"} description="Equal split or profile-based member rent shares." icon={Home} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="space-y-6">
          <RentSummaryForm initialData={summaryInitialData} redirectPath={redirectPath} />
          <RentPaymentForm members={data.options} initialData={paymentInitialData} redirectPath={redirectPath} />
        </div>

        <div className="space-y-6">
          <Card className="border-white/70 bg-white/80 dark:border-white/10 dark:bg-slate-950/75">
            <CardHeader>
              <CardTitle>Member rent status</CardTitle>
              <CardDescription>Due amount is based only on configured rent minus recorded rent payments.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Rent amount</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Due</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.report.memberRows.map((row) => {
                    const due = Math.max(row.rentAmount - row.rentPayments, 0);

                    return (
                      <TableRow key={row.memberId}>
                        <TableCell className="font-medium">{row.name}</TableCell>
                        <TableCell>{formatCurrency(row.rentAmount)}</TableCell>
                        <TableCell>{formatCurrency(row.rentPayments)}</TableCell>
                        <TableCell>{formatCurrency(due)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="border-white/70 bg-white/80 dark:border-white/10 dark:bg-slate-950/75">
            <CardHeader>
              <CardTitle>Payment history</CardTitle>
              <CardDescription>Filter by month or by member to review rent collection history.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {filteredPayments.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Member</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Recorded by</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{formatDate(payment.date)}</TableCell>
                        <TableCell>{payment.member.user.name}</TableCell>
                        <TableCell>{formatCurrency(decimalToNumber(payment.amount))}</TableCell>
                        <TableCell>{payment.createdBy.name}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            <Button asChild size="sm" variant="outline">
                              <Link href={createQueryString({ month: monthKey, member: selectedMemberId || undefined, edit: payment.id })}>
                                <Pencil className="size-4" />
                                Edit
                              </Link>
                            </Button>
                            <DeleteButton label="Delete" message="Delete this rent payment?" variant="ghost" action={deleteRentPaymentAction.bind(null, payment.id)} />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="rounded-3xl border border-dashed border-border/70 p-10 text-center text-sm text-muted-foreground">
                  <Trash2 className="mx-auto mb-4 size-10" />
                  No rent payments match the current filters.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
