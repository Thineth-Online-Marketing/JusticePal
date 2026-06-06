"use client";

import Image from "next/image";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useLanguage } from "../context/LanguageContext";

// ─── translations ────────────────────────────────────────────────────────────
const translations = {
  en: {
    // Hero
    heroLabel: "SOVEREIGN LEGAL INNOVATION",
    heroHeading: "Democratizing Legal Access for Every Sri Lankan",
    heroSubtitle:
      "JusticePal bridges the gap between citizens and legal experts through innovative AI-powered technology and a commitment to absolute transparency.",
    heroBtn: "Start Your Journey",
    stat1Number: "500+",
    stat1Label: "LAWYERS VERIFIED",
    stat2Number: "12,400+",
    stat2Label: "CASES HELPED",
    stat3Number: "45k+",
    stat3Label: "CONSULTATIONS COMPLETED",

    // Origin Story
    originLabel: "ORIGIN STORY",
    originHeading: "Born from a Need for\nAccessible Justice",
    originP1:
      "JusticePal was born from a singular realization: the legal system, while fundamental to society, often feels like an impenetrable fortress. In Sri Lanka, citizens frequently face barriers of complexity, cost, and lack of transparency when seeking legal redress.",
    originP2:
      "Our mission is to dismantle these barriers. By combining deep legal expertise with cutting-edge AI intake systems, we ensure that every citizen has a clear, accessible path to justice. We aren't just a platform; we are a sovereign advocate for your rights in the digital age.",
    originQuote:
      "\"Justice is not a luxury; it is a fundamental human right that technology must now secure for all.\"",

    // Foundational Values
    valuesLabel: "FOUNDATIONAL VALUES",
    valuesHeading: "The Pillars We Stand On",
    values: [
      {
        title: "Trust",
        description:
          "Built on a foundation of absolute transparency and verified legal excellence.",
      },
      {
        title: "Innovation",
        description:
          "Pioneering AI-driven legal intake to simplify complex workflows.",
      },
      {
        title: "Accessibility",
        description:
          "Ensuring language and cost are no longer barriers to sovereign legal help.",
      },
      {
        title: "Expertise",
        description:
          "Direct access to Sri Lanka's top-tier legal minds and specialists.",
      },
    ],

    // CTA
    ctaHeading: "Join the Future of Law",
    ctaSubtext:
      "Whether you're seeking guidance for a complex case or looking to expand your practice as a verified advocate, JusticePal is your sovereign partner.",
    ctaBtn1: "Join as an Advocate",
    ctaBtn2: "Find an Advocate",
  },
  si: {
    // Hero
    heroLabel: "ආණ්ඩුක්‍රම නවෝත්පාදනය",
    heroHeading: "සෑම ශ්‍රී ලාංකිකයෙකුටම නීතිමය ප්‍රවේශය ප්‍රජාතන්ත්‍රීකරණය",
    heroSubtitle:
      "JusticePal නවෝත්පාදී AI-බලගැන්වූ තාක්ෂණය සහ නිරපේක්ෂ විනිවිදභාවයට කැපවීම මගින් නාගරිකයන් සහ නීතිමය විශේෂඥයන් අතර පරතරය පියවයි.",
    heroBtn: "ඔබේ ගමන ආරම්භ කරන්න",
    stat1Number: "500+",
    stat1Label: "සත්‍යාපිත නීතිඥයින්",
    stat2Number: "12,400+",
    stat2Label: "උදව් කළ නඩු",
    stat3Number: "45k+",
    stat3Label: "සම්පූර්ණ කළ උපදේශන",

    originLabel: "මූලාරම්භය",
    originHeading: "ප්‍රවේශ්‍ය යුක්තිය සඳහා\nඋපන් ගමනක්",
    originP1:
      "JusticePal උපදිනු ලැබුවේ අනන්‍ය විශ්වාසයකින්: නීතිය පද්ධතිය, සමාජයට මූලික වුවද, බොහෝ විට දුෂ්කර බළල්ලෙකු ලෙස දැනේ. ශ්‍රී ලංකාවේ, නාගරිකයන් නීතිමය ආරක්ෂාව ලබා ගැනීමේදී සංකීර්ණතාව, පිරිවැය සහ විනිවිදභාවය නොමැතිකම හේතු ලෙස ඇති බාධා නිතරම මුහුණ දෙයි.",
    originP2:
      "මෙම බාධාකාරකයන් ඉවත් කිරීම අපගේ මෙහෙවරයි. ගැඹුරු නීතිමය ප්‍රවීණතාව AI ආදාන පද්ධති සමඟ ඒකාබද්ධ කිරීමෙන්, සෑම නාගරිකයෙකුටම යුක්තිය වෙත පැහැදිලි, ප්‍රවේශ්‍ය මාවතක් ඇති බව අපි සහතික කරමු.",
    originQuote:
      "\"යුක්තිය සුඛෝපභෝගී දෙයක් නොවේ; එය මූලික මානව අයිතිවාසිකමකි, දැන් තාක්ෂණය සෑමදෙනාටම සුරක්ෂිත කළ යුතුය.\"",

    valuesLabel: "මූලික වටිනාකම්",
    valuesHeading: "අපි සිටින ස්ථම්භ",
    values: [
      {
        title: "විශ්වාසය",
        description:
          "නිරපේක්ෂ විනිවිදභාවය සහ සත්‍යාපිත නීතිමය විශිෂ්ඨතාව මත ගොඩනගා ඇත.",
      },
      {
        title: "නවෝත්පාදනය",
        description:
          "සංකීර්ණ කාර්යය සරල කිරීම සඳහා AI-추진 නීතිමය ආදානය මුල් කරගෙන.",
      },
      {
        title: "ප්‍රවේශ්‍යතාව",
        description:
          "භාෂාව සහ පිරිවැය ස්වෛරී නීතිමය සහාය සඳහා තවදුරටත් බාධා නොවන සේ.",
      },
      {
        title: "ප්‍රවීණතාව",
        description:
          "ශ්‍රී ලංකාවේ ශ්‍රේෂ්ඨ නීති මනස් සහ විශේෂඥයන් සඳහා සෘජු ප්‍රවේශය.",
      },
    ],

    ctaHeading: "නීතියේ අනාගතයට සම්බන්ධ වන්න",
    ctaSubtext:
      "ඔබ සංකීර්ණ නඩුවකට මඟ පෙන්වීමක් සොයන්නේ හෝ සත්‍යාපිත නීතිඥයෙකු ලෙස ඔබේ ප්‍රායෝගිකභාවය ව්‍යාප්ත කිරීමට බලාපොරොත්තු වේ නම්, JusticePal ඔබේ ස්වෛරී හවුල්කරුවා.",
    ctaBtn1: "නීතිඥයෙකු ලෙස සම්බන්ධ වන්න",
    ctaBtn2: "නීතිඥයෙකු සොයන්න",
  },
};

// ─── Stat Icons ───────────────────────────────────────────────────────────────
function LawyersStatIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function CasesStatIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function ConsultationsStatIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

// ─── Value Card Icons ─────────────────────────────────────────────────────────
function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function LightbulbIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M9 18h6M10 22h4M12 2a7 7 0 0 1 7 7c0 2.5-1.5 4.8-4 6.2V17H9v-1.8C6.5 13.8 5 11.5 5 9a7 7 0 0 1 7-7z" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ScalesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M12 3v18M3 8l9-5 9 5M5 21h14" />
      <path d="M5 8l-2 6h4L5 8zM19 8l-2 6h4l-2-6z" />
    </svg>
  );
}

const valueIcons = [ShieldIcon, LightbulbIcon, UsersIcon, ScalesIcon];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AboutPage() {
  const { lang } = useLanguage();
  const tx = translations[lang];

  return (
    <>
      <Navbar />

      <main className="pt-[72px] bg-[#F8F9FA] min-h-screen">

        {/* ── HERO SECTION ─────────────────────────────────────────────────── */}
        <section className="relative bg-[#0a1628] overflow-hidden">
          {/* Subtle decorative elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-[#c9a84c]/[0.03] blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-[#1e3a5f]/30 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-4xl mx-auto px-6 pt-[100px] pb-[80px] text-center">
            {/* Top label */}
            <span className="inline-block text-xs font-bold tracking-[0.25em] text-[#c9a84c] uppercase mb-6">
              {tx.heroLabel}
            </span>

            {/* Main heading */}
            <h1 className="text-[40px] sm:text-[48px] lg:text-[56px] font-extrabold text-white leading-[1.15] mb-6">
              {tx.heroHeading}
            </h1>

            {/* Subtitle */}
            <p className="max-w-[600px] mx-auto text-[#cbd5e1] text-[16px] sm:text-[18px] leading-relaxed mb-10">
              {tx.heroSubtitle}
            </p>

            {/* CTA Button */}
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg font-semibold text-[15px] bg-[#c9a84c] text-[#0a1628] hover:bg-[#b8973f] shadow-lg shadow-[#c9a84c]/20 hover:shadow-[#c9a84c]/30 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
            >
              {tx.heroBtn}
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>

        {/* ── STATS ROW ────────────────────────────────────────────────────── */}
        <section className="bg-white border-b border-[#E5E7EB]">
          <div className="max-w-5xl mx-auto px-6 py-14">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-6 text-center">
              {/* Stat 1 */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#fdf8ed] mb-1">
                  <LawyersStatIcon />
                </div>
                <span className="text-3xl lg:text-4xl font-extrabold text-[#0a1628]">
                  {tx.stat1Number}
                </span>
                <span className="text-xs font-bold tracking-[0.15em] text-[#6B7280] uppercase">
                  {tx.stat1Label}
                </span>
              </div>

              {/* Stat 2 */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#fdf8ed] mb-1">
                  <CasesStatIcon />
                </div>
                <span className="text-3xl lg:text-4xl font-extrabold text-[#0a1628]">
                  {tx.stat2Number}
                </span>
                <span className="text-xs font-bold tracking-[0.15em] text-[#6B7280] uppercase">
                  {tx.stat2Label}
                </span>
              </div>

              {/* Stat 3 */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#fdf8ed] mb-1">
                  <ConsultationsStatIcon />
                </div>
                <span className="text-3xl lg:text-4xl font-extrabold text-[#0a1628]">
                  {tx.stat3Number}
                </span>
                <span className="text-xs font-bold tracking-[0.15em] text-[#6B7280] uppercase">
                  {tx.stat3Label}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 1: Origin Story ─────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-6 py-20 lg:py-28 lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">

          {/* Left – text */}
          <div className="mb-12 lg:mb-0">
            {/* Label */}
            <span className="inline-block text-xs font-bold tracking-[0.2em] text-[#F2994A] uppercase mb-6">
              {tx.originLabel}
            </span>

            {/* Heading */}
            <h1 className="text-4xl lg:text-5xl font-extrabold text-[#001F3F] leading-tight mb-8 whitespace-pre-line">
              {tx.originHeading}
            </h1>

            {/* Body paragraphs */}
            <p className="text-[#4F4F4F] text-base lg:text-[17px] leading-relaxed mb-5">
              {tx.originP1}
            </p>
            <p className="text-[#4F4F4F] text-base lg:text-[17px] leading-relaxed mb-8">
              {tx.originP2}
            </p>

            {/* Quote block */}
            <blockquote className="relative pl-5 border-l-4 border-[#2a5298] bg-[#EFF6FF] rounded-r-xl py-5 pr-5">
              <p className="text-[#1B3A6B] text-[15px] leading-relaxed italic font-medium">
                {tx.originQuote}
              </p>
            </blockquote>
          </div>

          {/* Right – golden seal graphic */}
          <div className="flex items-center justify-center">
            <div className="relative w-[340px] h-[340px] lg:w-[420px] lg:h-[420px] rounded-full overflow-hidden shadow-2xl ring-4 ring-[#C9A227]/30">
              {/* Dark textured background */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#0d1b2a] via-[#162032] to-[#0a1520]" />

              {/* Subtle grid pattern overlay */}
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(0deg, transparent, transparent 30px, rgba(255,255,255,0.05) 30px, rgba(255,255,255,0.05) 31px), repeating-linear-gradient(90deg, transparent, transparent 30px, rgba(255,255,255,0.05) 30px, rgba(255,255,255,0.05) 31px)",
                }}
              />

              {/* Gold seal image */}
              <div className="relative z-10 w-full h-full flex items-center justify-center p-6">
                <Image
                  src="/justice-seal.png"
                  alt="JusticePal Golden Seal of Justice"
                  width={360}
                  height={360}
                  className="object-contain drop-shadow-[0_0_40px_rgba(201,162,39,0.5)] animate-pulse-slow"
                  priority
                />
              </div>

              {/* Glow ring */}
              <div className="absolute inset-0 rounded-full ring-[30px] ring-inset ring-[#C9A227]/5 pointer-events-none" />
            </div>
          </div>
        </section>

        {/* ── SECTION 2: Foundational Values ─────────────────────────────── */}
        <section className="bg-white py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-6">

            {/* Labels + Heading – centered */}
            <div className="text-center mb-14">
              <span className="inline-block text-xs font-bold tracking-[0.2em] text-[#F2994A] uppercase mb-4">
                {tx.valuesLabel}
              </span>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-[#001F3F]">
                {tx.valuesHeading}
              </h2>
            </div>

            {/* Value cards grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {tx.values.map((value, i) => {
                const Icon = valueIcons[i];
                return (
                  <div
                    key={value.title}
                    className="group relative bg-white rounded-2xl border border-[#E5E7EB] p-7 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                  >
                    {/* Subtle top accent */}
                    <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl bg-gradient-to-r from-[#1B3A6B] to-[#3b6fd4] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Icon box */}
                    <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-[#EFF6FF] text-[#1B3A6B] mb-5 group-hover:bg-[#1B3A6B] group-hover:text-white transition-all duration-300">
                      <Icon />
                    </div>

                    {/* Title */}
                    <h3 className="text-[#001F3F] font-bold text-lg mb-2">
                      {value.title}
                    </h3>

                    {/* Description */}
                    <p className="text-[#4F4F4F] text-sm leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── SECTION 3: CTA ─────────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-6 py-20 lg:py-28">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0A2540] via-[#0e2f52] to-[#0A2540] px-8 py-16 lg:py-20 text-center shadow-2xl">

            {/* Decorative glow blobs */}
            <div className="absolute -top-20 -left-20 w-72 h-72 bg-[#2a5298]/30 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-[#F2994A]/20 rounded-full blur-3xl pointer-events-none" />

            {/* Content */}
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-4 leading-tight">
                {tx.ctaHeading}
              </h2>
              <p className="text-[#93C5FD] text-base lg:text-[17px] leading-relaxed mb-10">
                {tx.ctaSubtext}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {/* Primary button */}
                <Link
                  href="/register?role=lawyer"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm text-[#0A2540] bg-[#F2994A] hover:bg-[#e8873e] shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  {tx.ctaBtn1}
                </Link>

                {/* Secondary button */}
                <Link
                  href="/lawyers"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm text-white border-2 border-white/30 hover:bg-white/10 hover:border-white/50 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                  </svg>
                  {tx.ctaBtn2}
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}
