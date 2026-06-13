import { Router } from "express";

import { prisma } from "../prisma.js";
import { authenticate } from "../middleware/authenticate.js";
import { requireAdmin } from "../middleware/authorize.js";
import { createAuditLog } from "../services/audit.service.js";
import { getMonthKey, getMonthKeyFromDateInput, normalizeText, parseDateInput } from "../utils/helpers.js";
import { bazarExpenseFormSchema } from "../../../shared/validations/finance.js";

const router = Router();
const memberInclude = { user: true } as const;

// GET /api/bazar?month=YYYY-MM
router.get("/", authenticate, async (req, res) => {
  try {
    const monthKey = (req.query.month as string) ?? getMonthKey();
    const records = await prisma.bazarExpense.findMany({
      where: { monthKey },
      include: { boughtBy: { include: memberInclude }, createdBy: true },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    });
    res.json({ success: true, data: records });
  } catch (error) {
    console.error("List bazar error:", error);
    res.status(500).json({ success: false, message: "Failed to load bazar expenses." });
  }
});

// POST /api/bazar
router.post("/", authenticate, requireAdmin, async (req, res) => {
  try {
    const data = bazarExpenseFormSchema.parse(req.body);
    const payload = {
      itemName: data.itemName, quantity: data.quantity, unit: normalizeText(data.unit),
      price: data.price, date: parseDateInput(data.date), monthKey: getMonthKeyFromDateInput(data.date),
      boughtById: normalizeText(data.boughtById), receiptUrl: normalizeText(data.receiptUrl),
      notes: normalizeText(data.notes), createdById: req.user!.id,
    };

    const expense = data.id
      ? await prisma.bazarExpense.update({ where: { id: data.id }, data: payload })
      : await prisma.bazarExpense.create({ data: payload });

    await createAuditLog({ action: data.id ? "BAZAR_UPDATED" : "BAZAR_CREATED", entityType: "BazarExpense", entityId: expense.id, performedById: req.user!.id, metadata: { itemName: data.itemName, price: data.price } });

    res.json({ success: true, message: "Bazar expense saved successfully." });
  } catch (error) {
    console.error("Save bazar error:", error);
    res.status(500).json({ success: false, message: "Unable to save bazar expense." });
  }
});

// DELETE /api/bazar/:id
router.delete("/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    await prisma.bazarExpense.delete({ where: { id: req.params.id } });
    await createAuditLog({ action: "BAZAR_DELETED", entityType: "BazarExpense", entityId: req.params.id, performedById: req.user!.id });
    res.json({ success: true, message: "Bazar expense deleted successfully." });
  } catch (error) {
    console.error("Delete bazar error:", error);
    res.status(500).json({ success: false, message: "Unable to delete bazar expense." });
  }
});

export default router;
