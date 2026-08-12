"use client";

import React, { useState } from "react";
import Footer from "../../components/Footer";
import { useTranslation } from "../../hooks/useTranslation";
import { 
  Search, 
  BookOpen, 
  LayoutDashboard, 
  Briefcase, 
  Bot, 
  ShieldCheck,
  ChevronDown,
  CheckCircle2
} from "lucide-react";

type CategoryId = 'getting-started' | 'client-dashboard' | 'lawyer-portal' | 'ai-chat' | 'billing';

export default function UserGuidePage() {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<CategoryId>('getting-started');
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const categories: { id: CategoryId; label: string; icon: React.ReactNode }[] = [
    { id: 'getting-started', label: t("userGuide.catGettingStarted"), icon: <BookOpen className="w-4 h-4" /> },
    { id: 'client-dashboard', label: t("userGuide.catClientDashboard"), icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'lawyer-portal', label: t("userGuide.catLawyerPortal"), icon: <Briefcase className="w-4 h-4" /> },
    { id: 'ai-chat', label: t("userGuide.catAiChat"), icon: <Bot className="w-4 h-4" /> },
    { id: 'billing', label: t("userGuide.catBilling"), icon: <ShieldCheck className="w-4 h-4" /> },
  ];

  // FAQ Toggle Handler
  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const renderContent = () => {
    switch (activeCategory) {
      case 'getting-started':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 tracking-tight mb-2">{t("userGuide.gettingStarted.title")}</h2>
              <p className="text-gray-500">{t("userGuide.gettingStarted.sub")}</p>
            </div>

            <div className="space-y-4">
              {/* Step 1 */}
              <div className="relative p-6 rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden group hover:border-blue-200 transition-colors">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                <div className="flex items-start gap-4">
                  <div className="mt-1 shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1">{t("userGuide.gettingStarted.step1Title")}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      {t("userGuide.gettingStarted.step1Desc")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative p-6 rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden group hover:border-blue-200 transition-colors">
                <div className="absolute top-0 left-0 w-1 h-full bg-gray-200 group-hover:bg-blue-400 transition-colors"></div>
                <div className="flex items-start gap-4">
                  <div className="mt-1 shrink-0">
                    <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-500">2</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1">{t("userGuide.gettingStarted.step2Title")}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      {t("userGuide.gettingStarted.step2Desc")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative p-6 rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden group hover:border-blue-200 transition-colors">
                <div className="absolute top-0 left-0 w-1 h-full bg-gray-200 group-hover:bg-blue-400 transition-colors"></div>
                <div className="flex items-start gap-4">
                  <div className="mt-1 shrink-0">
                    <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-500">3</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1">{t("userGuide.gettingStarted.step3Title")}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      {t("userGuide.gettingStarted.step3Desc")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'client-dashboard':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 tracking-tight mb-2">{t("userGuide.clientDashboard.title")}</h2>
              <p className="text-gray-500">{t("userGuide.clientDashboard.sub")}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
                <h3 className="text-gray-800 font-bold mb-2">{t("userGuide.clientDashboard.activeCasesTitle")}</h3>
                <p className="text-gray-500 text-sm">{t("userGuide.clientDashboard.activeCasesDesc")}</p>
              </div>
              <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
                <h3 className="text-gray-800 font-bold mb-2">{t("userGuide.clientDashboard.docVaultTitle")}</h3>
                <p className="text-gray-500 text-sm">{t("userGuide.clientDashboard.docVaultDesc")}</p>
              </div>
            </div>
          </div>
        );
      case 'lawyer-portal':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 tracking-tight mb-2">{t("userGuide.lawyerPortal.title")}</h2>
              <p className="text-gray-500">{t("userGuide.lawyerPortal.sub")}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
                <h3 className="text-gray-800 font-bold mb-2">{t("userGuide.lawyerPortal.calendarTitle")}</h3>
                <p className="text-gray-500 text-sm">{t("userGuide.lawyerPortal.calendarDesc")}</p>
              </div>
              <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
                <h3 className="text-gray-800 font-bold mb-2">{t("userGuide.lawyerPortal.clientManagementTitle")}</h3>
                <p className="text-gray-500 text-sm">{t("userGuide.lawyerPortal.clientManagementDesc")}</p>
              </div>
            </div>
          </div>
        );
      case 'ai-chat':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 tracking-tight mb-2">{t("userGuide.aiChat.title")}</h2>
              <p className="text-gray-500">{t("userGuide.aiChat.sub")}</p>
            </div>
            <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
              <h3 className="text-gray-800 font-bold mb-3 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-500" />
                {t("userGuide.aiChat.privacyTitle")}
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                {t("userGuide.aiChat.privacyDesc")}
              </p>
              <ul className="list-disc list-inside text-sm text-gray-500 space-y-2">
                <li>{t("userGuide.aiChat.bullet1")}</li>
                <li>{t("userGuide.aiChat.bullet2")}</li>
                <li>{t("userGuide.aiChat.bullet3")}</li>
              </ul>
            </div>
          </div>
        );
      case 'billing':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 tracking-tight mb-2">{t("userGuide.billing.title")}</h2>
              <p className="text-gray-500">{t("userGuide.billing.sub")}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
                <h3 className="text-gray-800 font-bold mb-2">{t("userGuide.billing.escrowTitle")}</h3>
                <p className="text-gray-500 text-sm">{t("userGuide.billing.escrowDesc")}</p>
              </div>
              <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
                <h3 className="text-gray-800 font-bold mb-2">{t("userGuide.billing.securityTitle")}</h3>
                <p className="text-gray-500 text-sm">{t("userGuide.billing.securityDesc")}</p>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in">
            <BookOpen className="w-16 h-16 text-gray-300 mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">{t("userGuide.comingSoon.title")}</h2>
            <p className="text-gray-500 max-w-md">{t("userGuide.comingSoon.sub")}</p>
          </div>
        );
    }
  };

  const faqs = [
    {
      q: t("userGuide.faq.q1"),
      a: t("userGuide.faq.a1")
    },
    {
      q: t("userGuide.faq.q2"),
      a: t("userGuide.faq.a2")
    },
    {
      q: t("userGuide.faq.q3"),
      a: t("userGuide.faq.a3")
    }
  ];

  return (
    <div className="min-h-full bg-[#f8fafc] text-slate-600 font-sans flex flex-col">
      {/* Hero Section */}
      <div className="relative pt-20 pb-24 px-6 overflow-hidden border-b border-gray-200 bg-white">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-white pointer-events-none"></div>
        <div className="relative max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#1B3A6B] tracking-tight mb-6">
            {t("userGuide.heroTitle")}
          </h1>
          <p className="text-lg text-slate-500 mb-10 max-w-xl mx-auto">
            {t("userGuide.heroSub")}
          </p>
          
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder={t("userGuide.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
            />
          </div>
        </div>
      </div>

      {/* Main Workspace View */}
      <div className="max-w-[1400px] mx-auto px-6 pt-12">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Left Sidebar (w-1/4) */}
          <div className="lg:w-1/4 shrink-0">
            <div className="sticky top-8">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-3">
                {t("userGuide.categoriesTitle")}
              </h3>
              <nav className="space-y-1">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      activeCategory === category.id
                        ? "bg-blue-50 text-blue-700 border-l-2 border-blue-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-800 hover:bg-slate-100 border-l-2 border-transparent"
                    }`}
                  >
                    {category.icon}
                    {category.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Right Panel (w-3/4) */}
          <div className="lg:w-3/4 min-w-0">
            
            {/* Dynamic Documentation Feed */}
            <div className="mb-16">
              {renderContent()}
            </div>

            {/* FAQ Accordions Section */}
            <div className="pt-12 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-8">{t("userGuide.faq.title")}</h2>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div 
                    key={index}
                    className="border border-gray-200 rounded-2xl bg-white shadow-sm overflow-hidden transition-colors hover:border-gray-300"
                  >
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none bg-white hover:bg-slate-50"
                    >
                      <span className="font-semibold text-slate-800 pr-8">{faq.q}</span>
                      <ChevronDown 
                        className={`w-5 h-5 text-slate-400 transition-transform duration-300 shrink-0 ${openFaq === index ? "rotate-180" : ""}`} 
                      />
                    </button>
                    <div 
                      className={`transition-all duration-300 ease-in-out grid bg-white ${
                        openFaq === index ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="px-6 pb-5 text-slate-600 text-sm leading-relaxed border-t border-gray-50 pt-4 mt-2">
                          {faq.a}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
