"use client";

import type { Session } from "next-auth";
import { Menu } from "lucide-react";

import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export function MobileSidebar({ user }: { user: Session["user"] }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0 md:hidden">
          <Menu className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[92vw] max-w-sm border-none bg-transparent p-0 shadow-none">
        <Sidebar user={user} mobile />
      </DialogContent>
    </Dialog>
  );
}
