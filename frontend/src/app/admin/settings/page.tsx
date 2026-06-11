"use client";

import React, { useState } from "react";
import {
  SlidersHorizontal,
  Shield,
  Bell,
  Puzzle,
  ChevronDown,
  Clock,
  Check,
  CreditCard,
  Bot,
  Video,
  Eye,
  Copy,
  ExternalLink,
  UploadCloud,
  CheckSquare,
  Square
} from "lucide-react";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("General");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  const scrollToSection = (id: string) => {
    setActiveTab(id);
    const element = document.getElementById(id.toLowerCase());
    if (element) {
      // Add a little offset for the sticky header if there is one
      const yOffset = -20; 
      const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // Custom Checkbox Component to match design
  const CustomCheckbox = ({ checked }: { checked: boolean }) => (
    <div className={`w-4 h-4 rounded flex items-center justify-center transition-colors ${checked ? "bg-[#1B3A6B] text-white" : "border border-slate-300 text-transparent"}`}>
      <Check size={12} strokeWidth={3} />
    </div>
  );

  return (
    <div className="space-y-6 font-[var(--font-inter)] text-slate-800 pb-20">
      
      {/* HEADER SECTION */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0f1d3d]">Admin Console Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage global configurations, security protocols, and system integrations.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* LEFT SIDEBAR NAVIGATION */}
        <div className="w-full lg:w-[240px] shrink-0 space-y-1 sticky top-8">
          <button 
            onClick={() => scrollToSection("General")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === "General" ? "bg-white text-[#1B3A6B] shadow-sm border border-slate-100" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"}`}
          >
            <SlidersHorizontal size={18} />
            General
          </button>
          <button 
            onClick={() => scrollToSection("Security")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === "Security" ? "bg-white text-[#1B3A6B] shadow-sm border border-slate-100" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"}`}
          >
            <Shield size={18} />
            Security
          </button>
          <button 
            onClick={() => scrollToSection("Notifications")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === "Notifications" ? "bg-white text-[#1B3A6B] shadow-sm border border-slate-100" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"}`}
          >
            <Bell size={18} />
            Notifications
          </button>
          <button 
            onClick={() => scrollToSection("Integrations")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === "Integrations" ? "bg-white text-[#1B3A6B] shadow-sm border border-slate-100" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"}`}
          >
            <Puzzle size={18} />
            Integrations
          </button>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 w-full space-y-6">
          
          {/* GENERAL SETTINGS CARD */}
          <div id="general" className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-[#1B3A6B]">General Settings</h2>
              <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-1">Platform Identity & Localization</p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Platform Name</label>
                  <input 
                    type="text" 
                    defaultValue="Midnight Gavel" 
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-800 focus:outline-none focus:border-[#1B3A6B] focus:ring-1 focus:ring-[#1B3A6B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Admin Contact Email</label>
                  <input 
                    type="email" 
                    defaultValue="admin@midnightgavel.law" 
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-800 focus:outline-none focus:border-[#1B3A6B] focus:ring-1 focus:ring-[#1B3A6B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">System Timezone</label>
                <div className="relative">
                  <select className="w-full appearance-none px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-800 focus:outline-none focus:border-[#1B3A6B] focus:ring-1 focus:ring-[#1B3A6B]">
                    <option>(GMT-08:00) Pacific Time (US & Canada)</option>
                    <option>(GMT-05:00) Eastern Time (US & Canada)</option>
                    <option>(GMT+00:00) Greenwich Mean Time</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Platform Logo</label>
                <div className="border border-dashed border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#1B3A6B] flex items-center justify-center text-white shrink-0 shadow-sm relative overflow-hidden">
                      {/* Logo abstract lines */}
                      <div className="absolute inset-0 flex flex-col justify-center items-center gap-[2px] rotate-45 scale-150">
                        <div className="w-full h-1 bg-white/20"></div>
                        <div className="w-full h-1 bg-white/40"></div>
                        <div className="w-full h-1 bg-white/60"></div>
                      </div>
                      <SlidersHorizontal size={20} className="relative z-10" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Update your platform branding</p>
                      <p className="text-xs text-slate-500 mt-0.5">Recommended size: 512x512px. SVG or PNG preferred.</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-white border border-slate-200 text-[#1B3A6B] text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors shadow-sm whitespace-nowrap">
                    Replace Logo
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* SECURITY PROTOCOLS CARD */}
          <div id="security" className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-[#1B3A6B]">Security Protocols</h2>
              <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-1">Access Control & Authorization</p>
            </div>

            <div className="space-y-6">
              {/* 2FA */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-bold text-slate-800">Two-Factor Authentication (2FA)</p>
                  <p className="text-xs text-slate-500 mt-0.5">Mandatory for all administrator accounts.</p>
                </div>
                {/* Custom Toggle */}
                <button 
                  onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${twoFactorEnabled ? 'bg-[#1B3A6B]' : 'bg-slate-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* Password Policy */}
              <div>
                <p className="text-sm font-bold text-slate-800 mb-3">Password Policy</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative border border-slate-200 rounded-lg px-4 py-2 bg-white">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Min. Length</label>
                    <input 
                      type="text" 
                      defaultValue="12" 
                      className="w-full text-base font-bold text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div className="relative border border-slate-200 rounded-lg px-4 py-2 bg-white">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Expiry (Days)</label>
                    <input 
                      type="text" 
                      defaultValue="90" 
                      className="w-full text-base font-bold text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Session Timeout */}
              <div>
                <p className="text-sm font-bold text-slate-800 mb-3">Automatic Session Timeout</p>
                <div className="relative">
                  <select className="w-full appearance-none px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-800 focus:outline-none focus:border-[#1B3A6B] focus:ring-1 focus:ring-[#1B3A6B]">
                    <option>After 15 minutes of inactivity</option>
                    <option>After 30 minutes of inactivity</option>
                    <option>After 1 hour of inactivity</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-10 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 border-l border-slate-200 pl-3">
                    <Clock size={16} />
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* NOTIFICATIONS CARD */}
          <div id="notifications" className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-[#1B3A6B]">Notifications</h2>
              <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-1">System Alerts & Preference Center</p>
            </div>

            <div className="w-full">
              {/* Header Row */}
              <div className="grid grid-cols-[1fr_auto_auto] gap-6 mb-4 text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                <div>Event Trigger</div>
                <div className="w-12 text-center">Email</div>
                <div className="w-12 text-center">Push</div>
              </div>

              <div className="space-y-4">
                {/* Row 1 */}
                <div className="grid grid-cols-[1fr_auto_auto] gap-6 items-center py-2">
                  <div>
                    <p className="text-xs font-bold text-slate-800">New Lawyer Verification Request</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">When a lawyer submits credentials for review.</p>
                  </div>
                  <div className="w-12 flex justify-center cursor-pointer"><CustomCheckbox checked={true} /></div>
                  <div className="w-12 flex justify-center cursor-pointer"><CustomCheckbox checked={true} /></div>
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-[1fr_auto_auto] gap-6 items-center py-2">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Critical System Alerts</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Database latency or service downtime events.</p>
                  </div>
                  <div className="w-12 flex justify-center cursor-pointer"><CustomCheckbox checked={true} /></div>
                  <div className="w-12 flex justify-center cursor-pointer"><CustomCheckbox checked={true} /></div>
                </div>

                {/* Row 3 */}
                <div className="grid grid-cols-[1fr_auto_auto] gap-6 items-center py-2">
                  <div>
                    <p className="text-xs font-bold text-slate-800">User Report Flagged</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">When a chat or profile is reported for misconduct.</p>
                  </div>
                  <div className="w-12 flex justify-center cursor-pointer"><CustomCheckbox checked={true} /></div>
                  <div className="w-12 flex justify-center cursor-pointer"><CustomCheckbox checked={false} /></div>
                </div>
              </div>
            </div>
          </div>

          {/* INTEGRATIONS CARD */}
          <div id="integrations" className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-[#1B3A6B]">Integrations & API</h2>
              <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-1">Third-Party Connectivity</p>
            </div>

            <div className="space-y-4">
              {/* Stripe */}
              <div className="border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                  <CreditCard size={18} />
                </div>
                <div className="flex-1 w-full">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-slate-800">Stripe (Payments)</p>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-bold rounded-full uppercase tracking-widest">Connected</span>
                  </div>
                  <div className="relative">
                    <input 
                      type="text" 
                      disabled 
                      value="sk_live_51MxX9L7..." 
                      className="w-full text-xs font-mono text-slate-500 bg-slate-50 border border-slate-200 rounded-md py-1.5 pl-3 pr-8"
                    />
                    <Copy size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer hover:text-slate-600" />
                  </div>
                </div>
              </div>

              {/* OpenAI */}
              <div className="border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                  <Bot size={18} />
                </div>
                <div className="flex-1 w-full">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-slate-800">OpenAI/Gemini (AI Intake)</p>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[9px] font-bold rounded-full uppercase tracking-widest">Active</span>
                  </div>
                  <div className="relative">
                    <input 
                      type="text" 
                      disabled 
                      value="sk-ai-engine-..." 
                      className="w-full text-xs font-mono text-slate-500 bg-slate-50 border border-slate-200 rounded-md py-1.5 pl-3 pr-8"
                    />
                    <Eye size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer hover:text-slate-600" />
                  </div>
                </div>
              </div>

              {/* Zoom */}
              <div className="border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
                  <Video size={18} />
                </div>
                <div className="flex-1 w-full">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-slate-800">Zoom / WebRTC (Consultations)</p>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[9px] font-bold rounded-full uppercase tracking-widest">Configure</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-[#1B3A6B] cursor-pointer hover:underline">
                    Manage API Credentials
                    <ExternalLink size={10} />
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <button className="text-sm font-bold text-slate-600 hover:text-slate-800 transition-colors">
              Cancel Changes
            </button>
            <button className="px-6 py-2.5 bg-[#1B3A6B] text-white text-sm font-bold rounded-lg hover:bg-[#152e55] transition-colors shadow-sm">
              Save System Configurations
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
