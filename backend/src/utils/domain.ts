/**
 * Domain Logic & Business Rules for Atlas Industrial Services MVP
 */

// Assessment Fixed Demo Clock: 01 October 2026, 09:00 AM UTC
export const DEMO_NOW = new Date("2026-10-01T09:00:00.000Z");

export type Priority = 'URGENT' | 'HIGH' | 'NORMAL';
export type RequestStatus = 
    | 'NEW'
    | 'NEEDS_CLARIFICATION'
    | 'ASSIGNED'
    | 'IN_PROGRESS'
    | 'WAITING_PART'
    | 'RESOLVED'
    | 'DUPLICATE';

export type Channel = 'EMAIL' | 'WHATSAPP' | 'PHONE';

export interface ServiceRequestRecord {
    id: string;
    customerId: string;
    channel: string;
    message: string;
    equipmentId: string | null;
    priority: string;
    priorityReason: string | null;
    status: string;
    technicianId: string | null;
    scheduledAt: Date | string | null;
    receivedAt: Date | string;
    duplicateOfId?: string | null;
    possibleDuplicateId?: string | null;
    clarificationNotes?: string | null;
    resolutionNotes?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

/**
 * Overdue Check (Demo Assumption)
 * SLA Policy:
 * - URGENT: Must be assigned & scheduled within 2 hours of received time.
 * - HIGH: Must be assigned within 4 hours.
 * - NORMAL: Must be addressed within 24 hours.
 * - If scheduledAt is in the past relative to DEMO_NOW and not IN_PROGRESS or RESOLVED, it is overdue.
 * - If WAITING_PART > 24 hours without resolution, flagged as overdue/escalation.
 */
export function isRequestOverdue(req: {
    receivedAt: Date | string;
    priority: string;
    status: string;
    technicianId?: string | null;
    scheduledAt?: Date | string | null;
    now?: Date;
}): { isOverdue: boolean; reason?: string } {
    const now = req.now || DEMO_NOW;
    const received = new Date(req.receivedAt);
    const elapsedHours = (now.getTime() - received.getTime()) / (1000 * 60 * 60);

    // Resolved or duplicate requests are not overdue
    if (req.status === 'RESOLVED' || req.status === 'DUPLICATE') {
        return { isOverdue: false };
    }

    if (req.priority === 'URGENT') {
        if (!req.technicianId && elapsedHours > 2) {
            return { isOverdue: true, reason: `Urgent request unassigned for > 2h (${elapsedHours.toFixed(1)}h elapsed)` };
        }
        if (req.technicianId && !req.scheduledAt && elapsedHours > 2) {
            return { isOverdue: true, reason: `Urgent visit unscheduled for > 2h (${elapsedHours.toFixed(1)}h elapsed)` };
        }
    }

    if (req.priority === 'HIGH' && !req.technicianId && elapsedHours > 4) {
        return { isOverdue: true, reason: `High priority unassigned for > 4h (${elapsedHours.toFixed(1)}h elapsed)` };
    }

    if (req.priority === 'NORMAL' && !req.technicianId && elapsedHours > 24) {
        return { isOverdue: true, reason: `Normal request unassigned for > 24h (${elapsedHours.toFixed(1)}h elapsed)` };
    }

    // If scheduled in the past relative to DEMO_NOW and still only ASSIGNED
    if (req.scheduledAt) {
        const scheduled = new Date(req.scheduledAt);
        if (scheduled.getTime() < now.getTime() && req.status === 'ASSIGNED') {
            return { isOverdue: true, reason: `Scheduled visit time passed without job being started` };
        }
    }

    if (req.status === 'WAITING_PART' && elapsedHours > 24) {
        return { isOverdue: true, reason: `Waiting for parts for > 24 hours` };
    }

    return { isOverdue: false };
}

/**
 * Deterministic Duplicate Detection
 * Rule: Same customer + received within 48h + similar keywords or mentions
 */
export function detectDuplicateCandidate(
    newReq: { customerId: string; message: string; receivedAt: Date | string; id?: string },
    existingRequests: ServiceRequestRecord[]
): ServiceRequestRecord | null {
    const newReceived = new Date(newReq.receivedAt).getTime();
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
    const newTokens = new Set(normalize(newReq.message).split(/\s+/).filter(w => w.length > 3));

    for (const ex of existingRequests) {
        if (newReq.id && ex.id === newReq.id) continue;
        if (ex.customerId !== newReq.customerId) continue;
        if (ex.status === 'DUPLICATE') continue;

        const exReceived = new Date(ex.receivedAt).getTime();
        const diffHours = Math.abs(newReceived - exReceived) / (1000 * 60 * 60);

        if (diffHours <= 48) {
            const exTokens = normalize(ex.message).split(/\s+/).filter(w => w.length > 3);
            const matches = exTokens.filter(t => newTokens.has(t));
            
            // Common keyword match or explicitly referencing earlier fault/request
            const hasFollowUpKeyword = 
                newReq.message.toLowerCase().includes('follow') || 
                newReq.message.toLowerCase().includes('yesterday') ||
                newReq.message.toLowerCase().includes('again') ||
                newReq.message.toLowerCase().includes('earlier') ||
                matches.length >= 2;

            if (hasFollowUpKeyword && (matches.length > 0 || diffHours <= 24)) {
                return ex;
            }
        }
    }

    return null;
}

/**
 * Priority Suggestion Heuristic (Demo Assumptions)
 * Rules:
 * - Product/stock damage, temperature fault, refrigeration failure -> URGENT
 * - Equipment failure, stop, breakdown -> HIGH
 * - Routine inspection, scheduled maintenance -> NORMAL
 * - Missing critical context -> NEEDS_CLARIFICATION flag
 */
export function inferPriorityAndStatus(message: string, equipmentId?: string | null): {
    priority: Priority;
    priorityReason: string;
    suggestedStatus: RequestStatus;
    clarificationReason?: string;
} {
    const msg = message.toLowerCase();

    if (
        msg.includes('cold-room') ||
        msg.includes('cold room') ||
        msg.includes('stored goods') ||
        msg.includes('stock') ||
        msg.includes('spoil') ||
        msg.includes('freezer') ||
        msg.includes('temperature critical')
    ) {
        return {
            priority: 'URGENT',
            priorityReason: 'Potential stored-goods / product damage impact',
            suggestedStatus: 'NEW',
        };
    }

    if (
        msg.includes('machine not working') && (!equipmentId || msg.length < 35) ||
        msg.includes('please call us') && !equipmentId ||
        msg.includes('need clarification') ||
        msg.includes('warning. details need clarification')
    ) {
        return {
            priority: 'NORMAL',
            priorityReason: 'Initial intake - requires technical specification',
            suggestedStatus: 'NEEDS_CLARIFICATION',
            clarificationReason: 'Missing equipment identifier, specific error codes, or business impact',
        };
    }

    if (
        msg.includes('pressure warning') ||
        msg.includes('pump') ||
        msg.includes('stopped') ||
        msg.includes('broken') ||
        msg.includes('failure') ||
        msg.includes('fault')
    ) {
        return {
            priority: 'HIGH',
            priorityReason: 'Equipment operational interruption',
            suggestedStatus: 'NEW',
        };
    }

    return {
        priority: 'NORMAL',
        priorityReason: 'Routine maintenance or standard service inquiry',
        suggestedStatus: 'NEW',
    };
}

/**
 * Formats a clean customer status update message ready to copy
 */
export function generateCustomerUpdate(req: {
    id: string;
    status: string;
    technicianName?: string | null;
    scheduledAt?: Date | string | null;
    equipmentId?: string | null;
}): string {
    const formatTime = (dateVal: Date | string) => {
        const d = new Date(dateVal);
        return d.toLocaleString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'UTC',
        });
    };

    switch (req.status) {
        case 'NEW':
            return `Atlas Industrial Services: We have received your service request ${req.id} and our coordinator is currently reviewing technician availability. We will update you shortly.`;
        case 'NEEDS_CLARIFICATION':
            return `Atlas Industrial Services: Regarding service request ${req.id}, our dispatch team needs additional details regarding equipment specifications/urgency. Please reply to help us expedite technician assignment.`;
        case 'ASSIGNED':
            if (req.scheduledAt) {
                return `Atlas Industrial Services: Your service request ${req.id} is scheduled for ${formatTime(req.scheduledAt)}. Technician ${req.technicianName || 'T1'} has been assigned.`;
            }
            return `Atlas Industrial Services: Technician ${req.technicianName || 'T1'} has been assigned to your request ${req.id}. We will confirm the exact visit arrival window shortly.`;
        case 'IN_PROGRESS':
            return `Atlas Industrial Services: Technician ${req.technicianName || 'assigned'} has started work on request ${req.id}${req.equipmentId ? ` (Equipment: ${req.equipmentId})` : ''}. We will notify you once maintenance is complete.`;
        case 'WAITING_PART':
            return `Atlas Industrial Services: Request ${req.id} is currently on hold awaiting a replacement component. Our coordinator is tracking part delivery and will reschedule the completion visit.`;
        case 'RESOLVED':
            return `Atlas Industrial Services: Service request ${req.id} has been resolved successfully. All equipment checks have been completed. Thank you for choosing Atlas Industrial Services.`;
        case 'DUPLICATE':
            return `Atlas Industrial Services: Notice for request ${req.id}: This ticket has been consolidated into existing active ticket. Please refer to your primary ticket for live updates.`;
        default:
            return `Atlas Industrial Services: Status update for request ${req.id}: Current status is ${req.status}.`;
    }
}
