import "dotenv/config";
import { getEnv } from "../utils/get-env.js";

const envConfig = () => ({
  DATABASE_URL: process.env.DATABASE_URL || getEnv("DATABASE_URL", "postgresql://postgres:%40252302Yogesh@localhost:5432/atlas_industrial"),
  PORT: process.env.PORT || getEnv("PORT", "8080"),
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "jwt_access_secret_key",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "jwt_refresh_secret_key",
});

export const Env = envConfig();
