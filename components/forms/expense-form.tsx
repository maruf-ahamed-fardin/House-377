"use client";

import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { expensesApi } from "@/lib/api-client";
import { otherExpenseFormSchema, type OtherExpenseFormInput, type OtherExpenseFormValues } from "@/lib/validations/finance";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const categories = [
  { value: "ELECTRICITY", label: "Electricity" },
  { value: "GAS", label: "Gas" },
  { value: "INTERNET", label: "Internet" },
  { value: "CLEANING", label: "Cleaning" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "WATER", label: "Water" },
  { value: "OTHER", label: "Other" },
] as const;

const UNLINKED_PAYER_VALUE = "__unlinked_payer__";

export function ExpenseForm({
  members,
  initialData,
  redirectPath,
}: {
  members: { value: string; label: string }[];
  initialData?: Partial<OtherExpenseFormValues>;
  redirectPath: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm<OtherExpenseFormInput, undefined, OtherExpenseFormValues>({
    resolver: zodResolver(otherExpenseFormSchema),
    defaultValues: {
      id: initialData?.id,
      title: initialData?.title ?? "",
      category: initialData?.category ?? "ELECTRICITY",
      amount: initialData?.amount ?? 0,
      date: initialData?.date ?? new Date().toISOString().slice(0, 10),
      paidById: initialData?.paidById ?? "",
      notes: initialData?.notes ?? "",
    },
  });

  return (
    <Card className="border-white/70 bg-white/80 dark:border-white/10 dark:bg-slate-950/75">
      <CardHeader>
        <CardTitle>{initialData?.id ? "Edit expense" : "Add other expense"}</CardTitle>
        <CardDescription>Track utility and maintenance costs that sit outside meal bazar and rent.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-5 md:grid-cols-2"
          onSubmit={form.handleSubmit((values) => {
            startTransition(async () => {
              const result = await expensesApi.save(values);

              if (!result.success) {
                toast.error(result.message);
                return;
              }

              toast.success(result.message);
              router.push(redirectPath);
              router.refresh();
            });
          })}
        >
          <div className="space-y-2">
            <Label htmlFor="expense-title">Title</Label>
            <Input id="expense-title" {...form.register("title")} />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Controller
              control={form.control}
              name="category"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expense-amount">Amount</Label>
            <Input id="expense-amount" type="number" step="0.01" {...form.register("amount")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expense-date">Date</Label>
            <Input id="expense-date" type="date" {...form.register("date")} />
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label>Paid by</Label>
            <Controller
              control={form.control}
              name="paidById"
              render={({ field }) => (
                <Select
                  value={field.value || UNLINKED_PAYER_VALUE}
                  onValueChange={(value) => field.onChange(value === UNLINKED_PAYER_VALUE ? "" : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Optional" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UNLINKED_PAYER_VALUE}>Not linked to a member</SelectItem>
                    {members.map((member) => (
                      <SelectItem key={member.value} value={member.value}>
                        {member.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="expense-notes">Notes</Label>
            <Textarea id="expense-notes" {...form.register("notes")} />
          </div>
          <div className="flex flex-wrap gap-3 md:col-span-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save expense"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push(redirectPath)}>
              Clear
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
