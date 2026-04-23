"use client";
import Link from "next/link";
import { useLanguage } from "../context/LanguageContext";

const content = {
  en: {
    heading: "Ready to find your legal partner?",
    subheading: "Get started today and experience the future of legal consultation in Sri Lanka. AI-fast results, expert-quality advice.",
    btnPrimary: "Get Started for Free",
    btnSecondary: "Learn More",
  },
  si: {
    heading: "ඔබේ නීති හවුල්කරු සොයා ගැනීමට සූදානම්ද?",
    subheading: "අදම ආරම්භ කර ශ්‍රී ලංකාවේ නීති උපදේශනයේ අනාගතය අත්විඳින්න. AI වේගවත් ප්‍රතිඵල, විශේෂඥ තත්ත්වයේ උපදෙස්.",
    btnPrimary: "නොමිලේ ආරම්භ කරන්න",
    btnSecondary: "තව දැනගන්න",
  },
};

export default function CTABanner() {
  const { lang } = useLanguage();
  const tx = content[lang];

  return (
    <section className="relative py-28 px-6 bg-gradient-to-br from-[#0B1B3A] via-[#1B3A6B] to-[#0A1630] overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-0 right-10 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-screen filter blur-[100px]" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-orange-500/10 rounded-full mix-blend-screen filter blur-[80px]" />

      <div className="relative max-w-[1000px] mx-auto text-center z-10">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md mb-8 shadow-2xl">
          <svg className="w-10 h-10 text-blue-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>

        <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-6 leading-tight">
          {tx.heading}
        </h2>
        
        <p className="text-base md:text-lg text-blue-100/80 mb-10 max-w-2xl mx-auto leading-relaxed">
          {tx.subheading}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-4 bg-white text-blue-950 font-bold rounded-xl shadow-lg shadow-white/10 hover:-translate-y-1 hover:shadow-xl hover:shadow-white/20 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {tx.btnPrimary}
          </Link>
          <Link
            href="/about"
            className="w-full sm:w-auto px-8 py-4 bg-transparent text-white font-semibold rounded-xl border-2 border-white/20 hover:border-white/50 hover:bg-white/5 transition-all duration-300"
          >
            {tx.btnSecondary}
          </Link>
        </div>
      </div>
    </section>
  );
}
