const config = {
  port: parseInt(process.env.PORT ?? "4000", 10),
  databaseUrl: process.env.DATABASE_URL!,
  jwtSecret: process.env.JWT_SECRET ?? process.env.AUTH_SECRET ?? "messmate-dev-secret",
  jwtExpiresIn: "7d",
  clientUrl: process.env.CLIENT_URL ?? "http://localhost:3000",
  nodeEnv: process.env.NODE_ENV ?? "development",
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
};

export default config;
