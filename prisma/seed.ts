import { hash } from "bcryptjs";
import { addDays, startOfMonth, subMonths } from "date-fns";
import type { Prisma } from "@prisma/client";

import { getMonthKey } from "@/lib/month";
import { prisma } from "@/lib/prisma";

function withNoon(date: Date) {
  const copy = new Date(date);
  copy.setHours(12, 0, 0, 0);
  return copy;
}

function monthDate(base: Date, day: number) {
  return withNoon(addDays(startOfMonth(base), day - 1));
}

async function resetDatabase() {
  await prisma.chatMessage.deleteMany();
  await prisma.timelinePost.deleteMany();
  await prisma.bazarScheduleChangeRequest.deleteMany();
  await prisma.bazarSchedule.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.importantInfo.deleteMany();
  await prisma.notice.deleteMany();
  await prisma.deposit.deleteMany();
  await prisma.otherExpense.deleteMany();
  await prisma.rentPayment.deleteMany();
  await prisma.bazarExpense.deleteMany();
  await prisma.mealRecord.deleteMany();
  await prisma.monthlySummary.deleteMany();
  await prisma.memberProfile.deleteMany();
  await prisma.user.deleteMany();
}

async function main() {
  await resetDatabase();

  const adminPasswordHash = await hash("admin12345", 10);
  const memberPasswordHash = await hash("member12345", 10);

  const now = new Date();
  const currentMonthBase = withNoon(now);
  const previousMonthBase = withNoon(subMonths(now, 1));
  const currentMonthKey = getMonthKey(currentMonthBase);
  const previousMonthKey = getMonthKey(previousMonthBase);

  const admin = await prisma.user.create({
    data: {
      name: "Mess Admin",
      email: "admin@messmate.app",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      phone: "01711000000",
    },
  });

  const memberBlueprints = [
    {
      name: "Abdur Rahim",
      email: "rahim@messmate.app",
      phone: "01712000001",
      permanentAddress: "Bagerhat Sadar, Khulna",
      roomNumber: "A-101",
      guardianPhone: "01817000001",
      joiningDate: monthDate(subMonths(now, 8), 5),
      monthlyRentShare: 3000,
      notes: "Prefers digital payment records.",
    },
    {
      name: "Mahmud Hasan",
      email: "mahmud@messmate.app",
      phone: "01712000002",
      permanentAddress: "Pabna Sadar, Rajshahi",
      roomNumber: "A-102",
      guardianPhone: "01817000002",
      joiningDate: monthDate(subMonths(now, 6), 11),
      monthlyRentShare: 3000,
      notes: "Usually buys bazar items on Fridays.",
    },
    {
      name: "Nusrat Jahan",
      email: "nusrat@messmate.app",
      phone: "01712000003",
      permanentAddress: "Mymensingh Sadar, Mymensingh",
      roomNumber: "B-201",
      guardianPhone: "01817000003",
      joiningDate: monthDate(subMonths(now, 4), 3),
      monthlyRentShare: 3000,
      notes: "Handles internet bill reminders.",
    },
    {
      name: "Sabbir Ahmed",
      email: "sabbir@messmate.app",
      phone: "01712000004",
      permanentAddress: "Cumilla Sadar, Chattogram",
      roomNumber: "B-202",
      guardianPhone: "01817000004",
      joiningDate: monthDate(subMonths(now, 3), 8),
      monthlyRentShare: 3000,
      notes: "Often pays deposits early.",
    },
    {
      name: "Tania Akter",
      email: "tania@messmate.app",
      phone: "01712000005",
      permanentAddress: "Barishal Sadar, Barishal",
      roomNumber: "C-301",
      guardianPhone: "01817000005",
      joiningDate: monthDate(subMonths(now, 2), 15),
      monthlyRentShare: 3000,
      notes: "Keeps an eye on cleaning and maintenance needs.",
    },
  ];

  const memberUsers = [];

  for (const blueprint of memberBlueprints) {
    const user = await prisma.user.create({
      data: {
        name: blueprint.name,
        email: blueprint.email,
        passwordHash: memberPasswordHash,
        role: "MEMBER",
        phone: blueprint.phone,
        memberProfile: {
          create: {
            permanentAddress: blueprint.permanentAddress,
            roomNumber: blueprint.roomNumber,
            joiningDate: blueprint.joiningDate,
            status: "ACTIVE",
            guardianPhone: blueprint.guardianPhone,
            monthlyRentShare: blueprint.monthlyRentShare,
            notes: blueprint.notes,
          },
        },
      },
      include: {
        memberProfile: true,
      },
    });

    memberUsers.push(user);
  }

  const memberProfiles = memberUsers.map((user) => user.memberProfile!).filter(Boolean);

  await prisma.monthlySummary.createMany({
    data: [
      {
        monthKey: currentMonthKey,
        totalHouseRent: 15000,
        rentDistributionMode: "PROFILE",
        notes: "Profile shares match the five active members.",
        updatedById: admin.id,
      },
      {
        monthKey: previousMonthKey,
        totalHouseRent: 15000,
        rentDistributionMode: "EQUAL",
        notes: "Previous month used equal split.",
        updatedById: admin.id,
      },
    ],
  });

  const currentMealPatterns = [
    [1, 0.5, 1],
    [1, 1, 1],
    [0.5, 1, 1],
    [1, 1, 0.5],
    [1, 0.5, 0.5],
  ] as const;

  const mealRecords: Prisma.MealRecordCreateManyInput[] = memberProfiles.flatMap((member, memberIndex) =>
    [1, 2, 3, 4, 5, 6].map((day, dayIndex) => {
      const pattern = currentMealPatterns[(memberIndex + dayIndex) % currentMealPatterns.length];

      return {
        memberId: member.id,
        date: monthDate(currentMonthBase, day),
        monthKey: currentMonthKey,
        breakfastCount: pattern[0],
        lunchCount: pattern[1],
        dinnerCount: pattern[2],
        notes: day === 6 ? "Weekend schedule" : null,
        updatedById: admin.id,
      };
    }),
  );

  mealRecords.push(
    ...memberProfiles.slice(0, 3).flatMap((member, memberIndex) =>
      [2, 3, 4].map((day) => ({
        memberId: member.id,
        date: monthDate(previousMonthBase, day),
        monthKey: previousMonthKey,
        breakfastCount: 1,
        lunchCount: memberIndex % 2 === 0 ? 1 : 0.5,
        dinnerCount: 1,
        notes: "Previous month sample record",
        updatedById: admin.id,
      })),
    ),
  );

  await prisma.mealRecord.createMany({ data: mealRecords });

  await prisma.bazarExpense.createMany({
    data: [
      {
        itemName: "Rice",
        quantity: 25,
        unit: "kg",
        price: 1850,
        date: monthDate(currentMonthBase, 2),
        monthKey: currentMonthKey,
        boughtById: memberProfiles[0].id,
        notes: "Bulk monthly stock",
        createdById: admin.id,
      },
      {
        itemName: "Fish",
        quantity: 6,
        unit: "kg",
        price: 1620,
        date: monthDate(currentMonthBase, 4),
        monthKey: currentMonthKey,
        boughtById: memberProfiles[1].id,
        createdById: admin.id,
      },
      {
        itemName: "Vegetables",
        quantity: 12,
        unit: "kg",
        price: 960,
        date: monthDate(currentMonthBase, 5),
        monthKey: currentMonthKey,
        boughtById: memberProfiles[2].id,
        createdById: admin.id,
      },
      {
        itemName: "Eggs",
        quantity: 60,
        unit: "pcs",
        price: 780,
        date: monthDate(currentMonthBase, 6),
        monthKey: currentMonthKey,
        boughtById: memberProfiles[3].id,
        createdById: admin.id,
      },
      {
        itemName: "Cooking oil",
        quantity: 8,
        unit: "liters",
        price: 1320,
        date: monthDate(currentMonthBase, 7),
        monthKey: currentMonthKey,
        boughtById: memberProfiles[4].id,
        createdById: admin.id,
      },
      {
        itemName: "Chicken",
        quantity: 5,
        unit: "kg",
        price: 1180,
        date: monthDate(previousMonthBase, 6),
        monthKey: previousMonthKey,
        boughtById: memberProfiles[0].id,
        createdById: admin.id,
      },
    ],
  });

  const currentSchedules = await Promise.all(
    memberProfiles.map((member, index) =>
      prisma.bazarSchedule.create({
        data: {
          memberId: member.id,
          date: monthDate(currentMonthBase, 11 + index),
          monthKey: currentMonthKey,
          notes: index % 2 === 0 ? "Morning bazar before classes" : "Evening bazar slot",
          createdById: admin.id,
        },
      }),
    ),
  );

  const previousSchedule = await prisma.bazarSchedule.create({
    data: {
      memberId: memberProfiles[0].id,
      date: monthDate(previousMonthBase, 14),
      monthKey: previousMonthKey,
      notes: "Previous month sample duty",
      createdById: admin.id,
    },
  });

  await prisma.bazarScheduleChangeRequest.createMany({
    data: [
      {
        scheduleId: currentSchedules[1].id,
        requesterId: memberUsers[1].id,
        requestedDate: monthDate(currentMonthBase, 20),
        requestedMonthKey: currentMonthKey,
        reason: "Exam day conflict. Need a later bazar date.",
        status: "PENDING",
      },
      {
        scheduleId: previousSchedule.id,
        requesterId: memberUsers[0].id,
        requestedDate: monthDate(previousMonthBase, 16),
        requestedMonthKey: previousMonthKey,
        reason: "Travel schedule changed that week.",
        status: "REJECTED",
        handledById: admin.id,
        adminNote: "Could not move because another member was unavailable.",
      },
    ],
  });

  await prisma.rentPayment.createMany({
    data: [
      {
        memberId: memberProfiles[0].id,
        amount: 3000,
        date: monthDate(currentMonthBase, 3),
        monthKey: currentMonthKey,
        notes: "Full payment",
        createdById: admin.id,
      },
      {
        memberId: memberProfiles[1].id,
        amount: 2500,
        date: monthDate(currentMonthBase, 3),
        monthKey: currentMonthKey,
        notes: "Partial payment",
        createdById: admin.id,
      },
      {
        memberId: memberProfiles[2].id,
        amount: 3000,
        date: monthDate(currentMonthBase, 4),
        monthKey: currentMonthKey,
        createdById: admin.id,
      },
      {
        memberId: memberProfiles[3].id,
        amount: 2000,
        date: monthDate(currentMonthBase, 5),
        monthKey: currentMonthKey,
        createdById: admin.id,
      },
      {
        memberId: memberProfiles[4].id,
        amount: 3000,
        date: monthDate(previousMonthBase, 4),
        monthKey: previousMonthKey,
        createdById: admin.id,
      },
    ],
  });

  await prisma.otherExpense.createMany({
    data: [
      {
        title: "Electricity bill",
        category: "ELECTRICITY",
        amount: 2350,
        date: monthDate(currentMonthBase, 8),
        monthKey: currentMonthKey,
        paidById: memberProfiles[2].id,
        notes: "Meter payment",
        createdById: admin.id,
      },
      {
        title: "Internet bill",
        category: "INTERNET",
        amount: 1200,
        date: monthDate(currentMonthBase, 8),
        monthKey: currentMonthKey,
        paidById: memberProfiles[2].id,
        createdById: admin.id,
      },
      {
        title: "Cleaning supplies",
        category: "CLEANING",
        amount: 580,
        date: monthDate(currentMonthBase, 9),
        monthKey: currentMonthKey,
        paidById: memberProfiles[4].id,
        createdById: admin.id,
      },
      {
        title: "Gas refill",
        category: "GAS",
        amount: 1650,
        date: monthDate(previousMonthBase, 10),
        monthKey: previousMonthKey,
        paidById: memberProfiles[1].id,
        createdById: admin.id,
      },
    ],
  });

  await prisma.deposit.createMany({
    data: [
      {
        memberId: memberProfiles[0].id,
        amount: 2500,
        date: monthDate(currentMonthBase, 1),
        monthKey: currentMonthKey,
        purpose: "Monthly fund advance",
        createdById: admin.id,
      },
      {
        memberId: memberProfiles[1].id,
        amount: 2000,
        date: monthDate(currentMonthBase, 1),
        monthKey: currentMonthKey,
        purpose: "Mess fund",
        createdById: admin.id,
      },
      {
        memberId: memberProfiles[2].id,
        amount: 2200,
        date: monthDate(currentMonthBase, 2),
        monthKey: currentMonthKey,
        purpose: "Utility support",
        createdById: admin.id,
      },
      {
        memberId: memberProfiles[3].id,
        amount: 1800,
        date: monthDate(currentMonthBase, 2),
        monthKey: currentMonthKey,
        purpose: "Mess fund",
        createdById: admin.id,
      },
      {
        memberId: memberProfiles[4].id,
        amount: 2300,
        date: monthDate(currentMonthBase, 3),
        monthKey: currentMonthKey,
        purpose: "Food balance",
        createdById: admin.id,
      },
      {
        memberId: memberProfiles[0].id,
        amount: 2100,
        date: monthDate(previousMonthBase, 2),
        monthKey: previousMonthKey,
        purpose: "Previous month fund",
        createdById: admin.id,
      },
    ],
  });

  await prisma.notice.createMany({
    data: [
      {
        title: "Monthly বাজার review",
        description: "Please verify this month's bazar slips before final balance closing on the 28th.",
        priority: "IMPORTANT",
        date: monthDate(currentMonthBase, 10),
        isPublished: true,
        createdById: admin.id,
      },
      {
        title: "Water line maintenance",
        description: "The plumber will visit tomorrow morning. Please keep the kitchen area accessible.",
        priority: "URGENT",
        date: monthDate(currentMonthBase, 12),
        isPublished: true,
        createdById: admin.id,
      },
      {
        title: "Draft welcome note",
        description: "Internal draft notice for the next new member onboarding checklist.",
        priority: "NORMAL",
        date: monthDate(currentMonthBase, 15),
        isPublished: false,
        createdById: admin.id,
      },
    ],
  });

  await prisma.importantInfo.create({
    data: {
      electricityAccount: "DESCO 4411-2288-0099",
      gasCardNumber: "TITAS 9988-7766-5544",
      wifiInfo: "Link3 | User: house377 | Bill day: 8th",
      houseOwnerPhone: "01911000000",
      emergencyContacts: [
        "Landlord - 01911000000",
        "Caretaker - 01755000000",
        "Emergency ambulance - 999",
      ],
      nearbyDoctorInfo: "Dr. Samiha Rahman, City Care Diagnostic, 01819000000",
      nearbyPharmacyInfo: "Life Pharmacy, Road 12, 01766000000",
      otherNotes: "Keep cashbook photo uploads inside /uploads/receipts for monthly review.",
      membersCanView: true,
      updatedById: admin.id,
    },
  });

  await prisma.chatMessage.createMany({
    data: [
      { senderId: admin.id, content: "Welcome to the refreshed MessMate demo workspace." },
      { senderId: memberUsers[0].id, content: "I have uploaded this week's rice and oil receipts." },
      { senderId: memberUsers[2].id, content: "Internet bill paid today. Please review the expense entry." },
      { senderId: memberUsers[3].id, content: "I will cover tomorrow's vegetable bazar in the evening." },
      { senderId: memberUsers[4].id, content: "Cleaning supplies are running low. Adding a note in expenses as well." },
      { senderId: admin.id, content: "Thanks. Final monthly report will be ready after Friday dinner count." },
    ],
  });

  await prisma.timelinePost.createMany({
    data: [
      {
        authorId: admin.id,
        title: "Kitchen tap pressure issue",
        content: "Water pressure in the kitchen is too low after 8 PM. Please confirm if everyone is seeing the same issue.",
      },
      {
        authorId: memberUsers[2].id,
        title: "WiFi speed drops at night",
        content: "Streaming and uploads get very slow after dinner. Sharing this here so others can confirm before we call support.",
      },
      {
        authorId: memberUsers[4].id,
        title: "Cleaning rotation reminder",
        content: "The dining space is being left messy after lunch. We should align on the weekly cleaning rotation again.",
        isResolved: true,
      },
    ],
  });

  await prisma.auditLog.createMany({
    data: [
      {
        action: "SEED_INITIALIZED",
        entityType: "System",
        entityId: "messmate-demo",
        performedById: admin.id,
        metadata: { months: [currentMonthKey, previousMonthKey] },
      },
      {
        action: "MEMBER_CREATED",
        entityType: "MemberProfile",
        entityId: memberProfiles[0].id,
        performedById: admin.id,
        metadata: { name: memberUsers[0].name, roomNumber: memberProfiles[0].roomNumber },
      },
      {
        action: "MEAL_CREATED",
        entityType: "MealRecord",
        entityId: "seed-meals",
        performedById: admin.id,
        metadata: { monthKey: currentMonthKey, count: mealRecords.length },
      },
      {
        action: "BAZAR_CREATED",
        entityType: "BazarExpense",
        entityId: "seed-bazar",
        performedById: admin.id,
        metadata: { monthKey: currentMonthKey, itemCount: 6 },
      },
      {
        action: "BAZAR_SCHEDULE_CREATED",
        entityType: "BazarSchedule",
        entityId: currentSchedules[0].id,
        performedById: admin.id,
        metadata: { monthKey: currentMonthKey, count: currentSchedules.length },
      },
      {
        action: "TIMELINE_POST_CREATED",
        entityType: "TimelinePost",
        entityId: "seed-timeline",
        performedById: admin.id,
        metadata: { count: 3 },
      },
      {
        action: "NOTICE_CREATED",
        entityType: "Notice",
        entityId: "seed-notice",
        performedById: admin.id,
        metadata: { publishedCount: 2 },
      },
    ],
  });

  console.log("Seeded MessMate demo data.");
  console.log("Admin login: admin@messmate.app / admin12345");
  console.log("Member login: rahim@messmate.app / member12345");
}

main()
  .catch((error) => {
    console.error("Unable to seed MessMate demo data.", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
