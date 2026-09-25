import { Request, Response, NextFunction } from "express";

export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
    // Assessment Demo Role Pass-through
    next();
};
