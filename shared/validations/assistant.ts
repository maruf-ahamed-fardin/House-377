import { z } from "zod";

export const assistantMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(4000),
});

export const assistantRequestSchema = z.object({
  messages: z.array(assistantMessageSchema).min(1, "Ask a question.").max(40, "Conversation is too long."),
});

export type AssistantMessage = z.infer<typeof assistantMessageSchema>;
export type AssistantRequest = z.infer<typeof assistantRequestSchema>;
