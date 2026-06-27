import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// The Express server runs with its cwd set to `server/`, but the project's
// `.env` lives at the repo root. Prisma's CLI loads it for migrations, but the
// runtime process does not get it automatically — so load it explicitly here.
// Resolves the same whether running from src/ (tsx) or dist/ (built): ../../.env
// Only loads when the value isn't already provided by the real environment, so
// shell/production env vars always win.
if (!process.env.DATABASE_URL) {
  const rootEnvPath = resolve(dirname(fileURLToPath(import.meta.url)), "../../.env");
  if (existsSync(rootEnvPath)) {
    process.loadEnvFile(rootEnvPath);
  }
}

const config = {
  port: parseInt(process.env.PORT ?? "4000", 10),
  databaseUrl: process.env.DATABASE_URL!,
  jwtSecret: process.env.JWT_SECRET ?? process.env.AUTH_SECRET ?? "messmate-dev-secret",
  jwtExpiresIn: "7d",
  clientUrl: process.env.CLIENT_URL ?? "http://localhost:3000",
  nodeEnv: process.env.NODE_ENV ?? "development",
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  geminiApiKey: process.env.GEMINI_API_KEY,
  geminiModel: process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
};

export default config;
