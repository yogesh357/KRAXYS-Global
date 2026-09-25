import "dotenv/config";
import { getEnv } from "../utils/get-env.js";

const envConfig = () => ({
  DATABASE_URL: process.env.DATABASE_URL || getEnv("DATABASE_URL", "postgresql://postgres:%40252302Yogesh@localhost:5432/atlas_industrial"),
  PORT: process.env.PORT || getEnv("PORT", "8080"),
});

export const Env = envConfig();
