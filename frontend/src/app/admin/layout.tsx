"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  CalendarCheck,
  CreditCard,
  FileText,
  BarChart3,
  Settings,
  Search,
  Bell,
  Menu,
  X,
  LogOut,
  User as UserIcon,
  ChevronDown,
  Lock,
  Brain,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
  { label: "User Management", icon: Users, href: "/admin/user-management" },
  { label: "Lawyer Verification", icon: ShieldCheck, href: "/admin/lawyer-verification" },
  { label: "Appointments", icon: CalendarCheck, href: "/admin/appointments" },
  { label: "Payments", icon: CreditCard, href: "/admin/payments" },
  { label: "System Logs", icon: FileText, href: "/admin/system-logs" },
  { label: "Knowledge Base", icon: Brain, href: "/admin/knowledge-base" },
  { label: "Reports", icon: BarChart3, href: "/admin/reports" },
  { label: "Settings", icon: Settings, href: "/admin/settings" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const sidebarRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  const displayName = "Admin User";
  const userEmail = "admin@justicepal.com";
  const initials = "AD";

  // Check sessionStorage on mount
  useEffect(() => {
    if (sessionStorage.getItem("adminLoggedIn") === "true") {
      setIsAdminLoggedIn(true);
    }
  }, []);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    if (username === "admin" && password === "admin") {
      sessionStorage.setItem("adminLoggedIn", "true");
      setIsAdminLoggedIn(true);
    } else {
      setLoginError("Invalid username or password.");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("adminLoggedIn");
    setIsAdminLoggedIn(false);
    setUsername("");
    setPassword("");
  };

  // Close sidebar and dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        sidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setSidebarOpen(false);
      }
      if (
        profileDropdownOpen &&
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarOpen, profileDropdownOpen]);

  // Close sidebar on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setSidebarOpen(false);
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Lock body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  // ─── SIMPLE ADMIN LOGIN FORM ──────────────────────────
  if (!isAdminLoggedIn) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: "linear-gradient(135deg, #0f1d3d 0%, #1e3a8a 60%, #1e40af 100%)" }}
      >
        <div
          className="w-full max-w-md rounded-2xl p-8 sm:p-10"
          style={{
            background: "rgba(255,255,255,0.07)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 25px 60px rgba(0,0,0,0.4)",
          }}
        >
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div
              className="relative flex items-center justify-center rounded-xl overflow-hidden mb-3"
              style={{ width: 56, height: 56, background: "rgba(255,255,255,0.12)" }}
            >
              <Image
                src="https://res.cloudinary.com/dluwvqdaz/image/upload/v1775969976/Navy_Blue_JusticePal_Logo_with_Dove_Fusion_new_uhyjl0.png"
                alt="JusticePal Logo"
                fill
                className="object-cover"
              />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Admin Panel</h1>
            <p className="text-sm text-blue-200/60 mt-1">Sign in to access the dashboard</p>
          </div>

          {/* Error */}
          {loginError && (
            <div
              className="mb-5 px-4 py-2.5 rounded-lg text-sm font-medium text-red-200"
              style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.25)" }}
            >
              {loginError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAdminLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-blue-200/70 mb-1.5 uppercase tracking-wider">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-blue-300/30 outline-none transition-all focus:ring-2 focus:ring-blue-400/50"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-blue-200/70 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-blue-300/30 outline-none transition-all focus:ring-2 focus:ring-blue-400/50"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              />
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all hover:brightness-110 hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                boxShadow: "0 4px 15px rgba(59,130,246,0.35)",
              }}
            >
              <Lock size={15} />
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ─── ADMIN DASHBOARD LAYOUT ───────────────────────────
  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href) && href !== "#";
  };

  return (
    <div
      className="flex min-h-screen font-[var(--font-inter)]"
      style={{
        border: "2px solid #3b82f6",
        background: "#f1f5f9",
      }}
    >
      {/* ─── MOBILE OVERLAY ─────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          style={{ transition: "opacity 0.3s ease" }}
        />
      )}

      {/* ─── SIDEBAR ─────────────────────────────────────── */}
      <aside
        ref={sidebarRef}
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static shrink-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          background: "#1e293b",
          boxShadow: sidebarOpen ? "4px 0 24px rgba(0,0,0,0.5)" : "none",
        }}
      >
        {/* Sidebar Header */}
        <div
          className="flex items-center justify-between px-6 shrink-0"
          style={{ height: 64, borderBottom: "1px solid #334155" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 relative overflow-hidden"
              style={{ background: "#3b82f6" }}
            >
              <Image
                src="https://res.cloudinary.com/dluwvqdaz/image/upload/v1775969976/Navy_Blue_JusticePal_Logo_with_Dove_Fusion_new_uhyjl0.png"
                alt="Logo"
                fill
                className="object-cover"
              />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              JusticePal
            </span>
          </div>
          {/* Close button (mobile) */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 -mr-2 rounded-lg hover:bg-slate-700 transition-colors text-slate-400"
          >
            <X size={20} />
          </button>
        </div>

        {/* Sidebar Nav */}
        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group"
                style={{
                  background: active ? "#3b82f6" : "transparent",
                  color: active ? "#fff" : "#94a3b8",
                }}
              >
                <Icon
                  size={18}
                  className="shrink-0"
                  style={{ color: active ? "#fff" : "#64748b" }}
                />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* User profile brief (sidebar bottom) */}
        <div
          className="p-4 flex items-center gap-3 shrink-0"
          style={{ borderTop: "1px solid #334155" }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
            style={{ background: "#3b82f6", color: "#fff" }}
          >
            {initials}
          </div>
          <div className="leading-tight overflow-hidden">
            <p className="text-[11px] font-semibold text-white/90 truncate">{displayName}</p>
            <p className="text-[9px] text-white/50">Super Admin</p>
          </div>
        </div>
      </aside>

      {/* ─── MAIN AREA ───────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-auto min-w-0">
        {/* Header */}
        <header
          className="flex items-center justify-between px-4 sm:px-6 shrink-0"
          style={{
            height: 56,
            background: "#fff",
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          {/* Left side: hamburger + search */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Hamburger (mobile only) */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 -ml-1 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
              aria-label="Open sidebar"
            >
              <Menu size={20} color="#334155" />
            </button>

            {/* Search */}
            <div className="flex-1 max-w-md hidden sm:block">
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                style={{
                  background: "#f1f5f9",
                  border: "1px solid #e2e8f0",
                }}
              >
                <Search size={15} color="#94a3b8" />
                <input
                  type="text"
                  placeholder="Search for cases, users, or reports..."
                  className="bg-transparent outline-none text-[13px] w-full placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Mobile search icon */}
            <button className="sm:hidden p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
              <Search size={18} color="#64748b" />
            </button>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3 sm:gap-4 ml-2 sm:ml-4 shrink-0">
            <button className="relative p-1">
              <Bell size={18} color="#64748b" />
              <span
                className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full"
                style={{ background: "#ef4444", border: "2px solid #fff" }}
              />
            </button>
            <div className="relative" ref={profileDropdownRef}>
              <div 
                className="flex items-center gap-2.5 cursor-pointer p-1 rounded-lg hover:bg-slate-50 transition-colors"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              >
                <div className="text-right leading-tight hidden sm:block">
                  <p className="text-[13px] font-semibold text-slate-800">
                    {displayName}
                  </p>
                  <p
                    className="text-[10px] font-bold tracking-wider"
                    style={{ color: "#3b82f6" }}
                  >
                    SUPER ADMIN
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{
                      background:
                        "linear-gradient(135deg, #3b82f6 0%, #1e3a8a 100%)",
                    }}
                  >
                    {initials}
                  </div>
                  <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
                </div>
              </div>

              {/* Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-2 border-b border-slate-50 mb-1">
                    <p className="text-xs font-bold text-slate-800 truncate">{displayName}</p>
                    <p className="text-[10px] text-slate-500 truncate">{userEmail}</p>
                  </div>
                  
                  <Link 
                    href="/admin/settings" 
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <UserIcon size={14} />
                    My Profile
                  </Link>
                  
                  <Link 
                    href="/admin/settings" 
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <Settings size={14} />
                    Account Settings
                  </Link>

                  <div className="h-px bg-slate-100 my-1 mx-2"></div>
                  
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                  >
                    <LogOut size={14} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content — rendered by child pages */}
        <main className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
