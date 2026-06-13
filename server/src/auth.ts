import jwt from "jsonwebtoken";
import { hash, compare } from "bcryptjs";

import config from "./config.js";
import type { AuthUser } from "../../shared/types.js";

export function signJwt(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      role: user.role,
      memberProfileId: user.memberProfileId,
      phone: user.phone,
      isActive: user.isActive,
      memberStatus: user.memberStatus,
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn },
  );
}

export function verifyJwt(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as AuthUser;
    return decoded;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 10);
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword);
}
