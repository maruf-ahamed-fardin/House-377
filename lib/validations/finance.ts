import { ExpenseCategory, NoticePriority, RentDistributionMode } from "@prisma/client";
import { z } from "zod";

import {
  monthKeySchema,
  optionalTextSchema,
  optionalUploadSchema,
  positiveMoneySchema,
  positiveQuantitySchema,
  requiredDateSchema,
} from "@/lib/validations/shared";

export const bazarExpenseFormSchema = z.object({
  id: z.string().optional(),
  itemName: z.string().trim().min(2, "Item name is required."),
  quantity: positiveQuantitySchema,
  unit: z.union([z.string().trim(), z.literal("")]).optional(),
  price: positiveMoneySchema.min(0.01, "Price must be greater than 0."),
  date: requiredDateSchema,
  boughtById: z.union([z.string(), z.literal("")]).optional(),
  receiptUrl: optionalUploadSchema,
  notes: optionalTextSchema,
});

export const rentSummaryFormSchema = z.object({
  monthKey: monthKeySchema,
  totalHouseRent: positiveMoneySchema,
  rentDistributionMode: z.nativeEnum(RentDistributionMode),
  notes: optionalTextSchema,
});

export const rentPaymentFormSchema = z.object({
  id: z.string().optional(),
  memberId: z.string().min(1, "Select a member."),
  amount: positiveMoneySchema.min(0.01, "Amount must be greater than 0."),
  date: requiredDateSchema,
  notes: optionalTextSchema,
});

export const otherExpenseFormSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(2, "Expense title is required."),
  category: z.nativeEnum(ExpenseCategory),
  amount: positiveMoneySchema.min(0.01, "Amount must be greater than 0."),
  date: requiredDateSchema,
  paidById: z.union([z.string(), z.literal("")]).optional(),
  notes: optionalTextSchema,
});

export const depositFormSchema = z.object({
  id: z.string().optional(),
  memberId: z.string().min(1, "Select a member."),
  amount: positiveMoneySchema.min(0.01, "Amount must be greater than 0."),
  date: requiredDateSchema,
  purpose: z.union([z.string().trim(), z.literal("")]).optional(),
  notes: optionalTextSchema,
});

export const noticeFormSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(3, "Notice title is required."),
  description: z.string().trim().min(5, "Description is too short."),
  priority: z.nativeEnum(NoticePriority),
  date: requiredDateSchema,
  isPublished: z.boolean().default(true),
});

export type BazarExpenseFormValues = z.infer<typeof bazarExpenseFormSchema>;
export type RentSummaryFormValues = z.infer<typeof rentSummaryFormSchema>;
export type RentPaymentFormValues = z.infer<typeof rentPaymentFormSchema>;
export type OtherExpenseFormValues = z.infer<typeof otherExpenseFormSchema>;
export type DepositFormValues = z.infer<typeof depositFormSchema>;
export type NoticeFormValues = z.infer<typeof noticeFormSchema>;
