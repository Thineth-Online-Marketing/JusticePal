"use client";

import React, { useState } from 'react';
import { useLanguage } from "../../context/LanguageContext";

const content = {
  en: {
    caseManagement: "Case Management",
    caseManagementDesc: "Manage 14 active proceedings in your current portfolio.",
    exportReport: "Export Report",
    createCase: "Create Case",
    filterPlaceholder: "Filter by client, docket number, or case title...",
    allCases: "All Cases",
    civil: "Civil",
    criminal: "Criminal",
    clientName: "CLIENT NAME",
    caseType: "CASE TYPE",
    status: "STATUS",
    nextMeeting: "NEXT MEETING",
    actions: "ACTIONS",
    showingCases: "Showing 4 of 14 cases"
  },
  si: {
    caseManagement: "නඩු කළමනාකරණය",
    caseManagementDesc: "ඔබගේ වත්මන් කළඹේ සක්‍රීය ක්‍රියාදාමයන් 14ක් කළමනාකරණය කරන්න.",
    exportReport: "වාර්තාව අපනයනය කරන්න",
    createCase: "නඩුවක් සාදන්න",
    filterPlaceholder: "සේවාදායකයා, ඩොකට් අංකය හෝ නඩුවේ මාතෘකාව අනුව පෙරහන් කරන්න...",
    allCases: "සියලුම නඩු",
    civil: "සිවිල්",
    criminal: "අපරාධ",
    clientName: "සේවාදායකයාගේ නම",
    caseType: "නඩු වර්ගය",
    status: "තත්වය",
    nextMeeting: "මීළඟ හමුවීම",
    actions: "ක්‍රියා",
    showingCases: "නඩු 14 න් 4 ක් පෙන්වයි"
  }
};

const mockCases = [
  {
    id: 1,
    initials: "JD",
    initialsBg: "bg-blue-100 text-blue-700",
    name: "Jonathan Doe",
    docket: "#2024-0012",
    type: "Corporate Liability",
    status: "Discovery",
    statusColor: "bg-blue-100 text-blue-600",
    statusDot: "bg-blue-500",
    nextMeetingDate: "Oct 14, 2026",
    nextMeetingTime: "10:30 AM (Hearing)",
    isToday: false
  },
  {
    id: 2,
    initials: "ES",
    initialsBg: "bg-gray-200 text-gray-700",
    name: "Elena Smith",
    docket: "#2024-0045",
    type: "Family / Divorce",
    status: "Mediation",
    statusColor: "bg-yellow-100 text-yellow-700",
    statusDot: "bg-yellow-500",
    nextMeetingDate: "Oct 16, 2026",
    nextMeetingTime: "2:00 PM (Client Meeting)",
    isToday: false
  },
  {
    id: 3,
    initials: "RK",
    initialsBg: "bg-red-100 text-red-700",
    name: "Robert King",
    docket: "#2023-0988",
    type: "Criminal Defense",
    status: "Active Trial",
    statusColor: "bg-green-100 text-green-700",
    statusDot: "bg-green-500",
    nextMeetingDate: "Today",
    nextMeetingTime: "4:30 PM (Debrief)",
    isToday: true
  },
  {
    id: 4,
    initials: "AM",
    initialsBg: "bg-purple-100 text-purple-700",
    name: "Apex Media Corp",
    docket: "#2024-0102",
    type: "IP Infringement",
    status: "On Hold",
    statusColor: "bg-gray-100 text-gray-600",
    statusDot: "bg-gray-400",
    nextMeetingDate: "Nov 02, 2026",
    nextMeetingTime: "9:00 AM (Deposition)",
    isToday: false
  }
];

export default function ActiveCasesPage() {
  const { lang } = useLanguage();
  const tx = content[lang as keyof typeof content] || content.en;
  const [openActionId, setOpenActionId] = useState<number | null>(null);

  return (
    <main className="flex-1 overflow-y-auto p-8 relative h-full bg-[#F5F7FA]">
      <div className="max-w-[1400px] mx-auto flex flex-col h-full space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-[#111827] tracking-tight">{tx.caseManagement}</h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">{tx.caseManagementDesc}</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              {tx.exportReport}
            </button>
            <button className="flex items-center gap-2 px-5 py-2 bg-[#1B3A6B] text-white rounded-lg text-sm font-semibold hover:bg-[#112549] transition-colors shadow-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {tx.createCase}
            </button>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white border border-gray-200 rounded-xl flex-1 flex flex-col overflow-hidden shadow-sm">
          
          {/* Toolbar */}
          <div className="p-4 border-b border-gray-100 flex flex-col lg:flex-row gap-4 items-center justify-between bg-gray-50/50">
            <div className="relative w-full lg:max-w-2xl">
              <svg className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                type="text" 
                placeholder={tx.filterPlaceholder}
                className="w-full bg-white text-sm text-gray-700 rounded-lg pl-10 pr-4 py-2.5 outline-none border border-gray-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all shadow-sm"
              />
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 whitespace-nowrap shadow-sm">
                {tx.allCases}
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 whitespace-nowrap shadow-sm">
                {tx.civil}
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 whitespace-nowrap shadow-sm">
                {tx.criminal}
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">{tx.clientName}</th>
                  <th className="px-6 py-4">{tx.caseType}</th>
                  <th className="px-6 py-4">{tx.status}</th>
                  <th className="px-6 py-4">{tx.nextMeeting}</th>
                  <th className="px-6 py-4 text-right">{tx.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mockCases.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${c.initialsBg}`}>
                          {c.initials}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{c.name}</p>
                          <p className="text-xs font-medium text-gray-400 mt-0.5">Docket: {c.docket}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-700">{c.type}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${c.statusColor}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${c.statusDot}`}></span>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className={`text-sm font-bold ${c.isToday ? 'text-red-500' : 'text-gray-900'}`}>{c.nextMeetingDate}</p>
                      <p className="text-xs font-medium text-gray-400 mt-0.5">{c.nextMeetingTime}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="relative inline-block text-left">
                        <button 
                          onClick={() => setOpenActionId(openActionId === c.id ? null : c.id)}
                          className={`p-2 rounded-lg transition-colors ${openActionId === c.id ? 'text-[#1B3A6B] bg-slate-100' : 'text-slate-500 hover:text-[#1B3A6B] hover:bg-slate-100'}`}
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>

                        {openActionId === c.id && (
                          <>
                            <div className="fixed inset-0 z-30" onClick={() => setOpenActionId(null)}></div>
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden z-40 animate-in fade-in slide-in-from-top-2 duration-200">
                              <div className="flex flex-col py-1">
                                <button className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-[#1B3A6B] transition-colors text-left w-full">View Details</button>
                                <button className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-[#1B3A6B] transition-colors text-left w-full">Edit Case</button>
                                <button className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-[#1B3A6B] transition-colors text-left w-full">Manage Documents</button>
                                <div className="h-px bg-gray-100 my-1"></div>
                                <button className="px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors text-left w-full">Close Case</button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Pagination */}
          <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-white">
            <span className="text-xs font-bold text-gray-400">{tx.showingCases}</span>
            <div className="flex items-center gap-2">
              <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
