"use client";

import React, { useState } from 'react';
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { updateProfile } from "firebase/auth";

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
    cancel: "Cancel",
    barAssocId: "Bar Association ID",
    yearsExp: "Years of Experience",
    currentPass: "Current Password",
    newPass: "New Password",
    confirmPass: "Confirm Password",
    emailAlerts: "Email Alerts",
    smsNotif: "SMS Notifications",
    appReminders: "Appointment Reminders",
    syncSuccess: "Settings updated successfully."
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
    cancel: "අවලංගු කරන්න",
    barAssocId: "නීතිඥ සංගමයේ හැඳුනුම්පත",
    yearsExp: "පළපුරුද්ද (වසර)",
    currentPass: "වත්මන් මුරපදය",
    newPass: "නව මුරපදය",
    confirmPass: "මුරපදය තහවුරු කරන්න",
    emailAlerts: "විද්‍යුත් තැපැල් ඇඟවීම්",
    smsNotif: "SMS නිවේදන",
    appReminders: "හමුවීම් මතක් කිරීම්",
    syncSuccess: "සැකසුම් සාර්ථකව යාවත්කාලීන කරන ලදි."
  }
};

const initialPersonal = {
  fullName: 'Counselor Perera',
  email: 'perera@justicepal.com',
  phone: '+94 77 123 4567',
  location: 'Colombo 03',
};

const initialProfessional = {
  specializations: 'Criminal Defense, Corporate Law',
  license: 'BAR-LK-2024-9981',
  barAssocId: 'BASL-5521',
  experience: '8',
};

const initialSecurity = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

const initialNotifications = {
  emailAlerts: true,
  smsNotifications: false,
  appointmentReminders: true,
};

const Toggle = ({ checked, onChange }: { checked: boolean, onChange: (val: boolean) => void }) => (
  <button 
    type="button"
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:ring-offset-2 ${checked ? 'bg-[#1B3A6B]' : 'bg-gray-200'}`}
  >
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
  </button>
);

export default function SettingsPage() {
  const { lang } = useLanguage();
  const tx = content[lang as keyof typeof content] || content.en;
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'personal' | 'professional' | 'security' | 'notifications'>('personal');

  const [personal, setPersonal] = useState(initialPersonal);
  const [professional, setProfessional] = useState(initialProfessional);
  const [security, setSecurity] = useState(initialSecurity);
  const [notifications, setNotifications] = useState(initialNotifications);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const handleSave = async () => {
    setFeedback(null);
    try {
      if (activeTab === 'personal') {
        if (user) {
          await updateProfile(user, { displayName: personal.fullName });
        }
        setFeedback({ type: 'success', msg: tx.syncSuccess });
      } else if (activeTab === 'professional') {
        setFeedback({ type: 'success', msg: tx.syncSuccess });
      } else if (activeTab === 'security') {
        if (security.newPassword !== security.confirmPassword) {
          setFeedback({ type: 'error', msg: 'Passwords do not match.' });
          return;
        }
        setFeedback({ type: 'success', msg: tx.syncSuccess });
      } else if (activeTab === 'notifications') {
        setFeedback({ type: 'success', msg: tx.syncSuccess });
      }
      
      setTimeout(() => setFeedback(null), 3000);
    } catch (error) {
      setFeedback({ type: 'error', msg: 'Failed to update settings. Please try again.' });
    }
  };

  const handleCancel = () => {
    setFeedback(null);
    if (activeTab === 'personal') setPersonal(initialPersonal);
    if (activeTab === 'professional') setProfessional(initialProfessional);
    if (activeTab === 'security') setSecurity(initialSecurity);
    if (activeTab === 'notifications') setNotifications(initialNotifications);
  };

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
                onClick={() => { setActiveTab('personal'); setFeedback(null); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${activeTab === 'personal' ? 'bg-[#EBF1F9] text-[#1B3A6B]' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                {tx.personalInfo}
              </button>
              <button 
                onClick={() => { setActiveTab('professional'); setFeedback(null); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${activeTab === 'professional' ? 'bg-[#EBF1F9] text-[#1B3A6B]' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                {tx.professionalInfo}
              </button>
              <button 
                onClick={() => { setActiveTab('security'); setFeedback(null); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${activeTab === 'security' ? 'bg-[#EBF1F9] text-[#1B3A6B]' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                {tx.security}
              </button>
              <button 
                onClick={() => { setActiveTab('notifications'); setFeedback(null); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${activeTab === 'notifications' ? 'bg-[#EBF1F9] text-[#1B3A6B]' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                {tx.notifications}
              </button>
            </nav>
          </div>

          {/* Settings Content Area */}
          <div className="flex-1 p-6 md:p-8">
            
            {/* Feedback Message */}
            {feedback && (
              <div className={`mb-6 p-4 rounded-lg text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${feedback.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {feedback.type === 'success' ? (
                  <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                ) : (
                  <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                )}
                {feedback.msg}
              </div>
            )}

            {activeTab === 'personal' && (
              <div className="space-y-6 max-w-2xl animate-in fade-in duration-300">
                <h2 className="text-lg font-bold text-gray-900">{tx.personalInfo}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">{tx.fullName}</label>
                    <input 
                      type="text" 
                      value={personal.fullName}
                      onChange={(e) => setPersonal({...personal, fullName: e.target.value})}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1B3A6B] focus:ring-1 focus:ring-[#1B3A6B]" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">{tx.emailAddress}</label>
                    <input 
                      type="email" 
                      value={personal.email}
                      onChange={(e) => setPersonal({...personal, email: e.target.value})}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1B3A6B] focus:ring-1 focus:ring-[#1B3A6B]" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">{tx.phoneNumber}</label>
                    <input 
                      type="tel" 
                      value={personal.phone}
                      onChange={(e) => setPersonal({...personal, phone: e.target.value})}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1B3A6B] focus:ring-1 focus:ring-[#1B3A6B]" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">{tx.location}</label>
                    <input 
                      type="text" 
                      value={personal.location}
                      onChange={(e) => setPersonal({...personal, location: e.target.value})}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1B3A6B] focus:ring-1 focus:ring-[#1B3A6B]" 
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'professional' && (
              <div className="space-y-6 max-w-2xl animate-in fade-in duration-300">
                <h2 className="text-lg font-bold text-gray-900">{tx.professionalInfo}</h2>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">{tx.barAssocId}</label>
                      <input 
                        type="text" 
                        value={professional.barAssocId}
                        onChange={(e) => setProfessional({...professional, barAssocId: e.target.value})}
                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1B3A6B] focus:ring-1 focus:ring-[#1B3A6B]" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">{tx.yearsExp}</label>
                      <input 
                        type="number" 
                        value={professional.experience}
                        onChange={(e) => setProfessional({...professional, experience: e.target.value})}
                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1B3A6B] focus:ring-1 focus:ring-[#1B3A6B]" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">{tx.specializations}</label>
                    <input 
                      type="text" 
                      value={professional.specializations}
                      onChange={(e) => setProfessional({...professional, specializations: e.target.value})}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1B3A6B] focus:ring-1 focus:ring-[#1B3A6B]" 
                    />
                    <p className="text-xs text-gray-500">Separate multiple specializations with commas.</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">{tx.licenseNumber}</label>
                    <input 
                      type="text" 
                      value={professional.license}
                      className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-500 cursor-not-allowed" 
                      readOnly 
                    />
                    <p className="text-xs text-gray-500">Contact administration to change your verified license number.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6 max-w-2xl animate-in fade-in duration-300">
                <h2 className="text-lg font-bold text-gray-900">{tx.security}</h2>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">{tx.currentPass}</label>
                    <input 
                      type="password" 
                      value={security.currentPassword}
                      onChange={(e) => setSecurity({...security, currentPassword: e.target.value})}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1B3A6B] focus:ring-1 focus:ring-[#1B3A6B]" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">{tx.newPass}</label>
                    <input 
                      type="password" 
                      value={security.newPassword}
                      onChange={(e) => setSecurity({...security, newPassword: e.target.value})}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1B3A6B] focus:ring-1 focus:ring-[#1B3A6B]" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">{tx.confirmPass}</label>
                    <input 
                      type="password" 
                      value={security.confirmPassword}
                      onChange={(e) => setSecurity({...security, confirmPassword: e.target.value})}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1B3A6B] focus:ring-1 focus:ring-[#1B3A6B]" 
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6 max-w-2xl animate-in fade-in duration-300">
                <h2 className="text-lg font-bold text-gray-900">{tx.notifications}</h2>
                <div className="space-y-6 bg-white border border-gray-100 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{tx.emailAlerts}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Receive case updates and alerts via email.</p>
                    </div>
                    <Toggle 
                      checked={notifications.emailAlerts} 
                      onChange={(val) => setNotifications({...notifications, emailAlerts: val})} 
                    />
                  </div>
                  <div className="h-px bg-gray-100"></div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{tx.smsNotif}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Get immediate text alerts for urgent matters.</p>
                    </div>
                    <Toggle 
                      checked={notifications.smsNotifications} 
                      onChange={(val) => setNotifications({...notifications, smsNotifications: val})} 
                    />
                  </div>
                  <div className="h-px bg-gray-100"></div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{tx.appReminders}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Receive reminders 24h before meetings.</p>
                    </div>
                    <Toggle 
                      checked={notifications.appointmentReminders} 
                      onChange={(val) => setNotifications({...notifications, appointmentReminders: val})} 
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="mt-10 flex items-center gap-4 pt-6 border-t border-gray-100">
              <button 
                onClick={handleSave}
                className="px-6 py-2.5 bg-[#1B3A6B] text-white rounded-lg text-sm font-bold hover:bg-[#112549] transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1B3A6B]"
              >
                {tx.saveChanges}
              </button>
              <button 
                onClick={handleCancel}
                className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
              >
                {tx.cancel}
              </button>
            </div>

          </div>
        </div>

      </div>
    </main>
  );
}
