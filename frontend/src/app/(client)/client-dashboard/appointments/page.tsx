"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Calendar,
  Clock,
  Video,
  CheckCircle,
  AlertCircle,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  Loader2,
  MoreVertical,
  RefreshCcw,
} from "lucide-react";

interface Lawyer {
  id: string;
  specialization: string;
  hourlyRate: number;
  user: {
    name: string;
    profilePicture: string | null;
  };
}

interface Appointment {
  id: string;
  scheduledAt: string;
  status: string; // 'scheduled' | 'CONFIRMED' | 'REJECTED' etc.
  caseDescription: string;
  lawyer: Lawyer;
}

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

async function authHeaders(user: any): Promise<HeadersInit> {
  const token = await user.getIdToken();
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export default function ActiveAppointmentsPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAppointments = useCallback(async (isRefresh = false) => {
    if (!user) return;
    if (isRefresh) setRefreshing(true);
    
    try {
      const headers = await authHeaders(user);
      const res = await fetch(`${API_BASE}/api/appointments/active`, { headers });
      
      if (!res.ok) throw new Error("Failed to fetch appointments");
      
      const data = await res.json();
      setAppointments(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Unable to load your appointments. Please try again later.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchAppointments();
      
      // Auto-refresh every 30 seconds
      const intervalId = setInterval(() => {
        fetchAppointments(true);
      }, 30000);
      
      return () => clearInterval(intervalId);
    }
  }, [user, fetchAppointments]);

  // Derived stats
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  const upcomingCount = appointments.filter(a => a.status.toLowerCase() === 'scheduled').length;
  const confirmedCount = appointments.filter(a => a.status.toLowerCase() === 'confirmed').length;
  const thisWeekCount = appointments.filter(a => {
    const date = new Date(a.scheduledAt);
    return date >= now && date <= nextWeek;
  }).length;

  if (loading && !refreshing) {
    return (
      <main className="max-w-[1200px] w-full mx-auto px-4 md:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="h-8 w-64 bg-gray-200 rounded-lg animate-pulse mb-2"></div>
            <div className="h-4 w-48 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 h-28 animate-pulse shadow-sm">
              <div className="h-10 w-10 bg-gray-200 rounded-full mb-2"></div>
              <div className="h-6 w-16 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 h-40 animate-pulse shadow-sm"></div>
          ))}
        </div>
      </main>
    );
  }

  if (error && !loading && appointments.length === 0) {
    return (
      <main className="max-w-[1200px] w-full mx-auto px-4 md:px-8 py-8 flex flex-col items-center justify-center h-[60vh]">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to load appointments</h2>
        <p className="text-gray-500 mb-6">{error}</p>
        <button 
          onClick={() => { setLoading(true); fetchAppointments(); }}
          className="px-6 py-2.5 bg-[#1B3A6B] text-white rounded-xl font-semibold shadow-sm hover:bg-[#112549] transition-colors"
        >
          Retry
        </button>
      </main>
    );
  }

  return (
    <main className="max-w-[1200px] w-full mx-auto px-4 md:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1B3A6B] tracking-tight">Active Appointments</h1>
          <p className="text-gray-500 mt-2 text-base">Manage your upcoming and confirmed consultations.</p>
        </div>
        <button 
          onClick={() => fetchAppointments(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCcw className={`w-4 h-4 ${refreshing ? "animate-spin text-[#1B3A6B]" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center shrink-0">
            <CalendarClock className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">Upcoming (Pending)</p>
            <p className="text-3xl font-bold text-gray-900">{upcomingCount}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center shrink-0">
            <CalendarCheck className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">Confirmed</p>
            <p className="text-3xl font-bold text-gray-900">{confirmedCount}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
            <CalendarDays className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">This Week</p>
            <p className="text-3xl font-bold text-gray-900">{thisWeekCount}</p>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {appointments.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Calendar className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Active Appointments</h3>
            <p className="text-gray-500 max-w-md mb-6">
              You don't have any upcoming or confirmed appointments. Schedule a new consultation with a lawyer to get started.
            </p>
            <button 
              onClick={() => router.push("/find-lawyer")}
              className="px-6 py-3 bg-[#1B3A6B] hover:bg-[#112549] text-white rounded-xl font-bold shadow-sm transition-colors"
            >
              Find a Lawyer
            </button>
          </div>
        ) : (
          appointments.map((appt) => {
            const dateObj = new Date(appt.scheduledAt);
            const dateStr = dateObj.toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric" });
            const timeStr = dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
            const isConfirmed = appt.status.toLowerCase() === 'confirmed';
            const isPast = dateObj < new Date();

            return (
              <div key={appt.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6 flex flex-col lg:flex-row gap-6 transition-all hover:shadow-md">
                
                {/* Lawyer Info */}
                <div className="flex items-center gap-4 lg:w-1/3">
                  <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden relative shrink-0 border border-gray-200">
                    <Image 
                      src={appt.lawyer?.user?.profilePicture || "https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&q=80&w=200&h=200"} 
                      alt="Lawyer" 
                      fill 
                      className="object-cover" 
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 leading-tight">
                      {appt.lawyer?.user?.name || "Lawyer"}
                    </h3>
                    <p className="text-sm text-gray-500 font-medium">{appt.lawyer?.specialization || "Legal Counsel"}</p>
                    <p className="text-xs text-gray-400 mt-0.5">LKR {appt.lawyer?.hourlyRate?.toLocaleString() || "5,000"} / hr</p>
                  </div>
                </div>

                {/* Date, Time & Details */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:border-l lg:pl-6 border-gray-100">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <Calendar className="w-4 h-4 text-[#1B3A6B]" />
                      <span className="text-sm font-semibold text-gray-900">{dateStr}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{timeStr}</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${
                        isConfirmed ? "bg-green-50 text-green-700 border border-green-200" : "bg-orange-50 text-orange-700 border border-orange-200"
                      }`}>
                        {isConfirmed ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                        {appt.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 pr-4" title={appt.caseDescription}>
                      <span className="font-semibold">Notes:</span> {appt.caseDescription}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 lg:border-l lg:pl-6 border-gray-100 pt-4 lg:pt-0 mt-2 lg:mt-0 border-t lg:border-t-0">
                  {/* Reschedule Button (Dummy logic for now) */}
                  <button 
                    disabled={isPast}
                    className="px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
                  >
                    Reschedule
                  </button>

                  {/* Join Video Room */}
                  <button
                    onClick={() => router.push(`/consultation?role=client&appointmentId=${appt.id}`)}
                    disabled={!isConfirmed || isPast}
                    className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm ${
                      isConfirmed && !isPast
                        ? "bg-[#1B3A6B] hover:bg-[#112549] text-white active:scale-[0.98]"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                    }`}
                  >
                    <Video className="w-4 h-4" />
                    Join Video
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}
