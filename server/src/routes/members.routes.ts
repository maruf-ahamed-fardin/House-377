import { Router } from "express";

import { prisma } from "../prisma.js";
import { authenticate } from "../middleware/authenticate.js";
import { requireAdmin } from "../middleware/authorize.js";
import { createAuditLog } from "../services/audit.service.js";
import { normalizeText, parseDateInput } from "../utils/helpers.js";
import { hashPassword } from "../auth.js";
import { memberFormSchema } from "../../../shared/validations/member.js";

const router = Router();

const memberInclude = { user: true } as const;

// GET /api/members
router.get("/", authenticate, async (_req, res) => {
  try {
    const members = await prisma.memberProfile.findMany({ include: memberInclude });
    res.json({ success: true, data: members.sort((a, b) => a.user.name.localeCompare(b.user.name)) });
  } catch (error) {
    console.error("List members error:", error);
    res.status(500).json({ success: false, message: "Failed to load members." });
  }
});

// GET /api/members/options
router.get("/options", authenticate, async (req, res) => {
  try {
    const includeInactive = req.query.includeInactive === "true";
    const members = await prisma.memberProfile.findMany({
      where: includeInactive ? undefined : { status: "ACTIVE" },
      include: memberInclude,
    });
    const options = members
      .sort((a, b) => a.user.name.localeCompare(b.user.name))
      .map((m) => ({ value: m.id, label: `${m.user.name} (${m.roomNumber})`, status: m.status, userId: m.userId }));
    res.json({ success: true, data: options });
  } catch (error) {
    console.error("Member options error:", error);
    res.status(500).json({ success: false, message: "Failed to load member options." });
  }
});

// POST /api/members
router.post("/", authenticate, requireAdmin, async (req, res) => {
  try {
    const data = memberFormSchema.parse(req.body);
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
      include: { memberProfile: true },
    });

    if (existingUser && existingUser.memberProfile?.id !== data.id) {
      res.status(409).json({ success: false, message: "A user with this email already exists." });
      return;
    }

    const passwordHash = data.password ? await hashPassword(data.password) : undefined;

    if (data.id) {
      const member = await prisma.memberProfile.findUnique({ where: { id: data.id }, include: { user: true } });
      if (!member) { res.status(404).json({ success: false, message: "Member not found." }); return; }

      await prisma.user.update({
        where: { id: member.userId },
        data: {
          name: data.name, email: data.email.toLowerCase(), phone: data.phone,
          image: normalizeText(data.image), isActive: data.status === "ACTIVE",
          ...(passwordHash ? { passwordHash } : {}),
        },
      });

      await prisma.memberProfile.update({
        where: { id: data.id },
        data: {
          permanentAddress: data.permanentAddress, roomNumber: data.roomNumber,
          joiningDate: parseDateInput(data.joiningDate), status: data.status,
          guardianPhone: normalizeText(data.guardianPhone), monthlyRentShare: data.monthlyRentShare,
          notes: normalizeText(data.notes),
        },
      });

      await createAuditLog({ action: "MEMBER_UPDATED", entityType: "MemberProfile", entityId: data.id, performedById: req.user!.id, metadata: { name: data.name, roomNumber: data.roomNumber, status: data.status } });
    } else {
      const created = await prisma.user.create({
        data: {
          name: data.name, email: data.email.toLowerCase(), passwordHash: passwordHash!,
          role: "MEMBER", phone: data.phone, image: normalizeText(data.image), isActive: data.status === "ACTIVE",
          memberProfile: {
            create: {
              permanentAddress: data.permanentAddress, roomNumber: data.roomNumber,
              joiningDate: parseDateInput(data.joiningDate), status: data.status,
              guardianPhone: normalizeText(data.guardianPhone), monthlyRentShare: data.monthlyRentShare,
              notes: normalizeText(data.notes),
            },
          },
        },
        include: { memberProfile: true },
      });

      await createAuditLog({ action: "MEMBER_CREATED", entityType: "MemberProfile", entityId: created.memberProfile!.id, performedById: req.user!.id, metadata: { name: data.name, roomNumber: data.roomNumber } });
    }

    res.json({ success: true, message: data.id ? "Member updated successfully." : "Member added successfully." });
  } catch (error) {
    console.error("Save member error:", error);
    res.status(500).json({ success: false, message: "Unable to save member." });
  }
});

// DELETE /api/members/:id
router.delete("/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const member = await prisma.memberProfile.findUnique({ where: { id: req.params.id }, include: { user: true } });
    if (!member) { res.status(404).json({ success: false, message: "Member not found." }); return; }

    await prisma.user.update({ where: { id: member.userId }, data: { isActive: false } });
    await prisma.memberProfile.update({ where: { id: member.id }, data: { status: "INACTIVE" } });

    await createAuditLog({ action: "MEMBER_DEACTIVATED", entityType: "MemberProfile", entityId: member.id, performedById: req.user!.id, metadata: { name: member.user.name, email: member.user.email } });

    res.json({ success: true, message: "Member deactivated successfully." });
  } catch (error) {
    console.error("Delete member error:", error);
    res.status(500).json({ success: false, message: "Unable to deactivate member." });
  }
});

export default router;
