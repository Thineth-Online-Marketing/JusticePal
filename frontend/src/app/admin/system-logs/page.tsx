"use client";

import React from "react";
import {
  Download,
  RefreshCw,
  LogIn,
  ShieldCheck,
  Banknote,
  Brain,
  ChevronDown,
  Filter,
  Search,
  Eye,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Server,
  Sparkles,
  CreditCard,
  ShieldAlert,
  TrendingUp,
  Shield,
  ChevronLeft,
  ChevronRight,
  Calendar
} from "lucide-react";

// Mock Data
const logsData = [
  {
    timestamp: "Oct 24,\n14:22:15",
    ip: "192.168.1.45",
    clientInitials: "JD",
    clientName: "John Doe",
    clientSub: "ID: #44129",
    clientBg: "bg-blue-100 text-blue-700",
    actionText: "LOGIN",
    actionIcon: LogIn,
    actionColor: "bg-blue-50 text-blue-600 border border-blue-200",
    description: "OAuth 2.0 Success via Google",
    statusText: "Success",
    statusIcon: CheckCircle2,
    statusColor: "text-emerald-500",
  },
  {
    timestamp: "Oct 24,\n14:19:02",
    ip: "45.221.12.8",
    clientInitials: "MA",
    clientName: "M. Anderson",
    clientSub: "ID: #44002",
    clientBg: "bg-slate-200 text-slate-700",
    actionText: "AI USAGE",
    actionIcon: Sparkles,
    actionColor: "bg-purple-50 text-purple-600 border border-purple-200",
    description: "Summarized Case #892 (v4-turbo)",
    statusText: "Success",
    statusIcon: CheckCircle2,
    statusColor: "text-emerald-500",
  },
  {
    timestamp: "Oct 24,\n14:15:44",
    ip: "102.14.99.1",
    clientInitials: "ST",
    clientName: "S. Thompson",
    clientSub: "ID: #43881",
    clientBg: "bg-amber-100 text-amber-700",
    actionText: "PAYMENT",
    actionIcon: CreditCard,
    actionColor: "bg-amber-50 text-amber-600 border border-amber-200",
    description: "Annual Pro Subscription ($2,400)",
    statusText: "Failed",
    statusIcon: AlertCircle,
    statusColor: "text-red-500",
  },
  {
    timestamp: "Oct 24,\n13:58:21",
    ip: "192.168.1.10",
    clientInitials: "LB",
    clientName: "LegalBot-AI",
    clientSub: "Service Agent",
    clientBg: "bg-emerald-100 text-emerald-700",
    actionText: "VERIFICATION",
    actionIcon: ShieldCheck,
    actionColor: "bg-emerald-50 text-emerald-600 border border-emerald-200",
    description: "KYC Validation: Case #7721",
    statusText: "Success",
    statusIcon: CheckCircle2,
    statusColor: "text-emerald-500",
  },
  {
    timestamp: "Oct 24,\n13:45:10",
    ip: "88.1.2.3",
    clientInitials: "AN",
    clientName: "Anonymous",
    clientSub: "Unknown Agent",
    clientBg: "bg-slate-200 text-slate-700",
    actionText: "SECURITY",
    actionIcon: ShieldAlert,
    actionColor: "bg-red-50 text-red-600 border border-red-200",
    description: "Multiple failed password attempts",
    statusText: "Blocked",
    statusIcon: AlertTriangle,
    statusColor: "text-amber-500",
  },
];

export default function SystemLogsPage() {
  return (
    <div className="space-y-6 font-[var(--font-inter)] text-slate-800 pb-8">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#1B3A6B] font-bold text-xs tracking-widest uppercase mb-1.5">
            <Server size={14} />
            Security Operations Center
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Activity & Audit Logs</h1>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">Monitor real-time security events, administrative overrides, and AI-driven document verifications across the platform.</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
            <Download size={16} />
            Export CSV
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#1B3A6B] text-white text-sm font-semibold rounded-lg hover:bg-[#152e55] transition-colors shadow-sm">
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* 4 STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <LogIn size={20} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Logins (24h)</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">1,284</p>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Verifications</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">452</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
            <Banknote size={20} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Payments</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">89</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500 shrink-0">
            <Brain size={20} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">AI Tokens Used</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">2.4M</p>
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        {/* Table Controls */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center px-6 py-4 border-b border-slate-100 bg-white gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <button className="flex items-center justify-between gap-3 px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 min-w-[150px]">
              All Event Types
              <ChevronDown size={14} className="text-slate-400" />
            </button>
            <button className="flex items-center justify-between gap-3 px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 min-w-[150px]">
              Last 24 Hours
              <Calendar size={14} className="text-slate-400" />
            </button>
            <button className="flex items-center justify-between gap-3 px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 min-w-[130px]">
              All Statuses
              <Filter size={14} className="text-slate-400" />
            </button>
          </div>
          <div className="w-full lg:w-auto flex-1 max-w-sm">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Filter by User ID, Email or IP..."
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-white">
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">User Identity</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Action Type</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {logsData.map((log, i) => {
                const ActionIcon = log.actionIcon;
                const StatusIcon = log.statusIcon;
                return (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-xs font-bold text-slate-800" style={{ whiteSpace: 'pre-line' }}>{log.timestamp}</p>
                      <p className="text-[10px] text-slate-400 mt-1 font-mono">{log.ip}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${log.clientBg}`}>
                          {log.clientInitials}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">{log.clientName}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{log.clientSub}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-bold rounded-md uppercase tracking-wider ${log.actionColor}`}>
                        <ActionIcon size={12} strokeWidth={2.5} />
                        {log.actionText}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-slate-600 max-w-xs">{log.description}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`flex items-center gap-1.5 text-xs font-bold ${log.statusColor}`}>
                        <StatusIcon size={14} strokeWidth={2.5} />
                        {log.statusText}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-[#1B3A6B] transition-colors p-1">
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between bg-white gap-4">
          <p className="text-[11px] font-semibold text-slate-500">Showing 1 to 5 of 12,842 results</p>
          <div className="flex items-center gap-1.5">
            <button className="w-8 h-8 flex items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 shadow-sm"><ChevronLeft size={14} /></button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md bg-[#1B3A6B] text-white text-xs font-bold shadow-sm">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold shadow-sm">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold shadow-sm">3</button>
            <span className="w-8 h-8 flex items-center justify-center text-slate-400 text-xs tracking-widest">...</span>
            <button className="w-8 h-8 flex items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold shadow-sm">256</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 shadow-sm"><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>

      {/* BOTTOM CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Usage Distribution */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-6 text-slate-800">
            <TrendingUp size={18} className="text-amber-500" />
            <h3 className="text-base font-bold">Usage Distribution</h3>
          </div>
          
          {/* Simple CSS Bar Chart Mockup */}
          <div className="flex-1 flex items-end justify-between gap-2 sm:gap-4 mt-auto pt-8 border-b border-slate-100 pb-2 h-[160px]">
            {/* Mon */}
            <div className="flex flex-col items-center gap-2 w-full">
              <div className="w-full bg-[#cbd5e1] rounded-sm" style={{ height: '50%' }}></div>
              <span className="text-[10px] font-bold text-slate-400">MON</span>
            </div>
            {/* Tue */}
            <div className="flex flex-col items-center gap-2 w-full">
              <div className="w-full bg-[#cbd5e1] rounded-sm" style={{ height: '35%' }}></div>
              <span className="text-[10px] font-bold text-slate-400">TUE</span>
            </div>
            {/* Wed */}
            <div className="flex flex-col items-center gap-2 w-full">
              <div className="w-full bg-[#cbd5e1] rounded-sm" style={{ height: '70%' }}></div>
              <span className="text-[10px] font-bold text-slate-400">WED</span>
            </div>
            {/* Thu */}
            <div className="flex flex-col items-center gap-2 w-full">
              <div className="w-full bg-[#cbd5e1] rounded-sm" style={{ height: '30%' }}></div>
              <span className="text-[10px] font-bold text-slate-400">THU</span>
            </div>
            {/* Fri */}
            <div className="flex flex-col items-center gap-2 w-full">
              <div className="w-full bg-[#cbd5e1] rounded-sm" style={{ height: '90%' }}></div>
              <span className="text-[10px] font-bold text-slate-400">FRI</span>
            </div>
            {/* Sat */}
            <div className="flex flex-col items-center gap-2 w-full">
              <div className="w-full bg-[#cbd5e1] rounded-sm" style={{ height: '40%' }}></div>
              <span className="text-[10px] font-bold text-slate-400">SAT</span>
            </div>
          </div>
        </div>

        {/* Security Alert */}
        <div className="bg-[#1c346b] rounded-2xl p-6 text-white relative overflow-hidden shadow-md flex flex-col justify-center">
          {/* subtle background pattern */}
          <div className="absolute -bottom-10 -right-10 opacity-10">
            <ShieldAlert size={180} />
          </div>
          
          <div className="z-10 relative">
            <div className="flex items-center gap-2 text-amber-400 text-[10px] font-bold tracking-widest uppercase mb-4">
              <Shield size={14} />
              Security Alert
            </div>
            <h3 className="text-lg font-bold mb-3 leading-snug">Unauthorized API Access Detected</h3>
            <p className="text-xs text-white/70 leading-relaxed mb-6">
              A surge in failed API key calls from IP range 104.xxx.xx.x has been detected in the last 15 minutes.
            </p>
            <button className="w-full py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-900 text-xs font-bold rounded-lg transition-colors shadow-sm uppercase tracking-wider">
              Review Incident
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
