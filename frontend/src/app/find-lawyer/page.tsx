"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "../context/LanguageContext";
import {
  Search, X, Sparkles, MapPin, CheckCircle2
} from "lucide-react";
import Footer from "../components/Footer";

/* ───────────────────── types ───────────────────── */
interface Suggestion {
  label: string;
  selected: boolean;
  color: string;
}

/* ───────────────────── mock suggestion data ───────────────────── */
const MOCK_SUGGESTIONS: Suggestion[] = [
  { label: "Tenancy Law", selected: true, color: "bg-blue-100 text-blue-800 border-blue-300" },
  { label: "Property Law", selected: false, color: "bg-gray-100 text-gray-700 border-gray-200" },
  { label: "Contract Dispute", selected: false, color: "bg-gray-100 text-gray-700 border-gray-200" },
];

const MOCK_LOCATION_SUGGESTIONS: Suggestion[] = [
  { label: "Colombo", selected: true, color: "bg-green-100 text-green-800 border-green-300" },
  { label: "Gampaha", selected: false, color: "bg-gray-100 text-gray-700 border-gray-200" },
];

const MOCK_BUDGET_SUGGESTIONS: Suggestion[] = [
  { label: "Under LKR 30,000", selected: true, color: "bg-purple-100 text-purple-800 border-purple-300" },
  { label: "LKR 30k-60k", selected: false, color: "bg-gray-100 text-gray-700 border-gray-200" },
];

const MOCK_LANGUAGE_SUGGESTIONS: Suggestion[] = [
  { label: "English", selected: true, color: "bg-orange-100 text-orange-800 border-orange-300" },
  { label: "Sinhala", selected: false, color: "bg-gray-100 text-gray-700 border-gray-200" },
];

/* ───────────────────── component ───────────────────── */
export default function FindLawyerPage() {
  const { lang, toggle } = useLanguage();
  const [caseText, setCaseText] = useState("");
  const [caseSuggestions, setCaseSuggestions] = useState(MOCK_SUGGESTIONS);
  const [locationSuggestions] = useState(MOCK_LOCATION_SUGGESTIONS);
  const [budgetSuggestions] = useState(MOCK_BUDGET_SUGGESTIONS);
  const [langSuggestions] = useState(MOCK_LANGUAGE_SUGGESTIONS);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const toggleSuggestion = (idx: number) => {
    setCaseSuggestions(prev =>
      prev.map((s, i) =>
        i === idx
          ? {
              ...s,
              selected: !s.selected,
              color: !s.selected
                ? "bg-blue-100 text-blue-800 border-blue-300"
                : "bg-gray-100 text-gray-700 border-gray-200",
            }
          : s
      )
    );
  };

  const handleClear = () => {
    setCaseText("");
  };

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

        {/* ─── AI Case Intake ─── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-8 overflow-hidden">
          <div className="px-6 pt-5 pb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
            <Sparkles className="w-4 h-4 text-blue-600" />
            AI Case Intake — describe your issue in plain language
          </div>
          <div className="px-6 pb-5">
            <textarea
              ref={textareaRef}
              value={caseText}
              onChange={(e) => setCaseText(e.target.value)}
              rows={3}
              placeholder="e.g. My landlord is refusing to return my security deposit after I moved out last month. He claims there was damage but I have photos showing the flat was clean. I'm based in Colombo and I need urgent advice..."
              className="w-full resize-none border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all bg-gray-50"
            />
          </div>

          {/* AI info note */}
          <div className="px-6 pb-4 flex items-start gap-2 text-xs text-gray-500">
            <Sparkles className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
            <span>AI will auto-detect case type, suggest location & budget, and rank matching lawyers for you.</span>
          </div>

          {/* ─── AI-Detected Suggestions ─── */}
          <div className="px-6 pb-6 space-y-4">
            <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">AI-Detected Suggestions — Click to Apply</p>

            {/* Case type row */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 min-w-[80px]">Case type:</span>
              {caseSuggestions.map((s, i) => (
                <button
                  key={s.label}
                  onClick={() => toggleSuggestion(i)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all hover:scale-[1.03] active:scale-100 ${s.color}`}
                >
                  {s.selected && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {s.label}
                </button>
              ))}
            </div>

            {/* Location row */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 min-w-[80px]">Location:</span>
              {locationSuggestions.map((s) => (
                <span key={s.label} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${s.color}`}>
                  {s.selected && <MapPin className="w-3.5 h-3.5" />}
                  {s.label}
                </span>
              ))}
            </div>

            {/* Budget row */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 min-w-[80px]">Budget:</span>
              {budgetSuggestions.map((s) => (
                <span key={s.label} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${s.color}`}>
                  {s.selected && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {s.label}
                </span>
              ))}
            </div>

            {/* Language row */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 min-w-[80px]">Language:</span>
              {langSuggestions.map((s) => (
                <span key={s.label} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${s.color}`}>
                  {s.selected && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {s.label}
                </span>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="px-6 pb-6 flex flex-wrap items-center gap-3">
            <button
              className="inline-flex items-center gap-2 bg-[#1B3A6B] hover:bg-[#112549] text-white px-6 py-3 rounded-xl font-semibold text-sm shadow-lg shadow-blue-900/20 hover:shadow-blue-900/30 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              <Search className="w-4 h-4" />
              Find Matching Lawyers
            </button>
            <button
              onClick={handleClear}
              className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-5 py-3 rounded-xl font-semibold text-sm transition-colors"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          </div>
        </div>
      </main>

      {/* ─── Footer ─── */}
      <Footer />
    </div>
  );
}
