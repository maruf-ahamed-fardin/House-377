"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import type { ChatMessage, User } from "@prisma/client";

import { ChatForm } from "@/components/forms/chat-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

type MessageWithSender = ChatMessage & {
  sender: User;
};

function getInitials(name?: string | null) {
  return name
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function ChatPanel({ initialMessages }: { initialMessages: MessageWithSender[] }) {
  const [messages, setMessages] = useState(initialMessages);

  const refreshMessages = useEffectEvent(async () => {
    const response = await fetch("/api/chat", { cache: "no-store" });

    if (!response.ok) {
      return;
    }

    const payload = (await response.json()) as { messages: MessageWithSender[] };
    setMessages(payload.messages);
  });

  useEffect(() => {
    const interval = window.setInterval(() => {
      void refreshMessages();
    }, 8000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <Card className="border-white/70 bg-white/80 dark:border-white/10 dark:bg-slate-950/75">
        <CardHeader>
          <CardTitle>Mess group chat</CardTitle>
          <CardDescription>Messages refresh automatically every few seconds.</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[560px] pr-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="rounded-3xl border border-border/70 bg-background/70 p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={message.sender.image ?? undefined} alt={message.sender.name} />
                      <AvatarFallback>{getInitials(message.sender.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{message.sender.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {message.sender.role} | {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm leading-7">{message.content}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="border-white/70 bg-white/80 dark:border-white/10 dark:bg-slate-950/75">
        <CardHeader>
          <CardTitle>Send a message</CardTitle>
          <CardDescription>Keep it simple, useful, and friendly for everyone in the mess.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChatForm />
        </CardContent>
      </Card>
    </div>
  );
}
