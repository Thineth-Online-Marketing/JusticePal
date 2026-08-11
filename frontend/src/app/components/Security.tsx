"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Smartphone,
  Monitor,
  Laptop,
  Tablet,
  LogOut,
  AlertTriangle,
  Check,
  X,
  Loader2,
  ChevronRight,
  Clock,
  MapPin,
} from "lucide-react";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";

const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

// ─── Helper: get/set the session id from localStorage ─────────────
function getSessionId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("jp_session_id");
}
function setSessionId(id: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("jp_session_id", id);
  }
}

// ─── Helper: build auth + session headers ─────────────────────────
async function authHeaders(user: any): Promise<HeadersInit> {
  const token = await user.getIdToken();
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
  const sid = getSessionId();
  if (sid) headers["x-session-id"] = sid;
  return headers;
}

// ─── Types ────────────────────────────────────────────────────────
interface SessionInfo {
  id: string;
  deviceName: string;
  location: string;
  lastActiveAt: string;
  createdAt: string;
  isCurrent: boolean;
}

export default function Security() {
  const { user } = useAuth();

  return (
    <>
      <main className="max-w-[1400px] w-full mx-auto px-4 md:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-[#1B3A6B] tracking-tight">
            Security
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
            Keep your account safe.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            <ChangePasswordCard user={user} />
            <TwoFactorCard user={user} />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <ActiveSessionsCard user={user} />
          </div>
        </div>
      </main>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   1. CHANGE PASSWORD CARD
   ═══════════════════════════════════════════════════════════════════ */
function ChangePasswordCard({ user }: { user: any }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!currentPassword)
      errs.currentPassword = "Current password is required";
    if (!newPassword) errs.newPassword = "New password is required";
    else if (newPassword.length < 8)
      errs.newPassword = "Must be at least 8 characters";
    if (!confirmPassword)
      errs.confirmPassword = "Please confirm your new password";
    else if (newPassword !== confirmPassword)
      errs.confirmPassword = "Passwords do not match";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !user) return;
    setSaving(true);
    setToast(null);

    try {
      // Step 1: Re-authenticate with Firebase using currentPassword
      const credential = EmailAuthProvider.credential(
        user.email!,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      // Step 2: Call backend to update password via Admin SDK
      const headers = await authHeaders(user);
      const res = await fetch(`${API_BASE}/api/account/password`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update password");
      }

      setToast({ type: "success", message: "Password updated successfully!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setErrors({});
    } catch (err: any) {
      let message = err.message || "Something went wrong";
      if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        message = "Current password is incorrect";
      }
      setToast({ type: "error", message });
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 5000);
    }
  };

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Card Header */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
          <Lock className="w-5 h-5 text-[#1B3A6B]" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Change Password</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Update your password regularly to keep your account secure
          </p>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6 space-y-5">
        {/* Toast */}
        {toast && (
          <div
            className={`flex items-center gap-2 p-3.5 rounded-xl text-sm font-semibold ${
              toast.type === "success"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {toast.type === "success" ? (
              <Check className="w-4 h-4 shrink-0" />
            ) : (
              <X className="w-4 h-4 shrink-0" />
            )}
            {toast.message}
          </div>
        )}

        {/* Current Password */}
        <PasswordField
          id="currentPassword"
          label="Current Password"
          value={currentPassword}
          onChange={setCurrentPassword}
          show={showCurrent}
          onToggle={() => setShowCurrent(!showCurrent)}
          error={errors.currentPassword}
          placeholder="Enter your current password"
        />

        {/* New Password */}
        <PasswordField
          id="newPassword"
          label="New Password"
          value={newPassword}
          onChange={setNewPassword}
          show={showNew}
          onToggle={() => setShowNew(!showNew)}
          error={errors.newPassword}
          placeholder="At least 8 characters"
        />

        {/* Confirm New Password */}
        <PasswordField
          id="confirmPassword"
          label="Confirm New Password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          show={showConfirm}
          onToggle={() => setShowConfirm(!showConfirm)}
          error={errors.confirmPassword}
          placeholder="Re-enter your new password"
        />

        {/* Password Strength Hints */}
        <div className="space-y-1.5">
          <StrengthRule
            met={newPassword.length >= 8}
            label="At least 8 characters"
          />
          <StrengthRule
            met={/[A-Z]/.test(newPassword)}
            label="One uppercase letter"
          />
          <StrengthRule
            met={/[0-9]/.test(newPassword)}
            label="One number"
          />
          <StrengthRule
            met={/[^A-Za-z0-9]/.test(newPassword)}
            label="One special character"
          />
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1B3A6B] hover:bg-[#112549] text-white text-sm font-bold rounded-xl shadow-sm transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Lock className="w-4 h-4" />
            )}
            {saving ? "Updating…" : "Update Password"}
          </button>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   2. TWO-FACTOR AUTHENTICATION CARD
   ═══════════════════════════════════════════════════════════════════ */
function TwoFactorCard({ user }: { user: any }) {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  // Fetch initial 2FA status
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const headers = await authHeaders(user);
        const res = await fetch(`${API_BASE}/api/account/2fa`, { headers });
        if (res.ok) {
          const data = await res.json();
          setEnabled(data.twoFactorEnabled);
        }
      } catch {
        // Silently fail — default to false
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const handleToggle = async () => {
    if (!user || toggling) return;
    setToggling(true);
    const newState = !enabled;

    try {
      const headers = await authHeaders(user);
      const res = await fetch(`${API_BASE}/api/account/2fa`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ enabled: newState }),
      });

      if (res.ok) {
        setEnabled(newState);
      }
    } catch {
      // Revert on error
    } finally {
      setToggling(false);
    }
  };

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Two-Factor Authentication
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Add an extra layer of security to your account
          </p>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                enabled
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">
                {enabled ? "2FA is enabled" : "2FA is disabled"}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {enabled
                  ? "Your account is protected with two-factor authentication"
                  : "Enable 2FA for stronger account protection"}
              </p>
            </div>
          </div>

          {/* Toggle */}
          <button
            onClick={handleToggle}
            disabled={loading || toggling}
            className="relative shrink-0"
            aria-label="Toggle two-factor authentication"
          >
            <div
              className={`w-12 h-7 rounded-full transition-colors ${
                enabled ? "bg-[#1B3A6B]" : "bg-gray-200"
              } ${loading || toggling ? "opacity-50" : ""}`}
            />
            <div
              className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-sm transition-transform ${
                enabled ? "translate-x-5" : ""
              }`}
            />
          </button>
        </div>

        {enabled && (
          <div className="mt-4 bg-emerald-50/60 border border-emerald-100 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <p className="text-xs text-emerald-700 leading-relaxed">
                Two-factor authentication adds an extra verification step when
                you sign in. You&#39;ll need to enter a code from your
                authenticator app or phone in addition to your password.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   3. ACTIVE SESSIONS CARD
   ═══════════════════════════════════════════════════════════════════ */
function ActiveSessionsCard({ user }: { user: any }) {
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingAll, setDeletingAll] = useState(false);

  const fetchSessions = useCallback(async () => {
    if (!user) return;
    try {
      const headers = await authHeaders(user);
      const res = await fetch(`${API_BASE}/api/account/sessions`, { headers });

      // Capture session ID from response header if set
      const newSid = res.headers.get("x-session-id");
      if (newSid) setSessionId(newSid);

      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch {
      // fail silently
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleDeleteSession = async (sessionId: string) => {
    if (!user) return;
    setDeletingId(sessionId);
    try {
      const headers = await authHeaders(user);
      await fetch(`${API_BASE}/api/account/sessions/${sessionId}`, {
        method: "DELETE",
        headers,
      });
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch {
      // fail silently
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteAll = async () => {
    if (!user) return;
    setDeletingAll(true);
    try {
      const headers = await authHeaders(user);
      await fetch(`${API_BASE}/api/account/sessions`, {
        method: "DELETE",
        headers,
      });
      // Only keep current session
      setSessions((prev) => prev.filter((s) => s.isCurrent));
    } catch {
      // fail silently
    } finally {
      setDeletingAll(false);
    }
  };

  const getDeviceIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("iphone") || n.includes("android"))
      return <Smartphone className="w-5 h-5" />;
    if (n.includes("ipad") || n.includes("tablet"))
      return <Tablet className="w-5 h-5" />;
    if (n.includes("mac") || n.includes("laptop"))
      return <Laptop className="w-5 h-5" />;
    return <Monitor className="w-5 h-5" />;
  };

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
        <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
          <Monitor className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Active Sessions</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Devices currently logged into your account
          </p>
        </div>
      </div>

      <div className="p-4">
        {loading ? (
          /* Loading Skeleton */
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 rounded-xl border border-gray-50 animate-pulse"
              >
                <div className="w-10 h-10 rounded-lg bg-gray-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-2/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
                <div className="w-16 h-8 bg-gray-100 rounded-lg" />
              </div>
            ))}
          </div>
        ) : sessions.length === 0 ? (
          /* Empty State */
          <div className="text-center py-10">
            <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
              <Monitor className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-sm font-bold text-gray-500">
              No active sessions
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Session data will appear as you use JusticePal
            </p>
          </div>
        ) : (
          /* Sessions List */
          <div className="space-y-2">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-colors group ${
                  session.isCurrent
                    ? "bg-blue-50/50 border-blue-100"
                    : "border-gray-50 hover:border-gray-200 hover:bg-gray-50/50"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    session.isCurrent
                      ? "bg-[#1B3A6B] text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {getDeviceIcon(session.deviceName)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {session.deviceName}
                    </p>
                    {session.isCurrent && (
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-[#1B3A6B] text-white rounded-full">
                        This device
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <MapPin className="w-3 h-3" />
                      {session.location}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      {timeAgo(session.lastActiveAt)}
                    </span>
                  </div>
                </div>

                {!session.isCurrent && (
                  <button
                    onClick={() => handleDeleteSession(session.id)}
                    disabled={deletingId === session.id}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {deletingId === session.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <LogOut className="w-3.5 h-3.5" />
                    )}
                    Log out
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Log out all */}
        {sessions.length > 1 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <button
              onClick={handleDeleteAll}
              disabled={deletingAll}
              className="w-full flex items-center justify-between px-4 py-3 bg-white border border-red-200 text-red-600 rounded-xl font-bold text-sm hover:bg-red-50 hover:border-red-300 transition-all group disabled:opacity-50"
            >
              <span className="flex items-center gap-2">
                {deletingAll ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <AlertTriangle className="w-4 h-4" />
                )}
                {deletingAll
                  ? "Logging out…"
                  : "Log out of all other devices"}
              </span>
              <ChevronRight className="w-4 h-4 text-red-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SUB-COMPONENTS & HELPERS
   ═══════════════════════════════════════════════════════════════════ */

function PasswordField({
  id,
  label,
  value,
  onChange,
  show,
  onToggle,
  error,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
  error?: string;
  placeholder: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-gray-700 mb-1.5"
      >
        {label}
      </label>
      <div className="relative">
        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full pl-10 pr-12 py-3 rounded-xl border text-sm text-gray-900 font-medium placeholder-gray-400 bg-gray-50 focus:outline-none focus:ring-2 transition-all ${
            error
              ? "border-red-300 focus:ring-red-200 focus:border-red-400"
              : "border-gray-200 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B]"
          }`}
        />
        <button
          type="button"
          onClick={onToggle}
          tabIndex={-1}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          {show ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>
      </div>
      {error && (
        <p className="mt-1.5 text-xs font-semibold text-red-500 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}

function StrengthRule({ met, label }: { met: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
          met ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-300"
        }`}
      >
        <Check className="w-2.5 h-2.5" />
      </div>
      <span
        className={`text-xs font-medium transition-colors ${
          met ? "text-emerald-600" : "text-gray-400"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
