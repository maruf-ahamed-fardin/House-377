"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Bot, SendHorizonal, Sparkles, User } from "lucide-react";
import { toast } from "sonner";

import { assistantApi, type AssistantChatMessage } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "এই মাসে আমার কত টাকা বাকি আছে?",
  "Who owes the most money this month?",
  "Ei month e total bazar koto holo?",
  "इस महीने मील रेट क्या है?",
];

const GREETING =
  "Assalamu Alaikum! 👋 I'm your MessMate Assistant. Ask me anything about meals, bazar, rent, dues, deposits, notices, or the bazar schedule — in Bangla, English, Banglish, or Hindi.";

export function AssistantPanel({ userName }: { userName: string }) {
  const [messages, setMessages] = useState<AssistantChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the newest message.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isPending]);

  function send(text: string) {
    const content = text.trim();
    if (!content || isPending) return;

    const previousMessages = messages;
    const nextMessages: AssistantChatMessage[] = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setInput("");

    startTransition(async () => {
      const result = await assistantApi.ask(nextMessages);
      if (!result.success) {
        toast.error(result.message);
        // Roll back the unanswered question so the user can retry.
        setMessages(previousMessages);
        setInput(content);
        return;
      }
      setMessages([...nextMessages, { role: "assistant", content: result.data.reply }]);
    });
  }

  return (
    <Card className="flex h-[calc(100vh-13rem)] min-h-[460px] flex-col border-white/70 bg-white/80 dark:border-white/10 dark:bg-slate-950/75">
      <CardHeader className="border-b border-border/50">
        <CardTitle className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-white">
            <Sparkles className="size-4" />
          </span>
          MessMate Assistant
        </CardTitle>
        <CardDescription>Answers using your real mess data. Numbers come straight from the database.</CardDescription>
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col gap-4 pt-4">
        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto pr-3">
          <div className="space-y-4">
            {/* Greeting + suggestions when empty */}
            {messages.length === 0 && (
              <div className="space-y-4">
                <MessageBubble role="assistant" content={GREETING} />
                <div className="flex flex-wrap gap-2 pl-11">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => send(s)}
                      className="rounded-full border border-border/70 bg-background/70 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-amber-400/60 hover:text-foreground"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <MessageBubble key={i} role={m.role} content={m.content} />
            ))}

            {isPending && (
              <div className="flex items-center gap-3 pl-11 text-sm text-muted-foreground">
                <span className="flex gap-1">
                  <Dot /> <Dot delay="150ms" /> <Dot delay="300ms" />
                </span>
                Thinking…
              </div>
            )}
          </div>
        </div>

        <form
          className="flex items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder={`Ask anything, ${userName.split(" ")[0]}… (Enter to send, Shift+Enter for new line)`}
            className="max-h-32 min-h-[48px] resize-none"
            disabled={isPending}
          />
          <Button type="submit" size="icon" className="size-12 shrink-0" disabled={isPending || !input.trim()}>
            <SendHorizonal className="size-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function MessageBubble({ role, content }: { role: "user" | "assistant"; content: string }) {
  const isUser = role === "user";
  return (
    <div className={cn("flex items-start gap-3", isUser && "flex-row-reverse")}>
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg text-white",
          isUser ? "bg-gradient-to-br from-sky-400 to-blue-500" : "bg-gradient-to-br from-amber-400 to-orange-500",
        )}
      >
        {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
      </span>
      <div
        className={cn(
          "max-w-[80%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-sm leading-7",
          isUser ? "bg-sky-500 text-white" : "border border-border/70 bg-background/70",
        )}
      >
        {content}
      </div>
    </div>
  );
}

function Dot({ delay = "0ms" }: { delay?: string }) {
  return <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60" style={{ animationDelay: delay }} />;
}
