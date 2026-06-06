"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
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
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
  { label: "User Management", icon: Users, href: "/admin/user-management" },
  { label: "Lawyer Verification", icon: ShieldCheck, href: "#" },
  { label: "Appointments", icon: CalendarCheck, href: "#" },
  { label: "Payments", icon: CreditCard, href: "#" },
  { label: "System Logs", icon: FileText, href: "#" },
  { label: "Reports", icon: BarChart3, href: "#" },
  { label: "Settings", icon: Settings, href: "#" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        sidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setSidebarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarOpen]);

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
        className={`
          flex flex-col shrink-0 z-50
          fixed inset-y-0 left-0 lg:static
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        style={{
          width: 220,
          background: "linear-gradient(180deg, #0f1d3d 0%, #1e3a8a 100%)",
          color: "#fff",
        }}
      >
        {/* Close button (mobile only) */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden absolute top-3 right-3 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Close sidebar"
        >
          <X size={20} color="#fff" />
        </button>

        {/* Logo */}
        <div className="flex flex-col items-center pt-6 pb-5 px-3 border-b border-white/10">
          <div
            className="relative flex items-center justify-center rounded-xl overflow-hidden mb-2"
            style={{
              width: 42,
              height: 42,
              background: "rgba(255,255,255,0.12)",
            }}
          >
            <Image
              src="https://res.cloudinary.com/dluwvqdaz/image/upload/v1775969976/Navy_Blue_JusticePal_Logo_with_Dove_Fusion_new_uhyjl0.png"
              alt="JusticePal Logo"
              fill
              className="object-cover"
            />
          </div>
          <span className="text-sm font-bold tracking-wide">JusticePal</span>
          <span
            className="text-[10px] font-semibold tracking-[0.18em] mt-0.5"
            style={{ color: "#f59e0b" }}
          >
            SRI LANKA
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 text-[13px] overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <button
                key={item.label}
                onClick={() => {
                  if (item.href !== "#") {
                    router.push(item.href);
                  }
                  setSidebarOpen(false);
                }}
                className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-md transition-colors"
                style={{
                  background: active ? "rgba(59,130,246,0.25)" : "transparent",
                  color: active ? "#93c5fd" : "rgba(255,255,255,0.6)",
                  fontWeight: active ? 600 : 400,
                }}
              >
                <Icon size={16} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* bottom user */}
        <div className="px-3 py-4 border-t border-white/10 flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
            style={{ background: "#3b82f6" }}
          >
            SJ
          </div>
          <div className="leading-tight">
            <p className="text-[11px] font-semibold text-white/90">Sarah J.</p>
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
            <div className="flex items-center gap-2.5">
              <div className="text-right leading-tight hidden sm:block">
                <p className="text-[13px] font-semibold text-slate-800">
                  Sarah Jenkins
                </p>
                <p
                  className="text-[10px] font-bold tracking-wider"
                  style={{ color: "#3b82f6" }}
                >
                  SUPER ADMIN
                </p>
              </div>
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, #3b82f6 0%, #1e3a8a 100%)",
                }}
              >
                SJ
              </div>
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
