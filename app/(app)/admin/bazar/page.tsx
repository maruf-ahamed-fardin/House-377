import Link from "next/link";
import { ExternalLink, Pencil, Receipt, ShoppingBag, Trash2 } from "lucide-react";

import { DeleteButton } from "@/components/forms/delete-button";
import { BazarForm } from "@/components/forms/bazar-form";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { bazarApi } from "@/lib/api-client";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import { formatMonthLabel, getMonthKey } from "@/lib/month";


import { createQueryString, decimalToNumber, getSingleSearchParam } from "@/lib/utils";

const filterSelectClassName =
  "flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:w-auto";

export default async function BazarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string | string[]; member?: string | string[]; edit?: string | string[] }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const monthKey = getSingleSearchParam(params.month) ?? getMonthKey();
  const selectedMemberId = getSingleSearchParam(params.member) ?? "";
  const editId = getSingleSearchParam(params.edit);
  const data = await getBazarPageData(monthKey);
  const redirectPath = `/admin/bazar${createQueryString({ month: monthKey, member: selectedMemberId || undefined })}`;
  const editingRecord = data.records.find((record) => record.id === editId);
  const filteredRecords = selectedMemberId ? data.records.filter((record) => record.boughtById === selectedMemberId) : data.records;

  const initialData = editingRecord
    ? {
        id: editingRecord.id,
        itemName: editingRecord.itemName,
        quantity: decimalToNumber(editingRecord.quantity),
        unit: editingRecord.unit ?? "",
        price: decimalToNumber(editingRecord.price),
        date: editingRecord.date.toISOString().slice(0, 10),
        boughtById: editingRecord.boughtById ?? "",
        receiptUrl: editingRecord.receiptUrl ?? "",
        notes: editingRecord.notes ?? "",
      }
    : undefined;

  const filteredTotal = filteredRecords.reduce((sum, record) => sum + decimalToNumber(record.price), 0);

  return (
    <div className="space-y-8 pb-8">
      <PageHeader
        title="Bazar & Grocery"
        description={`Track বাজার purchases, buyer contributions, receipts, and food spend for ${formatMonthLabel(monthKey)}.`}
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
        <StatCard title="Month bazar cost" value={formatCurrency(data.report.totalBazarCost)} description="Total grocery and food market spend for the month." icon={Receipt} />
        <StatCard title="Meal rate" value={formatCurrency(data.report.mealRate)} description="This bazar spend feeds directly into the monthly meal rate." icon={ShoppingBag} />
        <StatCard title="Filtered total" value={formatCurrency(filteredTotal)} description="Visible table total after applying member filters." icon={Receipt} />
        <StatCard title="Entries" value={String(filteredRecords.length)} description="Bazar rows currently visible in the history table." icon={ShoppingBag} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <BazarForm members={data.options} initialData={initialData} redirectPath={redirectPath} />

        <Card className="border-white/70 bg-white/80 dark:border-white/10 dark:bg-slate-950/75">
          <CardHeader>
            <CardTitle>Bazar history</CardTitle>
            <CardDescription>Filter the table by month or by the member who bought the items.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {filteredRecords.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Bought by</TableHead>
                    <TableHead>Receipt</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{formatDate(record.date)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{record.itemName}</p>
                          {record.notes ? <p className="text-xs text-muted-foreground">{record.notes}</p> : null}
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatNumber(decimalToNumber(record.quantity))}
                        {record.unit ? ` ${record.unit}` : ""}
                      </TableCell>
                      <TableCell>{formatCurrency(decimalToNumber(record.price))}</TableCell>
                      <TableCell>{record.boughtBy?.user.name ?? "Unknown / shared"}</TableCell>
                      <TableCell>
                        {record.receiptUrl ? (
                          <Button asChild size="sm" variant="outline">
                            <a href={record.receiptUrl} target="_blank" rel="noreferrer">
                              Open
                              <ExternalLink className="size-4" />
                            </a>
                          </Button>
                        ) : (
                          "None"
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          <Button asChild size="sm" variant="outline">
                            <Link href={createQueryString({ month: monthKey, member: selectedMemberId || undefined, edit: record.id })}>
                              <Pencil className="size-4" />
                              Edit
                            </Link>
                          </Button>
                          <DeleteButton label="Delete" message="Delete this bazar record?" variant="ghost" action={bazarApi.delete.bind(null, record.id)} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="rounded-3xl border border-dashed border-border/70 p-10 text-center text-sm text-muted-foreground">
                <Trash2 className="mx-auto mb-4 size-10" />
                No bazar records match the current filters.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
