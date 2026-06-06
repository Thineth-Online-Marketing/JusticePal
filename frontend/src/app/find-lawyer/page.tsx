"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLanguage } from "../context/LanguageContext";
import {
  Search, X, Sparkles, MapPin, Star, ChevronDown,
  SlidersHorizontal, CheckCircle2, ArrowUpDown, Shield
} from "lucide-react";
import Footer from "../components/Footer";

/* ───────────────────── translations ───────────────────── */
const translations = {
  en: {
    dashboard: "Dashboard", findLawyer: "Find Lawyer", chatAi: "Chat AI", userGuide: "User Guide",
    title: "Find Your Lawyer",
    subtitle: "Describe your legal issue and let our AI match you with the right expert.",
    caseIntakeTitle: "AI Case Intake — describe your issue in plain language",
    placeholder: "e.g. My landlord is refusing to return my security deposit after I moved out last month. He claims there was damage but I have photos showing the flat was clean. I'm based in Colombo and I need urgent advice...",
    aiNote: "AI will auto-detect case type, suggest location & budget, and rank matching lawyers for you.",
    suggestionsTitle: "AI-Detected Suggestions — Click to Apply",
    caseType: "Case type:", location: "Location:", budget: "Budget:", language: "Language:",
    findBtn: "Find Matching Lawyers", clearBtn: "Clear",
    refine: "Refine:", sortBestMatch: "Sort: Best Match",
    matchedLawyers: "Matched Lawyers", aiRanked: "— AI Ranked",
    resultsFound: "results found", aiMatch: "AI Match",
    perHour: "/ hour", barCouncil: "Bar Council Verified", bookBtn: "Book Appointment",
    filters: ["Tenancy & Property", "Colombo", "Under LKR 30,000", "English", "Any Availability"],
    topMatch: "Top Match",
    suggestions: ["Tenancy Law", "Property Law", "Contract Dispute"],
    locations: ["Colombo", "Gampaha"],
    budgets: ["Under LKR 30,000", "LKR 30k-60k"],
    languages: ["English", "Sinhala"],
    tags: {
      "Tenancy Disputes": "Tenancy Disputes", "Deposit Recovery": "Deposit Recovery",
      "Contract Review": "Contract Review", "Available Today": "Available Today",
      "Property Disputes": "Property Disputes", "Civil Litigation": "Civil Litigation",
      "Available This Week": "Available This Week", "Rental Agreements": "Rental Agreements",
      "Consumer Law": "Consumer Law", "Land Disputes": "Land Disputes",
      "Real Estate": "Real Estate", "Next Week": "Next Week",
    } as Record<string, string>,
    specialties: {
      "Tenancy & Property Law": "Tenancy & Property Law",
      "Property & Civil Litigation": "Property & Civil Litigation",
      "Tenancy & Consumer Rights": "Tenancy & Consumer Rights",
      "Real Estate & Land Law": "Real Estate & Land Law",
    } as Record<string, string>,
  },
  si: {
    dashboard: "උපකරණ පුවරුව", findLawyer: "නීතිඥයෙකු සොයන්න", chatAi: "Chat AI", userGuide: "පරිශීලක මාර්ගෝපදේශය",
    title: "ඔබේ නීතිඥයා සොයන්න",
    subtitle: "ඔබේ නීතිමය ගැටලුව විස්තර කරන්න, අපගේ AI ඔබට නිවැරදි විශේෂඥයා සොයා දෙනු ඇත.",
    caseIntakeTitle: "AI නඩු ඇතුළත් කිරීම — ඔබේ ගැටලුව සරල භාෂාවෙන් විස්තර කරන්න",
    placeholder: "උදා: මගේ නිවාස හිමියා මා පසුගිය මාසයේ ගෙවී ගිය පසු මගේ ආරක්ෂිත තැන්පතුව ආපසු දීම ප්‍රතික්ෂේප කරයි. ඔහු හානි සිදුවූ බව කියයි, නමුත් නිවස පිරිසිදු බව පෙන්වන ඡායාරූප මා සතුව ඇත. මම කොළඹ පදිංචි වන අතර හදිසි උපදෙස් අවශ්‍යයි...",
    aiNote: "AI ස්වයංක්‍රීයව නඩු වර්ගය හඳුනාගෙන, ස්ථානය සහ අයවැය යෝජනා කර, ගැළපෙන නීතිඥයින් ශ්‍රේණිගත කරයි.",
    suggestionsTitle: "AI-හඳුනාගත් යෝජනා — යොදන්න ක්ලික් කරන්න",
    caseType: "නඩු වර්ගය:", location: "ස්ථානය:", budget: "අයවැය:", language: "භාෂාව:",
    findBtn: "ගැළපෙන නීතිඥයින් සොයන්න", clearBtn: "මකන්න",
    refine: "පිරිපහදු:", sortBestMatch: "වර්ග කරන්න: හොඳම ගැළපීම",
    matchedLawyers: "ගැළපෙන නීතිඥයින්", aiRanked: "— AI ශ්‍රේණිගත",
    resultsFound: "ප්‍රතිඵල සොයාගත්තා", aiMatch: "AI ගැළපීම",
    perHour: "/ පැය", barCouncil: "නීතිඥ සභාව සත්‍යාපිතයි", bookBtn: "හමුවීමක් වෙන්කරන්න",
    filters: ["කුලී සහ දේපළ", "කොළඹ", "රු. 30,000 ට අඩු", "ඉංග්‍රීසි", "ඕනෑම ලබා ගත හැකි"],
    topMatch: "ඉහළම ගැළපීම",
    suggestions: ["කුලී නීතිය", "දේපළ නීතිය", "කොන්ත්‍රාත් ආරවුල"],
    locations: ["කොළඹ", "ගම්පහ"],
    budgets: ["රු. 30,000 ට අඩු", "රු. 30k-60k"],
    languages: ["ඉංග්‍රීසි", "සිංහල"],
    tags: {
      "Tenancy Disputes": "කුලී ආරවුල්", "Deposit Recovery": "තැන්පතු ආපසු ගැනීම",
      "Contract Review": "කොන්ත්‍රාත් සමාලෝචනය", "Available Today": "අද ලබා ගත හැක",
      "Property Disputes": "දේපළ ආරවුල්", "Civil Litigation": "සිවිල් නඩු",
      "Available This Week": "මෙම සතියේ ලබා ගත හැක", "Rental Agreements": "කුලී ගිවිසුම්",
      "Consumer Law": "පාරිභෝගික නීතිය", "Land Disputes": "ඉඩම් ආරවුල්",
      "Real Estate": "නිශ්චල දේපළ", "Next Week": "ඊළඟ සතියේ",
    } as Record<string, string>,
    specialties: {
      "Tenancy & Property Law": "කුලී සහ දේපළ නීතිය",
      "Property & Civil Litigation": "දේපළ සහ සිවිල් නඩු",
      "Tenancy & Consumer Rights": "කුලී සහ පාරිභෝගික අයිතිවාසිකම්",
      "Real Estate & Land Law": "නිශ්චල දේපළ සහ ඉඩම් නීතිය",
    } as Record<string, string>,
  },
};

/* ───────────────────── types ───────────────────── */
interface Suggestion {
  label: string;
  selected: boolean;
  color: string;
}

interface LawyerCard {
  initials: string;
  initialsColor: string;
  name: string;
  specialty: string;
  location: string;
  experience: string;
  languages: string[];
  matchPercent: number;
  tags: string[];
  rate: string;
  rating: number;
  reviews: number;
  verified: boolean;
  badge?: string;
}

/* ───────────────────── mock data ───────────────────── */
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

const MOCK_LAWYERS: LawyerCard[] = [
  {
    initials: "SR", initialsColor: "bg-orange-500",
    name: "Samantha Rodrigo", specialty: "Tenancy & Property Law",
    location: "Colombo 07 · 18 yrs exp", experience: "18 yrs",
    languages: ["English", "Sinhala"], matchPercent: 94,
    tags: ["Tenancy Disputes", "Deposit Recovery", "Contract Review", "Available Today"],
    rate: "LKR 8,500", rating: 4.9, reviews: 142, verified: true, badge: "Top Match",
  },
  {
    initials: "KP", initialsColor: "bg-blue-600",
    name: "Kasun Perera", specialty: "Property & Civil Litigation",
    location: "Colombo 03 · 12 yrs exp", experience: "12 yrs",
    languages: ["Sinhala", "English"], matchPercent: 87,
    tags: ["Property Disputes", "Civil Litigation", "Available This Week"],
    rate: "LKR 6,000", rating: 4.7, reviews: 98, verified: true,
  },
  {
    initials: "NF", initialsColor: "bg-indigo-600",
    name: "Nimesha Fernando", specialty: "Tenancy & Consumer Rights",
    location: "Colombo 05 · 9 yrs exp", experience: "9 yrs",
    languages: ["English", "Tamil", "Sinhala"], matchPercent: 81,
    tags: ["Rental Agreements", "Consumer Law", "Available Today"],
    rate: "LKR 5,500", rating: 4.8, reviews: 67, verified: true,
  },
  {
    initials: "RW", initialsColor: "bg-rose-600",
    name: "Rajith Wijesuriya", specialty: "Real Estate & Land Law",
    location: "Colombo 02 · 22 yrs exp", experience: "22 yrs",
    languages: ["English", "Sinhala"], matchPercent: 74,
    tags: ["Land Disputes", "Real Estate", "Next Week"],
    rate: "LKR 12,000", rating: 4.6, reviews: 211, verified: true,
  },
];

/* ───────────────────── component ───────────────────── */
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function FindLawyerPage() {
  const { lang, toggle } = useLanguage();
  const tx = translations[lang as keyof typeof translations] || translations.en;
  const [caseText, setCaseText] = useState("");
  const [showResults, setShowResults] = useState(true);
  const [caseSuggestions, setCaseSuggestions] = useState(MOCK_SUGGESTIONS);
  const [locationSuggestions] = useState(MOCK_LOCATION_SUGGESTIONS);
  const [budgetSuggestions] = useState(MOCK_BUDGET_SUGGESTIONS);
  const [langSuggestions] = useState(MOCK_LANGUAGE_SUGGESTIONS);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  const [dbLawyers, setDbLawyers] = useState<any[]>([]);

  useEffect(() => {
    const fetchLawyers = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/lawyers`);
        if (res.ok) {
          const data = await res.json();
          const mapped = data.map((l: any) => ({
            id: l.id,
            initials: l.user?.name ? l.user.name.split(" ").map((n: string) => n.charAt(0)).join("").slice(0, 2) : "L",
            initialsColor: "bg-blue-600",
            name: l.user?.name || "Anonymous Lawyer",
            specialty: l.specialization?.[0] || (lang === "si" ? "නීතිඥ" : "Attorney-at-Law"),
            location: `${l.location || "Colombo"} · ${l.workExperience || "5 yrs exp"}`,
            experience: l.workExperience || "5 yrs exp",
            languages: ["English", "Sinhala"],
            matchPercent: 92,
            tags: l.specialization || ["Lawyer"],
            rate: l.hourlyRate ? `LKR ${l.hourlyRate.toLocaleString()}` : "LKR 5,000",
            rating: 4.9,
            reviews: 14,
            verified: l.isVerified,
          }));
          setDbLawyers(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch lawyers", err);
      }
    };
    fetchLawyers();
  }, [lang]);

  const allLawyers = [...dbLawyers, ...MOCK_LAWYERS];

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
    setShowResults(false);
  };

  const handleSearch = () => {
    setShowResults(true);
  };

  /* palette helpers */
  const tagColor = (tag: string) => {
    const translated = tx.tags[tag] || tag;
    if (tag.includes("Available") || tag.includes("Today") || translated.includes("ලබා ගත හැක") || translated.includes("අද")) return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (tag.includes("Next") || translated.includes("ඊළඟ")) return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-blue-50 text-blue-700 border-blue-200";
  };

  const matchBarGradient = (pct: number) => {
    if (pct >= 90) return "from-blue-500 to-emerald-400";
    if (pct >= 80) return "from-blue-500 to-blue-400";
    if (pct >= 70) return "from-blue-500 to-amber-400";
    return "from-blue-500 to-orange-400";
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
            <Link href="/" className="text-sm font-medium text-gray-500 hover:text-[#1B3A6B] transition-colors">{tx.dashboard}</Link>
            <Link href="/find-lawyer" className="text-sm font-bold text-[#1B3A6B] relative after:content-[''] after:absolute after:-bottom-1.5 after:left-1/2 after:-translate-x-1/2 after:w-6 after:h-[3px] after:bg-[#1B3A6B] after:rounded-full">{tx.findLawyer}</Link>
            <Link href="#" className="text-sm font-medium text-gray-500 hover:text-[#1B3A6B] transition-colors">{tx.chatAi}</Link>
            <Link href="#" className="text-sm font-medium text-gray-500 hover:text-[#1B3A6B] transition-colors">{tx.userGuide}</Link>
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
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#111827] tracking-tight">{tx.title}</h1>
          <p className="text-gray-500 mt-2 text-base">{tx.subtitle}</p>
        </div>

        {/* ─── AI Case Intake ─── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-8 overflow-hidden">
          <div className="px-6 pt-5 pb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
            <Sparkles className="w-4 h-4 text-blue-600" />
            {tx.caseIntakeTitle}
          </div>
          <div className="px-6 pb-5">
            <textarea
              ref={textareaRef}
              value={caseText}
              onChange={(e) => setCaseText(e.target.value)}
              rows={3}
              placeholder={tx.placeholder}
              className="w-full resize-none border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all bg-gray-50"
            />
          </div>

          {/* AI info note */}
          <div className="px-6 pb-4 flex items-start gap-2 text-xs text-gray-500">
            <Sparkles className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
            <span>{tx.aiNote}</span>
          </div>

          {/* ─── AI-Detected Suggestions ─── */}
          <div className="px-6 pb-6 space-y-4">
            <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">{tx.suggestionsTitle}</p>

            {/* Case type row */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 min-w-[80px]">{tx.caseType}</span>
              {caseSuggestions.map((s, i) => (
                <button
                  key={s.label}
                  onClick={() => toggleSuggestion(i)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all hover:scale-[1.03] active:scale-100 ${s.color}`}
                >
                  {s.selected && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {tx.suggestions[caseSuggestions.indexOf(s)] || s.label}
                </button>
              ))}
            </div>

            {/* Location row */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 min-w-[80px]">{tx.location}</span>
              {locationSuggestions.map((s) => (
                <span key={s.label} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${s.color}`}>
                  {s.selected && <MapPin className="w-3.5 h-3.5" />}
                  {tx.locations[locationSuggestions.indexOf(s)] || s.label}
                </span>
              ))}
            </div>

            {/* Budget row */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 min-w-[80px]">{tx.budget}</span>
              {budgetSuggestions.map((s) => (
                <span key={s.label} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${s.color}`}>
                  {s.selected && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {tx.budgets[budgetSuggestions.indexOf(s)] || s.label}
                </span>
              ))}
            </div>

            {/* Language row */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 min-w-[80px]">{tx.language}</span>
              {langSuggestions.map((s) => (
                <span key={s.label} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${s.color}`}>
                  {s.selected && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {tx.languages[langSuggestions.indexOf(s)] || s.label}
                </span>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="px-6 pb-6 flex flex-wrap items-center gap-3">
            <button
              onClick={handleSearch}
              className="inline-flex items-center gap-2 bg-[#1B3A6B] hover:bg-[#112549] text-white px-6 py-3 rounded-xl font-semibold text-sm shadow-lg shadow-blue-900/20 hover:shadow-blue-900/30 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              <Search className="w-4 h-4" />
              {tx.findBtn}
            </button>
            <button
              onClick={handleClear}
              className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-5 py-3 rounded-xl font-semibold text-sm transition-colors"
            >
              <X className="w-4 h-4" />
              {tx.clearBtn}
            </button>
          </div>
        </div>

        {/* ─── Refine Filters Bar ─── */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {tx.refine}
          </div>
          {tx.filters.map((f) => (
            <button key={f} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors">
              {f}
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>
          ))}
          <button className="ml-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            <ArrowUpDown className="w-3.5 h-3.5" />
            {tx.sortBestMatch}
          </button>
        </div>

        {/* ─── Results heading ─── */}
        {showResults && (
          <>
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="text-2xl font-extrabold text-[#111827]">{tx.matchedLawyers}</h2>
                <p className="text-sm text-gray-400 font-medium mt-0.5">{tx.aiRanked}</p>
              </div>
              <span className="text-sm font-semibold text-gray-500">{allLawyers.length} {tx.resultsFound}</span>
            </div>

            {/* ─── Lawyer Cards Grid ─── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {allLawyers.map((lawyer, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all p-6 flex flex-col relative group"
                >
                  {/* Badge */}
                  {lawyer.badge && (
                    <span className="absolute top-5 right-5 bg-green-100 text-green-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-green-200">
                      🏆 {tx.topMatch}
                    </span>
                  )}

                  {/* Header row */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-full ${lawyer.initialsColor} text-white flex items-center justify-center font-bold text-sm shrink-0`}>
                      {lawyer.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{lawyer.name}</h3>
                      <p className="text-sm font-semibold text-blue-700">{tx.specialties[lawyer.specialty] || lawyer.specialty}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {lawyer.location}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-1.5">
                        {lawyer.languages.map((l: string) => (
                          <span key={l} className="text-[10px] font-semibold text-gray-500 bg-gray-50 px-2 py-0.5 rounded">{l}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* AI Match bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                      <span className="text-gray-500">{tx.aiMatch}</span>
                      <span className="text-gray-800">{lawyer.matchPercent}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${matchBarGradient(lawyer.matchPercent)} transition-all duration-700`}
                        style={{ width: `${lawyer.matchPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    {lawyer.tags.map((tag: string) => (
                      <span key={tag} className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${tagColor(tag)}`}>
                        {tx.tags[tag] || tag}
                      </span>
                    ))}
                  </div>

                  {/* Bottom row */}
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
                    <div>
                      <span className="text-base font-bold text-gray-900">{lawyer.rate}</span>
                      <span className="text-xs text-gray-400 ml-1">{tx.perHour}</span>
                      {lawyer.verified && (
                        <div className="flex items-center gap-1 text-[10px] text-green-600 font-semibold mt-0.5">
                          <Shield className="w-3 h-3" />
                          {tx.barCouncil}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="font-bold text-gray-800">{lawyer.rating}</span>
                        <span className="text-xs text-gray-400">({lawyer.reviews})</span>
                      </div>
                      <button 
                        onClick={() => {
                          const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
                          if (isLoggedIn) {
                            if (lawyer.id) {
                              router.push(`/lawyers/${lawyer.id}`);
                            } else {
                              router.push(`/lawyers/kavinda-perera`);
                            }
                          } else {
                            router.push("/login");
                          }
                        }}
                        className="bg-[#1B3A6B] hover:bg-[#112549] text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors shadow-sm"
                      >
                        {tx.bookBtn}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* ─── Footer ─── */}
      <Footer />
    </div>
  );
}
