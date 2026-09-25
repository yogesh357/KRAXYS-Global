import { z } from "zod";

export const createRequestSchema = z.object({
    customerId: z.string().min(1, "Customer ID is required"),
    channel: z.enum(["EMAIL", "WHATSAPP", "PHONE"], {
        message: "Channel must be EMAIL, WHATSAPP, or PHONE",
    }),
    message: z.string().min(3, "Message must be at least 3 characters"),
    equipmentId: z.string().optional().nullable(),
    priority: z.enum(["URGENT", "HIGH", "NORMAL"]).default("NORMAL"),
    priorityReason: z.string().optional().nullable(),
    status: z.enum([
        "NEW",
        "NEEDS_CLARIFICATION",
        "ASSIGNED",
        "IN_PROGRESS",
        "WAITING_PART",
        "RESOLVED",
        "DUPLICATE",
    ]).default("NEW"),
    technicianId: z.string().optional().nullable(),
    scheduledAt: z.string().datetime().optional().nullable(),
    receivedAt: z.string().datetime().optional(),
    clarificationNotes: z.string().optional().nullable(),
    actorRole: z.string().default("COORDINATOR"),
    actorName: z.string().default("Coordinator"),
});

export const updateRequestSchema = z.object({
    priority: z.enum(["URGENT", "HIGH", "NORMAL"]).optional(),
    priorityReason: z.string().optional().nullable(),
    equipmentId: z.string().optional().nullable(),
    clarificationNotes: z.string().optional().nullable(),
    resolutionNotes: z.string().optional().nullable(),
    actorRole: z.string().default("COORDINATOR"),
    actorName: z.string().default("Coordinator"),
});

export const assignTechnicianSchema = z.object({
    technicianId: z.string().min(1, "Technician ID is required"),
    scheduledAt: z.string().datetime().optional().nullable(),
    actorRole: z.string().default("COORDINATOR"),
    actorName: z.string().default("Coordinator"),
});

export const scheduleVisitSchema = z.object({
    scheduledAt: z.string().datetime("Valid ISO datetime required"),
    actorRole: z.string().default("COORDINATOR"),
    actorName: z.string().default("Coordinator"),
});

export const updateStatusSchema = z.object({
    status: z.enum([
        "NEW",
        "NEEDS_CLARIFICATION",
        "ASSIGNED",
        "IN_PROGRESS",
        "WAITING_PART",
        "RESOLVED",
        "DUPLICATE",
    ]),
    notes: z.string().optional(),
    actorRole: z.string().default("COORDINATOR"),
    actorName: z.string().default("Coordinator"),
});

export const markDuplicateSchema = z.object({
    duplicateOfId: z.string().min(1, "Original request ID is required"),
    actorRole: z.string().default("COORDINATOR"),
    actorName: z.string().default("Coordinator"),
});

export const requestClarificationSchema = z.object({
    clarificationNotes: z.string().min(1, "Clarification details required"),
    actorRole: z.string().default("COORDINATOR"),
    actorName: z.string().default("Coordinator"),
});
