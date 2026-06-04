"use client";

import React from "react";
import { Search, ChevronDown } from "lucide-react";

interface UserFiltersProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

const tabs = [
  { label: "All Users", value: "all" },
  { label: "Lawyers", value: "Lawyer" },
  { label: "Clients", value: "Client" },
];

const statusOptions = [
  { label: "All Statuses", value: "all" },
  { label: "Active", value: "Active" },
  { label: "Suspended", value: "Suspended" },
  { label: "Pending", value: "Pending" },
];

export default function UserFilters({
  activeTab,
  onTabChange,
  statusFilter,
  onStatusFilterChange,
  searchQuery,
  onSearchChange,
}: UserFiltersProps) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: "#fff",
        border: "1px solid #e2e8f0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <div className="p-4 sm:p-5 space-y-4">
        {/* Search bar */}
        <div
          className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg"
          style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
          }}
        >
          <Search size={16} color="#94a3b8" className="shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search users by name or email..."
            className="bg-transparent outline-none text-[13px] w-full placeholder:text-slate-400 text-slate-700"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="text-[11px] text-slate-400 hover:text-slate-600 shrink-0 font-medium"
            >
              Clear
            </button>
          )}
        </div>

        {/* Tabs + Status filter row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Tabs */}
          <div className="flex overflow-x-auto no-scrollbar -mx-1">
            <div
              className="flex p-1 rounded-lg gap-0.5"
              style={{ background: "#f1f5f9" }}
            >
              {tabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => onTabChange(tab.value)}
                  className="px-4 py-2 text-[13px] font-medium rounded-md whitespace-nowrap transition-all duration-200"
                  style={{
                    background:
                      activeTab === tab.value ? "#fff" : "transparent",
                    color:
                      activeTab === tab.value ? "#1e3a8a" : "#64748b",
                    boxShadow:
                      activeTab === tab.value
                        ? "0 1px 3px rgba(0,0,0,0.08)"
                        : "none",
                    fontWeight: activeTab === tab.value ? 600 : 400,
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Status filter dropdown */}
          <div className="relative w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="w-full sm:w-auto appearance-none pl-3.5 pr-9 py-2 text-[13px] rounded-lg outline-none cursor-pointer transition-colors text-slate-600 font-medium"
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
              }}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              color="#94a3b8"
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
