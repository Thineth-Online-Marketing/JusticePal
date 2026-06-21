"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Download,
  TrendingUp,
  FileText,
  Eye,
  CheckCircle2,
  XCircle,
  Shield,
  ArrowRight,
  Filter,
  ListFilter,
  CheckCircle,
  AlertCircle,
  X,
  Loader2,
  MapPin,
  Phone,
  Briefcase,
  User,
  Image as ImageIcon,
} from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

interface LawyerData {
  id: string;
  userId: string;
  specialization: string[];
  location: string | null;
  bio: string | null;
  isVerified: boolean;
  hourlyRate: number | null;
  idPhotos: string[];
  phone: string | null;
  phoneVerified: boolean;
  profileCompleted: boolean;
  profilePicture: string | null;
  workExperience: string | null;
  rejectedReason: string | null;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

interface AdminStats {
  totalUsers: number;
  totalLawyers: number;
  pendingVerifications: number;
  totalAppointments: number;
  activeCases: number;
}

function getStatus(lawyer: LawyerData): "Pending Review" | "Approved" | "Rejected" {
  if (lawyer.isVerified) return "Approved";
  if (lawyer.rejectedReason) return "Rejected";
  return "Pending Review";
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function LawyerVerificationPage() {
  const [activeTab, setActiveTab] = useState("All Requests");
  const [lawyers, setLawyers] = useState<LawyerData[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Detail modal
  const [selectedLawyer, setSelectedLawyer] = useState<LawyerData | null>(null);

  // Reject modal
  const [rejectTarget, setRejectTarget] = useState<LawyerData | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectLoading, setRejectLoading] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchLawyers = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/lawyers/pending`);
      if (res.ok) {
        const data = await res.json();
        setLawyers(data);
      }
    } catch (err) {
      console.error("Failed to fetch lawyers:", err);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/stats`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchLawyers(), fetchStats()]);
      setLoading(false);
    };
    loadData();
  }, [fetchLawyers, fetchStats]);

  const handleApprove = async (lawyerId: string) => {
    setActionLoading(lawyerId);
    try {
      const res = await fetch(`${BACKEND_URL}/api/lawyers/${lawyerId}/verify`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        setLawyers((prev) =>
          prev.map((l) => (l.id === lawyerId ? { ...l, isVerified: true, rejectedReason: null } : l))
        );
        showToast("Lawyer approved successfully!", "success");
        fetchStats();
      } else {
        showToast("Failed to approve lawyer.", "error");
      }
    } catch (err) {
      showToast("Network error. Please try again.", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectTarget) return;
    setRejectLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/lawyers/${rejectTarget.id}/reject`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason || "Application rejected by admin" }),
      });
      if (res.ok) {
        setLawyers((prev) =>
          prev.map((l) =>
            l.id === rejectTarget.id
              ? { ...l, isVerified: false, profileCompleted: false, rejectedReason: rejectReason || "Application rejected by admin" }
              : l
          )
        );
        showToast("Lawyer rejected.", "success");
        fetchStats();
        setRejectTarget(null);
        setRejectReason("");
      } else {
        showToast("Failed to reject lawyer.", "error");
      }
    } catch (err) {
      showToast("Network error. Please try again.", "error");
    } finally {
      setRejectLoading(false);
    }
  };

  // Filter lawyers by tab
  const filteredLawyers = lawyers.filter((l) => {
    const status = getStatus(l);
    if (activeTab === "All Requests") return true;
    if (activeTab === "Pending") return status === "Pending Review";
    if (activeTab === "Approved") return status === "Approved";
    if (activeTab === "Rejected") return status === "Rejected";
    return true;
  });

  const pendingCount = lawyers.filter((l) => getStatus(l) === "Pending Review").length;
  const approvedCount = lawyers.filter((l) => getStatus(l) === "Approved").length;
  const rejectedCount = lawyers.filter((l) => getStatus(l) === "Rejected").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#1B3A6B] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 font-[var(--font-inter)] text-slate-800">
      
      {/* TOAST */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-[100] px-5 py-3 rounded-xl shadow-lg text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-3 duration-300 ${
            toast.type === "success"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {toast.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.message}
          <button onClick={() => setToast(null)} className="ml-2 text-current opacity-50 hover:opacity-100">
            <X size={14} />
          </button>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Lawyer Verification Queue</h1>
          <p className="text-sm text-slate-500 mt-1">Review credentials and bar certificates for onboarding legal professionals.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { fetchLawyers(); fetchStats(); }}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Download size={16} />
            Refresh Data
          </button>
        </div>
      </div>

      {/* 4 STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-semibold text-slate-500">Pending Requests</p>
          <div className="mt-2">
            <p className="text-3xl font-bold text-slate-800">{pendingCount}</p>
          </div>
          <p className="text-[10px] font-bold text-amber-500 tracking-wider uppercase mt-3">
            {pendingCount > 0 ? `! ${pendingCount} AWAITING REVIEW` : "— NONE PENDING"}
          </p>
        </div>
        
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-semibold text-slate-500">Approved Lawyers</p>
          <div className="mt-2">
            <p className="text-3xl font-bold text-slate-800">{stats?.totalLawyers ?? approvedCount}</p>
          </div>
          <p className="text-[10px] font-bold text-emerald-500 tracking-wider uppercase mt-3 flex items-center gap-1">
            <TrendingUp size={12} />
            VERIFIED & ACTIVE
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-semibold text-slate-500">Rejected</p>
          <div className="mt-2">
            <p className="text-3xl font-bold text-slate-800">{rejectedCount}</p>
          </div>
          <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-3">— TOTAL REJECTED</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-semibold text-slate-500">Total Users</p>
          <div className="mt-2">
            <p className="text-3xl font-bold text-slate-800">{stats?.totalUsers ?? 0}</p>
          </div>
          <p className="text-[10px] font-bold text-emerald-500 tracking-wider uppercase mt-3">REGISTERED CLIENTS</p>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Table Tabs */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-6">
            {["All Requests", "Pending", "Approved", "Rejected"].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-sm font-semibold pb-4 -mb-[17px] transition-colors border-b-2 ${
                  activeTab === tab 
                  ? "border-[#1B3A6B] text-[#1B3A6B]" 
                  : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab}
                {tab === "Pending" && pendingCount > 0 && (
                  <span className="ml-1.5 bg-amber-100 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pendingCount}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Table Content */}
        {filteredLawyers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Shield size={40} className="mb-4 text-slate-300" />
            <p className="text-sm font-semibold">No lawyers found in this category.</p>
            <p className="text-xs mt-1">Lawyers will appear here once they complete their profile onboarding.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Lawyer Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Specialization</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Experience</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Documents</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredLawyers.map((lawyer) => {
                  const status = getStatus(lawyer);
                  const initials = getInitials(lawyer.user.name);
                  const isProcessing = actionLoading === lawyer.id;

                  return (
                    <tr key={lawyer.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-sm font-bold text-[#1B3A6B] shrink-0 overflow-hidden relative">
                            {lawyer.profilePicture ? (
                              <img src={lawyer.profilePicture} alt={lawyer.user.name} className="w-full h-full object-cover" />
                            ) : (
                              initials
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{lawyer.user.name}</p>
                            <p className="text-xs text-slate-500">{lawyer.user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {lawyer.specialization.length > 0 ? (
                            lawyer.specialization.map((spec, i) => (
                              <span key={i} className="inline-flex px-2.5 py-1 bg-slate-100 text-slate-600 text-[11px] font-bold rounded-md">
                                {spec}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400">Not specified</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-800">{lawyer.workExperience || "Not specified"}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">{lawyer.location || "No location"}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm font-bold text-[#1B3A6B]">
                          <FileText size={14} />
                          {lawyer.idPhotos.length} Files
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {status === "Pending Review" && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100/50 text-amber-600 text-xs font-bold rounded-full border border-amber-200/50">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            {status}
                          </span>
                        )}
                        {status === "Approved" && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100/50 text-emerald-600 text-xs font-bold rounded-full border border-emerald-200/50">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            {status}
                          </span>
                        )}
                        {status === "Rejected" && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100/50 text-red-600 text-xs font-bold rounded-full border border-red-200/50">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                            {status}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setSelectedLawyer(lawyer)}
                            className="text-slate-400 hover:text-[#1B3A6B] transition-colors"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          
                          {status === "Pending Review" && (
                            <>
                              <button
                                onClick={() => handleApprove(lawyer.id)}
                                disabled={isProcessing}
                                className="text-slate-400 hover:text-emerald-500 transition-colors disabled:opacity-50"
                                title="Approve"
                              >
                                {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                              </button>
                              <button
                                onClick={() => { setRejectTarget(lawyer); setRejectReason(""); }}
                                disabled={isProcessing}
                                className="text-slate-400 hover:text-red-500 transition-colors disabled:opacity-50"
                                title="Reject"
                              >
                                <XCircle size={18} />
                              </button>
                            </>
                          )}

                          {status === "Approved" && (
                            <span className="text-xs font-bold text-slate-400 px-2">Verified</span>
                          )}

                          {status === "Rejected" && (
                            <button
                              onClick={() => handleApprove(lawyer.id)}
                              disabled={isProcessing}
                              className="text-xs font-bold text-slate-600 px-3 py-1.5 border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50"
                            >
                              {isProcessing ? "Processing..." : "Re-evaluate"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Results count */}
        {filteredLawyers.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">
              Showing {filteredLawyers.length} of {lawyers.length} verification requests
            </p>
          </div>
        )}
      </div>

      {/* BOTTOM SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
        {/* Verification Guide */}
        <div className="bg-[#1c2c4d] rounded-2xl p-8 flex flex-col justify-center text-white relative overflow-hidden shadow-md">
          <div className="flex gap-6 items-center z-10">
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
              <Shield size={32} className="text-amber-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-amber-400 mb-2">Verification Guide</h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-4 pr-4">
                Ensure bar certifications match state database and expiration dates are valid for at least 6 months. High experience profiles require additional malpractice insurance verification.
              </p>
              <button className="text-sm font-bold text-white flex items-center gap-1.5 hover:underline decoration-amber-400 underline-offset-4">
                Review Policy Manual <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col h-full">
          <h3 className="text-base font-bold text-slate-800 mb-5">Queue Summary</h3>
          
          <div className="space-y-4 flex-1">
            <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50/50 border border-amber-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <AlertCircle size={14} className="text-amber-600" />
                </div>
                <p className="text-sm font-bold text-slate-800">Pending Review</p>
              </div>
              <span className="text-lg font-bold text-amber-600">{pendingCount}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50/50 border border-emerald-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <CheckCircle size={14} className="text-emerald-600" />
                </div>
                <p className="text-sm font-bold text-slate-800">Approved</p>
              </div>
              <span className="text-lg font-bold text-emerald-600">{approvedCount}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-red-50/50 border border-red-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <XCircle size={14} className="text-red-500" />
                </div>
                <p className="text-sm font-bold text-slate-800">Rejected</p>
              </div>
              <span className="text-lg font-bold text-red-500">{rejectedCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── DETAIL MODAL ────────────────────────────────── */}
      {selectedLawyer && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedLawyer(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-2xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-base font-bold text-[#1B3A6B] overflow-hidden relative shrink-0">
                    {selectedLawyer.profilePicture ? (
                      <img src={selectedLawyer.profilePicture} alt={selectedLawyer.user.name} className="w-full h-full object-cover" />
                    ) : (
                      getInitials(selectedLawyer.user.name)
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{selectedLawyer.user.name}</h2>
                    <p className="text-xs text-slate-500">{selectedLawyer.user.email}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedLawyer(null)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {/* Status Badge */}
                <div className="flex items-center gap-3">
                  {getStatus(selectedLawyer) === "Pending Review" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100/50 text-amber-600 text-xs font-bold rounded-full border border-amber-200/50">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      Pending Review
                    </span>
                  )}
                  {getStatus(selectedLawyer) === "Approved" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100/50 text-emerald-600 text-xs font-bold rounded-full border border-emerald-200/50">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Approved
                    </span>
                  )}
                  {getStatus(selectedLawyer) === "Rejected" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100/50 text-red-600 text-xs font-bold rounded-full border border-red-200/50">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                      Rejected
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400 font-bold">
                    Applied {new Date(selectedLawyer.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>

                {/* Rejection Reason */}
                {selectedLawyer.rejectedReason && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                    <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">Rejection Reason</p>
                    <p className="text-sm text-red-700">{selectedLawyer.rejectedReason}</p>
                  </div>
                )}

                {/* Profile Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <Briefcase size={16} className="text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Specialization</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">
                        {selectedLawyer.specialization.length > 0 ? selectedLawyer.specialization.join(", ") : "Not specified"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <MapPin size={16} className="text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Location</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">{selectedLawyer.location || "Not specified"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <Phone size={16} className="text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">
                        {selectedLawyer.phone || "Not provided"}
                        {selectedLawyer.phoneVerified && (
                          <span className="ml-2 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">Verified</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <User size={16} className="text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Work Experience</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">{selectedLawyer.workExperience || "Not specified"}</p>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {selectedLawyer.bio && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Bio</p>
                    <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-4 border border-slate-100">{selectedLawyer.bio}</p>
                  </div>
                )}

                {/* Hourly Rate */}
                {selectedLawyer.hourlyRate && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Hourly Rate</p>
                    <p className="text-lg font-bold text-[#1B3A6B]">LKR {selectedLawyer.hourlyRate.toLocaleString()}</p>
                  </div>
                )}

                {/* ID Photos */}
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Uploaded ID Documents ({selectedLawyer.idPhotos.length})</p>
                  {selectedLawyer.idPhotos.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {selectedLawyer.idPhotos.map((photo, i) => (
                        <a key={i} href={photo} target="_blank" rel="noopener noreferrer" className="block border border-slate-200 rounded-xl overflow-hidden hover:border-[#1B3A6B] transition-colors group">
                          <div className="h-32 bg-slate-100 flex items-center justify-center">
                            <ImageIcon size={24} className="text-slate-300 group-hover:text-[#1B3A6B] transition-colors" />
                          </div>
                          <div className="px-3 py-2 border-t border-slate-100">
                            <p className="text-xs font-bold text-slate-600 truncate">ID Document {i + 1}</p>
                          </div>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 bg-slate-50 rounded-xl p-4 border border-slate-100">No ID documents uploaded yet.</p>
                  )}
                </div>
              </div>

              {/* Modal Footer (Actions) */}
              {getStatus(selectedLawyer) === "Pending Review" && (
                <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4 flex items-center justify-end gap-3 rounded-b-2xl">
                  <button
                    onClick={() => {
                      setRejectTarget(selectedLawyer);
                      setRejectReason("");
                      setSelectedLawyer(null);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 border border-red-200 text-red-600 rounded-xl text-sm font-bold hover:bg-red-50 transition-colors"
                  >
                    <XCircle size={16} />
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      handleApprove(selectedLawyer.id);
                      setSelectedLawyer(null);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors shadow-sm"
                  >
                    <CheckCircle2 size={16} />
                    Approve Lawyer
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ─── REJECT MODAL ────────────────────────────────── */}
      {rejectTarget && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setRejectTarget(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <div className="px-6 py-5 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">Reject Verification</h2>
                <p className="text-xs text-slate-500 mt-1">Rejecting <span className="font-bold text-slate-700">{rejectTarget.user.name}</span>&apos;s application</p>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Rejection Reason</label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={4}
                    placeholder="e.g. Expired bar certification, missing ID documents, incomplete profile..."
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300 transition-all resize-none bg-slate-50"
                  />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  onClick={() => setRejectTarget(null)}
                  className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectSubmit}
                  disabled={rejectLoading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-colors shadow-sm disabled:opacity-60"
                >
                  {rejectLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <XCircle size={16} />
                  )}
                  {rejectLoading ? "Rejecting..." : "Confirm Rejection"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
