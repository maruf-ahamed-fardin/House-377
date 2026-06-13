import { z } from "zod";

import { optionalTextSchema } from "./shared.js";

export const importantInfoFormSchema = z.object({
  id: z.string().optional(),
  electricityAccount: optionalTextSchema,
  gasCardNumber: optionalTextSchema,
  wifiInfo: optionalTextSchema,
  houseOwnerPhone: optionalTextSchema,
  emergencyContacts: optionalTextSchema,
  nearbyDoctorInfo: optionalTextSchema,
  nearbyPharmacyInfo: optionalTextSchema,
  otherNotes: optionalTextSchema,
  membersCanView: z.boolean().default(true),
});

export type ImportantInfoFormInput = z.input<typeof importantInfoFormSchema>;
export type ImportantInfoFormValues = z.output<typeof importantInfoFormSchema>;
