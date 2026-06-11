"use client";

import React from "react";
import {
  Download,
  Filter,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  Eye,
  CalendarX,
  CheckCircle,
  AlertCircle
} from "lucide-react";

// Mock Data
const appointmentsData = [
  {
    clientInitials: "JD",
    clientName: "Jonathan Doe",
    clientBg: "bg-slate-100 text-[#1B3A6B]",
    lawyerName: "Sarah Jenkins, Esq.",
    lawyerRole: "Senior Associate",
    date: "Oct 24, 2023",
    time: "10:30 AM (GMT+2)",
    caseType: "CORPORATE",
    caseColor: "bg-blue-100 text-blue-600",
    status: "Paid",
    statusColor: "text-emerald-600",
  },
  {
    clientInitials: "MW",
    clientName: "Marcus Wright",
    clientBg: "bg-amber-100 text-amber-700",
    lawyerName: "Michael Ross",
    lawyerRole: "Criminal Law Partner",
    date: "Oct 24, 2023",
    time: "02:00 PM (GMT+2)",
    caseType: "CRIMINAL",
    caseColor: "bg-red-100 text-red-600",
    status: "Pending",
    statusColor: "text-amber-500",
  },
  {
    clientInitials: "EL",
    clientName: "Elena Lombardi",
    clientBg: "bg-purple-100 text-purple-700",
    lawyerName: "Sarah Jenkins, Esq.",
    lawyerRole: "Senior Associate",
    date: "Oct 25, 2023",
    time: "09:00 AM (GMT+2)",
    caseType: "FAMILY",
    caseColor: "bg-purple-100 text-purple-600",
    status: "Paid",
    statusColor: "text-emerald-600",
  },
  {
    clientInitials: "TH",
    clientName: "Thompson Holdings",
    clientBg: "bg-slate-100 text-slate-700",
    lawyerName: "David Miller",
    lawyerRole: "Real Estate Expert",
    date: "Oct 25, 2023",
    time: "11:15 AM (GMT+2)",
    caseType: "REAL ESTATE",
    caseColor: "bg-orange-100 text-orange-600",
    status: "Overdue",
    statusColor: "text-red-500",
  },
  {
    clientInitials: "AS",
    clientName: "Alice Sterling",
    clientBg: "bg-emerald-100 text-emerald-700",
    lawyerName: "Michael Ross",
    lawyerRole: "Criminal Law Partner",
    date: "Oct 26, 2023",
    time: "03:45 PM (GMT+2)",
    caseType: "CRIMINAL",
    caseColor: "bg-red-100 text-red-600",
    status: "Paid",
    statusColor: "text-emerald-600",
  },
];

export default function ConsultationManagementPage() {
  return (
    <div className="space-y-6 font-[var(--font-inter)] text-slate-800">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1B3A6B]">Consultation Management</h1>
          <p className="text-sm text-slate-500 mt-1">Review and manage upcoming legal appointments and schedules.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
            <Download size={16} />
            Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
            <Filter size={16} />
            Filter
          </button>
        </div>
      </div>

      {/* 4 STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-semibold text-slate-500">Total This Week</p>
          <div className="mt-2">
            <p className="text-3xl font-bold text-[#1B3A6B]">124</p>
          </div>
          <p className="text-[11px] font-bold text-emerald-500 mt-3 flex items-center gap-1.5">
            <TrendingUp size={14} />
            12% from last week
          </p>
        </div>
        
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-semibold text-slate-500">Pending Confirmation</p>
          <div className="mt-2">
            <p className="text-3xl font-bold text-[#1B3A6B]">18</p>
          </div>
          <p className="text-[11px] font-bold text-amber-500 mt-3 flex items-center gap-1.5">
            <Clock size={14} />
            Action required
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-semibold text-slate-500">Completed Today</p>
          <div className="mt-2">
            <p className="text-3xl font-bold text-[#1B3A6B]">42</p>
          </div>
          <p className="text-[11px] font-bold text-slate-400 mt-3 flex items-center gap-1.5">
            <CheckCircle2 size={14} />
            On schedule
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-semibold text-slate-500">Unpaid Consultations</p>
          <div className="mt-2">
            <p className="text-3xl font-bold text-[#1B3A6B]">$3,420</p>
          </div>
          <p className="text-[11px] font-bold text-red-500 mt-3 flex items-center gap-1.5">
            <AlertTriangle size={14} />
            8 overdue invoices
          </p>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Table Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-6 py-5 border-b border-slate-100 bg-white">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">CASE TYPE:</span>
              <button className="flex items-center justify-between gap-3 px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 min-w-[120px]">
                All Types
                <ChevronDown size={14} className="text-slate-400" />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">DATE RANGE:</span>
              <button className="flex items-center justify-between gap-3 px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 min-w-[120px]">
                Next 7 Days
                <ChevronDown size={14} className="text-slate-400" />
              </button>
            </div>
          </div>
          <div className="mt-4 sm:mt-0">
            <p className="text-xs font-medium text-slate-400">Showing 1-10 of 48 appointments</p>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Client Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Lawyer Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Appointment Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Case Type</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Payment Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {appointmentsData.map((appt, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${appt.clientBg}`}>
                        {appt.clientInitials}
                      </div>
                      <p className="text-sm font-bold text-slate-800">{appt.clientName}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-800">{appt.lawyerName}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{appt.lawyerRole}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-800">{appt.date}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{appt.time}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${appt.caseColor}`}>
                      {appt.caseType}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`flex items-center gap-1.5 text-sm font-bold ${appt.statusColor}`}>
                      {appt.status === "Paid" && <CheckCircle size={14} />}
                      {appt.status === "Pending" && (
                        <div className="w-[14px] h-[14px] border border-amber-500 rounded-full flex items-center justify-center">
                          <div className="flex gap-[1px]">
                            <div className="w-[2px] h-[2px] bg-amber-500 rounded-full"></div>
                            <div className="w-[2px] h-[2px] bg-amber-500 rounded-full"></div>
                            <div className="w-[2px] h-[2px] bg-amber-500 rounded-full"></div>
                          </div>
                        </div>
                      )}
                      {appt.status === "Overdue" && <AlertCircle size={14} />}
                      {appt.status}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button className="text-slate-400 hover:text-[#1B3A6B] transition-colors p-1">
                        <Eye size={18} />
                      </button>
                      <button className="text-slate-400 hover:text-red-500 transition-colors p-1">
                        <CalendarX size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-5 border-t border-slate-100 flex items-center justify-between bg-white">
          <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-500 hover:bg-slate-50">Previous</button>
          
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#1B3A6B] text-white text-sm font-bold shadow-sm">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-bold">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-bold">3</button>
            <span className="w-8 h-8 flex items-center justify-center text-slate-400 text-sm">...</span>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-bold">5</button>
          </div>

          <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-sm">Next</button>
        </div>
      </div>

    </div>
  );
}
