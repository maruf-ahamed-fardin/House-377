"use server";

import { createAuditLog } from "@/lib/audit";
import { ActionResult, actionError, getMonthKeyFromDateInput, normalizeText, parseDateInput, revalidateAppPaths } from "@/lib/actions/helpers";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/rbac";
import { depositFormSchema, type DepositFormValues } from "@/lib/validations/finance";

export async function saveDepositAction(values: DepositFormValues): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    const data = depositFormSchema.parse(values);
    const payload = {
      memberId: data.memberId,
      amount: data.amount,
      date: parseDateInput(data.date),
      monthKey: getMonthKeyFromDateInput(data.date),
      purpose: normalizeText(data.purpose),
      notes: normalizeText(data.notes),
      createdById: admin.id,
    };

    const deposit = data.id
      ? await prisma.deposit.update({
          where: { id: data.id },
          data: payload,
        })
      : await prisma.deposit.create({
          data: payload,
        });

    await createAuditLog({
      action: data.id ? "DEPOSIT_UPDATED" : "DEPOSIT_CREATED",
      entityType: "Deposit",
      entityId: deposit.id,
      performedById: admin.id,
      metadata: {
        memberId: data.memberId,
        amount: data.amount,
      },
    });

    revalidateAppPaths("/admin/deposits", "/admin/monthly-report", "/profile");

    return {
      success: true,
      message: "Deposit saved successfully.",
    };
  } catch (error) {
    return actionError("Unable to save deposit right now.", error);
  }
}

export async function deleteDepositAction(id: string): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    await prisma.deposit.delete({ where: { id } });

    await createAuditLog({
      action: "DEPOSIT_DELETED",
      entityType: "Deposit",
      entityId: id,
      performedById: admin.id,
    });

    revalidateAppPaths("/admin/deposits", "/admin/monthly-report", "/profile");

    return {
      success: true,
      message: "Deposit removed successfully.",
    };
  } catch (error) {
    return actionError("Unable to remove deposit right now.", error);
  }
}
