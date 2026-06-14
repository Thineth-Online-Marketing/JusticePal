"use client";
import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "../context/LanguageContext";

const content = {
  en: {
    pill: "Sri Lanka's Premier AI Legal Assistant",
    title1: "Legal clarity for",
    title2: "every citizen.",
    subtitle: "Navigate the Sri Lankan legal system with confidence. Get instant AI guidance in plain language or seamlessly connect with verified top-tier attorneys.",
    placeholder: "e.g., I need help with a property dispute...",
    btnConsult: "Consult AI Now",
    popular: "Popular:",
    queries: ["General Queries", "Notaries", "Board Trustees", "Labor Tribunals"],
  },
  si: {
    pill: "ශ්‍රී ලංකාවේ ප්‍රමුඛ AI නීති සහායකයා",
    title1: "සෑම පුරවැසියෙකුටම",
    title2: "නීති පැහැදිලිකම.",
    subtitle: "විශ්වාසයෙන් ශ්‍රී ලාංකික නීති ක්‍රමය ඔස්සේ ගමන් කරන්න. AI මාර්ගෝපදේශය ලබාගන්න හෝ සත්‍යාපිත නීතිඥයින් සමඟ සම්බන්ධ වන්න.",
    placeholder: "උදා: මට ඉඩම් ආරවුලක් ගැන උදව් අවශ්‍යයි...",
    btnConsult: "AI ට විමසන්න",
    popular: "ජනප්‍රිය:",
    queries: ["සාමාන්‍ය විමසුම්", "නොතාරිස්", "භාරකාර මණ්ඩල", "කම්කරු අධිකරණ"],
  },
};

export default function HeroSection() {
  const [searchValue, setSearchValue] = useState("");
  const { lang } = useLanguage();
  const tx = content[lang as keyof typeof content] || content.en;

  return (
    <section className="relative w-full pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden bg-gradient-to-b from-blue-50 via-white to-white">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 transform translate-x-1/3 -translate-y-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-100/60 rounded-full mix-blend-multiply filter blur-3xl opacity-70 transform -translate-x-1/2 translate-y-1/4 pointer-events-none" />

      <div className="relative max-w-[1200px] mx-auto px-6 text-center z-10 flex flex-col items-center">
        
        {/* Trust Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-900/5 border border-blue-900/10 mb-8 backdrop-blur-sm animate-fade-in-up">
          <span className="text-xs">⚖️</span>
          <span className="text-xs font-medium tracking-wide text-blue-900">
            {tx.pill}
          </span>
        </div>

        {/* Dynamic Title */}
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-6 animate-fade-in-up animation-delay-100">
          {tx.title1}{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-900 to-blue-600 inline-block px-1">
            {tx.title2}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up animation-delay-200">
          {tx.subtitle}
        </p>

        {/* Search Bar Container */}
        <div className="w-full max-w-3xl mx-auto mb-8 animate-fade-in-up animation-delay-300">
          <div className="flex flex-col sm:flex-row items-center bg-white p-2 md:p-3 rounded-2xl shadow-xl shadow-blue-900/5 border border-gray-100 focus-within:ring-4 focus-within:ring-blue-500/20 focus-within:border-blue-400 transition-all duration-300">
            
            <div className="flex w-full items-center pl-4 pr-2 py-2 flex-grow">
              <svg className="w-5 h-5 text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={tx.placeholder}
                className="w-full bg-transparent border-none outline-none pl-4 text-base md:text-lg text-gray-800 placeholder:text-gray-400"
              />
            </div>
            
            <Link
              href={`/ai?q=${encodeURIComponent(searchValue)}`}
              className="w-full sm:w-auto mt-3 sm:mt-0 px-8 py-4 bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-800 hover:to-blue-600 text-white font-semibold rounded-xl shadow-md transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10z"/>
                <path d="M12 16v-4"/>
                <path d="M12 8h.01"/>
              </svg>
              {tx.btnConsult}
            </Link>
          </div>
        </div>

        {/* Quick Queries Tags */}
        <div className="flex flex-wrap items-center justify-center gap-3 animate-fade-in-up animation-delay-400">
          <span className="text-sm font-medium text-gray-500">{tx.popular}</span>
          {tx.queries.map((q) => (
            <button
              key={q}
              onClick={() => setSearchValue(q)}
              className="text-xs md:text-sm px-4 py-2 rounded-full border border-gray-200 bg-white text-gray-600 hover:border-blue-900 hover:text-blue-900 hover:bg-blue-50 transition-all duration-200 shadow-sm"
            >
              {q}
            </button>
          ))}
        </div>
        
      </div>
    </section>
  );
}
