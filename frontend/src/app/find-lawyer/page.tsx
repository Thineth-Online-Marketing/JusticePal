"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLanguage } from "../context/LanguageContext";
import {
  Search, X, Sparkles, MapPin, Star, ChevronDown,
  SlidersHorizontal, CheckCircle2, ArrowUpDown, Shield,
  Filter
} from "lucide-react";
import Footer from "../components/Footer";
import ClientNavbar from "../components/ClientNavbar";
import { useAuth } from "../context/AuthContext";
import { useUI } from "../context/UIContext";
import LawyerCardSkeleton from "../components/LawyerCardSkeleton";

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

interface Suggestion {
  label: string;
  selected: boolean;
  color: string;
}

interface LawyerCard {
  id?: string;
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
  rateNumeric: number;
  rating: number;
  reviews: number;
  verified: boolean;
  badge?: string;
}

interface FilterState {
  searchQuery: string;
  specialties: string[];
  locations: string[];
  budgetMin: number;
  budgetMax: number;
  ratingMin: number;
  languages: string[];
}

const SPECIALTY_OPTIONS = ["Criminal", "Civil", "Corporate", "Tenancy & Property", "Real Estate & Land"];
const LOCATION_OPTIONS = ["Colombo", "Kandy", "Galle", "Gampaha"];
const BUDGET_OPTIONS = [
  { label: "Under LKR 5,000", min: 0, max: 5000 },
  { label: "LKR 5,000 - 10,000", min: 5000, max: 10000 },
  { label: "LKR 10,000 - 30,000", min: 10000, max: 30000 },
  { label: "LKR 30,000+", min: 30000, max: Infinity },
];
const RATING_OPTIONS = [4.5, 4.0, 3.5, 3.0];

const SUGGESTION_TO_SPECIALTY: Record<string, string> = {
  "Tenancy Law": "Tenancy & Property",
  "Property Law": "Real Estate & Land",
  "Contract Dispute": "Civil",
};

const MOCK_SUGGESTIONS: Suggestion[] = [
  { label: "Tenancy Law", selected: false, color: "bg-gray-100 text-gray-700 border-gray-200" },
  { label: "Property Law", selected: false, color: "bg-gray-100 text-gray-700 border-gray-200" },
  { label: "Contract Dispute", selected: false, color: "bg-gray-100 text-gray-700 border-gray-200" },
];

const MOCK_LOCATION_SUGGESTIONS: Suggestion[] = [
  { label: "Colombo", selected: false, color: "bg-gray-100 text-gray-700 border-gray-200" },
  { label: "Gampaha", selected: false, color: "bg-gray-100 text-gray-700 border-gray-200" },
];

const MOCK_BUDGET_SUGGESTIONS: Suggestion[] = [
  { label: "Under LKR 30,000", selected: false, color: "bg-gray-100 text-gray-700 border-gray-200" },
  { label: "LKR 30k-60k", selected: false, color: "bg-gray-100 text-gray-700 border-gray-200" },
];

const BUDGET_SUGGESTION_MAP: Record<string, { min: number; max: number }> = {
  "Under LKR 30,000": { min: 0, max: 30000 },
  "LKR 30k-60k": { min: 30000, max: 60000 },
};

const MOCK_LANGUAGE_SUGGESTIONS: Suggestion[] = [
  { label: "English", selected: false, color: "bg-gray-100 text-gray-700 border-gray-200" },
  { label: "Sinhala", selected: false, color: "bg-gray-100 text-gray-700 border-gray-200" },
];

function parseRate(rate: string): number {
  const cleaned = rate.replace(/[^0-9]/g, "");
  return parseInt(cleaned, 10) || 0;
}

function extractCity(location: string): string {
  return location.split("·")[0].replace(/\d+/g, "").trim();
}

function matchesSpecialty(lawyer: LawyerCard, specialties: string[]): boolean {
  if (specialties.length === 0) return true;
  const lowerSpec = lawyer.specialty.toLowerCase();
  const lowerTags = lawyer.tags.map(t => t.toLowerCase());
  return specialties.some(s => {
    const ls = s.toLowerCase();
    return lowerSpec.includes(ls) || lowerTags.some(t => t.includes(ls));
  });
}

function matchesLocation(lawyer: LawyerCard, locations: string[]): boolean {
  if (locations.length === 0) return true;
  const city = extractCity(lawyer.location).toLowerCase();
  return locations.some(l => city.includes(l.toLowerCase()));
}

function matchesBudget(lawyer: LawyerCard, min: number, max: number): boolean {
  if (min === 0 && max === Infinity) return true;
  return lawyer.rateNumeric >= min && lawyer.rateNumeric <= max;
}

function matchesRating(lawyer: LawyerCard, ratingMin: number): boolean {
  if (ratingMin === 0) return true;
  return lawyer.rating >= ratingMin;
}

function matchesSearch(lawyer: LawyerCard, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.toLowerCase();
  return (
    lawyer.name.toLowerCase().includes(q) ||
    lawyer.specialty.toLowerCase().includes(q) ||
    lawyer.tags.some(t => t.toLowerCase().includes(q)) ||
    lawyer.location.toLowerCase().includes(q)
  );
}

function matchesLanguage(lawyer: LawyerCard, languages?: string[]): boolean {
  if (!languages || languages.length === 0) return true;
  if (!lawyer.languages) return false;
  return languages.some(l => lawyer.languages.some(ll => ll.toLowerCase() === l.toLowerCase()));
}

const MOCK_LAWYERS: LawyerCard[] = [
  {
    initials: "SR", initialsColor: "bg-orange-500",
    name: "Samantha Rodrigo", specialty: "Tenancy & Property Law",
    location: "Colombo 07 · 18 yrs exp", experience: "18 yrs",
    languages: ["English", "Sinhala"], matchPercent: 94,
    tags: ["Tenancy Disputes", "Deposit Recovery", "Contract Review", "Available Today"],
    rate: "LKR 8,500", rateNumeric: 8500, rating: 4.9, reviews: 142, verified: true, badge: "Top Match",
  },
  {
    initials: "KP", initialsColor: "bg-blue-600",
    name: "Kasun Perera", specialty: "Property & Civil Litigation",
    location: "Colombo 03 · 12 yrs exp", experience: "12 yrs",
    languages: ["Sinhala", "English"], matchPercent: 87,
    tags: ["Property Disputes", "Civil Litigation", "Available This Week"],
    rate: "LKR 6,000", rateNumeric: 6000, rating: 4.7, reviews: 98, verified: true,
  },
  {
    initials: "NF", initialsColor: "bg-indigo-600",
    name: "Nimesha Fernando", specialty: "Tenancy & Consumer Rights",
    location: "Colombo 05 · 9 yrs exp", experience: "9 yrs",
    languages: ["English", "Tamil", "Sinhala"], matchPercent: 81,
    tags: ["Rental Agreements", "Consumer Law", "Available Today"],
    rate: "LKR 5,500", rateNumeric: 5500, rating: 4.8, reviews: 67, verified: true,
  },
  {
    initials: "RW", initialsColor: "bg-rose-600",
    name: "Rajith Wijesuriya", specialty: "Real Estate & Land Law",
    location: "Colombo 02 · 22 yrs exp", experience: "22 yrs",
    languages: ["English", "Sinhala"], matchPercent: 74,
    tags: ["Land Disputes", "Real Estate", "Next Week"],
    rate: "LKR 12,000", rateNumeric: 12000, rating: 4.6, reviews: 211, verified: true,
  },
  {
    initials: "DM", initialsColor: "bg-emerald-600",
    name: "Dilshan Mendis", specialty: "Criminal Law",
    location: "Kandy · 15 yrs exp", experience: "15 yrs",
    languages: ["Sinhala", "English"], matchPercent: 88,
    tags: ["Criminal Law", "Available This Week"],
    rate: "LKR 7,000", rateNumeric: 7000, rating: 4.5, reviews: 89, verified: true,
  },
  {
    initials: "AF", initialsColor: "bg-violet-600",
    name: "Amaya Fernando", specialty: "Corporate Law",
    location: "Colombo 01 · 20 yrs exp", experience: "20 yrs",
    languages: ["English", "Sinhala"], matchPercent: 82,
    tags: ["Corporate Law", "Contract Review", "Available Today"],
    rate: "LKR 15,000", rateNumeric: 15000, rating: 4.8, reviews: 156, verified: true,
  },
  {
    initials: "PS", initialsColor: "bg-amber-600",
    name: "Priya Silva", specialty: "Civil Law",
    location: "Galle · 11 yrs exp", experience: "11 yrs",
    languages: ["Sinhala", "English"], matchPercent: 79,
    tags: ["Civil Litigation", "Property Disputes", "Next Week"],
    rate: "LKR 4,500", rateNumeric: 4500, rating: 4.3, reviews: 52, verified: true,
  },
  {
    initials: "TJ", initialsColor: "bg-cyan-600",
    name: "Tharindu Jayawardena", specialty: "Criminal Law",
    location: "Galle · 8 yrs exp", experience: "8 yrs",
    languages: ["Sinhala", "English", "Tamil"], matchPercent: 76,
    tags: ["Criminal Law", "Available Today"],
    rate: "LKR 3,500", rateNumeric: 3500, rating: 4.1, reviews: 34, verified: true,
  },
];

const INITIAL_FILTERS: FilterState = {
  searchQuery: "",
  specialties: [],
  locations: [],
  budgetMin: 0,
  budgetMax: Infinity,
  ratingMin: 0,
  languages: [],
};

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function FindLawyerPage() {
  const { user, loading: authLoading } = useAuth();
  const { isLoading, setIsLoading, showToast } = useUI();
  const [roleLoading, setRoleLoading] = useState(true);
  const { lang, toggle } = useLanguage();
  const tx = translations[lang as keyof typeof translations] || translations.en;
  const [caseText, setCaseText] = useState("");
  const [showResults, setShowResults] = useState(true);
  const [caseSuggestions, setCaseSuggestions] = useState(MOCK_SUGGESTIONS);
  const [locationSuggestions, setLocationSuggestions] = useState(MOCK_LOCATION_SUGGESTIONS);
  const [budgetSuggestions, setBudgetSuggestions] = useState(MOCK_BUDGET_SUGGESTIONS);
  const [langSuggestions, setLangSuggestions] = useState(MOCK_LANGUAGE_SUGGESTIONS);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();
  const [showSidebar, setShowSidebar] = useState(false);

  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [dbLawyers, setDbLawyers] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState<"match" | "rating" | "price-low" | "price-high">("match");

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
          `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/users/profile`,
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

  useEffect(() => {
    if (roleLoading) return;
    const fetchLawyers = async () => {
      setIsLoading(true);
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
            rateNumeric: l.hourlyRate || 5000,
            rating: 4.9,
            reviews: 14,
            verified: l.isVerified,
          }));
          setDbLawyers(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch lawyers", err);
        showToast("Failed to fetch lawyers", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchLawyers();
  }, [lang, roleLoading, setIsLoading, showToast]);

  const allLawyers: LawyerCard[] = useMemo(() => {
    return [...dbLawyers, ...MOCK_LAWYERS];
  }, [dbLawyers]);

  const filteredLawyers = useMemo(() => {
    let result = allLawyers.filter(lawyer => {
      if (!matchesSearch(lawyer, filters.searchQuery)) return false;
      if (!matchesSpecialty(lawyer, filters.specialties)) return false;
      if (!matchesLocation(lawyer, filters.locations)) return false;
      if (!matchesBudget(lawyer, filters.budgetMin, filters.budgetMax)) return false;
      if (!matchesRating(lawyer, filters.ratingMin)) return false;
      if (!matchesLanguage(lawyer, filters.languages)) return false;
      return true;
    });

    switch (sortBy) {
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "price-low":
        result.sort((a, b) => a.rateNumeric - b.rateNumeric);
        break;
      case "price-high":
        result.sort((a, b) => b.rateNumeric - a.rateNumeric);
        break;
      default:
        result.sort((a, b) => b.matchPercent - a.matchPercent);
    }

    return result;
  }, [allLawyers, filters, sortBy]);

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

  const toggleSuggestion = (idx: number) => {
    const suggestion = caseSuggestions[idx];
    const newSelected = !suggestion.selected;
    setCaseSuggestions(prev =>
      prev.map((s, i) =>
        i === idx
          ? {
              ...s,
              selected: newSelected,
              color: newSelected
                ? "bg-blue-100 text-blue-800 border-blue-300"
                : "bg-gray-100 text-gray-700 border-gray-200",
            }
          : s
      )
    );
    const filterKey = SUGGESTION_TO_SPECIALTY[suggestion.label];
    if (filterKey) {
      setFilters(prev => ({
        ...prev,
        specialties: newSelected
          ? [...prev.specialties.filter(s => s !== filterKey), filterKey]
          : prev.specialties.filter(s => s !== filterKey),
      }));
    }
  };

  const toggleLocationSuggestion = (idx: number) => {
    const suggestion = locationSuggestions[idx];
    const newSelected = !suggestion.selected;
    setLocationSuggestions(prev =>
      prev.map((s, i) =>
        i === idx
          ? {
              ...s,
              selected: newSelected,
              color: newSelected
                ? "bg-green-100 text-green-800 border-green-300"
                : "bg-gray-100 text-gray-700 border-gray-200",
            }
          : s
      )
    );
    setFilters(prev => ({
      ...prev,
      locations: newSelected
        ? [...prev.locations.filter(l => l !== suggestion.label), suggestion.label]
        : prev.locations.filter(l => l !== suggestion.label),
    }));
  };

  const toggleBudgetSuggestion = (idx: number) => {
    const suggestion = budgetSuggestions[idx];
    const newSelected = !suggestion.selected;
    setBudgetSuggestions(prev =>
      prev.map((s, i) =>
        i === idx
          ? {
              ...s,
              selected: newSelected,
              color: newSelected
                ? "bg-purple-100 text-purple-800 border-purple-300"
                : "bg-gray-100 text-gray-700 border-gray-200",
            }
          : { ...s, selected: false, color: "bg-gray-100 text-gray-700 border-gray-200" }
      )
    );
    const range = BUDGET_SUGGESTION_MAP[suggestion.label];
    if (newSelected && range) {
      setFilters(prev => ({ ...prev, budgetMin: range.min, budgetMax: range.max }));
    } else {
      setFilters(prev => ({ ...prev, budgetMin: 0, budgetMax: Infinity }));
    }
  };

  const toggleLanguageSuggestion = (idx: number) => {
    const suggestion = langSuggestions[idx];
    const newSelected = !suggestion.selected;
    setLangSuggestions(prev =>
      prev.map((s, i) =>
        i === idx
          ? {
              ...s,
              selected: newSelected,
              color: newSelected
                ? "bg-orange-100 text-orange-800 border-orange-300"
                : "bg-gray-100 text-gray-700 border-gray-200",
            }
          : s
      )
    );
    setFilters(prev => ({
      ...prev,
      languages: newSelected
        ? [...(prev.languages || []).filter(l => l !== suggestion.label), suggestion.label]
        : (prev.languages || []).filter(l => l !== suggestion.label),
    }));
  };

  const handleClear = () => {
    setCaseText("");
    setShowResults(false);
    clearAllFilters();
    setCaseSuggestions(MOCK_SUGGESTIONS);
    setLocationSuggestions(MOCK_LOCATION_SUGGESTIONS);
    setBudgetSuggestions(MOCK_BUDGET_SUGGESTIONS);
    setLangSuggestions(MOCK_LANGUAGE_SUGGESTIONS);
  };

  const handleSearch = () => {
    setShowResults(true);
  };

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
    <div className="min-h-screen flex flex-col bg-[#f8fafc] font-sans">
      <ClientNavbar />

      <main className="flex-1 max-w-[1100px] w-full mx-auto px-6 pt-28 pb-16">
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
            <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">{tx.suggestionsTitle}</p>

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

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 min-w-[80px]">{tx.location}</span>
              {locationSuggestions.map((s, i) => (
                <button
                  key={s.label}
                  onClick={() => toggleLocationSuggestion(i)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all hover:scale-[1.03] active:scale-100 cursor-pointer ${s.color}`}
                >
                  {s.selected && <MapPin className="w-3.5 h-3.5" />}
                  {tx.locations[locationSuggestions.indexOf(s)] || s.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 min-w-[80px]">{tx.budget}</span>
              {budgetSuggestions.map((s, i) => (
                <button
                  key={s.label}
                  onClick={() => toggleBudgetSuggestion(i)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all hover:scale-[1.03] active:scale-100 cursor-pointer ${s.color}`}
                >
                  {s.selected && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {tx.budgets[budgetSuggestions.indexOf(s)] || s.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 min-w-[80px]">{tx.language}</span>
              {langSuggestions.map((s, i) => (
                <button
                  key={s.label}
                  onClick={() => toggleLanguageSuggestion(i)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all hover:scale-[1.03] active:scale-100 cursor-pointer ${s.color}`}
                >
                  {s.selected && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {tx.languages[langSuggestions.indexOf(s)] || s.label}
                </button>
              ))}
            </div>
          </div>

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
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowSidebar(!showSidebar)}
                  className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${
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
                <div className="relative group">
                  <button className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
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
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors first:rounded-t-xl last:rounded-b-xl ${
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

            <div className="flex gap-6">
              {showSidebar && (
                <aside className="w-64 shrink-0 space-y-6">
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
                  <span className="text-sm font-semibold text-gray-500">{filteredLawyers.length} {tx.resultsFound}</span>
                </div>

                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map(idx => (
                      <LawyerCardSkeleton key={idx} />
                    ))}
                  </div>
                ) : filteredLawyers.length === 0 ? (
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredLawyers.map((lawyer, idx) => (
                      <div
                        key={`${lawyer.name}-${idx}`}
                        className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all p-6 flex flex-col relative group"
                      >
                        {lawyer.badge && (
                          <span className="absolute top-5 right-5 bg-green-100 text-green-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-green-200">
                            🏆 {tx.topMatch}
                          </span>
                        )}

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

                        <div className="flex flex-wrap gap-2 mb-5">
                          {lawyer.tags.map((tag: string) => (
                            <span key={tag} className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${tagColor(tag)}`}>
                              {tx.tags[tag] || tag}
                            </span>
                          ))}
                        </div>

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
                                if (user) {
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
