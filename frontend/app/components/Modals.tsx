"use client";

import React, { useState, useEffect } from "react";
import { Customer, Technician, ServiceRequest } from "../types";
import {
  X,
  Wrench,
  Calendar,
  AlertTriangle,
  Copy,
  CheckCircle,
  HelpCircle,
  Plus,
} from "lucide-react";

// 1. Assign Technician Modal
export function AssignModal({
  isOpen,
  onClose,
  request,
  technicians,
  onAssign,
}: {
  isOpen: boolean;
  onClose: () => void;
  request: ServiceRequest | null;
  technicians: Technician[];
  onAssign: (requestId: string, technicianId: string, scheduledAt?: string | null) => Promise<void>;
}) {
  const [selectedTech, setSelectedTech] = useState<string>("");
  const [scheduledAt, setScheduledAt] = useState<string>("2026-10-01T10:30");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (request?.technicianId) {
      setSelectedTech(request.technicianId);
    } else if (technicians.length > 0) {
      setSelectedTech(technicians[0].id);
    }
  }, [request, technicians]);

  if (!isOpen || !request) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTech) return;
    setLoading(true);
    try {
      const isoSchedule = scheduledAt ? new Date(scheduledAt).toISOString() : null;
      await onAssign(request.id, selectedTech, isoSchedule);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-slate-700" />
            <h3 className="font-semibold text-slate-900 text-sm">Assign Technician — {request.id}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <div className="text-xs text-slate-500 mb-1">Customer & Issue</div>
            <div className="text-xs font-medium text-slate-800 bg-slate-50 p-2.5 rounded border border-slate-200">
              <span className="font-semibold text-slate-900">{request.customer?.name || request.customerId}:</span>{" "}
              {request.message}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Select Field Technician
            </label>
            <div className="space-y-2">
              {technicians.map((t) => (
                <label
                  key={t.id}
                  className={`flex items-start p-3 rounded border text-xs cursor-pointer transition ${
                    selectedTech === t.id
                      ? "border-slate-900 bg-slate-50 text-slate-900"
                      : "border-slate-200 hover:bg-slate-50/60 text-slate-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="technician"
                    value={t.id}
                    checked={selectedTech === t.id}
                    onChange={() => setSelectedTech(t.id)}
                    className="mt-0.5 mr-2.5 accent-slate-900"
                  />
                  <div className="flex-1">
                    <div className="font-semibold flex items-center justify-between">
                      <span>{t.id}: {t.name}</span>
                      <span className="text-[10px] font-normal text-slate-500 bg-white px-1.5 py-0.5 border border-slate-200 rounded">
                        {t.activeJobsCount || 0} active jobs
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{t.skills}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Scheduled Visit Window (Demo UTC: 01 Oct 2026)
            </label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded border border-slate-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedTech}
              className="px-4 py-1.5 text-xs font-medium rounded bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 transition cursor-pointer"
            >
              {loading ? "Assigning..." : "Confirm Assignment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 2. Schedule Visit Modal
export function ScheduleModal({
  isOpen,
  onClose,
  request,
  onSchedule,
}: {
  isOpen: boolean;
  onClose: () => void;
  request: ServiceRequest | null;
  onSchedule: (requestId: string, scheduledAt: string) => Promise<void>;
}) {
  const [scheduledAt, setScheduledAt] = useState<string>("2026-10-01T10:30");
  const [loading, setLoading] = useState(false);

  if (!isOpen || !request) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduledAt) return;
    setLoading(true);
    try {
      const isoSchedule = new Date(scheduledAt).toISOString();
      await onSchedule(request.id, isoSchedule);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-sm w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-700" />
            <h3 className="font-semibold text-slate-900 text-sm">Schedule On-Site Visit — {request.id}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="text-xs text-slate-600">
            Assigned Technician: <span className="font-semibold text-slate-900">{request.technician?.name || request.technicianId || "T1"}</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Visit Date & Time Window
            </label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded border border-slate-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !scheduledAt}
              className="px-4 py-1.5 text-xs font-medium rounded bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 transition cursor-pointer"
            >
              {loading ? "Scheduling..." : "Save Scheduled Visit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 3. Clarification Modal
export function ClarifyModal({
  isOpen,
  onClose,
  request,
  onClarify,
}: {
  isOpen: boolean;
  onClose: () => void;
  request: ServiceRequest | null;
  onClarify: (requestId: string, notes: string) => Promise<void>;
}) {
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (request?.clarificationNotes) {
      setNotes(request.clarificationNotes);
    } else {
      setNotes("Requested equipment serial number, operational error codes, and business downtime urgency from customer contact.");
    }
  }, [request]);

  if (!isOpen || !request) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes) return;
    setLoading(true);
    try {
      await onClarify(request.id, notes);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-indigo-600" />
            <h3 className="font-semibold text-slate-900 text-sm">Request Customer Clarification — {request.id}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="bg-indigo-50/60 border border-indigo-100 rounded p-3 text-xs text-indigo-900">
            <span className="font-semibold">Original intake:</span> &quot;{request.message}&quot;
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Clarification Requirements & Follow-up Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Missing equipment ID, exact symptoms, safety hazards..."
              className="w-full text-xs p-2.5 border border-slate-200 rounded bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded border border-slate-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !notes}
              className="px-4 py-1.5 text-xs font-medium rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition cursor-pointer"
            >
              {loading ? "Updating..." : "Flag for Clarification"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 4. Duplicate Confirmation Modal
export function DuplicateModal({
  isOpen,
  onClose,
  request,
  onMarkDuplicate,
  onViewOriginal,
}: {
  isOpen: boolean;
  onClose: () => void;
  request: ServiceRequest | null;
  onMarkDuplicate: (requestId: string, duplicateOfId: string) => Promise<void>;
  onViewOriginal?: (originalId: string) => void;
}) {
  const [targetId, setTargetId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (request?.possibleDuplicateId) {
      setTargetId(request.possibleDuplicateId);
    }
  }, [request]);

  if (!isOpen || !request) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetId) return;
    setLoading(true);
    try {
      await onMarkDuplicate(request.id, targetId);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <Copy className="w-4 h-4 text-slate-700" />
            <h3 className="font-semibold text-slate-900 text-sm">Triage Duplicate Request — {request.id}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded border border-slate-200 space-y-2">
            <div>
              <span className="font-semibold text-slate-900">Current Message ({request.id}):</span>
              <p className="text-slate-700 mt-0.5">&quot;{request.message}&quot;</p>
            </div>
            {request.possibleDuplicateId && (
              <div className="pt-2 border-t border-slate-200">
                <span className="font-semibold text-slate-900">Matched Active Ticket:</span>{" "}
                <span className="font-mono bg-white px-1.5 py-0.5 border border-slate-300 rounded font-bold text-slate-900">
                  {request.possibleDuplicateId}
                </span>{" "}
                (Same customer: {request.customer?.name || request.customerId})
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Primary / Original Request ID
            </label>
            <input
              type="text"
              value={targetId}
              onChange={(e) => setTargetId(e.target.value.toUpperCase())}
              placeholder="e.g. R101"
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded font-mono bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
              required
            />
          </div>

          <div className="flex items-center justify-between gap-2 pt-2">
            {onViewOriginal && request.possibleDuplicateId && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onViewOriginal(request.possibleDuplicateId!);
                }}
                className="px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded border border-slate-300 font-medium cursor-pointer"
              >
                View Original ({request.possibleDuplicateId})
              </button>
            )}
            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded border border-slate-200 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !targetId}
                className="px-4 py-1.5 text-xs font-medium rounded bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 transition cursor-pointer"
              >
                {loading ? "Marking..." : "Mark as Duplicate"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// 5. Resolve Job Modal
export function ResolveModal({
  isOpen,
  onClose,
  request,
  onResolve,
}: {
  isOpen: boolean;
  onClose: () => void;
  request: ServiceRequest | null;
  onResolve: (requestId: string, resolutionNotes: string) => Promise<void>;
}) {
  const [notes, setNotes] = useState<string>("Equipment inspection completed. Replaced faulty relay and verified operational pressure limits under load.");
  const [loading, setLoading] = useState(false);

  if (!isOpen || !request) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onResolve(request.id, notes);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <h3 className="font-semibold text-slate-900 text-sm">Mark Service Job Resolved — {request.id}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="text-xs text-slate-600 bg-emerald-50/50 p-2.5 rounded border border-emerald-100">
            <span className="font-semibold text-emerald-900">{request.customer?.name || request.customerId}:</span>{" "}
            {request.message}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Service Resolution Notes & Equipment Check Summary
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe work performed, parts installed, tests verified..."
              className="w-full text-xs p-2.5 border border-slate-200 rounded bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded border border-slate-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 text-xs font-medium rounded bg-emerald-700 text-white hover:bg-emerald-800 disabled:opacity-50 transition cursor-pointer"
            >
              {loading ? "Resolving..." : "Complete & Mark Resolved"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 6. New Service Request Intake Modal
export function NewRequestModal({
  isOpen,
  onClose,
  customers,
  onCreate,
}: {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  onCreate: (payload: {
    customerId: string;
    channel: string;
    message: string;
    equipmentId?: string | null;
    priority?: string;
  }) => Promise<void>;
}) {
  const [customerId, setCustomerId] = useState<string>("");
  const [channel, setChannel] = useState<string>("EMAIL");
  const [message, setMessage] = useState<string>("");
  const [equipmentId, setEquipmentId] = useState<string>("");
  const [priority, setPriority] = useState<string>("NORMAL");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customers.length > 0 && !customerId) {
      setCustomerId(customers[0].id);
    }
  }, [customers, customerId]);

  // Live duplicate warning heuristic
  const duplicateWarning = customerId === "C01" && message.toLowerCase().includes("cold-room");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !message.trim()) return;
    setLoading(true);
    try {
      await onCreate({
        customerId,
        channel,
        message: message.trim(),
        equipmentId: equipmentId.trim() || null,
        priority,
      });
      setMessage("");
      setEquipmentId("");
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-slate-700" />
            <h3 className="font-semibold text-slate-900 text-sm">Manual Service Request Intake</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Customer Account
              </label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                required
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.id}: {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Received Channel
              </label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                <option value="EMAIL">Email</option>
                <option value="WHATSAPP">WhatsApp</option>
                <option value="PHONE">Phone Call</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Customer Message / Reported Problem (Verbatim)
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter exact message copied from email, phone log, or WhatsApp..."
              className="w-full text-xs p-2.5 border border-slate-200 rounded bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
              required
            />
          </div>

          {duplicateWarning && (
            <div className="p-2.5 rounded bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Possible Duplicate Notice:</span> Active ticket R101 already exists for Apex Cold Storage regarding cold-room faults. System will link candidate upon creation.
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Equipment ID (Optional)
              </label>
              <input
                type="text"
                value={equipmentId}
                onChange={(e) => setEquipmentId(e.target.value)}
                placeholder="e.g. CRU-402, PMP-108"
                className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded font-mono bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Assessed Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                <option value="URGENT">URGENT (Stock/Damage risk)</option>
                <option value="HIGH">HIGH (Equipment down)</option>
                <option value="NORMAL">NORMAL (Routine)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded border border-slate-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !message.trim()}
              className="px-4 py-1.5 text-xs font-medium rounded bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 transition cursor-pointer"
            >
              {loading ? "Creating..." : "Save Service Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
