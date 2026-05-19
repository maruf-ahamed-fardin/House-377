"use client";

import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { saveImportantInfoAction } from "@/lib/actions/important-info";
import { importantInfoFormSchema, type ImportantInfoFormInput, type ImportantInfoFormValues } from "@/lib/validations/important-info";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export function ImportantInfoForm({
  initialData,
  redirectPath,
}: {
  initialData?: Partial<ImportantInfoFormValues>;
  redirectPath: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm<ImportantInfoFormInput, undefined, ImportantInfoFormValues>({
    resolver: zodResolver(importantInfoFormSchema),
    defaultValues: {
      id: initialData?.id,
      electricityAccount: initialData?.electricityAccount ?? "",
      gasCardNumber: initialData?.gasCardNumber ?? "",
      wifiInfo: initialData?.wifiInfo ?? "",
      houseOwnerPhone: initialData?.houseOwnerPhone ?? "",
      emergencyContacts: initialData?.emergencyContacts ?? "",
      nearbyDoctorInfo: initialData?.nearbyDoctorInfo ?? "",
      nearbyPharmacyInfo: initialData?.nearbyPharmacyInfo ?? "",
      otherNotes: initialData?.otherNotes ?? "",
      membersCanView: initialData?.membersCanView ?? true,
    },
  });

  return (
    <Card className="border-white/70 bg-white/80 dark:border-white/10 dark:bg-slate-950/75">
      <CardHeader>
        <CardTitle>Important mess information</CardTitle>
        <CardDescription>Securely keep billing references, emergency numbers, and landlord details in one place.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-5 md:grid-cols-2"
          onSubmit={form.handleSubmit((values) => {
            startTransition(async () => {
              const result = await saveImportantInfoAction(values);

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
            <Label htmlFor="info-electricity">Electricity account / card</Label>
            <Input id="info-electricity" {...form.register("electricityAccount")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="info-gas">Gas bill card number</Label>
            <Input id="info-gas" {...form.register("gasCardNumber")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="info-wifi">WiFi billing info</Label>
            <Input id="info-wifi" {...form.register("wifiInfo")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="info-owner">House owner phone</Label>
            <Input id="info-owner" {...form.register("houseOwnerPhone")} />
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="info-contacts">Emergency contacts</Label>
            <Textarea id="info-contacts" placeholder="One contact per line" {...form.register("emergencyContacts")} />
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="info-doctor">Nearby doctor</Label>
            <Textarea id="info-doctor" {...form.register("nearbyDoctorInfo")} />
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="info-pharmacy">Nearby pharmacy</Label>
            <Textarea id="info-pharmacy" {...form.register("nearbyPharmacyInfo")} />
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="info-notes">Other notes</Label>
            <Textarea id="info-notes" {...form.register("otherNotes")} />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-background/70 px-4 py-3 md:col-span-2">
            <div className="min-w-0">
              <p className="text-sm font-medium">Allow members to view</p>
              <p className="text-xs text-muted-foreground">Turn this on if the information should be visible in member profile/dashboard screens.</p>
            </div>
            <Controller
              control={form.control}
              name="membersCanView"
              render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
            />
          </div>
          <div className="md:col-span-2 flex gap-3">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save important info"}
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
