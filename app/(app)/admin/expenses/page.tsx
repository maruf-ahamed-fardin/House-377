import Link from "next/link";
import { CreditCard, Pencil, Trash2, Wallet } from "lucide-react";

import { DeleteButton } from "@/components/forms/delete-button";
import { ExpenseForm } from "@/components/forms/expense-form";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deleteOtherExpenseAction } from "@/lib/actions/expenses";
import { expenseCategoryLabels } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/format";
import { formatMonthLabel, getMonthKey } from "@/lib/month";
import { getOtherExpensesPageData } from "@/lib/queries/app-data";
import { requireAdmin } from "@/lib/rbac";
import { createQueryString, decimalToNumber, getSingleSearchParam } from "@/lib/utils";

const filterSelectClassName =
  "flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:w-auto";

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string | string[]; member?: string | string[]; edit?: string | string[] }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const monthKey = getSingleSearchParam(params.month) ?? getMonthKey();
  const selectedMemberId = getSingleSearchParam(params.member) ?? "";
  const editId = getSingleSearchParam(params.edit);
  const data = await getOtherExpensesPageData(monthKey);
  const redirectPath = `/admin/expenses${createQueryString({ month: monthKey, member: selectedMemberId || undefined })}`;
  const editingExpense = data.records.find((record) => record.id === editId);
  const filteredRecords = selectedMemberId ? data.records.filter((record) => record.paidById === selectedMemberId) : data.records;
  const filteredTotal = filteredRecords.reduce((sum, record) => sum + decimalToNumber(record.amount), 0);

  const initialData = editingExpense
    ? {
        id: editingExpense.id,
        title: editingExpense.title,
        category: editingExpense.category,
        amount: decimalToNumber(editingExpense.amount),
        date: editingExpense.date.toISOString().slice(0, 10),
        paidById: editingExpense.paidById ?? "",
        notes: editingExpense.notes ?? "",
      }
    : undefined;

  return (
    <div className="space-y-8 pb-8">
      <PageHeader
        title="Other Expenses"
        description={`Utilities, maintenance, cleaning, and non-bazar costs for ${formatMonthLabel(monthKey)}.`}
        action={
          <form className="flex flex-wrap items-center gap-3" method="GET">
            <Input className="w-full sm:w-[180px]" type="month" name="month" defaultValue={monthKey} />
            <select className={filterSelectClassName} name="member" defaultValue={selectedMemberId}>
              <option value="">All payers</option>
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
        <StatCard title="Month expenses" value={formatCurrency(data.report.totalOtherExpenses)} description="All non-bazar and non-rent expenses recorded this month." icon={CreditCard} />
        <StatCard title="Per-member share" value={formatCurrency(data.report.otherExpenseShare)} description="Equal monthly share across active members." icon={Wallet} />
        <StatCard title="Filtered total" value={formatCurrency(filteredTotal)} description="Visible total after applying payer filters." icon={CreditCard} />
        <StatCard title="Entries" value={String(filteredRecords.length)} description="Expense rows currently visible in history." icon={Wallet} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <ExpenseForm members={data.options} initialData={initialData} redirectPath={redirectPath} />

        <Card className="border-white/70 bg-white/80 dark:border-white/10 dark:bg-slate-950/75">
          <CardHeader>
            <CardTitle>Expense history</CardTitle>
            <CardDescription>Review utilities and service costs with month and payer filters.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {filteredRecords.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Paid by</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{formatDate(record.date)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{record.title}</p>
                          {record.notes ? <p className="text-xs text-muted-foreground">{record.notes}</p> : null}
                        </div>
                      </TableCell>
                      <TableCell>{expenseCategoryLabels[record.category]}</TableCell>
                      <TableCell>{formatCurrency(decimalToNumber(record.amount))}</TableCell>
                      <TableCell>{record.paidBy?.user.name ?? "Not linked"}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          <Button asChild size="sm" variant="outline">
                            <Link href={createQueryString({ month: monthKey, member: selectedMemberId || undefined, edit: record.id })}>
                              <Pencil className="size-4" />
                              Edit
                            </Link>
                          </Button>
                          <DeleteButton label="Delete" message="Delete this expense record?" variant="ghost" action={deleteOtherExpenseAction.bind(null, record.id)} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="rounded-3xl border border-dashed border-border/70 p-10 text-center text-sm text-muted-foreground">
                <Trash2 className="mx-auto mb-4 size-10" />
                No expense rows match the current filters.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
