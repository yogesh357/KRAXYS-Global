import {
  Customer,
  Technician,
  ServiceRequest,
  CoordinatorDashboardData,
  ManagerDashboardData,
} from "../types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
      cache: "no-store",
    });

    const data = await res.json();
    if (!res.ok || data.success === false) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }

    return data.data !== undefined ? data.data : data;
  } catch (err: any) {
    console.error(`API Error on [${options?.method || "GET"} ${endpoint}]:`, err);
    throw err;
  }
}

export const api = {
  // Health
  checkHealth: () => fetchJson<{ message: string; timestamp: string }>("/health"),

  // Dashboard
  getCoordinatorDashboard: () => fetchJson<CoordinatorDashboardData>("/dashboard/coordinator"),
  getManagerDashboard: () => fetchJson<ManagerDashboardData>("/dashboard/manager"),

  // Requests
  getRequests: (params?: {
    status?: string;
    priority?: string;
    overdueOnly?: boolean;
    unassignedOnly?: boolean;
    needsClarificationOnly?: boolean;
    waitingPartOnly?: boolean;
    technicianId?: string;
    search?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.status) query.append("status", params.status);
    if (params?.priority) query.append("priority", params.priority);
    if (params?.overdueOnly) query.append("overdueOnly", "true");
    if (params?.unassignedOnly) query.append("unassignedOnly", "true");
    if (params?.needsClarificationOnly) query.append("needsClarificationOnly", "true");
    if (params?.waitingPartOnly) query.append("waitingPartOnly", "true");
    if (params?.technicianId) query.append("technicianId", params.technicianId);
    if (params?.search) query.append("search", params.search);

    const queryString = query.toString();
    return fetchJson<ServiceRequest[]>(`/requests${queryString ? `?${queryString}` : ""}`);
  },

  getRequestById: (id: string) => fetchJson<ServiceRequest>(`/requests/${id}`),

  createRequest: (payload: {
    customerId: string;
    channel: string;
    message: string;
    equipmentId?: string | null;
    priority?: string;
    priorityReason?: string | null;
    status?: string;
    technicianId?: string | null;
    scheduledAt?: string | null;
    actorRole?: string;
    actorName?: string;
  }) =>
    fetchJson<ServiceRequest>("/requests", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateRequest: (
    id: string,
    payload: {
      priority?: string;
      priorityReason?: string | null;
      equipmentId?: string | null;
      clarificationNotes?: string | null;
      resolutionNotes?: string | null;
      actorRole?: string;
      actorName?: string;
    }
  ) =>
    fetchJson<ServiceRequest>(`/requests/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  assignTechnician: (
    id: string,
    payload: {
      technicianId: string;
      scheduledAt?: string | null;
      actorRole?: string;
      actorName?: string;
    }
  ) =>
    fetchJson<ServiceRequest>(`/requests/${id}/assign`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  scheduleVisit: (
    id: string,
    payload: {
      scheduledAt: string;
      actorRole?: string;
      actorName?: string;
    }
  ) =>
    fetchJson<ServiceRequest>(`/requests/${id}/schedule`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateStatus: (
    id: string,
    payload: {
      status: string;
      notes?: string;
      actorRole?: string;
      actorName?: string;
    }
  ) =>
    fetchJson<ServiceRequest>(`/requests/${id}/status`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  markDuplicate: (
    id: string,
    payload: {
      duplicateOfId: string;
      actorRole?: string;
      actorName?: string;
    }
  ) =>
    fetchJson<ServiceRequest>(`/requests/${id}/duplicate`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  requestClarification: (
    id: string,
    payload: {
      clarificationNotes: string;
      actorRole?: string;
      actorName?: string;
    }
  ) =>
    fetchJson<ServiceRequest>(`/requests/${id}/clarify`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // Technicians
  getTechnicians: () => fetchJson<Technician[]>("/technicians"),
  getTechnicianJobs: (id: string) => fetchJson<ServiceRequest[]>(`/technicians/${id}/jobs`),

  // Customers
  getCustomers: () => fetchJson<Customer[]>("/customers"),

  // Seed / Reset
  resetAndSeed: () =>
    fetchJson<{ message: string }>("/seed/reset", {
      method: "POST",
    }),
};
