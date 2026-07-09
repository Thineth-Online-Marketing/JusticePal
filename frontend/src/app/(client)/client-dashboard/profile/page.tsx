"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import {
    User,
    Mail,
    Phone,
    MapPin,
    Globe,
    Calendar,
    Shield,
    CheckCircle,
    Save,
    Loader2,
    AlertCircle,
    X,
} from "lucide-react";

interface ProfileData {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    location: string | null;
    preferredLanguage: string | null;
    role: string;
    createdAt: string;
}

// Skeleton loader component
function SkeletonBlock({ className }: { className?: string }) {
    return (
        <div className={`animate-pulse bg-gray-200 rounded-lg ${className || ""}`} />
    );
}

function ProfileSkeleton() {
    return (
        <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
            {/* Header Card Skeleton */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
                <div className="flex flex-col items-center gap-4">
                    <SkeletonBlock className="w-24 h-24 !rounded-full" />
                    <SkeletonBlock className="w-48 h-6" />
                    <SkeletonBlock className="w-36 h-4" />
                    <SkeletonBlock className="w-32 h-4" />
                </div>
            </div>
            {/* Personal Info Skeleton */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
                <SkeletonBlock className="w-48 h-6 mb-6" />
                <div className="space-y-5">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i}>
                            <SkeletonBlock className="w-24 h-4 mb-2" />
                            <SkeletonBlock className="w-full h-11" />
                        </div>
                    ))}
                </div>
            </div>
            {/* Account Info Skeleton */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
                <SkeletonBlock className="w-48 h-6 mb-6" />
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex justify-between">
                            <SkeletonBlock className="w-28 h-4" />
                            <SkeletonBlock className="w-24 h-4" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Toast component
function Toast({
    message,
    type,
    onClose,
}: {
    message: string;
    type: "success" | "error";
    onClose: () => void;
}) {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div
            className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg border backdrop-blur-sm transition-all duration-300 animate-[slideInRight_0.3s_ease-out] ${type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
                }`}
        >
            {type === "success" ? (
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
            ) : (
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            )}
            <span className="text-sm font-medium">{message}</span>
            <button
                onClick={onClose}
                className="ml-2 p-0.5 rounded-full hover:bg-black/5 transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}

export default function ClientProfilePage() {
    const { user, loading: authLoading } = useAuth();
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [toast, setToast] = useState<{
        message: string;
        type: "success" | "error";
    } | null>(null);

    // Form state
    const [formName, setFormName] = useState("");
    const [formPhone, setFormPhone] = useState("");
    const [formLocation, setFormLocation] = useState("");
    const [formLanguage, setFormLanguage] = useState("English");

    // Validation state
    const [nameError, setNameError] = useState("");

    // Fetch profile
    useEffect(() => {
        if (authLoading || !user) return;

        const fetchProfile = async () => {
            try {
                const idToken = await user.getIdToken();
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/users/profile`,
                    { headers: { Authorization: `Bearer ${idToken}` } }
                );

                if (!res.ok) {
                    throw new Error("Failed to fetch profile");
                }

                const userData = await res.json();

                // Map the response to our ProfileData shape
                const data: ProfileData = {
                    id: userData.id,
                    name: userData.name || "",
                    email: userData.email || "",
                    phone: userData.phone || null,
                    location: userData.location || null,
                    preferredLanguage: userData.preferredLanguage || "English",
                    role: userData.role || "client",
                    createdAt: userData.createdAt,
                };

                setProfile(data);
                setFormName(data.name || "");
                setFormPhone(data.phone || "");
                setFormLocation(data.location || "");
                setFormLanguage(data.preferredLanguage || "English");
            } catch (err: any) {
                console.error("Profile fetch error:", err);
                setError(err.message || "Failed to load profile");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user, authLoading]);

    // Save profile
    const handleSave = async () => {
        // Validate
        setNameError("");

        if (!formName.trim()) {
            setNameError("Full name is required");
            return;
        }

        if (!user || !profile) return;

        setSaving(true);
        try {
            const idToken = await user.getIdToken();
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/profile/${profile.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${idToken}`,
                    },
                    body: JSON.stringify({
                        name: formName.trim(),
                        phone: formPhone.trim(),
                        location: formLocation.trim(),
                        preferredLanguage: formLanguage,
                    }),
                }
            );

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || "Failed to update profile");
            }

            const data = await res.json();
            setProfile(data.user);
            setToast({ message: "Profile updated successfully!", type: "success" });
        } catch (err: any) {
            console.error("Profile save error:", err);
            setToast({
                message: err.message || "Failed to update profile",
                type: "error",
            });
        } finally {
            setSaving(false);
        }
    };

    // Get initials from name
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n.charAt(0))
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    // Format date
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    if (authLoading || loading) {
        return <ProfileSkeleton />;
    }

    if (error) {
        return (
            <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-12">
                <div className="bg-white rounded-2xl border border-red-200 p-8 text-center">
                    <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">
                        Failed to load profile
                    </h2>
                    <p className="text-sm text-gray-500 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-5 py-2.5 bg-[#1e3a8a] text-white text-sm font-medium rounded-xl hover:bg-[#1e3a8a]/90 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!profile) return null;

    return (
        <>
            {/* Toast */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5 sm:space-y-6">
                {/* Page Title */}
                <div className="mb-1">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                        My Profile
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        View and manage your personal information
                    </p>
                </div>

                {/* ─── Profile Header Card ─── */}
                <div className="bg-white rounded-2xl border border-[#e5e7eb] shadow-sm overflow-hidden">
                    {/* Decorative top gradient bar */}
                    <div className="h-24 sm:h-28 bg-gradient-to-r from-[#1e3a8a] via-[#2563eb] to-[#3b82f6] relative">
                        <div className="absolute inset-0 opacity-20">
                            <div className="absolute top-4 left-8 w-16 h-16 rounded-full bg-white/10" />
                            <div className="absolute bottom-2 right-12 w-10 h-10 rounded-full bg-white/10" />
                            <div className="absolute top-6 right-1/3 w-6 h-6 rounded-full bg-white/10" />
                        </div>
                    </div>

                    <div className="flex flex-col items-center -mt-12 sm:-mt-14 pb-6 sm:pb-8 px-4 sm:px-6 relative z-10">
                        {/* Avatar */}
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#1e3a8a] flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-lg border-4 border-white ring-4 ring-[#1e3a8a]/10 transition-transform duration-200 hover:scale-105">
                            {getInitials(profile.name)}
                        </div>

                        {/* Name */}
                        <h2 className="mt-4 text-lg sm:text-xl font-bold text-gray-900 text-center">
                            {profile.name}
                        </h2>

                        {/* Email */}
                        <div className="flex items-center gap-1.5 mt-1.5 text-sm text-gray-500">
                            <Mail className="w-3.5 h-3.5" />
                            <span>{profile.email}</span>
                        </div>

                        {/* Location */}
                        {profile.location && (
                            <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-400">
                                <MapPin className="w-3.5 h-3.5" />
                                <span>{profile.location}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* ─── Personal Information Card ─── */}
                <div className="bg-white rounded-2xl border border-[#e5e7eb] shadow-sm p-5 sm:p-8">
                    <div className="flex items-center gap-2.5 mb-6">
                        <div className="w-9 h-9 rounded-xl bg-[#1e3a8a]/10 flex items-center justify-center">
                            <User className="w-4.5 h-4.5 text-[#1e3a8a]" />
                        </div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                            Personal Information
                        </h3>
                    </div>

                    <div className="space-y-5">
                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Full Name <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={formName}
                                    onChange={(e) => {
                                        setFormName(e.target.value);
                                        if (nameError) setNameError("");
                                    }}
                                    className={`w-full pl-10 pr-4 py-2.5 sm:py-3 text-sm rounded-xl border bg-white transition-all duration-200 outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] ${nameError
                                        ? "border-red-300 focus:ring-red-200 focus:border-red-400"
                                        : "border-[#e5e7eb] hover:border-gray-300"
                                        }`}
                                    placeholder="Enter your full name"
                                />
                            </div>
                            {nameError && (
                                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {nameError}
                                </p>
                            )}
                        </div>

                        {/* Email (readonly) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                <input
                                    type="email"
                                    value={profile.email}
                                    readOnly
                                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 text-sm rounded-xl border border-[#e5e7eb] bg-gray-50 text-gray-500 cursor-not-allowed outline-none"
                                />
                                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full uppercase tracking-wide">
                                    Read only
                                </span>
                            </div>
                        </div>

                        {/* Phone Number */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Phone Number
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="tel"
                                    value={formPhone}
                                    onChange={(e) => setFormPhone(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 text-sm rounded-xl border border-[#e5e7eb] bg-white hover:border-gray-300 transition-all duration-200 outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a]"
                                    placeholder="e.g. +94 77 123 4567"
                                />
                            </div>
                        </div>

                        {/* Location */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Location
                            </label>
                            <div className="relative">
                                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={formLocation}
                                    onChange={(e) => setFormLocation(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 text-sm rounded-xl border border-[#e5e7eb] bg-white hover:border-gray-300 transition-all duration-200 outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a]"
                                    placeholder="e.g. Colombo, Sri Lanka"
                                />
                            </div>
                        </div>

                        {/* Preferred Language */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Preferred Language
                            </label>
                            <div className="relative">
                                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <select
                                    value={formLanguage}
                                    onChange={(e) => setFormLanguage(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 text-sm rounded-xl border border-[#e5e7eb] bg-white hover:border-gray-300 transition-all duration-200 outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] appearance-none cursor-pointer"
                                >
                                    <option value="English">English</option>
                                    <option value="Sinhala">Sinhala</option>
                                    <option value="Both">Both</option>
                                </select>
                                {/* Dropdown arrow */}
                                <svg
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── Account Information Card ─── */}
                <div className="bg-white rounded-2xl border border-[#e5e7eb] shadow-sm p-5 sm:p-8">
                    <div className="flex items-center gap-2.5 mb-6">
                        <div className="w-9 h-9 rounded-xl bg-[#1e3a8a]/10 flex items-center justify-center">
                            <Shield className="w-4.5 h-4.5 text-[#1e3a8a]" />
                        </div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                            Account Information
                        </h3>
                    </div>

                    <div className="space-y-0 divide-y divide-gray-100">
                        {/* Member Since */}
                        <div className="flex items-center justify-between py-3.5 first:pt-0">
                            <div className="flex items-center gap-2.5">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-600">Member Since</span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                                {formatDate(profile.createdAt)}
                            </span>
                        </div>

                        {/* Account Type */}
                        <div className="flex items-center justify-between py-3.5">
                            <div className="flex items-center gap-2.5">
                                <User className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-600">Account Type</span>
                            </div>
                            <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                Client
                            </span>
                        </div>

                        {/* Account Status */}
                        <div className="flex items-center justify-between py-3.5 last:pb-0">
                            <div className="flex items-center gap-2.5">
                                <CheckCircle className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-600">Account Status</span>
                            </div>
                            <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                                Active
                            </span>
                        </div>
                    </div>
                </div>

                {/* ─── Save Button ─── */}
                <div className="flex justify-end pb-8">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="inline-flex items-center gap-2.5 px-6 sm:px-8 py-3 sm:py-3.5 bg-[#1e3a8a] text-white text-sm font-semibold rounded-xl shadow-sm hover:bg-[#1e3a8a]/90 hover:shadow-md active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-sm w-full sm:w-auto justify-center"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                <span>Save Changes</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Toast slide-in animation */}
            <style jsx global>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
        </>
    );
}
