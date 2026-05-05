"use server";

import { Prisma } from "@prisma/client";

import { createAuditLog } from "@/lib/audit";
import { ActionResult, actionError, normalizeText, revalidateAppPaths } from "@/lib/actions/helpers";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/rbac";
import { importantInfoFormSchema, type ImportantInfoFormValues } from "@/lib/validations/important-info";

function splitEmergencyContacts(value?: string | null) {
  const text = normalizeText(value);

  if (!text) {
    return null;
  }

  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export async function saveImportantInfoAction(values: ImportantInfoFormValues): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    const data = importantInfoFormSchema.parse(values);

    const existing = data.id
      ? await prisma.importantInfo.findUnique({ where: { id: data.id } })
      : await prisma.importantInfo.findFirst({ orderBy: { updatedAt: "desc" } });

    const payload = {
      electricityAccount: normalizeText(data.electricityAccount),
      gasCardNumber: normalizeText(data.gasCardNumber),
      wifiInfo: normalizeText(data.wifiInfo),
      houseOwnerPhone: normalizeText(data.houseOwnerPhone),
      emergencyContacts: splitEmergencyContacts(data.emergencyContacts) ?? Prisma.JsonNull,
      nearbyDoctorInfo: normalizeText(data.nearbyDoctorInfo),
      nearbyPharmacyInfo: normalizeText(data.nearbyPharmacyInfo),
      otherNotes: normalizeText(data.otherNotes),
      membersCanView: data.membersCanView,
      updatedById: admin.id,
    };

    const info = existing
      ? await prisma.importantInfo.update({
          where: { id: existing.id },
          data: payload,
        })
      : await prisma.importantInfo.create({
          data: payload,
        });

    await createAuditLog({
      action: "IMPORTANT_INFO_UPDATED",
      entityType: "ImportantInfo",
      entityId: info.id,
      performedById: admin.id,
      metadata: {
        membersCanView: data.membersCanView,
      },
    });

    revalidateAppPaths("/admin/important-info", "/profile");

    return {
      success: true,
      message: "Important information saved successfully.",
    };
  } catch (error) {
    return actionError("Unable to save important information right now.", error);
  }
}
