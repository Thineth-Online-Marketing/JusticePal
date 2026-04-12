"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "../context/LanguageContext";

const t = {
  en: { home: "Home", lawyers: "Our Lawyers", about: "About Us", login: "Login", cta: "Get Started" },
  si: { home: "මුල් පිටුව", lawyers: "නීතිඥයින්", about: "අප ගැන", login: "පිවිසෙන්න", cta: "ආරම්භ කරන්න" },
};

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { lang, toggle } = useLanguage();
  const tx = t[lang];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between">

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
          <Link href="/" className="inline-flex justify-center min-w-[90px] text-sm font-medium text-gray-600 hover:text-blue-900 transition-colors duration-200 whitespace-nowrap">
            {tx.home}
          </Link>
          <Link href="/lawyers" className="inline-flex justify-center min-w-[110px] text-sm font-medium text-gray-600 hover:text-blue-900 transition-colors duration-200 whitespace-nowrap">
            {tx.lawyers}
          </Link>
          <Link href="/about" className="inline-flex justify-center min-w-[90px] text-sm font-medium text-gray-600 hover:text-blue-900 transition-colors duration-200 whitespace-nowrap">
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
          <Link href="/" onClick={() => setMenuOpen(false)} className="px-4 py-2.5 text-base font-medium text-gray-700 hover:text-blue-900 hover:bg-gray-50 rounded-lg transition-colors">
            {tx.home}
          </Link>
          <Link href="/lawyers" onClick={() => setMenuOpen(false)} className="px-4 py-2.5 text-base font-medium text-gray-700 hover:text-blue-900 hover:bg-gray-50 rounded-lg transition-colors">
            {tx.lawyers}
          </Link>
          <Link href="/about" onClick={() => setMenuOpen(false)} className="px-4 py-2.5 text-base font-medium text-gray-700 hover:text-blue-900 hover:bg-gray-50 rounded-lg transition-colors">
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
          <Link href="/login" onClick={() => setMenuOpen(false)} className="px-4 py-2.5 text-base font-semibold text-blue-900 hover:bg-blue-50 rounded-lg transition-colors">
            {tx.login}
          </Link>
          <Link href="/register" onClick={() => setMenuOpen(false)} className="px-4 py-2.5 text-base font-semibold text-center text-white bg-blue-900 rounded-lg hover:bg-blue-800 transition-colors shadow-md">
            {tx.cta}
          </Link>
        </div>
      </div>
    </nav>
  );
}
