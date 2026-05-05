"use client";

import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { saveMemberAction } from "@/lib/actions/members";
import { type MemberFormInput, type MemberFormValues, memberFormSchema } from "@/lib/validations/member";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UploadField } from "@/components/forms/upload-field";

const defaultValues: MemberFormInput = {
  name: "",
  email: "",
  phone: "",
  image: "",
  permanentAddress: "",
  roomNumber: "",
  joiningDate: new Date().toISOString().slice(0, 10),
  status: "ACTIVE",
  guardianPhone: "",
  monthlyRentShare: 0,
  notes: "",
  password: "",
};

export function MemberForm({
  initialData,
}: {
  initialData?: Partial<MemberFormValues>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm<MemberFormInput, undefined, MemberFormValues>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: {
      ...defaultValues,
      ...initialData,
    },
  });

  return (
    <Card className="border-white/70 bg-white/80 dark:border-white/10 dark:bg-slate-950/75">
      <CardHeader>
        <CardTitle>{initialData?.id ? "Edit member" : "Add new member"}</CardTitle>
        <CardDescription>Manage member identity, room, status, and rent share from one form.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-5 md:grid-cols-2"
          onSubmit={form.handleSubmit((values) => {
            startTransition(async () => {
              const result = await saveMemberAction(values);

              if (!result.success) {
                toast.error(result.message);
                return;
              }

              toast.success(result.message);
              router.push("/admin/members");
              router.refresh();
            });
          })}
        >
          <div className="space-y-2">
            <Label htmlFor="member-name">Name</Label>
            <Input id="member-name" {...form.register("name")} />
            {form.formState.errors.name ? <p className="text-xs text-destructive">{form.formState.errors.name.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="member-email">Email</Label>
            <Input id="member-email" type="email" {...form.register("email")} />
            {form.formState.errors.email ? <p className="text-xs text-destructive">{form.formState.errors.email.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="member-phone">Phone</Label>
            <Input id="member-phone" {...form.register("phone")} />
            {form.formState.errors.phone ? <p className="text-xs text-destructive">{form.formState.errors.phone.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="member-password">Password</Label>
            <Input id="member-password" type="password" placeholder={initialData?.id ? "Leave blank to keep current password" : ""} {...form.register("password")} />
            {form.formState.errors.password ? <p className="text-xs text-destructive">{form.formState.errors.password.message}</p> : null}
          </div>
          <div className="md:col-span-2">
            <Controller
              control={form.control}
              name="image"
              render={({ field }) => (
                <UploadField
                  label="Photo / avatar"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  folder="avatars"
                  accept="image/*"
                  helperText="Upload an avatar or paste an existing image URL."
                />
              )}
            />
            {form.formState.errors.image ? <p className="mt-2 text-xs text-destructive">{form.formState.errors.image.message}</p> : null}
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="member-address">Permanent address</Label>
            <Textarea id="member-address" {...form.register("permanentAddress")} />
            {form.formState.errors.permanentAddress ? <p className="text-xs text-destructive">{form.formState.errors.permanentAddress.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="member-room">Room number</Label>
            <Input id="member-room" {...form.register("roomNumber")} />
            {form.formState.errors.roomNumber ? <p className="text-xs text-destructive">{form.formState.errors.roomNumber.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="member-joining">Joining date</Label>
            <Input id="member-joining" type="date" {...form.register("joiningDate")} />
            {form.formState.errors.joiningDate ? <p className="text-xs text-destructive">{form.formState.errors.joiningDate.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Controller
              control={form.control}
              name="status"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="member-guardian">Guardian phone</Label>
            <Input id="member-guardian" {...form.register("guardianPhone")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="member-rent-share">Monthly rent share</Label>
            <Input id="member-rent-share" type="number" step="0.01" {...form.register("monthlyRentShare")} />
            {form.formState.errors.monthlyRentShare ? <p className="text-xs text-destructive">{form.formState.errors.monthlyRentShare.message}</p> : null}
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="member-notes">Notes</Label>
            <Textarea id="member-notes" {...form.register("notes")} />
          </div>
          <div className="md:col-span-2 flex gap-3">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : initialData?.id ? "Update member" : "Create member"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/admin/members")}>
              Clear
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
