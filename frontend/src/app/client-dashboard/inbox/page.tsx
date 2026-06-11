"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ClientNavbar from "../../components/ClientNavbar";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import {
  Video, Phone, MoreVertical, Send, Paperclip, Smile,
  FileText, Download, User, Scale, Calendar, Briefcase, Shield, ArrowLeft
} from "lucide-react";

/* ───────────────────── translations ───────────────────── */
const translations = {
  en: {
    activeChats: "My Attorneys",
    typePlaceholder: "Type your message here...",
    caseDetails: "CASE DETAILS",
    caseId: "CASE ID",
    caseType: "SPECIALTY",
    nextMilestone: "NEXT MILESTONE",
    sharedAssets: "SHARED DOCUMENTS",
    viewAll: "View All",
    statusOnline: "ONLINE",
    statusOffline: "OFFLINE",
    activeCase: "ACTIVE CASE",
    backBtn: "Back to Dashboard",
  },
  si: {
    activeChats: "මගේ නීතිඥයින්",
    typePlaceholder: "ඔබේ පණිවිඩය මෙහි ටයිප් කරන්න...",
    caseDetails: "නඩුවේ විස්තර",
    caseId: "නඩු අංකය",
    caseType: "විශේෂීකරණය",
    nextMilestone: "මීළඟ සන්ධිස්ථානය",
    sharedAssets: "බෙදාගත් ලිපිගොනු",
    viewAll: "සියල්ල බලන්න",
    statusOnline: "සක්‍රීයයි",
    statusOffline: "නොබැඳි",
    activeCase: "ක්‍රියාකාරී නඩුව",
    backBtn: "නැවත උපකරණ පුවරුවට",
  }
};

/* ───────────────────── mock data ───────────────────── */
const chatList = [
  {
    id: 1,
    name: "Sarah Jenkins",
    specialty: "Family Law",
    avatarColor: "bg-blue-100 text-blue-700",
    snippet: "I have reviewed the estate distribution files...",
    time: "10:30 AM",
    unread: true,
    caseId: "Case #JP-9821",
    caseTitle: "Johnson Estate Dispute",
  },
  {
    id: 2,
    name: "Kasun Perera",
    specialty: "Property & Civil Litigation",
    avatarColor: "bg-emerald-100 text-emerald-700",
    snippet: "The draft reply to TechCo has been updated.",
    time: "Yesterday",
    unread: false,
    caseId: "Case #JP-1044",
    caseTitle: "IP Infringement - TechCo",
  },
  {
    id: 3,
    name: "Samantha Rodrigo",
    specialty: "Tenancy & Property Law",
    avatarColor: "bg-purple-100 text-purple-700",
    snippet: "Please sign the lease agreement draft.",
    time: "Monday",
    unread: false,
    caseId: "Case #JP-2041",
    caseTitle: "Commercial Lease Review",
  }
];

const mockMessages = {
  1: [
    {
      id: 1,
      sender: "lawyer",
      text: "Hello, I have finalized the Johnson Estate draft distribution list. I think the proposed split is highly aligned with your instructions.",
      time: "9:15 AM",
    },
    {
      id: 2,
      sender: "client",
      text: "Thank you, Sarah. Can we double check if the residential property value is adjusted for the tax offsets?",
      time: "9:45 AM",
    },
    {
      id: 3,
      sender: "lawyer",
      text: "Yes, absolutely. I've updated the adjusters and attached the tax offsets sheet. Please review it and let me know if it's correct.",
      time: "10:30 AM",
      attachment: {
        name: "Estate_Tax_Offsets_v2.pdf",
        size: "1.4 MB",
        type: "PDF document",
      }
    }
  ],
  2: [
    {
      id: 1,
      sender: "client",
      text: "Hi Kasun, did we get any response from the TechCo legal team regarding the notice?",
      time: "Yesterday, 2:15 PM",
    },
    {
      id: 2,
      sender: "lawyer",
      text: "Yes, they reached out requesting a 14-day extension to construct their response. I recommend we agree to this in good faith.",
      time: "Yesterday, 3:00 PM",
    },
    {
      id: 3,
      sender: "client",
      text: "Makes sense. Let's do that. Send them the approval.",
      time: "Yesterday, 3:10 PM",
    }
  ],
  3: [
    {
      id: 1,
      sender: "lawyer",
      text: "Hi Alex, the commercial lease agreement review is complete. I made some minor changes to the security deposit refund timeline.",
      time: "Monday, 11:00 AM",
    },
    {
      id: 2,
      sender: "client",
      text: "Great. Did they agree to the 30-day refund window?",
      time: "Monday, 11:20 AM",
    },
    {
      id: 3,
      sender: "lawyer",
      text: "Yes, they did. Please review the updated draft and apply your signature scanning.",
      time: "Monday, 11:45 AM",
      attachment: {
        name: "Lease_Agreement_Final.pdf",
        size: "950 KB",
        type: "PDF document",
      }
    }
  ]
};

const mockSharedAssets = {
  1: [
    { name: "Estate_Distribution_Draft.docx", date: "Aug 15", size: "520 KB", type: "docx" },
    { name: "Estate_Tax_Offsets_v2.pdf", date: "Aug 24", size: "1.4 MB", type: "pdf" },
    { name: "Property_Survey_Report.jpg", date: "Aug 20", size: "3.2 MB", type: "img" },
  ],
  2: [
    { name: "Infringement_Notice_Signed.pdf", date: "Sep 01", size: "1.1 MB", type: "pdf" },
    { name: "TechCo_Evidence_Log.docx", date: "Sep 03", size: "2.3 MB", type: "docx" },
  ],
  3: [
    { name: "Lease_Agreement_Final.pdf", date: "Jun 02", size: "950 KB", type: "pdf" },
    { name: "Property_Assessment_Report.docx", date: "May 28", size: "1.8 MB", type: "docx" },
  ]
};

const mockMilestones = {
  1: { title: "Estate Split Mediation", date: "Aug 28, 2026" },
  2: { title: "IP Mediation Settlement", date: "Sep 15, 2026" },
  3: { title: "Agreement Execution", date: "Jun 30, 2026" }
};

export default function ClientInboxPage() {
  const { user, loading: authLoading } = useAuth();
  const [roleLoading, setRoleLoading] = useState(true);
  const { lang } = useLanguage();
  const tx = translations[lang as keyof typeof translations] || translations.en;
  const router = useRouter();

  const [activeChatId, setActiveChatId] = useState(1);
  const [messages, setMessages] = useState(mockMessages);
  const [inputVal, setInputVal] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (authLoading) return;

    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!user || !isLoggedIn) {
      localStorage.removeItem("isLoggedIn");
      router.replace("/login");
      return;
    }

    const verifyClientRole = async () => {
      try {
        const idToken = await user.getIdToken();
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/users/profile`,
          {
            headers: { Authorization: `Bearer ${idToken}` },
          }
        );
        if (res.ok) {
          const data = await res.json();
          if (data.role === "client") {
            setRoleLoading(false);
          } else if (data.role === "lawyer") {
            router.replace("/lawyer-dashboard");
          } else if (data.role === "admin") {
            router.replace("/admin");
          } else {
            router.replace("/login");
          }
        } else {
          router.replace("/login");
        }
      } catch (err) {
        console.error("Failed to verify client role", err);
        router.replace("/login");
      }
    };

    verifyClientRole();
  }, [user, authLoading, router]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeChatId]);

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <svg className="animate-spin h-10 w-10 text-[#1B3A6B]" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      </div>
    );
  }

  const activeChat = chatList.find((c) => c.id === activeChatId) || chatList[0];
  const chatFeed = messages[activeChatId as keyof typeof messages] || [];
  const sharedAssets = mockSharedAssets[activeChatId as keyof typeof mockSharedAssets] || [];
  const milestone = mockMilestones[activeChatId as keyof typeof mockMilestones];

  const handleSendMessage = () => {
    if (!inputVal.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: "client",
      text: inputVal,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId as keyof typeof prev] || []), newMsg],
    }));

    setInputVal("");
  };

  const getFileIconColor = (type: string) => {
    if (type === "pdf") return "bg-red-50 text-red-500 border border-red-100";
    if (type === "docx") return "bg-blue-50 text-blue-500 border border-blue-100";
    return "bg-amber-50 text-amber-500 border border-amber-100";
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans overflow-hidden h-screen">
      <ClientNavbar />

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden mt-[72px] bg-white">
        
        {/* LEFT COLUMN: Chat List */}
        <div className="w-[340px] flex-shrink-0 border-r border-gray-200 flex flex-col h-full bg-white">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">{tx.activeChats}</h2>
            <Link href="/client-dashboard" className="text-xs font-bold text-[#1B3A6B] flex items-center gap-1 hover:underline">
              <ArrowLeft className="w-3.5 h-3.5" />
              {lang === "en" ? "Dashboard" : "උපකරණ පුවරුව"}
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto">
            {chatList.map((chat) => {
              const isActive = chat.id === activeChatId;
              const initials = chat.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2);

              return (
                <div
                  key={chat.id}
                  onClick={() => setActiveChatId(chat.id)}
                  className={`p-4 flex gap-4 cursor-pointer transition-colors border-l-4 ${
                    isActive
                      ? "border-l-[#1B3A6B] bg-blue-50/20"
                      : "border-l-transparent hover:bg-gray-50"
                  }`}
                >
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${chat.avatarColor}`}>
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h3 className="text-sm font-bold text-gray-900 truncate">{chat.name}</h3>
                      <span className={`text-[10px] font-bold ${chat.unread ? "text-blue-600 font-extrabold" : "text-gray-400"}`}>
                        {chat.time}
                      </span>
                    </div>
                    <p className="text-[10px] font-bold text-blue-600 mb-1 truncate">{chat.caseTitle}</p>
                    <p className="text-xs text-gray-500 truncate font-medium">{chat.snippet}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* MIDDLE COLUMN: Chat Thread */}
        <div className="flex-1 flex flex-col min-w-0 bg-white border-r border-gray-200">
          
          {/* Chat Header */}
          <div className="h-20 border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0 bg-white">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-base ${activeChat.avatarColor}`}>
                {activeChat.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900 leading-tight">{activeChat.name}</h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">
                    {tx.statusOnline} · {activeChat.specialty}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-gray-400">
              <button className="p-2 hover:bg-gray-50 rounded-xl transition-colors" aria-label="Video Call">
                <Video className="w-5 h-5 text-gray-500" />
              </button>
              <button className="p-2 hover:bg-gray-50 rounded-xl transition-colors" aria-label="Audio Call">
                <Phone className="w-5 h-5 text-gray-500" />
              </button>
              <button className="p-2 hover:bg-gray-50 rounded-xl transition-colors" aria-label="More Options">
                <MoreVertical className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
            {chatFeed.map((msg, index) => {
              const isClient = msg.sender === "client";
              return (
                <div key={msg.id || index} className={`flex gap-3 ${isClient ? "justify-end" : "justify-start"}`}>
                  
                  {!isClient && (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 self-end mb-1 ${activeChat.avatarColor}`}>
                      {activeChat.name[0]}
                    </div>
                  )}

                  <div className="flex flex-col gap-1 max-w-[70%]">
                    <div
                      className={`p-4 rounded-2xl shadow-sm text-sm font-medium leading-relaxed border ${
                        isClient
                          ? "bg-[#1B3A6B] text-white border-transparent rounded-tr-sm"
                          : "bg-white text-gray-700 border-gray-100 rounded-tl-sm"
                      }`}
                    >
                      {msg.text}

                      {/* File attachment preview */}
                      {('attachment' in msg) && msg.attachment && (
                        <div className="mt-3 bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0 font-bold text-xs uppercase">
                            {msg.attachment.name.split(".").pop()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">{msg.attachment.name}</p>
                            <p className="text-[10px] text-slate-400 font-semibold">{msg.attachment.size} · {msg.attachment.type}</p>
                          </div>
                          <button className="p-2 text-slate-400 hover:text-[#1B3A6B] rounded-lg transition-colors" aria-label="Download Attachment">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <span className={`text-[9px] font-bold text-gray-400 px-1 ${isClient ? "text-right" : "text-left"}`}>
                      {msg.time}
                    </span>
                  </div>

                  {isClient && (
                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 self-end mb-1 relative border border-slate-300">
                      {user?.displayName ? user.displayName[0] : "A"}
                    </div>
                  )}

                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-100 bg-white flex-shrink-0">
            <div className="flex items-center gap-2 p-2 border border-gray-200 bg-[#F9FAFC] rounded-2xl focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300 transition-all">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors" aria-label="Attach File">
                <Paperclip className="w-5 h-5" />
              </button>
              <input
                type="text"
                placeholder={tx.typePlaceholder}
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendMessage();
                }}
                className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder-gray-400 py-2"
              />
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors" aria-label="Emoji Picker">
                <Smile className="w-5 h-5" />
              </button>
              <button
                onClick={handleSendMessage}
                className="w-10 h-10 bg-[#1B3A6B] text-white rounded-xl flex items-center justify-center hover:bg-[#112549] transition-colors shadow-sm shrink-0"
                aria-label="Send Message"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Case Context */}
        <div className="w-[300px] flex-shrink-0 flex flex-col h-full bg-[#FDFDFE] overflow-y-auto">
          <div className="p-6 space-y-8">
            
            {/* Case Details */}
            <div>
              <h3 className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-4">{tx.caseDetails}</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-bold text-blue-600 mb-0.5">{tx.caseId}</p>
                  <p className="text-sm font-bold text-slate-800">{activeChat.caseId}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-blue-600 mb-0.5">{tx.caseType}</p>
                  <p className="text-sm font-bold text-slate-800">{activeChat.specialty}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-blue-600 mb-0.5">{lang === "en" ? "CASE TITLE" : "නඩු නාමය"}</p>
                  <p className="text-sm font-bold text-slate-800 leading-snug">{activeChat.caseTitle}</p>
                </div>
              </div>
            </div>

            {/* Next Milestone */}
            {milestone && (
              <div>
                <h3 className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-4">{tx.nextMilestone}</h3>
                <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                  <p className="text-sm font-bold text-slate-800 leading-tight">{milestone.title}</p>
                  <p className="text-[10px] font-bold text-gray-400 mt-1">Due: {milestone.date}</p>
                </div>
              </div>
            )}

            {/* Shared Assets */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">{tx.sharedAssets}</h3>
                <button className="text-[10px] font-bold text-[#1B3A6B] hover:underline">{tx.viewAll}</button>
              </div>
              
              <div className="space-y-3">
                {sharedAssets.map((asset, index) => (
                  <div key={index} className="flex items-center gap-3 hover:bg-slate-50 p-1 rounded-lg transition-colors cursor-pointer">
                    <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 font-bold text-[9px] uppercase ${getFileIconColor(asset.type)}`}>
                      {asset.type}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 truncate leading-snug">{asset.name}</p>
                      <p className="text-[9px] font-bold text-slate-400 mt-0.5">{asset.date} · {asset.size}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
