"use client";

import React from "react";
import { Eye, Ban, Trash2 } from "lucide-react";

export interface UserData {
  id: number;
  name: string;
  email: string;
  accountType: string;
  registrationDate: string;
  status: "Active" | "Suspended" | "Pending";
  avatar: string;
}

interface UserTableRowProps {
  user: UserData;
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
  // Client
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

export default function UserTableRow({
  user,
  onView,
  onSuspend,
  onDelete,
}: UserTableRowProps) {
  const badge = accountTypeBadge(user.accountType);
  const status = statusConfig(user.status);

  return (
    <tr className="border-t border-slate-100 hover:bg-slate-50/60 transition-colors group">
      {/* User Name + Email */}
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
            style={{
              background:
                "linear-gradient(135deg, #3b82f6 0%, #1e3a8a 100%)",
            }}
          >
            {user.avatar}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-slate-700 truncate">
              {user.name}
            </p>
            <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
          </div>
        </div>
      </td>

      {/* Account Type */}
      <td className="px-5 py-3.5">
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
      </td>

      {/* Registration Date */}
      <td className="px-5 py-3.5 text-[13px] text-slate-500">
        {user.registrationDate}
      </td>

      {/* Status */}
      <td className="px-5 py-3.5">
        <span
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full"
          style={{ background: status.bg, color: status.text }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: status.dot }}
          />
          {user.status}
        </span>
      </td>

      {/* Actions */}
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onView(user)}
            className="p-2 rounded-lg hover:bg-blue-50 transition-colors group/btn"
            aria-label={`View ${user.name}`}
            title="View"
          >
            <Eye size={15} className="text-slate-400 group-hover/btn:text-blue-600 transition-colors" />
          </button>
          <button
            onClick={() => onSuspend(user)}
            className="p-2 rounded-lg hover:bg-orange-50 transition-colors group/btn"
            aria-label={`Suspend ${user.name}`}
            title="Suspend"
          >
            <Ban size={15} className="text-slate-400 group-hover/btn:text-orange-500 transition-colors" />
          </button>
          <button
            onClick={() => onDelete(user)}
            className="p-2 rounded-lg hover:bg-red-50 transition-colors group/btn"
            aria-label={`Delete ${user.name}`}
            title="Delete"
          >
            <Trash2 size={15} className="text-slate-400 group-hover/btn:text-red-500 transition-colors" />
          </button>
        </div>
      </td>
    </tr>
  );
}
