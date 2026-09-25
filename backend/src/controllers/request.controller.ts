import { Request, Response, NextFunction } from "express";
import { RequestService } from "../services/request.service.js";
import {
    createRequestSchema,
    updateRequestSchema,
    assignTechnicianSchema,
    scheduleVisitSchema,
    updateStatusSchema,
    markDuplicateSchema,
    requestClarificationSchema,
} from "../validators/request.validator.js";
import { HTTPSTATUS } from "../config/http.config.js";

export class RequestController {
    static async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const {
                status,
                priority,
                overdueOnly,
                unassignedOnly,
                needsClarificationOnly,
                waitingPartOnly,
                technicianId,
                search,
            } = req.query;

            const data = await RequestService.getAllRequests({
                status: status as string,
                priority: priority as string,
                overdueOnly: overdueOnly === 'true',
                unassignedOnly: unassignedOnly === 'true',
                needsClarificationOnly: needsClarificationOnly === 'true',
                waitingPartOnly: waitingPartOnly === 'true',
                technicianId: technicianId as string,
                search: search as string,
            });

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
            const data = await RequestService.getRequestById(id);
            if (!data) {
                return res.status(HTTPSTATUS.NOT_FOUND).json({
                    success: false,
                    message: `Request ${id} not found`,
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

    static async create(req: Request, res: Response, next: NextFunction) {
        try {
            const parsed = createRequestSchema.parse(req.body);
            const data = await RequestService.createRequest(parsed as any);

            res.status(HTTPSTATUS.CREATED).json({
                success: true,
                message: "Service request created successfully",
                data,
            });
        } catch (error) {
            next(error);
        }
    }

    static async update(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;
            const parsed = updateRequestSchema.parse(req.body);
            const data = await RequestService.updateRequest(id, parsed);

            res.status(HTTPSTATUS.OK).json({
                success: true,
                message: "Request updated successfully",
                data,
            });
        } catch (error) {
            next(error);
        }
    }

    static async assignTechnician(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;
            const { technicianId, scheduledAt, actorRole, actorName } = assignTechnicianSchema.parse(req.body);
            const data = await RequestService.assignTechnician(
                id,
                technicianId,
                scheduledAt,
                actorRole,
                actorName
            );

            res.status(HTTPSTATUS.OK).json({
                success: true,
                message: `Technician ${technicianId} assigned to request ${id}`,
                data,
            });
        } catch (error) {
            next(error);
        }
    }

    static async scheduleVisit(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;
            const { scheduledAt, actorRole, actorName } = scheduleVisitSchema.parse(req.body);
            const data = await RequestService.scheduleVisit(
                id,
                scheduledAt,
                actorRole,
                actorName
            );

            res.status(HTTPSTATUS.OK).json({
                success: true,
                message: `Visit scheduled for request ${id}`,
                data,
            });
        } catch (error) {
            next(error);
        }
    }

    static async updateStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;
            const { status, notes, actorRole, actorName } = updateStatusSchema.parse(req.body);
            const data = await RequestService.updateStatus(
                id,
                status,
                notes,
                actorRole,
                actorName
            );

            res.status(HTTPSTATUS.OK).json({
                success: true,
                message: `Request status updated to ${status}`,
                data,
            });
        } catch (error) {
            next(error);
        }
    }

    static async markDuplicate(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;
            const { duplicateOfId, actorRole, actorName } = markDuplicateSchema.parse(req.body);
            const data = await RequestService.markDuplicate(
                id,
                duplicateOfId,
                actorRole,
                actorName
            );

            res.status(HTTPSTATUS.OK).json({
                success: true,
                message: `Request ${id} marked as duplicate of ${duplicateOfId}`,
                data,
            });
        } catch (error) {
            next(error);
        }
    }

    static async requestClarification(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;
            const { clarificationNotes, actorRole, actorName } = requestClarificationSchema.parse(req.body);
            const data = await RequestService.requestClarification(
                id,
                clarificationNotes,
                actorRole,
                actorName
            );

            res.status(HTTPSTATUS.OK).json({
                success: true,
                message: `Clarification requested for request ${id}`,
                data,
            });
        } catch (error) {
            next(error);
        }
    }
}
