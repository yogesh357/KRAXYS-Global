import React from "react";
import { Priority, RequestStatus, Channel } from "../types";
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Clock,
  HelpCircle,
  Copy,
  Mail,
  MessageSquare,
  Phone,
  Wrench,
  PauseCircle,
} from "lucide-react";

export function PriorityBadge({ priority, reason }: { priority: Priority; reason?: string | null }) {
  let style = "bg-slate-100 text-slate-700 border-slate-200";
  let icon = null;

  if (priority === "URGENT") {
    style = "bg-red-50 text-red-700 border-red-200 font-semibold";
    icon = <AlertCircle className="w-3 h-3 text-red-600 inline-block mr-1" />;
  } else if (priority === "HIGH") {
    style = "bg-amber-50 text-amber-700 border-amber-200 font-medium";
    icon = <AlertTriangle className="w-3 h-3 text-amber-600 inline-block mr-1" />;
  } else {
    style = "bg-slate-100 text-slate-600 border-slate-200";
  }

  return (
    <span
      title={reason || undefined}
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs border tracking-tight ${style}`}
    >
      {icon}
      {priority}
    </span>
  );
}

export function StatusBadge({ status }: { status: RequestStatus }) {
  let style = "bg-slate-100 text-slate-700 border-slate-200";
  let label = status.replace(/_/g, " ");
  let icon = null;

  switch (status) {
    case "NEW":
      style = "bg-blue-50 text-blue-700 border-blue-200 font-medium";
      icon = <Clock className="w-3 h-3 mr-1" />;
      break;
    case "NEEDS_CLARIFICATION":
      style = "bg-indigo-50 text-indigo-700 border-indigo-200 font-medium";
      icon = <HelpCircle className="w-3 h-3 mr-1" />;
      label = "NEEDS CLARIFICATION";
      break;
    case "ASSIGNED":
      style = "bg-sky-50 text-sky-700 border-sky-200 font-medium";
      icon = <Wrench className="w-3 h-3 mr-1" />;
      break;
    case "IN_PROGRESS":
      style = "bg-orange-50 text-orange-700 border-orange-200 font-medium animate-pulse";
      icon = <Clock className="w-3 h-3 mr-1" />;
      label = "IN PROGRESS";
      break;
    case "WAITING_PART":
      style = "bg-purple-50 text-purple-700 border-purple-200 font-medium";
      icon = <PauseCircle className="w-3 h-3 mr-1" />;
      label = "WAITING PART";
      break;
    case "RESOLVED":
      style = "bg-emerald-50 text-emerald-700 border-emerald-200 font-medium";
      icon = <CheckCircle2 className="w-3 h-3 mr-1" />;
      break;
    case "DUPLICATE":
      style = "bg-slate-100 text-slate-500 border-slate-300 line-through";
      icon = <Copy className="w-3 h-3 mr-1" />;
      break;
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${style}`}>
      {icon}
      {label}
    </span>
  );
}

export function ChannelBadge({ channel }: { channel: Channel }) {
  let icon = <Mail className="w-3 h-3 mr-1 text-slate-500" />;
  let label = "Email";

  if (channel === "WHATSAPP") {
    icon = <MessageSquare className="w-3 h-3 mr-1 text-emerald-600" />;
    label = "WhatsApp";
  } else if (channel === "PHONE") {
    icon = <Phone className="w-3 h-3 mr-1 text-blue-600" />;
    label = "Phone";
  }

  return (
    <span className="inline-flex items-center text-xs text-slate-600 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">
      {icon}
      {label}
    </span>
  );
}
