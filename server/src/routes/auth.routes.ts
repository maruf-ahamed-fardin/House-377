import { Router } from "express";

import { prisma } from "../prisma.js";
import { signJwt, comparePassword, hashPassword } from "../auth.js";
import { loginSchema } from "../../../shared/validations/auth.js";
import { registerSchema } from "../../../shared/validations/register.js";
import { authenticate } from "../middleware/authenticate.js";
import type { AuthUser } from "../../../shared/types.js";

const router = Router();

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: "Invalid credentials format." });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email.toLowerCase() },
      include: { memberProfile: true },
    });

    if (!user || !user.isActive) {
      res.status(401).json({ success: false, message: "Invalid email or password." });
      return;
    }

    if (user.memberProfile?.status === "INACTIVE") {
      res.status(401).json({ success: false, message: "Your account has been deactivated." });
      return;
    }

    if (!user.passwordHash) {
      res.status(401).json({ success: false, message: "Please sign in with Google." });
      return;
    }

    const isValid = await comparePassword(parsed.data.password, user.passwordHash);
    if (!isValid) {
      res.status(401).json({ success: false, message: "Invalid email or password." });
      return;
    }

    const authUser: AuthUser = {
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

    const token = signJwt(authUser);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({ success: true, data: { user: authUser, token } });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Login failed." });
  }
});

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: parsed.error.issues[0]?.message ?? "Invalid input." });
      return;
    }

    const existing = await prisma.user.findUnique({
      where: { email: parsed.data.email.toLowerCase() },
    });

    if (existing) {
      res.status(409).json({ success: false, message: "An account with this email already exists." });
      return;
    }

    const passwordHash = await hashPassword(parsed.data.password);

    await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email.toLowerCase(),
        passwordHash,
        role: "MEMBER",
        isActive: true,
      },
    });

    res.status(201).json({ success: true, data: { message: "Account created successfully." } });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ success: false, message: "Unable to create account." });
  }
});

// POST /api/auth/logout
router.post("/logout", (_req, res) => {
  res.clearCookie("token");
  res.json({ success: true, data: { message: "Logged out." } });
});

// GET /api/auth/me
router.get("/me", authenticate, async (req, res) => {
  // Refresh user data from DB in case role/status changed
  const dbUser = await prisma.user.findUnique({
    where: { id: req.user!.id },
    include: { memberProfile: true },
  });

  if (!dbUser || !dbUser.isActive) {
    res.clearCookie("token");
    res.status(401).json({ success: false, message: "Account not found or deactivated." });
    return;
  }

  const authUser: AuthUser = {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    image: dbUser.image,
    role: dbUser.role,
    memberProfileId: dbUser.memberProfile?.id ?? null,
    phone: dbUser.phone,
    isActive: dbUser.isActive,
    memberStatus: dbUser.memberProfile?.status ?? null,
  };

  res.json({ success: true, data: { user: authUser } });
});

export default router;
