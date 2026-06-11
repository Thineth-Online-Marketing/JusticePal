"use client";

import React from "react";
import {
  Calendar,
  Download,
  Banknote,
  FolderOpen,
  UserPlus,
  Star,
  TrendingUp,
  Sparkles
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";

// Mock Data
const userGrowthData = [
  { name: "JAN", users: 10000 },
  { name: "FEB", users: 15000 },
  { name: "MAR", users: 22000 },
  { name: "APR", users: 28000 },
  { name: "MAY", users: 38000 },
  { name: "JUN", users: 45200 },
];

const lawyerRegistrationsData = [
  { name: "JAN", value: 300 },
  { name: "FEB", value: 450 },
  { name: "MAR", value: 400 },
  { name: "APR", value: 600 },
  { name: "MAY", value: 500 },
  { name: "JUN", value: 800 },
];

const revenueBreakdownData = [
  { name: "Consultations", value: 60, color: "#1B3A6B" },
  { name: "Retainers", value: 25, color: "#eab308" },
  { name: "Memberships", value: 15, color: "#94a3b8" },
];

const consultationTrends = [
  { day: "MON", value: 35, percentage: "35%", color: "bg-[#1B3A6B]" },
  { day: "TUE", value: 85, percentage: "85%", color: "bg-[#1B3A6B]" },
  { day: "WED", value: 65, percentage: "65%", color: "bg-[#1B3A6B]" },
  { day: "THU", value: 95, percentage: "95%", color: "bg-[#1B3A6B]" },
  { day: "FRI", value: 75, percentage: "75%", color: "bg-[#1B3A6B]" },
  { day: "SAT", value: 20, percentage: "20%", color: "bg-amber-500" },
  { day: "SUN", value: 15, percentage: "15%", color: "bg-amber-500" },
];

export default function AnalyticsOverviewPage() {
  return (
    <div className="space-y-6 font-[var(--font-inter)] text-slate-800 pb-8">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0f1d3d]">Analytics Overview</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time performance metrics and growth data for JusticePal legal platform.</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
            <Calendar size={16} />
            Last 30 Days
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#1B3A6B] text-white text-sm font-semibold rounded-lg hover:bg-[#152e55] transition-colors shadow-sm">
            <Download size={16} />
            Export Report
          </button>
        </div>
      </div>

      {/* 4 STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-semibold text-slate-500">Total Revenue</span>
            <div className="text-amber-500">
              <Banknote size={16} />
            </div>
          </div>
          <div className="mt-2 mb-3">
            <p className="text-2xl font-bold text-slate-900">$128,430.00</p>
          </div>
          <p className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
            <span className="flex items-center text-emerald-500 font-bold"><TrendingUp size={12} className="mr-0.5"/> +12.5%</span> vs last month
          </p>
        </div>
        
        {/* Card 2 */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-semibold text-slate-500">Active Cases</span>
            <div className="text-[#1B3A6B]">
              <FolderOpen size={16} />
            </div>
          </div>
          <div className="mt-2 mb-3">
            <p className="text-2xl font-bold text-slate-900">1,240</p>
          </div>
          <p className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
            <span className="flex items-center text-emerald-500 font-bold"><TrendingUp size={12} className="mr-0.5"/> +5.2%</span> vs last month
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-semibold text-slate-500">New Lawyers</span>
            <div className="text-[#1B3A6B]">
              <UserPlus size={16} />
            </div>
          </div>
          <div className="mt-2 mb-3">
            <p className="text-2xl font-bold text-slate-900">85</p>
          </div>
          <p className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
            <span className="flex items-center text-emerald-500 font-bold"><TrendingUp size={12} className="mr-0.5"/> +14.1%</span> vs last month
          </p>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-semibold text-slate-500">Client Rating</span>
            <div className="text-amber-500">
              <Star size={16} />
            </div>
          </div>
          <div className="mt-2 mb-3">
            <p className="text-2xl font-bold text-slate-900">4.8 / 5.0</p>
          </div>
          <p className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
            <span className="flex items-center text-emerald-500 font-bold"><TrendingUp size={12} className="mr-0.5"/> +0.3%</span> vs last month
          </p>
        </div>
      </div>

      {/* MAIN CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* User Growth */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm h-[320px] flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">User Growth</h3>
              <p className="text-xs text-slate-500">Registered users over time</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-slate-900">45.2k</p>
              <p className="text-[10px] font-bold text-emerald-500">+18% Growth</p>
            </div>
          </div>
          <div className="flex-1 w-full h-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={userGrowthData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f8fafc" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} 
                  dy={10}
                />
                <Area 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#cbd5e1" 
                  fillOpacity={1} 
                  fill="url(#colorUsers)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lawyer Registrations */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm h-[320px] flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Lawyer Registrations</h3>
              <p className="text-xs text-slate-500">Monthly vetting performance</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-slate-900">1,200</p>
              <p className="text-[10px] font-bold text-emerald-500">+10% MoM</p>
            </div>
          </div>
          <div className="flex-1 w-full h-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={lawyerRegistrationsData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }} barSize={60}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} 
                  dy={10}
                />
                <Bar 
                  dataKey="value" 
                  fill="#1B3A6B" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SECONDARY DATA SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Consultation Trends */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-100 shadow-sm h-[340px] flex flex-col">
          <h3 className="text-base font-bold text-slate-900 mb-6">Consultation Trends</h3>
          <div className="flex-1 flex flex-col justify-between">
            {consultationTrends.map((trend) => (
              <div key={trend.day} className="flex items-center gap-4">
                <span className="text-[10px] font-bold text-slate-400 w-8">{trend.day}</span>
                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${trend.color}`} 
                    style={{ width: trend.percentage }}
                  />
                </div>
                <span className="text-[11px] font-bold text-slate-700 w-6 text-right">{trend.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm h-[340px] flex flex-col">
          <h3 className="text-base font-bold text-slate-900 mb-2">Revenue Breakdown</h3>
          <div className="flex-1 flex items-center justify-center relative my-2 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revenueBreakdownData}
                  cx="50%"
                  cy="50%"
                  innerRadius="70%"
                  outerRadius="85%"
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {revenueBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Inner Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-slate-900">$128k</span>
              <span className="text-[9px] font-bold text-slate-400 tracking-widest mt-0.5 uppercase">Total</span>
            </div>
          </div>
          {/* Legend */}
          <div className="space-y-2 mt-2 shrink-0">
            {revenueBreakdownData.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2 text-slate-600">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </div>
                <div className="text-slate-900 font-bold">{item.value}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BOTTOM BANNER */}
      <div className="bg-[#1c346b] rounded-2xl p-6 md:p-8 flex items-center justify-between relative overflow-hidden shadow-md">
        <div className="relative z-10 max-w-xl">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Automated Monthly Report is Ready</h2>
          <p className="text-sm text-white/80 leading-relaxed mb-6">
            Our AI has analyzed your performance metrics for May. Get a detailed breakdown of case velocity, user retention, and projected Q3 revenue.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-900 text-sm font-bold rounded-lg transition-colors shadow-sm">
              Download PDF
            </button>
            <button className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-bold rounded-lg transition-colors shadow-sm">
              View Insights
            </button>
          </div>
        </div>
        
        {/* Graphic */}
        <div className="hidden sm:flex absolute right-8 top-1/2 -translate-y-1/2 w-48 h-48 bg-[#182c5e] rounded-full items-center justify-center border-4 border-[#1c346b] shadow-inner">
          <Sparkles size={64} className="text-amber-400 opacity-80" strokeWidth={1.5} />
        </div>
      </div>

    </div>
  );
}
