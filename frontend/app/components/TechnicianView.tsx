"use client";

import React, { useState } from "react";
import { ServiceRequest, Technician } from "../types";
import { PriorityBadge, StatusBadge, ChannelBadge } from "./Badges";
import { CustomerUpdateBox } from "./CustomerUpdateBox";
import {
  Wrench,
  Play,
  CheckCircle2,
  PauseCircle,
  Calendar,
  MapPin,
  Phone,
  Clock,
  Cpu,
  Inbox,
  AlertTriangle,
} from "lucide-react";

interface Props {
  technicianId: string;
  technicianName: string;
  technicians: Technician[];
  jobs: ServiceRequest[];
  onSelectRequest: (req: ServiceRequest) => void;
  onUpdateStatus: (requestId: string, status: string, notes?: string) => Promise<void>;
  onOpenResolve: (req: ServiceRequest) => void;
}

export function TechnicianView({
  technicianId,
  technicianName,
  technicians,
  jobs,
  onSelectRequest,
  onUpdateStatus,
  onOpenResolve,
}: Props) {
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "COMPLETED">("ACTIVE");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const activeJobs = jobs.filter((j) => j.status !== "RESOLVED" && j.status !== "DUPLICATE");
  const completedJobs = jobs.filter((j) => j.status === "RESOLVED");

  const currentTech = technicians.find((t) => t.id === technicianId);

  const handleStartJob = async (e: React.MouseEvent, req: ServiceRequest) => {
    e.stopPropagation();
    setActionLoading(req.id);
    try {
      await onUpdateStatus(req.id, "IN_PROGRESS", "Technician arrived on site and commenced diagnostic/repair.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleWaitPart = async (e: React.MouseEvent, req: ServiceRequest) => {
    e.stopPropagation();
    setActionLoading(req.id);
    try {
      await onUpdateStatus(req.id, "WAITING_PART", "Awaiting replacement component delivery from central warehouse.");
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "Pending scheduling by Coordinator";
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

  return (
    <div className="space-y-6">
      {/* Technician Profile Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-lg">
            {technicianId}
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Field Technician Workspace
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-0.5">
              {technicianName}
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              {currentTech?.skills || "Certified Equipment Specialist"}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-lg text-center">
            <div className="text-lg font-bold text-slate-900 font-mono">
              {activeJobs.length}
            </div>
            <div className="text-[10px] text-slate-500 font-medium">Active Jobs</div>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-lg text-center">
            <div className="text-lg font-bold text-emerald-800 font-mono">
              {completedJobs.length}
            </div>
            <div className="text-[10px] text-emerald-700 font-medium">Completed</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("ACTIVE")}
          className={`px-4 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
            activeTab === "ACTIVE"
              ? "bg-slate-900 text-white shadow-2xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Assigned & Active Jobs ({activeJobs.length})
        </button>
        <button
          onClick={() => setActiveTab("COMPLETED")}
          className={`px-4 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
            activeTab === "COMPLETED"
              ? "bg-slate-900 text-white shadow-2xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Resolved Job History ({completedJobs.length})
        </button>
      </div>

      {/* Jobs Grid */}
      {activeTab === "ACTIVE" ? (
        activeJobs.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg p-12 text-center text-slate-400">
            <Inbox className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <h3 className="text-sm font-semibold text-slate-700">No active assigned jobs</h3>
            <p className="text-xs text-slate-500 mt-1">
              You are currently free for new dispatch assignments.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeJobs.map((job) => (
              <div
                key={job.id}
                onClick={() => onSelectRequest(job)}
                className="bg-white hover:border-slate-300 border border-slate-200 rounded-lg p-5 transition shadow-2xs hover:shadow-xs cursor-pointer space-y-4 group"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-base font-bold text-slate-900 group-hover:text-blue-600">
                      {job.id}
                    </span>
                    <StatusBadge status={job.status} />
                    <PriorityBadge priority={job.priority} reason={job.priorityReason} />
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Scheduled:</span>
                    <span className="font-medium text-slate-800">{formatDate(job.scheduledAt)}</span>
                  </div>
                </div>

                {/* Customer & Issue Description */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="space-y-1.5 md:col-span-2">
                    <div className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                      <span>{job.customer?.name || job.customerId}</span>
                      {job.equipmentId && (
                        <span className="font-mono text-xs text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 flex items-center gap-1 font-normal">
                          <Cpu className="w-3 h-3 text-slate-400" />
                          {job.equipmentId}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-800 bg-slate-50 p-3 rounded border border-slate-100 font-mono text-[11px] leading-relaxed">
                      &quot;{job.message}&quot;
                    </p>
                    {job.clarificationNotes && (
                      <div className="text-[11px] text-indigo-900 bg-indigo-50 p-2 rounded border border-indigo-100">
                        <span className="font-semibold">Context / Notes:</span> {job.clarificationNotes}
                      </div>
                    )}
                  </div>

                  {/* Customer Contact & Address Details */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded p-3 space-y-2 text-slate-600 self-start">
                    <div className="text-[11px] font-semibold text-slate-900 uppercase tracking-wider">
                      Site & Contact
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{job.customer?.address || "Address pending"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{job.customer?.phone || "+1-555-0100"}</span>
                    </div>
                  </div>
                </div>

                {/* Overdue Warning */}
                {job.isOverdue && (
                  <div className="bg-red-50 border border-red-200 rounded p-2.5 text-xs text-red-800 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{job.overdueReason || "Action required on this job"}</span>
                  </div>
                )}

                {/* Action Bar */}
                <div
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <CustomerUpdateBox
                    requestId={job.id}
                    updateText={
                      job.customerUpdateMessage ||
                      `Atlas Industrial Services: Technician ${technicianName} is assigned to request ${job.id}.`
                    }
                    compact
                  />

                  <div className="flex items-center gap-2 ml-auto">
                    {job.status === "ASSIGNED" && (
                      <button
                        onClick={(e) => handleStartJob(e, job)}
                        disabled={actionLoading === job.id}
                        className="px-4 py-1.5 text-xs font-semibold rounded bg-slate-900 text-white hover:bg-slate-800 transition shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Start Job</span>
                      </button>
                    )}

                    {job.status === "IN_PROGRESS" && (
                      <>
                        <button
                          onClick={(e) => handleWaitPart(e, job)}
                          disabled={actionLoading === job.id}
                          className="px-3 py-1.5 text-xs font-medium rounded border border-purple-200 bg-purple-50 text-purple-800 hover:bg-purple-100 transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <PauseCircle className="w-3.5 h-3.5" />
                          <span>Waiting for Part</span>
                        </button>

                        <button
                          onClick={() => onOpenResolve(job)}
                          className="px-4 py-1.5 text-xs font-semibold rounded bg-emerald-700 text-white hover:bg-emerald-800 transition shadow-xs cursor-pointer flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Resolved</span>
                        </button>
                      </>
                    )}

                    {job.status === "WAITING_PART" && (
                      <>
                        <button
                          onClick={(e) => handleStartJob(e, job)}
                          disabled={actionLoading === job.id}
                          className="px-3.5 py-1.5 text-xs font-semibold rounded bg-slate-900 text-white hover:bg-slate-800 transition shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>Resume Work</span>
                        </button>

                        <button
                          onClick={() => onOpenResolve(job)}
                          className="px-4 py-1.5 text-xs font-semibold rounded bg-emerald-700 text-white hover:bg-emerald-800 transition shadow-xs cursor-pointer flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Resolved</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Completed Jobs */
        <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
          {completedJobs.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No resolved jobs in history.
            </div>
          ) : (
            completedJobs.map((job) => (
              <div
                key={job.id}
                onClick={() => onSelectRequest(job)}
                className="p-4 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{job.id}</span>
                    <StatusBadge status={job.status} />
                    <span className="font-semibold text-slate-800">
                      {job.customer?.name || job.customerId}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] truncate">{job.message}</p>
                  {job.resolutionNotes && (
                    <div className="text-[11px] text-emerald-800 font-medium">
                      Resolution: {job.resolutionNotes}
                    </div>
                  )}
                </div>
                <div className="text-right text-slate-400 text-[11px]">
                  View Details &rarr;
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
