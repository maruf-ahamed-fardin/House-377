"use client";

import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { saveRentPaymentAction } from "@/lib/actions/rent";
import { rentPaymentFormSchema, type RentPaymentFormInput, type RentPaymentFormValues } from "@/lib/validations/finance";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function RentPaymentForm({
  members,
  initialData,
  redirectPath,
}: {
  members: { value: string; label: string }[];
  initialData?: Partial<RentPaymentFormValues>;
  redirectPath: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm<RentPaymentFormInput, undefined, RentPaymentFormValues>({
    resolver: zodResolver(rentPaymentFormSchema),
    defaultValues: {
      id: initialData?.id,
      memberId: initialData?.memberId ?? members[0]?.value ?? "",
      amount: initialData?.amount ?? 0,
      date: initialData?.date ?? new Date().toISOString().slice(0, 10),
      notes: initialData?.notes ?? "",
    },
  });

  return (
    <Card className="border-white/70 bg-white/80 dark:border-white/10 dark:bg-slate-950/75">
      <CardHeader>
        <CardTitle>{initialData?.id ? "Edit rent payment" : "Add rent payment"}</CardTitle>
        <CardDescription>Record how much each member has already paid toward this month&apos;s rent.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-5 md:grid-cols-2"
          onSubmit={form.handleSubmit((values) => {
            startTransition(async () => {
              const result = await saveRentPaymentAction(values);

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
          <div className="md:col-span-2 space-y-2">
            <Label>Member</Label>
            <Controller
              control={form.control}
              name="memberId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
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
          <div className="space-y-2">
            <Label htmlFor="rent-payment-amount">Amount</Label>
            <Input id="rent-payment-amount" type="number" step="0.01" {...form.register("amount")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rent-payment-date">Date</Label>
            <Input id="rent-payment-date" type="date" {...form.register("date")} />
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="rent-payment-notes">Notes</Label>
            <Textarea id="rent-payment-notes" {...form.register("notes")} />
          </div>
          <div className="md:col-span-2 flex gap-3">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save rent payment"}
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
