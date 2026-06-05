"use client";

import React from "react";
import {
  Users,
  Scale,
  CalendarCheck,
  CreditCard,
  FileText,
  TrendingUp,
  TrendingDown,
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

/* ── helpers ─────────────────────────────────────────────── */

const barColors = revenueData.map((_, i) => {
  if (i === 5) return "#1e3a8a";
  if (i === 6) return "#f59e0b";
  return "#cbd5e1";
});

/* ── component ───────────────────────────────────────────── */

export default function AdminDashboard() {
  return (
    <>
      {/* Title */}
      <div>
        <h1 className="text-lg sm:text-xl font-bold text-slate-800">
          Dashboard Overview
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Real-time platform performance and AI-driven metrics for the
          JusticePal ecosystem
        </p>
      </div>

      {/* ── STAT CARDS ───────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-xl p-3.5 sm:p-4 flex flex-col justify-between"
              style={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              <div className="flex items-start justify-between mb-2 sm:mb-3">
                <div
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center"
                  style={{
                    background: `${card.accent}15`,
                  }}
                >
                  <Icon size={16} color={card.accent} className="sm:hidden" />
                  <Icon
                    size={18}
                    color={card.accent}
                    className="hidden sm:block"
                  />
                </div>
                <span
                  className="inline-flex items-center gap-0.5 text-[10px] sm:text-[11px] font-semibold px-1.5 py-0.5 rounded-full"
                  style={{
                    background: card.up ? "#ecfdf5" : "#fef2f2",
                    color: card.up ? "#10b981" : "#ef4444",
                  }}
                >
                  {card.up ? (
                    <TrendingUp size={10} />
                  ) : (
                    <TrendingDown size={10} />
                  )}
                  {card.change}
                </span>
              </div>
              <p className="text-lg sm:text-[22px] font-bold text-slate-800 leading-none">
                {card.value}
              </p>
              <p className="text-[11px] sm:text-[12px] text-slate-400 mt-1">
                {card.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* ── CHARTS ROW ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* User Growth Area Chart */}
        <div
          className="rounded-xl p-4 sm:p-5"
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
                <span className="text-xl sm:text-2xl font-bold text-slate-800">
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
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  width={32}
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
          className="rounded-xl p-4 sm:p-5"
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
                <span className="text-xl sm:text-2xl font-bold text-slate-800">
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
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  width={32}
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
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">
              Lawyer Verification Queue
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 hidden sm:block">
              Pending lawyer verifications requiring admin review
            </p>
          </div>
          <button
            className="flex items-center gap-1 text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-colors shrink-0"
            style={{ color: "#3b82f6", background: "#eff6ff" }}
          >
            View All <ChevronRight size={14} />
          </button>
        </div>

        {/* Desktop Table */}
        <table className="w-full text-left hidden md:table">
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

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-slate-100">
          {lawyerQueue.map((lawyer) => (
            <div key={lawyer.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                    style={{
                      background:
                        lawyer.statusColor === "orange"
                          ? "#f59e0b"
                          : "#3b82f6",
                    }}
                  >
                    {lawyer.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      {lawyer.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {lawyer.specialization}
                    </p>
                  </div>
                </div>
                <span
                  className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide shrink-0"
                  style={
                    lawyer.statusColor === "orange"
                      ? { background: "#fff7ed", color: "#f59e0b" }
                      : { background: "#eff6ff", color: "#3b82f6" }
                  }
                >
                  {lawyer.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">{lawyer.date}</span>
                <button
                  className="text-[12px] font-semibold px-3.5 py-1.5 rounded-lg transition-all hover:shadow-md"
                  style={{
                    background: "#1e3a8a",
                    color: "#fff",
                  }}
                >
                  Review
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
