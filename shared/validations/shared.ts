import { z } from "zod";

export const monthKeySchema = z.string().regex(/^\d{4}-\d{2}$/, "Use YYYY-MM format.");

export const requiredDateSchema = z.string().min(1, "Date is required.");

export const optionalTextSchema = z.union([z.string().trim(), z.literal("")]).optional();

export const optionalUploadSchema = z
  .union([z.string().trim(), z.literal("")])
  .optional()
  .refine(
    (value) => !value || value.startsWith("/") || z.string().url().safeParse(value).success,
    "Provide a valid URL or uploaded file path.",
  );

export const phoneSchema = z.string().trim().min(7, "Phone number is too short.").max(20, "Phone number is too long.");

export const positiveMoneySchema = z.coerce.number().min(0, "Amount must be 0 or higher.");
export const positiveQuantitySchema = z.coerce.number().min(0, "Value must be 0 or higher.");
