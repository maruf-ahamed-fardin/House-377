// Tools the AI assistant can call to read real data from the database.
//
// Design notes:
// - Numbers come from the SAME `computeMonthlyReport()` the dashboards use, so
//   the assistant never has to do math itself (LLMs are unreliable at math).
// - This is a shared mess/house: financial figures and dues are transparent to
//   every logged-in member by design. The ONLY gated data is "Important Info"
//   (wifi password, gas card, emergency contacts), which respects the existing
//   `membersCanView` flag for non-admins.
import type { Prisma } from "@prisma/client";
import { Type, type FunctionDeclaration } from "@google/genai";

import { prisma } from "../prisma.js";
import { computeMonthlyReport } from "../utils/calculations.js";
import { decimalToNumber, formatMonthLabel, getMonthKey } from "../utils/helpers.js";
import { format } from "date-fns";

export type AssistantContext = {
  userId: string;
  role: "ADMIN" | "MEMBER";
  name: string;
};

const memberInclude = { user: true } satisfies Prisma.MemberProfileInclude;

function round(value: number) {
  return Math.round(value * 100) / 100;
}

// Validate/normalize a "yyyy-MM" month key; fall back to the current month.
function normalizeMonth(month?: string) {
  if (month && /^\d{4}-\d{2}$/.test(month)) return month;
  return getMonthKey();
}

async function loadMonthlyReport(monthKey: string) {
  const [members, mealRecords, bazarExpenses, otherExpenses, deposits, rentPayments, summary] = await Promise.all([
    prisma.memberProfile.findMany({ include: memberInclude }),
    prisma.mealRecord.findMany({ where: { monthKey } }),
    prisma.bazarExpense.findMany({ where: { monthKey } }),
    prisma.otherExpense.findMany({ where: { monthKey } }),
    prisma.deposit.findMany({ where: { monthKey } }),
    prisma.rentPayment.findMany({ where: { monthKey } }),
    prisma.monthlySummary.findUnique({ where: { monthKey } }),
  ]);
  return computeMonthlyReport({ members, mealRecords, bazarExpenses, otherExpenses, deposits, rentPayments, summary });
}

// "owes 500" / "gets back 200" framing is clearer for a chatbot than a signed number.
function balanceLabel(finalBalance: number) {
  const amount = round(Math.abs(finalBalance));
  if (finalBalance < -0.5) return `owes ${amount}`;
  if (finalBalance > 0.5) return `should get back ${amount}`;
  return "settled (0)";
}

// ---------------------------------------------------------------------------
// Tool declarations advertised to Gemini
// ---------------------------------------------------------------------------

const monthParam = {
  type: Type.STRING,
  description: 'Month in "YYYY-MM" format (e.g. "2026-06"). Omit for the current month.',
};

export const toolDeclarations: FunctionDeclaration[] = [
  {
    name: "get_current_date",
    description: "Get today's date and the current month key. Call this first whenever the user mentions relative time like 'this month', 'today', 'now'.",
    parameters: { type: Type.OBJECT, properties: {} },
  },
  {
    name: "get_house_summary",
    description: "House-wide financial summary for a month: total meals, total bazar/grocery cost, the per-meal rate, total other expenses, house rent, total deposits & rent collected, overall mess balance, and total pending dues.",
    parameters: { type: Type.OBJECT, properties: { month: monthParam } },
  },
  {
    name: "get_all_member_dues",
    description: "Every member's financial position for a month: meals eaten, total payable, amount paid, bazar contribution, and final balance (who owes money and who should get money back). Use for questions like 'what is everyone's dues' or 'who owes the most'.",
    parameters: { type: Type.OBJECT, properties: { month: monthParam } },
  },
  {
    name: "get_my_finances",
    description: "The financial details of the CURRENT logged-in user for a month (their own meals, payable, paid, and balance).",
    parameters: { type: Type.OBJECT, properties: { month: monthParam } },
  },
  {
    name: "get_member_finances",
    description: "Financial details for one specific member, found by name, for a month.",
    parameters: {
      type: Type.OBJECT,
      properties: { memberName: { type: Type.STRING, description: "Full or partial name of the member." }, month: monthParam },
      required: ["memberName"],
    },
  },
  {
    name: "get_meal_summary",
    description: "Per-member meal totals (breakfast/lunch/dinner counts) for a month, plus the house total and meal rate.",
    parameters: { type: Type.OBJECT, properties: { month: monthParam } },
  },
  {
    name: "get_bazar_expenses",
    description: "List of bazar (grocery) purchases for a month: item, price, who bought it, and date. Returns the most recent items and the total.",
    parameters: { type: Type.OBJECT, properties: { month: monthParam } },
  },
  {
    name: "get_notices",
    description: "Recent published notices/announcements (title, description, priority, date).",
    parameters: { type: Type.OBJECT, properties: { limit: { type: Type.NUMBER, description: "How many recent notices (default 10)." } } },
  },
  {
    name: "get_important_info",
    description: "House important info: wifi details, gas card number, electricity account, house owner phone, emergency contacts, nearby doctor/pharmacy. May be restricted for members.",
    parameters: { type: Type.OBJECT, properties: {} },
  },
  {
    name: "get_bazar_schedule",
    description: "The bazar (grocery shopping) duty roster for a month: which member is assigned to shop on which date.",
    parameters: { type: Type.OBJECT, properties: { month: monthParam } },
  },
  {
    name: "list_members",
    description: "Directory of all house members: name, room number, status (active/inactive), and joining date.",
    parameters: { type: Type.OBJECT, properties: {} },
  },
];

// ---------------------------------------------------------------------------
// Tool execution
// ---------------------------------------------------------------------------

type ToolArgs = Record<string, unknown>;

export async function executeTool(name: string, args: ToolArgs, ctx: AssistantContext): Promise<unknown> {
  const monthKey = normalizeMonth(typeof args.month === "string" ? args.month : undefined);
  const monthLabel = formatMonthLabel(monthKey);

  switch (name) {
    case "get_current_date": {
      const now = new Date();
      return { today: format(now, "EEEE, d MMMM yyyy"), currentMonthKey: getMonthKey(now), currentMonthLabel: formatMonthLabel(getMonthKey(now)) };
    }

    case "get_house_summary": {
      const r = await loadMonthlyReport(monthKey);
      return {
        month: monthLabel,
        totalMeals: round(r.totalMeals),
        mealRatePerMeal: round(r.mealRate),
        totalBazarCost: round(r.totalBazarCost),
        totalOtherExpenses: round(r.totalOtherExpenses),
        totalHouseRent: round(r.totalHouseRent),
        totalDeposits: round(r.totalDeposits),
        totalRentCollected: round(r.totalRentPayments),
        messBalance: round(r.messBalance),
        totalPendingDues: round(r.pendingDues),
        currency: "BDT (Taka)",
      };
    }

    case "get_all_member_dues": {
      const r = await loadMonthlyReport(monthKey);
      return {
        month: monthLabel,
        currency: "BDT (Taka)",
        members: r.memberRows.map((row) => ({
          name: row.name,
          room: row.roomNumber,
          status: row.status,
          meals: round(row.mealTotal),
          payable: round(row.payable),
          amountPaid: round(row.amountPaid),
          bazarContribution: round(row.bazarContribution),
          finalBalance: round(row.finalBalance),
          standing: balanceLabel(row.finalBalance),
        })),
      };
    }

    case "get_my_finances": {
      const r = await loadMonthlyReport(monthKey);
      const row = r.memberRows.find((m) => m.userId === ctx.userId);
      if (!row) return { month: monthLabel, message: `No financial records found for ${ctx.name} in ${monthLabel}. They may not have a member profile or any activity this month.` };
      return { month: monthLabel, currency: "BDT (Taka)", you: row.name, room: row.roomNumber, meals: round(row.mealTotal), mealCost: round(row.mealCost), rentShare: round(row.rentAmount), otherExpenseShare: round(row.otherExpenseShare), payable: round(row.payable), amountPaid: round(row.amountPaid), bazarContribution: round(row.bazarContribution), finalBalance: round(row.finalBalance), standing: balanceLabel(row.finalBalance) };
    }

    case "get_member_finances": {
      const query = String(args.memberName ?? "").trim().toLowerCase();
      if (!query) return { error: "memberName is required." };
      const r = await loadMonthlyReport(monthKey);
      const matches = r.memberRows.filter((m) => m.name.toLowerCase().includes(query));
      if (matches.length === 0) return { month: monthLabel, message: `No member matching "${args.memberName}" found with activity in ${monthLabel}.`, availableMembers: r.memberRows.map((m) => m.name) };
      if (matches.length > 1) return { month: monthLabel, message: `Multiple members match "${args.memberName}". Ask the user which one.`, candidates: matches.map((m) => m.name) };
      const row = matches[0];
      return { month: monthLabel, currency: "BDT (Taka)", name: row.name, room: row.roomNumber, status: row.status, meals: round(row.mealTotal), mealCost: round(row.mealCost), rentShare: round(row.rentAmount), payable: round(row.payable), amountPaid: round(row.amountPaid), bazarContribution: round(row.bazarContribution), finalBalance: round(row.finalBalance), standing: balanceLabel(row.finalBalance) };
    }

    case "get_meal_summary": {
      const r = await loadMonthlyReport(monthKey);
      return {
        month: monthLabel,
        houseTotalMeals: round(r.totalMeals),
        mealRatePerMeal: round(r.mealRate),
        perMember: r.memberRows.filter((m) => m.mealTotal > 0).map((m) => ({ name: m.name, room: m.roomNumber, meals: round(m.mealTotal), mealCost: round(m.mealCost) })),
      };
    }

    case "get_bazar_expenses": {
      const expenses = await prisma.bazarExpense.findMany({
        where: { monthKey },
        orderBy: { date: "desc" },
        include: { boughtBy: { include: { user: true } } },
      });
      const total = expenses.reduce((sum, e) => sum + decimalToNumber(e.price), 0);
      return {
        month: monthLabel,
        currency: "BDT (Taka)",
        totalBazarCost: round(total),
        itemCount: expenses.length,
        items: expenses.slice(0, 40).map((e) => ({ item: e.itemName, quantity: decimalToNumber(e.quantity), unit: e.unit ?? null, price: round(decimalToNumber(e.price)), boughtBy: e.boughtBy?.user.name ?? "unknown", date: format(e.date, "d MMM yyyy") })),
        note: expenses.length > 40 ? `Showing the 40 most recent of ${expenses.length} items.` : undefined,
      };
    }

    case "get_notices": {
      const limit = Math.min(Math.max(Number(args.limit) || 10, 1), 30);
      const notices = await prisma.notice.findMany({ where: { isPublished: true }, orderBy: [{ date: "desc" }, { createdAt: "desc" }], take: limit, include: { createdBy: true } });
      return { count: notices.length, notices: notices.map((n) => ({ title: n.title, description: n.description, priority: n.priority, date: format(n.date, "d MMM yyyy"), postedBy: n.createdBy.name })) };
    }

    case "get_important_info": {
      const info = await prisma.importantInfo.findFirst({ orderBy: { updatedAt: "desc" } });
      if (!info) return { message: "No important info has been recorded yet." };
      if (ctx.role !== "ADMIN" && !info.membersCanView) {
        return { restricted: true, message: "Important info (wifi, gas card, emergency contacts) is currently visible to admins only. Ask an admin to share it or to enable member access." };
      }
      return { electricityAccount: info.electricityAccount, gasCardNumber: info.gasCardNumber, wifiInfo: info.wifiInfo, houseOwnerPhone: info.houseOwnerPhone, emergencyContacts: info.emergencyContacts, nearbyDoctorInfo: info.nearbyDoctorInfo, nearbyPharmacyInfo: info.nearbyPharmacyInfo, otherNotes: info.otherNotes };
    }

    case "get_bazar_schedule": {
      const schedules = await prisma.bazarSchedule.findMany({ where: { monthKey }, orderBy: { date: "asc" }, include: { member: { include: { user: true } } } });
      return { month: monthLabel, count: schedules.length, schedule: schedules.map((s) => ({ date: format(s.date, "EEEE, d MMM yyyy"), member: s.member.user.name, room: s.member.roomNumber, notes: s.notes ?? null })) };
    }

    case "list_members": {
      const members = await prisma.memberProfile.findMany({ include: memberInclude, orderBy: { user: { name: "asc" } } });
      return { count: members.length, members: members.map((m) => ({ name: m.user.name, room: m.roomNumber, status: m.status, joiningDate: format(m.joiningDate, "d MMM yyyy") })) };
    }

    default:
      return { error: `Unknown tool: ${name}` };
  }
}
