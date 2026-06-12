"use server";

import { hash } from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { registerSchema, type RegisterValues } from "@/lib/validations/register";

export type RegisterResult =
  | { success: true }
  | { success: false; message: string };

export async function registerAction(values: RegisterValues): Promise<RegisterResult> {
  try {
    const data = registerSchema.parse(values);

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      return {
        success: false,
        message: "An account with this email already exists. Please sign in instead.",
      };
    }

    const passwordHash = await hash(data.password, 10);

    await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        passwordHash,
        role: "MEMBER",
        isActive: true,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Register error:", error);
    return {
      success: false,
      message: "Unable to create account right now. Please try again.",
    };
  }
}
