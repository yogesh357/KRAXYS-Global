import { z } from "zod";

const phoneRegex = /^\+?[1-9]\d{9,14}$/;
const otpRegex = /^\d{6}$/;

export const passwordLoginSchema = z.object({
    identifier: z.string().trim().min(1, "Email or mobile number is required"),
    password: z.string().min(1, "Password is required"),
});

export const refreshTokenSchema = z.object({
    refreshToken: z.string().trim().min(1, "Refresh token is required"),
});

export type PasswordLoginSchemaType = z.infer<typeof passwordLoginSchema>;
export type RefreshTokenSchemaType = z.infer<typeof refreshTokenSchema>;
