"use client";

import React, { useState, useEffect } from "react";
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
  AlertCircle,
  Users
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

interface AppointmentData {
  id: string;
  clientInitials: string;
  clientName: string;
  clientBg: string;
  lawyerName: string;
  lawyerRole: string;
  date: string;
  time: string;
  caseType: string;
  caseColor: string;
  status: string;
  statusColor: string;
}

function getInitials(name: string) {
  if (!name) return "UN";
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}


export default function ConsultationManagementPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchAppointments = async () => {
      if (!user) return;
      try {
        setIsLoading(true);
        const token = await user.getIdToken();
        const res = await fetch(`${BACKEND_URL}/api/admin/appointments`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to fetch appointments");
        const data = await res.json();

        if (isMounted) {
          const mapped: AppointmentData[] = data.map((appt: any) => {
            const clientName = appt.user?.name || "Unknown Client";
            const lawyerName = appt.lawyer?.user?.name || "Unknown Lawyer";
            const dateObj = new Date(appt.scheduledAt);

            // Payment logic
            const payments = appt.payments || [];
            const hasSucceeded = payments.some((p: any) => p.status === "succeeded");
            const hasPending = payments.some((p: any) => p.status === "pending");

            let status = "Pending";
            let statusColor = "text-amber-500";
            if (hasSucceeded) {
              status = "Paid";
              statusColor = "text-emerald-600";
            } else if (appt.status === "cancelled") {
              status = "Cancelled";
              statusColor = "text-red-500";
            }

            return {
              id: appt.id,
              clientInitials: getInitials(clientName),
              clientName,
              clientBg: "bg-slate-100 text-[#1B3A6B]",
              lawyerName,
              lawyerRole: "Lawyer", // Defaulting as we didn't fetch role title
              date: dateObj.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
              time: dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
              caseType: appt.caseDescription || "GENERAL",
              caseColor: "bg-blue-100 text-blue-600",
              status,
              statusColor,
            };
          });
          setAppointments(mapped);
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    const fallback = setTimeout(() => {
      if (isMounted && isLoading) setIsLoading(false);
    }, 3000);

    fetchAppointments();
    return () => {
      isMounted = false;
      clearTimeout(fallback);
    };
  }, [user?.uid]);
  const totalAppointments = appointments.length;
  const pendingCount = appointments.filter(a => a.status === "Pending").length;
  const completedCount = appointments.filter(a => a.status === "Paid").length;
  const unpaidCount = appointments.filter(a => a.status === "Cancelled" || a.status === "Overdue" || a.status === "Pending").length;
  const unpaidAmount = unpaidCount * 250; // Mocking $250 avg per unpaid

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
            <p className="text-3xl font-bold text-[#1B3A6B]">{totalAppointments}</p>
          </div>
          <p className="text-[11px] font-bold text-emerald-500 mt-3 flex items-center gap-1.5">
            <TrendingUp size={14} />
            12% from last week
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-semibold text-slate-500">Pending Confirmation</p>
          <div className="mt-2">
            <p className="text-3xl font-bold text-[#1B3A6B]">{pendingCount}</p>
          </div>
          <p className="text-[11px] font-bold text-amber-500 mt-3 flex items-center gap-1.5">
            <Clock size={14} />
            Action required
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-semibold text-slate-500">Completed Sessions</p>
          <div className="mt-2">
            <p className="text-3xl font-bold text-[#1B3A6B]">{completedCount}</p>
          </div>
          <p className="text-[11px] font-bold text-slate-400 mt-3 flex items-center gap-1.5">
            <CheckCircle2 size={14} />
            On schedule
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-semibold text-slate-500">Unpaid Consultations</p>
          <div className="mt-2">
            <p className="text-3xl font-bold text-[#1B3A6B]">${unpaidAmount.toLocaleString()}</p>
          </div>
          <p className="text-[11px] font-bold text-red-500 mt-3 flex items-center gap-1.5">
            <AlertTriangle size={14} />
            {unpaidCount} overdue invoices
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
            <p className="text-xs font-medium text-slate-400">Showing {appointments.length} appointments</p>
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
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center animate-pulse">
                      <div className="w-10 h-10 border-4 border-slate-200 border-t-[#1B3A6B] rounded-full animate-spin mb-3"></div>
                      <p className="text-sm font-medium text-slate-400">Loading appointments...</p>
                    </div>
                  </td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Users size={48} className="text-slate-300 mb-4" />
                      <h3 className="text-slate-800 font-semibold text-lg mb-1">No appointments found</h3>
                      <p className="text-slate-500 text-sm">There are no appointments available.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                appointments.map((appt, i) => (
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
                      <span className={`inline-flex px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${appt.caseColor} truncate max-w-[120px]`}>
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
                        {(appt.status === "Overdue" || appt.status === "Cancelled") && <AlertCircle size={14} />}
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
                ))
              )}
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
