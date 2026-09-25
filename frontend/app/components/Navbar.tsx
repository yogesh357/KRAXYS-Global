"use client";

import React, { useState } from "react";
import { UserRole } from "../types";
import {
  Wrench,
  Clock,
  RotateCcw,
  Plus,
  User,
  ShieldAlert,
  ChevronDown,
} from "lucide-react";

interface Props {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onOpenNewRequest: () => void;
  onResetData: () => void;
  resetting: boolean;
}

export function Navbar({
  currentRole,
  onRoleChange,
  onOpenNewRequest,
  onResetData,
  resetting,
}: Props) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const roleLabels: Record<UserRole, { title: string; subtitle: string; icon: string }> = {
    COORDINATOR: {
      title: "Alex Morgan",
      subtitle: "Service Coordinator",
      icon: "👷",
    },
    TECHNICIAN_T1: {
      title: "Marcus Vance (T1)",
      subtitle: "Refrigeration Specialist",
      icon: "🔧",
    },
    TECHNICIAN_T2: {
      title: "Elena Rostova (T2)",
      subtitle: "Machinery & Hydraulics",
      icon: "🔧",
    },
    TECHNICIAN_T3: {
      title: "David Chen (T3)",
      subtitle: "Electrical & Controls",
      icon: "🔧",
    },
    OPERATIONS_MANAGER: {
      title: "Samantha Wright",
      subtitle: "Operations Manager",
      icon: "📊",
    },
  };

  const activeRoleInfo = roleLabels[currentRole];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-base shadow-xs">
              <Wrench className="w-5 h-5 text-slate-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-base tracking-tight">ATLAS</span>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                  Industrial Services
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Commercial Equipment Maintenance Desk
              </p>
            </div>
          </div>

          {/* Fixed Demo Clock Badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Demo Time:</span>
            <span className="font-semibold text-slate-900">01 Oct 2026, 09:00 AM UTC</span>
          </div>

          {/* Right Action Tools & Role Switcher */}
          <div className="flex items-center gap-3">
            {/* Reset Seed Button */}
            <button
              onClick={onResetData}
              disabled={resetting}
              title="Reset database to initial 8 requests"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-md transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${resetting ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">{resetting ? "Resetting..." : "Reset Seed"}</span>
            </button>

            {/* New Request Button */}
            <button
              onClick={onOpenNewRequest}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ New Request</span>
            </button>

            {/* Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition cursor-pointer"
              >
                <span className="text-base">{activeRoleInfo.icon}</span>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-semibold text-slate-900 leading-tight">
                    {activeRoleInfo.title}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    {activeRoleInfo.subtitle}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-2 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Switch Workspace Role
                  </div>

                  {(Object.keys(roleLabels) as UserRole[]).map((roleKey) => {
                    const info = roleLabels[roleKey];
                    const isSelected = currentRole === roleKey;
                    return (
                      <button
                        key={roleKey}
                        onClick={() => {
                          onRoleChange(roleKey);
                          setDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-left text-xs transition cursor-pointer ${
                          isSelected
                            ? "bg-slate-900 text-white font-semibold"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span className="text-base">{info.icon}</span>
                        <div>
                          <div className={isSelected ? "text-white font-semibold" : "text-slate-900 font-medium"}>
                            {info.title}
                          </div>
                          <div className={isSelected ? "text-slate-300 text-[10px]" : "text-slate-500 text-[10px]"}>
                            {info.subtitle}
                          </div>
                        </div>
                      </button>
                    );
                  })}

                  <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-500">
                    Demonstration Mode: Role selector simulates role-based viewports and permissions.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
