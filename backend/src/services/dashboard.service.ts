import { RequestService } from "./request.service.js";
import { TechnicianService } from "./technician.service.js";
import { DEMO_NOW } from "../utils/domain.js";

export class DashboardService {
    static async getCoordinatorDashboard() {
        const allRequests = await RequestService.getAllRequests();
        const technicians = await TechnicianService.getAllTechnicians();

        const activeRequests = allRequests.filter(
            r => r.status !== 'RESOLVED' && r.status !== 'DUPLICATE'
        );

        const urgentRequests = activeRequests.filter(r => r.priority === 'URGENT');
        const unassignedRequests = activeRequests.filter(r => !r.technicianId);
        const needsClarificationRequests = activeRequests.filter(r => r.status === 'NEEDS_CLARIFICATION');
        const overdueRequests = activeRequests.filter(r => r.isOverdue);
        const waitingPartRequests = activeRequests.filter(r => r.status === 'WAITING_PART');
        const inProgressRequests = activeRequests.filter(r => r.status === 'IN_PROGRESS');
        const possibleDuplicateRequests = activeRequests.filter(r => !!r.possibleDuplicateId && r.status === 'NEW');

        // Build prioritized "Needs Attention" actionable items
        const needsAttentionItems = [
            // 1. Urgent & Unassigned (Highest Priority)
            ...urgentRequests.filter(r => !r.technicianId).map(r => ({
                requestId: r.id,
                title: r.message,
                customer: r.customer?.name || r.customerId,
                priority: r.priority,
                status: r.status,
                actionType: 'ASSIGN_TECHNICIAN',
                actionLabel: 'Assign Technician',
                badgeText: 'Urgent Unassigned',
                badgeVariant: 'urgent',
                overdue: r.isOverdue,
                receivedAt: r.receivedAt,
                equipmentId: r.equipmentId,
            })),
            // 2. Assigned but visit unscheduled
            ...activeRequests.filter(r => r.technicianId && !r.scheduledAt && r.status === 'ASSIGNED').map(r => ({
                requestId: r.id,
                title: r.message,
                customer: r.customer?.name || r.customerId,
                priority: r.priority,
                status: r.status,
                technicianName: r.technician?.name || r.technicianId,
                actionType: 'SCHEDULE_VISIT',
                actionLabel: 'Schedule Visit',
                badgeText: 'Visit Unscheduled',
                badgeVariant: 'warning',
                overdue: r.isOverdue,
                receivedAt: r.receivedAt,
                equipmentId: r.equipmentId,
            })),
            // 3. Needs clarification
            ...needsClarificationRequests.map(r => ({
                requestId: r.id,
                title: r.message,
                customer: r.customer?.name || r.customerId,
                priority: r.priority,
                status: r.status,
                actionType: 'REQUEST_CLARIFICATION',
                actionLabel: 'Review Clarification',
                badgeText: 'Needs Clarification',
                badgeVariant: 'clarification',
                clarificationNotes: r.clarificationNotes,
                overdue: r.isOverdue,
                receivedAt: r.receivedAt,
                equipmentId: r.equipmentId,
            })),
            // 4. Possible duplicate detected
            ...possibleDuplicateRequests.map(r => ({
                requestId: r.id,
                title: r.message,
                customer: r.customer?.name || r.customerId,
                priority: r.priority,
                status: r.status,
                possibleDuplicateId: r.possibleDuplicateId,
                actionType: 'RESOLVE_DUPLICATE',
                actionLabel: 'Triage Duplicate',
                badgeText: `Possible Duplicate of ${r.possibleDuplicateId}`,
                badgeVariant: 'secondary',
                overdue: r.isOverdue,
                receivedAt: r.receivedAt,
                equipmentId: r.equipmentId,
            })),
            // 5. Waiting for part
            ...waitingPartRequests.map(r => ({
                requestId: r.id,
                title: r.message,
                customer: r.customer?.name || r.customerId,
                priority: r.priority,
                status: r.status,
                technicianName: r.technician?.name || r.technicianId,
                actionType: 'UPDATE_STATUS',
                actionLabel: 'Update Status',
                badgeText: 'Waiting for Part',
                badgeVariant: 'warning',
                overdue: r.isOverdue,
                receivedAt: r.receivedAt,
                equipmentId: r.equipmentId,
            })),
        ];

        const seenIds = new Set<string>();
        const uniqueNeedsAttention = needsAttentionItems.filter(item => {
            if (seenIds.has(item.requestId)) return false;
            seenIds.add(item.requestId);
            return true;
        });

        return {
            demoNow: DEMO_NOW,
            stats: {
                totalRequests: allRequests.length,
                activeRequests: activeRequests.length,
                urgentCount: urgentRequests.length,
                unassignedCount: unassignedRequests.length,
                needsClarificationCount: needsClarificationRequests.length,
                overdueCount: overdueRequests.length,
                waitingPartCount: waitingPartRequests.length,
                inProgressCount: inProgressRequests.length,
                resolvedCount: allRequests.filter(r => r.status === 'RESOLVED').length,
                duplicateCount: allRequests.filter(r => r.status === 'DUPLICATE').length,
            },
            needsAttention: uniqueNeedsAttention,
            technicians,
            recentRequests: allRequests.slice(0, 8),
        };
    }
    static async getManagerDashboard() {
        const allRequests = await RequestService.getAllRequests();
        const technicians = await TechnicianService.getAllTechnicians();

        const activeRequests = allRequests.filter(
            r => r.status !== 'RESOLVED' && r.status !== 'DUPLICATE'
        );

        const urgentCount = activeRequests.filter(r => r.priority === 'URGENT').length;
        const unassignedCount = activeRequests.filter(r => !r.technicianId).length;
        const overdueRequests = activeRequests.filter(r => r.isOverdue);
        const waitingPartCount = activeRequests.filter(r => r.status === 'WAITING_PART').length;
        const inProgressCount = activeRequests.filter(r => r.status === 'IN_PROGRESS').length;
        const resolvedCount = allRequests.filter(r => r.status === 'RESOLVED').length;

        let healthStatus = 'CONTROLLED';
        let healthScore = 95;
        if (overdueRequests.length > 0) {
            healthScore -= overdueRequests.length * 15;
        }
        if (urgentCount > 1) {
            healthScore -= urgentCount * 10;
        }
        if (healthScore < 70) healthStatus = 'ATTENTION_REQUIRED'

        if (healthScore < 50) healthStatus = 'CRITICAL'

        const exceptions = [
            ...overdueRequests.map(r => ({
                id: r.id,
                type: 'OVERDUE',
                severity: 'CRITICAL',
                title: `Request ${r.id} is Overdue`,
                description: r.overdueReason || 'Response SLA threshold exceeded',
                customer: r.customer?.name || r.customerId,
                priority: r.priority,
                technicianName: r.technician?.name || 'Unassigned',
                status: r.status,
            })),
            ...activeRequests.filter(r => r.priority === 'URGENT' && !r.technicianId).map(r => ({
                id: r.id,
                type: 'UNASSIGNED_URGENT',
                severity: 'HIGH',
                title: `Urgent Request Unassigned: ${r.id}`,
                description: r.priorityReason || 'High-impact equipment fault requiring prompt technician dispatch',
                customer: r.customer?.name || r.customerId,
                priority: r.priority,
                technicianName: 'None',
                status: r.status,
            })),
            ...activeRequests.filter(r => r.status === 'WAITING_PART').map(r => ({
                id: r.id,
                type: 'WAITING_PART',
                severity: 'MEDIUM',
                title: `Job ${r.id} Stalled on Parts`,
                description: `Assigned to ${r.technician?.name || r.technicianId} - Awaiting replacement component`,
                customer: r.customer?.name || r.customerId,
                priority: r.priority,
                technicianName: r.technician?.name || r.technicianId || 'Unassigned',
                status: r.status,
            })),
        ];

        // Deduplicate exceptions
        const seenExpIds = new Set<string>();
        const uniqueExceptions = exceptions.filter(e => {
            if (seenExpIds.has(e.id)) return false;
            seenExpIds.add(e.id);
            return true;
        });

        return {
            demoNow: DEMO_NOW,
            health: {
                status: healthStatus,
                score: Math.max(0, healthScore),
            },
            stats: {
                openRequestsCount: activeRequests.length,
                urgentCount,
                unassignedCount,
                overdueCount: overdueRequests.length,
                waitingPartCount,
                inProgressCount,
                resolvedCount,
                totalRequests: allRequests.length,
            },
            technicianWorkload: technicians,
            exceptions: uniqueExceptions,
            allActiveRequests: activeRequests,
        };
    }
}
