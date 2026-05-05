import type { NextAuthConfig } from "next-auth";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/auth";

const protectedPrefixes = ["/dashboard", "/admin", "/chat", "/profile", "/history"];

export const authConfig = {
  trustHost: true,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsedCredentials = loginSchema.safeParse(credentials);

        if (!parsedCredentials.success) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: parsedCredentials.data.email.toLowerCase(),
          },
          include: {
            memberProfile: true,
          },
        });

        if (!user || !user.isActive) {
          return null;
        }

        if (user.memberProfile?.status === "INACTIVE") {
          return null;
        }

        const isValidPassword = await compare(parsedCredentials.data.password, user.passwordHash);

        if (!isValidPassword) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          memberProfileId: user.memberProfile?.id ?? null,
          phone: user.phone,
          isActive: user.isActive,
          memberStatus: user.memberProfile?.status ?? null,
        };
      },
    }),
  ],
  callbacks: {
    authorized({ auth, request }) {
      const pathname = request.nextUrl.pathname;
      const isProtected = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));

      if (!isProtected) {
        return true;
      }

      if (!auth?.user) {
        return false;
      }

      if (pathname.startsWith("/admin") && auth.user.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.memberProfileId = user.memberProfileId ?? null;
        token.phone = user.phone ?? null;
        token.isActive = user.isActive;
        token.memberStatus = user.memberStatus ?? null;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = typeof token.id === "string" ? token.id : "";
        session.user.role = token.role === "ADMIN" || token.role === "MEMBER" ? token.role : "MEMBER";
        session.user.memberProfileId = typeof token.memberProfileId === "string" ? token.memberProfileId : null;
        session.user.phone = typeof token.phone === "string" ? token.phone : null;
        session.user.isActive = typeof token.isActive === "boolean" ? token.isActive : true;
        session.user.memberStatus =
          token.memberStatus === "ACTIVE" || token.memberStatus === "INACTIVE" ? token.memberStatus : null;
      }

      return session;
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
