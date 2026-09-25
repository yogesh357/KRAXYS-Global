import { Request, Response, NextFunction } from "express";
import { seedDatabase } from "../seeders/seed.js";
import { HTTPSTATUS } from "../config/http.config.js";

export class SeedController {
    static async resetAndSeed(req: Request, res: Response, next: NextFunction) {
        try {
            await seedDatabase();
            res.status(HTTPSTATUS.OK).json({
                success: true,
                message: "Database successfully reset and seeded with Atlas Industrial Services demo dataset.",
            });
        } catch (error) {

            
            next(error);
        }
    }
}
