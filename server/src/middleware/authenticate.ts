import type { Request, Response, NextFunction } from "express";

import { verifyJwt } from "../auth.js";
import type { AuthUser } from "../../../shared/types.js";

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  // Try Authorization header first
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.slice(7);
  }

  // Fall back to cookie
  if (!token && req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    res.status(401).json({ success: false, message: "Authentication required." });
    return;
  }

  const user = verifyJwt(token);

  if (!user) {
    res.status(401).json({ success: false, message: "Invalid or expired token." });
    return;
  }

  req.user = user;
  next();
}
