import { BadgeAlert, Phone, Router, ShieldCheck } from "lucide-react";

import { ImportantInfoForm } from "@/components/forms/important-info-form";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";
import { getImportantInfoRecord } from "@/lib/queries/app-data";
import { requireAdmin } from "@/lib/rbac";

export default async function ImportantInfoPage() {
  await requireAdmin();
  const record = await getImportantInfoRecord();

  const initialData = record
    ? {
        id: record.id,
        electricityAccount: record.electricityAccount ?? "",
        gasCardNumber: record.gasCardNumber ?? "",
        wifiInfo: record.wifiInfo ?? "",
        houseOwnerPhone: record.houseOwnerPhone ?? "",
        emergencyContacts: Array.isArray(record.emergencyContacts) ? record.emergencyContacts.join("\n") : "",
        nearbyDoctorInfo: record.nearbyDoctorInfo ?? "",
        nearbyPharmacyInfo: record.nearbyPharmacyInfo ?? "",
        otherNotes: record.otherNotes ?? "",
        membersCanView: record.membersCanView,
      }
    : undefined;

  return (
    <div className="space-y-8 pb-8">
      <PageHeader
        title="Important Information"
        description="Secure household references for bills, landlord contacts, emergency support, and nearby services."
      />

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <ImportantInfoForm initialData={initialData} redirectPath="/admin/important-info" />

        <Card className="border-white/70 bg-white/80 dark:border-white/10 dark:bg-slate-950/75">
          <CardHeader>
            <CardTitle>Current shared record</CardTitle>
            <CardDescription>Members can only see this when the sharing toggle is enabled.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-border/70 bg-background/70 p-4">
              <p className="flex items-center gap-2 text-sm font-medium">
                <Router className="size-4" />
                Electricity account
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{record?.electricityAccount ?? "Not set"}</p>
            </div>
            <div className="rounded-3xl border border-border/70 bg-background/70 p-4">
              <p className="flex items-center gap-2 text-sm font-medium">
                <ShieldCheck className="size-4" />
                Gas card / WiFi
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {record?.gasCardNumber ?? "Gas not set"}
                <br />
                {record?.wifiInfo ?? "WiFi not set"}
              </p>
            </div>
            <div className="rounded-3xl border border-border/70 bg-background/70 p-4">
              <p className="flex items-center gap-2 text-sm font-medium">
                <Phone className="size-4" />
                House owner
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{record?.houseOwnerPhone ?? "Not set"}</p>
            </div>
            <div className="rounded-3xl border border-border/70 bg-background/70 p-4">
              <p className="flex items-center gap-2 text-sm font-medium">
                <BadgeAlert className="size-4" />
                Visibility
              </p>
              <div className="mt-2">
                <Badge variant={record?.membersCanView ? "default" : "secondary"}>
                  {record?.membersCanView ? "Members can view" : "Admins only"}
                </Badge>
              </div>
            </div>
            <div className="md:col-span-2 rounded-3xl border border-border/70 bg-background/70 p-4">
              <p className="text-sm font-medium">Emergency contacts</p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                {Array.isArray(record?.emergencyContacts) ? record.emergencyContacts.join("\n") : "Not set"}
              </p>
            </div>
            <div className="md:col-span-2 rounded-3xl border border-border/70 bg-background/70 p-4">
              <p className="text-sm font-medium">Nearby doctor / pharmacy / notes</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                {[record?.nearbyDoctorInfo, record?.nearbyPharmacyInfo, record?.otherNotes].filter(Boolean).join("\n\n") || "Not set"}
              </p>
            </div>
            <div className="md:col-span-2 rounded-3xl border border-border/70 bg-background/70 p-4 text-sm text-muted-foreground">
              Last updated {record ? formatDateTime(record.updatedAt) : "never"}
              {record?.updatedBy ? ` by ${record.updatedBy.name}` : ""}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
