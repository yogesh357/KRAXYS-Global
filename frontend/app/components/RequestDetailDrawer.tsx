"use client";

import React from "react";
import { ServiceRequest, Technician, UserRole } from "../types";
import { PriorityBadge, StatusBadge, ChannelBadge } from "./Badges";
import { CustomerUpdateBox } from "./CustomerUpdateBox";
import {
  X,
  Clock,
  User,
  Wrench,
  Calendar,
  AlertTriangle,
  History,
  Building,
  Phone,
  Mail,
  MapPin,
  Cpu,
  Copy,
  HelpCircle,
  CheckCircle2,
} from "lucide-react";

interface Props {
  request: ServiceRequest | null;
  onClose: () => void;
  onOpenAssign: (req: ServiceRequest) => void;
  onOpenSchedule: (req: ServiceRequest) => void;
  onOpenClarify: (req: ServiceRequest) => void;
  onOpenDuplicate: (req: ServiceRequest) => void;
  onOpenResolve: (req: ServiceRequest) => void;
  onViewOtherRequest?: (requestId: string) => void;
  currentRole: UserRole;
  technicians: Technician[];
}

export function RequestDetailDrawer({
  request,
  onClose,
  onOpenAssign,
  onOpenSchedule,
  onOpenClarify,
  onOpenDuplicate,
  onOpenResolve,
  onViewOtherRequest,
  currentRole,
}: Props) {
  if (!request) return null;

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "Not recorded";
    const d = new Date(dateStr);
    return d.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    }) + " UTC";
  };

  const isTechRole = currentRole.startsWith("TECHNICIAN");

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200 overflow-hidden">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-mono text-lg font-bold text-slate-900">{request.id}</span>
            <StatusBadge status={request.status} />
            <PriorityBadge priority={request.priority} reason={request.priorityReason} />
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Overdue Warning Alert */}
          {request.isOverdue && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3.5 flex items-start gap-3 text-xs text-red-800">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">SLA Overdue Exception:</span>{" "}
                {request.overdueReason || "Action deadline exceeded based on demo time (01 Oct 2026, 09:00 AM UTC)."}
              </div>
            </div>
          )}

          {/* Possible Duplicate Banner */}
          {request.possibleDuplicateId && request.status !== "DUPLICATE" && (
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3.5 flex items-start justify-between gap-3 text-xs text-amber-900">
              <div className="flex items-start gap-2.5">
                <Copy className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Possible Duplicate of {request.possibleDuplicateId}:</span>{" "}
                  Same customer with recent matching problem description.
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {onViewOtherRequest && (
                  <button
                    onClick={() => onViewOtherRequest(request.possibleDuplicateId!)}
                    className="px-2 py-1 bg-white border border-amber-300 rounded text-[11px] font-medium text-amber-900 hover:bg-amber-100/50 cursor-pointer"
                  >
                    View Original
                  </button>
                )}
                <button
                  onClick={() => onOpenDuplicate(request)}
                  className="px-2 py-1 bg-amber-900 text-white rounded text-[11px] font-medium hover:bg-amber-950 cursor-pointer"
                >
                  Mark Duplicate
                </button>
              </div>
            </div>
          )}

          {/* Customer Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
                <Building className="w-3.5 h-3.5 text-slate-500" />
                Customer Account
              </span>
              <span className="font-mono bg-white px-1.5 py-0.5 border border-slate-200 rounded text-slate-800">
                {request.customerId}
              </span>
            </div>
            <div className="text-sm font-semibold text-slate-900">{request.customer?.name || "Customer " + request.customerId}</div>
            <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-slate-600 border-t border-slate-200/60">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>{request.customer?.contactPerson || "Operations Lead"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{request.customer?.phone || "+1-555-0100"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{request.customer?.email || "ops@customer.internal"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{request.customer?.address || "Industrial Park"}</span>
              </div>
            </div>
          </div>

          {/* Captured Request Details */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              Service Intake Details
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
              <div>
                <div className="text-[11px] text-slate-500 font-medium mb-1">Reported Message (Verbatim)</div>
                <p className="text-xs text-slate-900 font-mono bg-slate-50 p-2.5 rounded border border-slate-100 leading-relaxed">
                  &quot;{request.message}&quot;
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-1 text-xs">
                <div>
                  <span className="text-[11px] text-slate-500 block">Intake Channel</span>
                  <div className="mt-0.5">
                    <ChannelBadge channel={request.channel} />
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Equipment ID</span>
                  <span className="font-mono text-slate-800 font-medium flex items-center gap-1 mt-0.5">
                    <Cpu className="w-3 h-3 text-slate-400" />
                    {request.equipmentId || "Not specified"}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Received Time</span>
                  <span className="text-slate-800 font-medium text-[11px] mt-0.5 block">
                    {formatDate(request.receivedAt)}
                  </span>
                </div>
              </div>

              {request.priorityReason && (
                <div className="text-xs text-slate-600 bg-amber-50/40 p-2 rounded border border-amber-100">
                  <span className="font-semibold text-amber-900">Priority Assessment:</span> {request.priorityReason}
                </div>
              )}

              {request.clarificationNotes && (
                <div className="text-xs text-indigo-900 bg-indigo-50/50 p-2.5 rounded border border-indigo-100">
                  <span className="font-semibold flex items-center gap-1 mb-0.5">
                    <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                    Clarification Details:
                  </span>
                  <p>{request.clarificationNotes}</p>
                </div>
              )}

              {request.resolutionNotes && (
                <div className="text-xs text-emerald-900 bg-emerald-50/50 p-2.5 rounded border border-emerald-100">
                  <span className="font-semibold flex items-center gap-1 mb-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Service Resolution Notes:
                  </span>
                  <p>{request.resolutionNotes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Assignment & Visit Schedule Box */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                Dispatch & Schedule
              </span>
              {!isTechRole && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onOpenAssign(request)}
                    className="text-xs font-medium text-slate-700 hover:text-slate-900 underline cursor-pointer"
                  >
                    {request.technicianId ? "Reassign" : "Assign Technician"}
                  </button>
                  <span className="text-slate-300">•</span>
                  <button
                    onClick={() => onOpenSchedule(request)}
                    className="text-xs font-medium text-slate-700 hover:text-slate-900 underline cursor-pointer"
                  >
                    {request.scheduledAt ? "Reschedule" : "Schedule Visit"}
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <div className="text-[11px] text-slate-500 flex items-center gap-1 mb-1">
                  <Wrench className="w-3 h-3 text-slate-400" />
                  Assigned Technician
                </div>
                {request.technician ? (
                  <div>
                    <div className="text-xs font-semibold text-slate-900">
                      {request.technician.id}: {request.technician.name}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5 truncate">{request.technician.skills}</div>
                  </div>
                ) : (
                  <div className="text-xs font-medium text-amber-700 flex items-center justify-between">
                    <span>Unassigned</span>
                    <button
                      onClick={() => onOpenAssign(request)}
                      className="px-2 py-0.5 text-[10px] font-semibold bg-slate-900 text-white rounded cursor-pointer"
                    >
                      Assign
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <div className="text-[11px] text-slate-500 flex items-center gap-1 mb-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  Scheduled Visit
                </div>
                {request.scheduledAt ? (
                  <div className="text-xs font-semibold text-slate-900">
                    {formatDate(request.scheduledAt)}
                  </div>
                ) : (
                  <div className="text-xs font-medium text-amber-700 flex items-center justify-between">
                    <span>Visit not scheduled</span>
                    <button
                      onClick={() => onOpenSchedule(request)}
                      className="px-2 py-0.5 text-[10px] font-semibold bg-slate-900 text-white rounded cursor-pointer"
                    >
                      Schedule
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Customer Status Update Message Box */}
          <CustomerUpdateBox
            requestId={request.id}
            updateText={
              request.customerUpdateMessage ||
              `Atlas Industrial Services: Status update for request ${request.id}: ${request.status}.`
            }
          />

          {/* Activity Timeline */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 uppercase tracking-wider">
              <History className="w-3.5 h-3.5 text-slate-500" />
              Activity Log & Audit Trail
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
              {request.activities && request.activities.length > 0 ? (
                request.activities.map((act, idx) => (
                  <div key={act.id || idx} className="flex items-start gap-3 text-xs relative">
                    {idx < (request.activities?.length || 0) - 1 && (
                      <div className="absolute left-2.25 top-4 -bottom-4 w-px bg-slate-200"></div>
                    )}
                    <div className="w-4.5 h-4.5 rounded-full bg-white border border-slate-300 flex items-center justify-center shrink-0 z-10 text-[10px] font-mono font-bold text-slate-600">
                      {idx + 1}
                    </div>
                    <div className="flex-1 pb-1">
                      <div className="flex items-center justify-between text-slate-500 text-[11px]">
                        <span className="font-semibold text-slate-800">
                          {act.actorName} ({act.actorRole})
                        </span>
                        <span className="font-mono">{formatDate(act.createdAt)}</span>
                      </div>
                      <p className="text-slate-700 mt-0.5 leading-snug">{act.details}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400 italic">No activity recorded.</div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 shrink-0 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            {request.status !== "RESOLVED" && request.status !== "DUPLICATE" && (
              <>
                {request.status !== "NEEDS_CLARIFICATION" && (
                  <button
                    onClick={() => onOpenClarify(request)}
                    className="px-2.5 py-1.5 text-xs font-medium rounded border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 cursor-pointer"
                  >
                    Request Clarification
                  </button>
                )}
                <button
                  onClick={() => onOpenDuplicate(request)}
                  className="px-2.5 py-1.5 text-xs font-medium rounded border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 cursor-pointer"
                >
                  Mark Duplicate
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {request.status !== "RESOLVED" && request.status !== "DUPLICATE" && (
              <button
                onClick={() => onOpenResolve(request)}
                className="px-3.5 py-1.5 text-xs font-medium rounded bg-emerald-700 text-white hover:bg-emerald-800 cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Mark Resolved
              </button>
            )}
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium rounded bg-slate-900 text-white hover:bg-slate-800 cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
