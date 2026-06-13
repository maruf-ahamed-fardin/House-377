import { Router } from "express";

import { prisma } from "../prisma.js";
import { authenticate } from "../middleware/authenticate.js";
import { requireAdmin } from "../middleware/authorize.js";
import { createAuditLog } from "../services/audit.service.js";
import { getMonthKey, getMonthKeyFromDateInput, normalizeText, parseDateInput } from "../utils/helpers.js";
import { mealFormSchema } from "../../../shared/validations/meal.js";

const router = Router();
const memberInclude = { user: true } as const;

// GET /api/meals?month=YYYY-MM
router.get("/", authenticate, async (req, res) => {
  try {
    const monthKey = (req.query.month as string) ?? getMonthKey();
    const records = await prisma.mealRecord.findMany({
      where: { monthKey },
      include: { member: { include: memberInclude }, updatedBy: true },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    });
    res.json({ success: true, data: records });
  } catch (error) {
    console.error("List meals error:", error);
    res.status(500).json({ success: false, message: "Failed to load meals." });
  }
});

// POST /api/meals
router.post("/", authenticate, requireAdmin, async (req, res) => {
  try {
    const data = mealFormSchema.parse(req.body);
    const date = parseDateInput(data.date);
    const monthKey = getMonthKeyFromDateInput(data.date);

    const record = await prisma.mealRecord.upsert({
      where: { memberId_date: { memberId: data.memberId, date } },
      create: { memberId: data.memberId, date, monthKey, breakfastCount: data.breakfastCount, lunchCount: data.lunchCount, dinnerCount: data.dinnerCount, notes: normalizeText(data.notes), updatedById: req.user!.id },
      update: { breakfastCount: data.breakfastCount, lunchCount: data.lunchCount, dinnerCount: data.dinnerCount, notes: normalizeText(data.notes), updatedById: req.user!.id, monthKey },
    });

    await createAuditLog({ action: data.id ? "MEAL_UPDATED" : "MEAL_CREATED", entityType: "MealRecord", entityId: record.id, performedById: req.user!.id, metadata: { memberId: data.memberId, date: data.date, breakfastCount: data.breakfastCount, lunchCount: data.lunchCount, dinnerCount: data.dinnerCount } });

    res.json({ success: true, message: "Meal record saved successfully." });
  } catch (error) {
    console.error("Save meal error:", error);
    res.status(500).json({ success: false, message: "Unable to save meal record." });
  }
});

// DELETE /api/meals/:id
router.delete("/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    await prisma.mealRecord.delete({ where: { id: req.params.id } });
    await createAuditLog({ action: "MEAL_DELETED", entityType: "MealRecord", entityId: req.params.id, performedById: req.user!.id });
    res.json({ success: true, message: "Meal record removed successfully." });
  } catch (error) {
    console.error("Delete meal error:", error);
    res.status(500).json({ success: false, message: "Unable to remove meal record." });
  }
});

export default router;
