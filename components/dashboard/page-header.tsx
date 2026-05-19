import { type ReactNode } from "react";

import { Button } from "@/components/ui/button";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex min-w-0 flex-col gap-4 sm:mb-8 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0 space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {action ? <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap lg:w-auto lg:shrink-0 lg:items-center lg:justify-end">{action}</div> : null}
    </div>
  );
}

export function PageHeaderLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Button asChild variant="outline">
      <a href={href}>{label}</a>
    </Button>
  );
}
