import { Router } from "express";
import { Prisma } from "@prisma/client";

import { prisma } from "../prisma.js";
import { authenticate } from "../middleware/authenticate.js";
import { requireAdmin } from "../middleware/authorize.js";
import { createAuditLog } from "../services/audit.service.js";
import { normalizeText } from "../utils/helpers.js";
import { importantInfoFormSchema } from "../../../shared/validations/important-info.js";

const router = Router();

function splitEmergencyContacts(value?: string | null) {
  const text = normalizeText(value);
  if (!text) return null;
  return text.split("\n").map((line) => line.trim()).filter(Boolean);
}

router.get("/", authenticate, async (_req, res) => {
  try {
    const info = await prisma.importantInfo.findFirst({ orderBy: { updatedAt: "desc" }, include: { updatedBy: true } });
    res.json({ success: true, data: info });
  } catch (error) { console.error("Get info error:", error); res.status(500).json({ success: false, message: "Failed to load important info." }); }
});

router.put("/", authenticate, requireAdmin, async (req, res) => {
  try {
    const data = importantInfoFormSchema.parse(req.body);
    const existing = data.id
      ? await prisma.importantInfo.findUnique({ where: { id: data.id } })
      : await prisma.importantInfo.findFirst({ orderBy: { updatedAt: "desc" } });

    const payload = {
      electricityAccount: normalizeText(data.electricityAccount), gasCardNumber: normalizeText(data.gasCardNumber),
      wifiInfo: normalizeText(data.wifiInfo), houseOwnerPhone: normalizeText(data.houseOwnerPhone),
      emergencyContacts: splitEmergencyContacts(data.emergencyContacts) ?? Prisma.JsonNull,
      nearbyDoctorInfo: normalizeText(data.nearbyDoctorInfo), nearbyPharmacyInfo: normalizeText(data.nearbyPharmacyInfo),
      otherNotes: normalizeText(data.otherNotes), membersCanView: data.membersCanView, updatedById: req.user!.id,
    };

    const info = existing
      ? await prisma.importantInfo.update({ where: { id: existing.id }, data: payload })
      : await prisma.importantInfo.create({ data: payload });

    await createAuditLog({ action: "IMPORTANT_INFO_UPDATED", entityType: "ImportantInfo", entityId: info.id, performedById: req.user!.id, metadata: { membersCanView: data.membersCanView } });
    res.json({ success: true, message: "Important information saved successfully." });
  } catch (error) { console.error("Save info error:", error); res.status(500).json({ success: false, message: "Unable to save important information." }); }
});

export default router;
