"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "../context/LanguageContext";
import { Bell } from "lucide-react";

export default function LawyersNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { lang, toggle } = useLanguage();

  const labels = {
    en: { lawyers: "Our Lawyers", find: "Find Lawyers", about: "About Us" },
    si: { lawyers: "නීතිඥයින්", find: "නීතිඥයින් සොයන්න", about: "අප ගැන" },
  };

  const currentLabels = labels[lang as keyof typeof labels] || labels.en;

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white border-b border-gray-100 shadow-sm transition-all duration-300">
      <div className="max-w-[1400px] mx-auto px-6 h-[72px] flex items-center justify-between">
        
        {/* Logo and Brand */}
        <Link href="/" className="flex items-center gap-3 text-blue-900 hover:text-blue-700 transition-colors duration-200">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-sm flex items-center justify-center bg-blue-50/50">
            <Image
              src="https://res.cloudinary.com/dluwvqdaz/image/upload/v1775969976/Navy_Blue_JusticePal_Logo_with_Dove_Fusion_new_uhyjl0.png"
              alt="JusticePal Logo"
              fill
              className="object-cover"
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

        {/* Center Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/lawyers" className="text-sm font-bold text-gray-900 border-b-2 border-[#1B3A6B] py-6">
            {currentLabels.lawyers}
          </Link>
          <Link href="/find-lawyers" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
            {currentLabels.find}
          </Link>
          <Link href="/about" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
            {currentLabels.about}
          </Link>
        </div>

        {/* Right Side Options */}
        <div className="hidden md:flex items-center gap-5">
          {/* Language Toggle */}
          <button
            onClick={toggle}
            aria-label="Toggle language"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m5 8 6 6-6 6" />
              <path d="m19 16-6-6 6-6" />
            </svg>
            <span className={`text-xs ${lang === 'en' ? 'font-bold text-gray-900' : 'font-medium text-gray-400'}`}>EN</span>
            <span className="text-gray-300 text-xs">|</span>
            <span className={`text-xs ${lang === 'si' ? 'font-bold text-gray-900' : 'font-medium text-gray-400'}`}>සිං</span>
          </button>

          {/* Notification Bell */}
          <button className="relative p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          {/* Profile Avatar */}
          <button className="relative w-9 h-9 rounded-full overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:ring-offset-2">
            <Image
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80"
              alt="Profile"
              fill
              className="object-cover"
            />
          </button>
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

      {/* Mobile Menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ${menuOpen ? 'max-h-96 border-t border-gray-100' : 'max-h-0'}`}>
        <div className="flex flex-col p-4 bg-white space-y-2">
          <Link href="/lawyers" className="px-4 py-3 font-bold text-gray-900 bg-gray-50 rounded-lg">
            {currentLabels.lawyers}
          </Link>
          <Link href="/find-lawyers" className="px-4 py-3 font-medium text-gray-600 hover:bg-gray-50 rounded-lg">
            {currentLabels.find}
          </Link>
          <Link href="/about" className="px-4 py-3 font-medium text-gray-600 hover:bg-gray-50 rounded-lg">
            {currentLabels.about}
          </Link>
          <div className="h-px bg-gray-100 my-2" />
          <div className="flex items-center justify-between px-4 py-2">
            <button onClick={toggle} className="flex items-center gap-2 text-sm font-medium text-gray-600">
              <span className={lang === "en" ? "font-bold text-gray-900" : ""}>EN</span> 
              / 
              <span className={lang === "si" ? "font-bold text-gray-900" : ""}>සිං</span>
            </button>
            <div className="flex items-center gap-4">
              <button className="relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="w-8 h-8 rounded-full overflow-hidden relative">
                <Image src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80" alt="Profile" fill className="object-cover" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
