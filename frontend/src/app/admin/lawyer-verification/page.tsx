"use client";

import React, { useState } from "react";
import {
  Download,
  History,
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
  AlertCircle
} from "lucide-react";

// Mock Data
const lawyersData = [
  {
    id: "JB",
    name: "Jonathan Blackwell",
    email: "j.blackwell@legalcorp.com",
    specialization: "Corporate Law",
    experience: "12 Years",
    barId: "BAR ID: #199283",
    files: 3,
    status: "Pending Review",
  },
  {
    id: "EM",
    name: "Eleanor Martinez",
    email: "e.martinez@justice.org",
    specialization: "Family Law",
    experience: "8 Years",
    barId: "BAR ID: #228410",
    files: 4,
    status: "Approved",
  },
  {
    id: "SC",
    name: "Samuel Chen",
    email: "sam.chen@techlaw.co",
    specialization: "Intellectual Property",
    experience: "5 Years",
    barId: "BAR ID: #304192",
    files: 2,
    status: "Rejected",
  },
  {
    id: "AR",
    name: "Angela Ross",
    email: "angela.r@defense.net",
    specialization: "Criminal Defense",
    experience: "15 Years",
    barId: "BAR ID: #112837",
    files: 6,
    status: "Pending Review",
  },
];

export default function LawyerVerificationPage() {
  const [activeTab, setActiveTab] = useState("All Requests");

  return (
    <div className="space-y-6 font-[var(--font-inter)] text-slate-800">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Lawyer Verification Queue</h1>
          <p className="text-sm text-slate-500 mt-1">Review credentials and bar certificates for onboarding legal professionals.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
            <Download size={16} />
            Export Report
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#1B3A6B] text-white text-sm font-semibold rounded-lg hover:bg-[#152e55] transition-colors shadow-sm">
            <History size={16} />
            View Audit Log
          </button>
        </div>
      </div>

      {/* 4 STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-semibold text-slate-500">Pending Requests</p>
          <div className="mt-2">
            <p className="text-3xl font-bold text-slate-800">42</p>
          </div>
          <p className="text-[10px] font-bold text-amber-500 tracking-wider uppercase mt-3">! 12 URGENT</p>
        </div>
        
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-semibold text-slate-500">Approved Today</p>
          <div className="mt-2">
            <p className="text-3xl font-bold text-slate-800">156</p>
          </div>
          <p className="text-[10px] font-bold text-emerald-500 tracking-wider uppercase mt-3 flex items-center gap-1">
            <TrendingUp size={12} />
            +8% INCREASE
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-semibold text-slate-500">Rejection Rate</p>
          <div className="mt-2">
            <p className="text-3xl font-bold text-slate-800">4.2%</p>
          </div>
          <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-3">— STEADY AVG</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-semibold text-slate-500">Avg Review Time</p>
          <div className="mt-2">
            <p className="text-3xl font-bold text-slate-800">2.4h</p>
          </div>
          <p className="text-[10px] font-bold text-emerald-500 tracking-wider uppercase mt-3">{'>>'} IMPROVED</p>
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
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-4 sm:mt-0">
            <button className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50">
              <ListFilter size={16} />
            </button>
            <button className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50">
              <Filter size={16} />
            </button>
          </div>
        </div>

        {/* Table Content */}
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
              {lawyersData.map((lawyer, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-sm font-bold text-[#1B3A6B] shrink-0">
                        {lawyer.id}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{lawyer.name}</p>
                        <p className="text-xs text-slate-500">{lawyer.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-3 py-1 bg-slate-100 text-slate-600 text-[11px] font-bold rounded-md">
                      {lawyer.specialization}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-800">{lawyer.experience}</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">{lawyer.barId}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-sm font-bold text-[#1B3A6B]">
                      <FileText size={14} />
                      {lawyer.files} Files
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {lawyer.status === "Pending Review" && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100/50 text-amber-600 text-xs font-bold rounded-full border border-amber-200/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        {lawyer.status}
                      </span>
                    )}
                    {lawyer.status === "Approved" && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100/50 text-emerald-600 text-xs font-bold rounded-full border border-emerald-200/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        {lawyer.status}
                      </span>
                    )}
                    {lawyer.status === "Rejected" && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100/50 text-red-600 text-xs font-bold rounded-full border border-red-200/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        {lawyer.status}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button className="text-slate-400 hover:text-[#1B3A6B] transition-colors">
                        <Eye size={18} />
                      </button>
                      
                      {lawyer.status === "Pending Review" && (
                        <>
                          <button className="text-slate-400 hover:text-emerald-500 transition-colors">
                            <CheckCircle2 size={18} />
                          </button>
                          <button className="text-slate-400 hover:text-red-500 transition-colors">
                            <XCircle size={18} />
                          </button>
                        </>
                      )}

                      {lawyer.status === "Approved" && (
                        <span className="text-xs font-bold text-slate-400 px-2">Verified</span>
                      )}

                      {lawyer.status === "Rejected" && (
                        <button className="text-xs font-bold text-slate-600 px-3 py-1.5 border border-slate-200 rounded-md hover:bg-slate-50">
                          Re-evaluate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs font-medium text-slate-500">Showing 1-10 of 42 verification requests</p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 border border-slate-200 rounded-md text-xs font-bold text-slate-500 hover:bg-slate-50">Previous</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md bg-[#1B3A6B] text-white text-xs font-bold">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md text-slate-600 hover:bg-slate-50 text-xs font-bold">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md text-slate-600 hover:bg-slate-50 text-xs font-bold">3</button>
            <button className="px-3 py-1.5 border border-slate-200 rounded-md text-xs font-bold text-slate-600 hover:bg-slate-50">Next</button>
          </div>
        </div>
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

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col h-full">
          <h3 className="text-base font-bold text-slate-800 mb-5">Recent Activity</h3>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle size={14} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">David Wu was approved</p>
                <p className="text-xs text-slate-500 mt-0.5">by Admin Jenkins • 14 mins ago</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                <AlertCircle size={14} className="text-red-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Sarah Connor verification failed</p>
                <p className="text-xs text-slate-500 mt-0.5">Expired Bar ID detected • 45 mins ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
