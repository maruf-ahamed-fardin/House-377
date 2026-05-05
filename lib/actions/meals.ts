"use server";

import { createAuditLog } from "@/lib/audit";
import { ActionResult, actionError, getMonthKeyFromDateInput, normalizeText, parseDateInput, revalidateAppPaths } from "@/lib/actions/helpers";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/rbac";
import { mealFormSchema, type MealFormValues } from "@/lib/validations/meal";

export async function saveMealRecordAction(values: MealFormValues): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    const data = mealFormSchema.parse(values);
    const date = parseDateInput(data.date);
    const monthKey = getMonthKeyFromDateInput(data.date);

    const record = await prisma.mealRecord.upsert({
      where: {
        memberId_date: {
          memberId: data.memberId,
          date,
        },
      },
      create: {
        memberId: data.memberId,
        date,
        monthKey,
        breakfastCount: data.breakfastCount,
        lunchCount: data.lunchCount,
        dinnerCount: data.dinnerCount,
        notes: normalizeText(data.notes),
        updatedById: admin.id,
      },
      update: {
        breakfastCount: data.breakfastCount,
        lunchCount: data.lunchCount,
        dinnerCount: data.dinnerCount,
        notes: normalizeText(data.notes),
        updatedById: admin.id,
        monthKey,
      },
    });

    await createAuditLog({
      action: data.id ? "MEAL_UPDATED" : "MEAL_CREATED",
      entityType: "MealRecord",
      entityId: record.id,
      performedById: admin.id,
      metadata: {
        memberId: data.memberId,
        date: data.date,
        breakfastCount: data.breakfastCount,
        lunchCount: data.lunchCount,
        dinnerCount: data.dinnerCount,
      },
    });

    revalidateAppPaths("/admin/meals", "/admin/monthly-report", "/profile");

    return {
      success: true,
      message: "Meal record saved successfully.",
    };
  } catch (error) {
    return actionError("Unable to save meal record right now.", error);
  }
}

export async function deleteMealRecordAction(id: string): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    await prisma.mealRecord.delete({ where: { id } });

    await createAuditLog({
      action: "MEAL_DELETED",
      entityType: "MealRecord",
      entityId: id,
      performedById: admin.id,
    });

    revalidateAppPaths("/admin/meals", "/admin/monthly-report", "/profile");

    return {
      success: true,
      message: "Meal record removed successfully.",
    };
  } catch (error) {
    return actionError("Unable to remove meal record right now.", error);
  }
}
