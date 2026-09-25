import { Request, Response, NextFunction } from "express";
import { TechnicianService } from "../services/technician.service.js";
import { HTTPSTATUS } from "../config/http.config.js";

export class TechnicianController {
    static async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await TechnicianService.getAllTechnicians();
            res.status(HTTPSTATUS.OK).json({
                success: true,
                data,
            });
        } catch (error) {
            next(error);
        }
    }

    static async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;
            const data = await TechnicianService.getTechnicianById(id);
            if (!data) {
                return res.status(HTTPSTATUS.NOT_FOUND).json({
                    success: false,
                    message: `Technician ${id} not found`,
                });
            }
            res.status(HTTPSTATUS.OK).json({
                success: true,
                data,
            });
        } catch (error) {
            next(error);
        }
    }

    static async getJobs(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;
            const data = await TechnicianService.getTechnicianJobs(id);
            res.status(HTTPSTATUS.OK).json({
                success: true,
                data,
            });
        } catch (error) {
            next(error);
        }
    }
}
