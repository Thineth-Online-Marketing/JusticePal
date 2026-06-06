"use client";

import React, { useState } from 'react';
import { useLanguage } from "../../context/LanguageContext";

const content = {
  en: {
    settingsTitle: "Account Settings",
    settingsDesc: "Manage your profile, preferences, and security settings.",
    personalInfo: "Personal Information",
    professionalInfo: "Professional Details",
    security: "Security",
    notifications: "Notifications",
    fullName: "Full Name",
    emailAddress: "Email Address",
    phoneNumber: "Phone Number",
    location: "Office Location",
    specializations: "Specializations",
    licenseNumber: "License Number",
    saveChanges: "Save Changes",
    cancel: "Cancel"
  },
  si: {
    settingsTitle: "ගිණුම් සැකසුම්",
    settingsDesc: "ඔබගේ පැතිකඩ, මනාප සහ ආරක්ෂක සැකසුම් කළමනාකරණය කරන්න.",
    personalInfo: "පුද්ගලික තොරතුරු",
    professionalInfo: "වෘත්තීය තොරතුරු",
    security: "ආරක්ෂාව",
    notifications: "නිවේදන",
    fullName: "සම්පූර්ණ නම",
    emailAddress: "විද්‍යුත් තැපෑල",
    phoneNumber: "දුරකථන අංකය",
    location: "කාර්යාල ස්ථානය",
    specializations: "විශේෂඥතා",
    licenseNumber: "බලපත්‍ර අංකය",
    saveChanges: "වෙනස්කම් සුරකින්න",
    cancel: "අවලංගු කරන්න"
  }
};

export default function SettingsPage() {
  const { lang } = useLanguage();
  const tx = content[lang as keyof typeof content] || content.en;
  
  const [activeTab, setActiveTab] = useState<'personal' | 'professional' | 'security' | 'notifications'>('personal');

  return (
    <main className="flex-1 overflow-y-auto p-8 relative h-full bg-[#F5F7FA]">
      <div className="max-w-4xl mx-auto flex flex-col h-full space-y-6">
        
        {/* Header Section */}
        <div>
          <h1 className="text-2xl font-black text-[#111827] tracking-tight">{tx.settingsTitle}</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">{tx.settingsDesc}</p>
        </div>

        {/* Settings Container */}
        <div className="bg-white border border-gray-200 rounded-xl flex-1 flex flex-col md:flex-row overflow-hidden shadow-sm">
          
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-gray-100 bg-gray-50/50 p-4">
            <nav className="space-y-1">
              <button 
                onClick={() => setActiveTab('personal')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${activeTab === 'personal' ? 'bg-[#EBF1F9] text-[#1B3A6B]' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                {tx.personalInfo}
              </button>
              <button 
                onClick={() => setActiveTab('professional')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${activeTab === 'professional' ? 'bg-[#EBF1F9] text-[#1B3A6B]' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                {tx.professionalInfo}
              </button>
              <button 
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${activeTab === 'security' ? 'bg-[#EBF1F9] text-[#1B3A6B]' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                {tx.security}
              </button>
              <button 
                onClick={() => setActiveTab('notifications')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${activeTab === 'notifications' ? 'bg-[#EBF1F9] text-[#1B3A6B]' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                {tx.notifications}
              </button>
            </nav>
          </div>

          {/* Settings Content Area */}
          <div className="flex-1 p-6 md:p-8">
            
            {activeTab === 'personal' && (
              <div className="space-y-6 max-w-2xl">
                <h2 className="text-lg font-bold text-gray-900">{tx.personalInfo}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">{tx.fullName}</label>
                    <input type="text" defaultValue="Counselor Perera" className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1B3A6B] focus:ring-1 focus:ring-[#1B3A6B]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">{tx.emailAddress}</label>
                    <input type="email" defaultValue="perera@justicepal.com" className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1B3A6B] focus:ring-1 focus:ring-[#1B3A6B]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">{tx.phoneNumber}</label>
                    <input type="tel" defaultValue="+94 77 123 4567" className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1B3A6B] focus:ring-1 focus:ring-[#1B3A6B]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">{tx.location}</label>
                    <input type="text" defaultValue="Colombo 03" className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1B3A6B] focus:ring-1 focus:ring-[#1B3A6B]" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'professional' && (
              <div className="space-y-6 max-w-2xl">
                <h2 className="text-lg font-bold text-gray-900">{tx.professionalInfo}</h2>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">{tx.specializations}</label>
                    <input type="text" defaultValue="Criminal Defense, Corporate Law" className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1B3A6B] focus:ring-1 focus:ring-[#1B3A6B]" />
                    <p className="text-xs text-gray-500">Separate multiple specializations with commas.</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">{tx.licenseNumber}</label>
                    <input type="text" defaultValue="BAR-LK-2024-9981" className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-500 cursor-not-allowed" readOnly />
                    <p className="text-xs text-gray-500">Contact administration to change your verified license number.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Placeholder for Security and Notifications */}
            {(activeTab === 'security' || activeTab === 'notifications') && (
              <div className="space-y-6 max-w-2xl">
                <h2 className="text-lg font-bold text-gray-900">
                  {activeTab === 'security' ? tx.security : tx.notifications}
                </h2>
                <div className="p-8 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-center">
                  <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  <p className="text-sm font-bold text-gray-500">This settings module is currently under development.</p>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="mt-10 flex items-center gap-4 pt-6 border-t border-gray-100">
              <button className="px-6 py-2.5 bg-[#1B3A6B] text-white rounded-lg text-sm font-bold hover:bg-[#112549] transition-colors shadow-sm">
                {tx.saveChanges}
              </button>
              <button className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm">
                {tx.cancel}
              </button>
            </div>

          </div>
        </div>

      </div>
    </main>
  );
}
