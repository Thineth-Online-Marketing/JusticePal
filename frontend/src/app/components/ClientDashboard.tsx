"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ClientNavbar from "./ClientNavbar";
import Footer from "./Footer";
import LegalNewsWidget from "./LegalNewsWidget";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "../hooks/useTranslation";
import { 
  Scale, FileText, DollarSign, Clock, 
  Calendar as CalendarIcon, Video, CheckCircle, 
  XCircle, FileSignature, MessageSquare, 
  CalendarCheck, Headset 
} from "lucide-react";
import Image from "next/image";
import { io, Socket } from "socket.io-client";

export default function ClientDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const [roleLoading, setRoleLoading] = useState(true);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifLoading, setNotifLoading] = useState(true);
  const [upcomingAppointment, setUpcomingAppointment] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    if (authLoading) return;

    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!user || !isLoggedIn) {
      localStorage.removeItem("isLoggedIn");
      router.replace("/login");
      return;
    }

    const verifyClientRole = async () => {
      try {
        const idToken = await user.getIdToken();
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/users/profile`,
          {
            headers: { Authorization: `Bearer ${idToken}` },
          }
        );
        if (res.ok) {
          const data = await res.json();
          if (data.role === "client") {
            setRoleLoading(false);
            // Auto-fix display name if it got stuck as Counselor from testing
            if (user.displayName && user.displayName.includes("Counselor")) {
              import("firebase/auth").then(({ updateProfile }) => {
                updateProfile(user, { displayName: user.displayName?.replace("Counselor ", "").replace("Counselor", "") || "Client" });
              });
            }
          } else if (data.role === "lawyer") {
            router.replace("/lawyer-dashboard");
          } else if (data.role === "admin") {
            router.replace("/admin");
          } else {
            router.replace("/login");
          }
        } else {
          router.replace("/login");
        }
      } catch (err) {
        console.error("Failed to verify client role", err);
        router.replace("/login");
      }
    };

    verifyClientRole();
  }, [user, authLoading, router]);

  useEffect(() => {
    if (roleLoading || !user) return;
    const fetchNotifs = async () => {
      try {
        const idToken = await user.getIdToken();
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/notifications`,
          {
            headers: { Authorization: `Bearer ${idToken}` },
          }
        );
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard notifications", err);
      } finally {
        setNotifLoading(false);
      }
    };
    fetchNotifs();
  }, [roleLoading, user]);

  const fetchClientAnalytics = async () => {
    if (!user) return;
    try {
      const idToken = await user.getIdToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/clients/analytics`,
        { headers: { Authorization: `Bearer ${idToken}` } }
      );
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
        if (data.upcomingAppointments && data.upcomingAppointments.length > 0) {
          setUpcomingAppointment(data.upcomingAppointments[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch analytics", err);
    } finally {
      setAppointmentsLoading(false);
    }
  };

  useEffect(() => {
    if (roleLoading || !user) return;
    
    const fetchAppointments = async () => {
      try {
        const idToken = await user.getIdToken();
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/appointments`,
          { headers: { Authorization: `Bearer ${idToken}` } }
        );
        if (res.ok) {
          const data = await res.json();
          setAppointments(data);
          setAppointmentsLoading(false);
        }
      } catch (err) {
        console.error("Failed to fetch appointments", err);
        setAppointmentsLoading(false);
      }
    };

    fetchClientAnalytics();
    fetchAppointments();

    let socket: Socket;
    user.getIdToken().then(token => {
      socket = io(process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000", {
        auth: { token },
        transports: ["websocket", "polling"],
      });

      socket.on("dashboard_update", (data) => {
        if (data.type === "booking_created" || data.type === "booking_updated") {
          fetchClientAnalytics();
          fetchAppointments();
        }
      });
    });

    return () => {
      socket?.disconnect();
    };
  }, [roleLoading, user]);

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <svg className="animate-spin h-10 w-10 text-[#1B3A6B]" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      </div>
    );
  }

  return (
    <>
      <main className="max-w-[1400px] w-full mx-auto px-4 md:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-[#1B3A6B] tracking-tight">{t("dashboardClient.title")}</h1>
          <p className="text-gray-500 mt-2 text-lg">
            {t("dashboardClient.welcome").replace("{{name}}", user?.displayName || "Alex")}
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title={t("dashboardClient.stats.activeCases")} value={analytics?.activeCases || "0"} icon={<Scale className="w-5 h-5 text-blue-600" />} />
          <StatCard title={t("dashboardClient.stats.totalConsultations")} value={analytics?.totalConsultations || "0"} icon={<FileText className="w-5 h-5 text-orange-500" />} />
          <StatCard title={t("dashboardClient.stats.totalSpent")} value={`$${analytics?.totalSpent || 0}`} icon={<DollarSign className="w-5 h-5 text-indigo-600" />} />
          <StatCard title={t("dashboardClient.stats.totalDocs")} value={analytics?.totalDocs || "0"} icon={<Clock className="w-5 h-5 text-green-500" />} />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">{t("dashboardClient.quickActions.title")}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              onClick={() => router.push("/find-lawyer")}
              className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all text-left flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#1B3A6B] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">{t("dashboardClient.quickActions.findLawyer")}</p>
                <p className="text-xs text-gray-400">{t("dashboardClient.quickActions.findLawyerDesc")}</p>
              </div>
            </button>
            
            <button 
              onClick={() => router.push("/chat-ai")}
              className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all text-left flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-lg bg-orange-50 text-[#F97316] flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">{t("dashboardClient.quickActions.aiChat")}</p>
                <p className="text-xs text-gray-400">{t("dashboardClient.quickActions.aiChatDesc")}</p>
              </div>
            </button>

            <button 
              onClick={() => router.push("/document-drafting")}
              className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all text-left flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileSignature className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">{t("dashboardClient.quickActions.draftDoc")}</p>
                <p className="text-xs text-gray-400">{t("dashboardClient.quickActions.draftDocDesc")}</p>
              </div>
            </button>

            <button 
              onClick={() => router.push("/consultation?role=client")}
              className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all text-left flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">{t("dashboardClient.quickActions.videoRoom")}</p>
                <p className="text-xs text-gray-400">{t("dashboardClient.quickActions.videoRoomDesc")}</p>
              </div>
            </button>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column (2/3 width) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Upcoming Appointments */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">{t("dashboardClient.appointments.title")}</h2>
                <div className="flex items-center gap-4">
                  <button onClick={() => router.push('/client-dashboard/appointments')} className="text-sm font-bold text-[#1B3A6B] hover:text-blue-800 transition-colors">View All Active</button>
                  <button onClick={() => router.push('/client-dashboard/calendar')} className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">{t("dashboardClient.appointments.viewCalendar")}</button>
                </div>
              </div>
              <div className="space-y-4">
                {appointments.length === 0 && !appointmentsLoading ? (
                  <p className="text-gray-500 text-sm">{t("dashboardClient.appointments.empty")}</p>
                ) : (
                  appointments.map((appt) => (
                    <div key={appt.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row gap-6 items-start">
                      <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 relative">
                        <Image src="https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&q=80&w=400&h=400" alt="Lawyer" fill className="object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                            appt.status === 'CONFIRMED' ? 'bg-green-50 text-green-700' :
                            appt.status === 'REJECTED' ? 'bg-red-50 text-red-700' :
                            'bg-yellow-50 text-yellow-700'
                          }`}>
                            {appt.status || 'PENDING'}
                          </span>
                          <span className="flex items-center text-sm text-gray-500 font-medium">
                            <CalendarIcon className="w-4 h-4 mr-1" /> 
                            {new Date(appt.scheduledAt).toLocaleString()}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {t("dashboardClient.appointments.consultationWith").replace("{{name}}", appt.lawyer?.user?.name || "Lawyer")}
                        </h3>
                        <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                          {appt.caseDescription || t("dashboardClient.appointments.noNotes")}
                        </p>
                        <div className="flex flex-wrap gap-3">
                          <button 
                            onClick={() => router.push(`/consultation?role=client&appointmentId=${appt.id}`)}
                            disabled={appt.status !== 'CONFIRMED'}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors shadow-sm ${
                              appt.status === 'CONFIRMED' 
                                ? 'bg-[#1B3A6B] hover:bg-[#112549] text-white'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            <Video className="w-4 h-4" />
                            {t("dashboardClient.appointments.joinVideo")}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Active Cases */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">{t("dashboardClient.activeCases.title")}</h2>
                <div className="flex items-center gap-4">
                  <button onClick={() => router.push('/client-dashboard/documents')} className="text-sm font-bold text-[#1B3A6B] hover:text-blue-800 transition-colors">Case Documents</button>
                  <a href="#" className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">{t("dashboardClient.activeCases.seeAll")}</a>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {!analytics?.activeCasesList || analytics.activeCasesList.length === 0 ? (
                  <p className="text-gray-500 text-sm">{t("dashboardClient.activeCases.empty")}</p>
                ) : (
                  analytics.activeCasesList.map((appt: any) => (
                    <CaseCard 
                      key={appt.id}
                      caseId={`CASE #${appt.id.substring(0,6).toUpperCase()}`}
                      title={appt.caseDescription || t("dashboardClient.appointments.consultationWith").replace("{{name}}", appt.lawyer?.user?.name || "Lawyer")}
                      status={appt.status === 'confirmed' ? 'ok' : 'pending'}
                      progress={appt.status === 'confirmed' ? 100 : 50}
                      avatars={[
                        appt.lawyer?.user?.profilePicture || "https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=100&h=100",
                      ]}
                    />
                  ))
                )}
              </div>
            </section>

            {/* Legal News Widget */}
            <section className="w-full">
              <LegalNewsWidget />
            </section>
            
          </div>

          {/* Right Column (1/3 width) */}
          <div className="space-y-8">
            
            {/* Recent Notifications */}
            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-4">{t("dashboardClient.notifications.title")}</h2>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
                <div className="flex flex-col">
                  {notifLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-5 h-5 border-2 border-gray-200 border-t-[#1B3A6B] rounded-full animate-spin" />
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      <p className="text-sm font-semibold">{t("dashboardClient.notifications.emptyTitle")}</p>
                      <p className="text-xs text-gray-400 mt-1">{t("dashboardClient.notifications.emptyDesc")}</p>
                    </div>
                  ) : (
                    notifications.slice(0, 5).map((notif, idx) => {
                      const { icon, bg } = getDashboardNotificationIcon(notif.type);
                      
                      const diffMs = new Date().getTime() - new Date(notif.createdAt).getTime();
                      const diffSec = Math.floor(diffMs / 1000);
                      const diffMin = Math.floor(diffSec / 60);
                      const diffHr = Math.floor(diffMin / 60);
                      const diffDays = Math.floor(diffHr / 24);
                      
                      let timeAgo = new Date(notif.createdAt).toLocaleDateString();
                      if (diffSec < 60) timeAgo = t("dashboardClient.time.justNow");
                      else if (diffMin < 60) timeAgo = t("dashboardClient.time.mAgo").replace("{{time}}", diffMin.toString());
                      else if (diffHr < 24) timeAgo = t("dashboardClient.time.hAgo").replace("{{time}}", diffHr.toString());
                      else if (diffDays < 7) timeAgo = t("dashboardClient.time.dAgo").replace("{{time}}", diffDays.toString());

                      return (
                        <React.Fragment key={notif.id}>
                          <NotificationItem 
                            icon={icon}
                            iconBg={bg}
                            title={notif.title}
                            message={notif.message}
                            time={timeAgo}
                          />
                          {idx < notifications.slice(0, 5).length - 1 && (
                            <hr className="border-gray-50 mx-4" />
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </div>
                <div className="p-4 pt-2 mt-2">
                  <button className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 text-sm font-semibold text-gray-700 rounded-xl transition-colors">
                    {t("dashboardClient.notifications.viewAll")}
                  </button>
                </div>
              </div>
            </section>

            {/* Need Assistance CTA */}
            <section className="bg-[#1B3A6B] rounded-2xl shadow-lg p-8 text-center text-white relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
              <div className="w-16 h-16 mx-auto bg-white/10 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm border border-white/10">
                <Headset className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 relative z-10">{t("dashboardClient.assistance.title")}</h3>
              <p className="text-blue-100 text-sm mb-6 leading-relaxed relative z-10">
                {t("dashboardClient.assistance.desc")}
              </p>
              <button className="w-full bg-white text-[#1B3A6B] hover:bg-gray-50 py-3 rounded-xl font-bold text-sm shadow-md transition-all active:scale-[0.98] relative z-10">
                {t("dashboardClient.assistance.btn")}
              </button>
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

// Subcomponents

function StatCard({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col justify-between group cursor-pointer">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-gray-500">{title}</span>
        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:scale-110 transition-transform">
          {icon}
        </div>
      </div>
      <div className="text-3xl font-extrabold text-gray-900">{value}</div>
    </div>
  );
}

function CaseCard({ caseId, title, status, progress, avatars, extraCount }: { caseId: string, title: string, status: 'ok' | 'pending', progress: number, avatars: string[], extraCount?: number }) {
  const isOk = status === 'ok';
  const { t } = useTranslation();
  
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-200 transition-colors flex flex-col h-full group cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-[10px] font-bold tracking-wider text-gray-400 mb-1 uppercase">{caseId}</p>
          <h3 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-blue-700 transition-colors">{title}</h3>
        </div>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isOk ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-500'}`}>
          {isOk ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
          )}
        </div>
      </div>
      
      <div className="mt-auto pt-4">
        <div className="flex items-center justify-between text-sm font-semibold mb-2">
          <span className="text-gray-500">{t("dashboardClient.activeCases.progress")}</span>
          <span className="text-gray-900">{progress}%</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-6">
          <div className={`h-full rounded-full transition-all duration-1000 ${isOk ? 'bg-[#1B3A6B]' : 'bg-orange-500'}`} style={{ width: `${progress}%` }}></div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center -space-x-2">
            {avatars.map((avatar, idx) => (
              <div key={idx} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden relative">
                <Image src={avatar} alt="Lawyer" fill className="object-cover" />
              </div>
            ))}
            {extraCount && (
              <div className="w-8 h-8 rounded-full border-2 border-white bg-[#1B3A6B] text-white flex items-center justify-center text-[10px] font-bold relative z-10">
                +{extraCount}
              </div>
            )}
          </div>
          <button className="text-sm font-bold text-[#1B3A6B] hover:text-blue-800 transition-colors">
            {t("dashboardClient.activeCases.details")}
          </button>
        </div>
      </div>
    </div>
  );
}

function NotificationItem({ icon, iconBg, title, message, time }: { icon: React.ReactNode, iconBg: string, title: string, message: string, time: string }) {
  return (
    <div className="p-4 hover:bg-gray-50 transition-colors flex gap-4 items-start cursor-pointer group">
      <div className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{title}</h4>
        <p className="text-xs text-gray-500 mt-1 mb-2 leading-relaxed">{message}</p>
        <span className="text-[10px] font-semibold text-gray-400">{time}</span>
      </div>
    </div>
  );
}

// Helper utilities for dashboard notifications
function getDashboardNotificationIcon(type: string) {
  switch (type) {
    case "booking":
      return { icon: <CalendarCheck className="w-5 h-5 text-blue-600" />, bg: "bg-blue-50" };
    case "payment":
      return { icon: <DollarSign className="w-5 h-5 text-green-600" />, bg: "bg-green-50" };
    case "warning":
      return { icon: <Clock className="w-5 h-5 text-orange-600" />, bg: "bg-orange-50" };
    default:
      return { icon: <FileSignature className="w-5 h-5 text-indigo-600" />, bg: "bg-indigo-50" };
  }
}

function timeAgoLocal(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);

  // We should pass in the translated versions from component level realistically, but 
  // since this is a pure function we'd need to extract translation logic, or just 
  // return hardcoded strings for now or map it in the caller. Let's just fix it 
  // quickly by importing the translation hook manually inside the function.
  // Actually, hooks can't be called in regular functions. So I'll just change timeAgoLocal signature.
  return diffSec.toString();
}
