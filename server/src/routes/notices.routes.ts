import { Router } from "express";

import { prisma } from "../prisma.js";
import { authenticate } from "../middleware/authenticate.js";
import { requireAdmin } from "../middleware/authorize.js";
import { createAuditLog } from "../services/audit.service.js";
import { normalizeText, parseDateInput } from "../utils/helpers.js";
import { noticeFormSchema } from "../../../shared/validations/finance.js";

const router = Router();

router.get("/", authenticate, async (_req, res) => {
  try {
    const notices = await prisma.notice.findMany({ include: { createdBy: true }, orderBy: [{ date: "desc" }, { createdAt: "desc" }] });
    res.json({ success: true, data: notices });
  } catch (error) { console.error("List notices error:", error); res.status(500).json({ success: false, message: "Failed to load notices." }); }
});

router.post("/", authenticate, requireAdmin, async (req, res) => {
  try {
    const data = noticeFormSchema.parse(req.body);
    const payload = { title: data.title, description: data.description, priority: data.priority, date: parseDateInput(data.date), isPublished: data.isPublished, createdById: req.user!.id };
    const notice = data.id ? await prisma.notice.update({ where: { id: data.id }, data: payload }) : await prisma.notice.create({ data: payload });
    await createAuditLog({ action: data.id ? "NOTICE_UPDATED" : "NOTICE_CREATED", entityType: "Notice", entityId: notice.id, performedById: req.user!.id, metadata: { title: data.title, priority: data.priority } });
    res.json({ success: true, message: "Notice saved successfully." });
  } catch (error) { console.error("Save notice error:", error); res.status(500).json({ success: false, message: "Unable to save notice." }); }
});

router.delete("/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    await prisma.notice.delete({ where: { id: req.params.id } });
    await createAuditLog({ action: "NOTICE_DELETED", entityType: "Notice", entityId: req.params.id, performedById: req.user!.id });
    res.json({ success: true, message: "Notice removed successfully." });
  } catch (error) { console.error("Delete notice error:", error); res.status(500).json({ success: false, message: "Unable to remove notice." }); }
});

export default router;
