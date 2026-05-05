import { redirect } from "next/navigation";

import { auth } from "@/auth";

export async function requireUser() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return session.user;
}

export async function requireAdmin() {
  const user = await requireUser();

  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return user;
}

export async function requireSelfOrAdmin(userId: string) {
  const user = await requireUser();

  if (user.role !== "ADMIN" && user.id !== userId) {
    redirect("/dashboard");
  }

  return user;
}
