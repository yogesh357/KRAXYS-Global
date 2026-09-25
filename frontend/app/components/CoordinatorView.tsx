"use client";

import React, { useState } from "react";
import {
  CoordinatorDashboardData,
  ServiceRequest,
  Technician,
  NeedsAttentionItem,
} from "../types";
import { PriorityBadge, StatusBadge, ChannelBadge } from "./Badges";
import { CustomerUpdateBox } from "./CustomerUpdateBox";
import {
  AlertCircle,
  AlertTriangle,
  Clock,
  HelpCircle,
  PauseCircle,
  Search,
  Filter,
  Wrench,
  Calendar,
  Copy,
  ChevronRight,
  CheckCircle2,
  Inbox,
  ArrowUpDown,
} from "lucide-react";

interface Props {
  data: CoordinatorDashboardData;
  requests: ServiceRequest[];
  technicians: Technician[];
  onSelectRequest: (req: ServiceRequest) => void;
  onOpenAssign: (req: ServiceRequest) => void;
  onOpenSchedule: (req: ServiceRequest) => void;
  onOpenClarify: (req: ServiceRequest) => void;
  onOpenDuplicate: (req: ServiceRequest) => void;
  onOpenResolve: (req: ServiceRequest) => void;
}

export function CoordinatorView({
  data,
  requests,
  technicians,
  onSelectRequest,
  onOpenAssign,
  onOpenSchedule,
  onOpenClarify,
  onOpenDuplicate,
  onOpenResolve,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("ALL");

  const { stats, needsAttention } = data;

  // Filter requests
  const filteredRequests = requests.filter((r) => {
    // Tab filter
    if (activeFilter === "URGENT" && r.priority !== "URGENT") return false;
    if (activeFilter === "UNASSIGNED" && (r.technicianId || r.status === "RESOLVED" || r.status === "DUPLICATE")) return false;
    if (activeFilter === "OVERDUE" && !r.isOverdue) return false;
    if (activeFilter === "NEEDS_CLARIFICATION" && r.status !== "NEEDS_CLARIFICATION") return false;
    if (activeFilter === "WAITING_PART" && r.status !== "WAITING_PART") return false;
    if (activeFilter === "RESOLVED" && r.status !== "RESOLVED") return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = r.id.toLowerCase().includes(q);
      const matchCust = (r.customer?.name || r.customerId).toLowerCase().includes(q);
      const matchMsg = r.message.toLowerCase().includes(q);
      const matchEq = (r.equipmentId || "").toLowerCase().includes(q);
      const matchTech = (r.technician?.name || "").toLowerCase().includes(q);
      return matchId || matchCust || matchMsg || matchEq || matchTech;
    }

    return true;
  });

  const handleNeedsAttentionAction = (item: NeedsAttentionItem) => {
    const fullReq = requests.find((r) => r.id === item.requestId);
    if (!fullReq) return;

    if (item.actionType === "ASSIGN_TECHNICIAN") {
      onOpenAssign(fullReq);
    } else if (item.actionType === "SCHEDULE_VISIT") {
      onOpenSchedule(fullReq);
    } else if (item.actionType === "REQUEST_CLARIFICATION") {
      onOpenClarify(fullReq);
    } else if (item.actionType === "RESOLVE_DUPLICATE") {
      onOpenDuplicate(fullReq);
    } else {
      onSelectRequest(fullReq);
    }
  };

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
      {/* Top Banner Context */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Coordinator Dispatch Console
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5">
            What requires processing right now?
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Incoming external requests triaged and dispatched into prioritized, scheduled, and trackable technician visits.
          </p>
        </div>


      </div>

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Urgent */}
        <button
          onClick={() => setActiveFilter(activeFilter === "URGENT" ? "ALL" : "URGENT")}
          className={`p-4 rounded-lg border text-left transition cursor-pointer ${activeFilter === "URGENT"
              ? "bg-red-50 border-red-300 ring-2 ring-red-500/20"
              : "bg-white border-slate-200 hover:border-slate-300"
            }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium text-red-700 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> Urgent
            </span>
            <span className="text-[10px] text-slate-400">Stock/Damage</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
            {stats.urgentCount}
          </div>
        </button>

        {/* Unassigned */}
        <button
          onClick={() => setActiveFilter(activeFilter === "UNASSIGNED" ? "ALL" : "UNASSIGNED")}
          className={`p-4 rounded-lg border text-left transition cursor-pointer ${activeFilter === "UNASSIGNED"
              ? "bg-amber-50 border-amber-300 ring-2 ring-amber-500/20"
              : "bg-white border-slate-200 hover:border-slate-300"
            }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium text-amber-700 flex items-center gap-1">
              <Wrench className="w-3.5 h-3.5" /> Unassigned
            </span>
            <span className="text-[10px] text-slate-400">Needs Tech</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
            {stats.unassignedCount}
          </div>
        </button>

        {/* Needs Clarification */}
        <button
          onClick={() => setActiveFilter(activeFilter === "NEEDS_CLARIFICATION" ? "ALL" : "NEEDS_CLARIFICATION")}
          className={`p-4 rounded-lg border text-left transition cursor-pointer ${activeFilter === "NEEDS_CLARIFICATION"
              ? "bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20"
              : "bg-white border-slate-200 hover:border-slate-300"
            }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium text-indigo-700 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" /> Clarification
            </span>
            <span className="text-[10px] text-slate-400">Missing Info</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
            {stats.needsClarificationCount}
          </div>
        </button>

        {/* Overdue */}
        <button
          onClick={() => setActiveFilter(activeFilter === "OVERDUE" ? "ALL" : "OVERDUE")}
          className={`p-4 rounded-lg border text-left transition cursor-pointer ${activeFilter === "OVERDUE"
              ? "bg-red-50 border-red-300 ring-2 ring-red-500/20"
              : "bg-white border-slate-200 hover:border-slate-300"
            }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium text-red-700 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Overdue
            </span>
            <span className="text-[10px] text-red-600 font-semibold">&gt; 2h SLA</span>
          </div>
          <div className="text-2xl font-bold text-red-600 mt-2 font-mono">
            {stats.overdueCount}
          </div>
        </button>

        {/* Waiting Part */}
        <button
          onClick={() => setActiveFilter(activeFilter === "WAITING_PART" ? "ALL" : "WAITING_PART")}
          className={`p-4 rounded-lg border text-left transition cursor-pointer col-span-2 sm:col-span-1 ${activeFilter === "WAITING_PART"
              ? "bg-purple-50 border-purple-300 ring-2 ring-purple-500/20"
              : "bg-white border-slate-200 hover:border-slate-300"
            }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium text-purple-700 flex items-center gap-1">
              <PauseCircle className="w-3.5 h-3.5" /> Waiting Part
            </span>
            <span className="text-[10px] text-slate-400">Supplier Delay</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
            {stats.waitingPartCount}
          </div>
        </button>
      </div>

      {/* Prominent "Needs Attention" Action Board */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Immediate Action Items ({needsAttention.length})
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            Ordered by business urgency & SLA deadline
          </span>
        </div>

        {needsAttention.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1.5" />
            All requests have been triaged and assigned. Operational queue clear!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {needsAttention.map((item) => {
              const fullReq = requests.find((r) => r.id === item.requestId);
              return (
                <div
                  key={item.requestId}
                  className="bg-slate-50 hover:bg-white border border-slate-200 rounded-lg p-4 flex flex-col justify-between transition shadow-2xs hover:shadow-xs group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-900 group-hover:text-blue-600 transition">
                        {item.requestId}
                      </span>
                      <PriorityBadge priority={item.priority} />
                    </div>

                    <div className="text-xs font-semibold text-slate-900 line-clamp-1">
                      {item.customer}
                    </div>

                    <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed bg-white/70 p-2 rounded border border-slate-200/60 font-mono text-[11px]">
                      &quot;{item.title}&quot;
                    </p>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100/70 text-amber-800 font-semibold border border-amber-200">
                        {item.badgeText}
                      </span>
                      {item.overdue && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-semibold border border-red-200">
                          Overdue
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-200/70 flex items-center justify-between gap-2">
                    <button
                      onClick={() => fullReq && onSelectRequest(fullReq)}
                      className="text-xs text-slate-500 hover:text-slate-900 font-medium cursor-pointer"
                    >
                      Details
                    </button>

                    <button
                      onClick={() => handleNeedsAttentionAction(item)}
                      className="px-3 py-1.5 text-xs font-semibold rounded bg-slate-900 text-white hover:bg-slate-800 transition shadow-xs cursor-pointer flex items-center gap-1"
                    >
                      <span>{item.actionLabel}</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Request Queue Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden space-y-0">
        {/* Table Filter Tabs and Search Bar */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50">
          {/* Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: "ALL", label: `All (${requests.length})` },
              { id: "URGENT", label: `Urgent (${stats.urgentCount})` },
              { id: "UNASSIGNED", label: `Unassigned (${stats.unassignedCount})` },
              { id: "OVERDUE", label: `Overdue (${stats.overdueCount})` },
              { id: "NEEDS_CLARIFICATION", label: `Clarification (${stats.needsClarificationCount})` },
              { id: "WAITING_PART", label: `Waiting Part (${stats.waitingPartCount})` },
              { id: "RESOLVED", label: `Resolved (${stats.resolvedCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition cursor-pointer ${activeFilter === tab.id
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "text-slate-600 hover:bg-slate-200/60"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ID, customer, msg..."
              className="w-full text-xs pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-md text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/75 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Request ID</th>
                <th className="px-4 py-3">Customer & Fault</th>
                <th className="px-3 py-3">Channel</th>
                <th className="px-3 py-3">Priority</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Assigned Tech</th>
                <th className="px-3 py-3">Scheduled Visit</th>
                <th className="px-3 py-3">Received</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-10 text-center text-slate-400">
                    <Inbox className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    No requests match the selected filter or search term.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr
                    key={req.id}
                    onClick={() => onSelectRequest(req)}
                    className="hover:bg-slate-50 transition cursor-pointer group"
                  >
                    {/* ID */}
                    <td className="px-4 py-3 font-mono font-bold text-slate-900 group-hover:text-blue-600">
                      {req.id}
                    </td>

                    {/* Customer & Message */}
                    <td className="px-4 py-3 max-w-xs">
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <span>{req.customer?.name || req.customerId}</span>
                        {req.equipmentId && (
                          <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1 rounded">
                            {req.equipmentId}
                          </span>
                        )}
                      </div>
                      <div className="text-slate-600 text-[11px] truncate mt-0.5">
                        {req.message}
                      </div>
                      {req.possibleDuplicateId && req.status !== "DUPLICATE" && (
                        <div className="text-[10px] text-amber-700 font-medium flex items-center gap-1 mt-0.5">
                          <Copy className="w-2.5 h-2.5" /> Possible duplicate of {req.possibleDuplicateId}
                        </div>
                      )}
                    </td>

                    {/* Channel */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      <ChannelBadge channel={req.channel} />
                    </td>

                    {/* Priority */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      <PriorityBadge priority={req.priority} reason={req.priorityReason} />
                    </td>

                    {/* Status */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="space-y-1">
                        <StatusBadge status={req.status} />
                        {req.isOverdue && (
                          <div className="text-[10px] text-red-600 font-semibold">
                            ⚠️ Overdue
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Technician */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      {req.technician ? (
                        <div className="font-medium text-slate-800">
                          {req.technician.id}: {req.technician.name.split(" ")[0]}
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenAssign(req);
                          }}
                          className="text-[11px] text-amber-700 hover:underline font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 cursor-pointer"
                        >
                          + Assign
                        </button>
                      )}
                    </td>

                    {/* Scheduled Visit */}
                    <td className="px-3 py-3 whitespace-nowrap text-slate-700">
                      {req.scheduledAt ? (
                        <span className="font-medium">{formatDate(req.scheduledAt)}</span>
                      ) : req.technicianId && req.status === "ASSIGNED" ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenSchedule(req);
                          }}
                          className="text-[11px] text-amber-700 hover:underline font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 cursor-pointer"
                        >
                          + Schedule
                        </button>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* Received */}
                    <td className="px-3 py-3 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      {formatDate(req.receivedAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 whitespace-nowrap text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                      <CustomerUpdateBox
                        requestId={req.id}
                        updateText={
                          req.customerUpdateMessage ||
                          `Atlas Industrial Services: Status update for request ${req.id}: ${req.status}.`
                        }
                        compact
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
