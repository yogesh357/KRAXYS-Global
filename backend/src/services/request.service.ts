import { db } from "../db/index.js";
import {
    serviceRequests,
    customers,
    technicians,
    requestActivities,
} from "../db/schema.js";
import { eq, desc, asc, and, ilike, or, sql } from "drizzle-orm";
import {
    DEMO_NOW,
    isRequestOverdue,
    detectDuplicateCandidate,
    generateCustomerUpdate,
    inferPriorityAndStatus,
} from "../utils/domain.js";
import { nanoid } from "nanoid";

export class RequestService {
    /**
     * Fetch all requests enriched with customer details, technician info, and overdue flags
     */
    static async getAllRequests(filter?: {
        status?: string;
        priority?: string;
        overdueOnly?: boolean;
        unassignedOnly?: boolean;
        needsClarificationOnly?: boolean;
        waitingPartOnly?: boolean;
        technicianId?: string;
        search?: string;
    }) {
        const rows = await db
            .select({
                request: serviceRequests,
                customer: customers,
                technician: technicians,
            })
            .from(serviceRequests)
            .leftJoin(customers, eq(serviceRequests.customerId, customers.id))
            .leftJoin(technicians, eq(serviceRequests.technicianId, technicians.id))
            .orderBy(desc(serviceRequests.receivedAt));

        let enriched = rows.map(({ request, customer, technician }) => {
            const overdueInfo = isRequestOverdue({
                receivedAt: request.receivedAt,
                priority: request.priority,
                status: request.status,
                technicianId: request.technicianId,
                scheduledAt: request.scheduledAt,
            });

            const customerUpdateMessage = generateCustomerUpdate({
                id: request.id,
                status: request.status,
                technicianName: technician?.name,
                scheduledAt: request.scheduledAt,
                equipmentId: request.equipmentId,
            });

            return {
                ...request,
                customer,
                technician,
                isOverdue: overdueInfo.isOverdue,
                overdueReason: overdueInfo.reason || null,
                customerUpdateMessage,
            };
        });

        // Apply in-memory or query filters
        if (filter?.status && filter.status !== 'ALL') {
            enriched = enriched.filter(r => r.status === filter.status);
        }
        if (filter?.priority && filter.priority !== 'ALL') {
            enriched = enriched.filter(r => r.priority === filter.priority);
        }
        if (filter?.overdueOnly) {
            enriched = enriched.filter(r => r.isOverdue);
        }
        if (filter?.unassignedOnly) {
            enriched = enriched.filter(r => !r.technicianId && r.status !== 'RESOLVED' && r.status !== 'DUPLICATE');
        }
        if (filter?.needsClarificationOnly) {
            enriched = enriched.filter(r => r.status === 'NEEDS_CLARIFICATION');
        }
        if (filter?.waitingPartOnly) {
            enriched = enriched.filter(r => r.status === 'WAITING_PART');
        }
        if (filter?.technicianId) {
            enriched = enriched.filter(r => r.technicianId === filter.technicianId);
        }
        if (filter?.search) {
            const q = filter.search.toLowerCase();
            enriched = enriched.filter(r => 
                r.id.toLowerCase().includes(q) ||
                (r.customer?.name && r.customer.name.toLowerCase().includes(q)) ||
                r.customerId.toLowerCase().includes(q) ||
                r.message.toLowerCase().includes(q) ||
                (r.equipmentId && r.equipmentId.toLowerCase().includes(q))
            );
        }

        return enriched;
    }

    /**
     * Fetch single request by ID with timeline activities
     */
    static async getRequestById(id: string) {
        const rows = await db
            .select({
                request: serviceRequests,
                customer: customers,
                technician: technicians,
            })
            .from(serviceRequests)
            .leftJoin(customers, eq(serviceRequests.customerId, customers.id))
            .leftJoin(technicians, eq(serviceRequests.technicianId, technicians.id))
            .where(eq(serviceRequests.id, id))
            .limit(1);

        if (!rows.length) {
            return null;
        }

        const { request, customer, technician } = rows[0];

        const activities = await db
            .select()
            .from(requestActivities)
            .where(eq(requestActivities.requestId, id))
            .orderBy(asc(requestActivities.createdAt));

        const overdueInfo = isRequestOverdue({
            receivedAt: request.receivedAt,
            priority: request.priority,
            status: request.status,
            technicianId: request.technicianId,
            scheduledAt: request.scheduledAt,
        });

        const customerUpdateMessage = generateCustomerUpdate({
            id: request.id,
            status: request.status,
            technicianName: technician?.name,
            scheduledAt: request.scheduledAt,
            equipmentId: request.equipmentId,
        });

        // If marked as duplicate, optionally fetch original request
        let originalRequest: any = null;
        if (request.duplicateOfId) {
            const origRows = await db
                .select()
                .from(serviceRequests)
                .where(eq(serviceRequests.id, request.duplicateOfId))
                .limit(1);
            if (origRows.length) originalRequest = origRows[0];
        }

        // If possible duplicate detected, fetch candidate summary
        let possibleDuplicateRequest: any = null;
        if (request.possibleDuplicateId) {
            const candRows = await db
                .select()
                .from(serviceRequests)
                .where(eq(serviceRequests.id, request.possibleDuplicateId))
                .limit(1);
            if (candRows.length) possibleDuplicateRequest = candRows[0];
        }

        return {
            ...request,
            customer,
            technician,
            isOverdue: overdueInfo.isOverdue,
            overdueReason: overdueInfo.reason || null,
            customerUpdateMessage,
            activities,
            originalRequest,
            possibleDuplicateRequest,
        };
    }

    /**
     * Create a new manually captured service request
     */
    static async createRequest(data: {
        id?: string;
        customerId: string;
        channel: string;
        message: string;
        equipmentId?: string | null;
        priority?: 'URGENT' | 'HIGH' | 'NORMAL';
        priorityReason?: string | null;
        status?: string;
        technicianId?: string | null;
        scheduledAt?: string | Date | null;
        receivedAt?: string | Date;
        clarificationNotes?: string | null;
        actorRole?: string;
        actorName?: string;
    }) {
        // Generate new ID if not provided, e.g. R109, R110
        let requestId = data.id;
        if (!requestId) {
            const allReqs = await db.select({ id: serviceRequests.id }).from(serviceRequests);
            const numbers = allReqs
                .map(r => parseInt(r.id.replace(/\D/g, ''), 10))
                .filter(n => !isNaN(n));
            const nextNum = numbers.length ? Math.max(...numbers) + 1 : 101;
            requestId = `R${nextNum}`;
        }

        // Check for duplicate candidates against existing requests
        const existingList = await db.select().from(serviceRequests);
        const duplicateCandidate = detectDuplicateCandidate(
            {
                id: requestId,
                customerId: data.customerId,
                message: data.message,
                receivedAt: data.receivedAt || DEMO_NOW,
            },
            existingList as any
        );

        // Infer priority and suggestions if not explicitly specified
        let priority = data.priority || 'NORMAL';
        let priorityReason = data.priorityReason || null;
        let status = data.status || 'NEW';
        let clarificationNotes = data.clarificationNotes || null;

        if (!data.priority || data.priority === 'NORMAL') {
            const inferred = inferPriorityAndStatus(data.message, data.equipmentId);
            priority = inferred.priority;
            priorityReason = inferred.priorityReason;
            if (inferred.suggestedStatus === 'NEEDS_CLARIFICATION' && !data.status) {
                status = 'NEEDS_CLARIFICATION';
                clarificationNotes = inferred.clarificationReason || null;
            }
        }

        const receivedAtDate = data.receivedAt ? new Date(data.receivedAt) : DEMO_NOW;
        const scheduledAtDate = data.scheduledAt ? new Date(data.scheduledAt) : null;

        await db.insert(serviceRequests).values({
            id: requestId,
            customerId: data.customerId,
            channel: data.channel,
            message: data.message,
            equipmentId: data.equipmentId || null,
            priority,
            priorityReason,
            status,
            technicianId: data.technicianId || null,
            scheduledAt: scheduledAtDate,
            receivedAt: receivedAtDate,
            possibleDuplicateId: duplicateCandidate ? duplicateCandidate.id : null,
            clarificationNotes,
            createdAt: DEMO_NOW,
            updatedAt: DEMO_NOW,
        });

        // Add initial creation activity
        await this.addActivity({
            requestId,
            actorRole: data.actorRole || 'COORDINATOR',
            actorName: data.actorName || 'Coordinator',
            action: 'CREATED',
            details: `Request created via ${data.channel}. Priority set to ${priority}.${duplicateCandidate ? ` Flagged as possible duplicate of ${duplicateCandidate.id}.` : ''}`,
            createdAt: DEMO_NOW,
        });

        if (data.technicianId) {
            await this.addActivity({
                requestId,
                actorRole: data.actorRole || 'COORDINATOR',
                actorName: data.actorName || 'Coordinator',
                action: 'ASSIGNED',
                details: `Assigned to technician ${data.technicianId}${scheduledAtDate ? ` for ${scheduledAtDate.toISOString()}` : ''}.`,
                createdAt: DEMO_NOW,
            });
        }

        return this.getRequestById(requestId);
    }

    /**
     * Assign a technician to a request
     */
    static async assignTechnician(
        requestId: string,
        technicianId: string,
        scheduledAt?: string | null,
        actorRole = 'COORDINATOR',
        actorName = 'Coordinator'
    ) {
        const req = await this.getRequestById(requestId);
        if (!req) throw new Error(`Request ${requestId} not found`);

        const scheduledDate = scheduledAt ? new Date(scheduledAt) : req.scheduledAt ? new Date(req.scheduledAt) : null;
        const newStatus = req.status === 'NEW' || req.status === 'NEEDS_CLARIFICATION' ? 'ASSIGNED' : req.status;

        await db
            .update(serviceRequests)
            .set({
                technicianId,
                scheduledAt: scheduledDate,
                status: newStatus,
                updatedAt: DEMO_NOW,
            })
            .where(eq(serviceRequests.id, requestId));

        // Update technician active status if appropriate
        await db
            .update(technicians)
            .set({ status: 'ON_JOB', updatedAt: DEMO_NOW })
            .where(eq(technicians.id, technicianId));

        await this.addActivity({
            requestId,
            actorRole,
            actorName,
            action: 'ASSIGNED',
            details: `Assigned to technician ${technicianId}.${scheduledDate ? ` Scheduled for ${scheduledDate.toISOString()}` : ' Visit time pending scheduling.'}`,
            createdAt: DEMO_NOW,
        });

        return this.getRequestById(requestId);
    }

    /**
     * Schedule or reschedule a visit
     */
    static async scheduleVisit(
        requestId: string,
        scheduledAt: string,
        actorRole = 'COORDINATOR',
        actorName = 'Coordinator'
    ) {
        const req = await this.getRequestById(requestId);
        if (!req) throw new Error(`Request ${requestId} not found`);

        const scheduledDate = new Date(scheduledAt);

        await db
            .update(serviceRequests)
            .set({
                scheduledAt: scheduledDate,
                updatedAt: DEMO_NOW,
            })
            .where(eq(serviceRequests.id, requestId));

        await this.addActivity({
            requestId,
            actorRole,
            actorName,
            action: 'SCHEDULED',
            details: `Visit scheduled for ${scheduledDate.toLocaleString('en-GB', { timeZone: 'UTC' })} UTC.`,
            createdAt: DEMO_NOW,
        });

        return this.getRequestById(requestId);
    }

    /**
     * Update request status
     */
    static async updateStatus(
        requestId: string,
        newStatus: string,
        notes?: string,
        actorRole = 'COORDINATOR',
        actorName = 'Coordinator'
    ) {
        const req = await this.getRequestById(requestId);
        if (!req) throw new Error(`Request ${requestId} not found`);

        const updatePayload: any = {
            status: newStatus,
            updatedAt: DEMO_NOW,
        };

        if (newStatus === 'RESOLVED' && notes) {
            updatePayload.resolutionNotes = notes;
        }

        await db
            .update(serviceRequests)
            .set(updatePayload)
            .where(eq(serviceRequests.id, requestId));

        let actionLabel = 'STATUS_UPDATED';
        if (newStatus === 'IN_PROGRESS') actionLabel = 'JOB_STARTED';
        if (newStatus === 'RESOLVED') actionLabel = 'JOB_RESOLVED';
        if (newStatus === 'WAITING_PART') actionLabel = 'WAITING_PART';

        await this.addActivity({
            requestId,
            actorRole,
            actorName,
            action: actionLabel,
            details: `Status transitioned from ${req.status} to ${newStatus}.${notes ? ` Note: ${notes}` : ''}`,
            createdAt: DEMO_NOW,
        });

        return this.getRequestById(requestId);
    }

    /**
     * Mark request as duplicate
     */
    static async markDuplicate(
        requestId: string,
        duplicateOfId: string,
        actorRole = 'COORDINATOR',
        actorName = 'Coordinator'
    ) {
        const req = await this.getRequestById(requestId);
        if (!req) throw new Error(`Request ${requestId} not found`);

        await db
            .update(serviceRequests)
            .set({
                status: 'DUPLICATE',
                duplicateOfId,
                updatedAt: DEMO_NOW,
            })
            .where(eq(serviceRequests.id, requestId));

        await this.addActivity({
            requestId,
            actorRole,
            actorName,
            action: 'DUPLICATE_MARKED',
            details: `Flagged and marked as duplicate of primary request ${duplicateOfId}.`,
            createdAt: DEMO_NOW,
        });

        return this.getRequestById(requestId);
    }

    /**
     * Request clarification from customer
     */
    static async requestClarification(
        requestId: string,
        clarificationNotes: string,
        actorRole = 'COORDINATOR',
        actorName = 'Coordinator'
    ) {
        const req = await this.getRequestById(requestId);
        if (!req) throw new Error(`Request ${requestId} not found`);

        await db
            .update(serviceRequests)
            .set({
                status: 'NEEDS_CLARIFICATION',
                clarificationNotes,
                updatedAt: DEMO_NOW,
            })
            .where(eq(serviceRequests.id, requestId));

        await this.addActivity({
            requestId,
            actorRole,
            actorName,
            action: 'CLARIFICATION_REQUESTED',
            details: `Clarification requested: ${clarificationNotes}`,
            createdAt: DEMO_NOW,
        });

        return this.getRequestById(requestId);
    }

    /**
     * Update request attributes (priority, equipment ID, notes)
     */
    static async updateRequest(
        requestId: string,
        data: {
            priority?: string;
            priorityReason?: string | null;
            equipmentId?: string | null;
            clarificationNotes?: string | null;
            resolutionNotes?: string | null;
            actorRole?: string;
            actorName?: string;
        }
    ) {
        const req = await this.getRequestById(requestId);
        if (!req) throw new Error(`Request ${requestId} not found`);

        const updatePayload: any = {
            updatedAt: DEMO_NOW,
        };

        if (data.priority) updatePayload.priority = data.priority;
        if (data.priorityReason !== undefined) updatePayload.priorityReason = data.priorityReason;
        if (data.equipmentId !== undefined) updatePayload.equipmentId = data.equipmentId;
        if (data.clarificationNotes !== undefined) updatePayload.clarificationNotes = data.clarificationNotes;
        if (data.resolutionNotes !== undefined) updatePayload.resolutionNotes = data.resolutionNotes;

        await db
            .update(serviceRequests)
            .set(updatePayload)
            .where(eq(serviceRequests.id, requestId));

        await this.addActivity({
            requestId,
            actorRole: data.actorRole || 'COORDINATOR',
            actorName: data.actorName || 'Coordinator',
            action: 'UPDATED',
            details: `Request details updated.${data.priority ? ` Priority: ${data.priority}.` : ''}${data.equipmentId ? ` Equipment ID: ${data.equipmentId}.` : ''}`,
            createdAt: DEMO_NOW,
        });

        return this.getRequestById(requestId);
    }

    /**
     * Add activity log entry
     */
    static async addActivity(data: {
        requestId: string;
        actorRole: string;
        actorName: string;
        action: string;
        details?: string | null;
        createdAt?: Date;
    }) {
        await db.insert(requestActivities).values({
            id: nanoid(),
            requestId: data.requestId,
            actorRole: data.actorRole,
            actorName: data.actorName,
            action: data.action,
            details: data.details || null,
            createdAt: data.createdAt || DEMO_NOW,
        });
    }
}
