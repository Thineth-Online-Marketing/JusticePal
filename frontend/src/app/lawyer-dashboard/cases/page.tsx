"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { FolderOpen, Search, Plus, Download, Loader2, Video, MoreVertical } from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const content = {
  en: {
    caseManagement: "Case Management",
    caseManagementDesc: "Manage active proceedings and client appointments in your portfolio.",
    exportReport: "Export Report",
    createCase: "Create Case",
    filterPlaceholder: "Filter by client name, docket number, or case details...",
    allCases: "All Cases",
    civil: "Civil / Property",
    criminal: "Criminal",
    clientName: "CLIENT NAME",
    caseType: "CASE TYPE",
    status: "STATUS",
    nextMeeting: "NEXT MEETING",
    actions: "ACTIONS",
    showingCases: "Showing {{count}} active cases",
    noCases: "No active cases found",
    noCasesSub: "Client appointments and cases will appear here once scheduled.",
    loading: "Loading active cases..."
  },
  si: {
    caseManagement: "නඩු කළමනාකරණය",
    caseManagementDesc: "ඔබගේ වත්මන් කළඹේ සක්‍රීය නඩු සහ හමුවීම් කළමනාකරණය කරන්න.",
    exportReport: "වාර්තාව අපනයනය කරන්න",
    createCase: "නඩුවක් සාදන්න",
    filterPlaceholder: "සේවාදායකයා, ඩොකට් අංකය හෝ නඩුවේ මාතෘකාව අනුව පෙරහන් කරන්න...",
    allCases: "සියලුම නඩු",
    civil: "සිවිල් / දේපළ",
    criminal: "අපරාධ",
    clientName: "සේවාදායකයාගේ නම",
    caseType: "නඩු වර්ගය",
    status: "තත්වය",
    nextMeeting: "මීළඟ හමුවීම",
    actions: "ක්‍රියා",
    showingCases: "සක්‍රීය නඩු {{count}} ක් පෙන්වයි",
    noCases: "සක්‍රීය නඩු හමු නොවීය",
    noCasesSub: "සේවාදායක හමුවීම් සහ නඩු වෙන් කළ පසු මෙහි දර්ශනය වේ.",
    loading: "නඩු පූරණය වෙමින් පවතී..."
  }
};

interface CaseItem {
  id: string;
  clientId: string;
  name: string;
  email: string;
  docket: string;
  type: string;
  status: string;
  scheduledAt: string;
  nextMeetingDate: string;
  nextMeetingTime: string;
  isToday: boolean;
  fileCount: number;
}

const INITIALS_COLORS = [
  "bg-blue-100 text-blue-700 border-blue-200",
  "bg-purple-100 text-purple-700 border-purple-200",
  "bg-emerald-100 text-emerald-700 border-emerald-200",
  "bg-amber-100 text-amber-700 border-amber-200",
  "bg-rose-100 text-rose-700 border-rose-200",
];

function getInitialsColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return INITIALS_COLORS[Math.abs(hash) % INITIALS_COLORS.length];
}

function getInitials(name: string): string {
  if (!name) return "CL";
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function getStatusBadge(status: string) {
  const u = (status || "PENDING").toUpperCase();
  if (u === "CONFIRMED" || u === "ACTIVE") {
    return { label: "Active", bg: "bg-green-50 text-green-700 border-green-200", dot: "bg-green-500" };
  } else if (u === "COMPLETED") {
    return { label: "Completed", bg: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500" };
  } else if (u === "CANCELLED" || u === "REJECTED") {
    return { label: "On Hold", bg: "bg-gray-100 text-gray-600 border-gray-200", dot: "bg-gray-400" };
  } else {
    return { label: "Pending", bg: "bg-yellow-50 text-yellow-700 border-yellow-200", dot: "bg-yellow-500" };
  }
}

export default function ActiveCasesPage() {
  const { user, loading: authLoading } = useAuth();
  const { lang } = useLanguage();
  const tx = content[lang as keyof typeof content] || content.en;
  const router = useRouter();

  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<"all" | "civil" | "criminal">("all");
  const [openActionId, setOpenActionId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }

    const fetchCases = async () => {
      try {
        const idToken = await user.getIdToken();
        const res = await fetch(`${BACKEND_URL}/api/lawyers/cases`, {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        if (res.ok) {
          const data: CaseItem[] = await res.json();
          setCases(data);
        }
      } catch (err) {
        console.error("Failed to fetch lawyer cases", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, [user, authLoading, router]);

  const filteredCases = cases.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.docket.toLowerCase().includes(q) ||
      c.type.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q);

    if (filterCategory === "civil") {
      return (
        matchesSearch &&
        (c.type.toLowerCase().includes("civil") ||
          c.type.toLowerCase().includes("property") ||
          c.type.toLowerCase().includes("corporate") ||
          c.type.toLowerCase().includes("family") ||
          c.type.toLowerCase().includes("tenancy"))
      );
    }
    if (filterCategory === "criminal") {
      return (
        matchesSearch &&
        (c.type.toLowerCase().includes("criminal") || c.type.toLowerCase().includes("defense"))
      );
    }
    return matchesSearch;
  });

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
            <button
              onClick={() => window.open(`${BACKEND_URL}/api/lawyers/report/download`, "_blank")}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4 text-gray-500" />
              {tx.exportReport}
            </button>
            <button
              onClick={() => router.push("/lawyer-dashboard/calendar")}
              className="flex items-center gap-2 px-5 py-2 bg-[#1B3A6B] text-white rounded-lg text-sm font-semibold hover:bg-[#112549] transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              {tx.createCase}
            </button>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white border border-gray-200 rounded-xl flex-1 flex flex-col overflow-hidden shadow-sm">
          
          {/* Toolbar */}
          <div className="p-4 border-b border-gray-100 flex flex-col lg:flex-row gap-4 items-center justify-between bg-gray-50/50">
            <div className="relative w-full lg:max-w-2xl">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={tx.filterPlaceholder}
                className="w-full bg-white text-sm text-gray-700 rounded-lg pl-10 pr-4 py-2.5 outline-none border border-gray-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all shadow-sm"
              />
            </div>

            <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
              <button 
                onClick={() => setFilterCategory("all")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap shadow-sm border ${
                  filterCategory === "all"
                    ? "bg-[#1B3A6B] text-white border-[#1B3A6B]"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {tx.allCases}
              </button>
              <button 
                onClick={() => setFilterCategory("civil")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap shadow-sm border ${
                  filterCategory === "civil"
                    ? "bg-[#1B3A6B] text-white border-[#1B3A6B]"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {tx.civil}
              </button>
              <button 
                onClick={() => setFilterCategory("criminal")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap shadow-sm border ${
                  filterCategory === "criminal"
                    ? "bg-[#1B3A6B] text-white border-[#1B3A6B]"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {tx.criminal}
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="flex-1 overflow-x-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin text-[#1B3A6B]" />
                <span className="text-sm font-medium">{tx.loading}</span>
              </div>
            ) : filteredCases.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                <div className="w-14 h-14 rounded-full bg-blue-50 text-[#1B3A6B] flex items-center justify-center mb-3">
                  <FolderOpen className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">{tx.noCases}</h3>
                <p className="text-xs text-gray-400 max-w-sm">{tx.noCasesSub}</p>
              </div>
            ) : (
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
                  {filteredCases.map((c) => {
                    const badge = getStatusBadge(c.status);
                    const colorClass = getInitialsColor(c.id);

                    return (
                      <tr key={c.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 border ${colorClass}`}>
                              {getInitials(c.name)}
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
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badge.bg}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className={`text-sm font-bold ${c.isToday ? 'text-red-600' : 'text-gray-900'}`}>{c.nextMeetingDate}</p>
                          <p className="text-xs font-medium text-gray-400 mt-0.5">{c.nextMeetingTime}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="relative inline-block text-left">
                            <button 
                              onClick={() => setOpenActionId(openActionId === c.id ? null : c.id)}
                              className={`p-2 rounded-lg transition-colors ${openActionId === c.id ? 'text-[#1B3A6B] bg-slate-100' : 'text-slate-500 hover:text-[#1B3A6B] hover:bg-slate-100'}`}
                            >
                              <MoreVertical className="w-5 h-5" />
                            </button>

                            {openActionId === c.id && (
                              <>
                                <div className="fixed inset-0 z-30" onClick={() => setOpenActionId(null)}></div>
                                <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden z-40 animate-in fade-in slide-in-from-top-2 duration-200">
                                  <div className="flex flex-col py-1">
                                    <button 
                                      onClick={() => router.push(`/consultation?role=lawyer&appointmentId=${c.id}`)}
                                      className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-[#1B3A6B] transition-colors text-left w-full flex items-center gap-2"
                                    >
                                      <Video className="w-4 h-4 text-blue-600" />
                                      Join Video Call
                                    </button>
                                    <button 
                                      onClick={() => router.push('/lawyer-dashboard/messages')}
                                      className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-[#1B3A6B] transition-colors text-left w-full"
                                    >
                                      Message Client
                                    </button>
                                    <button 
                                      onClick={() => router.push('/lawyer-dashboard/calendar')}
                                      className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-[#1B3A6B] transition-colors text-left w-full"
                                    >
                                      Schedule Session
                                    </button>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer Pagination */}
          <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-white">
            <span className="text-xs font-bold text-gray-400">
              {tx.showingCases.replace("{{count}}", String(filteredCases.length))}
            </span>
          </div>

        </div>
      </div>
    </main>
  );
}
