import { Router } from "express";
import { GoogleGenAI, type Content, type Part } from "@google/genai";

import config from "../config.js";
import { authenticate } from "../middleware/authenticate.js";
import { createAuditLog } from "../services/audit.service.js";
import { toolDeclarations, executeTool, type AssistantContext } from "../services/assistant.tools.js";
import { assistantRequestSchema } from "../../../shared/validations/assistant.js";

const router = Router();

const MAX_TOOL_ROUNDS = 6;

// Lazily create the client so the server still boots without a key configured.
let client: GoogleGenAI | null = null;
function getClient() {
  if (!config.geminiApiKey) return null;
  if (!client) client = new GoogleGenAI({ apiKey: config.geminiApiKey });
  return client;
}

function buildSystemInstruction(ctx: AssistantContext) {
  return [
    "You are 'MessMate Assistant', a friendly, concise AI helper built into the House-377 mess (shared house) management app.",
    "You help members and admins understand their mess data: meals, bazar (groceries), rent, deposits, other expenses, dues, notices, bazar schedule, members and important info.",
    "",
    `The current user is "${ctx.name}" with role ${ctx.role}.`,
    "",
    "LANGUAGE: Detect the language of the user's latest message and reply in that SAME language. You fully support Bangla (বাংলা), English, Banglish (Bangla written in English letters), and Hindi. If the user writes Banglish, reply in Banglish. Mirror their style.",
    "",
    "DATA RULES:",
    "- This is a shared house, so financial figures and dues are transparent: any member may ask about any member's dues, meals, bazar, rent and balances. Answer freely.",
    "- ALL numbers MUST come from the tools. Never invent or estimate figures. If a tool returns no data, say so plainly.",
    "- Money is in BDT (Bangladeshi Taka). Write amounts like '৳1,200' or '1200 Taka'.",
    "- For anything about 'this month', 'today', or 'now', call get_current_date first to resolve the month, then pass the YYYY-MM month to the other tools.",
    "- 'Important Info' (wifi/gas/emergency) may be admin-restricted; if a tool says it is restricted, relay that politely instead of guessing.",
    "",
    "STYLE: Be brief and clear. Use short paragraphs or small bullet/number lists. For dues, state who owes and who gets money back. Don't show internal IDs. If a question is unrelated to the mess, answer helpfully but briefly.",
  ].join("\n");
}

router.post("/", authenticate, async (req, res) => {
  try {
    const ai = getClient();
    if (!ai) {
      res.status(503).json({ success: false, message: "The AI assistant is not configured yet. An admin needs to set GEMINI_API_KEY on the server." });
      return;
    }

    const parsed = assistantRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: parsed.error.issues[0]?.message ?? "Invalid request." });
      return;
    }

    const ctx: AssistantContext = { userId: req.user!.id, role: req.user!.role, name: req.user!.name };

    // Seed conversation from the client-provided history.
    const contents: Content[] = parsed.data.messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const systemInstruction = buildSystemInstruction(ctx);
    let finalText = "";

    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const response = await ai.models.generateContent({
        model: config.geminiModel,
        contents,
        config: {
          systemInstruction,
          temperature: 0.3,
          tools: [{ functionDeclarations: toolDeclarations }],
        },
      });

      const calls = response.functionCalls ?? [];

      if (calls.length === 0) {
        finalText = response.text ?? "";
        break;
      }

      // Record the model's tool-call turn, then answer each call.
      const modelContent = response.candidates?.[0]?.content;
      if (modelContent) contents.push(modelContent);

      const responseParts: Part[] = [];
      for (const call of calls) {
        const result = await executeTool(call.name ?? "", (call.args as Record<string, unknown>) ?? {}, ctx);
        responseParts.push({ functionResponse: { name: call.name ?? "", response: result as Record<string, unknown> } });
      }
      contents.push({ role: "user", parts: responseParts });

      // If this was the last allowed round, ask once more for a plain answer.
      if (round === MAX_TOOL_ROUNDS - 1) {
        const wrapUp = await ai.models.generateContent({
          model: config.geminiModel,
          contents,
          config: { systemInstruction, temperature: 0.3 },
        });
        finalText = wrapUp.text ?? "";
      }
    }

    if (!finalText.trim()) {
      finalText = "Sorry, I couldn't find an answer for that. Try rephrasing your question.";
    }

    await createAuditLog({
      action: "ASSISTANT_QUERY",
      entityType: "Assistant",
      entityId: req.user!.id,
      performedById: req.user!.id,
      metadata: { question: parsed.data.messages[parsed.data.messages.length - 1]?.content.slice(0, 200) },
    });

    res.json({ success: true, data: { reply: finalText } });
  } catch (error) {
    console.error("Assistant error:", error);
    res.status(500).json({ success: false, message: "The assistant ran into a problem. Please try again." });
  }
});

export default router;
