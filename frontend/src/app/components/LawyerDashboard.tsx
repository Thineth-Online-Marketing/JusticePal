"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../context/LanguageContext";
import { auth } from "../lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { io, Socket } from "socket.io-client";
import LawyerOnboarding from "./LawyerOnboarding";
import PendingApproval from "./PendingApproval";

const content = {
  en: {
    dashboard: "Dashboard",
    calendar: "Calendar",
    cases: "Active Cases",
    messages: "Messages",
    settings: "Settings",
    searchPlaceholder: "Search case files, appointments...",
    upcomingAppointments: "Upcoming Appointments",
    activeCases: "Active Cases",
    newRequests: "New Requests",
    unreadMessages: "Unread Messages",
    fromLastWeek: "+2 from last week",
    stableWorkload: "Stable workload",
    awaitingReview: "! Awaiting review",
    urgentPriority: "2 urgent priority",
    todaysSchedule: "Today's Schedule",
    viewFullCalendar: "View Full Calendar",
    quickActions: "Quick Actions",
    addTask: "Add Task",
    shareDoc: "Share Doc",
    invoice: "Invoice",
    more: "More",
    priorityCases: "Priority Cases",
    urgent: "URGENT",
    onTrack: "ON TRACK",
    viewAllCases: "View All Cases",
    recentActivityFeed: "Recent Activity Feed",
  },
  si: {
    dashboard: "උපකරණ පුවරුව",
    calendar: "දින දර්ශනය",
    cases: "ක්‍රියාකාරී නඩු",
    messages: "පණිවිඩ",
    settings: "සැකසුම්",
    searchPlaceholder: "නඩු ගොනු, හමුවීම් සොයන්න...",
    upcomingAppointments: "ඉදිරි හමුවීම්",
    activeCases: "ක්‍රියාකාරී නඩු",
    newRequests: "නව ඉල්ලීම්",
    unreadMessages: "නොකියවූ පණිවිඩ",
    fromLastWeek: "පසුගිය සතියට වඩා +2",
    stableWorkload: "ස්ථාවර වැඩ ප්‍රමාණය",
    awaitingReview: "! සමාලෝචනය අපේක්ෂාවෙන්",
    urgentPriority: "හදිසි ප්‍රමුඛතා 2ක්",
    todaysSchedule: "අද කාලසටහන",
    viewFullCalendar: "සම්පූර්ණ දින දර්ශනය බලන්න",
    quickActions: "ඉක්මන් ක්‍රියා",
    addTask: "කාර්යය එක් කරන්න",
    shareDoc: "ලේඛන බෙදාගන්න",
    invoice: "ඉන්වොයිසිය",
    more: "තවත්",
    priorityCases: "ප්‍රමුඛතා නඩු",
    urgent: "හදිසි",
    onTrack: "නිසි මගෙහි",
    viewAllCases: "සියලුම නඩු බලන්න",
    recentActivityFeed: "මෑත ක්‍රියාකාරකම්",
  }
};

export default function LawyerDashboard() {
  const { lang } = useLanguage();
  const tx = content[lang as keyof typeof content] || content.en;
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [dbUser, setDbUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [setupStep, setSetupStep] = useState<1 | 2 | 3 | null>(null);
  const [upcomingAppointment, setUpcomingAppointment] = useState<any | null>(null);
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  const fetchAnalytics = async (currentUser: User, lawyerId: string) => {
    try {
      const idToken = await currentUser.getIdToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/lawyers/${lawyerId}/analytics`, {
        headers: { Authorization: `Bearer ${idToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setAnalyticsData(data.analytics);
        }
      } else {
        setAnalyticsError("Failed to load analytics");
      }
    } catch (error) {
      console.error("Failed to fetch analytics", error);
      setAnalyticsError("Failed to load analytics");
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchDbProfile = async (currentUser: User) => {
    try {
      const idToken = await currentUser.getIdToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/users/profile`, {
        headers: { Authorization: `Bearer ${idToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDbUser(data);
        return data;
      }
    } catch (error) {
      console.error("Failed to fetch DB user", error);
    }
    return null;
  };

  useEffect(() => {
    let socket: Socket;
    const unsubscribe = onAuthStateChanged(auth, async (currentUser: User | null) => {
      if (currentUser) {
        setUser(currentUser);
        const profile = await fetchDbProfile(currentUser);
        
        if (profile?.lawyerProfile?.id) {
          fetchAnalytics(currentUser, profile.lawyerProfile.id);
        } else {
          setAnalyticsLoading(false);
        }

        // Fetch upcoming appointment for the lawyer
        const fetchAppointmentsForLawyer = async () => {
          try {
            const idToken = await currentUser.getIdToken();
            const res = await fetch(
              `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/appointments`,
              { headers: { Authorization: `Bearer ${idToken}` } }
            );
            if (res.ok) {
              const data = await res.json();
              const upcoming = data.find(
                (a: any) => a.status === "scheduled" || a.status === "confirmed"
              ) || data[0] || null;
              setUpcomingAppointment(upcoming);

              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const tomorrow = new Date(today);
              tomorrow.setDate(tomorrow.getDate() + 1);
              
              const todays = data.filter((a: any) => {
                const apptDate = new Date(a.scheduledAt);
                return apptDate >= today && apptDate < tomorrow && (a.status === "scheduled" || a.status === "confirmed");
              });
              setTodayAppointments(todays);
            }
          } catch (err) {
            console.error("Failed to fetch appointments", err);
          }
        };

        await fetchAppointmentsForLawyer();

        setLoading(false);
        setLoading(false);

        // Setup Socket for real-time dashboard updates
        const idToken = await currentUser.getIdToken();
        socket = io(process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000", {
          auth: { token: idToken },
          transports: ["websocket", "polling"],
        });

        socket.on("dashboard_update", async (data) => {
          if (data.type === "new_booking_received") {
            if (profile?.lawyerProfile?.id) {
              fetchAnalytics(currentUser, profile.lawyerProfile.id);
            }
            await fetchAppointmentsForLawyer();
          }
        });
      } else {
        router.push("/login");
      }
    });

    return () => {
      unsubscribe();
      socket?.disconnect();
    };
  }, [router]);

  if (loading || analyticsLoading) {
    return (
      <main className="flex-1 overflow-y-auto p-8 relative h-full">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 h-32 animate-pulse flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="w-10 h-10 rounded-lg bg-gray-100"></div>
              </div>
              <div className="h-8 bg-gray-200 rounded w-16 mt-2"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl h-[400px] animate-pulse p-6 border border-gray-100">
             <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
             <div className="space-y-4">
                <div className="h-20 bg-gray-50 rounded-xl"></div>
                <div className="h-20 bg-gray-50 rounded-xl"></div>
             </div>
          </div>
          <div className="bg-white rounded-xl h-[400px] animate-pulse p-6 border border-gray-100">
             <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
             <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="h-20 bg-gray-50 rounded-xl"></div>
                <div className="h-20 bg-gray-50 rounded-xl"></div>
             </div>
             <div className="h-32 bg-gray-50 rounded-xl"></div>
          </div>
        </div>
      </main>
    );
  }

  // Determine profile strength and task completion
  const lawyerProfile = dbUser?.lawyerProfile;
  const isVerified = lawyerProfile?.isVerified;
  const hasBioData = lawyerProfile && lawyerProfile.specialization?.length > 0 && !!lawyerProfile.location && !!lawyerProfile.bio;
  const hasVerifiedPhone = !!lawyerProfile?.phoneVerified;
  const hasIdUploaded = lawyerProfile?.idPhotos?.length > 0;
  
  const showPendingApproval = dbUser?.role === "lawyer" && !isVerified && lawyerProfile?.profileCompleted;
  const showBioTask = dbUser?.role === "lawyer" && !hasBioData && !showPendingApproval;
  const showPhoneTask = dbUser?.role === "lawyer" && !isVerified && !hasVerifiedPhone && !showPendingApproval;
  const showIdTask = dbUser?.role === "lawyer" && !isVerified && !hasIdUploaded && !showPendingApproval;

  return (
    <>
      <main className="flex-1 overflow-y-auto p-8 relative h-full">
        {/* Action Task Cards Container */}
        <div className="w-full space-y-4 mb-8">
          
          {showBioTask && (
            <div className="bg-white border border-blue-100 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between shadow-sm border-l-4 border-l-blue-500">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  Add Bio Data
                </h3>
                <p className="text-xs text-gray-500 mt-1">Complete your profile details including your picture, specialization, and work experience.</p>
              </div>
              <button onClick={() => setSetupStep(1)} className="mt-3 md:mt-0 px-5 py-2 bg-[#1B3A6B] text-white rounded-lg text-xs font-medium hover:bg-blue-800 transition-colors whitespace-nowrap">
                Add Bio Data
              </button>
            </div>
          )}

          {showPhoneTask && (
            <div className="bg-white border border-blue-100 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between shadow-sm border-l-4 border-l-blue-500">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                  Verify Mobile Number
                </h3>
                <p className="text-xs text-gray-500 mt-1">Verify your phone number with OTP to secure your account and communicate with clients.</p>
              </div>
              <button onClick={() => setSetupStep(2)} className="mt-3 md:mt-0 px-5 py-2 bg-[#1B3A6B] text-white rounded-lg text-xs font-medium hover:bg-blue-800 transition-colors whitespace-nowrap">
                Verify Number
              </button>
            </div>
          )}

          {showIdTask && (
            <div className="bg-white border border-blue-100 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between shadow-sm border-l-4 border-l-blue-500 opacity-90">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>
                  Verify Lawyer Account
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Upload your official Lawyer ID to get verified by our administration team.
                </p>
              </div>
              <button 
                onClick={() => setSetupStep(3)} 
                className="mt-3 md:mt-0 px-5 py-2 bg-[#1B3A6B] text-white rounded-lg text-xs font-medium hover:bg-blue-800 transition-colors whitespace-nowrap"
              >
                Verify Account
              </button>
            </div>
          )}

          {showPendingApproval && (
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between shadow-sm border-l-4 border-l-orange-500">
              <div>
                <h3 className="text-base font-bold text-orange-800 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Pending Admin Approval
                </h3>
                <p className="text-xs text-orange-700 mt-1">Your Lawyer ID is currently being reviewed. You will have full access once approved.</p>
              </div>
              <button disabled className="mt-3 md:mt-0 px-5 py-2 bg-orange-200 text-orange-800 rounded-lg text-xs font-medium cursor-not-allowed whitespace-nowrap">
                Under Review
              </button>
            </div>
          )}

        </div>

        <div className="w-full space-y-6">
          
          {/* Top Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Upcoming Appointments */}
            <div className="bg-white rounded-xl p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">{tx.upcomingAppointments}</h3>
                  <p className="text-3xl font-bold text-gray-900">{analyticsData?.upcomingAppointments || 0}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <p className="text-emerald-600 text-xs font-semibold mt-4 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Updated Live
              </p>
            </div>

            {/* Total Earnings */}
            <div className="bg-white rounded-xl p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">Total Earnings (Month)</h3>
                  <p className="text-2xl font-bold text-gray-900">Rs. {(analyticsData?.totalEarnings || 0).toLocaleString()}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-emerald-600 text-xs font-semibold mt-4">
                Payments Processed
              </p>
            </div>

            {/* Unique Clients */}
            <div className="bg-white rounded-xl p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">Unique Clients</h3>
                  <p className="text-3xl font-bold text-amber-600">{analyticsData?.uniqueClients || 0}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-amber-600 text-xs font-bold mt-4">
                Growing Network
              </p>
            </div>

            {/* Completed Appointments */}
            <div className="bg-white rounded-xl p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">Completed (Month)</h3>
                  <p className="text-3xl font-bold text-gray-900">{analyticsData?.completedAppointments || 0}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-purple-600 text-xs font-semibold mt-4">
                Successful Consultations
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column (Main) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Today's Schedule */}
              <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-gray-900">{tx.todaysSchedule}</h2>
                  <button className="text-sm font-semibold text-[#1B3A6B] hover:underline">{tx.viewFullCalendar}</button>
                </div>
                
                <div className="space-y-4">
                  {todayAppointments && todayAppointments.length > 0 ? (
                    todayAppointments.map((appt, idx) => (
                      <div 
                        key={appt.id || idx}
                        onClick={() => {
                          const url = `/consultation?role=lawyer&appointmentId=${appt.id}`;
                          router.push(url);
                        }}
                        className="flex gap-4 p-4 rounded-xl bg-[#F9FAFC] border border-gray-100 items-center cursor-pointer hover:bg-gray-100/80 transition-colors group"
                      >
                        <div className="w-20 text-right flex-shrink-0">
                          <p className="font-bold text-gray-900 text-sm">
                            {new Date(appt.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <p className="text-xs text-gray-500 font-medium mt-0.5">60 min</p>
                        </div>
                        <div className={`w-1 rounded-full h-12 ${idx % 2 === 0 ? 'bg-blue-500' : 'bg-orange-400'}`}></div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 text-sm truncate group-hover:text-[#1B3A6B] transition-colors">{appt.caseDescription || "Client Consultation"}</p>
                          <p className="text-xs text-gray-500 font-medium mt-1 truncate">Virtual Meeting • Case #{appt.id.substring(0, 4)}</p>
                        </div>
                        <div className="w-8 h-8 rounded-lg text-gray-400 group-hover:text-[#1B3A6B] group-hover:bg-blue-50 flex items-center justify-center flex-shrink-0 transition-all">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 bg-[#F9FAFC] border border-dashed border-gray-200 rounded-xl">
                      <div className="w-12 h-12 bg-blue-50 text-blue-300 rounded-full flex items-center justify-center mb-3">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-gray-900 font-medium text-sm">No consultations scheduled for today</p>
                      <p className="text-gray-400 text-xs mt-1">Take a break or review pending cases.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Activity Feed */}
              <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-gray-900">{tx.recentActivityFeed}</h2>
                  <button className="text-gray-400 hover:text-gray-600">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-6">
                  {/* Empty state for activities */}
                  <div className="flex flex-col items-center justify-center py-10">
                    <div className="w-12 h-12 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mb-3">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 font-medium text-sm">No recent activities</p>
                    <p className="text-gray-400 text-xs mt-1">Your feed will update when cases change.</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column (Sidebar Cards) */}
            <div className="space-y-6">
              
              {/* Quick Actions (Dark Blue Card) */}
              <div className="bg-[#1B3A6B] rounded-xl p-6 text-white shadow-md">
                <h2 className="text-lg font-bold mb-4">{tx.quickActions}</h2>
                <div className="grid grid-cols-2 gap-3">
                  <button className="bg-white/10 hover:bg-white/20 transition-colors rounded-lg p-3 flex flex-col items-center justify-center gap-2 aspect-square">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    <span className="text-xs font-medium">{tx.addTask}</span>
                  </button>
                  <button className="bg-white/10 hover:bg-white/20 transition-colors rounded-lg p-3 flex flex-col items-center justify-center gap-2 aspect-square">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    <span className="text-xs font-medium">{tx.shareDoc}</span>
                  </button>
                  <button className="bg-white/10 hover:bg-white/20 transition-colors rounded-lg p-3 flex flex-col items-center justify-center gap-2 aspect-square">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-xs font-medium">{tx.invoice}</span>
                  </button>
                  <button className="bg-white/10 hover:bg-white/20 transition-colors rounded-lg p-3 flex flex-col items-center justify-center gap-2 aspect-square">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                    </svg>
                    <span className="text-xs font-medium">{tx.more}</span>
                  </button>
                </div>
              </div>

              {/* Priority Cases */}
              <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 p-6 flex flex-col">
                <h2 className="text-lg font-bold text-gray-900 mb-6">{tx.priorityCases}</h2>
                
                <div className="space-y-6">
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="w-12 h-12 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mb-3">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 font-medium text-sm">No priority cases currently</p>
                  </div>
                </div>

                <button className="w-full mt-6 py-2.5 rounded-lg border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                  {tx.viewAllCases}
                </button>
              </div>
              
            </div>
          </div>
        </div>
      </main>

      {/* Onboarding Modal Overlay */}
      {setupStep !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto py-10">
          <div className="relative w-full max-w-2xl bg-transparent">
            <button 
              onClick={() => setSetupStep(null)}
              className="absolute top-4 right-4 z-50 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full p-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <LawyerOnboarding 
              dbUser={dbUser} 
              initialStep={setupStep}
              onComplete={() => {
                setSetupStep(null);
                if (user) fetchDbProfile(user);
              }} 
            />
          </div>
        </div>
      )}
    </>
  );
}
