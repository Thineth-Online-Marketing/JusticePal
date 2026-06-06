"use client";

import React from "react";
import UserTableRow, { UserData } from "./UserTableRow";

interface UserTableProps {
  users: UserData[];
  onView: (user: UserData) => void;
  onSuspend: (user: UserData) => void;
  onDelete: (user: UserData) => void;
}

export default function UserTable({
  users,
  onView,
  onSuspend,
  onDelete,
}: UserTableProps) {
  if (users.length === 0) {
    return (
      <div
        className="rounded-xl hidden md:block"
        style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        <div className="py-16 text-center">
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
    <div
      className="rounded-xl overflow-hidden hidden md:block"
      style={{
        background: "#fff",
        border: "1px solid #e2e8f0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              <th className="px-5 py-3.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                User Name
              </th>
              <th className="px-5 py-3.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Account Type
              </th>
              <th className="px-5 py-3.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Registration Date
              </th>
              <th className="px-5 py-3.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-5 py-3.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <UserTableRow
                key={user.id}
                user={user}
                onView={onView}
                onSuspend={onSuspend}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
