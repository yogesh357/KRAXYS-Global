import { Request, Response, NextFunction } from "express";
import { db } from "../db/index.js";
import { customers } from "../db/schema.js";
import { HTTPSTATUS } from "../config/http.config.js";
import { asc } from "drizzle-orm";

export class CustomerController {
    static async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const list = await db.select().from(customers).orderBy(asc(customers.id));
            res.status(HTTPSTATUS.OK).json({
                success: true,
                data: list,
            });
        } catch (error) {
            next(error);
        }
    }
}
