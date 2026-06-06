"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import Image from "next/image";
import {
  Users,
  Scale,
  CalendarCheck,
  CreditCard,
  FileText,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  ShieldAlert,
  CheckCircle,
  XCircle,
  Phone,
  MapPin,
  Briefcase,
  Layers,
  FileCheck
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

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

/* ── mock chart data ─────────────────────────────────────── */
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

const barColors = revenueData.map((_, i) => {
  if (i === 5) return "#1e3a8a";
  if (i === 6) return "#f59e0b";
  return "#cbd5e1";
});

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(true);
  const [roleLoading, setRoleLoading] = useState(false);
  
  // Dynamic stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLawyers: 0,
    pendingVerifications: 0,
    totalAppointments: 0,
    activeCases: 0,
  });

  // Dynamic lawyer queue
  const [lawyerQueue, setLawyerQueue] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedLawyer, setSelectedLawyer] = useState<any>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchWithoutToken = async () => {
      let idToken = "";
      if (user) {
        try {
          idToken = await user.getIdToken();
        } catch (err) {
          console.error("Error getting token", err);
        }
      }
      await fetchDashboardData(idToken);
    };
    fetchWithoutToken();
  }, [user]);

  const fetchDashboardData = async (token: string) => {
    try {
      setLoadingData(true);
      const headers: HeadersInit = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const [statsRes, pendingRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/admin/stats`, {
          headers
        }),
        fetch(`${BACKEND_URL}/api/lawyers/pending`, {
          headers
        })
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (pendingRes.ok) {
        const queueData = await pendingRes.json();
        setLawyerQueue(queueData);
      }
    } catch (error) {
      console.error("Error fetching admin data", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleVerify = async (lawyerId: string) => {
    try {
      setVerifyingId(lawyerId);
      let idToken = "";
      if (user) {
        try {
          idToken = await user.getIdToken();
        } catch (e) {
          console.error("Error getting idToken", e);
        }
      }
      const headers: HeadersInit = {};
      if (idToken) {
        headers["Authorization"] = `Bearer ${idToken}`;
      }
      const res = await fetch(`${BACKEND_URL}/api/lawyers/${lawyerId}/verify`, {
        method: "PUT",
        headers,
      });

      if (res.ok) {
        alert("Lawyer verified successfully!");
        setSelectedLawyer(null);
        // Refresh dashboard data
        await fetchDashboardData(idToken);
      } else {
        const errData = await res.json();
        alert(errData.message || "Failed to verify lawyer.");
      }
    } catch (error) {
      console.error("Error verifying lawyer", error);
      alert("Error verifying lawyer. Please try again.");
    } finally {
      setVerifyingId(null);
    }
  };

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <svg
          className="animate-spin h-10 w-10 text-[#1B3A6B]"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const cards = [
    {
      label: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      change: "+12%",
      up: true,
      icon: Users,
      accent: "#3b82f6",
    },
    {
      label: "Verified Lawyers",
      value: stats.totalLawyers.toLocaleString(),
      change: "+8%",
      up: true,
      icon: Scale,
      accent: "#1e3a8a",
    },
    {
      label: "Pending Reviews",
      value: stats.pendingVerifications.toLocaleString(),
      change: stats.pendingVerifications > 0 ? "Action required" : "All clear",
      up: stats.pendingVerifications === 0,
      icon: FileCheck,
      accent: "#f59e0b",
    },
    {
      label: "Appointments",
      value: stats.totalAppointments.toLocaleString(),
      change: "+15%",
      up: true,
      icon: CalendarCheck,
      accent: "#10b981",
    },
    {
      label: "Platform Revenue",
      value: `$${(stats.totalAppointments * 250).toLocaleString()}`,
      change: "+22%",
      up: true,
      icon: CreditCard,
      accent: "#8b5cf6",
    },
  ];

  return (
    <>
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
            Admin Panel Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Real-time platform performance and verification management for the JusticePal ecosystem
          </p>
        </div>
      </div>

      {/* ── STAT CARDS ───────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {cards.map((card) => {
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
                  <Icon size={18} color={card.accent} />
                </div>
                <span
                  className="inline-flex items-center gap-0.5 text-[10px] sm:text-[11px] font-semibold px-1.5 py-0.5 rounded-full"
                  style={{
                    background: card.up ? "#ecfdf5" : "#fef2f2",
                    color: card.up ? "#10b981" : "#ef4444",
                  }}
                >
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
                  {(stats.totalUsers + stats.totalLawyers).toLocaleString()}
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
                  LKR {((stats.totalAppointments * 250) + 158000).toLocaleString()}
                </span>
                <span
                  className="inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-full"
                  style={{ background: "#ecfdf5", color: "#10b981" }}
                >
                  <TrendingUp size={11} />
                  +18%
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
            <p className="text-xs text-slate-400 mt-0.5">
              Review documents and verify registered lawyers
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-100">
            {lawyerQueue.length} Pending
          </span>
        </div>

        {loadingData ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            Loading verification queue...
          </div>
        ) : lawyerQueue.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            No pending verifications at the moment.
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <table className="w-full text-left hidden md:table">
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  <th className="px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Submitted Date
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
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white bg-amber-500">
                          {lawyer.user?.name ? lawyer.user.name.charAt(0) : "L"}
                        </div>
                        <span className="text-sm font-medium text-slate-700">
                          {lawyer.user?.name || "Unknown"}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-500">
                      {lawyer.user?.email || "-"}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-500">
                      {lawyer.phone || "-"}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-500">
                      {new Date(lawyer.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => setSelectedLawyer(lawyer)}
                        className="text-[12px] font-semibold px-3.5 py-1.5 rounded-lg transition-all bg-[#1e3a8a] text-white hover:bg-blue-950 hover:shadow-md"
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
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold text-white bg-amber-500 shrink-0">
                        {lawyer.user?.name ? lawyer.user.name.charAt(0) : "L"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">
                          {lawyer.user?.name || "Unknown"}
                        </p>
                        <p className="text-xs text-slate-400">
                          {lawyer.user?.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      {new Date(lawyer.updatedAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => setSelectedLawyer(lawyer)}
                      className="text-[12px] font-semibold px-3.5 py-1.5 rounded-lg transition-all bg-[#1e3a8a] text-white hover:bg-blue-950 hover:shadow-md"
                    >
                      Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ─── DETAIL MODAL ─────────────────────────────── */}
      {selectedLawyer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in-up">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-800">
                  Review Lawyer Documents
                </h3>
                <p className="text-xs text-slate-400">
                  Ensure all details match official bar council registries
                </p>
              </div>
              <button
                onClick={() => setSelectedLawyer(null)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1 hover:bg-slate-200/50 transition-all"
              >
                <XCircle size={22} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider">
                    Basic Info
                  </h4>
                  <div className="space-y-2">
                    <p className="text-slate-500">
                      Name: <span className="font-bold text-slate-800">{selectedLawyer.user?.name}</span>
                    </p>
                    <p className="text-slate-500">
                      Email: <span className="font-semibold text-slate-800">{selectedLawyer.user?.email}</span>
                    </p>
                    <p className="text-slate-500 flex items-center gap-1.5">
                      <Phone size={14} className="text-slate-400" />
                      Phone: <span className="font-semibold text-slate-800">{selectedLawyer.phone || "-"}</span>
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider">
                    Initial Profile Settings
                  </h4>
                  <div className="space-y-2">
                    <p className="text-slate-500 flex items-center gap-1.5">
                      <MapPin size={14} className="text-slate-400" />
                      Location: <span className="font-semibold text-slate-800">{selectedLawyer.location || "Not Provided yet"}</span>
                    </p>
                    <p className="text-slate-500 flex items-center gap-1.5">
                      <Briefcase size={14} className="text-slate-400" />
                      Experience: <span className="font-semibold text-slate-800">{selectedLawyer.workExperience || "Not Provided yet"}</span>
                    </p>
                    <p className="text-slate-500 flex items-center gap-1.5">
                      <Layers size={14} className="text-slate-400" />
                      Specialization: <span className="font-semibold text-slate-800">{selectedLawyer.specialization?.join(", ") || "None"}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Uploaded Documents */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider">
                  Uploaded Identification (Lawyer ID)
                </h4>
                
                {selectedLawyer.idPhotos && selectedLawyer.idPhotos.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                    {selectedLawyer.idPhotos.map((photo: string, index: number) => {
                      const isMockUrl = photo.includes("mock-id-photo");
                      return (
                        <div key={index} className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-50 aspect-[4/3] flex flex-col justify-center items-center p-4">
                          {isMockUrl ? (
                            <div className="text-center p-3">
                              <ShieldAlert size={40} className="text-blue-900 mx-auto mb-2" />
                              <p className="font-bold text-xs text-slate-800">Official Lawyer Certificate ID</p>
                              <p className="text-[10px] text-slate-400 mt-1">ID File Path: {photo}</p>
                            </div>
                          ) : (
                            <img src={photo} alt="Lawyer ID Document" className="w-full h-full object-contain" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 rounded-xl text-center text-slate-400 text-xs">
                    No documents uploaded.
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shrink-0">
              <button
                onClick={() => setSelectedLawyer(null)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              
              <button
                disabled={verifyingId !== null}
                onClick={() => handleVerify(selectedLawyer.id)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-600/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {verifyingId ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle size={14} />
                    Approve & Verify Lawyer
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
