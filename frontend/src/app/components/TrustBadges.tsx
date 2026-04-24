"use client";
import { useLanguage } from "../context/LanguageContext";

const content = {
  en: {
    badges: [
      {
        title: "Verified Lawyers",
        desc: "Every professional is rigorously vetted by our legal team.",
        bg: "bg-green-50",
        border: "border-green-200",
        iconColor: "text-green-600",
        type: "shield",
      },
      {
        title: "Secure Consultations",
        desc: "End-to-end encrypted chats and secure document storage.",
        bg: "bg-blue-50",
        border: "border-blue-200",
        iconColor: "text-blue-600",
        type: "lock",
      },
      {
        title: "Legal Compliance",
        desc: "Guidance based strictly on the latest Sri Lankan statutes.",
        bg: "bg-indigo-50",
        border: "border-indigo-200",
        iconColor: "text-indigo-700",
        type: "doc",
      },
    ],
  },
  si: {
    badges: [
      {
        title: "සත්‍යාපිත නීතිඥයින්",
        desc: "සෑම වෘත්තිකයෙකුම අපගේ නීති කණ්ඩායම විසින් දැඩිව පරීක්‍ෂා කරනු ලැබේ.",
        bg: "bg-green-50",
        border: "border-green-200",
        iconColor: "text-green-600",
        type: "shield",
      },
      {
        title: "ආරක්‍ෂිත උපදේශන",
        desc: "ශේෂාන්ත සිට ශේෂාන්ත ෙකාට් සාකච්ඡා සහ ලේඛන ආරක්‍ෂාව.",
        bg: "bg-blue-50",
        border: "border-blue-200",
        iconColor: "text-blue-600",
        type: "lock",
      },
      {
        title: "නීති අනුකූලතාව",
        desc: "නවතම ශ්‍රී ලාංකික ව්‍යවස්ථාවලට දැඩිව අනුකූලව මාර්ගෝපදේශය.",
        bg: "bg-indigo-50",
        border: "border-indigo-200",
        iconColor: "text-indigo-700",
        type: "doc",
      },
    ],
  },
};

function ShieldIcon({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

function LockIcon({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function DocIcon({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="17" x2="13" y2="17" />
    </svg>
  );
}

export default function TrustBadges() {
  const { lang } = useLanguage();
  const tx = content[lang];

  return (
    <section className="bg-white py-16 px-6 relative z-10 -mt-8">
      <div className="max-w-[1300px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tx.badges.map((badge) => (
            <div
              key={badge.title}
              className={`flex items-start gap-5 p-6 rounded-2xl border ${badge.border} bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}
            >
              <div className={`w-14 h-14 rounded-xl ${badge.bg} flex items-center justify-center shrink-0 shadow-inner`}>
                {badge.type === "shield" && <ShieldIcon className={`w-6 h-6 ${badge.iconColor}`} />}
                {badge.type === "lock" && <LockIcon className={`w-6 h-6 ${badge.iconColor}`} />}
                {badge.type === "doc" && <DocIcon className={`w-6 h-6 ${badge.iconColor}`} />}
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-1">{badge.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{badge.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
