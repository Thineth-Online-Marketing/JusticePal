"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { User, ChevronDown, UserCircle, Settings, Shield, Globe, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function DashboardProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    // Relying on transparent overlay for outside click detection
  }, []);

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 pr-2 border border-slate-200 rounded-full hover:border-[#1B3A6B] hover:bg-slate-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:ring-offset-1 bg-white"
      >
        <div className="w-8 h-8 rounded-full bg-[#1B3A6B] text-white flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
          {user.photoURL ? (
            <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <User className="w-5 h-5" />
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isOpen ? "rotate-180 text-[#1B3A6B]" : ""}`} />
      </button>

      {/* Transparent Overlay for clicking outside (using Portal to bypass navbar stacking context) */}
      {isOpen && typeof document !== "undefined" && createPortal(
        <div 
          className="fixed inset-0 z-40" 
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(false);
          }}
        ></div>,
        document.body
      )}

      {isOpen && (
        <div className="absolute right-0 mt-3 w-64 bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden origin-top-right z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-800 truncate">{user.displayName || "User Profile"}</p>
            <p className="text-xs text-slate-500 truncate mt-0.5">{user.email}</p>
          </div>

          <div className="p-2 flex flex-col gap-1">
            <Link
              href="/client-dashboard/profile"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-[#1B3A6B] rounded-xl transition-colors"
            >
              <UserCircle className="w-4 h-4 text-slate-400" />
              My Profile
            </Link>


            
            <Link
              href="/account-settings"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-[#1B3A6B] rounded-xl transition-colors"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              Account Settings
            </Link>

            <Link
              href="/security"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-[#1B3A6B] rounded-xl transition-colors"
            >
              <Shield className="w-4 h-4 text-slate-400" />
              Security
            </Link>

            <div className="h-px bg-slate-100 my-1 mx-2"></div>

            <Link
              href="/?redirect=false"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-[#059669] hover:bg-emerald-50 rounded-xl transition-colors"
            >
              <Globe className="w-4 h-4 text-emerald-500" />
              View Landing Page
            </Link>

            <div className="h-px bg-slate-100 my-1 mx-2"></div>

            <button
              onClick={() => {
                setIsOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4 text-red-500" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
