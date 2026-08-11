"use client";
import { useTranslation } from "../hooks/useTranslation";

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
  const { t } = useTranslation();

  return (
    <section className="bg-white py-16 px-6 relative z-10 -mt-8">
      <div className="max-w-[1300px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Verified */}
          <div className="flex items-start gap-5 p-6 rounded-2xl border border-green-200 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="w-14 h-14 rounded-xl bg-green-50 flex items-center justify-center shrink-0 shadow-inner">
              <ShieldIcon className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-1">{t("landing.trust.verified.title")}</h3>
              <p className="text-xs text-gray-600 leading-relaxed">{t("landing.trust.verified.desc")}</p>
            </div>
          </div>
          
          {/* Secure */}
          <div className="flex items-start gap-5 p-6 rounded-2xl border border-blue-200 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 shadow-inner">
              <LockIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-1">{t("landing.trust.secure.title")}</h3>
              <p className="text-xs text-gray-600 leading-relaxed">{t("landing.trust.secure.desc")}</p>
            </div>
          </div>

          {/* Compliance */}
          <div className="flex items-start gap-5 p-6 rounded-2xl border border-indigo-200 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="w-14 h-14 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 shadow-inner">
              <DocIcon className="w-6 h-6 text-indigo-700" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-1">{t("landing.trust.compliance.title")}</h3>
              <p className="text-xs text-gray-600 leading-relaxed">{t("landing.trust.compliance.desc")}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
