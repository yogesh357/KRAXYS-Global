import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";

export class AuthService {
    static async getAllUsers() {
        return db.select().from(users);
    }

    static async getUserById(id: string) {
        const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
        return rows[0] || null;
    }
}
