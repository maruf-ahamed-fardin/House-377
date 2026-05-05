"use server";

import { createAuditLog } from "@/lib/audit";
import { ActionResult, actionError, getMonthKeyFromDateInput, normalizeText, parseDateInput, revalidateAppPaths } from "@/lib/actions/helpers";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/rbac";
import { bazarExpenseFormSchema, type BazarExpenseFormValues } from "@/lib/validations/finance";

export async function saveBazarExpenseAction(values: BazarExpenseFormValues): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    const data = bazarExpenseFormSchema.parse(values);
    const payload = {
      itemName: data.itemName,
      quantity: data.quantity,
      unit: normalizeText(data.unit),
      price: data.price,
      date: parseDateInput(data.date),
      monthKey: getMonthKeyFromDateInput(data.date),
      boughtById: normalizeText(data.boughtById),
      receiptUrl: normalizeText(data.receiptUrl),
      notes: normalizeText(data.notes),
      createdById: admin.id,
    };

    const expense = data.id
      ? await prisma.bazarExpense.update({
          where: { id: data.id },
          data: payload,
        })
      : await prisma.bazarExpense.create({
          data: payload,
        });

    await createAuditLog({
      action: data.id ? "BAZAR_UPDATED" : "BAZAR_CREATED",
      entityType: "BazarExpense",
      entityId: expense.id,
      performedById: admin.id,
      metadata: {
        itemName: data.itemName,
        price: data.price,
      },
    });

    revalidateAppPaths("/admin/bazar", "/admin/monthly-report", "/profile");

    return {
      success: true,
      message: "Bazar expense saved successfully.",
    };
  } catch (error) {
    return actionError("Unable to save bazar expense right now.", error);
  }
}

export async function deleteBazarExpenseAction(id: string): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    await prisma.bazarExpense.delete({ where: { id } });

    await createAuditLog({
      action: "BAZAR_DELETED",
      entityType: "BazarExpense",
      entityId: id,
      performedById: admin.id,
    });

    revalidateAppPaths("/admin/bazar", "/admin/monthly-report", "/profile");

    return {
      success: true,
      message: "Bazar expense deleted successfully.",
    };
  } catch (error) {
    return actionError("Unable to delete bazar expense right now.", error);
  }
}
