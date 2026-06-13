import { Router } from "express";

import { prisma } from "../prisma.js";
import { authenticate } from "../middleware/authenticate.js";
import { requireAdmin } from "../middleware/authorize.js";
import { createAuditLog } from "../services/audit.service.js";
import { getMonthKey, getMonthKeyFromDateInput, normalizeText, parseDateInput } from "../utils/helpers.js";
import { otherExpenseFormSchema } from "../../../shared/validations/finance.js";

const router = Router();
const memberInclude = { user: true } as const;

// GET /api/expenses?month=YYYY-MM
router.get("/", authenticate, async (req, res) => {
  try {
    const monthKey = (req.query.month as string) ?? getMonthKey();
    const records = await prisma.otherExpense.findMany({
      where: { monthKey },
      include: { paidBy: { include: memberInclude }, createdBy: true },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    });
    res.json({ success: true, data: records });
  } catch (error) {
    console.error("List expenses error:", error);
    res.status(500).json({ success: false, message: "Failed to load expenses." });
  }
});

// POST /api/expenses
router.post("/", authenticate, requireAdmin, async (req, res) => {
  try {
    const data = otherExpenseFormSchema.parse(req.body);
    const payload = { title: data.title, category: data.category, amount: data.amount, date: parseDateInput(data.date), monthKey: getMonthKeyFromDateInput(data.date), paidById: normalizeText(data.paidById), notes: normalizeText(data.notes), createdById: req.user!.id };

    const expense = data.id
      ? await prisma.otherExpense.update({ where: { id: data.id }, data: payload })
      : await prisma.otherExpense.create({ data: payload });

    await createAuditLog({ action: data.id ? "OTHER_EXPENSE_UPDATED" : "OTHER_EXPENSE_CREATED", entityType: "OtherExpense", entityId: expense.id, performedById: req.user!.id, metadata: { title: data.title, amount: data.amount } });
    res.json({ success: true, message: "Expense saved successfully." });
  } catch (error) {
    console.error("Save expense error:", error);
    res.status(500).json({ success: false, message: "Unable to save expense." });
  }
});

// DELETE /api/expenses/:id
router.delete("/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    await prisma.otherExpense.delete({ where: { id: req.params.id } });
    await createAuditLog({ action: "OTHER_EXPENSE_DELETED", entityType: "OtherExpense", entityId: req.params.id, performedById: req.user!.id });
    res.json({ success: true, message: "Expense removed successfully." });
  } catch (error) {
    console.error("Delete expense error:", error);
    res.status(500).json({ success: false, message: "Unable to remove expense." });
  }
});

export default router;
