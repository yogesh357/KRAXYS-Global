"use client";

import React, { useState } from "react";
import {
  ManagerDashboardData,
  ServiceRequest,
  Technician,
  ManagerException,
} from "../types";
import { PriorityBadge, StatusBadge, ChannelBadge } from "./Badges";
import { CustomerUpdateBox } from "./CustomerUpdateBox";
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  AlertTriangle,
  Clock,
  Wrench,
  PauseCircle,
  CheckCircle2,
  TrendingUp,
  Activity,
  ArrowRight,
  Filter,
} from "lucide-react";

interface Props {
  data: ManagerDashboardData;
  requests: ServiceRequest[];
  technicians: Technician[];
  onSelectRequest: (req: ServiceRequest) => void;
  onOpenAssign: (req: ServiceRequest) => void;
  onOpenSchedule: (req: ServiceRequest) => void;
}

export function ManagerView({
  data,
  requests,
  technicians,
  onSelectRequest,
  onOpenAssign,
  onOpenSchedule,
}: Props) {
  const { health, stats, exceptions, technicianWorkload } = data;
  const [filterTech, setFilterTech] = useState<string>("ALL");

  const activeRequests = requests.filter(
    (r) => r.status !== "RESOLVED" && r.status !== "DUPLICATE"
  );

  const displayedRequests = activeRequests.filter((r) => {
    if (filterTech !== "ALL" && r.technicianId !== filterTech) return false;
    return true;
  });

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Health & Operational Control Cockpit */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Operations Manager Cockpit
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5">
            Is the operation under control?
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Real-time workload distribution, response SLA exceptions, and technician capacity oversight.
          </p>
        </div>

        {/* Operational Health Badge */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-lg">
          <div className="text-right">
            <div className="text-xs font-bold text-slate-900">
              {health.status === "CONTROLLED" ? (
                <span className="text-emerald-700 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Operational Control Good
                </span>
              ) : (
                <span className="text-amber-700 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4 text-amber-600" /> Attention Required
                </span>
              )}
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              Health Score: {health.score} / 100 • {stats.overdueCount} SLA Breaches
            </div>
          </div>
          <div className="w-10 h-10 rounded-full border-4 border-amber-400 bg-white flex items-center justify-center font-bold text-xs text-slate-900 font-mono">
            {health.score}
          </div>
        </div>
      </div>

      {/* Operations Key Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 p-4 rounded-lg">
          <div className="text-xs text-slate-500 font-medium">Open Requests</div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">
            {stats.openRequestsCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Active in pipeline</div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-lg">
          <div className="text-xs text-red-700 font-medium flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Urgent
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">
            {stats.urgentCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Stock/Critical</div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-lg">
          <div className="text-xs text-amber-700 font-medium flex items-center gap-1">
            <Wrench className="w-3.5 h-3.5" /> Unassigned
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">
            {stats.unassignedCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Awaiting tech</div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-lg">
          <div className="text-xs text-red-700 font-medium flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Overdue
          </div>
          <div className="text-2xl font-bold text-red-600 mt-1 font-mono">
            {stats.overdueCount}
          </div>
          <div className="text-[10px] text-red-500 font-medium mt-0.5">&gt; 2h SLA Breach</div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-lg">
          <div className="text-xs text-purple-700 font-medium flex items-center gap-1">
            <PauseCircle className="w-3.5 h-3.5" /> Waiting Parts
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">
            {stats.waitingPartCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Supplier pending</div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-lg">
          <div className="text-xs text-emerald-700 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-1 font-mono">
            {stats.resolvedCount}
          </div>
          <div className="text-[10px] text-emerald-600 font-medium mt-0.5">Completed</div>
        </div>
      </div>

      {/* Technician Workload Matrix */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-700" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Technician Field Workload & Availability (T1, T2, T3)
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            3 Active Field Engineers
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {technicianWorkload.map((tech) => {
            const activeJobs = requests.filter(
              (r) => r.technicianId === tech.id && r.status !== "RESOLVED" && r.status !== "DUPLICATE"
            );

            return (
              <div
                key={tech.id}
                className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900 bg-white px-1.5 py-0.5 border border-slate-300 rounded">
                        {tech.id}
                      </span>
                      <span className="font-semibold text-slate-900 text-xs">{tech.name}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{tech.skills}</div>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                      activeJobs.length === 0
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-sky-50 text-sky-700 border-sky-200"
                    }`}
                  >
                    {activeJobs.length} active job
                  </span>
                </div>

                {/* Assigned Job Details */}
                <div className="border-t border-slate-200/80 pt-2 space-y-1.5">
                  <div className="text-[11px] text-slate-500 font-medium">Assigned Load:</div>
                  {activeJobs.length === 0 ? (
                    <div className="text-xs text-slate-400 italic">No active jobs assigned</div>
                  ) : (
                    activeJobs.map((j) => (
                      <div
                        key={j.id}
                        onClick={() => onSelectRequest(j)}
                        className="bg-white border border-slate-200 rounded p-2 text-xs hover:border-slate-300 transition cursor-pointer flex items-center justify-between"
                      >
                        <div className="truncate mr-2">
                          <span className="font-mono font-bold text-slate-900">{j.id}:</span>{" "}
                          <span className="text-slate-700">{j.customer?.name || j.customerId}</span>
                        </div>
                        <StatusBadge status={j.status} />
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Operational Exceptions & Management Escalation Queue */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Management Exceptions & Escalations ({exceptions.length})
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            Immediate supervisor intervention required
          </span>
        </div>

        {exceptions.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-lg">
            No operational exceptions active.
          </div>
        ) : (
          <div className="space-y-2.5">
            {exceptions.map((exc) => {
              const fullReq = requests.find((r) => r.id === exc.id);
              return (
                <div
                  key={exc.id}
                  className="bg-slate-50 hover:bg-white border border-slate-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900">{exc.id}</span>
                      <span className="text-xs font-bold text-red-700">{exc.title}</span>
                      <PriorityBadge priority={exc.priority} />
                      <StatusBadge status={exc.status} />
                    </div>
                    <p className="text-xs text-slate-600">{exc.description}</p>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      <span>Customer: <strong>{exc.customer}</strong></span>
                      <span>•</span>
                      <span>Assigned: <strong>{exc.technicianName}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => fullReq && onSelectRequest(fullReq)}
                      className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded cursor-pointer"
                    >
                      Inspect Request
                    </button>
                    {fullReq && (
                      <button
                        onClick={() => onOpenAssign(fullReq)}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded cursor-pointer flex items-center gap-1"
                      >
                        <span>Reassign Job</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* All Active Requests Overview Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden space-y-0">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
            Master Operational Work Queue ({displayedRequests.length})
          </div>

          {/* Filter by Technician */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Filter by Technician:</span>
            <select
              value={filterTech}
              onChange={(e) => setFilterTech(e.target.value)}
              className="px-2.5 py-1 text-xs border border-slate-200 rounded bg-white text-slate-800"
            >
              <option value="ALL">All Technicians</option>
              {technicians.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.id}: {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/75 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-3 py-3">Fault Summary</th>
                <th className="px-3 py-3">Priority</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Assigned Tech</th>
                <th className="px-3 py-3">Visit Schedule</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedRequests.map((req) => (
                <tr
                  key={req.id}
                  onClick={() => onSelectRequest(req)}
                  className="hover:bg-slate-50 transition cursor-pointer"
                >
                  <td className="px-4 py-3 font-mono font-bold text-slate-900">
                    {req.id}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    {req.customer?.name || req.customerId}
                  </td>
                  <td className="px-3 py-3 text-slate-700 max-w-xs truncate">
                    {req.message}
                  </td>
                  <td className="px-3 py-3">
                    <PriorityBadge priority={req.priority} />
                  </td>
                  <td className="px-3 py-3">
                    <StatusBadge status={req.status} />
                  </td>
                  <td className="px-3 py-3 font-medium text-slate-800">
                    {req.technician ? `${req.technician.id}: ${req.technician.name.split(" ")[0]}` : "Unassigned"}
                  </td>
                  <td className="px-3 py-3 text-slate-600">
                    {formatDate(req.scheduledAt)}
                  </td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onOpenAssign(req)}
                      className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded cursor-pointer"
                    >
                      Reassign
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
