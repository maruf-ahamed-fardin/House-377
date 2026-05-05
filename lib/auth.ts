import { compare } from "bcryptjs";
import { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/auth";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
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
    async jwt({ token, user }) {
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
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id ?? "";
        session.user.role = (token.role as "ADMIN" | "MEMBER") ?? "MEMBER";
        session.user.memberProfileId = token.memberProfileId ?? null;
        session.user.phone = token.phone ?? null;
        session.user.isActive = token.isActive ?? true;
        session.user.memberStatus = (token.memberStatus as "ACTIVE" | "INACTIVE" | null) ?? null;
      }

      return session;
    },
  },
};

export function getServerAuthSession() {
  return getServerSession(authOptions);
}
