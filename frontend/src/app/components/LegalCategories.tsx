"use client";
import Link from "next/link";
import { useLanguage } from "../context/LanguageContext";

const content = {
  en: {
    label: "Legal Services",
    heading: "Specialized Help for Every Case",
    subheading: "Explore our most popular legal service categories tailored for individual and business needs across Sri Lanka.",
    browseAll: "Browse All Categories",
    guidance: "Get guidance",
    categories: [
      {
        id: "property",
        title: "Property Law",
        desc: "Assistance with land registry, title searches, boundary disputes, and commercial & business lease agreements.",
        emoji: "🏛️",
        gradient: "from-[#1B3A6B] to-[#2a5298]",
        bg: "bg-blue-50/50",
        href: "/lawyers?category=property",
      },
      {
        id: "family",
        title: "Family Law",
        desc: "Confidential support for matrimonial matters, child custody, maintenance and inheritance issues.",
        emoji: "👨‍👩‍👧",
        gradient: "from-[#7C3AED] to-[#9D53F0]",
        bg: "bg-purple-50/50",
        href: "/lawyers?category=family",
      },
      {
        id: "labor",
        title: "Labor Law",
        desc: "Employment contracts review, EPF/ETF disputes, and representation for unfair termination claims.",
        emoji: "⚖️",
        gradient: "from-[#059669] to-[#10B981]",
        bg: "bg-emerald-50/50",
        href: "/lawyers?category=labor",
      },
    ],
  },
  si: {
    label: "නීති සේවා",
    heading: "සෑම නඩුවකටම විශේෂිත සහාය",
    subheading: "ශ්‍රී ලංකාව පුරා පුද්ගල හා ව්‍යාපාරික අවශ්‍යතා සඳහා වඩාත් ජනප්‍රිය නීති සේවා ප්‍රවර්ග ගවේෂණය කරන්න.",
    browseAll: "සියලු ප්‍රවර්ග බලන්න",
    guidance: "මාර්ගෝපදේශය ලබාගන්න",
    categories: [
      {
        id: "property",
        title: "දේපළ නීතිය",
        desc: "ඉඩම් ලේඛනය, ශීර්ෂ සෙවීම, සීමා ආරවුල් සහ වාණිජ & ව්‍යාපාර බදු ගිවිසුම් සඳහා සහාය.",
        emoji: "🏛️",
        gradient: "from-[#1B3A6B] to-[#2a5298]",
        bg: "bg-blue-50/50",
        href: "/lawyers?category=property",
      },
      {
        id: "family",
        title: "පවුල් නීතිය",
        desc: "විවාහ කාරණා, ළමා භාරකාරත්වය, නඩත්තු සහ උරුම ගැටලු සඳහා රහස්‍ය සහාය.",
        emoji: "👨‍👩‍👧",
        gradient: "from-[#7C3AED] to-[#9D53F0]",
        bg: "bg-purple-50/50",
        href: "/lawyers?category=family",
      },
      {
        id: "labor",
        title: "කම්කරු නීතිය",
        desc: "සේවා ගිවිසුම් සමාලෝචනය, EPF/ETF ආරවුල් සහ අසාධාරණ සේවය අවසන් කිරීම් සඳහා නියෝජනය.",
        emoji: "⚖️",
        gradient: "from-[#059669] to-[#10B981]",
        bg: "bg-emerald-50/50",
        href: "/lawyers?category=labor",
      },
    ],
  },
};

export default function LegalCategories() {
  const { lang } = useLanguage();
  const tx = content[lang];

  return (
    <section className="bg-gray-50/50 py-24 px-6 border-t border-b border-gray-100">
      <div className="max-w-[1300px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-3">
              {tx.label}
            </p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight leading-tight mb-4">
              {tx.heading}
            </h2>
            <p className="text-base text-gray-600 leading-relaxed">
              {tx.subheading}
            </p>
          </div>
          <Link
            href="/lawyers"
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-blue-900 text-blue-900 font-semibold rounded-xl hover:bg-blue-900 hover:text-white transition-all duration-300 whitespace-nowrap"
          >
            {tx.browseAll}
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tx.categories.map((cat) => (
            <div
              key={cat.id}
              className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
            >
              <div className={`h-48 ${cat.bg} relative flex items-center justify-center overflow-hidden`}>
                <div className="text-5xl filter drop-shadow-md transform group-hover:scale-110 transition-transform duration-500">
                  {cat.emoji}
                </div>
                
                <div className={`absolute bottom-4 right-4 w-12 h-12 rounded-full bg-gradient-to-br ${cat.gradient} flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform duration-300`}>
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
              </div>

              <div className="p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-900 transition-colors">
                  {cat.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-6">
                  {cat.desc}
                </p>
                <Link
                  href={cat.href}
                  className="inline-flex items-center text-blue-900 font-semibold group/link"
                >
                  <span className="mr-2">{tx.guidance}</span>
                  <svg className="w-5 h-5 transform group-hover/link:translate-x-1.5 transition-transform duration-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
