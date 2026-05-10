"use client";

import React, { useState } from "react";
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
  TrendingUp,
  TrendingDown,
  Scale,
  ChevronRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";

/* ── mock data ───────────────────────────────────────────── */

const userGrowthData = [
  { month: "JAN", users: 4200 },
  { month: "FEB", users: 5800 },
  { month: "MAR", users: 5200 },
  { month: "APR", users: 7800 },
  { month: "MAY", users: 7200 },
  { month: "JUN", users: 9800 },
  { month: "JUL", users: 12400 },
];

const revenueData = [
  { month: "JAN", revenue: 18000 },
  { month: "FEB", revenue: 22000 },
  { month: "MAR", revenue: 19000 },
  { month: "APR", revenue: 28000 },
  { month: "MAY", revenue: 25000 },
  { month: "JUN", revenue: 32000 },
  { month: "JUL", revenue: 14000 },
];

const lawyerQueue = [
  {
    id: 1,
    name: "Dr. Marcus Thorne",
    avatar: "MT",
    specialization: "Corporate Law",
    date: "Oct 24, 2023",
    status: "PENDING REVIEW",
    statusColor: "orange",
  },
  {
    id: 2,
    name: "Elena Rodriguez",
    avatar: "ER",
    specialization: "Family & Civil",
    date: "Oct 25, 2023",
    status: "IN PROGRESS",
    statusColor: "blue",
  },
];

const statCards = [
  {
    label: "Total Users",
    value: "12,480",
    change: "+12%",
    up: true,
    icon: Users,
    accent: "#3b82f6",
  },
  {
    label: "Total Lawyers",
    value: "1,250",
    change: "+5%",
    up: true,
    icon: Scale,
    accent: "#1e3a8a",
  },
  {
    label: "Active Cases",
    value: "342",
    change: "+8%",
    up: true,
    icon: FileText,
    accent: "#f59e0b",
  },
  {
    label: "Appointments",
    value: "890",
    change: "+15%",
    up: true,
    icon: CalendarCheck,
    accent: "#10b981",
  },
  {
    label: "Platform Revenue",
    value: "$158,200",
    change: "+22%",
    up: true,
    icon: CreditCard,
    accent: "#8b5cf6",
  },
];

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "User Management", icon: Users, active: false },
  { label: "Lawyer Verification", icon: ShieldCheck, active: false },
  { label: "Appointments", icon: CalendarCheck, active: false },
  { label: "Payments", icon: CreditCard, active: false },
  { label: "System Logs", icon: FileText, active: false },
  { label: "Reports", icon: BarChart3, active: false },
  { label: "Settings", icon: Settings, active: false },
];

/* ── helpers ─────────────────────────────────────────────── */

const barColors = revenueData.map((_, i) => {
  if (i === 5) return "#1e3a8a";
  if (i === 6) return "#f59e0b";
  return "#cbd5e1";
});

/* ── component ───────────────────────────────────────────── */

export default function AdminDashboard() {
  const [activeNav, setActiveNav] = useState("Dashboard");

  return (
    <div
      className="flex min-h-screen font-[var(--font-inter)]"
      style={{
        border: "2px solid #3b82f6",
        background: "#f1f5f9",
      }}
    >
      {/* ─── SIDEBAR ─────────────────────────────────────── */}
      <aside
        className="flex flex-col shrink-0"
        style={{
          width: 180,
          background: "linear-gradient(180deg, #0f1d3d 0%, #1e3a8a 100%)",
          color: "#fff",
        }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center pt-6 pb-5 px-3 border-b border-white/10">
          <div
            className="flex items-center justify-center rounded-lg mb-2"
            style={{
              width: 42,
              height: 42,
              background: "rgba(255,255,255,0.12)",
            }}
          >
            <Scale size={22} color="#f59e0b" />
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
        <nav className="flex-1 py-3 px-2 space-y-0.5 text-[13px]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.label;
            return (
              <button
                key={item.label}
                onClick={() => setActiveNav(item.label)}
                className="flex items-center gap-2.5 w-full px-3 py-2 rounded-md transition-colors"
                style={{
                  background: isActive ? "rgba(59,130,246,0.25)" : "transparent",
                  color: isActive ? "#93c5fd" : "rgba(255,255,255,0.6)",
                  fontWeight: isActive ? 600 : 400,
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
            className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold"
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
      <div className="flex-1 flex flex-col overflow-auto">
        {/* Header */}
        <header
          className="flex items-center justify-between px-6 shrink-0"
          style={{
            height: 56,
            background: "#fff",
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          {/* Search */}
          <div className="flex-1 max-w-md mx-auto">
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

          {/* Right */}
          <div className="flex items-center gap-4 ml-4">
            <button className="relative">
              <Bell size={18} color="#64748b" />
              <span
                className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full"
                style={{ background: "#ef4444", border: "2px solid #fff" }}
              />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="text-right leading-tight">
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
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white"
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

        {/* Content */}
        <main className="flex-1 p-6 space-y-6">
          {/* Title */}
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              Dashboard Overview
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Welcome back, Sarah. Here&apos;s what&apos;s happening on JusticePal
              today.
            </p>
          </div>

          {/* ── STAT CARDS ───────────────────────────────── */}
          <div className="grid grid-cols-5 gap-4">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
                  className="rounded-xl p-4 flex flex-col justify-between"
                  style={{
                    background: "#fff",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{
                        background: `${card.accent}15`,
                      }}
                    >
                      <Icon size={18} color={card.accent} />
                    </div>
                    <span
                      className="inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-full"
                      style={{
                        background: card.up ? "#ecfdf5" : "#fef2f2",
                        color: card.up ? "#10b981" : "#ef4444",
                      }}
                    >
                      {card.up ? (
                        <TrendingUp size={11} />
                      ) : (
                        <TrendingDown size={11} />
                      )}
                      {card.change}
                    </span>
                  </div>
                  <p className="text-[22px] font-bold text-slate-800 leading-none">
                    {card.value}
                  </p>
                  <p className="text-[12px] text-slate-400 mt-1">
                    {card.label}
                  </p>
                </div>
              );
            })}
          </div>

          {/* ── CHARTS ROW ───────────────────────────────── */}
          <div className="grid grid-cols-2 gap-4">
            {/* User Growth Area Chart */}
            <div
              className="rounded-xl p-5"
              style={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    User Growth
                  </p>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl font-bold text-slate-800">
                      12.4k
                    </span>
                    <span
                      className="inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-full"
                      style={{ background: "#ecfdf5", color: "#10b981" }}
                    >
                      <TrendingUp size={11} />
                      +14%
                    </span>
                  </div>
                </div>
              </div>
              <div style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={userGrowthData}>
                    <defs>
                      <linearGradient
                        id="userGrad"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#1e3a8a"
                          stopOpacity={0.25}
                        />
                        <stop
                          offset="100%"
                          stopColor="#1e3a8a"
                          stopOpacity={0.02}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f1f5f9"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                      width={36}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 8,
                        border: "none",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        fontSize: 12,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="users"
                      stroke="#1e3a8a"
                      strokeWidth={2.5}
                      fill="url(#userGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Revenue Bar Chart */}
            <div
              className="rounded-xl p-5"
              style={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    Revenue Trends
                  </p>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl font-bold text-slate-800">
                      $158k
                    </span>
                    <span
                      className="inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-full"
                      style={{ background: "#fef2f2", color: "#ef4444" }}
                    >
                      <TrendingDown size={11} />
                      -2%
                    </span>
                  </div>
                </div>
              </div>
              <div style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f1f5f9"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                      width={36}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 8,
                        border: "none",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                      {revenueData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={barColors[index]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* ── LAWYER VERIFICATION QUEUE ─────────────────── */}
          <div
            className="rounded-xl overflow-hidden"
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-semibold text-slate-800">
                  Lawyer Verification Queue
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pending lawyer verifications requiring admin review
                </p>
              </div>
              <button
                className="flex items-center gap-1 text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-colors"
                style={{ color: "#3b82f6", background: "#eff6ff" }}
              >
                View All <ChevronRight size={14} />
              </button>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  <th className="px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Specialization
                  </th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {lawyerQueue.map((lawyer) => (
                  <tr
                    key={lawyer.id}
                    className="border-t border-slate-100 hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
                          style={{
                            background:
                              lawyer.statusColor === "orange"
                                ? "#f59e0b"
                                : "#3b82f6",
                          }}
                        >
                          {lawyer.avatar}
                        </div>
                        <span className="text-sm font-medium text-slate-700">
                          {lawyer.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-500">
                      {lawyer.specialization}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-500">
                      {lawyer.date}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className="inline-block text-[11px] font-bold px-2.5 py-1 rounded-full tracking-wide"
                        style={
                          lawyer.statusColor === "orange"
                            ? { background: "#fff7ed", color: "#f59e0b" }
                            : { background: "#eff6ff", color: "#3b82f6" }
                        }
                      >
                        {lawyer.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        className="text-[12px] font-semibold px-3.5 py-1.5 rounded-lg transition-all hover:shadow-md"
                        style={{
                          background: "#1e3a8a",
                          color: "#fff",
                        }}
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
