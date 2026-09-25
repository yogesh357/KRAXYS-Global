"use client";

import React, { useState } from "react";
import { Copy, Check, MessageSquare } from "lucide-react";

interface Props {
  requestId: string;
  updateText: string;
  compact?: boolean;
}

export function CustomerUpdateBox({ requestId, updateText, compact = false }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(updateText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (compact) {
    return (
      <button
        onClick={handleCopy}
        title="Copy canned customer update"
        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition shadow-xs cursor-pointer active:scale-95"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-emerald-700 font-semibold">Copied!</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5 text-slate-500" />
            <span>Copy Update</span>
          </>
        )}
      </button>
    );
  }

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-md p-3.5 text-xs text-slate-700">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 font-medium text-slate-900">
          <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
          <span>Prepared Customer Status Update (Ready to Send)</span>
        </div>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded bg-slate-900 hover:bg-slate-800 text-white transition shadow-xs cursor-pointer active:scale-95"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-300" />
              <span>Copied to Clipboard</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Customer Update</span>
            </>
          )}
        </button>
      </div>
      <p className="bg-white border border-slate-200 rounded p-2.5 text-slate-800 font-mono text-[11px] leading-relaxed select-all">
        {updateText}
      </p>
      <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
        <span>Channel dispatch:</span>
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        <span>Ready for Email / WhatsApp / Phone callback</span>
      </div>
    </div>
  );
}
