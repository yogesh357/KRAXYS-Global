import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { generateAccessToken, generateRefreshToken } from "./jwtTokens.js";

export const buildSafeUser = (
    user: typeof users.$inferSelect,
    roleKey?: string,
) => {
    const { password, otp, otpExpiresAt, refreshToken, ...safeUser } = user;
    return roleKey ? { ...safeUser, role: roleKey } : safeUser;
};

export const issueAuthTokens = async (userId: string) => {
    const accessToken = generateAccessToken(userId);
    const refreshToken = generateRefreshToken(userId);
    await db.update(users).set({ refreshToken }).where(eq(users.id, userId));
    return { accessToken, refreshToken };
};
