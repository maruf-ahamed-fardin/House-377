import Link from "next/link";
import { Pencil, UserRoundX } from "lucide-react";

import { DeleteButton } from "@/components/forms/delete-button";
import { MemberForm } from "@/components/forms/member-form";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { membersApi } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/format";


import { createQueryString, decimalToNumber, getSingleSearchParam } from "@/lib/utils";

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string | string[] }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const editId = getSingleSearchParam(params.edit);
  const members = await getMembersPageData();
  const editingMember = members.find((member) => member.id === editId);

  const editInitialData = editingMember
    ? {
        id: editingMember.id,
        name: editingMember.user.name,
        email: editingMember.user.email,
        phone: editingMember.user.phone ?? "",
        image: editingMember.user.image ?? "",
        permanentAddress: editingMember.permanentAddress,
        roomNumber: editingMember.roomNumber,
        joiningDate: editingMember.joiningDate.toISOString().slice(0, 10),
        status: editingMember.status,
        guardianPhone: editingMember.guardianPhone ?? "",
        monthlyRentShare: decimalToNumber(editingMember.monthlyRentShare),
        notes: editingMember.notes ?? "",
      }
    : undefined;

  return (
    <div className="space-y-8 pb-8">
      <PageHeader
        title="Members"
        description="Create, update, deactivate, and review the member roster with room assignments, guardian info, and rent shares."
        action={
          editId ? (
            <Button asChild variant="outline">
              <Link href="/admin/members">Create new member</Link>
            </Button>
          ) : undefined
        }
      />

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <MemberForm initialData={editInitialData} />

        <Card className="border-white/70 bg-white/80 dark:border-white/10 dark:bg-slate-950/75">
          <CardHeader>
            <CardTitle>Member list</CardTitle>
            <CardDescription>Inactive members stay visible so monthly history and audit context remain intact.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {members.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Joining date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Rent share</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{member.user.name}</p>
                          <p className="text-xs text-muted-foreground">{member.user.email}</p>
                          <p className="text-xs text-muted-foreground">{member.user.phone ?? "No phone"}</p>
                        </div>
                      </TableCell>
                      <TableCell>{member.roomNumber}</TableCell>
                      <TableCell>{formatDate(member.joiningDate)}</TableCell>
                      <TableCell>
                        <Badge variant={member.status === "ACTIVE" ? "default" : "secondary"}>{member.status}</Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(decimalToNumber(member.monthlyRentShare))}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          <Button asChild size="sm" variant="outline">
                            <Link href={createQueryString({ edit: member.id })}>
                              <Pencil className="size-4" />
                              Edit
                            </Link>
                          </Button>
                          <DeleteButton
                            label="Deactivate"
                            message="This will deactivate the member account and keep their historical records. Continue?"
                            variant="ghost"
                            action={membersApi.delete.bind(null, member.id)}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="rounded-3xl border border-dashed border-border/70 p-10 text-center text-sm text-muted-foreground">
                <UserRoundX className="mx-auto mb-4 size-10" />
                No members found yet. Use the form to add the first resident.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
