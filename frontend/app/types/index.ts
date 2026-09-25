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

export type UserRole = 
  | 'COORDINATOR'
  | 'TECHNICIAN_T1'
  | 'TECHNICIAN_T2'
  | 'TECHNICIAN_T3'
  | 'OPERATIONS_MANAGER';

export interface Customer {
  id: string;
  name: string;
  contactPerson?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  createdAt: string;
}

export interface Technician {
  id: string;
  name: string;
  skills?: string | null;
  phone?: string | null;
  email?: string | null;
  status: 'AVAILABLE' | 'ON_JOB' | 'OFF_DUTY';
  totalAssigned?: number;
  activeJobsCount?: number;
  inProgressCount?: number;
  resolvedCount?: number;
  urgentCount?: number;
  currentWorkload?: 'AVAILABLE' | 'NORMAL' | 'HIGH';
}

export interface RequestActivity {
  id: string;
  requestId: string;
  actorRole: string;
  actorName: string;
  action: string;
  details?: string | null;
  createdAt: string;
}

export interface ServiceRequest {
  id: string;
  customerId: string;
  channel: Channel;
  message: string;
  equipmentId?: string | null;
  priority: Priority;
  priorityReason?: string | null;
  status: RequestStatus;
  technicianId?: string | null;
  scheduledAt?: string | null;
  receivedAt: string;
  duplicateOfId?: string | null;
  possibleDuplicateId?: string | null;
  clarificationNotes?: string | null;
  resolutionNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  customer?: Customer | null;
  technician?: Technician | null;
  isOverdue?: boolean;
  overdueReason?: string | null;
  customerUpdateMessage?: string;
  activities?: RequestActivity[];
  originalRequest?: ServiceRequest | null;
  possibleDuplicateRequest?: ServiceRequest | null;
}

export interface NeedsAttentionItem {
  requestId: string;
  title: string;
  customer: string;
  priority: Priority;
  status: RequestStatus;
  technicianName?: string;
  actionType: 'ASSIGN_TECHNICIAN' | 'SCHEDULE_VISIT' | 'REQUEST_CLARIFICATION' | 'RESOLVE_DUPLICATE' | 'UPDATE_STATUS';
  actionLabel: string;
  badgeText: string;
  badgeVariant: 'urgent' | 'warning' | 'clarification' | 'secondary';
  clarificationNotes?: string | null;
  possibleDuplicateId?: string | null;
  overdue?: boolean;
  receivedAt: string;
  equipmentId?: string | null;
}

export interface CoordinatorStats {
  totalRequests: number;
  activeRequests: number;
  urgentCount: number;
  unassignedCount: number;
  needsClarificationCount: number;
  overdueCount: number;
  waitingPartCount: number;
  inProgressCount: number;
  resolvedCount: number;
  duplicateCount: number;
}

export interface CoordinatorDashboardData {
  demoNow: string;
  stats: CoordinatorStats;
  needsAttention: NeedsAttentionItem[];
  technicians: Technician[];
  recentRequests: ServiceRequest[];
}

export interface ManagerException {
  id: string;
  type: 'OVERDUE' | 'UNASSIGNED_URGENT' | 'WAITING_PART';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  title: string;
  description: string;
  customer: string;
  priority: Priority;
  technicianName: string;
  status: RequestStatus;
}

export interface ManagerDashboardData {
  demoNow: string;
  health: {
    status: 'CONTROLLED' | 'ATTENTION_REQUIRED' | 'CRITICAL';
    score: number;
  };
  stats: {
    openRequestsCount: number;
    urgentCount: number;
    unassignedCount: number;
    overdueCount: number;
    waitingPartCount: number;
    inProgressCount: number;
    resolvedCount: number;
    totalRequests: number;
  };
  technicianWorkload: Technician[];
  exceptions: ManagerException[];
  allActiveRequests: ServiceRequest[];
}
