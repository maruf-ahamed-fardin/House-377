"use client";

import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { saveMealRecordAction } from "@/lib/actions/meals";
import { mealFormSchema, type MealFormValues } from "@/lib/validations/meal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function MealForm({
  members,
  initialData,
  redirectPath,
}: {
  members: { value: string; label: string }[];
  initialData?: Partial<MealFormValues>;
  redirectPath: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm<MealFormValues>({
    resolver: zodResolver(mealFormSchema),
    defaultValues: {
      memberId: initialData?.memberId ?? members[0]?.value ?? "",
      date: initialData?.date ?? new Date().toISOString().slice(0, 10),
      breakfastCount: initialData?.breakfastCount ?? 0,
      lunchCount: initialData?.lunchCount ?? 0,
      dinnerCount: initialData?.dinnerCount ?? 0,
      notes: initialData?.notes ?? "",
      id: initialData?.id,
    },
  });

  return (
    <Card className="border-white/70 bg-white/80 dark:border-white/10 dark:bg-slate-950/75">
      <CardHeader>
        <CardTitle>{initialData?.id ? "Update meal entry" : "Add meal entry"}</CardTitle>
        <CardDescription>Breakfast, lunch, and dinner counts are tracked per member, per day.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-5 md:grid-cols-2"
          onSubmit={form.handleSubmit((values) => {
            startTransition(async () => {
              const result = await saveMealRecordAction(values);

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
                    <SelectValue placeholder="Select member" />
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
            {form.formState.errors.memberId ? <p className="text-xs text-destructive">{form.formState.errors.memberId.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="meal-date">Date</Label>
            <Input id="meal-date" type="date" {...form.register("date")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="meal-breakfast">Breakfast count</Label>
            <Input id="meal-breakfast" type="number" step="0.5" {...form.register("breakfastCount")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="meal-lunch">Lunch count</Label>
            <Input id="meal-lunch" type="number" step="0.5" {...form.register("lunchCount")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="meal-dinner">Dinner count</Label>
            <Input id="meal-dinner" type="number" step="0.5" {...form.register("dinnerCount")} />
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="meal-notes">Notes</Label>
            <Textarea id="meal-notes" {...form.register("notes")} />
          </div>
          <div className="md:col-span-2 flex gap-3">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save meal record"}
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
