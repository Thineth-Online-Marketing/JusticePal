"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "../context/LanguageContext";
import Footer from "../components/Footer";

export default function FindLawyerPage() {
  const { lang, toggle } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] font-sans">
      {/* ─── Navbar ─── */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-6 h-[72px] flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 text-blue-900 hover:text-blue-700 transition-colors">
            <div className="relative w-10 h-10 rounded-full overflow-hidden shadow-sm flex items-center justify-center bg-[#1B3A6B]">
              <Image
                src="https://res.cloudinary.com/dluwvqdaz/image/upload/v1775969976/Navy_Blue_JusticePal_Logo_with_Dove_Fusion_new_uhyjl0.png"
                alt="JusticePal Logo" fill className="object-cover"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-extrabold text-xl tracking-tight text-[#1B3A6B]">JusticePal</span>
              <span className="text-[10px] font-bold tracking-[0.2em] text-[#3b6fd4] uppercase">Sri Lanka</span>
            </div>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-medium text-gray-500 hover:text-[#1B3A6B] transition-colors">Dashboard</Link>
            <Link href="/find-lawyer" className="text-sm font-bold text-[#1B3A6B] relative after:content-[''] after:absolute after:-bottom-1.5 after:left-1/2 after:-translate-x-1/2 after:w-6 after:h-[3px] after:bg-[#1B3A6B] after:rounded-full">Find Lawyer</Link>
            <Link href="#" className="text-sm font-medium text-gray-500 hover:text-[#1B3A6B] transition-colors">Chat AI</Link>
            <Link href="#" className="text-sm font-medium text-gray-500 hover:text-[#1B3A6B] transition-colors">User Guide</Link>
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-4">
            <button onClick={toggle} className="flex items-center gap-1.5 px-4 h-[38px] rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition-all text-xs">
              <svg className="w-4 h-4 text-[#1B3A6B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 8l6 6" /><path d="M4 14l6-6 2-3" /><path d="M2 5h12" /><path d="M7 2h1" />
                <path d="M22 22l-5-10-5 10" /><path d="M14 18h6" />
              </svg>
              <span className={lang === "en" ? "font-bold text-gray-900" : "font-semibold text-gray-400"}>EN</span>
              <span className="text-gray-300">|</span>
              <span className={lang === "si" ? "font-bold text-gray-900" : "font-semibold text-gray-400"}>සිංහල</span>
            </button>

            {/* Bell */}
            <button className="relative w-10 h-10 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-100 flex items-center justify-center transition-colors">
              <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>

            {/* Avatar */}
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 relative">
              <Image
                src="https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&q=80&w=100&h=100"
                alt="Profile" fill className="object-cover"
              />
            </div>
          </div>
        </div>
      </nav>

      {/* ─── Main ─── */}
      <main className="flex-1 max-w-[1100px] w-full mx-auto px-6 pt-28 pb-16">
        {/* Page heading */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#111827] tracking-tight">Find Your Lawyer</h1>
          <p className="text-gray-500 mt-2 text-base">Describe your legal issue and let our AI match you with the right expert.</p>
        </div>
      </main>

      {/* ─── Footer ─── */}
      <Footer />
    </div>
  );
}
