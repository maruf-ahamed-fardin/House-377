import { Router } from "express";

import { prisma } from "../prisma.js";
import { authenticate } from "../middleware/authenticate.js";
import { createAuditLog } from "../services/audit.service.js";
import { chatMessageSchema } from "../../../shared/validations/chat.js";

const router = Router();

router.get("/", authenticate, async (req, res) => {
  try {
    const limit = parseInt((req.query.limit as string) ?? "80", 10);
    const messages = await prisma.chatMessage.findMany({ orderBy: { createdAt: "asc" }, take: limit, include: { sender: true } });
    res.json({ success: true, data: messages });
  } catch (error) { console.error("Get chat error:", error); res.status(500).json({ success: false, message: "Failed to load messages." }); }
});

router.post("/", authenticate, async (req, res) => {
  try {
    const data = chatMessageSchema.parse(req.body);
    const message = await prisma.chatMessage.create({ data: { senderId: req.user!.id, content: data.content } });
    await createAuditLog({ action: "CHAT_MESSAGE_SENT", entityType: "ChatMessage", entityId: message.id, performedById: req.user!.id, metadata: { preview: data.content.slice(0, 100) } });
    res.json({ success: true, message: "Message sent." });
  } catch (error) { console.error("Send chat error:", error); res.status(500).json({ success: false, message: "Unable to send message." }); }
});

export default router;
