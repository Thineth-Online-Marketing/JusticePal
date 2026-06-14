"use client";

import React, { useState } from 'react';
import { useLanguage } from "../../context/LanguageContext";

const content = {
  en: {
    activeCases: "Active Cases",
    recent: "Recent",
    archived: "Archived",
    typeMessage: "Type your legal advice here...",
    caseSummary: "CASE SUMMARY",
    caseId: "CASE ID",
    type: "TYPE",
    nextMilestone: "NEXT MILESTONE",
    sharedAssets: "SHARED ASSETS",
    viewAll: "View All",
    billableTime: "BILLABLE TIME",
    thisWeek: "this week"
  },
  si: {
    activeCases: "ක්‍රියාකාරී නඩු",
    recent: "මෑත",
    archived: "ලේඛනාගාරගත",
    typeMessage: "ඔබේ නීති උපදෙස් මෙහි ටයිප් කරන්න...",
    caseSummary: "නඩු සාරාංශය",
    caseId: "නඩු අංකය",
    type: "වර්ගය",
    nextMilestone: "මීළඟ සන්ධිස්ථානය",
    sharedAssets: "බෙදාගත් වත්කම්",
    viewAll: "සියල්ල බලන්න",
    billableTime: "ගෙවිය යුතු කාලය",
    thisWeek: "මේ සතියේ"
  }
};

const conversationsData = [
  {
    id: 1,
    name: "Sarah Chen",
    time: "10:45 AM",
    caseId: "Case #3982",
    caseType: "Corporate",
    snippet: '"Please review the updated NDA..."',
    color: "bg-orange-300",
    status: "ONLINE • ACTIVE CASE",
    statusColor: "bg-green-500",
    caseDetails: {
      id: "#3982-CH-2026",
      type: "Corporate Merger",
      milestone: "Final Review",
      dueDate: "Aug 28, 2026",
      billable: "12.5 hrs",
      thisWeek: "+2.5"
    },
    dateLabel: "August 24, 2026",
    messages: [
      {
        id: 1,
        type: "incoming",
        text: "Hello, I've reviewed the preliminary contract details. I have some concerns regarding the termination clause in Section 4.2.",
        time: "10:12 AM"
      },
      {
        id: 2,
        type: "outgoing",
        text: "I understand your concern. I've drafted a revised version that includes a 60-day notice period instead of the original 30 days. Please find it attached below.",
        time: "10:28 AM • Read",
        attachment: {
          name: "Contract_Revised_v2....",
          meta: "1.2 MB • Legal Document",
          type: "PDF",
          color: "bg-red-50 text-red-500"
        }
      },
      {
        id: 3,
        type: "incoming",
        text: "This looks much better. I'll share it with the board for final approval.",
        time: "10:45 AM"
      }
    ],
    assets: [
      { id: 1, name: "Project_Brief.docx", meta: "Aug 15, 2026 • 450 KB", iconType: "doc", color: "bg-blue-50 text-blue-500" },
      { id: 2, name: "NDA_Executed.pdf", meta: "Aug 20, 2026 • 1.4 MB", iconType: "pdf", color: "bg-red-50 text-red-500" },
      { id: 3, name: "Signature_Scan.jpg", meta: "Aug 22, 2026 • 2.1 MB", iconType: "img", color: "bg-orange-50 text-orange-500" }
    ]
  },
  {
    id: 2,
    name: "Alex Rivera",
    time: "Yesterday",
    caseId: "Case #4421",
    caseType: "Litigation",
    snippet: "Document_Draft_v2.pdf",
    isFile: true,
    color: "bg-gray-400",
    status: "OFFLINE • PREPARATION",
    statusColor: "bg-gray-400",
    caseDetails: {
      id: "#4421-LT-2026",
      type: "Civil Litigation",
      milestone: "Deposition Phase",
      dueDate: "Sep 05, 2026",
      billable: "8.0 hrs",
      thisWeek: "+1.0"
    },
    dateLabel: "August 23, 2026",
    messages: [
      {
        id: 1,
        type: "incoming",
        text: "Can you take a look at the second draft of the discovery requests?",
        time: "02:15 PM"
      },
      {
        id: 2,
        type: "outgoing",
        text: "Sure, let me review the draft right away.",
        time: "02:30 PM • Read"
      }
    ],
    assets: [
      { id: 1, name: "Evidence_Log.xlsx", meta: "Aug 10, 2026 • 800 KB", iconType: "doc", color: "bg-green-50 text-green-500" },
      { id: 2, name: "Document_Draft_v2.pdf", meta: "Aug 23, 2026 • 1.1 MB", iconType: "pdf", color: "bg-red-50 text-red-500" }
    ]
  },
  {
    id: 3,
    name: "Marcus Thorne",
    time: "Monday",
    caseId: "Case #3120",
    caseType: "IP Law",
    snippet: "Thank you for the advice.",
    color: "bg-purple-300",
    status: "OFFLINE • ARCHIVED",
    statusColor: "bg-gray-400",
    caseDetails: {
      id: "#3120-IP-2026",
      type: "Patent Filing",
      milestone: "Approval Pending",
      dueDate: "Oct 12, 2026",
      billable: "24.5 hrs",
      thisWeek: "+0.0"
    },
    dateLabel: "August 21, 2026",
    messages: [
      {
        id: 1,
        type: "outgoing",
        text: "The patent application has been submitted successfully.",
        time: "11:00 AM • Read"
      },
      {
        id: 2,
        type: "incoming",
        text: "Thank you for the advice. I'll wait for their response.",
        time: "11:45 AM"
      }
    ],
    assets: [
      { id: 1, name: "Patent_Draft_Final.pdf", meta: "Aug 18, 2026 • 3.2 MB", iconType: "pdf", color: "bg-red-50 text-red-500" }
    ]
  }
];

export default function MessagesPage() {
  const { lang } = useLanguage();
  const tx = content[lang as keyof typeof content] || content.en;
  
  const [activeTab, setActiveTab] = useState<'active' | 'recent' | 'archived'>('active');
  const [currentChatId, setCurrentChatId] = useState<number>(1);

  const activeChat = conversationsData.find(c => c.id === currentChatId) || conversationsData[0];

  const renderIcon = (type: string) => {
    if (type === 'pdf') return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;
    if (type === 'img') return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
    return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
  };

  return (
    <main className="flex-1 flex overflow-hidden bg-white h-full relative">
      
      {/* LEFT COLUMN: Chat List */}
      <div className="w-[340px] flex-shrink-0 border-r border-gray-200 flex flex-col h-full bg-white">
        
        {/* Tabs */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex bg-gray-50/80 p-1 rounded-full border border-gray-200 shadow-sm">
            <button 
              onClick={() => setActiveTab('active')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-full transition-all ${activeTab === 'active' ? 'bg-[#1B3A6B] text-white shadow' : 'text-gray-600 hover:text-gray-900'}`}
            >
              {tx.activeCases}
            </button>
            <button 
              onClick={() => setActiveTab('recent')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-full transition-all ${activeTab === 'recent' ? 'bg-[#1B3A6B] text-white shadow' : 'text-gray-600 hover:text-gray-900'}`}
            >
              {tx.recent}
            </button>
            <button 
              onClick={() => setActiveTab('archived')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-full transition-all ${activeTab === 'archived' ? 'bg-[#1B3A6B] text-white shadow' : 'text-gray-600 hover:text-gray-900'}`}
            >
              {tx.archived}
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {conversationsData.map((chat) => (
            <div 
              key={chat.id} 
              onClick={() => setCurrentChatId(chat.id)}
              className={`p-4 flex gap-4 cursor-pointer transition-colors border-l-4 ${chat.id === currentChatId ? 'border-l-[#1B3A6B] bg-blue-50/30' : 'border-l-transparent hover:bg-gray-50'}`}
            >
              <div className={`w-12 h-12 rounded-full flex-shrink-0 ${chat.color}`}></div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                  <h3 className="text-sm font-bold text-gray-900 truncate">{chat.name}</h3>
                  <span className={`text-[10px] font-bold ${chat.id === currentChatId ? 'text-gray-500' : 'text-gray-400'}`}>{chat.time}</span>
                </div>
                <p className="text-[11px] font-bold text-gray-500 mb-1">{chat.caseId} • {chat.caseType}</p>
                <div className="flex items-center gap-1.5">
                  {chat.isFile && (
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  )}
                  <p className="text-xs text-gray-500 truncate font-medium">{chat.snippet}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MIDDLE COLUMN: Chat Thread */}
      <div className="flex-1 flex flex-col min-w-0 bg-white relative">
        
        {/* Chat Header */}
        <div className="h-20 border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className={`w-12 h-12 rounded-full ${activeChat.color}`}></div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 leading-tight">{activeChat.name}</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className={`w-2 h-2 rounded-full ${activeChat.statusColor}`}></div>
                <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">{activeChat.status}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-gray-400">
            <button className="p-2 hover:bg-gray-50 rounded-full transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            </button>
            <button className="p-2 hover:bg-gray-50 rounded-full transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
            </button>
            <button className="p-2 hover:bg-gray-50 rounded-full transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex justify-center">
            <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-[10px] font-bold tracking-wider uppercase">{activeChat.dateLabel}</span>
          </div>

          {activeChat.messages.map((msg) => {
            if (msg.type === "incoming") {
              return (
                <div key={msg.id} className="flex gap-4">
                  <div className={`w-8 h-8 rounded-full ${activeChat.color} flex-shrink-0 mt-1`}></div>
                  <div className="flex flex-col gap-1.5 max-w-[80%]">
                    <div className="bg-[#F8FAFC] text-gray-700 p-4 rounded-2xl rounded-tl-sm text-sm font-medium leading-relaxed border border-gray-100 shadow-sm w-fit inline-block">
                      {msg.text}
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 px-1">{msg.time}</span>
                  </div>
                </div>
              );
            } else {
              return (
                <div key={msg.id} className="flex gap-4 justify-end">
                  <div className="flex flex-col gap-1.5 max-w-[80%] items-end">
                    <div className="bg-[#1B3A6B] text-white p-4 rounded-2xl rounded-tr-sm text-sm font-medium leading-relaxed shadow-sm w-fit inline-block">
                      {msg.text}
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 px-1 flex items-center gap-1">
                      {msg.time}
                    </span>
                    
                    {(msg as any).attachment && (
                      <div className="mt-2 w-full max-w-[320px] bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                        <div className={`w-10 h-10 rounded-lg ${(msg as any).attachment.color} flex items-center justify-center flex-shrink-0`}>
                          <span className="font-black text-xs">{(msg as any).attachment.type}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">{(msg as any).attachment.name}</p>
                          <p className="text-[10px] font-bold text-gray-400 mt-0.5">{(msg as any).attachment.meta}</p>
                        </div>
                        <button className="p-2 text-gray-400 hover:text-[#1B3A6B] hover:bg-blue-50 rounded-lg transition-colors">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#375a5e] flex-shrink-0 mt-1"></div>
                </div>
              );
            }
          })}

        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-gray-100 bg-white flex-shrink-0">
          <div className="flex items-center gap-3 p-2 border border-gray-200 bg-[#F9FAFC] rounded-2xl focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300 transition-all">
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
            </button>
            <input 
              type="text" 
              placeholder={tx.typeMessage}
              className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder-gray-400 py-2"
            />
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </button>
            <button className="w-10 h-10 bg-[#1B3A6B] text-white rounded-xl flex items-center justify-center hover:bg-[#112549] transition-colors shadow-sm">
              <svg className="w-4 h-4 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Case Context */}
      <div className="w-[320px] flex-shrink-0 border-l border-gray-200 flex flex-col h-full bg-[#FDFDFE]">
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Case Summary */}
          <div>
            <h3 className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-4">{tx.caseSummary}</h3>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold text-blue-600 mb-0.5">{tx.caseId}</p>
                <p className="text-sm font-bold text-gray-900">{activeChat.caseDetails.id}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-blue-600 mb-0.5">{tx.type}</p>
                <p className="text-sm font-bold text-gray-900">{activeChat.caseDetails.type}</p>
              </div>
            </div>
          </div>

          {/* Next Milestone */}
          <div>
            <h3 className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-4">{tx.nextMilestone}</h3>
            <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
              <p className="text-sm font-bold text-gray-900">{activeChat.caseDetails.milestone}</p>
              <p className="text-[10px] font-bold text-gray-400 mt-1">Due: {activeChat.caseDetails.dueDate}</p>
            </div>
          </div>

          {/* Shared Assets */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">{tx.sharedAssets}</h3>
              <button className="text-[10px] font-bold text-[#1B3A6B] hover:underline">{tx.viewAll}</button>
            </div>
            <div className="space-y-3">
              {activeChat.assets.map(asset => (
                <div key={asset.id} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded ${asset.color} flex items-center justify-center flex-shrink-0`}>
                    {renderIcon(asset.iconType)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">{asset.name}</p>
                    <p className="text-[10px] font-bold text-gray-400 mt-0.5">{asset.meta}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Billable Time Footer */}
        <div className="p-6 border-t border-gray-100 bg-[#FDFDFE]">
          <div className="bg-[#F3F6F8] rounded-xl p-4 border border-gray-200">
            <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-1">{tx.billableTime}</p>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-black text-[#1B3A6B]">{activeChat.caseDetails.billable}</span>
              <span className="text-xs font-bold text-[#10B981] mb-1">{activeChat.caseDetails.thisWeek} {tx.thisWeek}</span>
            </div>
          </div>
        </div>
      </div>

    </main>
  );
}
