"use client";

import React, { useState } from 'react';
import { useLanguage } from "../../context/LanguageContext";

const content = {
  en: {
    calendar: "Calendar",
    day: "Day",
    week: "Week",
    month: "Month",
    sync: "Sync with Google",
    schedule: "Schedule Availability",
    pendingTitle: "Pending Booking Request",
    pendingDesc: "New consultation request from Alex Reed for tomorrow at 10:00 AM.",
    reschedule: "Reschedule",
    accept: "Accept Request",
    mon: "MON",
    tue: "TUE",
    wed: "WED",
    thu: "THU",
    fri: "FRI",
    sat: "SAT",
    sun: "SUN",
    consultation: "Consultation",
    videoMeeting: "Video Meeting",
    caseReview: "Case Review",
    workingHours: "WORKING HOURS: 08:00 AM - 06:00 PM (GMT -5)"
  },
  si: {
    calendar: "දින දර්ශනය",
    day: "දින",
    week: "සති",
    month: "මාස",
    sync: "Google සමග සමමුහුර්ත කරන්න",
    schedule: "ලබා ගත හැකි වේලාවන්",
    pendingTitle: "පොරොත්තු වෙන් කිරීමේ ඉල්ලීම",
    pendingDesc: "Alex Reed ගෙන් හෙට පෙ.ව. 10:00 සඳහා නව උපදේශන ඉල්ලීමක්.",
    reschedule: "කාලසටහන වෙනස් කරන්න",
    accept: "ඉල්ලීම පිළිගන්න",
    mon: "සඳුදා",
    tue: "අඟහ",
    wed: "බදාදා",
    thu: "බ්‍රහස්",
    fri: "සිකු",
    sat: "සෙන",
    sun: "ඉරිදා",
    consultation: "උපදේශනය",
    videoMeeting: "වීඩියෝ හමුවීම",
    caseReview: "නඩු සමාලෝචනය",
    workingHours: "වැඩ කරන වේලාවන්: පෙ.ව. 08:00 - ප.ව. 06:00 (GMT -5)"
  }
};

export default function CalendarPage() {
  const { lang } = useLanguage();
  const tx = content[lang as keyof typeof content] || content.en;
  
  const [view, setView] = useState<'Day' | 'Week' | 'Month'>('Week');
  
  const hours = [
    "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", 
    "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"
  ];

  return (
    <main className="flex-1 overflow-y-auto p-8 relative h-full bg-[#F5F7FA]">
      <div className="max-w-[1400px] mx-auto flex flex-col h-full space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-black text-[#111827] tracking-tight">{tx.calendar}</h1>
            
            {/* View Toggles */}
            <div className="flex p-1 bg-white border border-gray-200 rounded-lg shadow-sm">
              <button 
                onClick={() => setView('Day')}
                className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${view === 'Day' ? 'bg-[#1B3A6B] text-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                {tx.day}
              </button>
              <button 
                onClick={() => setView('Week')}
                className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${view === 'Week' ? 'bg-[#1B3A6B] text-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                {tx.week}
              </button>
              <button 
                onClick={() => setView('Month')}
                className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${view === 'Month' ? 'bg-[#1B3A6B] text-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                {tx.month}
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {tx.sync}
            </button>
            <button className="px-5 py-2 bg-[#1B3A6B] text-white rounded-lg text-sm font-semibold hover:bg-[#112549] transition-colors shadow-sm">
              {tx.schedule}
            </button>
          </div>
        </div>

        {/* Pending Booking Alert */}
        <div className="bg-[#F8FAFC] border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#1B3A6B] text-white flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11v4m0 0l-2-2m2 2l2-2" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">{tx.pendingTitle}</h3>
              <p className="text-sm text-gray-600 mt-0.5">{tx.pendingDesc}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <button className="px-4 py-2 border border-gray-300 bg-white rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
              {tx.reschedule}
            </button>
            <button className="px-4 py-2 bg-[#1B3A6B] text-white rounded-lg text-sm font-semibold hover:bg-[#112549] transition-colors">
              {tx.accept}
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white border border-gray-200 rounded-xl flex-1 flex flex-col overflow-hidden shadow-sm">
          
          {/* Days Header */}
          <div className="flex border-b border-gray-200">
            <div className="w-20 flex-shrink-0 border-r border-gray-200 bg-[#F9FAFC]"></div>
            <div className="flex-1 grid grid-cols-7">
              {[
                { day: tx.mon, date: '12' },
                { day: tx.tue, date: '13' },
                { day: tx.wed, date: '14', active: true },
                { day: tx.thu, date: '15' },
                { day: tx.fri, date: '16' },
                { day: tx.sat, date: '17', weekend: true },
                { day: tx.sun, date: '18', weekend: true }
              ].map((d, i) => (
                <div key={i} className="py-4 flex flex-col items-center justify-center border-r border-gray-200 last:border-r-0">
                  <span className={`text-xs font-bold tracking-wider uppercase ${d.weekend ? 'text-gray-400' : (d.active ? 'text-[#1B3A6B]' : 'text-gray-500')}`}>{d.day}</span>
                  <span className={`text-xl font-black mt-1 ${d.weekend ? 'text-gray-400' : (d.active ? 'text-[#1B3A6B]' : 'text-gray-900')}`}>{d.date}</span>
                  {d.active && <div className="w-1.5 h-1.5 rounded-full bg-[#1B3A6B] mt-1"></div>}
                </div>
              ))}
            </div>
          </div>

          {/* Time Grid Wrapper */}
          <div className="flex-1 overflow-y-auto relative bg-[#F9FAFC]">
            
            {/* Background Grid Lines & Times */}
            {hours.map((hour, i) => (
              <div key={i} className="flex h-24 border-b border-gray-200 last:border-b-0 bg-white">
                <div className="w-20 flex-shrink-0 border-r border-gray-200 relative">
                  <span className="absolute -top-2.5 left-0 right-0 text-center text-xs font-bold text-gray-400">
                    {hour}
                  </span>
                </div>
                <div className="flex-1 grid grid-cols-7">
                  {[...Array(7)].map((_, j) => (
                    <div key={j} className="border-r border-gray-100 last:border-r-0"></div>
                  ))}
                </div>
              </div>
            ))}

            {/* Current Time Indicator (Red Line) - Approx 10:30 AM */}
            <div className="absolute left-0 right-0 z-20 flex items-center" style={{ top: 'calc(2 * 6rem + 3rem)' }}>
              <div className="w-20 flex justify-end pr-1">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
              </div>
              <div className="flex-1 border-t-2 border-red-400/70"></div>
            </div>

            {/* Calendar Events (Absolutely positioned over the grid) */}
            {/* 1 hour = 6rem (96px). Top offset = (Hour - 8) * 6rem */}
            
            <div className="absolute top-0 right-0 bottom-0 left-20 z-10 grid grid-cols-7">
              
              {/* Monday */}
              <div className="relative border-r border-transparent">
                {/* 08:15 - 09:15 */}
                <div className="absolute left-1.5 right-1.5 rounded-md p-2 border-l-4 border-[#3B82F6] bg-[#EFF6FF] shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                     style={{ top: 'calc(0.25 * 6rem)', height: '6rem' }}>
                  <p className="text-[10px] font-bold text-[#2563EB] mb-0.5">{tx.consultation}</p>
                  <p className="text-xs font-bold text-gray-900 leading-tight">Sarah Miller -<br/>Divorce Case</p>
                  <p className="text-[10px] font-medium text-gray-500 mt-1">08:15 - 09:15</p>
                </div>
              </div>

              {/* Tuesday */}
              <div className="relative border-r border-transparent">
                {/* 10:00 - 10:45 */}
                <div className="absolute left-1.5 right-1.5 rounded-md p-2 border-l-4 border-[#10B981] bg-[#ECFDF5] shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                     style={{ top: 'calc(2 * 6rem)', height: '4.5rem' }}>
                  <div className="flex items-center gap-1 mb-0.5">
                    <svg className="w-3 h-3 text-[#059669]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <p className="text-[10px] font-bold text-[#059669]">{tx.videoMeeting}</p>
                  </div>
                  <p className="text-xs font-bold text-gray-900 leading-tight truncate">Property Dispute Review</p>
                  <p className="text-[10px] font-medium text-[#059669] mt-0.5">10:00 - 10:45</p>
                </div>
              </div>

              {/* Wednesday */}
              <div className="relative border-r border-transparent">
                {/* 12:00 - 01:30 */}
                <div className="absolute left-1.5 right-1.5 rounded-md p-2 border-l-4 border-[#F97316] bg-[#FFF7ED] shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                     style={{ top: 'calc(4 * 6rem)', height: '9rem' }}>
                  <p className="text-[10px] font-bold text-[#EA580C] mb-0.5">{tx.caseReview}</p>
                  <p className="text-xs font-bold text-gray-900 leading-tight">State vs. Davidson File Audit</p>
                  <p className="text-[10px] font-medium text-[#EA580C] mt-2">12:00 - 01:30</p>
                </div>
              </div>

              {/* Thursday */}
              <div className="relative border-r border-transparent">
                {/* 09:00 - 10:00 */}
                <div className="absolute left-1.5 right-1.5 rounded-md p-2 border-l-4 border-[#3B82F6] bg-[#EFF6FF] shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                     style={{ top: 'calc(1 * 6rem)', height: '6rem' }}>
                  <p className="text-[10px] font-bold text-[#2563EB] mb-0.5">{tx.consultation}</p>
                  <p className="text-xs font-bold text-gray-900 leading-tight">James Wu -<br/>Corporate</p>
                  <p className="text-[10px] font-medium text-[#3B82F6] mt-1">09:00 - 10:00</p>
                </div>
              </div>

              {/* Friday */}
              <div className="relative border-r border-transparent"></div>
              {/* Saturday */}
              <div className="relative border-r border-transparent"></div>
              {/* Sunday */}
              <div className="relative"></div>

            </div>
          </div>
        </div>

        {/* Footer Legend */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-2">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-[#3B82F6]"></div>
              <span className="text-xs font-bold text-gray-600">{tx.consultation} (4)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-[#10B981]"></div>
              <span className="text-xs font-bold text-gray-600">{tx.videoMeeting} (2)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-[#F97316]"></div>
              <span className="text-xs font-bold text-gray-600">{tx.caseReview} (1)</span>
            </div>
          </div>
          <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mt-4 md:mt-0">
            {tx.workingHours}
          </p>
        </div>

      </div>
    </main>
  );
}
