"use client";

import React, { useState, useRef } from "react";
import {
  FileText,
  Sparkles,
  Download,
  Copy,
  Check,
  AlertTriangle,
  ChevronDown,
  Loader2,
  Scale,
  FileSignature,
  ScrollText,
  Stamp,
  BookOpen,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "../../hooks/useTranslation";
import Footer from "../../components/Footer";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://justice-pal-cjhn.vercel.app";

const DOCUMENT_TYPES = [
  { id: "demand-letter", key: "demandLetter", icon: FileSignature },
  { id: "affidavit", key: "affidavit", icon: Stamp },
  { id: "power-of-attorney", key: "powerOfAttorney", icon: ScrollText },
  { id: "rental-agreement", key: "rentalAgreement", icon: BookOpen },
  { id: "legal-notice", key: "legalNotice", icon: AlertTriangle },
  { id: "contract", key: "contract", icon: FileText },
  { id: "complaint-letter", key: "complaintLetter", icon: Scale },
];

export default function DocumentDraftingPage() {
  const { user } = useAuth();
  const { t } = useTranslation();

  const [selectedType, setSelectedType] = useState("");
  const [caseDetails, setCaseDetails] = useState("");
  const [clientName, setClientName] = useState("");
  const [lawyerName, setLawyerName] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState("");
  const [copied, setCopied] = useState(false);
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const selectedDocType = DOCUMENT_TYPES.find((d) => d.id === selectedType);

  const handleGenerate = async () => {
    if (!selectedType || !caseDetails.trim()) return;
    setIsGenerating(true);
    setGeneratedDraft("");

    try {
      const token = await user?.getIdToken();
      const res = await fetch(`${BACKEND_URL}/api/ai/draft-document`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          documentType: selectedDocType ? t(`drafting.docs.${selectedDocType.key}.title`) : selectedType,
          caseDetails: caseDetails.trim(),
          clientName: clientName.trim() || undefined,
          lawyerName: lawyerName.trim() || undefined,
          additionalNotes: additionalNotes.trim() || undefined,
        }),
      });

      if (!res.ok) throw new Error("Failed to generate document");
      const data = await res.json();
      setGeneratedDraft(data.draft);

      // Scroll to result
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);
    } catch (error) {
      console.error("Document drafting error:", error);
      setGeneratedDraft("An error occurred while generating the document. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([generatedDraft], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedType || "legal-document"}-draft.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setGeneratedDraft("");
    setCaseDetails("");
    setClientName("");
    setLawyerName("");
    setAdditionalNotes("");
    setSelectedType("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-[80px]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#1B3A6B] to-[#112549] rounded-2xl mb-4 shadow-lg shadow-blue-900/20">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("drafting.title")}</h1>
          <p className="text-gray-500 max-w-lg mx-auto">{t("drafting.subtitle")}</p>
        </div>

        {/* Form */}
        {!generatedDraft && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6 animate-fade-in">
            {/* Document Type Selector */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t("drafting.selectType")}</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setTypeDropdownOpen(!typeDropdownOpen)}
                  className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-white transition-colors text-left"
                >
                  {selectedDocType ? (
                    <span className="flex items-center gap-3">
                      <selectedDocType.icon className="w-5 h-5 text-[#1B3A6B]" />
                      <span>
                        <span className="font-semibold text-gray-900">{t(`drafting.docs.${selectedDocType.key}.title`)}</span>
                        <span className="text-xs text-gray-400 ml-2">— {t(`drafting.docs.${selectedDocType.key}.desc`)}</span>
                      </span>
                    </span>
                  ) : (
                    <span className="text-gray-400">{t("drafting.selectType")}...</span>
                  )}
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${typeDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {typeDropdownOpen && (
                  <div className="absolute z-20 mt-2 w-full bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden">
                    {DOCUMENT_TYPES.map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => { setSelectedType(doc.id); setTypeDropdownOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0 ${selectedType === doc.id ? "bg-blue-50" : ""}`}
                      >
                        <doc.icon className="w-5 h-5 text-[#1B3A6B] flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{t(`drafting.docs.${doc.key}.title`)}</p>
                          <p className="text-xs text-gray-400">{t(`drafting.docs.${doc.key}.desc`)}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Case Details */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t("drafting.caseDetails")}</label>
              <textarea
                value={caseDetails}
                onChange={(e) => setCaseDetails(e.target.value)}
                placeholder={t("drafting.caseDetailsPlaceholder")}
                rows={6}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#1B3A6B] focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none text-sm"
              />
            </div>

            {/* Client & Lawyer Names */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t("drafting.clientName")}</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder={t("drafting.clientNamePlaceholder")}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#1B3A6B] focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t("drafting.lawyerName")}</label>
                <input
                  type="text"
                  value={lawyerName}
                  onChange={(e) => setLawyerName(e.target.value)}
                  placeholder={t("drafting.lawyerNamePlaceholder")}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#1B3A6B] focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                />
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t("drafting.additionalNotes")}</label>
              <textarea
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder={t("drafting.additionalNotesPlaceholder")}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#1B3A6B] focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none text-sm"
              />
            </div>

            {/* Submit */}
            <button
              onClick={handleGenerate}
              disabled={!selectedType || !caseDetails.trim() || isGenerating}
              className="w-full py-4 bg-gradient-to-r from-[#1B3A6B] to-[#112549] text-white rounded-xl font-semibold shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t("drafting.generating")}
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  {t("drafting.generate")}
                </>
              )}
            </button>
          </div>
        )}

        {/* Generated Result */}
        {generatedDraft && (
          <div ref={resultRef} className="space-y-6 animate-fade-in">
            {/* Disclaimer Banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-800 text-sm mb-1">{t("drafting.disclaimer")}</p>
                <p className="text-amber-700 text-xs leading-relaxed">{t("drafting.disclaimerText")}</p>
              </div>
            </div>

            {/* Document Output */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#1B3A6B] to-[#112549] rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{t("drafting.generatedDoc")}</h3>
                    <p className="text-xs text-gray-400">{selectedDocType ? t(`drafting.docs.${selectedDocType.key}.title`) : selectedType}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? t("drafting.copied") : t("drafting.copy")}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    {t("drafting.download")}
                  </button>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 leading-relaxed">
                  {generatedDraft}
                </pre>
              </div>
            </div>

            {/* New Draft Button */}
            <button
              onClick={handleReset}
              className="w-full py-3.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-[#F97316]" />
              {t("drafting.newDraft")}
            </button>
          </div>
        )}
      </div>

      {/* Custom animation */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
        }
      `}</style>
      <Footer />
    </div>
  );
}
