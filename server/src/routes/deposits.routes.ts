import { Router } from "express";

import { prisma } from "../prisma.js";
import { authenticate } from "../middleware/authenticate.js";
import { requireAdmin } from "../middleware/authorize.js";
import { createAuditLog } from "../services/audit.service.js";
import { getMonthKey, getMonthKeyFromDateInput, normalizeText, parseDateInput } from "../utils/helpers.js";
import { depositFormSchema } from "../../../shared/validations/finance.js";

const router = Router();
const memberInclude = { user: true } as const;

router.get("/", authenticate, async (req, res) => {
  try {
    const monthKey = (req.query.month as string) ?? getMonthKey();
    const records = await prisma.deposit.findMany({
      where: { monthKey }, include: { member: { include: memberInclude }, createdBy: true },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    });
    res.json({ success: true, data: records });
  } catch (error) { console.error("List deposits error:", error); res.status(500).json({ success: false, message: "Failed to load deposits." }); }
});

router.post("/", authenticate, requireAdmin, async (req, res) => {
  try {
    const data = depositFormSchema.parse(req.body);
    const payload = { memberId: data.memberId, amount: data.amount, date: parseDateInput(data.date), monthKey: getMonthKeyFromDateInput(data.date), purpose: normalizeText(data.purpose), notes: normalizeText(data.notes), createdById: req.user!.id };
    const deposit = data.id ? await prisma.deposit.update({ where: { id: data.id }, data: payload }) : await prisma.deposit.create({ data: payload });
    await createAuditLog({ action: data.id ? "DEPOSIT_UPDATED" : "DEPOSIT_CREATED", entityType: "Deposit", entityId: deposit.id, performedById: req.user!.id, metadata: { memberId: data.memberId, amount: data.amount } });
    res.json({ success: true, message: "Deposit saved successfully." });
  } catch (error) { console.error("Save deposit error:", error); res.status(500).json({ success: false, message: "Unable to save deposit." }); }
});

router.delete("/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    await prisma.deposit.delete({ where: { id: req.params.id } });
    await createAuditLog({ action: "DEPOSIT_DELETED", entityType: "Deposit", entityId: req.params.id, performedById: req.user!.id });
    res.json({ success: true, message: "Deposit removed successfully." });
  } catch (error) { console.error("Delete deposit error:", error); res.status(500).json({ success: false, message: "Unable to remove deposit." }); }
});

export default router;
