import Link from "next/link";
import { BanknoteArrowUp, CircleDollarSign, Pencil, Trash2, Wallet } from "lucide-react";

import { DeleteButton } from "@/components/forms/delete-button";
import { DepositForm } from "@/components/forms/deposit-form";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deleteDepositAction } from "@/lib/actions/deposits";
import { formatCurrency, formatDate } from "@/lib/format";
import { formatMonthLabel, getMonthKey } from "@/lib/month";
import { getDepositsPageData } from "@/lib/queries/app-data";
import { requireAdmin } from "@/lib/rbac";
import { createQueryString, decimalToNumber, getSingleSearchParam } from "@/lib/utils";

const filterSelectClassName =
  "flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:w-auto";

export default async function DepositsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string | string[]; member?: string | string[]; edit?: string | string[] }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const monthKey = getSingleSearchParam(params.month) ?? getMonthKey();
  const selectedMemberId = getSingleSearchParam(params.member) ?? "";
  const editId = getSingleSearchParam(params.edit);
  const data = await getDepositsPageData(monthKey);
  const redirectPath = `/admin/deposits${createQueryString({ month: monthKey, member: selectedMemberId || undefined })}`;
  const editingDeposit = data.records.find((record) => record.id === editId);
  const filteredRecords = selectedMemberId ? data.records.filter((record) => record.memberId === selectedMemberId) : data.records;
  const filteredTotal = filteredRecords.reduce((sum, record) => sum + decimalToNumber(record.amount), 0);

  const initialData = editingDeposit
    ? {
        id: editingDeposit.id,
        memberId: editingDeposit.memberId,
        amount: decimalToNumber(editingDeposit.amount),
        date: editingDeposit.date.toISOString().slice(0, 10),
        purpose: editingDeposit.purpose ?? "",
        notes: editingDeposit.notes ?? "",
      }
    : undefined;

  return (
    <div className="space-y-8 pb-8">
      <PageHeader
        title="Mess Fund Deposits"
        description={`Track member deposits and running mess balance for ${formatMonthLabel(monthKey)}.`}
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
        <StatCard title="Month deposits" value={formatCurrency(data.report.totalDeposits)} description="Total mess-fund deposits recorded this month." icon={BanknoteArrowUp} />
        <StatCard title="Mess balance" value={formatCurrency(data.report.messBalance)} description="Deposits plus rent payments minus monthly outflow." icon={CircleDollarSign} />
        <StatCard title="Filtered total" value={formatCurrency(filteredTotal)} description="Visible deposit total after member filtering." icon={Wallet} />
        <StatCard title="Entries" value={String(filteredRecords.length)} description="Deposit history rows visible for the selected month." icon={BanknoteArrowUp} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <DepositForm members={data.options} initialData={initialData} redirectPath={redirectPath} />

        <Card className="border-white/70 bg-white/80 dark:border-white/10 dark:bg-slate-950/75">
          <CardHeader>
            <CardTitle>Deposit history</CardTitle>
            <CardDescription>Filter by month and member to audit mess fund contributions.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {filteredRecords.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Recorded by</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{formatDate(record.date)}</TableCell>
                      <TableCell>{record.member.user.name}</TableCell>
                      <TableCell>{formatCurrency(decimalToNumber(record.amount))}</TableCell>
                      <TableCell>{record.purpose ?? "General fund"}</TableCell>
                      <TableCell>{record.createdBy.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          <Button asChild size="sm" variant="outline">
                            <Link href={createQueryString({ month: monthKey, member: selectedMemberId || undefined, edit: record.id })}>
                              <Pencil className="size-4" />
                              Edit
                            </Link>
                          </Button>
                          <DeleteButton label="Delete" message="Delete this deposit record?" variant="ghost" action={deleteDepositAction.bind(null, record.id)} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="rounded-3xl border border-dashed border-border/70 p-10 text-center text-sm text-muted-foreground">
                <Trash2 className="mx-auto mb-4 size-10" />
                No deposits match the current filters.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
