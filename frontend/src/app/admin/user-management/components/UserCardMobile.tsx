"use client";

import React from "react";
import { Eye, Ban, Trash2 } from "lucide-react";
import { UserData } from "./UserTableRow";

interface UserCardMobileProps {
  users: UserData[];
  onView: (user: UserData) => void;
  onSuspend: (user: UserData) => void;
  onDelete: (user: UserData) => void;
}

const accountTypeBadge = (type: string) => {
  if (type === "Lawyer") {
    return {
      bg: "#eff6ff",
      color: "#2563eb",
      border: "1px solid #bfdbfe",
    };
  }
  if (type === "Client (Enterprise)") {
    return {
      bg: "#374151",
      color: "#fff",
      border: "1px solid #374151",
    };
  }
  return {
    bg: "#f1f5f9",
    color: "#475569",
    border: "1px solid #e2e8f0",
  };
};

const statusConfig = (status: string) => {
  switch (status) {
    case "Active":
      return { dot: "#22c55e", text: "#16a34a", bg: "#f0fdf4" };
    case "Suspended":
      return { dot: "#f97316", text: "#ea580c", bg: "#fff7ed" };
    case "Pending":
      return { dot: "#eab308", text: "#ca8a04", bg: "#fefce8" };
    default:
      return { dot: "#94a3b8", text: "#64748b", bg: "#f8fafc" };
  }
};

export default function UserCardMobile({
  users,
  onView,
  onSuspend,
  onDelete,
}: UserCardMobileProps) {
  if (users.length === 0) {
    return (
      <div className="md:hidden">
        <div
          className="rounded-xl py-12 text-center"
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <p className="text-sm text-slate-400 font-medium">
            No users found matching your criteria.
          </p>
          <p className="text-xs text-slate-300 mt-1">
            Try adjusting your filters or search query.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="md:hidden space-y-3">
      {users.map((user) => {
        const badge = accountTypeBadge(user.accountType);
        const status = statusConfig(user.status);

        return (
          <div
            key={user.id}
            className="rounded-xl p-4 transition-all duration-200 hover:shadow-md"
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            {/* Top: Avatar + Name + Status */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-bold text-white shrink-0"
                  style={{
                    background:
                      "linear-gradient(135deg, #3b82f6 0%, #1e3a8a 100%)",
                  }}
                >
                  {user.avatar}
                </div>
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold text-slate-700 truncate">
                    {user.name}
                  </p>
                  <p className="text-[12px] text-slate-400 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
              <span
                className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                style={{ background: status.bg, color: status.text }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: status.dot }}
                />
                {user.status}
              </span>
            </div>

            {/* Middle: Badge + Date */}
            <div className="flex items-center justify-between mb-3">
              <span
                className="inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full"
                style={{
                  background: badge.bg,
                  color: badge.color,
                  border: badge.border,
                }}
              >
                {user.accountType}
              </span>
              <span className="text-[12px] text-slate-400">
                {user.registrationDate}
              </span>
            </div>

            {/* Bottom: Actions */}
            <div
              className="flex items-center gap-1 pt-3"
              style={{ borderTop: "1px solid #f1f5f9" }}
            >
              <button
                onClick={() => onView(user)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[12px] font-medium rounded-lg hover:bg-blue-50 transition-colors text-slate-500 hover:text-blue-600"
                aria-label={`View ${user.name}`}
              >
                <Eye size={14} />
                View
              </button>
              <button
                onClick={() => onSuspend(user)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[12px] font-medium rounded-lg hover:bg-orange-50 transition-colors text-slate-500 hover:text-orange-500"
                aria-label={`Suspend ${user.name}`}
              >
                <Ban size={14} />
                Suspend
              </button>
              <button
                onClick={() => onDelete(user)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[12px] font-medium rounded-lg hover:bg-red-50 transition-colors text-slate-500 hover:text-red-500"
                aria-label={`Delete ${user.name}`}
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
