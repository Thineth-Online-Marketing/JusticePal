"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../context/LanguageContext";
import { auth } from "../lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
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

  const fetchDbProfile = async (currentUser: User) => {
    try {
      const idToken = await currentUser.getIdToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/users/profile`, {
        headers: { Authorization: `Bearer ${idToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDbUser(data);
      }
    } catch (error) {
      console.error("Failed to fetch DB user", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser: User | null) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchDbProfile(currentUser);
        setLoading(false);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-transparent">
        <svg className="animate-spin h-10 w-10 text-[#1B3A6B]" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      </div>
    );
  }

  // Determine profile strength and task completion
  const lawyerProfile = dbUser?.lawyerProfile;
  const isVerified = lawyerProfile?.isVerified;
  const hasBioData = lawyerProfile && lawyerProfile.specialization?.length > 0 && !!lawyerProfile.location && !!lawyerProfile.bio;
  const hasVerifiedPhone = !!lawyerProfile?.phoneVerified;
  const hasIdUploaded = lawyerProfile?.idPhotos?.length > 0;
  
  const showPendingApproval = dbUser?.role === "lawyer" && !isVerified && lawyerProfile?.profileCompleted;
  const showBioTask = dbUser?.role === "lawyer" && isVerified && !hasBioData;
  const showPhoneTask = dbUser?.role === "lawyer" && !isVerified && !hasVerifiedPhone && !showPendingApproval;
  const showIdTask = dbUser?.role === "lawyer" && !isVerified && !hasIdUploaded && !showPendingApproval;

  return (
    <>
      <main className="flex-1 overflow-y-auto p-8 relative h-full">
        {/* Action Task Cards Container */}
        <div className="max-w-6xl mx-auto space-y-4 mb-8">
          
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
                  {(!hasBioData) 
                    ? "Complete your Bio Data to unlock this step." 
                    : "Upload your official Lawyer ID to get verified by our administration team."}
                </p>
              </div>
              <button 
                onClick={() => setSetupStep(3)} 
                disabled={!hasBioData}
                className="mt-3 md:mt-0 px-5 py-2 bg-[#1B3A6B] text-white rounded-lg text-xs font-medium hover:bg-blue-800 transition-colors whitespace-nowrap disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
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

        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Top Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Upcoming Appointments */}
            <div className="bg-white rounded-xl p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">{tx.upcomingAppointments}</h3>
                  <p className="text-3xl font-bold text-gray-900">8</p>
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
                {tx.fromLastWeek}
              </p>
            </div>

            {/* Active Cases */}
            <div className="bg-white rounded-xl p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">{tx.activeCases}</h3>
                  <p className="text-3xl font-bold text-gray-900">12</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-gray-50 text-gray-600 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <p className="text-gray-500 text-xs font-medium mt-4">
                {tx.stableWorkload}
              </p>
            </div>

            {/* New Requests */}
            <div className="bg-white rounded-xl p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">{tx.newRequests}</h3>
                  <p className="text-3xl font-bold text-gray-900">3</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
              </div>
              <p className="text-orange-500 text-xs font-semibold mt-4">
                {tx.awaitingReview}
              </p>
            </div>

            {/* Unread Messages */}
            <div className="bg-white rounded-xl p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">{tx.unreadMessages}</h3>
                  <p className="text-3xl font-bold text-gray-900">5</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <p className="text-purple-600 text-xs font-semibold mt-4">
                {tx.urgentPriority}
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
                  {/* Schedule Item 1 */}
                  <div 
                    onClick={() => router.push("/consultation?role=lawyer")}
                    className="flex gap-4 p-4 rounded-xl bg-[#F9FAFC] border border-gray-100 items-center cursor-pointer hover:bg-gray-100/80 transition-colors group"
                  >
                    <div className="w-20 text-right flex-shrink-0">
                      <p className="font-bold text-gray-900 text-sm">09:00 AM</p>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">60 min</p>
                    </div>
                    <div className="w-1 rounded-full bg-blue-500 h-12"></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm truncate group-hover:text-[#1B3A6B] transition-colors">Client Consultation: Sarah Chen</p>
                      <p className="text-xs text-gray-500 font-medium mt-1 truncate">Virtual Meeting • Civil Dispute #4421</p>
                    </div>
                    <div className="w-8 h-8 rounded-lg text-gray-400 group-hover:text-[#1B3A6B] group-hover:bg-blue-50 flex items-center justify-center flex-shrink-0 transition-all">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>

                  {/* Schedule Item 2 */}
                  <div className="flex gap-4 p-4 rounded-xl bg-[#F9FAFC] border border-gray-100 items-center">
                    <div className="w-20 text-right flex-shrink-0">
                      <p className="font-bold text-gray-900 text-sm">11:30 AM</p>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">90 min</p>
                    </div>
                    <div className="w-1 rounded-full bg-blue-500 h-12"></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm truncate">Court Hearing: Case #2944</p>
                      <p className="text-xs text-gray-500 font-medium mt-1 truncate">District Court Room 4B • Criminal Defense</p>
                    </div>
                    <div className="w-8 h-8 rounded-lg text-gray-400 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                      </svg>
                    </div>
                  </div>

                  {/* Schedule Item 3 */}
                  <div className="flex gap-4 p-4 rounded-xl bg-[#F9FAFC] border border-gray-100 items-center">
                    <div className="w-20 text-right flex-shrink-0">
                      <p className="font-bold text-gray-900 text-sm">03:00 PM</p>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">90 min</p>
                    </div>
                    <div className="w-1 rounded-full bg-orange-400 h-12"></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm truncate">Document Review: Estate Planning</p>
                      <p className="text-xs text-gray-500 font-medium mt-1 truncate">Office • Private Estate #102</p>
                    </div>
                    <div className="w-8 h-8 rounded-lg text-gray-400 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
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
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900"><span className="font-bold">New Document Uploaded:</span> Affidavit_Signed.pdf by John Doe</p>
                      <p className="text-xs text-gray-500 mt-1">2 hours ago • Case #4412</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900"><span className="font-bold">Case Status Changed:</span> Case #2944 marked as <span className="text-emerald-600 font-bold">In Progress</span></p>
                      <p className="text-xs text-gray-500 mt-1">5 hours ago</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900"><span className="font-bold">New Message:</span> From Opposing Counsel regarding Case #1105</p>
                      <p className="text-xs text-gray-500 mt-1">Yesterday • 04:45 PM</p>
                    </div>
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
                  {/* Priority Case 1 */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold text-red-500 tracking-wider uppercase">{tx.urgent}</span>
                      <span className="text-[10px] text-gray-400 font-medium">#4412</span>
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 mb-3">State vs. Harrison</h3>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full mb-2 overflow-hidden">
                      <div className="bg-red-500 h-full rounded-full" style={{ width: '75%' }}></div>
                    </div>
                    <p className="text-[10px] text-gray-500 font-medium">75% Complete • Trial Date: Oct 24</p>
                  </div>

                  <div className="w-full h-px bg-gray-100"></div>

                  {/* Priority Case 2 */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold text-blue-500 tracking-wider uppercase">{tx.onTrack}</span>
                      <span className="text-[10px] text-gray-400 font-medium">#3190</span>
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 mb-3">Miller Property Trust</h3>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full mb-2 overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full" style={{ width: '30%' }}></div>
                    </div>
                    <p className="text-[10px] text-gray-500 font-medium">30% Complete • Reviewing Docs</p>
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
