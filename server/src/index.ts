import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import config from "./config.js";

// Route imports
import authRoutes from "./routes/auth.routes.js";
import membersRoutes from "./routes/members.routes.js";
import mealsRoutes from "./routes/meals.routes.js";
import bazarRoutes from "./routes/bazar.routes.js";
import rentRoutes from "./routes/rent.routes.js";
import expensesRoutes from "./routes/expenses.routes.js";
import depositsRoutes from "./routes/deposits.routes.js";
import noticesRoutes from "./routes/notices.routes.js";
import infoRoutes from "./routes/info.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import communityRoutes from "./routes/community.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import uploadRoutes from "./routes/upload.routes.js";

const app = express();

// Middleware
app.use(cors({
  origin: config.clientUrl,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/members", membersRoutes);
app.use("/api/meals", mealsRoutes);
app.use("/api/bazar", bazarRoutes);
app.use("/api/rent", rentRoutes);
app.use("/api/expenses", expensesRoutes);
app.use("/api/deposits", depositsRoutes);
app.use("/api/notices", noticesRoutes);
app.use("/api/important-info", infoRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/upload", uploadRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, message: "Internal server error." });
});

// Start server
app.listen(config.port, () => {
  console.log(`✅ MessMate API server running on http://localhost:${config.port}`);
  console.log(`   Client origin: ${config.clientUrl}`);
  console.log(`   Environment: ${config.nodeEnv}`);
});

export default app;
