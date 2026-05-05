"use server";

import { createAuditLog } from "@/lib/audit";
import { ActionResult, actionError, getMonthKeyFromDateInput, normalizeText, parseDateInput, revalidateAppPaths } from "@/lib/actions/helpers";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/rbac";
import { otherExpenseFormSchema, type OtherExpenseFormValues } from "@/lib/validations/finance";

export async function saveOtherExpenseAction(values: OtherExpenseFormValues): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    const data = otherExpenseFormSchema.parse(values);
    const payload = {
      title: data.title,
      category: data.category,
      amount: data.amount,
      date: parseDateInput(data.date),
      monthKey: getMonthKeyFromDateInput(data.date),
      paidById: normalizeText(data.paidById),
      notes: normalizeText(data.notes),
      createdById: admin.id,
    };

    const expense = data.id
      ? await prisma.otherExpense.update({
          where: { id: data.id },
          data: payload,
        })
      : await prisma.otherExpense.create({
          data: payload,
        });

    await createAuditLog({
      action: data.id ? "OTHER_EXPENSE_UPDATED" : "OTHER_EXPENSE_CREATED",
      entityType: "OtherExpense",
      entityId: expense.id,
      performedById: admin.id,
      metadata: {
        title: data.title,
        amount: data.amount,
      },
    });

    revalidateAppPaths("/admin/expenses", "/admin/monthly-report", "/profile");

    return {
      success: true,
      message: "Expense saved successfully.",
    };
  } catch (error) {
    return actionError("Unable to save expense right now.", error);
  }
}

export async function deleteOtherExpenseAction(id: string): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    await prisma.otherExpense.delete({ where: { id } });

    await createAuditLog({
      action: "OTHER_EXPENSE_DELETED",
      entityType: "OtherExpense",
      entityId: id,
      performedById: admin.id,
    });

    revalidateAppPaths("/admin/expenses", "/admin/monthly-report", "/profile");

    return {
      success: true,
      message: "Expense removed successfully.",
    };
  } catch (error) {
    return actionError("Unable to remove expense right now.", error);
  }
}
