import { Router } from "express";
import type { Prisma } from "@prisma/client";

import { prisma } from "../prisma.js";
import { authenticate } from "../middleware/authenticate.js";
import { getMonthKey } from "../utils/helpers.js";
import { computeMonthlyReport } from "../utils/calculations.js";

const router = Router();
const memberInclude = { user: true } satisfies Prisma.MemberProfileInclude;

async function getMonthlyReportData(monthKey = getMonthKey()) {
  const [members, mealRecords, bazarExpenses, otherExpenses, deposits, rentPayments, summary] = await Promise.all([
    prisma.memberProfile.findMany({ include: memberInclude }),
    prisma.mealRecord.findMany({ where: { monthKey } }),
    prisma.bazarExpense.findMany({ where: { monthKey } }),
    prisma.otherExpense.findMany({ where: { monthKey } }),
    prisma.deposit.findMany({ where: { monthKey } }),
    prisma.rentPayment.findMany({ where: { monthKey } }),
    prisma.monthlySummary.findUnique({ where: { monthKey } }),
  ]);
  return { monthKey, ...computeMonthlyReport({ members, mealRecords, bazarExpenses, otherExpenses, deposits, rentPayments, summary }) };
}

// GET /api/dashboard/admin
router.get("/admin", authenticate, async (req, res) => {
  try {
    if (req.user!.role !== "ADMIN") { res.status(403).json({ success: false, message: "Admin access required." }); return; }
    const monthKey = (req.query.month as string) ?? undefined;
    const [report, members, recentNotices, recentActivity] = await Promise.all([
      getMonthlyReportData(monthKey),
      prisma.memberProfile.findMany({ include: memberInclude }),
      prisma.notice.findMany({ where: { isPublished: true }, orderBy: [{ date: "desc" }, { createdAt: "desc" }], take: 5, include: { createdBy: true } }),
      prisma.auditLog.findMany({ orderBy: { timestamp: "desc" }, take: 8, include: { performedBy: true } }),
    ]);
    res.json({ success: true, data: { report, recentNotices, recentActivity, totalMembers: members.length, activeMembers: members.filter((m) => m.status === "ACTIVE").length } });
  } catch (error) { console.error("Admin dashboard error:", error); res.status(500).json({ success: false, message: "Failed to load admin dashboard." }); }
});

// GET /api/dashboard/member
router.get("/member", authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;
    const monthKey = (req.query.month as string) ?? undefined;
    const [report, profile, recentNotices, recentMeals, importantInfo, recentPayments, recentDeposits] = await Promise.all([
      getMonthlyReportData(monthKey),
      prisma.memberProfile.findUnique({ where: { userId }, include: memberInclude }),
      prisma.notice.findMany({ where: { isPublished: true }, orderBy: [{ date: "desc" }, { createdAt: "desc" }], take: 5, include: { createdBy: true } }),
      prisma.mealRecord.findMany({ where: { monthKey: monthKey ?? getMonthKey(), member: { userId } }, orderBy: { date: "desc" }, take: 8 }),
      prisma.importantInfo.findFirst({ orderBy: { updatedAt: "desc" } }),
      prisma.rentPayment.findMany({ where: { monthKey: monthKey ?? getMonthKey(), member: { userId } }, orderBy: { date: "desc" }, take: 5 }),
      prisma.deposit.findMany({ where: { monthKey: monthKey ?? getMonthKey(), member: { userId } }, orderBy: { date: "desc" }, take: 5 }),
    ]);
    const memberRow = report.memberRows.find((row) => row.userId === userId) ?? null;
    res.json({ success: true, data: { report, profile, memberRow, recentNotices, recentMeals, importantInfo: importantInfo?.membersCanView ? importantInfo : null, recentPayments, recentDeposits } });
  } catch (error) { console.error("Member dashboard error:", error); res.status(500).json({ success: false, message: "Failed to load member dashboard." }); }
});

// GET /api/dashboard/profile
router.get("/profile", authenticate, async (req, res) => {
  try {
    const monthKey = (req.query.month as string) ?? undefined;
    const userId = req.user!.id;
    const [report, profile, recentNotices, recentMeals, importantInfo, recentPayments, recentDeposits] = await Promise.all([
      getMonthlyReportData(monthKey),
      prisma.memberProfile.findUnique({ where: { userId }, include: memberInclude }),
      prisma.notice.findMany({ where: { isPublished: true }, orderBy: [{ date: "desc" }, { createdAt: "desc" }], take: 5, include: { createdBy: true } }),
      prisma.mealRecord.findMany({ where: { monthKey: monthKey ?? getMonthKey(), member: { userId } }, orderBy: { date: "desc" }, take: 8 }),
      prisma.importantInfo.findFirst({ orderBy: { updatedAt: "desc" } }),
      prisma.rentPayment.findMany({ where: { monthKey: monthKey ?? getMonthKey(), member: { userId } }, orderBy: { date: "desc" }, take: 5 }),
      prisma.deposit.findMany({ where: { monthKey: monthKey ?? getMonthKey(), member: { userId } }, orderBy: { date: "desc" }, take: 5 }),
    ]);
    const memberRow = report.memberRows.find((row) => row.userId === userId) ?? null;
    res.json({ success: true, data: { report, profile, memberRow, recentNotices, recentMeals, importantInfo: importantInfo?.membersCanView ? importantInfo : null, recentPayments, recentDeposits } });
  } catch (error) { console.error("Profile error:", error); res.status(500).json({ success: false, message: "Failed to load profile." }); }
});

// GET /api/dashboard/history
router.get("/history", authenticate, async (req, res) => {
  try {
    const role = req.user!.role;
    const userId = req.user!.id;
    const logs = await prisma.auditLog.findMany({
      where: role === "ADMIN" ? undefined : { performedById: userId },
      orderBy: { timestamp: "desc" }, take: 120, include: { performedBy: true },
    });
    res.json({ success: true, data: logs });
  } catch (error) { console.error("History error:", error); res.status(500).json({ success: false, message: "Failed to load history." }); }
});

// GET /api/dashboard/report
router.get("/report", authenticate, async (req, res) => {
  try {
    const monthKey = (req.query.month as string) ?? undefined;
    const report = await getMonthlyReportData(monthKey);
    res.json({ success: true, data: report });
  } catch (error) { console.error("Report error:", error); res.status(500).json({ success: false, message: "Failed to load report." }); }
});

export default router;
