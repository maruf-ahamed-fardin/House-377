import type { Request, Response, NextFunction } from "express";

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ success: false, message: "Authentication required." });
    return;
  }

  if (req.user.role !== "ADMIN") {
    res.status(403).json({ success: false, message: "Admin access required." });
    return;
  }

  next();
}

export function requireSelfOrAdmin(userIdParam = "userId") {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required." });
      return;
    }

    const targetUserId = req.params[userIdParam] ?? req.body?.[userIdParam];

    if (req.user.role !== "ADMIN" && req.user.id !== targetUserId) {
      res.status(403).json({ success: false, message: "Access denied." });
      return;
    }

    next();
  };
}
