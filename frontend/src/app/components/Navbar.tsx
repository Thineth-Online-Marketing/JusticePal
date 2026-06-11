"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { User, ChevronDown, LayoutDashboard, Calendar, FileText, Power } from "lucide-react";

const t = {
  en: { home: "Home", lawyers: "Our Lawyers", about: "About Us", login: "Log In", signup: "Sign Up", logout: "Sign Out", dashboard: "Go to Dashboard", profile: "My Profile", appointments: "Active Appointments", docs: "Case Documents" },
  si: { home: "මුල් පිටුව", lawyers: "නීතිඥයින්", about: "අප ගැන", login: "පිවිසෙන්න", signup: "ලියාපදිංචි වන්න", logout: "ඉවත්වන්න", dashboard: "උපකරණ පුවරුවට", profile: "මගේ පැතිකඩ", appointments: "ක්‍රියාකාරී හමුවීම්", docs: "නඩු ලේඛන" },
};

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { lang, toggle } = useLanguage();
  const tx = t[lang as keyof typeof t] || t.en;
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout(); // Sign out from Firebase
    window.location.href = "/";
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all duration-300">
      <div className="max-w-[1400px] mx-auto px-6 h-[72px] flex items-center justify-between">

        {/* Logo and Brand */}
        <Link
          href="/"
          className="flex items-center gap-3 text-blue-900 hover:text-blue-700 transition-colors duration-200"
        >
          <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-sm flex items-center justify-center bg-blue-50/50">
            <Image
              src="https://res.cloudinary.com/dluwvqdaz/image/upload/v1775969976/Navy_Blue_JusticePal_Logo_with_Dove_Fusion_new_uhyjl0.png"
              alt="JusticePal Logo"
              fill
              className="object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <svg className="w-6 h-6 absolute -z-10 text-blue-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-extrabold text-xl tracking-tight text-[#1B3A6B]">JusticePal</span>
            <span className="text-[10px] font-bold tracking-[0.2em] text-[#3b6fd4] uppercase">Sri Lanka</span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className={`relative inline-flex justify-center min-w-[90px] text-sm transition-colors duration-200 whitespace-nowrap ${pathname === '/' ? 'text-[#1B3A6B] font-bold after:content-[""] after:absolute after:-bottom-1.5 after:left-1/2 after:-translate-x-1/2 after:w-6 after:h-[3px] after:bg-[#1B3A6B] after:rounded-full' : 'font-semibold text-gray-800 hover:text-[#1B3A6B]'}`}>
            {tx.home}
          </Link>
          <Link href="/lawyers" className={`relative inline-flex justify-center min-w-[110px] text-sm transition-colors duration-200 whitespace-nowrap ${pathname.startsWith('/lawyers') ? 'text-[#1B3A6B] font-bold after:content-[""] after:absolute after:-bottom-1.5 after:left-1/2 after:-translate-x-1/2 after:w-6 after:h-[3px] after:bg-[#1B3A6B] after:rounded-full' : 'font-semibold text-gray-800 hover:text-[#1B3A6B]'}`}>
            {tx.lawyers}
          </Link>
          <Link href="/about" className={`relative inline-flex justify-center min-w-[90px] text-sm transition-colors duration-200 whitespace-nowrap ${pathname.startsWith('/about') ? 'text-[#1B3A6B] font-bold after:content-[""] after:absolute after:-bottom-1.5 after:left-1/2 after:-translate-x-1/2 after:w-6 after:h-[3px] after:bg-[#1B3A6B] after:rounded-full' : 'font-semibold text-gray-800 hover:text-[#1B3A6B]'}`}>
            {tx.about}
          </Link>

          {/* Language Toggle */}
          <button
            onClick={toggle}
            aria-label="Toggle language"
            className="inline-flex items-center justify-center gap-1.5 h-[34px] px-4 shrink-0 rounded-full border border-gray-200 bg-transparent hover:bg-gray-50 transition-all duration-200 text-xs font-semibold text-gray-700 ml-4"
          >
            <svg className="w-4 h-4 text-blue-700 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 8l6 6" />
              <path d="M4 14l6-6 2-3" />
              <path d="M2 5h12" />
              <path d="M7 2h1" />
              <path d="M22 22l-5-10-5 10" />
              <path d="M14 18h6" />
            </svg>
            <span className={`transition-colors duration-200 ${lang === "en" ? "text-gray-900 font-bold" : "text-gray-500"}`}>EN</span>
            <span className="text-gray-300">|</span>
            <span className={`transition-colors duration-200 ${lang === "si" ? "text-gray-900 font-bold" : "text-gray-500"}`}>සිංහල</span>
          </button>

          {user ? (
            <div className="flex items-center ml-2">
              <div className="relative group">
                {/* Collapsed Profile Trigger */}
                <button className="flex items-center gap-1 p-1 pl-1.5 pr-2 border border-gray-200 rounded-full hover:border-[#1B3A6B] hover:bg-blue-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:ring-offset-2">
                  <div className="w-7 h-7 rounded-full bg-[#1B3A6B] text-white flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-[#1B3A6B] transition-colors" />
                </button>

                {/* Integrated Menu (The Dropdown) */}
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-100 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 overflow-hidden origin-top-right z-50">
                  <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                    <p className="text-sm font-bold text-gray-900 truncate">{user.displayName || "User Profile"}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  
                  <div className="p-2 flex flex-col gap-1">
                    {/* Primary Action */}
                    <Link href="/dashboard" className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-[#1B3A6B] hover:bg-blue-50 rounded-xl transition-colors">
                      <LayoutDashboard className="w-4 h-4 text-[#1B3A6B]" />
                      {tx.dashboard}
                    </Link>
                    
                    <div className="h-px bg-gray-100 my-1 mx-2"></div>
                    
                    {/* Secondary Actions */}
                    <Link href="/profile" className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-colors">
                      <User className="w-4 h-4 text-gray-400" />
                      {tx.profile}
                    </Link>
                    <Link href="/appointments" className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-colors">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {tx.appointments}
                    </Link>
                    <Link href="/documents" className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-colors">
                      <FileText className="w-4 h-4 text-gray-400" />
                      {tx.docs}
                    </Link>
                    
                    {/* Danger Zone */}
                    <div className="h-px bg-gray-100 my-1 mx-2"></div>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                      <Power className="w-4 h-4 text-red-500" />
                      {tx.logout}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 ml-2">
              {/* Guest Logic */}
              <Link
                href="/login"
                className="inline-flex justify-center items-center h-[34px] text-xs font-bold text-gray-700 hover:text-[#1B3A6B] px-3 rounded-full transition-colors duration-200 whitespace-nowrap"
              >
                [ {tx.login} ]
              </Link>
              <Link
                href="/register"
                className="inline-flex justify-center items-center h-[34px] text-xs font-bold text-white bg-[#2244a1] hover:bg-[#1B3A6B] px-5 rounded-full shadow-sm transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap"
              >
                [ {tx.signup} ]
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col justify-center items-center w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors duration-200 gap-1.5 focus:outline-none"
          aria-label="Toggle menu"
        >
          <span className={`block w-5 h-0.5 bg-gray-800 transition-transform duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-5 h-0.5 bg-gray-800 transition-opacity duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-0.5 bg-gray-800 transition-transform duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-200 shadow-xl transition-all duration-300 overflow-hidden ${menuOpen ? 'max-h-screen opacity-100 border-t' : 'max-h-0 opacity-0'
          }`}
      >
        <div className="flex flex-col p-4 space-y-3 overflow-y-auto max-h-[calc(100vh-72px)]">
          <Link href="/" onClick={() => setMenuOpen(false)} className={`px-4 py-2.5 text-base rounded-lg transition-colors ${pathname === '/' ? 'text-blue-900 bg-blue-50 font-bold' : 'font-semibold text-gray-800 hover:text-blue-900 hover:bg-gray-50'}`}>
            {tx.home}
          </Link>
          <Link href="/lawyers" onClick={() => setMenuOpen(false)} className={`px-4 py-2.5 text-base rounded-lg transition-colors ${pathname.startsWith('/lawyers') ? 'text-blue-900 bg-blue-50 font-bold' : 'font-semibold text-gray-800 hover:text-blue-900 hover:bg-gray-50'}`}>
            {tx.lawyers}
          </Link>
          <Link href="/about" onClick={() => setMenuOpen(false)} className={`px-4 py-2.5 text-base rounded-lg transition-colors ${pathname.startsWith('/about') ? 'text-blue-900 bg-blue-50 font-bold' : 'font-semibold text-gray-800 hover:text-blue-900 hover:bg-gray-50'}`}>
            {tx.about}
          </Link>

          {/* Mobile Language Toggle */}
          <button
            onClick={toggle}
            className="flex items-center gap-2 px-4 py-2.5 text-base font-semibold text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4 text-blue-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 8l6 6" /><path d="M4 14l6-6 2-3" /><path d="M2 5h12" /><path d="M7 2h1" />
              <path d="M22 22l-5-10-5 10" /><path d="M14 18h6" />
            </svg>
            <span>{lang === "en" ? "Switch to Sinhala (සිංහල)" : "Switch to English (EN)"}</span>
          </button>

          <div className="h-px bg-gray-100 my-2" />
          {user ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-4 py-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#1B3A6B] text-white flex items-center justify-center overflow-hidden shadow-sm">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900">{user.displayName || "User Profile"}</span>
                    <span className="text-xs text-gray-500">{user.email}</span>
                  </div>
                </div>
              </div>
              
              <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="mx-2 flex items-center gap-3 px-4 py-3 text-base font-bold text-[#1B3A6B] bg-blue-50/50 hover:bg-blue-50 border border-blue-100 rounded-xl transition-colors">
                <LayoutDashboard className="w-5 h-5" />
                {tx.dashboard}
              </Link>
              
              <Link href="/profile" onClick={() => setMenuOpen(false)} className="mx-2 flex items-center gap-3 px-4 py-2.5 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
                <User className="w-5 h-5 text-gray-400" />
                {tx.profile}
              </Link>
              <Link href="/appointments" onClick={() => setMenuOpen(false)} className="mx-2 flex items-center gap-3 px-4 py-2.5 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
                <Calendar className="w-5 h-5 text-gray-400" />
                {tx.appointments}
              </Link>
              <Link href="/documents" onClick={() => setMenuOpen(false)} className="mx-2 flex items-center gap-3 px-4 py-2.5 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
                <FileText className="w-5 h-5 text-gray-400" />
                {tx.docs}
              </Link>

              <div className="h-px bg-gray-100 my-2 mx-4" />

              <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="mx-2 flex items-center gap-3 px-4 py-2.5 text-base font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors w-auto">
                <Power className="w-5 h-5 text-red-500" />
                {tx.logout}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 mt-2">
              <Link href="/login" onClick={() => setMenuOpen(false)} className="px-4 py-2.5 text-base font-bold text-gray-700 hover:bg-gray-50 hover:text-[#1B3A6B] rounded-lg transition-colors border border-transparent hover:border-gray-200 mx-4 flex justify-center">
                [ {tx.login} ]
              </Link>
              <Link href="/register" onClick={() => setMenuOpen(false)} className="px-4 py-2.5 text-base font-bold text-center text-white bg-[#2244a1] rounded-full hover:bg-[#1B3A6B] transition-colors shadow-md mx-4 mb-4">
                [ {tx.signup} ]
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
