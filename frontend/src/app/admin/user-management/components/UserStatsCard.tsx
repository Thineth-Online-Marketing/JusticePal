"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface UserStatsCardProps {
  label: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  accent: string;
  highlight?: boolean;
}

export default function UserStatsCard({
  label,
  value,
  subtitle,
  icon: Icon,
  accent,
  highlight = false,
}: UserStatsCardProps) {
  return (
    <div
      className="rounded-xl p-4 sm:p-5 flex flex-col gap-3 transition-all duration-200 hover:shadow-md group"
      style={{
        background: "#fff",
        border: highlight ? `1.5px solid ${accent}40` : "1px solid #e2e8f0",
        boxShadow: highlight
          ? `0 2px 8px ${accent}15`
          : "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
          style={{ background: `${accent}12` }}
        >
          <Icon size={20} color={accent} />
        </div>
      </div>
      <div>
        <p className="text-2xl sm:text-[28px] font-bold text-slate-800 leading-none">
          {value}
        </p>
        <p className="text-[13px] font-medium text-slate-600 mt-1.5">
          {label}
        </p>
        <p
          className="text-[11px] mt-0.5 font-medium"
          style={{ color: highlight ? accent : "#94a3b8" }}
        >
          {subtitle}
        </p>
      </div>
    </div>
  );
}
