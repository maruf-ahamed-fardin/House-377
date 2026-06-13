import { z } from "zod";

import { optionalTextSchema, requiredDateSchema } from "./shared.js";

// String literal replacements for Prisma enums so shared code doesn't depend on @prisma/client
const RequestStatusEnum = z.enum(["PENDING", "APPROVED", "REJECTED"]);

export const bazarScheduleFormSchema = z.object({
  id: z.string().optional(),
  memberId: z.string().min(1, "Select a member."),
  date: requiredDateSchema,
  notes: optionalTextSchema,
});

export const bazarScheduleRequestFormSchema = z.object({
  id: z.string().optional(),
  scheduleId: z.string().min(1, "Schedule is required."),
  requestedDate: requiredDateSchema,
  reason: z.string().trim().min(5, "Give a short reason for the date change."),
});

export const bazarScheduleRequestDecisionSchema = z.object({
  requestId: z.string().min(1),
  status: RequestStatusEnum.refine((value) => value !== "PENDING", "Select approve or reject."),
  adminNote: optionalTextSchema,
});

export const timelinePostFormSchema = z.object({
  id: z.string().optional(),
  title: z.union([z.string().trim().min(3, "Title must be at least 3 characters."), z.literal("")]).optional(),
  content: z.string().trim().min(5, "Write at least a short problem or update."),
});

export type BazarScheduleFormInput = z.input<typeof bazarScheduleFormSchema>;
export type BazarScheduleFormValues = z.output<typeof bazarScheduleFormSchema>;
export type BazarScheduleRequestFormInput = z.input<typeof bazarScheduleRequestFormSchema>;
export type BazarScheduleRequestFormValues = z.output<typeof bazarScheduleRequestFormSchema>;
export type BazarScheduleRequestDecisionInput = z.input<typeof bazarScheduleRequestDecisionSchema>;
export type BazarScheduleRequestDecisionValues = z.output<typeof bazarScheduleRequestDecisionSchema>;
export type TimelinePostFormInput = z.input<typeof timelinePostFormSchema>;
export type TimelinePostFormValues = z.output<typeof timelinePostFormSchema>;
