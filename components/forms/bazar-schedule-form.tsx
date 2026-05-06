"use client";

import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { saveBazarScheduleAction } from "@/lib/actions/community";
import { bazarScheduleFormSchema, type BazarScheduleFormInput, type BazarScheduleFormValues } from "@/lib/validations/community";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function BazarScheduleForm({
  members,
  initialData,
  redirectPath,
}: {
  members: { value: string; label: string }[];
  initialData?: Partial<BazarScheduleFormInput>;
  redirectPath: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm<BazarScheduleFormInput, undefined, BazarScheduleFormValues>({
    resolver: zodResolver(bazarScheduleFormSchema),
    defaultValues: {
      id: initialData?.id,
      memberId: initialData?.memberId ?? members[0]?.value ?? "",
      date: initialData?.date ?? new Date().toISOString().slice(0, 10),
      notes: initialData?.notes ?? "",
    },
  });

  return (
    <Card className="border-white/70 bg-white/80 dark:border-white/10 dark:bg-slate-950/75">
      <CardHeader>
        <CardTitle>{initialData?.id ? "Edit bazar duty" : "Assign bazar duty"}</CardTitle>
        <CardDescription>Set which member will handle bazar on which date.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-5"
          onSubmit={form.handleSubmit((values) => {
            startTransition(async () => {
              const result = await saveBazarScheduleAction(values);

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
            <Label htmlFor="schedule-date">Bazar date</Label>
            <Input id="schedule-date" type="date" {...form.register("date")} />
            {form.formState.errors.date ? <p className="text-xs text-destructive">{form.formState.errors.date.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="schedule-notes">Notes</Label>
            <Textarea id="schedule-notes" placeholder="Optional reminders or constraints" {...form.register("notes")} />
          </div>
          <div className="flex gap-3">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save schedule"}
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
