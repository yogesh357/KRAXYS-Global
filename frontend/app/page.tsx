"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  UserRole,
  ServiceRequest,
  Customer,
  Technician,
  CoordinatorDashboardData,
  ManagerDashboardData,
} from "./types";
import { api } from "./lib/api";
import { Navbar } from "./components/Navbar";
import { CoordinatorView } from "./components/CoordinatorView";
import { TechnicianView } from "./components/TechnicianView";
import { ManagerView } from "./components/ManagerView";
import { RequestDetailDrawer } from "./components/RequestDetailDrawer";
import {
  AssignModal,
  ScheduleModal,
  ClarifyModal,
  DuplicateModal,
  ResolveModal,
  NewRequestModal,
} from "./components/Modals";
import { CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>("COORDINATOR");
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Data states
  const [coordinatorData, setCoordinatorData] = useState<CoordinatorDashboardData | null>(null);
  const [managerData, setManagerData] = useState<ManagerDashboardData | null>(null);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);

  // Modal / Drawer states
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [assignModalReq, setAssignModalReq] = useState<ServiceRequest | null>(null);
  const [scheduleModalReq, setScheduleModalReq] = useState<ServiceRequest | null>(null);
  const [clarifyModalReq, setClarifyModalReq] = useState<ServiceRequest | null>(null);
  const [duplicateModalReq, setDuplicateModalReq] = useState<ServiceRequest | null>(null);
  const [resolveModalReq, setResolveModalReq] = useState<ServiceRequest | null>(null);
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Load all operational data
  const loadData = useCallback(async () => {
    try {
      const [coord, mgr, reqList, custList, techList] = await Promise.all([
        api.getCoordinatorDashboard(),
        api.getManagerDashboard(),
        api.getRequests(),
        api.getCustomers(),
        api.getTechnicians(),
      ]);

      setCoordinatorData(coord);
      setManagerData(mgr);
      setRequests(reqList);
      setCustomers(custList);
      setTechnicians(techList);

      // If drawer is open, keep selectedRequest updated
      if (selectedRequest) {
        const fresh = reqList.find((r) => r.id === selectedRequest.id);
        if (fresh) setSelectedRequest(fresh);
      }
    } catch (err: any) {
      console.error("Failed to load data:", err);
      showToast(err.message || "Failed to connect to backend", "error");
    } finally {
      setLoading(false);
    }
  }, [selectedRequest]);

  useEffect(() => {
    loadData();
  }, []);

  // Actions
  const handleCreateRequest = async (payload: {
    customerId: string;
    channel: string;
    message: string;
    equipmentId?: string | null;
    priority?: string;
  }) => {
    try {
      const newReq = await api.createRequest({
        ...payload,
        actorRole: currentRole,
        actorName: currentRole === "COORDINATOR" ? "Alex Morgan" : "User",
      });
      showToast(`Request ${newReq.id} created successfully`);
      await loadData();
    } catch (err: any) {
      showToast(err.message || "Failed to create request", "error");
    }
  };

  const handleAssignTechnician = async (
    requestId: string,
    technicianId: string,
    scheduledAt?: string | null
  ) => {
    try {
      await api.assignTechnician(requestId, {
        technicianId,
        scheduledAt,
        actorRole: currentRole,
        actorName: currentRole === "COORDINATOR" ? "Alex Morgan" : "Manager",
      });
      showToast(`Technician ${technicianId} assigned to ${requestId}`);
      await loadData();
    } catch (err: any) {
      showToast(err.message || "Failed to assign technician", "error");
    }
  };

  const handleScheduleVisit = async (requestId: string, scheduledAt: string) => {
    try {
      await api.scheduleVisit(requestId, {
        scheduledAt,
        actorRole: currentRole,
        actorName: currentRole === "COORDINATOR" ? "Alex Morgan" : "User",
      });
      showToast(`Visit scheduled for request ${requestId}`);
      await loadData();
    } catch (err: any) {
      showToast(err.message || "Failed to schedule visit", "error");
    }
  };

  const handleUpdateStatus = async (requestId: string, status: string, notes?: string) => {
    try {
      await api.updateStatus(requestId, {
        status,
        notes,
        actorRole: currentRole,
        actorName: currentRole.startsWith("TECHNICIAN") ? currentRole.replace("TECHNICIAN_", "") : "Coordinator",
      });
      showToast(`Request ${requestId} status updated to ${status}`);
      await loadData();
    } catch (err: any) {
      showToast(err.message || "Failed to update status", "error");
    }
  };

  const handleMarkDuplicate = async (requestId: string, duplicateOfId: string) => {
    try {
      await api.markDuplicate(requestId, {
        duplicateOfId,
        actorRole: currentRole,
        actorName: currentRole === "COORDINATOR" ? "Alex Morgan" : "User",
      });
      showToast(`Request ${requestId} marked as duplicate of ${duplicateOfId}`);
      await loadData();
    } catch (err: any) {
      showToast(err.message || "Failed to mark duplicate", "error");
    }
  };

  const handleRequestClarification = async (requestId: string, clarificationNotes: string) => {
    try {
      await api.requestClarification(requestId, {
        clarificationNotes,
        actorRole: currentRole,
        actorName: currentRole === "COORDINATOR" ? "Alex Morgan" : "User",
      });
      showToast(`Clarification flagged for request ${requestId}`);
      await loadData();
    } catch (err: any) {
      showToast(err.message || "Failed to request clarification", "error");
    }
  };

  const handleResetData = async () => {
    setResetting(true);
    try {
      await api.resetAndSeed();
      showToast("Database reset to demo state (R101-R108)");
      await loadData();
    } catch (err: any) {
      showToast(err.message || "Failed to reset database", "error");
    } finally {
      setResetting(false);
    }
  };

  const handleViewOtherRequest = (requestId: string) => {
    const target = requests.find((r) => r.id === requestId);
    if (target) {
      setSelectedRequest(target);
    } else {
      api.getRequestById(requestId).then((r) => setSelectedRequest(r));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top Navbar */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        onOpenNewRequest={() => setIsNewRequestOpen(true)}
        onResetData={handleResetData}
        resetting={resetting}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-500">
            <RefreshCw className="w-8 h-8 animate-spin mb-3 text-slate-400" />
            <div className="text-sm font-semibold text-slate-700">Loading Atlas Operations Desk...</div>
            <p className="text-xs text-slate-400 mt-1">Connecting to backend service API...</p>
          </div>
        ) : (
          <>
            {currentRole === "COORDINATOR" && coordinatorData && (
              <CoordinatorView
                data={coordinatorData}
                requests={requests}
                technicians={technicians}
                onSelectRequest={setSelectedRequest}
                onOpenAssign={setAssignModalReq}
                onOpenSchedule={setScheduleModalReq}
                onOpenClarify={setClarifyModalReq}
                onOpenDuplicate={setDuplicateModalReq}
                onOpenResolve={setResolveModalReq}
              />
            )}

            {currentRole === "TECHNICIAN_T1" && (
              <TechnicianView
                technicianId="T1"
                technicianName="Marcus Vance (T1)"
                technicians={technicians}
                jobs={requests.filter((r) => r.technicianId === "T1")}
                onSelectRequest={setSelectedRequest}
                onUpdateStatus={handleUpdateStatus}
                onOpenResolve={setResolveModalReq}
              />
            )}

            {currentRole === "TECHNICIAN_T2" && (
              <TechnicianView
                technicianId="T2"
                technicianName="Elena Rostova (T2)"
                technicians={technicians}
                jobs={requests.filter((r) => r.technicianId === "T2")}
                onSelectRequest={setSelectedRequest}
                onUpdateStatus={handleUpdateStatus}
                onOpenResolve={setResolveModalReq}
              />
            )}

            {currentRole === "TECHNICIAN_T3" && (
              <TechnicianView
                technicianId="T3"
                technicianName="David Chen (T3)"
                technicians={technicians}
                jobs={requests.filter((r) => r.technicianId === "T3")}
                onSelectRequest={setSelectedRequest}
                onUpdateStatus={handleUpdateStatus}
                onOpenResolve={setResolveModalReq}
              />
            )}

            {currentRole === "OPERATIONS_MANAGER" && managerData && (
              <ManagerView
                data={managerData}
                requests={requests}
                technicians={technicians}
                onSelectRequest={setSelectedRequest}
                onOpenAssign={setAssignModalReq}
                onOpenSchedule={setScheduleModalReq}
              />
            )}
          </>
        )}
      </main>

      {/* Floating Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-lg shadow-xl border text-xs font-medium flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150 ${
            toast.type === "success"
              ? "bg-slate-900 text-white border-slate-800"
              : "bg-red-600 text-white border-red-700"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-white shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Detail Drawer */}
      <RequestDetailDrawer
        request={selectedRequest}
        onClose={() => setSelectedRequest(null)}
        onOpenAssign={setAssignModalReq}
        onOpenSchedule={setScheduleModalReq}
        onOpenClarify={setClarifyModalReq}
        onOpenDuplicate={setDuplicateModalReq}
        onOpenResolve={setResolveModalReq}
        onViewOtherRequest={handleViewOtherRequest}
        currentRole={currentRole}
        technicians={technicians}
      />

      {/* Modals */}
      <AssignModal
        isOpen={!!assignModalReq}
        onClose={() => setAssignModalReq(null)}
        request={assignModalReq}
        technicians={technicians}
        onAssign={handleAssignTechnician}
      />

      <ScheduleModal
        isOpen={!!scheduleModalReq}
        onClose={() => setScheduleModalReq(null)}
        request={scheduleModalReq}
        onSchedule={handleScheduleVisit}
      />

      <ClarifyModal
        isOpen={!!clarifyModalReq}
        onClose={() => setClarifyModalReq(null)}
        request={clarifyModalReq}
        onClarify={handleRequestClarification}
      />

      <DuplicateModal
        isOpen={!!duplicateModalReq}
        onClose={() => setDuplicateModalReq(null)}
        request={duplicateModalReq}
        onMarkDuplicate={handleMarkDuplicate}
        onViewOriginal={handleViewOtherRequest}
      />

      <ResolveModal
        isOpen={!!resolveModalReq}
        onClose={() => setResolveModalReq(null)}
        request={resolveModalReq}
        onResolve={(requestId, notes) => handleUpdateStatus(requestId, "RESOLVED", notes)}
      />

      <NewRequestModal
        isOpen={isNewRequestOpen}
        onClose={() => setIsNewRequestOpen(false)}
        customers={customers}
        onCreate={handleCreateRequest}
      />
    </div>
  );
}
