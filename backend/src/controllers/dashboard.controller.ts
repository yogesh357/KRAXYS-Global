import { Request, Response, NextFunction } from "express";
import { DashboardService } from "../services/dashboard.service.js";
import { HTTPSTATUS } from "../config/http.config.js";

export class DashboardController {
    static async getCoordinator(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await DashboardService.getCoordinatorDashboard();
            res.status(HTTPSTATUS.OK).json({
                success: true,
                data,
            });
        } catch (error) {
            next(error);
        }
    }

    static async getManager(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await DashboardService.getManagerDashboard();
            res.status(HTTPSTATUS.OK).json({
                success: true,
                data,
            });
        } catch (error) {
            next(error);
        }
    }
}
