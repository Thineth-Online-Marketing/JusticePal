"use client";

import React, { useState } from "react";
import { X, ChevronDown } from "lucide-react";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (user: {
    name: string;
    email: string;
    accountType: string;
    status: string;
  }) => void;
}

export default function AddUserModal({
  isOpen,
  onClose,
  onSubmit,
}: AddUserModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [accountType, setAccountType] = useState("Client");
  const [status, setStatus] = useState("Active");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    onSubmit({ name: name.trim(), email: email.trim(), accountType, status });
    setName("");
    setEmail("");
    setAccountType("Client");
    setStatus("Active");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden animate-in fade-in zoom-in-95"
        style={{
          background: "#fff",
          boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 sm:px-6 py-4"
          style={{
            background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
          }}
        >
          <div>
            <h2 className="text-[15px] font-bold text-white">Add New User</h2>
            <p className="text-[11px] text-blue-200 mt-0.5">
              Create a new account on the platform
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/15 transition-colors"
            aria-label="Close modal"
          >
            <X size={18} color="#fff" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-[12px] font-semibold text-slate-600 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter full name"
              required
              className="w-full px-3.5 py-2.5 text-[13px] rounded-lg outline-none transition-colors text-slate-700 placeholder:text-slate-400"
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = "#3b82f6")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "#e2e8f0")
              }
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-[12px] font-semibold text-slate-600 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              required
              className="w-full px-3.5 py-2.5 text-[13px] rounded-lg outline-none transition-colors text-slate-700 placeholder:text-slate-400"
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = "#3b82f6")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "#e2e8f0")
              }
            />
          </div>

          {/* User Type */}
          <div>
            <label className="block text-[12px] font-semibold text-slate-600 mb-1.5">
              User Type
            </label>
            <div className="relative">
              <select
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
                className="w-full appearance-none px-3.5 py-2.5 text-[13px] rounded-lg outline-none cursor-pointer transition-colors text-slate-700"
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                }}
              >
                <option value="Client">Client</option>
                <option value="Client (Enterprise)">Client (Enterprise)</option>
                <option value="Lawyer">Lawyer</option>
              </select>
              <ChevronDown
                size={14}
                color="#94a3b8"
                className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[12px] font-semibold text-slate-600 mb-1.5">
              Status
            </label>
            <div className="relative">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full appearance-none px-3.5 py-2.5 text-[13px] rounded-lg outline-none cursor-pointer transition-colors text-slate-700"
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                }}
              >
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Suspended">Suspended</option>
              </select>
              <ChevronDown
                size={14}
                color="#94a3b8"
                className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-[13px] font-semibold rounded-lg transition-colors text-slate-600 hover:bg-slate-100"
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 text-[13px] font-semibold rounded-lg transition-all hover:shadow-lg text-white"
              style={{
                background:
                  "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
              }}
            >
              Create User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
