"use server";

import { createAuditLog } from "@/lib/audit";
import { ActionResult, actionError, getMonthKeyFromDateInput, normalizeText, parseDateInput, revalidateAppPaths } from "@/lib/actions/helpers";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/rbac";
import { rentPaymentFormSchema, rentSummaryFormSchema, type RentPaymentFormValues, type RentSummaryFormValues } from "@/lib/validations/finance";

export async function saveMonthlySummaryAction(values: RentSummaryFormValues): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    const data = rentSummaryFormSchema.parse(values);

    const summary = await prisma.monthlySummary.upsert({
      where: { monthKey: data.monthKey },
      create: {
        monthKey: data.monthKey,
        totalHouseRent: data.totalHouseRent,
        rentDistributionMode: data.rentDistributionMode,
        notes: normalizeText(data.notes),
        updatedById: admin.id,
      },
      update: {
        totalHouseRent: data.totalHouseRent,
        rentDistributionMode: data.rentDistributionMode,
        notes: normalizeText(data.notes),
        updatedById: admin.id,
      },
    });

    await createAuditLog({
      action: "MONTHLY_SUMMARY_UPDATED",
      entityType: "MonthlySummary",
      entityId: summary.id,
      performedById: admin.id,
      metadata: {
        monthKey: data.monthKey,
        totalHouseRent: data.totalHouseRent,
        rentDistributionMode: data.rentDistributionMode,
      },
    });

    revalidateAppPaths("/admin/rent", "/admin/monthly-report", "/profile");

    return {
      success: true,
      message: "Monthly rent settings saved successfully.",
    };
  } catch (error) {
    return actionError("Unable to save monthly rent settings right now.", error);
  }
}

export async function saveRentPaymentAction(values: RentPaymentFormValues): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    const data = rentPaymentFormSchema.parse(values);
    const payload = {
      memberId: data.memberId,
      amount: data.amount,
      date: parseDateInput(data.date),
      monthKey: getMonthKeyFromDateInput(data.date),
      notes: normalizeText(data.notes),
      createdById: admin.id,
    };

    const payment = data.id
      ? await prisma.rentPayment.update({
          where: { id: data.id },
          data: payload,
        })
      : await prisma.rentPayment.create({
          data: payload,
        });

    await createAuditLog({
      action: data.id ? "RENT_PAYMENT_UPDATED" : "RENT_PAYMENT_CREATED",
      entityType: "RentPayment",
      entityId: payment.id,
      performedById: admin.id,
      metadata: {
        memberId: data.memberId,
        amount: data.amount,
      },
    });

    revalidateAppPaths("/admin/rent", "/admin/monthly-report", "/profile");

    return {
      success: true,
      message: "Rent payment saved successfully.",
    };
  } catch (error) {
    return actionError("Unable to save rent payment right now.", error);
  }
}

export async function deleteRentPaymentAction(id: string): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    await prisma.rentPayment.delete({ where: { id } });

    await createAuditLog({
      action: "RENT_PAYMENT_DELETED",
      entityType: "RentPayment",
      entityId: id,
      performedById: admin.id,
    });

    revalidateAppPaths("/admin/rent", "/admin/monthly-report", "/profile");

    return {
      success: true,
      message: "Rent payment removed successfully.",
    };
  } catch (error) {
    return actionError("Unable to remove rent payment right now.", error);
  }
}
