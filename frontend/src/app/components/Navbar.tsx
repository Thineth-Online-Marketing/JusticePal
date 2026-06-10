"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { Bell, User, LogOut } from "lucide-react";

const t = {
  en: { home: "Home", lawyers: "Our Lawyers", about: "About Us", login: "Login", logout: "Logout", cta: "Get Started" },
  si: { home: "මුල් පිටුව", lawyers: "නීතිඥයින්", about: "අප ගැන", login: "පිවිසෙන්න", logout: "ඉවත්වන්න", cta: "ආරම්භ කරන්න" },
};

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { lang, toggle } = useLanguage();
  const tx = t[lang];
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

        {/* Desktop Nav Links — fixed-width slots prevent layout shift on lang change */}
        <div className="hidden md:flex items-center gap-6">
          {/* Each nav link is a fixed-width centered block */}
          <Link href="/" className={`relative inline-flex justify-center min-w-[90px] text-sm transition-colors duration-200 whitespace-nowrap ${pathname === '/' ? 'text-[#1B3A6B] font-bold after:content-[""] after:absolute after:-bottom-1.5 after:left-1/2 after:-translate-x-1/2 after:w-6 after:h-[3px] after:bg-[#1B3A6B] after:rounded-full' : 'font-medium text-gray-600 hover:text-[#1B3A6B]'}`}>
            {tx.home}
          </Link>
          <Link href="/lawyers" className={`relative inline-flex justify-center min-w-[110px] text-sm transition-colors duration-200 whitespace-nowrap ${pathname.startsWith('/lawyers') ? 'text-[#1B3A6B] font-bold after:content-[""] after:absolute after:-bottom-1.5 after:left-1/2 after:-translate-x-1/2 after:w-6 after:h-[3px] after:bg-[#1B3A6B] after:rounded-full' : 'font-medium text-gray-600 hover:text-[#1B3A6B]'}`}>
            {tx.lawyers}
          </Link>
          <Link href="/about" className={`relative inline-flex justify-center min-w-[90px] text-sm transition-colors duration-200 whitespace-nowrap ${pathname.startsWith('/about') ? 'text-[#1B3A6B] font-bold after:content-[""] after:absolute after:-bottom-1.5 after:left-1/2 after:-translate-x-1/2 after:w-6 after:h-[3px] after:bg-[#1B3A6B] after:rounded-full' : 'font-medium text-gray-600 hover:text-[#1B3A6B]'}`}>
            {tx.about}
          </Link>

          {/* Language Toggle — always the same visual width */}
          <button
            onClick={toggle}
            aria-label="Toggle language"
            className="inline-flex items-center justify-center gap-1.5 w-[88px] h-[34px] shrink-0 rounded-lg border border-gray-200 bg-gray-50 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 text-xs font-semibold text-gray-700"
          >
            <svg className="w-4 h-4 text-blue-700 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 8l6 6" />
              <path d="M4 14l6-6 2-3" />
              <path d="M2 5h12" />
              <path d="M7 2h1" />
              <path d="M22 22l-5-10-5 10" />
              <path d="M14 18h6" />
            </svg>
            <span className={`transition-colors duration-200 ${lang === "en" ? "text-blue-700 font-bold" : "text-gray-400"}`}>EN</span>
            <span className="text-gray-300">|</span>
            <span className={`transition-colors duration-200 ${lang === "si" ? "text-blue-700 font-bold" : "text-gray-400"}`}>සිං</span>
          </button>

          {user ? (
            <div className="flex items-center gap-2 ml-2">
              <button className="relative p-2 text-gray-500 hover:text-[#1B3A6B] transition-colors rounded-full hover:bg-gray-100">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              
              <div className="relative group">
                <button className="flex items-center gap-2 p-1 pr-3 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-[#1B3A6B] text-white flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 hidden lg:block">Profile</span>
                </button>

                {/* Dropdown for Logout */}
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="p-2">
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium">
                      <LogOut className="w-4 h-4" />
                      {tx.logout}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Login Button — fixed width, text centered */}
              <Link
                href="/login"
                className="inline-flex justify-center items-center min-w-[110px] h-[38px] text-sm font-semibold text-blue-900 hover:bg-blue-50 px-4 rounded-lg transition-colors duration-200 whitespace-nowrap"
              >
                {tx.login}
              </Link>

              {/* Get Started CTA — fixed width, text centered */}
              <Link
                href="/register"
                className="inline-flex justify-center items-center min-w-[145px] h-[38px] text-sm font-semibold text-white bg-gradient-to-br from-[#1B3A6B] to-[#2a5298] hover:from-[#112549] hover:to-[#1B3A6B] px-5 rounded-xl shadow-lg shadow-blue-900/20 hover:shadow-blue-900/30 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap"
              >
                {tx.cta}
              </Link>
            </>
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
        className={`md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-200 shadow-xl transition-all duration-300 overflow-hidden ${menuOpen ? 'max-h-96 opacity-100 border-t' : 'max-h-0 opacity-0'
          }`}
      >
        <div className="flex flex-col p-4 space-y-3">
          <Link href="/" onClick={() => setMenuOpen(false)} className={`px-4 py-2.5 text-base rounded-lg transition-colors ${pathname === '/' ? 'text-blue-900 bg-blue-50 font-bold' : 'font-medium text-gray-700 hover:text-blue-900 hover:bg-gray-50'}`}>
            {tx.home}
          </Link>
          <Link href="/lawyers" onClick={() => setMenuOpen(false)} className={`px-4 py-2.5 text-base rounded-lg transition-colors ${pathname.startsWith('/lawyers') ? 'text-blue-900 bg-blue-50 font-bold' : 'font-medium text-gray-700 hover:text-blue-900 hover:bg-gray-50'}`}>
            {tx.lawyers}
          </Link>
          <Link href="/about" onClick={() => setMenuOpen(false)} className={`px-4 py-2.5 text-base rounded-lg transition-colors ${pathname.startsWith('/about') ? 'text-blue-900 bg-blue-50 font-bold' : 'font-medium text-gray-700 hover:text-blue-900 hover:bg-gray-50'}`}>
            {tx.about}
          </Link>

          {/* Mobile Language Toggle */}
          <button
            onClick={toggle}
            className="flex items-center gap-2 px-4 py-2.5 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
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
                  <div className="w-10 h-10 rounded-full bg-[#1B3A6B] text-white flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-gray-700">Profile</span>
                </div>
                <button className="relative p-2 text-gray-500 hover:text-[#1B3A6B] rounded-full bg-gray-50">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
              </div>
              <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-base font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <LogOut className="w-5 h-5" />
                {tx.logout}
              </button>
            </div>
          ) : (
            <>
              <Link href="/login" onClick={() => setMenuOpen(false)} className="px-4 py-2.5 text-base font-semibold text-blue-900 hover:bg-blue-50 rounded-lg transition-colors">
                {tx.login}
              </Link>
              <Link href="/register" onClick={() => setMenuOpen(false)} className="px-4 py-2.5 text-base font-semibold text-center text-white bg-blue-900 rounded-lg hover:bg-blue-800 transition-colors shadow-md">
                {tx.cta}
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
