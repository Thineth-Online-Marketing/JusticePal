"use client";
import Link from "next/link";
import { useTranslation } from "../hooks/useTranslation";

export default function CTABanner() {
  const { t } = useTranslation();

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

        <div className="max-w-3xl mx-auto mb-10">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight tracking-tight">
            {t("landing.cta.heading")}
          </h2>
          <p className="text-blue-100 text-lg md:text-xl leading-relaxed">
            {t("landing.cta.subheading")}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
          <Link
            href="/register"
            className="bg-white text-[#1B3A6B] px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-xl shadow-black/10 active:scale-95 flex items-center gap-2"
          >
            {t("landing.cta.btnPrimary")}
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <Link
            href="/about"
            className="bg-transparent border-2 border-white/30 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-all active:scale-95"
          >
            {t("landing.cta.btnSecondary")}
          </Link>
        </div>
      </div>
    </section>
  );
}
