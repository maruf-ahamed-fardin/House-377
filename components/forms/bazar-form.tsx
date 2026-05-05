"use client";

import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { saveBazarExpenseAction } from "@/lib/actions/bazar";
import { bazarExpenseFormSchema, type BazarExpenseFormInput, type BazarExpenseFormValues } from "@/lib/validations/finance";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UploadField } from "@/components/forms/upload-field";

export function BazarForm({
  members,
  initialData,
  redirectPath,
}: {
  members: { value: string; label: string }[];
  initialData?: Partial<BazarExpenseFormValues>;
  redirectPath: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm<BazarExpenseFormInput, undefined, BazarExpenseFormValues>({
    resolver: zodResolver(bazarExpenseFormSchema),
    defaultValues: {
      id: initialData?.id,
      itemName: initialData?.itemName ?? "",
      quantity: initialData?.quantity ?? 1,
      unit: initialData?.unit ?? "",
      price: initialData?.price ?? 0,
      date: initialData?.date ?? new Date().toISOString().slice(0, 10),
      boughtById: initialData?.boughtById ?? "",
      receiptUrl: initialData?.receiptUrl ?? "",
      notes: initialData?.notes ?? "",
    },
  });

  return (
    <Card className="border-white/70 bg-white/80 dark:border-white/10 dark:bg-slate-950/75">
      <CardHeader>
        <CardTitle>{initialData?.id ? "Edit bazar expense" : "Add bazar expense"}</CardTitle>
        <CardDescription>Track item details, buyer contribution, and optional receipt upload.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-5 md:grid-cols-2"
          onSubmit={form.handleSubmit((values) => {
            startTransition(async () => {
              const result = await saveBazarExpenseAction(values);

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
            <Label htmlFor="bazar-item">Item name</Label>
            <Input id="bazar-item" {...form.register("itemName")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bazar-price">Price</Label>
            <Input id="bazar-price" type="number" step="0.01" {...form.register("price")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bazar-quantity">Quantity</Label>
            <Input id="bazar-quantity" type="number" step="0.01" {...form.register("quantity")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bazar-unit">Unit</Label>
            <Input id="bazar-unit" placeholder="kg / packet / piece" {...form.register("unit")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bazar-date">Date</Label>
            <Input id="bazar-date" type="date" {...form.register("date")} />
          </div>
          <div className="space-y-2">
            <Label>Bought by</Label>
            <Controller
              control={form.control}
              name="boughtById"
              render={({ field }) => (
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select member" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Unknown / shared</SelectItem>
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
          <div className="md:col-span-2">
            <Controller
              control={form.control}
              name="receiptUrl"
              render={({ field }) => (
                <UploadField
                  label="Receipt / proof"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  folder="receipts"
                  accept="image/*,.pdf"
                  helperText="Upload a receipt image/PDF or paste a receipt URL."
                />
              )}
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="bazar-notes">Notes</Label>
            <Textarea id="bazar-notes" {...form.register("notes")} />
          </div>
          <div className="md:col-span-2 flex gap-3">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save bazar expense"}
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
