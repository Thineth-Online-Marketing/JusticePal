"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  Save,
  Globe,
  Bell,
  MessageSquare,
  CalendarCheck,
  AlertTriangle,
  X,
  Check,
  Shield,
  ChevronRight,
  Loader2,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

async function authHeaders(user: any): Promise<HeadersInit> {
  const token = await user.getIdToken();
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export default function AccountSettings() {
  const { user, logout } = useAuth();
  const { lang, toggle } = useLanguage();
  const router = useRouter();

  // Loading state for initial fetch
  const [initialLoading, setInitialLoading] = useState(true);

  // Profile fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Notification preferences
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [appointmentReminders, setAppointmentReminders] = useState(true);

  // Deactivation modal
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivating, setDeactivating] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchSettings = async () => {
      try {
        const headers = await authHeaders(user);
        const res = await fetch(`${API_BASE}/api/account/settings`, { headers });
        if (res.ok) {
          const data = await res.json();
          setFullName(data.name || user.displayName || "");
          setEmail(data.email || user.email || "");
          setPhone(data.phone || user.phoneNumber || "");
          
          if (data.emailNotif !== undefined) setEmailNotif(data.emailNotif);
          if (data.smsNotif !== undefined) setSmsNotif(data.smsNotif);
          if (data.appointmentReminders !== undefined) setAppointmentReminders(data.appointmentReminders);
        }
      } catch (err) {
        console.error("Failed to fetch settings", err);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchSettings();
  }, [user]);

  const updatePreference = async (key: string, value: any) => {
    if (!user) return;
    try {
      const headers = await authHeaders(user);
      await fetch(`${API_BASE}/api/account/preferences`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ [key]: value }),
      });
    } catch (err) {
      console.error("Failed to update preference", err);
    }
  };

  const handleLanguageToggle = (targetLang: "en" | "si") => {
    if (lang !== targetLang) {
      toggle();
      updatePreference("preferredLanguage", targetLang === "en" ? "English" : "Sinhala");
    }
  };

  const handleEmailNotifChange = (val: boolean) => {
    setEmailNotif(val);
    updatePreference("emailNotif", val);
  };

  const handleSmsNotifChange = (val: boolean) => {
    setSmsNotif(val);
    updatePreference("smsNotif", val);
  };

  const handleAppointmentRemindersChange = (val: boolean) => {
    setAppointmentReminders(val);
    updatePreference("appointmentReminders", val);
  };

  const handleProfileSave = async () => {
    if (!user) return;
    setProfileSaving(true);
    setProfileSaved(false);
    
    try {
      const headers = await authHeaders(user);
      const res = await fetch(`${API_BASE}/api/account/profile`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ name: fullName, phone }),
      });
      
      if (res.ok) {
        setProfileSaved(true);
        setTimeout(() => setProfileSaved(false), 3000);
      }
    } catch (err) {
      console.error("Failed to save profile", err);
    } finally {
      setProfileSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (!user) return;
    setDeactivating(true);
    try {
      const headers = await authHeaders(user);
      const res = await fetch(`${API_BASE}/api/account/deactivate`, {
        method: "POST",
        headers,
      });

      if (res.ok) {
        setShowDeactivateModal(false);
        await logout();
        router.push("/");
      } else {
        const errData = await res.json();
        alert(errData.message || "Failed to deactivate account.");
      }
    } catch (err) {
      console.error("Failed to deactivate", err);
      alert("Failed to deactivate account. Please try again.");
    } finally {
      setDeactivating(false);
    }
  };

  if (initialLoading) {
    return (
      <main className="max-w-[1400px] w-full mx-auto px-4 md:px-8 py-8 flex justify-center items-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1B3A6B]" />
      </main>
    );
  }

  return (
    <>
      <main className="max-w-[1400px] w-full mx-auto px-4 md:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-[#1B3A6B] tracking-tight">
            Account Settings
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
            Manage your profile and preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column — Profile + Preferences */}
          <div className="lg:col-span-2 space-y-8">
            {/* ─── Profile Information Card ─── */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <User className="w-5 h-5 text-[#1B3A6B]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Profile Information
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Update your personal details
                  </p>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {/* Full Name */}
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-semibold text-gray-700 mb-1.5"
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B] transition-all"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-700 mb-1.5"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      disabled
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-sm text-gray-500 font-medium placeholder-gray-400 focus:outline-none cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">Email cannot be changed directly.</p>
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-semibold text-gray-700 mb-1.5"
                  >
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+94 7X XXX XXXX"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B] transition-all"
                    />
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleProfileSave}
                    disabled={profileSaving}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#1B3A6B] hover:bg-[#112549] text-white text-sm font-bold rounded-xl shadow-sm transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {profileSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {profileSaving ? "Saving…" : "Save Changes"}
                  </button>

                  {profileSaved && (
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 animate-in fade-in slide-in-from-left-2">
                      <Check className="w-4 h-4" />
                      Changes saved
                    </span>
                  )}
                </div>
              </div>
            </section>

            {/* ─── Preferences Card ─── */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Preferences
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Language &amp; notification settings
                  </p>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Language Toggle */}
                <div>
                  <h3 className="text-sm font-bold text-gray-800 mb-3">
                    Language
                  </h3>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleLanguageToggle("en")}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                        lang === "en"
                          ? "bg-[#1B3A6B] text-white border-[#1B3A6B] shadow-sm"
                          : "bg-white text-gray-600 border-gray-200 hover:border-[#1B3A6B] hover:text-[#1B3A6B]"
                      }`}
                    >
                      <span className="text-base leading-none">🇬🇧</span>
                      English
                    </button>
                    <button
                      onClick={() => handleLanguageToggle("si")}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                        lang === "si"
                          ? "bg-[#1B3A6B] text-white border-[#1B3A6B] shadow-sm"
                          : "bg-white text-gray-600 border-gray-200 hover:border-[#1B3A6B] hover:text-[#1B3A6B]"
                      }`}
                    >
                      <span className="text-base leading-none">🇱🇰</span>
                      සිංහල
                    </button>
                  </div>
                </div>

                <div className="h-px bg-gray-100" />

                {/* Notification Preferences */}
                <div>
                  <h3 className="text-sm font-bold text-gray-800 mb-4">
                    Notifications
                  </h3>
                  <div className="space-y-3">
                    <NotificationCheckbox
                      id="emailNotif"
                      icon={<Mail className="w-4 h-4 text-blue-500" />}
                      label="Email notifications"
                      description="Receive updates and alerts via email"
                      checked={emailNotif}
                      onChange={handleEmailNotifChange}
                    />
                    <NotificationCheckbox
                      id="smsNotif"
                      icon={
                        <MessageSquare className="w-4 h-4 text-green-500" />
                      }
                      label="SMS notifications"
                      description="Get text messages for important updates"
                      checked={smsNotif}
                      onChange={handleSmsNotifChange}
                    />
                    <NotificationCheckbox
                      id="appointmentReminders"
                      icon={
                        <CalendarCheck className="w-4 h-4 text-purple-500" />
                      }
                      label="Appointment reminders"
                      description="Reminders before scheduled consultations"
                      checked={appointmentReminders}
                      onChange={handleAppointmentRemindersChange}
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column — Account Actions + Info */}
          <div className="space-y-8">
            {/* ─── Account Actions Card ─── */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Account Actions
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Manage your account status
                  </p>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-red-50/60 border border-red-100 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-red-800">
                        Danger Zone
                      </p>
                      <p className="text-xs text-red-600/80 mt-1 leading-relaxed">
                        Deactivating your account will disable your profile and
                        remove you from active consultations. This action can be
                        reversed by contacting support.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowDeactivateModal(true)}
                  className="w-full flex items-center justify-between px-5 py-3.5 bg-white border border-red-200 text-red-600 rounded-xl font-bold text-sm hover:bg-red-50 hover:border-red-300 transition-all group"
                >
                  <span className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Deactivate Account
                  </span>
                  <ChevronRight className="w-4 h-4 text-red-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </section>

            {/* ─── Account Info Sidebar ─── */}
            <section className="bg-[#1B3A6B] rounded-2xl shadow-lg p-8 text-center text-white relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
              <div className="w-16 h-16 mx-auto bg-white/10 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm border border-white/10">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-white" />
                )}
              </div>
              <h3 className="text-xl font-bold mb-1 relative z-10">
                {user?.displayName || "User"}
              </h3>
              <p className="text-blue-200 text-sm mb-4 relative z-10">
                {user?.email || "No email"}
              </p>
              <div className="flex items-center justify-center gap-2 relative z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full text-xs font-semibold text-blue-100 border border-white/10">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Active Account
                </span>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* ─── Deactivation Confirmation Modal ─── */}
      {showDeactivateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => {
              if (!deactivating) setShowDeactivateModal(false);
            }}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  Deactivate Account
                </h3>
              </div>
              <button
                onClick={() => {
                  if (!deactivating) setShowDeactivateModal(false);
                }}
                disabled={deactivating}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              <p className="text-sm text-gray-600 leading-relaxed">
                Are you sure you want to deactivate your account? You will lose
                access to:
              </p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  Your active cases and consultations
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  Scheduled appointments
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  AI chat and document drafting history
                </li>
              </ul>
              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3">
                <p className="text-xs text-amber-700 font-medium leading-relaxed">
                  You can reactivate your account by contacting our support team
                  within 30 days.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
              <button
                onClick={() => setShowDeactivateModal(false)}
                disabled={deactivating}
                className="flex-1 px-5 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeactivate}
                disabled={deactivating}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition-colors shadow-sm active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {deactivating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : null}
                {deactivating ? "Deactivating..." : "Yes, Deactivate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── Notification Checkbox Sub-component ─── */
function NotificationCheckbox({
  id,
  icon,
  label,
  description,
  checked,
  onChange,
}: {
  id: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className="flex items-center gap-4 p-3.5 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 transition-all cursor-pointer group"
    >
      <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-800">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      </div>
      <div className="relative shrink-0">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-200 peer-checked:bg-[#1B3A6B] rounded-full transition-colors" />
        <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm peer-checked:translate-x-5 transition-transform" />
      </div>
    </label>
  );
}
