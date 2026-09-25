import { db } from "../db/index.js";
import { technicians, serviceRequests, customers } from "../db/schema.js";
import { eq, desc, inArray } from "drizzle-orm";
import { isRequestOverdue, generateCustomerUpdate } from "../utils/domain.js";

export class TechnicianService {
    static async getAllTechnicians() {
        const techList = await db.select().from(technicians);
        const allRequests = await db
            .select({
                request: serviceRequests,
                customer: customers,
            })
            .from(serviceRequests)
            .leftJoin(customers, eq(serviceRequests.customerId, customers.id));

        return techList.map(tech => {
            const assignedJobs = allRequests.filter(
                r => r.request.technicianId === tech.id
            );

            const activeJobs = assignedJobs.filter(
                r => r.request.status === 'ASSIGNED' || r.request.status === 'IN_PROGRESS' || r.request.status === 'WAITING_PART'
            );

            const inProgressJobs = assignedJobs.filter(r => r.request.status === 'IN_PROGRESS');
            const resolvedJobs = assignedJobs.filter(r => r.request.status === 'RESOLVED');
            const urgentJobs = activeJobs.filter(r => r.request.priority === 'URGENT');

            return {
                ...tech,
                totalAssigned: assignedJobs.length,
                activeJobsCount: activeJobs.length,
                inProgressCount: inProgressJobs.length,
                resolvedCount: resolvedJobs.length,
                urgentCount: urgentJobs.length,
                currentWorkload: activeJobs.length === 0 ? 'AVAILABLE' : activeJobs.length >= 3 ? 'HIGH' : 'NORMAL',
            };
        });
    }


    static async getTechnicianById(id: string) {
        const rows = await db.select().from(technicians).where(eq(technicians.id, id)).limit(1);
        if (!rows.length) return null;
        return rows[0];
    }


    static async getTechnicianJobs(technicianId: string) {
        const rows = await db
            .select({
                request: serviceRequests,
                customer: customers,
            })
            .from(serviceRequests)
            .leftJoin(customers, eq(serviceRequests.customerId, customers.id))
            .where(eq(serviceRequests.technicianId, technicianId))
            .orderBy(desc(serviceRequests.receivedAt));

        return rows.map(({ request, customer }) => {
            const overdueInfo = isRequestOverdue({
                receivedAt: request.receivedAt,
                priority: request.priority,
                status: request.status,
                technicianId: request.technicianId,
                scheduledAt: request.scheduledAt,
            });

            return {
                ...request,
                customer,
                isOverdue: overdueInfo.isOverdue,
                overdueReason: overdueInfo.reason || null,
                customerUpdateMessage: generateCustomerUpdate({
                    id: request.id,
                    status: request.status,
                    technicianName: technicianId,
                    scheduledAt: request.scheduledAt,
                    equipmentId: request.equipmentId,
                }),
            };
        });
    }
}
