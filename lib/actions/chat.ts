"use server";

import { createAuditLog } from "@/lib/audit";
import { ActionResult, actionError, revalidateAppPaths } from "@/lib/actions/helpers";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/rbac";
import { chatMessageSchema, type ChatMessageValues } from "@/lib/validations/chat";

export async function sendChatMessageAction(values: ChatMessageValues): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const data = chatMessageSchema.parse(values);

    const message = await prisma.chatMessage.create({
      data: {
        senderId: user.id,
        content: data.content,
      },
    });

    await createAuditLog({
      action: "CHAT_MESSAGE_SENT",
      entityType: "ChatMessage",
      entityId: message.id,
      performedById: user.id,
      metadata: {
        preview: data.content.slice(0, 100),
      },
    });

    revalidateAppPaths("/chat");

    return {
      success: true,
      message: "Message sent.",
    };
  } catch (error) {
    return actionError("Unable to send message right now.", error);
  }
}
