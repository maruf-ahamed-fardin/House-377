import { z } from "zod";

export const chatMessageSchema = z.object({
  content: z.string().trim().min(1, "Write a message.").max(1000, "Message is too long."),
});

export type ChatMessageValues = z.infer<typeof chatMessageSchema>;
