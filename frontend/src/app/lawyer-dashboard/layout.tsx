"use client";
import { useEffect, useState, ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useLanguage } from "../context/LanguageContext";
import { auth } from "../lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";

const content = {
  en: {
    dashboard: "Dashboard",
    calendar: "Calendar",
    cases: "Active Cases",
    messages: "Messages",
    settings: "Settings",
    searchPlaceholder: "Search case files, appointments...",
    counselor: "Counselor",
    advocate: "HIGH COURT ADVOCATE",
  },
  si: {
    dashboard: "උපකරණ පුවරුව",
    calendar: "දින දර්ශනය",
    cases: "ක්‍රියාකාරී නඩු",
    messages: "පණිවිඩ",
    settings: "සැකසුම්",
    searchPlaceholder: "නඩු ගොනු, හමුවීම් සොයන්න...",
    counselor: "උපදේශක",
    advocate: "මහාධිකරණ නීතිඥ",
  }
};

export default function LawyerDashboardLayout({ children }: { children: ReactNode }) {
  const { lang } = useLanguage();
  const tx = content[lang as keyof typeof content] || content.en;
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);
  const [dbUser, setDbUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <svg className="animate-spin h-10 w-10 text-[#1B3A6B]" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      </div>
    );
  }

  const lawyerProfile = dbUser?.lawyerProfile;
  const profilePic = lawyerProfile?.profilePicture;
  const userName = user?.displayName || "Perera";

  return (
    <div className="flex flex-col h-screen bg-[#f1f5f9] font-sans overflow-hidden">
      
      {/* Top Navbar */}
      <header className="h-14 flex items-center z-20 flex-shrink-0" style={{ borderBottom: '1px solid #e2e8f0' }}>
        
        {/* Logo Section — dark bg matching admin sidebar header */}
        <div className="flex items-center gap-3 w-64 h-full px-6 shrink-0" style={{ background: '#1e293b', borderBottom: '1px solid #334155' }}>
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center shrink-0" style={{ background: '#3b82f6' }}>
              <Image 
                src="https://res.cloudinary.com/dluwvqdaz/image/upload/v1775969976/Navy_Blue_JusticePal_Logo_with_Dove_Fusion_new_uhyjl0.png" 
                alt="JusticePal Logo" 
                fill
                className="object-cover"
              />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">JusticePal</span>
          </Link>
        </div>
        {/* Right area — white bg matching admin header */}
        <div className="flex-1 flex items-center justify-between h-full px-4 sm:px-6" style={{ background: '#fff' }}>

        {/* Search Bar */}
        <div className="flex-1 max-w-md hidden sm:block">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: '#f1f5f9', border: '1px solid #e2e8f0' }}>
            <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              placeholder={tx.searchPlaceholder}
              className="bg-transparent outline-none text-[13px] w-full placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 sm:gap-4 ml-2 sm:ml-4 shrink-0">
          <button className="relative p-1">
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="#64748b">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full" style={{ background: '#ef4444', border: '2px solid #fff' }} />
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="text-right leading-tight hidden sm:block">
                <p className="text-[13px] font-semibold text-slate-800">{tx.counselor} {userName}</p>
                <p className="text-[10px] font-bold tracking-wider" style={{ color: '#3b82f6' }}>{tx.advocate}</p>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-9 h-9 rounded-full overflow-hidden relative flex-shrink-0 flex items-center justify-center text-xs font-bold text-white" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1e3a8a 100%)' }}>
                  {profilePic ? (
                    <Image src={profilePic} alt={userName} fill className="object-cover" />
                  ) : (
                    userName.charAt(0)
                  )}
                </div>
                <svg className={`w-3.5 h-3.5 text-slate-400 hidden sm:block transition-transform ${isProfileDropdownOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {/* Profile Dropdown */}
            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-bold text-gray-900">{user?.displayName || "Perera"}</p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{user?.email}</p>
                </div>
                
                {lawyerProfile && (
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Profile Details</p>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        {lawyerProfile.phone || "No phone added"}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        {lawyerProfile.location || "No location added"}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        <span className="truncate">{lawyerProfile.specialization?.join(", ") || "No specialization"}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-2">
                  <Link 
                    href="/lawyer-dashboard/settings"
                    onClick={() => setIsProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Settings
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-1"
                  >
                    <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        </div>
      </header>

      {/* Main Layout Area */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Sidebar */}
        <aside className="w-64 flex flex-col justify-between py-6 flex-shrink-0" style={{ background: '#1e293b' }}>
          <nav className="space-y-1 px-4">
            {[
              { name: tx.dashboard, icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z", active: pathname === "/lawyer-dashboard", href: "/lawyer-dashboard" },
              { name: tx.calendar, icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", active: pathname === "/lawyer-dashboard/calendar", href: "/lawyer-dashboard/calendar" },
              { name: tx.cases, icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", active: pathname === "/lawyer-dashboard/cases", href: "/lawyer-dashboard/cases" },
              { name: tx.messages, icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z", active: pathname === "/lawyer-dashboard/messages", href: "/lawyer-dashboard/messages" },
            ].map((item, idx) => (
              <Link 
                key={idx} 
                href={item.href}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                style={{
                  background: item.active ? '#3b82f6' : 'transparent',
                  color: item.active ? '#fff' : '#94a3b8',
                }}
              >
                <svg className="w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: item.active ? '#fff' : '#64748b' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                {item.name}
              </Link>
            ))}
          </nav>
          
          <div className="px-4" style={{ borderTop: '1px solid #334155', paddingTop: '1rem' }}>
            <Link 
              href="/lawyer-dashboard/settings"
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
              style={{ color: pathname === '/lawyer-dashboard/settings' ? '#fff' : '#94a3b8', background: pathname === '/lawyer-dashboard/settings' ? '#3b82f6' : 'transparent' }}
            >
              <svg className="w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: pathname === '/lawyer-dashboard/settings' ? '#fff' : '#64748b' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {tx.settings}
            </Link>
          </div>
        </aside>

        {/* Main Content Rendered Here */}
        {children}
        
      </div>
    </div>
  );
}
