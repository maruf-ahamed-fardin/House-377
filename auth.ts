import type { NextAuthConfig } from "next-auth";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { compare } from "bcryptjs";
import { NextResponse } from "next/server";
import { PrismaAdapter } from "@auth/prisma-adapter";

import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/auth";

const protectedPrefixes = ["/dashboard", "/admin", "/chat", "/profile", "/history", "/timeline", "/bazar-schedule"];
const authSecret =
  process.env.AUTH_SECRET ??
  process.env.NEXTAUTH_SECRET ??
  (process.env.NODE_ENV === "production" ? undefined : "messmate-dev-secret");

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  trustHost: true,
  secret: authSecret,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
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

        if (!user.passwordHash) {
          // OAuth-only user trying to use password sign-in
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
    async jwt({ token, user, account }) {
      if (user) {
        // Look up the full DB user to get role + profile data
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id as string },
          include: { memberProfile: true },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.memberProfileId = dbUser.memberProfile?.id ?? null;
          token.phone = dbUser.phone ?? null;
          token.isActive = dbUser.isActive;
          token.memberStatus = dbUser.memberProfile?.status ?? null;
        }
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
