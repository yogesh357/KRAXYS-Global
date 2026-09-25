import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service.js";
import { HTTPSTATUS } from "../config/http.config.js";

export const getAllUsersController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const list = await AuthService.getAllUsers();
        res.status(HTTPSTATUS.OK).json({
            success: true,
            data: list,
        });
    } catch (error) {
        next(error);
    }
};

export const getProfileController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.query.userId as string) || "U1";
        const user = await AuthService.getUserById(userId);
        res.status(HTTPSTATUS.OK).json({
            success: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
};