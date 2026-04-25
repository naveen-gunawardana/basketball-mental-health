"use client";

import { CalendarClock, ArrowRight } from "lucide-react";

interface Props {
  onSchedule: () => void;
}

export function FirstCallCard({ onSchedule }: Props) {
  return (
    <button
      type="button"
      onClick={onSchedule}
      className="w-full rounded-2xl bg-gradient-to-br from-orange-50 to-orange-50/40 ring-1 ring-orange-200 hover:ring-orange-300 p-5 mb-4 flex items-center gap-4 group transition-all text-left"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500 shadow-sm shrink-0">
        <CalendarClock className="h-5 w-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-bold text-navy tracking-tight">Schedule your first call</p>
        <p className="text-[12px] text-navy/55 mt-0.5">15 minutes. Just a chance to meet.</p>
      </div>
      <ArrowRight className="h-4 w-4 text-navy/40 group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all shrink-0" />
    </button>
  );
}
