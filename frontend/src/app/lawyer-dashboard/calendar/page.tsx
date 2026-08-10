"use client";

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useLanguage } from "../../context/LanguageContext";
import { auth } from "../../lib/firebase";

const content = {
  en: {
    calendar: "Calendar",
    day: "Day",
    week: "Week",
    month: "Month",
    sync: "Refresh Bookings",
    schedule: "Schedule Availability",
    connectTitle: "Cal.com Scheduling",
    connectDesc: "Your bookings from Cal.com appear here automatically. Set up your scheduling page at cal.com to let clients book consultations — free, no Google account needed.",
    connectBtn: "Open Cal.com Dashboard",
    connectedBadge: "Cal.com Connected",
    disconnect: "",
    disconnectConfirm: "",
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
    workingHours: "WORKING HOURS: 08:00 AM - 06:00 PM (GMT +5:30 / Sri Lanka Time)",
    newEvent: "New Event",
    editEvent: "Edit Event",
    deleteEvent: "Delete Event",
    eventTitle: "Title",
    eventDesc: "Description",
    eventStart: "Start Time",
    eventEnd: "End Time",
    eventLocation: "Location",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    noEvents: "No events for this week",
    loading: "Loading events...",
    today: "Today",
    syncSuccess: "Calendar synced successfully!",
    error: "Something went wrong. Please try again.",
  },
  si: {
    calendar: "දින දර්ශනය",
    day: "දින",
    week: "සති",
    month: "මාස",
    sync: "වෙන් කිරීම් නැවුම් කරන්න",
    schedule: "ලබා ගත හැකි වේලාවන්",
    connectTitle: "Cal.com කාල නির්ණය",
    connectDesc: "ඔබගේ Cal.com වෙන් කිරීම් ස්වයංක්‍රීයව මෙහි දිස්වේ. Google ගිණුමක් නොමැතිව ඔබේ නියමිත කාල රාමු සකසන්න.",
    connectBtn: "Cal.com Dashboard විවෘත කරන්න",
    connectedBadge: "Cal.com සම්බන්ධිතයි",
    disconnect: "",
    disconnectConfirm: "",
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
    workingHours: "වැඩ කරන වේලාවන්: පෙ.ව. 08:00 - ප.ව. 06:00 (GMT +5:30 / Sri Lanka Time)",
    newEvent: "නව සිදුවීම",
    editEvent: "සිදුවීම සංස්කරණය",
    deleteEvent: "සිදුවීම මකන්න",
    eventTitle: "මාතෘකාව",
    eventDesc: "විස්තරය",
    eventStart: "ආරම්භක වේලාව",
    eventEnd: "අවසන් වේලාව",
    eventLocation: "ස්ථානය",
    save: "සුරකින්න",
    cancel: "අවලංගු කරන්න",
    delete: "මකන්න",
    noEvents: "මෙම සතියට සිදුවීම් නොමැත",
    loading: "සිදුවීම් පූරණය වෙමින්...",
    today: "අද",
    syncSuccess: "දින දර්ශනය සාර්ථකව සමමුහුර්ත කරන ලදි!",
    error: "යම් දෝෂයක් සිදු විය. කරුණාකර නැවත උත්සාහ කරන්න.",
  }
};

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  start: string;
  end: string;
  location: string;
  colorId: string;
  htmlLink: string;
  status: string;
}

// Google Calendar color mapping
const EVENT_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  '1': { bg: '#E8F0FE', border: '#4285F4', text: '#1967D2' },   // Lavender
  '2': { bg: '#E6F4EA', border: '#34A853', text: '#137333' },   // Sage
  '3': { bg: '#E8E8FF', border: '#7B61FF', text: '#5B3FBF' },   // Grape
  '4': { bg: '#FCE8E6', border: '#EA4335', text: '#C5221F' },   // Flamingo
  '5': { bg: '#FFF3E0', border: '#FA903E', text: '#E37400' },   // Banana
  '6': { bg: '#FFF0E0', border: '#F97316', text: '#EA580C' },   // Tangerine
  '7': { bg: '#E0F7FA', border: '#039BE5', text: '#01579B' },   // Peacock
  '8': { bg: '#F3E8FF', border: '#616161', text: '#3C4043' },   // Graphite
  '9': { bg: '#EFF6FF', border: '#3B82F6', text: '#2563EB' },   // Blueberry
  '10': { bg: '#ECFDF5', border: '#10B981', text: '#059669' },  // Basil
  '11': { bg: '#FFF7ED', border: '#EF4444', text: '#DC2626' },  // Tomato
  default: { bg: '#EFF6FF', border: '#3B82F6', text: '#2563EB' },
};

function getEventColor(colorId: string) {
  return EVENT_COLORS[colorId] || EVENT_COLORS['default'];
}

function CalendarContent() {
  const { lang } = useLanguage();
  const tx = content[lang as keyof typeof content] || content.en;
  
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://justicepal-production.up.railway.app";

  const [view, setView] = useState<'Day' | 'Week' | 'Month'>('Week');
  const [calConfigured, setCalConfigured] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(now.getFullYear(), now.getMonth(), diff);
  });

  // Modal states
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    start: '',
    end: '',
    location: '',
  });

  // Feedback
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [syncing, setSyncing] = useState(false);

  const hours = [
    "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", 
    "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"
  ];

  // Get auth token helper
  const getToken = async () => {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    return await user.getIdToken();
  };

  // Check if Cal.com API key is configured on the backend
  const checkCalComStatus = useCallback(async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/api/cal-com/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCalConfigured(data.configured);
      }
    } catch (err) {
      console.error('Error checking Cal.com status:', err);
    } finally {
      setIsLoading(false);
    }
  }, [BACKEND_URL]);

  // Fetch Cal.com bookings for the current week
  const fetchCalComBookings = useCallback(async () => {
    try {
      setSyncing(true);
      const token = await getToken();
      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const res = await fetch(
        `${BACKEND_URL}/api/cal-com/bookings?startTime=${currentWeekStart.toISOString()}&endTime=${weekEnd.toISOString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
      }
    } catch (err) {
      console.error('Error fetching Cal.com bookings:', err);
    } finally {
      setSyncing(false);
    }
  }, [currentWeekStart, BACKEND_URL]);

  // Initial load
  useEffect(() => {
    checkCalComStatus();
  }, [checkCalComStatus]);

  // Fetch bookings whenever week changes
  useEffect(() => {
    fetchCalComBookings();
  }, [fetchCalComBookings]);

  // Refresh handler
  const handleSync = async () => {
    await fetchCalComBookings();
    setFeedback({ type: 'success', msg: tx.syncSuccess });
    setTimeout(() => setFeedback(null), 3000);
  };

  // Create local event (stored in component state — Cal.com bookings are read-only)
  const handleCreateEvent = () => {
    const newEvent: CalendarEvent = {
      id: `local-${Date.now()}`,
      title: eventForm.title,
      description: eventForm.description,
      start: new Date(eventForm.start).toISOString(),
      end: new Date(eventForm.end).toISOString(),
      location: eventForm.location,
      colorId: '6',  // Orange — distinguishes local events from Cal.com bookings
      htmlLink: '',
      status: 'confirmed',
    };
    setEvents(prev => [...prev, newEvent]);
    setShowEventModal(false);
    setEventForm({ title: '', description: '', start: '', end: '', location: '' });
    setFeedback({ type: 'success', msg: 'Event added to calendar!' });
    setTimeout(() => setFeedback(null), 3000);
  };

  // Update local event
  const handleUpdateEvent = () => {
    if (!editingEvent) return;
    setEvents(prev => prev.map(e => e.id === editingEvent.id ? {
      ...e,
      title: eventForm.title,
      description: eventForm.description,
      start: new Date(eventForm.start).toISOString(),
      end: new Date(eventForm.end).toISOString(),
      location: eventForm.location,
    } : e));
    setEditingEvent(null);
    setShowEventModal(false);
    setEventForm({ title: '', description: '', start: '', end: '', location: '' });
    setFeedback({ type: 'success', msg: 'Event updated!' });
    setTimeout(() => setFeedback(null), 3000);
  };

  // Delete local event or cancel Cal.com booking
  const handleDeleteEvent = async (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (event && (event as any).source === 'cal.com') {
      // Cancel via Cal.com API
      try {
        const token = await getToken();
        await fetch(`${BACKEND_URL}/api/cal-com/bookings/${eventId}/cancel`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: 'Cancelled by lawyer' }),
        });
      } catch (err) {
        console.error('Error cancelling Cal.com booking:', err);
      }
    }
    setEvents(prev => prev.filter(e => e.id !== eventId));
    setEditingEvent(null);
    setShowEventModal(false);
  };

  // Open edit modal
  const openEditModal = (event: CalendarEvent) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      description: event.description,
      start: event.start ? new Date(event.start).toISOString().slice(0, 16) : '',
      end: event.end ? new Date(event.end).toISOString().slice(0, 16) : '',
      location: event.location,
    });
    setShowEventModal(true);
  };

  // Open create modal
  const openCreateModal = () => {
    setEditingEvent(null);
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
    setEventForm({
      title: '',
      description: '',
      start: now.toISOString().slice(0, 16),
      end: oneHourLater.toISOString().slice(0, 16),
      location: '',
    });
    setShowEventModal(true);
  };

  // Week navigation
  const goToPrevWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() - 7);
    setCurrentWeekStart(newStart);
  };

  const goToNextWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + 7);
    setCurrentWeekStart(newStart);
  };

  const goToToday = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    setCurrentWeekStart(new Date(now.getFullYear(), now.getMonth(), diff));
  };

  // Build week days
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const dayNames = [tx.mon, tx.tue, tx.wed, tx.thu, tx.fri, tx.sat, tx.sun];
  const today = new Date();

  // Position events on the grid
  const getEventPosition = (event: CalendarEvent) => {
    const start = new Date(event.start);
    const end = new Date(event.end);

    // Day column (0-6 for Mon-Sun)
    const dayOfWeek = start.getDay();
    const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    // Top position: hours since 8am
    const startHour = start.getHours() + start.getMinutes() / 60;
    const endHour = end.getHours() + end.getMinutes() / 60;
    const topOffset = Math.max(0, startHour - 8); // 8am is hour 0
    const duration = Math.max(0.5, endHour - startHour);

    return {
      dayIndex,
      top: `${topOffset * 6}rem`,
      height: `${duration * 6}rem`,
    };
  };

  // Format time
  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  // Month name for header
  const getMonthDisplay = () => {
    const start = weekDays[0];
    const end = weekDays[6];
    const startMonth = start.toLocaleString('default', { month: 'long' });
    const endMonth = end.toLocaleString('default', { month: 'long' });
    const year = start.getFullYear();
    
    if (startMonth === endMonth) {
      return `${startMonth} ${year}`;
    }
    return `${startMonth} – ${endMonth} ${year}`;
  };

  if (isLoading) {
    return (
      <main className="flex-1 overflow-y-auto p-8 relative h-full bg-[#F5F7FA]">
        <div className="max-w-[1400px] mx-auto flex items-center justify-center h-64">
          <svg className="animate-spin h-8 w-8 text-[#1B3A6B]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto p-8 relative h-full bg-[#F5F7FA]">
      <div className="max-w-[1400px] mx-auto flex flex-col h-full space-y-6">
        
        {/* Feedback Toast */}
        {feedback && (
          <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${
            feedback.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {feedback.type === 'success' ? (
              <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
            {feedback.msg}
          </div>
        )}

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
            {/* Cal.com status badge */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${calConfigured ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
              <div className={`w-2 h-2 rounded-full ${calConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`}></div>
              <span className={`text-xs font-bold ${calConfigured ? 'text-emerald-700' : 'text-amber-700'}`}>
                {calConfigured ? 'Cal.com Active' : 'Cal.com Not Configured'}
              </span>
            </div>

            <button 
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-60"
            >
              <svg className={`w-4 h-4 text-gray-500 ${syncing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {tx.sync}
            </button>
            <button 
              onClick={openCreateModal}
              className="px-5 py-2 bg-[#1B3A6B] text-white rounded-lg text-sm font-semibold hover:bg-[#112549] transition-colors shadow-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {tx.newEvent}
            </button>
          </div>
        </div>

        {/* Cal.com Info Card (shown when key is not yet configured) */}
        {!calConfigured && (
          <div className="bg-gradient-to-r from-[#0f172a] to-[#1e293b] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 opacity-5">
              <svg viewBox="0 0 200 200" fill="currentColor"><path d="M 100 0 L 200 100 L 100 200 L 0 100 Z" /></svg>
            </div>
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-base font-bold mb-1">{tx.connectTitle}</h2>
                <p className="text-slate-400 text-xs leading-relaxed max-w-xl">{tx.connectDesc}</p>
                <p className="text-amber-400 text-[11px] font-bold mt-2">⚙ Set <code className="bg-white/10 px-1 rounded">CAL_COM_API_KEY</code> in your backend .env to activate</p>
              </div>
              <a 
                href="https://app.cal.com/settings/developer/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-white text-slate-900 rounded-xl text-sm font-bold hover:bg-slate-100 transition-colors shadow-md whitespace-nowrap"
              >
                {tx.connectBtn} →
              </a>
            </div>
          </div>
        )}

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

        {/* Week Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={goToPrevWeek} className="p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200">
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-lg font-bold text-gray-900 min-w-[220px] text-center">{getMonthDisplay()}</h2>
            <button onClick={goToNextWeek} className="p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200">
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <button 
            onClick={goToToday}
            className="px-4 py-1.5 border border-gray-200 bg-white rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            {tx.today}
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white border border-gray-200 rounded-xl flex-1 flex flex-col overflow-hidden shadow-sm">
          
          {/* Days Header */}
          <div className="flex border-b border-gray-200">
            <div className="w-20 flex-shrink-0 border-r border-gray-200 bg-[#F9FAFC]"></div>
            <div className="flex-1 grid grid-cols-7">
              {weekDays.map((d, i) => {
                const isToday = d.toDateString() === today.toDateString();
                const isWeekend = i >= 5;
                return (
                  <div key={i} className="py-4 flex flex-col items-center justify-center border-r border-gray-200 last:border-r-0">
                    <span className={`text-xs font-bold tracking-wider uppercase ${isWeekend ? 'text-gray-400' : (isToday ? 'text-[#1B3A6B]' : 'text-gray-500')}`}>
                      {dayNames[i]}
                    </span>
                    <span className={`text-xl font-black mt-1 ${isWeekend ? 'text-gray-400' : (isToday ? 'text-[#1B3A6B]' : 'text-gray-900')}`}>
                      {d.getDate()}
                    </span>
                    {isToday && <div className="w-1.5 h-1.5 rounded-full bg-[#1B3A6B] mt-1"></div>}
                  </div>
                );
              })}
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

            {/* Current Time Indicator */}
            {(() => {
              const now = new Date();
              const todayDayIndex = weekDays.findIndex(d => d.toDateString() === now.toDateString());
              if (todayDayIndex === -1) return null;
              
              const currentHour = now.getHours() + now.getMinutes() / 60;
              if (currentHour < 8 || currentHour > 18) return null;
              
              const topOffset = (currentHour - 8) * 6; // 6rem per hour

              return (
                <div 
                  className="absolute z-20 flex items-center" 
                  style={{ 
                    top: `${topOffset}rem`,
                    left: `calc(5rem + (100% - 5rem) * ${todayDayIndex} / 7)`,
                    width: `calc((100% - 5rem) / 7)`
                  }}
                >
                  <div className="absolute -left-1 w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]"></div>
                  <div className="w-full border-t-2 border-red-500/80"></div>
                </div>
              );
            })()}

            {/* Cal.com Bookings + Local Events */}
            {events.length > 0 && (
              <div className="absolute top-0 right-0 bottom-0 left-20 z-10 grid grid-cols-7">
                {Array.from({ length: 7 }, (_, dayIdx) => (
                  <div key={dayIdx} className="relative border-r border-transparent">
                    {events
                      .filter(event => {
                        const pos = getEventPosition(event);
                        return pos.dayIndex === dayIdx;
                      })
                      .map(event => {
                        const pos = getEventPosition(event);
                        const color = getEventColor(event.colorId);
                        return (
                          <div
                            key={event.id}
                            onClick={() => openEditModal(event)}
                            className="absolute left-1.5 right-1.5 rounded-md p-2 border-l-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
                            style={{
                              top: pos.top,
                              height: pos.height,
                              backgroundColor: color.bg,
                              borderLeftColor: color.border,
                            }}
                          >
                            <p className="text-[10px] font-bold mb-0.5" style={{ color: color.text }}>
                              {formatTime(event.start)} - {formatTime(event.end)}
                            </p>
                            <p className="text-xs font-bold text-gray-900 leading-tight truncate">
                              {event.title}
                            </p>
                            {event.location && (
                              <p className="text-[10px] font-medium text-gray-500 mt-1 truncate">
                                📍 {event.location}
                              </p>
                            )}
                          </div>
                        );
                      })}
                  </div>
                ))}
              </div>
            )}

            {/* No events message */}
            {events.length === 0 && !syncing && (
              <div className="absolute inset-0 flex items-center justify-center z-5 pointer-events-none">
                <p className="text-sm text-gray-400 font-medium">{tx.noEvents}</p>
              </div>
            )}

            {/* Loading overlay */}
            {syncing && (
              <div className="absolute inset-0 flex items-center justify-center z-30 bg-white/50 backdrop-blur-[1px]">
                <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-xl shadow-md border border-gray-100">
                  <svg className="animate-spin h-5 w-5 text-[#1B3A6B]" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span className="text-sm font-semibold text-gray-700">{tx.loading}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Legend */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-2">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-[#3B82F6]"></div>
              <span className="text-xs font-bold text-gray-600">Cal.com Bookings</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-[#F97316]"></div>
              <span className="text-xs font-bold text-gray-600">Local Events</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
              <span className="text-xs font-bold text-gray-600">Current Time</span>
            </div>
          </div>
          <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-4 md:mt-0">
            {tx.workingHours}
          </p>
        </div>

      </div>

      {/* Event Create / Edit Modal */}
      {showEventModal && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={() => { setShowEventModal(false); setEditingEvent(null); }}></div>
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-0 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              
              {/* Modal Header */}
              <div className="bg-[#F8FAFC] px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">
                  {editingEvent ? tx.editEvent : tx.newEvent}
                </h3>
                <button 
                  onClick={() => { setShowEventModal(false); setEditingEvent(null); }}
                  className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">{tx.eventTitle}</label>
                  <input
                    type="text"
                    value={eventForm.title}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                    placeholder="e.g. Client Consultation - Sarah Chen"
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1B3A6B] focus:ring-1 focus:ring-[#1B3A6B] transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">{tx.eventDesc}</label>
                  <textarea
                    value={eventForm.description}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                    placeholder="Add details about this event..."
                    rows={3}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1B3A6B] focus:ring-1 focus:ring-[#1B3A6B] transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">{tx.eventStart}</label>
                    <input
                      type="datetime-local"
                      value={eventForm.start}
                      onChange={(e) => setEventForm({ ...eventForm, start: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1B3A6B] focus:ring-1 focus:ring-[#1B3A6B] transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">{tx.eventEnd}</label>
                    <input
                      type="datetime-local"
                      value={eventForm.end}
                      onChange={(e) => setEventForm({ ...eventForm, end: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1B3A6B] focus:ring-1 focus:ring-[#1B3A6B] transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">{tx.eventLocation}</label>
                  <input
                    type="text"
                    value={eventForm.location}
                    onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                    placeholder="e.g. Virtual Meeting / Office Room 3B"
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1B3A6B] focus:ring-1 focus:ring-[#1B3A6B] transition-all"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-gray-100 bg-[#F8FAFC] flex items-center justify-between">
                {editingEvent ? (
                  <button
                    onClick={() => handleDeleteEvent(editingEvent.id)}
                    className="px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    {tx.delete}
                  </button>
                ) : (
                  <div></div>
                )}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => { setShowEventModal(false); setEditingEvent(null); }}
                    className="px-5 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
                  >
                    {tx.cancel}
                  </button>
                  <button
                    onClick={editingEvent ? handleUpdateEvent : handleCreateEvent}
                    disabled={!eventForm.title || !eventForm.start || !eventForm.end}
                    className="px-5 py-2 bg-[#1B3A6B] text-white rounded-lg text-sm font-bold hover:bg-[#112549] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {tx.save}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}

export default function CalendarPage() {
  return (
    <Suspense fallback={
      <main className="flex-1 overflow-y-auto p-8 relative h-full bg-[#F5F7FA]">
        <div className="max-w-[1400px] mx-auto flex items-center justify-center h-64">
          <svg className="animate-spin h-8 w-8 text-[#1B3A6B]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        </div>
      </main>
    }>
      <CalendarContent />
    </Suspense>
  );
}
