import type { Prisma } from "@prisma/client";

import { computeMonthlyReport } from "@/lib/calculations";
import { getMonthKey } from "@/lib/month";
import { prisma } from "@/lib/prisma";

const memberInclude = {
  user: true,
} satisfies Prisma.MemberProfileInclude;

export async function getMemberOptions(includeInactive = false) {
  const members = await prisma.memberProfile.findMany({
    where: includeInactive ? undefined : { status: "ACTIVE" },
    include: memberInclude,
  });

  return members
    .sort((a, b) => a.user.name.localeCompare(b.user.name))
    .map((member) => ({
      value: member.id,
      label: `${member.user.name} (${member.roomNumber})`,
      status: member.status,
      userId: member.userId,
    }));
}

export async function getMonthlyReportData(monthKey = getMonthKey()) {
  const [members, mealRecords, bazarExpenses, otherExpenses, deposits, rentPayments, summary] = await Promise.all([
    prisma.memberProfile.findMany({ include: memberInclude }),
    prisma.mealRecord.findMany({ where: { monthKey } }),
    prisma.bazarExpense.findMany({ where: { monthKey } }),
    prisma.otherExpense.findMany({ where: { monthKey } }),
    prisma.deposit.findMany({ where: { monthKey } }),
    prisma.rentPayment.findMany({ where: { monthKey } }),
    prisma.monthlySummary.findUnique({ where: { monthKey } }),
  ]);

  const report = computeMonthlyReport({
    members,
    mealRecords,
    bazarExpenses,
    otherExpenses,
    deposits,
    rentPayments,
    summary,
  });

  return {
    monthKey,
    ...report,
  };
}

export async function getAdminDashboardData(monthKey = getMonthKey()) {
  const [report, members, recentNotices, recentActivity] = await Promise.all([
    getMonthlyReportData(monthKey),
    prisma.memberProfile.findMany({ include: memberInclude }),
    prisma.notice.findMany({
      where: { isPublished: true },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      take: 5,
      include: { createdBy: true },
    }),
    prisma.auditLog.findMany({
      orderBy: { timestamp: "desc" },
      take: 8,
      include: { performedBy: true },
    }),
  ]);

  return {
    report,
    recentNotices,
    recentActivity,
    totalMembers: members.length,
    activeMembers: members.filter((member) => member.status === "ACTIVE").length,
  };
}

export async function getMemberDashboardData(userId: string, monthKey = getMonthKey()) {
  const [report, profile, recentNotices, recentMeals, importantInfo, recentPayments, recentDeposits] = await Promise.all([
    getMonthlyReportData(monthKey),
    prisma.memberProfile.findUnique({
      where: { userId },
      include: memberInclude,
    }),
    prisma.notice.findMany({
      where: { isPublished: true },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      take: 5,
      include: { createdBy: true },
    }),
    prisma.mealRecord.findMany({
      where: { monthKey, member: { userId } },
      orderBy: { date: "desc" },
      take: 8,
    }),
    prisma.importantInfo.findFirst({
      orderBy: { updatedAt: "desc" },
    }),
    prisma.rentPayment.findMany({
      where: { monthKey, member: { userId } },
      orderBy: { date: "desc" },
      take: 5,
    }),
    prisma.deposit.findMany({
      where: { monthKey, member: { userId } },
      orderBy: { date: "desc" },
      take: 5,
    }),
  ]);

  const memberRow = report.memberRows.find((row) => row.userId === userId) ?? null;

  return {
    report,
    profile,
    memberRow,
    recentNotices,
    recentMeals,
    importantInfo: importantInfo?.membersCanView ? importantInfo : null,
    recentPayments,
    recentDeposits,
  };
}

export async function getMembersPageData() {
  const members = await prisma.memberProfile.findMany({
    include: memberInclude,
  });

  return members.sort((a, b) => a.user.name.localeCompare(b.user.name));
}

export async function getMealsPageData(monthKey = getMonthKey()) {
  const [records, options, report] = await Promise.all([
    prisma.mealRecord.findMany({
      where: { monthKey },
      include: {
        member: {
          include: memberInclude,
        },
        updatedBy: true,
      },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    }),
    getMemberOptions(true),
    getMonthlyReportData(monthKey),
  ]);

  return { records, options, report };
}

export async function getBazarPageData(monthKey = getMonthKey()) {
  const [records, options, report] = await Promise.all([
    prisma.bazarExpense.findMany({
      where: { monthKey },
      include: {
        boughtBy: {
          include: memberInclude,
        },
        createdBy: true,
      },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    }),
    getMemberOptions(true),
    getMonthlyReportData(monthKey),
  ]);

  return { records, options, report };
}

export async function getRentPageData(monthKey = getMonthKey()) {
  const [payments, options, report] = await Promise.all([
    prisma.rentPayment.findMany({
      where: { monthKey },
      include: {
        member: {
          include: memberInclude,
        },
        createdBy: true,
      },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    }),
    getMemberOptions(true),
    getMonthlyReportData(monthKey),
  ]);

  return { payments, options, report };
}

export async function getOtherExpensesPageData(monthKey = getMonthKey()) {
  const [records, options, report] = await Promise.all([
    prisma.otherExpense.findMany({
      where: { monthKey },
      include: {
        paidBy: {
          include: memberInclude,
        },
        createdBy: true,
      },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    }),
    getMemberOptions(true),
    getMonthlyReportData(monthKey),
  ]);

  return { records, options, report };
}

export async function getDepositsPageData(monthKey = getMonthKey()) {
  const [records, options, report] = await Promise.all([
    prisma.deposit.findMany({
      where: { monthKey },
      include: {
        member: {
          include: memberInclude,
        },
        createdBy: true,
      },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    }),
    getMemberOptions(true),
    getMonthlyReportData(monthKey),
  ]);

  return { records, options, report };
}

export async function getNoticesPageData() {
  return prisma.notice.findMany({
    include: { createdBy: true },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });
}

export async function getImportantInfoRecord() {
  return prisma.importantInfo.findFirst({
    orderBy: { updatedAt: "desc" },
    include: { updatedBy: true },
  });
}

export async function getChatMessages(limit = 60) {
  const messages = await prisma.chatMessage.findMany({
    orderBy: { createdAt: "asc" },
    take: limit,
    include: {
      sender: true,
    },
  });

  return messages;
}

export async function getHistoryPageData(userId: string, role: "ADMIN" | "MEMBER") {
  return prisma.auditLog.findMany({
    where: role === "ADMIN" ? undefined : { performedById: userId },
    orderBy: { timestamp: "desc" },
    take: 120,
    include: {
      performedBy: true,
    },
  });
}

export async function getProfilePageData(userId: string, monthKey = getMonthKey()) {
  const [profile, dashboardData] = await Promise.all([
    prisma.memberProfile.findUnique({
      where: { userId },
      include: memberInclude,
    }),
    getMemberDashboardData(userId, monthKey),
  ]);

  return {
    profile,
    ...dashboardData,
  };
}
