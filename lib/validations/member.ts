import { MemberStatus } from "@prisma/client";
import { z } from "zod";

import { optionalTextSchema, optionalUploadSchema, phoneSchema, positiveMoneySchema, requiredDateSchema } from "@/lib/validations/shared";

export const memberFormSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().trim().min(2, "Name must be at least 2 characters."),
    email: z.string().trim().email("Enter a valid email address."),
    phone: phoneSchema,
    image: optionalUploadSchema,
    permanentAddress: z.string().trim().min(5, "Address is too short."),
    roomNumber: z.string().trim().min(1, "Room number is required."),
    joiningDate: requiredDateSchema,
    status: z.nativeEnum(MemberStatus),
    guardianPhone: z.union([phoneSchema, z.literal("")]).optional(),
    monthlyRentShare: positiveMoneySchema,
    notes: optionalTextSchema,
    password: z.union([z.string().min(6, "Password must be at least 6 characters."), z.literal("")]).optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.id && !value.password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password"],
        message: "Password is required for new members.",
      });
    }
  });

export type MemberFormValues = z.infer<typeof memberFormSchema>;
