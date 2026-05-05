"use client";

import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { saveMonthlySummaryAction } from "@/lib/actions/rent";
import { rentSummaryFormSchema, type RentSummaryFormInput, type RentSummaryFormValues } from "@/lib/validations/finance";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function RentSummaryForm({
  initialData,
  redirectPath,
}: {
  initialData: RentSummaryFormValues;
  redirectPath: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm<RentSummaryFormInput, undefined, RentSummaryFormValues>({
    resolver: zodResolver(rentSummaryFormSchema),
    defaultValues: initialData,
  });

  return (
    <Card className="border-white/70 bg-white/80 dark:border-white/10 dark:bg-slate-950/75">
      <CardHeader>
        <CardTitle>Monthly rent configuration</CardTitle>
        <CardDescription>Choose whether rent is split equally or pulled from each member&apos;s profile share.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-5 md:grid-cols-2"
          onSubmit={form.handleSubmit((values) => {
            startTransition(async () => {
              const result = await saveMonthlySummaryAction(values);

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
            <Label htmlFor="rent-month">Month</Label>
            <Input id="rent-month" {...form.register("monthKey")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rent-total">Total house rent</Label>
            <Input id="rent-total" type="number" step="0.01" {...form.register("totalHouseRent")} />
          </div>
          <div className="space-y-2">
            <Label>Distribution mode</Label>
            <Controller
              control={form.control}
              name="rentDistributionMode"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EQUAL">Equal split</SelectItem>
                    <SelectItem value="PROFILE">Use member rent shares</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="rent-notes">Notes</Label>
            <Textarea id="rent-notes" {...form.register("notes")} />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save monthly settings"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
