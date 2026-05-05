import { z } from "zod";

import { positiveQuantitySchema, requiredDateSchema } from "@/lib/validations/shared";

export const mealFormSchema = z.object({
  id: z.string().optional(),
  memberId: z.string().min(1, "Select a member."),
  date: requiredDateSchema,
  breakfastCount: positiveQuantitySchema.max(3, "Breakfast count looks too high."),
  lunchCount: positiveQuantitySchema.max(3, "Lunch count looks too high."),
  dinnerCount: positiveQuantitySchema.max(3, "Dinner count looks too high."),
  notes: z.union([z.string().trim(), z.literal("")]).optional(),
});

export type MealFormValues = z.infer<typeof mealFormSchema>;
