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
  Sparkles,
  X,
  Scale,
  Calendar,
  RefreshCw,
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

const STATUS_CONFIG: Record<
  string,
  { label: string; bgClass: string; textClass: string; borderClass: string; dot: string; icon: React.ReactNode }
> = {
  scheduled: {
    label: "Scheduled",
    bgClass: "bg-blue-50", textClass: "text-blue-700", borderClass: "border-blue-200", dot: "bg-blue-500",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  confirmed: {
    label: "Confirmed",
    bgClass: "bg-emerald-50", textClass: "text-emerald-700", borderClass: "border-emerald-200", dot: "bg-emerald-500",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  completed: {
    label: "Completed",
    bgClass: "bg-gray-50", textClass: "text-gray-600", borderClass: "border-gray-200", dot: "bg-gray-400",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  cancelled: {
    label: "Cancelled",
    bgClass: "bg-red-50", textClass: "text-red-600", borderClass: "border-red-200", dot: "bg-red-400",
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
  pending: {
    label: "Pending",
    bgClass: "bg-amber-50", textClass: "text-amber-700", borderClass: "border-amber-200", dot: "bg-amber-400",
    icon: <AlertCircle className="w-3.5 h-3.5" />,
  },
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

export default function ClientCalendarPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewDate, setViewDate] = useState(new Date());
  const [animating, setAnimating] = useState(false);
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("right");

  // Feedback toast
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  // Cancel confirm modal
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // Reschedule modal
  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(null);
  const [rescheduleDateTime, setRescheduleDateTime] = useState('');
  const [rescheduling, setRescheduling] = useState(false);

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

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const navigateMonth = (direction: "prev" | "next") => {
    setSlideDirection(direction === "next" ? "left" : "right");
    setAnimating(true);
    setTimeout(() => {
      setViewDate((prev) => {
        const d = new Date(prev);
        d.setMonth(d.getMonth() + (direction === "next" ? 1 : -1));
        return d;
      });
      setAnimating(false);
    }, 180);
  };

  // ── Cancel appointment ──────────────────────────────────────────
  const handleCancel = async () => {
    if (!cancelTarget || !user) return;
    try {
      setCancelling(true);
      const token = await user.getIdToken();
      const res = await fetch(`${BACKEND}/api/appointments/${cancelTarget.id}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      if (!res.ok) throw new Error('Cancel failed');
      setAppointments(prev => prev.map(a => a.id === cancelTarget.id ? { ...a, status: 'cancelled' } : a));
      showToast('success', 'Appointment cancelled successfully.');
      setCancelTarget(null);
    } catch {
      showToast('error', 'Failed to cancel. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  // ── Reschedule appointment ──────────────────────────────────────
  const handleReschedule = async () => {
    if (!rescheduleTarget || !rescheduleDateTime || !user) return;
    try {
      setRescheduling(true);
      const token = await user.getIdToken();
      const res = await fetch(`${BACKEND}/api/appointments/${rescheduleTarget.id}/reschedule`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduledAt: new Date(rescheduleDateTime).toISOString() }),
      });
      if (!res.ok) throw new Error('Reschedule failed');
      setAppointments(prev => prev.map(a =>
        a.id === rescheduleTarget.id
          ? { ...a, scheduledAt: new Date(rescheduleDateTime).toISOString(), status: 'scheduled' }
          : a
      ));
      showToast('success', 'Appointment rescheduled! Your lawyer has been notified.');
      setRescheduleTarget(null);
      setRescheduleDateTime('');
    } catch {
      showToast('error', 'Failed to reschedule. Please try again.');
    } finally {
      setRescheduling(false);
    }
  };

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarCells: (Date | null)[] = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];
  while (calendarCells.length % 7 !== 0) calendarCells.push(null);

  const getAppointmentsForDate = (date: Date) =>
    appointments.filter((a) => {
      const d = new Date(a.scheduledAt);
      return d.getFullYear() === date.getFullYear() && d.getMonth() === date.getMonth() && d.getDate() === date.getDate();
    });

  const selectedAppts = selectedDate ? getAppointmentsForDate(selectedDate) : [];

  const upcomingAppts = appointments
    .filter((a) => {
      const d = new Date(a.scheduledAt);
      return (a.status === "scheduled" || a.status === "confirmed") && d >= new Date();
    })
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .slice(0, 6);

  const getLawyerName = (appt: Appointment) =>
    appt.lawyer?.user?.displayName || appt.lawyer?.user?.email || "Your Lawyer";

  const isToday = (date: Date) => {
    const t = new Date();
    return date.getFullYear() === t.getFullYear() && date.getMonth() === t.getMonth() && date.getDate() === t.getDate();
  };

  const isSelected = (date: Date) =>
    selectedDate !== null &&
    date.getFullYear() === selectedDate.getFullYear() &&
    date.getMonth() === selectedDate.getMonth() &&
    date.getDate() === selectedDate.getDate();

  const totalUpcoming = upcomingAppts.length;
  const totalConfirmed = appointments.filter(a => a.status === "confirmed").length;
  const totalCompleted = appointments.filter(a => a.status === "completed").length;

  // Min datetime for reschedule picker (now + 1 hour)
  const minRescheduleDateTime = new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16);

  return (
    <div className="min-h-full bg-[#F0F4F8]">

      {/* ── Toast ─────────────────────────────────────────────────── */}
      {toast && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-[9999] px-5 py-3 rounded-xl shadow-xl text-sm font-bold flex items-center gap-3 transition-all ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.type === 'success'
            ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            : <AlertCircle className="w-4 h-4 flex-shrink-0" />
          }
          {toast.msg}
        </div>
      )}

      {/* ── Hero Header ───────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-[#1B3A6B] via-[#1e4580] to-[#112549] px-6 md:px-10 pt-8 pb-20">
        <div className="max-w-[1300px] mx-auto">
          <button
            onClick={() => router.push("/client-dashboard")}
            className="flex items-center gap-1.5 text-sm font-semibold text-white/70 hover:text-white transition-colors mb-6 group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Dashboard
          </button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <CalendarDays className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">My Calendar</h1>
              </div>
              <p className="text-white/60 text-sm font-medium ml-[52px]">
                {MONTH_NAMES[new Date().getMonth()]} {new Date().getFullYear()} · {totalUpcoming} upcoming sessions
              </p>
            </div>

            <div className="flex gap-3 flex-wrap items-center">
              {[
                { label: "Upcoming", value: totalUpcoming, color: "bg-blue-500/20 text-blue-200 border-blue-400/20" },
                { label: "Confirmed", value: totalConfirmed, color: "bg-emerald-500/20 text-emerald-200 border-emerald-400/20" },
                { label: "Completed", value: totalCompleted, color: "bg-white/10 text-white/70 border-white/10" },
              ].map((s) => (
                <div key={s.label} className={`px-4 py-2 rounded-xl border text-sm font-bold ${s.color}`}>
                  <span className="text-xl font-black mr-1.5">{s.value}</span>
                  {s.label}
                </div>
              ))}

              <button
                onClick={() => router.push("/find-lawyer")}
                className="px-5 py-2.5 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-xl text-sm font-bold shadow-md transition-all flex items-center gap-2 hover:scale-[1.02]"
              >
                + Book New Session
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ──────────────────────────────────────────── */}
      <div className="max-w-[1300px] mx-auto px-4 md:px-6 -mt-12 pb-12">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">

          {/* ── Calendar Card ──────────────────────────────────────── */}
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/80 overflow-hidden">

            {/* Month navigator */}
            <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100">
              <button
                onClick={() => navigateMonth("prev")}
                className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:border-[#1B3A6B]/30 transition-all group"
              >
                <ChevronLeft className="w-4 h-4 text-gray-500 group-hover:text-[#1B3A6B]" />
              </button>

              <div className="text-center">
                <h2 className="text-xl font-black text-gray-900">{MONTH_NAMES[month]}</h2>
                <p className="text-xs font-bold text-gray-400 mt-0.5">{year}</p>
              </div>

              <button
                onClick={() => navigateMonth("next")}
                className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:border-[#1B3A6B]/30 transition-all group"
              >
                <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-[#1B3A6B]" />
              </button>
            </div>

            {/* Day name row */}
            <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50">
              {DAY_NAMES.map((d, i) => (
                <div
                  key={d}
                  className={`py-3 text-center text-[11px] font-black uppercase tracking-widest ${i === 0 || i === 6 ? "text-gray-300" : "text-gray-400"}`}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Grid */}
            <div
              className="grid grid-cols-7"
              style={{
                opacity: animating ? 0 : 1,
                transform: animating ? `translateX(${slideDirection === "left" ? "-12px" : "12px"})` : "translateX(0)",
                transition: "opacity 0.18s ease, transform 0.18s ease",
              }}
            >
              {calendarCells.map((date, idx) => {
                if (!date) {
                  return <div key={`empty-${idx}`} className="h-24 md:h-28 border-r border-b border-gray-100 bg-gray-50/30" />;
                }

                const dayAppts = getAppointmentsForDate(date);
                const todayDate = isToday(date);
                const selected = isSelected(date);
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                const hasJoinable = dayAppts.some((a) => a.status === "scheduled" || a.status === "confirmed");

                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => setSelectedDate(selected ? null : date)}
                    className={`h-24 md:h-28 border-r border-b border-gray-100 flex flex-col items-start p-2 gap-1 transition-all duration-150 relative group text-left ${
                      selected ? "bg-[#1B3A6B] shadow-inner" :
                      todayDate ? "bg-blue-50/70 hover:bg-blue-100/50" :
                      isWeekend ? "bg-gray-50/40 hover:bg-gray-100/60" :
                      "hover:bg-blue-50/30"
                    }`}
                  >
                    <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-black transition-all ${
                      selected ? "bg-white text-[#1B3A6B] shadow-sm" :
                      todayDate ? "bg-[#1B3A6B] text-white shadow-md shadow-blue-900/30" :
                      isWeekend ? "text-gray-300" :
                      "text-gray-700 group-hover:bg-blue-100/60"
                    }`}>
                      {date.getDate()}
                    </span>

                    <div className="w-full space-y-0.5 overflow-hidden">
                      {dayAppts.slice(0, 2).map((a, i) => {
                        const cfg = STATUS_CONFIG[a.status] || STATUS_CONFIG.pending;
                        return (
                          <div key={i} className={`w-full px-1.5 py-0.5 rounded text-[9px] font-bold truncate ${selected ? "bg-white/20 text-white" : `${cfg.bgClass} ${cfg.textClass}`}`}>
                            {a.caseDescription || "Consultation"}
                          </div>
                        );
                      })}
                      {dayAppts.length > 2 && (
                        <div className={`text-[9px] font-bold px-1.5 ${selected ? "text-white/60" : "text-gray-400"}`}>+{dayAppts.length - 2} more</div>
                      )}
                    </div>

                    {hasJoinable && !selected && (
                      <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#0D9488] shadow-sm shadow-teal-300" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend footer */}
            <div className="px-7 py-4 border-t border-gray-100 bg-gray-50/40 flex flex-wrap items-center gap-4">
              <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Legend</span>
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                  <span className="text-[11px] font-semibold text-gray-500">{cfg.label}</span>
                </div>
              ))}
              <div className="flex items-center gap-1.5 ml-auto">
                <div className="w-2 h-2 rounded-full bg-[#0D9488]" />
                <span className="text-[11px] font-semibold text-gray-500">Joinable today</span>
              </div>
            </div>
          </div>

          {/* ── Right Sidebar ─────────────────────────────────────── */}
          <div className="space-y-5">

            {/* Today highlight */}
            <div className="bg-gradient-to-br from-[#0D9488] to-[#0F766E] rounded-2xl p-5 text-white shadow-lg shadow-teal-200/50">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-teal-200" />
                <p className="text-xs font-black text-teal-100 uppercase tracking-widest">Today</p>
              </div>
              <p className="text-xl font-black">{new Date().toLocaleDateString("en-US", { weekday: "long" })}</p>
              <p className="text-teal-200 text-sm font-semibold mt-0.5">
                {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
              {(() => {
                const todayAppts = getAppointmentsForDate(new Date());
                return todayAppts.length > 0 ? (
                  <div className="mt-3 pt-3 border-t border-white/20">
                    <p className="text-xs font-bold text-teal-100">{todayAppts.length} appointment{todayAppts.length > 1 ? "s" : ""} today</p>
                  </div>
                ) : (
                  <div className="mt-3 pt-3 border-t border-white/20">
                    <p className="text-xs font-medium text-teal-200">No appointments today</p>
                  </div>
                );
              })()}
            </div>

            {/* Upcoming consultations */}
            <div className="bg-white rounded-2xl shadow-sm shadow-gray-200/60 border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-sm font-black text-gray-900">Upcoming Sessions</h3>
                <span className="text-xs font-bold text-[#1B3A6B] bg-blue-50 px-2 py-0.5 rounded-full">{upcomingAppts.length}</span>
              </div>

              <div className="divide-y divide-gray-100">
                {loading ? (
                  <div className="p-5 space-y-3">
                    {[1, 2, 3].map((i) => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}
                  </div>
                ) : upcomingAppts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 px-5 text-center">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                      <Scale className="w-6 h-6 text-gray-300" />
                    </div>
                    <p className="text-sm font-bold text-gray-500">No upcoming sessions</p>
                    <p className="text-xs text-gray-400 mt-1 mb-4">Book a consultation to get started</p>
                    <button
                      onClick={() => router.push("/find-lawyer")}
                      className="px-4 py-2 bg-[#1B3A6B] text-white text-xs font-bold rounded-xl hover:bg-[#112549] transition-colors"
                    >
                      Find a Lawyer
                    </button>
                  </div>
                ) : (
                  upcomingAppts.map((appt) => {
                    const cfg = STATUS_CONFIG[appt.status] || STATUS_CONFIG.pending;
                    const apptDate = new Date(appt.scheduledAt);
                    const canJoin = appt.status === "scheduled" || appt.status === "confirmed";

                    return (
                      <div
                        key={appt.id}
                        className="p-4 hover:bg-gray-50/80 transition-colors cursor-pointer"
                        onClick={() => { setViewDate(apptDate); setSelectedDate(apptDate); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{appt.caseDescription || "Consultation"}</p>
                            <p className="text-xs text-gray-500 font-medium mt-0.5 flex items-center gap-1 truncate">
                              <User className="w-3 h-3 flex-shrink-0" />
                              {getLawyerName(appt)}
                            </p>
                          </div>
                          <span className={`flex-shrink-0 flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.bgClass} ${cfg.textClass} ${cfg.borderClass}`}>
                            {cfg.icon}
                            {cfg.label}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] font-bold text-[#1B3A6B]">
                            {apptDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {apptDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}
                          </p>
                          {canJoin && (
                            <button
                              onClick={(e) => { e.stopPropagation(); router.push(`/consultation?role=client&appointmentId=${appt.id}`); }}
                              className="flex items-center gap-1 px-2.5 py-1 bg-[#0D9488] text-white text-[10px] font-black rounded-lg hover:bg-[#0F766E] transition-colors shadow-sm shadow-teal-200"
                            >
                              <Video className="w-3 h-3" />
                              Join
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Selected Day Panel ────────────────────────────────────── */}
      {selectedDate && (
        <>
          <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40" onClick={() => setSelectedDate(null)} />
          <div
            className="fixed bottom-0 left-0 right-0 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:left-auto md:right-8 md:w-[440px] z-50"
            style={{ animation: "slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)" }}
          >
            <div className="bg-white rounded-t-3xl md:rounded-3xl shadow-2xl shadow-gray-400/20 overflow-hidden max-h-[85vh] md:max-h-[680px] flex flex-col">

              {/* Panel header */}
              <div className="px-6 py-5 bg-gradient-to-r from-[#1B3A6B] to-[#1e4580] flex items-center justify-between flex-shrink-0">
                <div>
                  <p className="text-xs font-black text-white/60 uppercase tracking-widest">Selected</p>
                  <h3 className="text-lg font-black text-white mt-0.5">
                    {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Badge row */}
              <div className="px-6 py-3 bg-gray-50/80 border-b border-gray-100 flex items-center gap-2 flex-shrink-0">
                <span className="text-xs font-black text-gray-500">
                  {selectedAppts.length} appointment{selectedAppts.length !== 1 ? "s" : ""}
                </span>
                {isToday(selectedDate) && (
                  <span className="text-xs font-black text-white bg-[#0D9488] px-2 py-0.5 rounded-full">Today</span>
                )}
              </div>

              {/* Appointment list */}
              <div className="overflow-y-auto flex-1">
                {selectedAppts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                      <CalendarDays className="w-7 h-7 text-gray-300" />
                    </div>
                    <p className="text-sm font-bold text-gray-500">No appointments</p>
                    <p className="text-xs text-gray-400 mt-1">This day is free</p>
                  </div>
                ) : (
                  <div className="p-4 space-y-3">
                    {selectedAppts.map((appt) => {
                      const cfg = STATUS_CONFIG[appt.status] || STATUS_CONFIG.pending;
                      const canJoin = appt.status === "scheduled" || appt.status === "confirmed";
                      const canModify = appt.status === "scheduled" || appt.status === "confirmed";

                      return (
                        <div key={appt.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                          <div className={`h-1 w-full ${cfg.dot}`} />
                          <div className="p-4">
                            {/* Time + status */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-[#1B3A6B]/10 flex items-center justify-center">
                                  <Clock className="w-4 h-4 text-[#1B3A6B]" />
                                </div>
                                <div>
                                  <p className="text-sm font-black text-gray-900">
                                    {new Date(appt.scheduledAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}
                                  </p>
                                  <p className="text-[10px] text-gray-400 font-medium">60 min session</p>
                                </div>
                              </div>
                              <span className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${cfg.bgClass} ${cfg.textClass} ${cfg.borderClass}`}>
                                {cfg.icon}
                                {cfg.label}
                              </span>
                            </div>

                            {/* Case info */}
                            <p className="text-sm font-bold text-gray-900 mb-1">{appt.caseDescription || "Legal Consultation"}</p>
                            <p className="text-xs text-gray-500 font-medium flex items-center gap-1.5 mb-4">
                              <User className="w-3.5 h-3.5" />
                              {getLawyerName(appt)}
                            </p>

                            {/* CTAs */}
                            {canJoin && (
                              <button
                                onClick={() => router.push(`/consultation?role=client&appointmentId=${appt.id}`)}
                                className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-[#0D9488] to-[#0F766E] text-white text-sm font-black rounded-xl hover:from-[#0F766E] hover:to-[#115e59] transition-all shadow-md shadow-teal-200 active:scale-[0.98] mb-2"
                              >
                                <Video className="w-4 h-4" />
                                Join Video Call
                              </button>
                            )}

                            {canModify && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    const dt = new Date(appt.scheduledAt);
                                    dt.setHours(dt.getHours() + 1);
                                    setRescheduleDateTime(dt.toISOString().slice(0, 16));
                                    setRescheduleTarget(appt);
                                  }}
                                  className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-[#1B3A6B]/30 text-[#1B3A6B] text-xs font-bold rounded-xl hover:bg-blue-50 transition-colors"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                  Reschedule
                                </button>
                                <button
                                  onClick={() => setCancelTarget(appt)}
                                  className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-red-200 text-red-500 text-xs font-bold rounded-xl hover:bg-red-50 transition-colors"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  Cancel
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Cancel Confirm Modal ──────────────────────────────────── */}
      {cancelTarget && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]" onClick={() => !cancelling && setCancelTarget(null)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-full max-w-sm px-4">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-6">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-lg font-black text-gray-900 text-center mb-1">Cancel Appointment?</h3>
                <p className="text-sm text-gray-500 text-center mb-1">
                  {cancelTarget.caseDescription || "Legal Consultation"}
                </p>
                <p className="text-xs text-gray-400 text-center mb-6">
                  {new Date(cancelTarget.scheduledAt).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} · {new Date(cancelTarget.scheduledAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}
                </p>
                <p className="text-xs text-red-500 font-semibold text-center bg-red-50 rounded-xl py-2 px-3 mb-5">
                  This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setCancelTarget(null)}
                    disabled={cancelling}
                    className="flex-1 py-2.5 border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Keep
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="flex-1 py-2.5 bg-red-500 text-white text-sm font-bold rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {cancelling && (
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                    )}
                    Yes, Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Reschedule Modal ──────────────────────────────────────── */}
      {rescheduleTarget && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]" onClick={() => !rescheduling && setRescheduleTarget(null)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-full max-w-sm px-4">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-6">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-6 h-6 text-[#1B3A6B]" />
                </div>
                <h3 className="text-lg font-black text-gray-900 text-center mb-1">Reschedule Appointment</h3>
                <p className="text-sm text-gray-500 text-center mb-5">
                  {rescheduleTarget.caseDescription || "Legal Consultation"} · with {getLawyerName(rescheduleTarget)}
                </p>

                <div className="mb-5">
                  <label className="text-xs font-black text-gray-700 uppercase tracking-widest mb-2 block">New Date & Time</label>
                  <input
                    type="datetime-local"
                    value={rescheduleDateTime}
                    min={minRescheduleDateTime}
                    onChange={e => setRescheduleDateTime(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1B3A6B] focus:ring-2 focus:ring-[#1B3A6B]/20 transition-all"
                  />
                  <p className="text-xs text-gray-400 mt-2">Your lawyer will be notified of the change.</p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => { setRescheduleTarget(null); setRescheduleDateTime(''); }}
                    disabled={rescheduling}
                    className="flex-1 py-2.5 border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReschedule}
                    disabled={rescheduling || !rescheduleDateTime}
                    className="flex-1 py-2.5 bg-[#1B3A6B] text-white text-sm font-bold rounded-xl hover:bg-[#112549] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {rescheduling && (
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                    )}
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <style jsx global>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
