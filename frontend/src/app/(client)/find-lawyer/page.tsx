"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../context/LanguageContext";
import {
  Search, X, Sparkles, MapPin, Star, ChevronDown,
  SlidersHorizontal, CheckCircle2, ArrowUpDown, Shield,
  Filter, Loader2
} from "lucide-react";
import Footer from "../../components/Footer";
import { useAuth } from "../../context/AuthContext";
import { useUI } from "../../context/UIContext";
import LawyerCardSkeleton from "../../components/LawyerCardSkeleton";

// ---------------------------------------------------------------------------
// AI Service URL (FastAPI microservice)
// ---------------------------------------------------------------------------
const AI_SERVICE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || "http://localhost:8000";

// ---------------------------------------------------------------------------
// Types for AI service responses
// ---------------------------------------------------------------------------
interface AiSuggestions {
  case_type: string | null;
  location: string | null;
  budget: string | null;   // "Low" | "Medium" | "High" | null
  language: string | null; // "English" | "Sinhala" | null
}

interface MatchedLawyer {
  id: string;
  name: string;
  specialization: string;
  location: string;
  rating: number;
  bio: string;
  image_url: string;
  _score?: number;
}

// ---------------------------------------------------------------------------
// Reusable Chip component
// ---------------------------------------------------------------------------
function Chip({
  label,
  active,
  activeClass,
  icon,
  onClick,
}: {
  label: string;
  active: boolean;
  activeClass: string;
  icon?: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all hover:scale-[1.03] active:scale-100 cursor-pointer ${
        active ? activeClass : "bg-gray-100 text-gray-700 border-gray-200"
      }`}
    >
      {active && icon}
      {label}
    </button>
  );
}

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
      "Criminal Law": "Criminal Law", "Corporate Law": "Corporate Law",
    } as Record<string, string>,
    specialties: {
      "Tenancy & Property Law": "Tenancy & Property Law",
      "Property & Civil Litigation": "Property & Civil Litigation",
      "Tenancy & Consumer Rights": "Tenancy & Consumer Rights",
      "Real Estate & Land Law": "Real Estate & Land Law",
      "Criminal Law": "Criminal Law",
      "Civil Law": "Civil Law",
      "Corporate Law": "Corporate Law",
    } as Record<string, string>,
    searchPlaceholder: "Search lawyers by name, specialty...",
    filterTitle: "Filters",
    specialtyFilter: "Specialty",
    locationFilter: "Location",
    budgetFilter: "Budget (Hourly Rate)",
    ratingFilter: "Minimum Rating",
    clearAllFilters: "Clear All",
    activeFilters: "Active Filters:",
    noResults: "No lawyers match your current filters.",
    noResultsSub: "Try adjusting your search or removing some filters.",
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
      "Criminal Law": "අපරාධ නීතිය", "Corporate Law": "සාංගමික නීතිය",
    } as Record<string, string>,
    specialties: {
      "Tenancy & Property Law": "කුලී සහ දේපළ නීතිය",
      "Property & Civil Litigation": "දේපළ සහ සිවිල් නඩු",
      "Tenancy & Consumer Rights": "කුලී සහ පාරිභෝගික අයිතිවාසිකම්",
      "Real Estate & Land Law": "නිශ්චල දේපළ සහ ඉඩම් නීතිය",
      "Criminal Law": "අපරාධ නීතිය",
      "Civil Law": "සිවිල් නීතිය",
      "Corporate Law": "සාංගමික නීතිය",
    } as Record<string, string>,
    searchPlaceholder: "නම, විශේෂත්වය මගින් නීතිඥයින් සොයන්න...",
    filterTitle: "පෙරහන්",
    specialtyFilter: "විශේෂත්වය",
    locationFilter: "ස්ථානය",
    budgetFilter: "අයවැය (පැයක අනුපාතය)",
    ratingFilter: "අවම ශ්‍රේණිගත කිරීම",
    clearAllFilters: "සියල්ල මකන්න",
    activeFilters: "ක්‍රියාකාරී පෙරහන්:",
    noResults: "ඔබගේ පෙරහන් වලට ගැළපෙන නීතිඥයින් නැත.",
    noResultsSub: "ඔබගේ සෙවුම සකසන්න හෝ සමහර පෙරහන් ඉවත් කරන්න.",
  },
};

interface FilterState {
  searchQuery: string;
  specialties: string[];
  locations: string[];
  budgetMin: number;
  budgetMax: number;
  ratingMin: number;
  languages: string[];
}

const SPECIALTY_OPTIONS = ["Labour Law", "Property Law", "Corporate Law", "Criminal Law", "Family Law"];
const LOCATION_OPTIONS = ["Colombo", "Kandy", "Galle", "Matara"];
const BUDGET_OPTIONS = [
  { label: "Under LKR 5,000", min: 0, max: 5000 },
  { label: "LKR 5,000 - 10,000", min: 5000, max: 10000 },
  { label: "LKR 10,000 - 30,000", min: 10000, max: 30000 },
  { label: "LKR 30,000+", min: 30000, max: Infinity },
];
const RATING_OPTIONS = [4.5, 4.0, 3.5, 3.0];



const INITIAL_FILTERS: FilterState = {
  searchQuery: "",
  specialties: [],
  locations: [],
  budgetMin: 0,
  budgetMax: Infinity,
  ratingMin: 0,
  languages: [],
};

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://justicepal-production.up.railway.app";

export default function FindLawyerPage() {
  const { user, loading: authLoading } = useAuth();
  const { isLoading, setIsLoading, showToast } = useUI();
  const [roleLoading, setRoleLoading] = useState(true);
  const { lang, toggle } = useLanguage();
  const tx = translations[lang as keyof typeof translations] || translations.en;
  const [caseText, setCaseText] = useState("");
  const [showResults, setShowResults] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();
  const [showSidebar, setShowSidebar] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [sortBy, setSortBy] = useState<"match" | "rating" | "price-low" | "price-high">("match");

  // --- AI chip state ---
  const [aiSuggestions, setAiSuggestions] = useState<AiSuggestions>({
    case_type: null, location: null, budget: null, language: null,
  });
  const [chipCaseType, setChipCaseType] = useState<string | null>(null);
  const [chipLocation, setChipLocation] = useState<string | null>(null);
  const [chipBudget, setChipBudget] = useState<string | null>(null);
  const [chipLanguage, setChipLanguage] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // --- Match result state ---
  const [matchedLawyers, setMatchedLawyers] = useState<MatchedLawyer[]>([]);
  const [matchLoading, setMatchLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!user || !isLoggedIn) {
      localStorage.removeItem("isLoggedIn");
      router.replace("/login");
      return;
    }

    const verifyClientRole = async () => {
      try {
        const idToken = await user.getIdToken();
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL || "https://justicepal-production.up.railway.app"}/api/users/profile`,
          {
            headers: { Authorization: `Bearer ${idToken}` },
          }
        );
        if (res.ok) {
          const data = await res.json();
          if (data.role === "client") {
            setRoleLoading(false);
          } else if (data.role === "lawyer") {
            router.replace("/lawyer-dashboard");
          } else if (data.role === "admin") {
            router.replace("/admin");
          } else {
            router.replace("/login");
          }
        } else {
          router.replace("/login");
        }
      } catch (err) {
        console.error("Failed to verify client role", err);
        router.replace("/login");
      }
    };

    verifyClientRole();
  }, [user, authLoading, router]);

  // -----------------------------------------------------------------------
  // Debounced AI extraction: 800ms after the user stops typing
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (!caseText.trim()) {
      setAiSuggestions({ case_type: null, location: null, budget: null, language: null });
      setChipCaseType(null);
      setChipLocation(null);
      setChipBudget(null);
      setChipLanguage(null);
      return;
    }

    const timer = setTimeout(async () => {
      setAiLoading(true);
      try {
        const res = await fetch(`${AI_SERVICE_URL}/api/v1/extract-case-details`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: caseText }),
        });
        if (res.ok) {
          const json = await res.json();
          const data: AiSuggestions = json.data;
          setAiSuggestions(data);
          // Auto-select all non-null chips
          setChipCaseType(data.case_type);
          setChipLocation(data.location);
          setChipBudget(data.budget);
          setChipLanguage(data.language);
        }
      } catch (err) {
        console.error("AI extraction failed", err);
      } finally {
        setAiLoading(false);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [caseText]);

  const activeFilterChips = useMemo(() => {
    const chips: { label: string; type: string; value: string }[] = [];
    filters.specialties.forEach(s => chips.push({ label: s, type: "specialty", value: s }));
    filters.locations.forEach(l => chips.push({ label: l, type: "location", value: l }));
    if (filters.budgetMin > 0 || filters.budgetMax < Infinity) {
      const match = BUDGET_OPTIONS.find(b => b.min === filters.budgetMin && b.max === filters.budgetMax);
      if (match) chips.push({ label: match.label, type: "budget", value: match.label });
    }
    if (filters.ratingMin > 0) {
      chips.push({ label: `${filters.ratingMin}+ ★`, type: "rating", value: String(filters.ratingMin) });
    }
    (filters.languages || []).forEach(l => chips.push({ label: l, type: "language", value: l }));
    if (filters.searchQuery.trim()) {
      chips.push({ label: `"${filters.searchQuery}"`, type: "search", value: filters.searchQuery });
    }
    return chips;
  }, [filters]);

  const removeChip = (chip: { type: string; value: string }) => {
    setFilters(prev => {
      switch (chip.type) {
        case "specialty":
          return { ...prev, specialties: prev.specialties.filter(s => s !== chip.value) };
        case "location":
          return { ...prev, locations: prev.locations.filter(l => l !== chip.value) };
        case "budget":
          return { ...prev, budgetMin: 0, budgetMax: Infinity };
        case "rating":
          return { ...prev, ratingMin: 0 };
        case "language":
          return { ...prev, languages: (prev.languages || []).filter(l => l !== chip.value) };
        case "search":
          return { ...prev, searchQuery: "" };
        default:
          return prev;
      }
    });
  };

  const clearAllFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  const toggleSpecialty = (specialty: string) => {
    setFilters(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty],
    }));
  };

  const toggleLocation = (location: string) => {
    setFilters(prev => ({
      ...prev,
      locations: prev.locations.includes(location)
        ? prev.locations.filter(l => l !== location)
        : [...prev.locations, location],
    }));
  };

  const setBudgetRange = (min: number, max: number) => {
    setFilters(prev => {
      if (prev.budgetMin === min && prev.budgetMax === max) {
        return { ...prev, budgetMin: 0, budgetMax: Infinity };
      }
      return { ...prev, budgetMin: min, budgetMax: max };
    });
  };

  const setRatingMin = (rating: number) => {
    setFilters(prev => ({
      ...prev,
      ratingMin: prev.ratingMin === rating ? 0 : rating,
    }));
  };

  // -----------------------------------------------------------------------
  // Clear & Search handlers
  // -----------------------------------------------------------------------
  const handleClear = () => {
    setCaseText("");
    setShowResults(false);
    setHasSearched(false);
    clearAllFilters();
    setAiSuggestions({ case_type: null, location: null, budget: null, language: null });
    setChipCaseType(null);
    setChipLocation(null);
    setChipBudget(null);
    setChipLanguage(null);
    setMatchedLawyers([]);
  };

  const handleSearch = async () => {
    setShowResults(true);
    setHasSearched(true);
    setMatchLoading(true);

    try {
      // Build the ai_suggestions payload from the CURRENT chip state
      const currentSuggestions: AiSuggestions = {
        case_type: chipCaseType,
        location: chipLocation,
        budget: chipBudget,
        language: chipLanguage,
      };

      // Build manual_filters from the sidebar dropdowns
      const manualFilters: Record<string, string | null> = {
        specialization: filters.specialties.length > 0 ? filters.specialties[0] : null,
        location: filters.locations.length > 0 ? filters.locations[0] : null,
        sort_by: sortBy === "rating" ? "rating" : "relevance",
      };

      const res = await fetch(`${AI_SERVICE_URL}/api/v1/match-lawyers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ai_suggestions: currentSuggestions,
          manual_filters: manualFilters,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setMatchedLawyers(json.lawyers || []);
      } else {
        showToast("Failed to match lawyers", "error");
      }
    } catch (err) {
      console.error("Match lawyers failed", err);
      showToast("Failed to connect to AI service", "error");
    } finally {
      setMatchLoading(false);
    }
  };

  const matchBarGradient = (pct: number) => {
    if (pct >= 90) return "from-blue-500 to-emerald-400";
    if (pct >= 80) return "from-blue-500 to-blue-400";
    if (pct >= 70) return "from-blue-500 to-amber-400";
    return "from-blue-500 to-orange-400";
  };

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <svg className="animate-spin h-10 w-10 text-[#1B3A6B]" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col font-sans">
      <main className="flex-1 max-w-[1100px] w-full mx-auto px-3 sm:px-6 pt-10 pb-16">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#111827] tracking-tight">{tx.title}</h1>
          <p className="text-gray-500 mt-2 text-base">{tx.subtitle}</p>
        </div>

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

          <div className="px-6 pb-4 flex items-start gap-2 text-xs text-gray-500">
            <Sparkles className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
            <span>{tx.aiNote}</span>
          </div>

          <div className="px-6 pb-6 space-y-4">
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">{tx.suggestionsTitle}</p>
              {aiLoading && (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-blue-600">
                  <Loader2 className="w-3 h-3 animate-spin" /> Analyzing...
                </span>
              )}
            </div>

            {/* Case Type chip */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 min-w-[80px]">{tx.caseType}</span>
              {aiSuggestions.case_type ? (
                <Chip
                  label={aiSuggestions.case_type}
                  active={chipCaseType === aiSuggestions.case_type}
                  activeClass="bg-blue-100 text-blue-800 border-blue-300"
                  icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                  onClick={() => setChipCaseType(prev => prev ? null : aiSuggestions.case_type)}
                />
              ) : (
                <span className="text-xs text-gray-400 italic">Type above to detect…</span>
              )}
            </div>

            {/* Location chip */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 min-w-[80px]">{tx.location}</span>
              {aiSuggestions.location ? (
                <Chip
                  label={aiSuggestions.location}
                  active={chipLocation === aiSuggestions.location}
                  activeClass="bg-green-100 text-green-800 border-green-300"
                  icon={<MapPin className="w-3.5 h-3.5" />}
                  onClick={() => setChipLocation(prev => prev ? null : aiSuggestions.location)}
                />
              ) : (
                <span className="text-xs text-gray-400 italic">Type above to detect…</span>
              )}
            </div>

            {/* Budget chip */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 min-w-[80px]">{tx.budget}</span>
              {aiSuggestions.budget ? (
                <Chip
                  label={aiSuggestions.budget}
                  active={chipBudget === aiSuggestions.budget}
                  activeClass="bg-purple-100 text-purple-800 border-purple-300"
                  icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                  onClick={() => setChipBudget(prev => prev ? null : aiSuggestions.budget)}
                />
              ) : (
                <span className="text-xs text-gray-400 italic">Type above to detect…</span>
              )}
            </div>

            {/* Language chip */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 min-w-[80px]">{tx.language}</span>
              {aiSuggestions.language ? (
                <Chip
                  label={aiSuggestions.language}
                  active={chipLanguage === aiSuggestions.language}
                  activeClass="bg-orange-100 text-orange-800 border-orange-300"
                  icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                  onClick={() => setChipLanguage(prev => prev ? null : aiSuggestions.language)}
                />
              ) : (
                <span className="text-xs text-gray-400 italic">Type above to detect…</span>
              )}
            </div>
          </div>

          <div className="px-6 pb-6 flex flex-wrap items-center gap-3">
            <button
              onClick={handleSearch}
              disabled={matchLoading}
              className="inline-flex items-center gap-2 bg-[#1B3A6B] hover:bg-[#112549] disabled:opacity-60 text-white px-6 py-3 rounded-xl font-semibold text-sm shadow-lg shadow-blue-900/20 hover:shadow-blue-900/30 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              {matchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
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

        {showResults && (
          <>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.searchQuery}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                  placeholder={tx.searchPlaceholder}
                  className="w-full pl-11 pr-10 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                />
                {filters.searchQuery && (
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, searchQuery: "" }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3 w-full lg:w-auto">
                {/* Desktop filter toggle */}
                <button
                  onClick={() => setShowSidebar(!showSidebar)}
                  className={`hidden lg:inline-flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${
                    showSidebar
                      ? "bg-[#1B3A6B] text-white border-[#1B3A6B]"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  {tx.filterTitle}
                  {activeFilterChips.length > 0 && (
                    <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                      showSidebar ? "bg-white text-[#1B3A6B]" : "bg-[#1B3A6B] text-white"
                    }`}>
                      {activeFilterChips.length}
                    </span>
                  )}
                </button>
                {/* Mobile filter toggle */}
                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className={`lg:hidden inline-flex items-center justify-center gap-2 flex-1 min-h-[44px] px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${
                    mobileFiltersOpen
                      ? "bg-[#1B3A6B] text-white border-[#1B3A6B]"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  {tx.filterTitle}
                  {activeFilterChips.length > 0 && (
                    <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                      mobileFiltersOpen ? "bg-white text-[#1B3A6B]" : "bg-[#1B3A6B] text-white"
                    }`}>
                      {activeFilterChips.length}
                    </span>
                  )}
                </button>
                <div className="relative group flex-1 lg:flex-none">
                  <button className="inline-flex items-center justify-center gap-1.5 w-full lg:w-auto min-h-[44px] px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                    <ArrowUpDown className="w-3.5 h-3.5" />
                    {sortBy === "match" && tx.sortBestMatch}
                    {sortBy === "rating" && "Sort: Rating"}
                    {sortBy === "price-low" && "Sort: Price ↑"}
                    {sortBy === "price-high" && "Sort: Price ↓"}
                  </button>
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-100 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                    {[
                      { key: "match" as const, label: "Best Match" },
                      { key: "rating" as const, label: "Highest Rating" },
                      { key: "price-low" as const, label: "Price: Low to High" },
                      { key: "price-high" as const, label: "Price: High to Low" },
                    ].map(opt => (
                      <button
                        key={opt.key}
                        onClick={() => setSortBy(opt.key)}
                        className={`w-full text-left px-4 py-2.5 text-sm min-h-[44px] transition-colors first:rounded-t-xl last:rounded-b-xl ${
                          sortBy === opt.key
                            ? "bg-blue-50 text-blue-700 font-semibold"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {activeFilterChips.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-6 p-4 bg-white rounded-xl border border-gray-100">
                <span className="text-xs font-semibold text-gray-500 mr-1">{tx.activeFilters}</span>
                {activeFilterChips.map((chip, idx) => (
                  <span
                    key={`${chip.type}-${chip.value}-${idx}`}
                    className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 transition-all hover:bg-blue-100 group"
                  >
                    {chip.label}
                    <button
                      onClick={() => removeChip(chip)}
                      className="w-4 h-4 rounded-full bg-blue-200/60 hover:bg-red-400 hover:text-white flex items-center justify-center transition-colors"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
                <button
                  onClick={clearAllFilters}
                  className="text-xs font-semibold text-red-500 hover:text-red-700 ml-2 transition-colors"
                >
                  {tx.clearAllFilters}
                </button>
              </div>
            )}

            {/* Mobile filters bottom sheet */}
            {mobileFiltersOpen && (
              <div className="fixed inset-0 z-50 lg:hidden">
                <div
                  className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                  onClick={() => setMobileFiltersOpen(false)}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl max-h-[80vh] flex flex-col animate-[slideUp_0.3s_ease-out]">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <h3 className="text-base font-bold text-gray-900">{tx.filterTitle}</h3>
                    <button
                      onClick={() => setMobileFiltersOpen(false)}
                      className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
                    <div>
                      <h4 className="text-xs font-bold tracking-wider text-gray-400 uppercase mb-3">{tx.specialtyFilter}</h4>
                      <div className="space-y-1">
                        {SPECIALTY_OPTIONS.map(spec => (
                          <label key={spec} className="flex items-center gap-3 cursor-pointer group min-h-[44px]">
                            <input
                              type="checkbox"
                              checked={filters.specialties.includes(spec)}
                              onChange={() => toggleSpecialty(spec)}
                              className="w-5 h-5 rounded border-gray-300 text-[#1B3A6B] focus:ring-[#1B3A6B] transition-colors"
                            />
                            <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{spec}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <hr className="border-gray-100" />
                    <div>
                      <h4 className="text-xs font-bold tracking-wider text-gray-400 uppercase mb-3">{tx.locationFilter}</h4>
                      <div className="space-y-1">
                        {LOCATION_OPTIONS.map(loc => (
                          <label key={loc} className="flex items-center gap-3 cursor-pointer group min-h-[44px]">
                            <input
                              type="checkbox"
                              checked={filters.locations.includes(loc)}
                              onChange={() => toggleLocation(loc)}
                              className="w-5 h-5 rounded border-gray-300 text-[#1B3A6B] focus:ring-[#1B3A6B] transition-colors"
                            />
                            <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{loc}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <hr className="border-gray-100" />
                    <div>
                      <h4 className="text-xs font-bold tracking-wider text-gray-400 uppercase mb-3">{tx.budgetFilter}</h4>
                      <div className="space-y-1">
                        {BUDGET_OPTIONS.map(opt => (
                          <label key={opt.label} className="flex items-center gap-3 cursor-pointer group min-h-[44px]">
                            <input
                              type="radio"
                              name="budget-mobile"
                              checked={filters.budgetMin === opt.min && filters.budgetMax === opt.max}
                              onChange={() => setBudgetRange(opt.min, opt.max)}
                              className="w-5 h-5 border-gray-300 text-[#1B3A6B] focus:ring-[#1B3A6B] transition-colors"
                            />
                            <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <hr className="border-gray-100" />
                    <div>
                      <h4 className="text-xs font-bold tracking-wider text-gray-400 uppercase mb-3">{tx.ratingFilter}</h4>
                      <div className="space-y-1">
                        {RATING_OPTIONS.map(r => (
                          <label key={r} className="flex items-center gap-3 cursor-pointer group min-h-[44px]">
                            <input
                              type="radio"
                              name="rating-mobile"
                              checked={filters.ratingMin === r}
                              onChange={() => setRatingMin(r)}
                              className="w-5 h-5 border-gray-300 text-[#1B3A6B] focus:ring-[#1B3A6B] transition-colors"
                            />
                            <span className="flex items-center gap-1 text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                              {r}+
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="px-5 py-4 border-t border-gray-100 flex gap-3">
                    {activeFilterChips.length > 0 && (
                      <button
                        onClick={clearAllFilters}
                        className="flex-1 min-h-[44px] py-3 bg-gray-50 hover:bg-gray-100 text-sm font-semibold text-gray-600 rounded-xl transition-colors"
                      >
                        {tx.clearAllFilters}
                      </button>
                    )}
                    <button
                      onClick={() => setMobileFiltersOpen(false)}
                      className={`${activeFilterChips.length > 0 ? 'flex-1' : 'w-full'} min-h-[44px] py-3 bg-[#1B3A6B] hover:bg-[#112549] text-white text-sm font-semibold rounded-xl transition-colors shadow-lg`}
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col lg:flex-row gap-6">
              {/* Desktop sidebar - hidden on mobile */}
              {showSidebar && (
                <aside className="hidden lg:block w-80 shrink-0 space-y-6">
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-6">
                    <div>
                      <h4 className="text-xs font-bold tracking-wider text-gray-400 uppercase mb-3">{tx.specialtyFilter}</h4>
                      <div className="space-y-2">
                        {SPECIALTY_OPTIONS.map(spec => (
                          <label key={spec} className="flex items-center gap-3 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={filters.specialties.includes(spec)}
                              onChange={() => toggleSpecialty(spec)}
                              className="w-4 h-4 rounded border-gray-300 text-[#1B3A6B] focus:ring-[#1B3A6B] transition-colors"
                            />
                            <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{spec}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <hr className="border-gray-100" />

                    <div>
                      <h4 className="text-xs font-bold tracking-wider text-gray-400 uppercase mb-3">{tx.locationFilter}</h4>
                      <div className="space-y-2">
                        {LOCATION_OPTIONS.map(loc => (
                          <label key={loc} className="flex items-center gap-3 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={filters.locations.includes(loc)}
                              onChange={() => toggleLocation(loc)}
                              className="w-4 h-4 rounded border-gray-300 text-[#1B3A6B] focus:ring-[#1B3A6B] transition-colors"
                            />
                            <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{loc}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <hr className="border-gray-100" />

                    <div>
                      <h4 className="text-xs font-bold tracking-wider text-gray-400 uppercase mb-3">{tx.budgetFilter}</h4>
                      <div className="space-y-2">
                        {BUDGET_OPTIONS.map(opt => (
                          <label key={opt.label} className="flex items-center gap-3 cursor-pointer group">
                            <input
                              type="radio"
                              name="budget"
                              checked={filters.budgetMin === opt.min && filters.budgetMax === opt.max}
                              onChange={() => setBudgetRange(opt.min, opt.max)}
                              className="w-4 h-4 border-gray-300 text-[#1B3A6B] focus:ring-[#1B3A6B] transition-colors"
                            />
                            <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <hr className="border-gray-100" />

                    <div>
                      <h4 className="text-xs font-bold tracking-wider text-gray-400 uppercase mb-3">{tx.ratingFilter}</h4>
                      <div className="space-y-2">
                        {RATING_OPTIONS.map(r => (
                          <label key={r} className="flex items-center gap-3 cursor-pointer group">
                            <input
                              type="radio"
                              name="rating"
                              checked={filters.ratingMin === r}
                              onChange={() => setRatingMin(r)}
                              className="w-4 h-4 border-gray-300 text-[#1B3A6B] focus:ring-[#1B3A6B] transition-colors"
                            />
                            <span className="flex items-center gap-1 text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                              {r}+
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {activeFilterChips.length > 0 && (
                      <>
                        <hr className="border-gray-100" />
                        <button
                          onClick={clearAllFilters}
                          className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 text-sm font-semibold text-gray-600 rounded-xl transition-colors"
                        >
                          {tx.clearAllFilters}
                        </button>
                      </>
                    )}
                  </div>
                </aside>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-extrabold text-[#111827]">{tx.matchedLawyers}</h2>
                    <p className="text-sm text-gray-400 font-medium mt-0.5">{tx.aiRanked}</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-500">{matchedLawyers.length} {tx.resultsFound}</span>
                </div>

                {matchLoading ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {[1, 2, 3, 4].map(idx => (
                      <LawyerCardSkeleton key={idx} />
                    ))}
                  </div>
                ) : !hasSearched ? (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-blue-50 rounded-full flex items-center justify-center">
                      <Sparkles className="w-7 h-7 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-700 mb-2">Describe your case above</h3>
                    <p className="text-sm text-gray-400">The AI will extract details, then click &quot;Find Matching Lawyers&quot;.</p>
                  </div>
                ) : matchedLawyers.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-50 rounded-full flex items-center justify-center">
                      <Search className="w-7 h-7 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-700 mb-2">{tx.noResults}</h3>
                    <p className="text-sm text-gray-400 mb-6">{tx.noResultsSub}</p>
                    <button
                      onClick={clearAllFilters}
                      className="inline-flex items-center gap-2 bg-[#1B3A6B] hover:bg-[#112549] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                    >
                      <X className="w-4 h-4" />
                      {tx.clearAllFilters}
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {matchedLawyers.map((lawyer, idx) => {
                      const matchPct = Math.round((lawyer._score || 0) * 100);
                      const initials = lawyer.name
                        .split(" ")
                        .map((n) => n.charAt(0))
                        .join("")
                        .slice(0, 2);
                      const initialsColors = [
                        "bg-orange-500", "bg-blue-600", "bg-indigo-600",
                        "bg-rose-600", "bg-emerald-600", "bg-violet-600",
                        "bg-amber-600", "bg-cyan-600", "bg-teal-600", "bg-pink-600",
                      ];
                      const initialsColor = initialsColors[idx % initialsColors.length];

                      return (
                        <div
                          key={`${lawyer.id}-${idx}`}
                          className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all p-4 sm:p-6 flex flex-col relative group overflow-hidden w-full"
                        >
                          {idx === 0 && matchPct >= 50 && (
                            <span className="absolute top-5 right-5 bg-green-100 text-green-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-green-200">
                              🏆 {tx.topMatch}
                            </span>
                          )}

                          <div className="flex items-start gap-3 sm:gap-4 mb-4">
                            {lawyer.image_url ? (
                              <img
                                src={lawyer.image_url}
                                alt={lawyer.name}
                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shrink-0"
                              />
                            ) : (
                              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${initialsColor} text-white flex items-center justify-center font-bold text-xs sm:text-sm shrink-0`}>
                                {initials}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors truncate">{lawyer.name}</h3>
                              <p className="text-xs sm:text-sm font-semibold text-blue-700 truncate">{lawyer.specialization}</p>
                              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                <span className="truncate">{lawyer.location}</span>
                              </div>
                            </div>
                          </div>

                          {/* AI match score bar */}
                          <div className="mb-4">
                            <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                              <span className="text-gray-500">{tx.aiMatch}</span>
                              <span className="text-gray-800">{matchPct}%</span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full bg-gradient-to-r ${matchBarGradient(matchPct)} transition-all duration-700`}
                                style={{ width: `${matchPct}%` }}
                              />
                            </div>
                          </div>

                          {/* Bio snippet */}
                          {lawyer.bio && (
                            <p className="text-xs text-gray-500 mb-4 line-clamp-2">{lawyer.bio}</p>
                          )}

                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-auto pt-3 border-t border-gray-50 gap-3 sm:gap-0">
                            <div className="flex items-center gap-1 text-sm">
                              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                              <span className="font-bold text-gray-800">{lawyer.rating}</span>
                            </div>
                            <button
                              onClick={() => {
                                if (user) {
                                  router.push(`/lawyers/${lawyer.id}`);
                                } else {
                                  router.push("/login");
                                }
                              }}
                              className="bg-[#1B3A6B] hover:bg-[#112549] text-white px-4 py-2.5 sm:py-2 rounded-lg text-xs font-semibold transition-colors shadow-sm min-h-[44px] sm:min-h-0 flex-1 sm:flex-none"
                            >
                              {tx.bookBtn}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
