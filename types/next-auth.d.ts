import { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

type AppRole = "ADMIN" | "MEMBER";
type AppMemberStatus = "ACTIVE" | "INACTIVE";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: AppRole;
      memberProfileId?: string | null;
      phone?: string | null;
      isActive: boolean;
      memberStatus?: AppMemberStatus | null;
    };
  }

  interface User extends DefaultUser {
    role: AppRole;
    memberProfileId?: string | null;
    phone?: string | null;
    isActive: boolean;
    memberStatus?: AppMemberStatus | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: AppRole;
    memberProfileId?: string | null;
    phone?: string | null;
    isActive?: boolean;
    memberStatus?: AppMemberStatus | null;
  }
}
