import Link from "next/link";
import { Pencil, Trash2, UtensilsCrossed } from "lucide-react";

import { DeleteButton } from "@/components/forms/delete-button";
import { MealForm } from "@/components/forms/meal-form";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mealsApi } from "@/lib/api-client";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import { formatMonthLabel, getMonthKey } from "@/lib/month";


import { createQueryString, decimalToNumber, getSingleSearchParam } from "@/lib/utils";

export default async function MealsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string | string[]; edit?: string | string[] }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const monthKey = getSingleSearchParam(params.month) ?? getMonthKey();
  const editId = getSingleSearchParam(params.edit);
  const data = await getMealsPageData(monthKey);
  const editingRecord = data.records.find((record) => record.id === editId);
  const redirectPath = `/admin/meals${createQueryString({ month: monthKey })}`;

  const initialData = editingRecord
    ? {
        id: editingRecord.id,
        memberId: editingRecord.memberId,
        date: editingRecord.date.toISOString().slice(0, 10),
        breakfastCount: decimalToNumber(editingRecord.breakfastCount),
        lunchCount: decimalToNumber(editingRecord.lunchCount),
        dinnerCount: decimalToNumber(editingRecord.dinnerCount),
        notes: editingRecord.notes ?? "",
      }
    : undefined;

  return (
    <div className="space-y-8 pb-8">
      <PageHeader
        title="Meal Management"
        description={`Daily breakfast, lunch, and dinner counts for ${formatMonthLabel(monthKey)} with live meal-rate calculation.`}
        action={
          <form className="flex flex-wrap items-center gap-3" method="GET">
            <Input className="w-full sm:w-[180px]" type="month" name="month" defaultValue={monthKey} />
            <Button type="submit" variant="outline">
              Filter month
            </Button>
          </form>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Month meals" value={formatNumber(data.report.totalMeals)} description="Combined count across all recorded members." icon={UtensilsCrossed} />
        <StatCard title="Meal rate" value={formatCurrency(data.report.mealRate)} description="Auto-derived from bazar spend divided by total meals." icon={UtensilsCrossed} />
        <StatCard title="Bazar cost" value={formatCurrency(data.report.totalBazarCost)} description="Used directly in the current month meal-rate calculation." icon={UtensilsCrossed} />
        <StatCard title="Entries" value={String(data.records.length)} description="Individual member-day meal records captured this month." icon={UtensilsCrossed} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <MealForm members={data.options} initialData={initialData} redirectPath={redirectPath} />

        <Card className="border-white/70 bg-white/80 dark:border-white/10 dark:bg-slate-950/75">
          <CardHeader>
            <CardTitle>Meal records</CardTitle>
            <CardDescription>Edit daily counts whenever the mess ledger changes.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {data.records.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead>Breakfast</TableHead>
                    <TableHead>Lunch</TableHead>
                    <TableHead>Dinner</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Updated by</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.records.map((record) => {
                    const total =
                      decimalToNumber(record.breakfastCount) +
                      decimalToNumber(record.lunchCount) +
                      decimalToNumber(record.dinnerCount);

                    return (
                      <TableRow key={record.id}>
                        <TableCell>{formatDate(record.date)}</TableCell>
                        <TableCell>{record.member.user.name}</TableCell>
                        <TableCell>{formatNumber(decimalToNumber(record.breakfastCount))}</TableCell>
                        <TableCell>{formatNumber(decimalToNumber(record.lunchCount))}</TableCell>
                        <TableCell>{formatNumber(decimalToNumber(record.dinnerCount))}</TableCell>
                        <TableCell>{formatNumber(total)}</TableCell>
                        <TableCell>{record.updatedBy.name}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            <Button asChild size="sm" variant="outline">
                              <Link href={createQueryString({ month: monthKey, edit: record.id })}>
                                <Pencil className="size-4" />
                                Edit
                              </Link>
                            </Button>
                            <DeleteButton label="Delete" message="Delete this meal record?" variant="ghost" action={mealsApi.delete.bind(null, record.id)} />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="rounded-3xl border border-dashed border-border/70 p-10 text-center text-sm text-muted-foreground">
                <Trash2 className="mx-auto mb-4 size-10" />
                No meal records for this month yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
