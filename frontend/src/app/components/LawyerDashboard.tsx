"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../context/LanguageContext";
import { auth } from "../lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { io, Socket } from "socket.io-client";
import { FileDown, CheckCircle, XCircle } from "lucide-react";
import { useUI } from "../context/UIContext";
import { useAuth } from "../context/AuthContext";
import LawyerOnboarding from "./LawyerOnboarding";
import PendingApproval from "./PendingApproval";
import LegalNewsWidget from "./LegalNewsWidget";
import { useTranslation } from "../hooks/useTranslation";

export default function LawyerDashboard() {
  const { t } = useTranslation();
  const { showToast } = useUI();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [dbUser, setDbUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [setupStep, setSetupStep] = useState<number | null>(null);
  
  const [appointments, setAppointments] = useState<any[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
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

  const handlePreviewReport = async () => {
    if (!user) return;
    try {
      showToast("Loading live print preview...", "success");
      const idToken = await user.getIdToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/lawyers/report/download`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });

      if (!res.ok) {
        throw new Error("Failed to generate report");
      }

      const blob = new Blob([await res.blob()], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Instantly open the inline PDF in a clean independent workspace layer
      window.open(url, '_blank');
      
      // Cleanup ObjectURL after a slight delay to ensure browser captures it
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
      
      showToast("Preview loaded successfully!", "success");
    } catch (error) {
      console.error("Error previewing report", error);
      showToast("Failed to load report preview", "error");
    }
  };

  const fetchDbProfile = async (currentUser: User) => {
    try {
      const idToken = await currentUser.getIdToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "https://justice-pal-cjhn.vercel.app"}/api/users/profile`, {
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
  const isLawyer = dbUser?.role === "lawyer";
  
  const showBioTask = isLawyer && (!lawyerProfile?.bio || !lawyerProfile?.specialization || lawyerProfile.specialization.length === 0);
  const showPhoneTask = isLawyer && (!lawyerProfile?.phoneVerified);
  const showIdTask = isLawyer && (!lawyerProfile?.isVerified);
  
  const showPendingApproval = isLawyer && !lawyerProfile?.isVerified && lawyerProfile?.profileCompleted;

  const hasOnboardingTasks = showBioTask || showPhoneTask || showIdTask || showPendingApproval;

  return (
    <>
      <main className="flex-1 overflow-y-auto p-8 relative h-full">
        <div className="w-full space-y-6">
          
          {/* Action Task Cards Container (Onboarding) */}
          {hasOnboardingTasks && (
            <div className="w-full space-y-4">
              {showBioTask && (
                <div className="bg-white border border-blue-100 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between shadow-sm border-l-4 border-l-blue-500">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      {t("dashboardLawyer.onboarding.addBio.title")}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">{t("dashboardLawyer.onboarding.addBio.desc")}</p>
                  </div>
                  <button onClick={() => setSetupStep(1)} className="mt-3 md:mt-0 px-5 py-2 bg-[#1B3A6B] text-white rounded-lg text-xs font-medium hover:bg-blue-800 transition-colors whitespace-nowrap">
                    {t("dashboardLawyer.onboarding.addBio.btn")}
                  </button>
                </div>
              )}

              {showPhoneTask && (
                <div className="bg-white border border-blue-100 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between shadow-sm border-l-4 border-l-blue-500">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                      {t("dashboardLawyer.onboarding.verifyPhone.title")}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">{t("dashboardLawyer.onboarding.verifyPhone.desc")}</p>
                  </div>
                  <button onClick={() => setSetupStep(2)} className="mt-3 md:mt-0 px-5 py-2 bg-[#1B3A6B] text-white rounded-lg text-xs font-medium hover:bg-blue-800 transition-colors whitespace-nowrap">
                    {t("dashboardLawyer.onboarding.verifyPhone.btn")}
                  </button>
                </div>
              )}

              {showIdTask && (
                <div className="bg-white border border-blue-100 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between shadow-sm border-l-4 border-l-blue-500 opacity-90">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>
                      {t("dashboardLawyer.onboarding.verifyId.title")}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {t("dashboardLawyer.onboarding.verifyId.desc")}
                    </p>
                  </div>
                  <button 
                    onClick={() => setSetupStep(3)} 
                    className="mt-3 md:mt-0 px-5 py-2 bg-[#1B3A6B] text-white rounded-lg text-xs font-medium hover:bg-blue-800 transition-colors whitespace-nowrap"
                  >
                    {t("dashboardLawyer.onboarding.verifyId.btn")}
                  </button>
                </div>
              )}

              {showPendingApproval && (
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between shadow-sm border-l-4 border-l-orange-500">
                  <div>
                    <h3 className="text-base font-bold text-orange-800 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {t("dashboardLawyer.onboarding.pendingApproval.title")}
                    </h3>
                    <p className="text-xs text-orange-700 mt-1">{t("dashboardLawyer.onboarding.pendingApproval.desc")}</p>
                  </div>
                  <button disabled className="mt-3 md:mt-0 px-5 py-2 bg-orange-200 text-orange-800 rounded-lg text-xs font-medium cursor-not-allowed whitespace-nowrap">
                    {t("dashboardLawyer.onboarding.pendingApproval.btn")}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Welcome / Overview Header Banner */}
          <div className="bg-gradient-to-r from-[#1B3A6B] via-[#112549] to-[#1E3A8A] rounded-2xl p-6 md:p-8 text-white shadow-md relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="relative z-10 space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-semibold backdrop-blur-sm border border-white/10">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Active Practitioner Workspace
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                {t("dashboardLawyer.welcomeBack") || "Welcome back"}, {dbUser?.name || user?.displayName || "Advocate"}! 👋
              </h1>
              <p className="text-xs md:text-sm text-blue-100 max-w-xl leading-relaxed">
                Manage your consultations, stay updated with Sri Lankan legal notifications, and review active client cases in your workspace.
              </p>
            </div>
            
            <div className="relative z-10 flex items-center gap-3 flex-shrink-0">
              <button
                onClick={() => router.push('/lawyer-dashboard/calendar')}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/20 flex items-center gap-2"
              >
                📅 View Schedule
              </button>
              <button
                onClick={handlePreviewReport}
                className="px-4 py-2.5 bg-[#F97316] hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
              >
                <FileDown className="w-4 h-4" />
                {t("dashboardLawyer.downloadReport") || "Download Report"}
              </button>
            </div>
          </div>
          
          {/* Top Stat Cards (4 Columns - Full Width) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Upcoming Appointments */}
            <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.06)] border border-gray-100 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">{t("dashboardLawyer.stats.upcomingAppointments")}</h3>
                  <p className="text-3xl font-bold text-gray-900">{analyticsData?.upcomingAppointments || 0}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <p className="text-emerald-600 text-xs font-semibold mt-4 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                {t("dashboardLawyer.stats.updatedLive")}
              </p>
            </div>

            {/* Total Earnings */}
            <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.06)] border border-gray-100 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">{t("dashboardLawyer.stats.totalEarnings")}</h3>
                  <p className="text-2xl font-bold text-gray-900">Rs. {(analyticsData?.totalEarnings || 0).toLocaleString()}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-emerald-600 text-xs font-semibold mt-4">
                {t("dashboardLawyer.stats.paymentsProcessed")}
              </p>
            </div>

            {/* Unique Clients */}
            <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.06)] border border-gray-100 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">{t("dashboardLawyer.stats.uniqueClients")}</h3>
                  <p className="text-3xl font-bold text-amber-600">{analyticsData?.uniqueClients || 0}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-amber-600 text-xs font-bold mt-4">
                {t("dashboardLawyer.stats.growingNetwork")}
              </p>
            </div>

            {/* Completed Appointments */}
            <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.06)] border border-gray-100 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">{t("dashboardLawyer.stats.completedMonth")}</h3>
                  <p className="text-3xl font-bold text-gray-900">{analyticsData?.completedAppointments || 0}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-purple-600 text-xs font-semibold mt-4">
                {t("dashboardLawyer.stats.successfulConsultations")}
              </p>
            </div>
          </div>

          {/* Full-Width Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
            
            {/* Main Content Area (Left / Center - Wide 2 Columns) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Active Consultations */}
              <div className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.06)] border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{t("dashboardLawyer.consultations.title")}</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Manage and respond to client appointment requests</p>
                  </div>
                  <button onClick={() => router.push('/lawyer-dashboard/calendar')} className="text-xs font-bold text-[#1B3A6B] hover:underline bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                    {t("dashboardLawyer.consultations.viewFullCalendar")} →
                  </button>
                </div>
                
                <div className="space-y-4">
                  {appointments.length > 0 ? (
                    appointments.map((appt, idx) => (
                      <div 
                        key={appt.id || idx}
                        className="flex flex-col gap-3 p-4 rounded-xl bg-[#F9FAFC] border border-gray-100 transition-all hover:border-blue-200 group"
                      >
                        <div className="flex gap-4 items-center flex-wrap sm:flex-nowrap">
                          <div className="w-24 text-left sm:text-right flex-shrink-0">
                            <p className="font-bold text-gray-900 text-xs">
                              {new Date(appt.scheduledAt).toLocaleDateString()}<br/>
                              <span className="text-gray-500 font-semibold">{new Date(appt.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </p>
                          </div>
                          <div className={`w-1 rounded-full h-12 hidden sm:block ${appt.status === 'CONFIRMED' ? 'bg-green-500' : appt.status === 'REJECTED' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                          <div className="flex-1 min-w-0 cursor-pointer" onClick={() => {
                            if (appt.status === 'CONFIRMED') {
                              router.push(`/consultation?role=lawyer&appointmentId=${appt.id}`);
                            }
                          }}>
                            <p className="font-bold text-gray-900 text-sm truncate group-hover:text-[#1B3A6B] transition-colors">{appt.caseDescription || t("dashboardLawyer.consultations.defaultCaseDesc")}</p>
                            <p className="text-xs text-gray-500 font-medium mt-0.5 truncate">{t("dashboardLawyer.consultations.client").replace("{{name}}", appt.user?.name || t("dashboardLawyer.consultations.unknown"))}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            {appt.status === 'CONFIRMED' && (
                              <button
                                onClick={() => router.push(`/consultation?role=lawyer&appointmentId=${appt.id}`)}
                                className="px-3 py-1.5 bg-[#1B3A6B] hover:bg-[#112549] text-white rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
                              >
                                🎥 Join Call
                              </button>
                            )}
                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                              appt.status === 'CONFIRMED' ? 'bg-green-50 text-green-700 border border-green-200' :
                              appt.status === 'REJECTED' ? 'bg-red-50 text-red-700 border border-red-200' :
                              'bg-yellow-50 text-yellow-700 border border-yellow-200'
                            }`}>
                              {appt.status === 'CONFIRMED' ? t("dashboardLawyer.consultations.confirmed") : 
                               appt.status === 'REJECTED' ? t("dashboardLawyer.consultations.rejected") : 
                               appt.status === 'PENDING' ? t("dashboardLawyer.consultations.pending") :
                               appt.status}
                            </span>
                            {appt.status !== 'CONFIRMED' && appt.status !== 'REJECTED' && (
                              <div className="flex gap-2">
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    try {
                                      const idToken = await auth.currentUser?.getIdToken();
                                      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/appointments/${appt.id}/status`, {
                                        method: 'PATCH',
                                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
                                        body: JSON.stringify({ status: 'CONFIRMED' })
                                      });
                                      if (res.ok) {
                                        setAppointments(prev => prev.map(a => a.id === appt.id ? { ...a, status: 'CONFIRMED' } : a));
                                      }
                                    } catch (err) {
                                      console.error(err);
                                    }
                                  }}
                                  className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors border border-green-200"
                                  title="Confirm"
                                >
                                  <CheckCircle size={16} />
                                </button>
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    try {
                                      const idToken = await auth.currentUser?.getIdToken();
                                      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/appointments/${appt.id}/status`, {
                                        method: 'PATCH',
                                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
                                        body: JSON.stringify({ status: 'REJECTED' })
                                      });
                                      if (res.ok) {
                                        setAppointments(prev => prev.map(a => a.id === appt.id ? { ...a, status: 'REJECTED' } : a));
                                      }
                                    } catch (err) {
                                      console.error(err);
                                    }
                                  }}
                                  className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                                  title="Reject"
                                >
                                  <XCircle size={16} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 bg-[#F9FAFC] border border-dashed border-gray-200 rounded-xl">
                      <div className="w-12 h-12 bg-blue-50 text-blue-400 rounded-full flex items-center justify-center mb-3">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-gray-900 font-bold text-sm">{t("dashboardLawyer.consultations.empty")}</p>
                      <p className="text-gray-400 text-xs mt-1">Scheduled appointments will appear here automatically.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Latest Sri Lankan Legal Updates Widget (Spans Main Left Area) */}
              <div className="w-full">
                <LegalNewsWidget />
              </div>

              {/* Priority Cases Card (Main Left Area) */}
              <div className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.06)] border border-gray-100 p-6 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{t("dashboardLawyer.priorityCases.title")}</h2>
                    <p className="text-xs text-gray-500 mt-0.5">High priority active client cases requiring immediate attention</p>
                  </div>
                  <span className="px-2.5 py-0.5 bg-orange-50 text-[#F97316] text-[10px] font-bold rounded-md uppercase tracking-wider border border-orange-200">Priority</span>
                </div>
                
                <div className="space-y-4">
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <div className="w-12 h-12 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mb-3">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-700 font-bold text-sm">{t("dashboardLawyer.priorityCases.empty")}</p>
                    <p className="text-gray-400 text-xs mt-1">High priority legal cases assigned to you will be pinned here.</p>
                  </div>
                </div>

                <button 
                  onClick={() => router.push('/lawyer-dashboard/calendar')}
                  className="w-full mt-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {t("dashboardLawyer.priorityCases.viewAll")}
                </button>
              </div>

              {/* Recent Activity Feed */}
              <div className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.06)] border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{t("dashboardLawyer.recentActivity.title")}</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Real-time workspace notifications and updates</p>
                  </div>
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-4">
                  {todayAppointments.length > 0 ? (
                    todayAppointments.map((appt, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                        <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                        <p className="text-xs text-gray-700 font-medium">
                          Appointment scheduled with <span className="font-bold text-gray-900">{appt.user?.name || "Client"}</span> at {new Date(appt.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className="w-12 h-12 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mb-3">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-gray-700 font-bold text-sm">{t("dashboardLawyer.recentActivity.emptyTitle")}</p>
                      <p className="text-gray-400 text-xs mt-1">{t("dashboardLawyer.recentActivity.emptyDesc")}</p>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Sidebar (Right - 1 Column) */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Quick Actions Card (Dark Navy Header) */}
              <div className="bg-gradient-to-br from-[#1B3A6B] to-[#112549] rounded-2xl p-6 text-white shadow-md">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#F97316]"></span>
                  {t("dashboardLawyer.quickActions.title")}
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => router.push('/lawyer-dashboard/calendar')}
                    className="bg-white/10 hover:bg-white/20 transition-all rounded-xl p-3 flex flex-col items-center justify-center gap-2 aspect-square border border-white/10 group"
                  >
                    <svg className="w-6 h-6 text-blue-200 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs font-semibold">{t("dashboardLawyer.quickActions.addTask") || "Calendar"}</span>
                  </button>
                  <button 
                    onClick={() => router.push('/lawyer-dashboard/messages')}
                    className="bg-white/10 hover:bg-white/20 transition-all rounded-xl p-3 flex flex-col items-center justify-center gap-2 aspect-square border border-white/10 group"
                  >
                    <svg className="w-6 h-6 text-blue-200 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    <span className="text-xs font-semibold">Messages</span>
                  </button>
                  <button 
                    onClick={handlePreviewReport}
                    className="bg-white/10 hover:bg-white/20 transition-all rounded-xl p-3 flex flex-col items-center justify-center gap-2 aspect-square border border-white/10 group"
                  >
                    <svg className="w-6 h-6 text-blue-200 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-xs font-semibold">{t("dashboardLawyer.quickActions.invoice") || "Reports"}</span>
                  </button>
                  <button 
                    onClick={() => router.push('/lawyer-dashboard/settings')}
                    className="bg-white/10 hover:bg-white/20 transition-all rounded-xl p-3 flex flex-col items-center justify-center gap-2 aspect-square border border-white/10 group"
                  >
                    <svg className="w-6 h-6 text-blue-200 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    </svg>
                    <span className="text-xs font-semibold">Settings</span>
                  </button>
                </div>
              </div>

              {/* Practitioner Status Card */}
              <div className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.06)] border border-gray-100 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900">Practice Status</h3>
                  <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[11px] font-bold border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Available for Bookings
                  </span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Your profile is active on the Sri Lanka legal directory. Clients can request consultations based on your Cal.com schedule.
                </p>
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
              initialStep={setupStep as 1 | 2 | 3}
              onComplete={async () => {
                setSetupStep(null);
                if (user) {
                  const updatedProfile = await fetchDbProfile(user);
                  if (updatedProfile?.lawyerProfile?.id) {
                    fetchAnalytics(user, updatedProfile.lawyerProfile.id);
                  }
                }
              }} 
            />
          </div>
        </div>
      )}
    </>
  );
}
