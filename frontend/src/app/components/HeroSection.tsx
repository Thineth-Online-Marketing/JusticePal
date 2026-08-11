"use client";
import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "../hooks/useTranslation";
import { Search } from "lucide-react";
import Image from "next/image";

export default function HeroSection() {
  const [searchValue, setSearchValue] = useState("");
  const { t } = useTranslation();
  const queries = t("landing.hero.queries", { returnObjects: true }) as string[];

  return (
    <section className="relative w-full pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden bg-gradient-to-b from-blue-50 via-white to-white">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 transform translate-x-1/3 -translate-y-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-100/60 rounded-full mix-blend-multiply filter blur-3xl opacity-70 transform -translate-x-1/2 translate-y-1/4 pointer-events-none" />

      <div className="relative max-w-[1200px] mx-auto px-6 text-center z-10 flex flex-col items-center">
        
        {/* Trust Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50/50 backdrop-blur-md border border-blue-100/50 mb-8 animate-fade-in-up">
          <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
          <span className="text-sm font-semibold text-[#1B3A6B] tracking-wide">{t("landing.hero.pill")}</span>
        </div>

        {/* Dynamic Title */}
        <h1 className="text-5xl md:text-7xl font-extrabold text-[#1B3A6B] leading-[1.1] mb-6 tracking-tight animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          {t("landing.hero.title1")} <br className="hidden md:block"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{t("landing.hero.title2")}</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl leading-relaxed mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {t("landing.hero.subtitle")}
        </p>

        {/* Search Bar Container */}
        <div className="w-full max-w-3xl mx-auto mb-8 animate-fade-in-up animation-delay-300">
          <div className="flex flex-col sm:flex-row gap-3 p-2 bg-white rounded-2xl shadow-xl shadow-blue-900/5 border border-gray-100 mb-6">
            <div className="flex-1 flex items-center gap-3 px-4 py-3 sm:py-0">
              <Search className="w-6 h-6 text-blue-400" />
              <input 
                type="text" 
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={t("landing.hero.placeholder")}
                className="w-full bg-transparent border-none focus:outline-none text-gray-700 placeholder:text-gray-400 text-lg"
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
              {t("landing.hero.btnConsult")}
            </Link>
          </div>
        </div>

        {/* Quick Queries Tags */}
        <div className="flex flex-wrap items-center justify-center gap-3 animate-fade-in-up animation-delay-400">
          <span className="text-sm font-medium text-gray-500">{t("landing.hero.popular")}</span>
          {Array.isArray(queries) && queries.map((q: string) => (
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
