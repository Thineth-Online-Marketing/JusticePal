"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import {
  ChevronLeft,
  ChevronRight,
  Video,
  Clock,
  User,
  CalendarDays,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from "lucide-react";

interface Appointment {
  id: string;
  scheduledAt: string;
  status: string;
  caseDescription: string | null;
  lawyer?: {
    user?: { displayName?: string; email?: string } | null;
    specialization?: string[];
  } | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode; dot: string }> = {
  scheduled: {
    label: "Scheduled",
    color: "bg-blue-50 text-blue-700 border border-blue-200",
    icon: <Clock className="w-3.5 h-3.5" />,
    dot: "bg-blue-500",
  },
  confirmed: {
    label: "Confirmed",
    color: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    dot: "bg-emerald-500",
  },
  completed: {
    label: "Completed",
    color: "bg-gray-50 text-gray-600 border border-gray-200",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    dot: "bg-gray-400",
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-50 text-red-600 border border-red-200",
    icon: <XCircle className="w-3.5 h-3.5" />,
    dot: "bg-red-400",
  },
  pending: {
    label: "Pending",
    color: "bg-amber-50 text-amber-700 border border-amber-200",
    icon: <AlertCircle className="w-3.5 h-3.5" />,
    dot: "bg-amber-400",
  },
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function ClientCalendarPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewDate, setViewDate] = useState(new Date());

  const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  const fetchAppointments = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const token = await user.getIdToken();
      const res = await fetch(`${BACKEND}/api/appointments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
      }
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
    } finally {
      setLoading(false);
    }
  }, [user, BACKEND]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // ── Calendar helpers ──────────────────────────────────────────────
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarCells: (Date | null)[] = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];
  // Pad to complete last row
  while (calendarCells.length % 7 !== 0) calendarCells.push(null);

  const getAppointmentsForDate = (date: Date) =>
    appointments.filter((a) => {
      const d = new Date(a.scheduledAt);
      return (
        d.getFullYear() === date.getFullYear() &&
        d.getMonth() === date.getMonth() &&
        d.getDate() === date.getDate()
      );
    });

  const selectedAppts = selectedDate ? getAppointmentsForDate(selectedDate) : [];

  const upcomingAppts = appointments
    .filter((a) => {
      const d = new Date(a.scheduledAt);
      const now = new Date();
      return (a.status === "scheduled" || a.status === "confirmed") && d >= now;
    })
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .slice(0, 5);

  const getLawyerName = (appt: Appointment) =>
    appt.lawyer?.user?.displayName || appt.lawyer?.user?.email || "Your Lawyer";

  const isToday = (date: Date) => {
    const t = new Date();
    return (
      date.getFullYear() === t.getFullYear() &&
      date.getMonth() === t.getMonth() &&
      date.getDate() === t.getDate()
    );
  };

  const isSelected = (date: Date) =>
    selectedDate !== null &&
    date.getFullYear() === selectedDate.getFullYear() &&
    date.getMonth() === selectedDate.getMonth() &&
    date.getDate() === selectedDate.getDate();

  // ── UI ────────────────────────────────────────────────────────────
  return (
    <main className="min-h-full bg-[#F8FAFC] p-6 md:p-8">
      <div className="max-w-[1200px] mx-auto space-y-6">

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-[#111827] tracking-tight">My Calendar</h1>
            <p className="text-sm text-gray-500 mt-1">View and manage your consultations</p>
          </div>
          <button
            onClick={() => router.push("/client-dashboard")}
            className="flex items-center gap-2 text-sm font-semibold text-[#1B3A6B] hover:text-[#112549] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left: Calendar ─────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              
              {/* Month Nav */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-[#1B3A6B]">
                <button
                  onClick={() => setViewDate(new Date(year, month - 1, 1))}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <h2 className="text-base font-bold text-white">
                  {MONTH_NAMES[month]} {year}
                </h2>
                <button
                  onClick={() => setViewDate(new Date(year, month + 1, 1))}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Day Labels */}
              <div className="grid grid-cols-7 border-b border-gray-100">
                {DAY_NAMES.map((d) => (
                  <div
                    key={d}
                    className="py-2 text-center text-[11px] font-bold text-gray-400 uppercase tracking-wider"
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7">
                {calendarCells.map((date, idx) => {
                  if (!date) {
                    return <div key={`empty-${idx}`} className="h-16 border-r border-b border-gray-100 bg-gray-50/50" />;
                  }
                  const dayAppts = getAppointmentsForDate(date);
                  const hasActive = dayAppts.some(
                    (a) => a.status === "scheduled" || a.status === "confirmed"
                  );
                  const today = isToday(date);
                  const selected = isSelected(date);
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => setSelectedDate(selected ? null : date)}
                      className={`h-16 border-r border-b border-gray-100 flex flex-col items-center pt-2 gap-1 transition-all relative ${
                        selected
                          ? "bg-[#1B3A6B]"
                          : today
                          ? "bg-blue-50"
                          : isWeekend
                          ? "bg-gray-50/50 hover:bg-gray-100/60"
                          : "hover:bg-blue-50/40"
                      }`}
                    >
                      <span
                        className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${
                          selected
                            ? "text-white"
                            : today
                            ? "text-[#1B3A6B] bg-blue-100"
                            : isWeekend
                            ? "text-gray-400"
                            : "text-gray-700"
                        }`}
                      >
                        {date.getDate()}
                      </span>
                      {/* Appointment dots */}
                      {dayAppts.length > 0 && (
                        <div className="flex gap-0.5 flex-wrap justify-center max-w-[40px]">
                          {dayAppts.slice(0, 3).map((a, i) => {
                            const cfg = STATUS_CONFIG[a.status] || STATUS_CONFIG.pending;
                            return (
                              <div
                                key={i}
                                className={`w-1.5 h-1.5 rounded-full ${selected ? "bg-white/80" : cfg.dot}`}
                              />
                            );
                          })}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Day Appointments */}
            {selectedDate && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-gray-900">
                    {selectedDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </h3>
                  <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                    {selectedAppts.length} appointment{selectedAppts.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {selectedAppts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <CalendarDays className="w-8 h-8 text-gray-300 mb-2" />
                    <p className="text-sm text-gray-400 font-medium">No appointments on this day</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedAppts.map((appt) => {
                      const cfg = STATUS_CONFIG[appt.status] || STATUS_CONFIG.pending;
                      const canJoin = appt.status === "scheduled" || appt.status === "confirmed";
                      return (
                        <div
                          key={appt.id}
                          className="flex items-center gap-4 p-4 rounded-xl bg-[#F9FAFC] border border-gray-100"
                        >
                          {/* Time */}
                          <div className="text-right flex-shrink-0 w-16">
                            <p className="font-bold text-gray-900 text-sm">
                              {new Date(appt.scheduledAt).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              })}
                            </p>
                            <p className="text-[10px] text-gray-400 font-medium mt-0.5">60 min</p>
                          </div>
                          {/* Divider */}
                          <div className="w-0.5 h-10 bg-[#1B3A6B] rounded-full flex-shrink-0" />
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 text-sm truncate">
                              {appt.caseDescription || "Consultation"}
                            </p>
                            <p className="text-xs text-gray-500 font-medium mt-0.5 flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {getLawyerName(appt)}
                            </p>
                          </div>
                          {/* Status + Action */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${cfg.color}`}>
                              {cfg.icon}
                              {cfg.label}
                            </span>
                            {canJoin && (
                              <button
                                onClick={() =>
                                  router.push(`/consultation?role=client&appointmentId=${appt.id}`)
                                }
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1B3A6B] text-white text-xs font-bold rounded-lg hover:bg-[#112549] transition-colors shadow-sm"
                              >
                                <Video className="w-3.5 h-3.5" />
                                Join
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Right: Upcoming Appointments ──────────────────────── */}
          <div className="space-y-6">

            {/* Legend */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-sm font-bold text-gray-700 mb-3">Status Legend</h3>
              <div className="space-y-2">
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                  <div key={key} className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
                    <span className="text-xs font-medium text-gray-600">{cfg.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-sm font-bold text-gray-700 mb-4">Upcoming Consultations</h3>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : upcomingAppts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CalendarDays className="w-8 h-8 text-gray-200 mb-2" />
                  <p className="text-sm text-gray-400 font-medium">No upcoming appointments</p>
                  <button
                    onClick={() => router.push("/find-lawyer")}
                    className="mt-3 text-xs font-bold text-[#1B3A6B] hover:underline"
                  >
                    Find a Lawyer →
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingAppts.map((appt) => {
                    const cfg = STATUS_CONFIG[appt.status] || STATUS_CONFIG.pending;
                    const apptDate = new Date(appt.scheduledAt);
                    const isUpcoming = appt.status === "scheduled" || appt.status === "confirmed";
                    return (
                      <div
                        key={appt.id}
                        className="p-3 rounded-xl bg-[#F9FAFC] border border-gray-100 cursor-pointer hover:border-[#1B3A6B]/20 hover:bg-blue-50/30 transition-all"
                        onClick={() => {
                          setViewDate(apptDate);
                          setSelectedDate(apptDate);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-gray-900 truncate">
                              {appt.caseDescription || "Consultation"}
                            </p>
                            <p className="text-[10px] text-gray-500 font-medium mt-0.5">
                              {getLawyerName(appt)}
                            </p>
                            <p className="text-[10px] font-bold text-[#1B3A6B] mt-1">
                              {apptDate.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}{" "}
                              ·{" "}
                              {apptDate.toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              })}
                            </p>
                          </div>
                          <span className={`flex-shrink-0 flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${cfg.color}`}>
                            {cfg.icon}
                            {cfg.label}
                          </span>
                        </div>
                        {isUpcoming && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/consultation?role=client&appointmentId=${appt.id}`);
                            }}
                            className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 bg-[#1B3A6B] text-white text-[10px] font-bold rounded-lg hover:bg-[#112549] transition-colors"
                          >
                            <Video className="w-3 h-3" />
                            Join Video Call
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
