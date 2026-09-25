import { InferSelectModel } from "drizzle-orm";
import { users } from "../db/schema.ts";
import { Scope } from "../constants/permissions.js";

type DBUser = InferSelectModel<typeof users>;


export type UserId = typeof users.$inferSelect.id;

declare global {
    namespace Express {
        interface User extends DBUser {
            role: string;
        }
        interface Request {
            user?: User,
            permissionScope?: Scope;
        }
    }
}

export { }; 