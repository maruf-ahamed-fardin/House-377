import { Router } from "express";

import { prisma } from "../prisma.js";
import { authenticate } from "../middleware/authenticate.js";
import { requireAdmin } from "../middleware/authorize.js";
import { createAuditLog } from "../services/audit.service.js";
import { getMonthKey, getMonthKeyFromDateInput, normalizeText, parseDateInput } from "../utils/helpers.js";
import { rentPaymentFormSchema, rentSummaryFormSchema } from "../../../shared/validations/finance.js";

const router = Router();
const memberInclude = { user: true } as const;

// GET /api/rent?month=YYYY-MM
router.get("/", authenticate, async (req, res) => {
  try {
    const monthKey = (req.query.month as string) ?? getMonthKey();
    const payments = await prisma.rentPayment.findMany({
      where: { monthKey },
      include: { member: { include: memberInclude }, createdBy: true },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    });
    res.json({ success: true, data: payments });
  } catch (error) {
    console.error("List rent error:", error);
    res.status(500).json({ success: false, message: "Failed to load rent payments." });
  }
});

// PUT /api/rent/summary
router.put("/summary", authenticate, requireAdmin, async (req, res) => {
  try {
    const data = rentSummaryFormSchema.parse(req.body);
    const summary = await prisma.monthlySummary.upsert({
      where: { monthKey: data.monthKey },
      create: { monthKey: data.monthKey, totalHouseRent: data.totalHouseRent, rentDistributionMode: data.rentDistributionMode, notes: normalizeText(data.notes), updatedById: req.user!.id },
      update: { totalHouseRent: data.totalHouseRent, rentDistributionMode: data.rentDistributionMode, notes: normalizeText(data.notes), updatedById: req.user!.id },
    });

    await createAuditLog({ action: "MONTHLY_SUMMARY_UPDATED", entityType: "MonthlySummary", entityId: summary.id, performedById: req.user!.id, metadata: { monthKey: data.monthKey, totalHouseRent: data.totalHouseRent, rentDistributionMode: data.rentDistributionMode } });

    res.json({ success: true, message: "Monthly rent settings saved successfully." });
  } catch (error) {
    console.error("Save rent summary error:", error);
    res.status(500).json({ success: false, message: "Unable to save monthly rent settings." });
  }
});

// POST /api/rent
router.post("/", authenticate, requireAdmin, async (req, res) => {
  try {
    const data = rentPaymentFormSchema.parse(req.body);
    const payload = { memberId: data.memberId, amount: data.amount, date: parseDateInput(data.date), monthKey: getMonthKeyFromDateInput(data.date), notes: normalizeText(data.notes), createdById: req.user!.id };

    const payment = data.id
      ? await prisma.rentPayment.update({ where: { id: data.id }, data: payload })
      : await prisma.rentPayment.create({ data: payload });

    await createAuditLog({ action: data.id ? "RENT_PAYMENT_UPDATED" : "RENT_PAYMENT_CREATED", entityType: "RentPayment", entityId: payment.id, performedById: req.user!.id, metadata: { memberId: data.memberId, amount: data.amount } });

    res.json({ success: true, message: "Rent payment saved successfully." });
  } catch (error) {
    console.error("Save rent error:", error);
    res.status(500).json({ success: false, message: "Unable to save rent payment." });
  }
});

// DELETE /api/rent/:id
router.delete("/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    await prisma.rentPayment.delete({ where: { id: req.params.id } });
    await createAuditLog({ action: "RENT_PAYMENT_DELETED", entityType: "RentPayment", entityId: req.params.id, performedById: req.user!.id });
    res.json({ success: true, message: "Rent payment removed successfully." });
  } catch (error) {
    console.error("Delete rent error:", error);
    res.status(500).json({ success: false, message: "Unable to remove rent payment." });
  }
});

export default router;
