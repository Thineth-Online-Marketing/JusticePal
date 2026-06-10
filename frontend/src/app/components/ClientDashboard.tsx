"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ClientNavbar from "./ClientNavbar";
import Footer from "./Footer";
import { useAuth } from "../context/AuthContext";
import { 
  Scale, FileText, Clock, DollarSign, 
  Video, Calendar as CalendarIcon, FileSignature, 
  MessageSquare, CalendarCheck, Headset
} from "lucide-react";
import Image from "next/image";

export default function ClientDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [roleLoading, setRoleLoading] = useState(true);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");

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
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      <ClientNavbar />
      
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-6 py-8 mt-[72px]">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-[#1B3A6B] tracking-tight">Client Dashboard</h1>
          <p className="text-gray-500 mt-2 text-lg">
            Welcome back, {user?.displayName || "Alex"}. Here is an update on your legal portfolio.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Active Cases" value="3" icon={<Scale className="w-5 h-5 text-blue-600" />} />
          <StatCard title="Pending Docs" value="5" icon={<FileText className="w-5 h-5 text-orange-500" />} />
          <StatCard title="Hours Billed" value="12.5" icon={<Clock className="w-5 h-5 text-green-500" />} />
          <StatCard title="Total Spent" value="$4,250" icon={<DollarSign className="w-5 h-5 text-indigo-600" />} />
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column (2/3 width) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Upcoming Appointments */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Upcoming Appointments</h2>
                <a href="#" className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">View Calendar</a>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row gap-6 items-start">
                <div className="w-32 h-32 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 relative">
                  {/* Placeholder for lawyer portrait */}
                  <Image src="https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&q=80&w=400&h=400" alt="Sarah Jenkins" fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">Family Law</span>
                    <span className="flex items-center text-sm text-gray-500 font-medium">
                      <CalendarIcon className="w-4 h-4 mr-1" /> Tomorrow, 10:00 AM
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Consultation with Sarah Jenkins</h3>
                  <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                    Discussion regarding property settlement and final mediation steps.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button className="flex items-center gap-2 bg-[#1B3A6B] hover:bg-[#112549] text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors shadow-sm">
                      <Video className="w-4 h-4" />
                      Join Video Call
                    </button>
                    <button className="bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors">
                      Reschedule
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Active Cases */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Active Cases</h2>
                <a href="#" className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">See All Cases</a>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CaseCard 
                  caseId="CASE #JP-9821"
                  title="Johnson Estate Dispute"
                  status="ok"
                  progress={75}
                  avatars={[
                    "https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=100&h=100",
                    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&h=100"
                  ]}
                  extraCount={2}
                />
                <CaseCard 
                  caseId="CASE #JP-1044"
                  title="IP Infringement - TechCo"
                  status="pending"
                  progress={30}
                  avatars={[
                    "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=100&h=100",
                    "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=100&h=100",
                    "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=100&h=100"
                  ]}
                />
              </div>
            </section>
            
          </div>

          {/* Right Column (1/3 width) */}
          <div className="space-y-8">
            
            {/* Recent Notifications */}
            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Notifications</h2>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
                <div className="flex flex-col">
                  <NotificationItem 
                    icon={<FileSignature className="w-5 h-5 text-blue-600" />}
                    iconBg="bg-blue-50"
                    title="Document Ready for Signature"
                    message='"Settlement_Draft_V2.pdf" is ready for your e-signature.'
                    time="2 hours ago"
                  />
                  <hr className="border-gray-50 mx-4" />
                  <NotificationItem 
                    icon={<MessageSquare className="w-5 h-5 text-green-600" />}
                    iconBg="bg-green-50"
                    title="New Message from Sarah"
                    message='"I&apos;ve uploaded the evidence photos for tomorrow&apos;s meet."'
                    time="5 hours ago"
                  />
                  <hr className="border-gray-50 mx-4" />
                  <NotificationItem 
                    icon={<CalendarCheck className="w-5 h-5 text-orange-600" />}
                    iconBg="bg-orange-50"
                    title="Meeting Confirmed"
                    message="Court hearing scheduled for July 15, 2024."
                    time="1 day ago"
                  />
                </div>
                <div className="p-4 pt-2 mt-2">
                  <button className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 text-sm font-semibold text-gray-700 rounded-xl transition-colors">
                    View All Notifications
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
              <h3 className="text-xl font-bold mb-3 relative z-10">Need assistance?</h3>
              <p className="text-blue-100 text-sm mb-6 leading-relaxed relative z-10">
                Our legal support team is available 24/7 to answer your questions.
              </p>
              <button className="w-full bg-white text-[#1B3A6B] hover:bg-gray-50 py-3 rounded-xl font-bold text-sm shadow-md transition-all active:scale-[0.98] relative z-10">
                Start Live Chat
              </button>
            </section>
            
          </div>
        </div>
      </main>

      <Footer />
    </div>
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
          <span className="text-gray-500">Progress</span>
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
            Details
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
