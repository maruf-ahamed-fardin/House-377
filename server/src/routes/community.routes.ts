import { Router } from "express";

import { prisma } from "../prisma.js";
import { authenticate } from "../middleware/authenticate.js";
import { requireAdmin } from "../middleware/authorize.js";
import { createAuditLog } from "../services/audit.service.js";
import { getMonthKey, getMonthKeyFromDateInput, normalizeText, parseDateInput } from "../utils/helpers.js";
import { bazarScheduleFormSchema, bazarScheduleRequestFormSchema, bazarScheduleRequestDecisionSchema, timelinePostFormSchema } from "../../../shared/validations/community.js";

const router = Router();
const memberInclude = { user: true } as const;

// --- Bazar Schedule ---
router.get("/bazar-schedule", authenticate, async (req, res) => {
  try {
    const monthKey = (req.query.month as string) ?? getMonthKey();
    const role = req.user!.role;
    const userId = req.user!.id;

    const [schedules, requests, members] = await Promise.all([
      prisma.bazarSchedule.findMany({ where: { monthKey }, include: { member: { include: memberInclude }, createdBy: true }, orderBy: [{ date: "asc" }] }),
      prisma.bazarScheduleChangeRequest.findMany({
        where: role === "ADMIN" ? { OR: [{ schedule: { monthKey } }, { requestedMonthKey: monthKey }] } : { requesterId: userId },
        include: { requester: true, handledBy: true, schedule: { include: { member: { include: memberInclude } } } },
        orderBy: [{ createdAt: "desc" }],
      }),
      prisma.memberProfile.findMany({ where: { status: "ACTIVE" }, include: memberInclude }),
    ]);

    const options = members.sort((a, b) => a.user.name.localeCompare(b.user.name)).map((m) => ({ value: m.id, label: `${m.user.name} (${m.roomNumber})`, status: m.status, userId: m.userId }));
    res.json({ success: true, data: { schedules, requests, options, monthKey } });
  } catch (error) { console.error("Bazar schedule error:", error); res.status(500).json({ success: false, message: "Failed to load bazar schedule." }); }
});

router.post("/bazar-schedule", authenticate, requireAdmin, async (req, res) => {
  try {
    const data = bazarScheduleFormSchema.parse(req.body);
    const date = parseDateInput(data.date);
    const existing = await prisma.bazarSchedule.findFirst({ where: { date, ...(data.id ? { id: { not: data.id } } : undefined) } });
    if (existing) { res.status(409).json({ success: false, message: "Another member is already assigned to this bazar date." }); return; }

    const payload = { memberId: data.memberId, date, monthKey: getMonthKeyFromDateInput(data.date), notes: normalizeText(data.notes), createdById: req.user!.id };
    const schedule = data.id ? await prisma.bazarSchedule.update({ where: { id: data.id }, data: payload }) : await prisma.bazarSchedule.create({ data: payload });
    await createAuditLog({ action: data.id ? "BAZAR_SCHEDULE_UPDATED" : "BAZAR_SCHEDULE_CREATED", entityType: "BazarSchedule", entityId: schedule.id, performedById: req.user!.id, metadata: { memberId: data.memberId, date: data.date } });
    res.json({ success: true, message: data.id ? "Bazar schedule updated." : "Bazar schedule added." });
  } catch (error) { console.error("Save bazar schedule error:", error); res.status(500).json({ success: false, message: "Unable to save bazar schedule." }); }
});

router.delete("/bazar-schedule/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    await prisma.bazarSchedule.delete({ where: { id: req.params.id } });
    await createAuditLog({ action: "BAZAR_SCHEDULE_DELETED", entityType: "BazarSchedule", entityId: req.params.id, performedById: req.user!.id });
    res.json({ success: true, message: "Bazar schedule deleted." });
  } catch (error) { console.error("Delete bazar schedule error:", error); res.status(500).json({ success: false, message: "Unable to delete bazar schedule." }); }
});

// --- Change Requests ---
router.post("/bazar-schedule/change-request", authenticate, async (req, res) => {
  try {
    const data = bazarScheduleRequestFormSchema.parse(req.body);
    const schedule = await prisma.bazarSchedule.findUnique({ where: { id: data.scheduleId }, include: { member: { include: { user: true } } } });
    if (!schedule) { res.status(404).json({ success: false, message: "Schedule not found." }); return; }
    if (req.user!.role !== "ADMIN" && schedule.member.userId !== req.user!.id) { res.status(403).json({ success: false, message: "You can request date changes only for your own bazar duty." }); return; }

    const pending = await prisma.bazarScheduleChangeRequest.findFirst({ where: { scheduleId: data.scheduleId, requesterId: req.user!.id, status: "PENDING" } });
    if (pending) { res.status(409).json({ success: false, message: "You already have a pending date-change request." }); return; }

    const request = await prisma.bazarScheduleChangeRequest.create({ data: { scheduleId: data.scheduleId, requesterId: req.user!.id, requestedDate: parseDateInput(data.requestedDate), requestedMonthKey: getMonthKeyFromDateInput(data.requestedDate), reason: data.reason } });
    await createAuditLog({ action: "BAZAR_SCHEDULE_REQUEST_CREATED", entityType: "BazarScheduleChangeRequest", entityId: request.id, performedById: req.user!.id, metadata: { scheduleId: data.scheduleId, requestedDate: data.requestedDate } });
    res.json({ success: true, message: "Date-change request sent to admin." });
  } catch (error) { console.error("Change request error:", error); res.status(500).json({ success: false, message: "Unable to submit the schedule change request." }); }
});

router.put("/bazar-schedule/change-request/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const data = bazarScheduleRequestDecisionSchema.parse({ ...req.body, requestId: req.params.id });
    const request = await prisma.bazarScheduleChangeRequest.findUnique({ where: { id: data.requestId }, include: { schedule: true, requester: true } });
    if (!request) { res.status(404).json({ success: false, message: "Change request not found." }); return; }
    if (request.status !== "PENDING") { res.status(409).json({ success: false, message: "This request has already been processed." }); return; }

    if (data.status === "APPROVED") {
      const conflict = await prisma.bazarSchedule.findFirst({ where: { date: request.requestedDate, id: { not: request.scheduleId } } });
      if (conflict) { res.status(409).json({ success: false, message: "Another bazar duty is already assigned for the requested date." }); return; }
      await prisma.bazarSchedule.update({ where: { id: request.scheduleId }, data: { date: request.requestedDate, monthKey: request.requestedMonthKey } });
    }

    await prisma.bazarScheduleChangeRequest.update({ where: { id: request.id }, data: { status: data.status, adminNote: normalizeText(data.adminNote), handledById: req.user!.id } });
    await createAuditLog({ action: data.status === "APPROVED" ? "BAZAR_SCHEDULE_REQUEST_APPROVED" : "BAZAR_SCHEDULE_REQUEST_REJECTED", entityType: "BazarScheduleChangeRequest", entityId: request.id, performedById: req.user!.id, metadata: { scheduleId: request.scheduleId, requesterId: request.requesterId } });
    res.json({ success: true, message: data.status === "APPROVED" ? "Schedule request approved." : "Schedule request rejected." });
  } catch (error) { console.error("Handle change request error:", error); res.status(500).json({ success: false, message: "Unable to process the schedule request." }); }
});

// --- Timeline ---
router.get("/timeline", authenticate, async (_req, res) => {
  try {
    const posts = await prisma.timelinePost.findMany({ include: { author: true }, orderBy: [{ isResolved: "asc" }, { createdAt: "desc" }] });
    res.json({ success: true, data: posts });
  } catch (error) { console.error("Timeline error:", error); res.status(500).json({ success: false, message: "Failed to load timeline." }); }
});

router.post("/timeline", authenticate, async (req, res) => {
  try {
    const data = timelinePostFormSchema.parse(req.body);
    if (data.id) {
      const existing = await prisma.timelinePost.findUnique({ where: { id: data.id } });
      if (!existing) { res.status(404).json({ success: false, message: "Timeline post not found." }); return; }
      if (req.user!.role !== "ADMIN" && existing.authorId !== req.user!.id) { res.status(403).json({ success: false, message: "You can edit only your own timeline posts." }); return; }
      await prisma.timelinePost.update({ where: { id: data.id }, data: { title: normalizeText(data.title), content: data.content } });
    } else {
      const post = await prisma.timelinePost.create({ data: { authorId: req.user!.id, title: normalizeText(data.title), content: data.content } });
      await createAuditLog({ action: "TIMELINE_POST_CREATED", entityType: "TimelinePost", entityId: post.id, performedById: req.user!.id, metadata: { title: normalizeText(data.title) } });
    }
    res.json({ success: true, message: data.id ? "Timeline post updated." : "Timeline post published." });
  } catch (error) { console.error("Save timeline error:", error); res.status(500).json({ success: false, message: "Unable to save the timeline post." }); }
});

router.delete("/timeline/:id", authenticate, async (req, res) => {
  try {
    const post = await prisma.timelinePost.findUnique({ where: { id: req.params.id } });
    if (!post) { res.status(404).json({ success: false, message: "Timeline post not found." }); return; }
    if (req.user!.role !== "ADMIN" && post.authorId !== req.user!.id) { res.status(403).json({ success: false, message: "You can delete only your own timeline posts." }); return; }
    await prisma.timelinePost.delete({ where: { id: req.params.id } });
    await createAuditLog({ action: "TIMELINE_POST_DELETED", entityType: "TimelinePost", entityId: req.params.id, performedById: req.user!.id });
    res.json({ success: true, message: "Timeline post deleted." });
  } catch (error) { console.error("Delete timeline error:", error); res.status(500).json({ success: false, message: "Unable to delete the timeline post." }); }
});

router.put("/timeline/:id/toggle-resolved", authenticate, requireAdmin, async (req, res) => {
  try {
    const post = await prisma.timelinePost.findUnique({ where: { id: req.params.id } });
    if (!post) { res.status(404).json({ success: false, message: "Timeline post not found." }); return; }
    await prisma.timelinePost.update({ where: { id: req.params.id }, data: { isResolved: !post.isResolved } });
    await createAuditLog({ action: !post.isResolved ? "TIMELINE_POST_RESOLVED" : "TIMELINE_POST_REOPENED", entityType: "TimelinePost", entityId: req.params.id, performedById: req.user!.id });
    res.json({ success: true, message: !post.isResolved ? "Post marked as resolved." : "Post reopened." });
  } catch (error) { console.error("Toggle resolved error:", error); res.status(500).json({ success: false, message: "Unable to update the timeline post status." }); }
});

export default router;
