import dotenv from "dotenv";
dotenv.config();

const port = Number(process.env.PORT);
if (isNaN(port)) {
  throw new Error(`Invalid port value: ${port}`);
}

function validateEnv(name: string): string {
  const value = process.env[name];
  console.log(`Validating environment variable: ${name}`);

  if (!value) {
    throw new Error(`Missing value in ${name}`);
  }

  return value;
}

export const env = {
  port,
  isProduction: (process.env.NODE_ENV ?? "development") === "production",
  nodeEnv: process.env.NODE_ENV ?? "development",
  logLevel:
    process.env.LOG_LEVEL ??
    ((process.env.NODE_ENV ?? "development") === "production"
      ? "info"
      : "debug"),
  databaseURL: validateEnv("DATABASE_URL"),
  JWT_SECRET_KEY: validateEnv("JWT_SECRET_KEY"),
} as const;
