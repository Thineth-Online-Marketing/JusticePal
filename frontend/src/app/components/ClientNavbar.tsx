"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { Bell, LogOut } from "lucide-react";
import DashboardProfileDropdown from "./DashboardProfileDropdown";

export default function ClientNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { lang, toggle } = useLanguage();
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const t = {
    en: { dashboard: "Dashboard", findLawyer: "Find Lawyer", chatAi: "Chat AI", userGuide: "User Guide", logout: "Logout" },
    si: { dashboard: "උපකරණ පුවරුව", findLawyer: "නීතිඥයෙකු සොයන්න", chatAi: "Chat AI", userGuide: "පරිශීලක මාර්ගෝපදේශය", logout: "ඉවත්වන්න" },
  };

  const tx = t[lang as keyof typeof t] || t.en;

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-300">
      <div className="max-w-[1400px] mx-auto px-6 h-[72px] flex items-center justify-between">
        
        {/* Logo and Brand */}
        <Link href="/" className="flex items-center gap-3 text-blue-900 hover:text-blue-700 transition-colors duration-200">
          <div className="relative w-10 h-10 rounded-full overflow-hidden shadow-sm flex items-center justify-center bg-[#1B3A6B]">
            <Image
              src="https://res.cloudinary.com/dluwvqdaz/image/upload/v1775969976/Navy_Blue_JusticePal_Logo_with_Dove_Fusion_new_uhyjl0.png"
              alt="JusticePal Logo"
              fill
              className="object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <svg className="w-6 h-6 absolute -z-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-extrabold text-xl tracking-tight text-[#1B3A6B]">JusticePal</span>
            <span className="text-[10px] font-bold tracking-[0.2em] text-[#3b6fd4] uppercase">Sri Lanka</span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/client-dashboard" className={`relative inline-flex justify-center min-w-[90px] text-sm transition-colors duration-200 whitespace-nowrap ${pathname === '/client-dashboard' ? 'text-[#1B3A6B] font-bold after:content-[""] after:absolute after:-bottom-2 after:left-1/2 after:-translate-x-1/2 after:w-6 after:h-[3px] after:bg-[#1B3A6B] after:rounded-full' : 'font-medium text-gray-500 hover:text-[#1B3A6B]'}`}>
            {tx.dashboard}
          </Link>
          <Link href="/find-lawyer" className={`relative inline-flex justify-center min-w-[90px] text-sm transition-colors duration-200 whitespace-nowrap ${pathname.startsWith('/find-lawyer') ? 'text-[#1B3A6B] font-bold after:content-[""] after:absolute after:-bottom-2 after:left-1/2 after:-translate-x-1/2 after:w-6 after:h-[3px] after:bg-[#1B3A6B] after:rounded-full' : 'font-medium text-gray-500 hover:text-[#1B3A6B]'}`}>
            {tx.findLawyer}
          </Link>
          <Link href="/chat-ai" className={`relative inline-flex justify-center min-w-[70px] text-sm transition-colors duration-200 whitespace-nowrap ${pathname.startsWith('/chat-ai') ? 'text-[#1B3A6B] font-bold after:content-[""] after:absolute after:-bottom-2 after:left-1/2 after:-translate-x-1/2 after:w-6 after:h-[3px] after:bg-[#1B3A6B] after:rounded-full' : 'font-medium text-gray-500 hover:text-[#1B3A6B]'}`}>
            {tx.chatAi}
          </Link>
          <Link href="/guide" className={`relative inline-flex justify-center min-w-[90px] text-sm transition-colors duration-200 whitespace-nowrap ${pathname.startsWith('/guide') ? 'text-[#1B3A6B] font-bold after:content-[""] after:absolute after:-bottom-2 after:left-1/2 after:-translate-x-1/2 after:w-6 after:h-[3px] after:bg-[#1B3A6B] after:rounded-full' : 'font-medium text-gray-500 hover:text-[#1B3A6B]'}`}>
            {tx.userGuide}
          </Link>
        </div>

        {/* Right Side Items */}
        <div className="hidden md:flex items-center gap-4">
          
          {/* Language Toggle */}
          <button
            onClick={toggle}
            aria-label="Toggle language"
            className="flex items-center justify-center gap-1.5 px-4 h-[38px] rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition-all duration-200"
          >
            <svg className="w-4 h-4 text-[#1B3A6B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 8l6 6" />
              <path d="M4 14l6-6 2-3" />
              <path d="M2 5h12" />
              <path d="M7 2h1" />
              <path d="M22 22l-5-10-5 10" />
              <path d="M14 18h6" />
            </svg>
            <span className={`text-xs ${lang === 'en' ? 'font-bold text-gray-900' : 'font-semibold text-gray-400'}`}>EN</span>
            <span className="text-gray-300 text-xs">|</span>
            <span className={`text-xs ${lang === 'si' ? 'font-bold text-gray-900' : 'font-semibold text-gray-400'}`}>සිංහල</span>
          </button>

          {/* Notification Bell */}
          <button className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-100 transition-colors">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          {/* User Profile */}
          <DashboardProfileDropdown />
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col justify-center items-center w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors gap-1.5 focus:outline-none"
        >
          <span className={`block w-5 h-0.5 bg-gray-800 transition-transform ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-5 h-0.5 bg-gray-800 transition-opacity ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-0.5 bg-gray-800 transition-transform ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ${menuOpen ? 'max-h-96 border-t border-gray-100 bg-white shadow-xl' : 'max-h-0'}`}>
        <div className="flex flex-col p-4 space-y-2">
          <Link href="/client-dashboard" onClick={() => setMenuOpen(false)} className={`px-4 py-3 text-base rounded-lg transition-colors ${pathname === '/client-dashboard' ? 'text-blue-900 bg-blue-50 font-bold' : 'font-medium text-gray-700 hover:bg-gray-50'}`}>
            {tx.dashboard}
          </Link>
          <Link href="/find-lawyer" onClick={() => setMenuOpen(false)} className={`px-4 py-3 text-base rounded-lg transition-colors ${pathname.startsWith('/find-lawyer') ? 'text-blue-900 bg-blue-50 font-bold' : 'font-medium text-gray-700 hover:bg-gray-50'}`}>
            {tx.findLawyer}
          </Link>
          <Link href="/chat-ai" onClick={() => setMenuOpen(false)} className={`px-4 py-3 text-base rounded-lg transition-colors ${pathname.startsWith('/chat-ai') ? 'text-blue-900 bg-blue-50 font-bold' : 'font-medium text-gray-700 hover:bg-gray-50'}`}>
            {tx.chatAi}
          </Link>
          <Link href="/guide" onClick={() => setMenuOpen(false)} className={`px-4 py-3 text-base rounded-lg transition-colors ${pathname.startsWith('/guide') ? 'text-blue-900 bg-blue-50 font-bold' : 'font-medium text-gray-700 hover:bg-gray-50'}`}>
            {tx.userGuide}
          </Link>

          <div className="h-px bg-gray-100 my-2" />
          
          {/* Mobile Actions */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-4 py-2">
              <button onClick={toggle} className="flex items-center gap-2 text-sm font-medium text-gray-600 border border-gray-200 px-3 py-1.5 rounded-full">
                <span className={lang === "en" ? "font-bold text-gray-900" : ""}>EN</span> 
                / 
                <span className={lang === "si" ? "font-bold text-gray-900" : ""}>සිංහල</span>
              </button>
              <div className="flex items-center gap-4">
                <button className="relative p-2 bg-gray-50 rounded-xl">
                  <Bell className="w-5 h-5 text-gray-600" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
                <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 relative">
                  <Image src={user?.photoURL || "https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&q=80&w=100&h=100"} alt="Profile" fill className="object-cover" />
                </div>
              </div>
            </div>
            
            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-base font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-2">
              <LogOut className="w-5 h-5" />
              {tx.logout}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
