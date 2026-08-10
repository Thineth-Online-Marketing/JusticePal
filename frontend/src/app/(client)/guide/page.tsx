"use client";

import React, { useState } from "react";
import Footer from "../../components/Footer";
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

const categories: { id: CategoryId; label: string; icon: React.ReactNode }[] = [
  { id: 'getting-started', label: 'Getting Started', icon: <BookOpen className="w-4 h-4" /> },
  { id: 'client-dashboard', label: 'Client Dashboard Guide', icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'lawyer-portal', label: 'Lawyer Practice Portal', icon: <Briefcase className="w-4 h-4" /> },
  { id: 'ai-chat', label: 'AI Consultation & Chat Rules', icon: <Bot className="w-4 h-4" /> },
  { id: 'billing', label: 'Billing & Account Security', icon: <ShieldCheck className="w-4 h-4" /> },
];

export default function UserGuidePage() {
  const [activeCategory, setActiveCategory] = useState<CategoryId>('getting-started');
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
              <h2 className="text-2xl font-bold text-gray-800 tracking-tight mb-2">Getting Started with JusticePal</h2>
              <p className="text-gray-500">Welcome to Sri Lanka's premier legal assistance network. Follow these quick steps to set up your account and begin finding legal support.</p>
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
                    <h3 className="text-lg font-bold text-gray-800 mb-1">Step 1: Account Verification</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      Complete your profile by verifying your email and uploading a valid Sri Lankan National Identity Card (NIC). This ensures trust across the platform.
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
                    <h3 className="text-lg font-bold text-gray-800 mb-1">Step 2: Case Discovery</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      Use the &apos;Find Lawyer&apos; directory to browse specialists. You can filter by region, expertise (e.g., Property Law, Corporate Law), and hourly rate.
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
                    <h3 className="text-lg font-bold text-gray-800 mb-1">Step 3: Initial Consultation</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      Book an AI-assisted video consultation. Our built-in tools will help summarize the meeting notes automatically for both parties.
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
              <h2 className="text-2xl font-bold text-gray-800 tracking-tight mb-2">Navigating the Client Dashboard</h2>
              <p className="text-gray-500">Your central hub for tracking cases, messages, and billing.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
                <h3 className="text-gray-800 font-bold mb-2">Active Cases View</h3>
                <p className="text-gray-500 text-sm">Monitor all ongoing legal disputes, track document submissions, and see next scheduled court dates securely.</p>
              </div>
              <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
                <h3 className="text-gray-800 font-bold mb-2">Document Vault</h3>
                <p className="text-gray-500 text-sm">A secure, encrypted repository for all your sensitive legal documents, deeds, and case files.</p>
              </div>
            </div>
          </div>
        );
      case 'ai-chat':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 tracking-tight mb-2">AI Consultation & Chat Rules</h2>
              <p className="text-gray-500">Understanding how our AI assistant aids your legal journey securely.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
              <h3 className="text-gray-800 font-bold mb-3 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-500" />
                Data Privacy & Encryption
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                The JusticePal AI Assistant is strictly bound by client-attorney privilege simulation rules. It does not store your specific names or case data for training external models.
              </p>
              <ul className="list-disc list-inside text-sm text-gray-500 space-y-2">
                <li>Always redact sensitive government IDs before asking the AI questions.</li>
                <li>The AI provides generalized legal information, NOT official legal advice.</li>
                <li>All chat logs are end-to-end encrypted in your Document Vault.</li>
              </ul>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in">
            <BookOpen className="w-16 h-16 text-gray-300 mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">Documentation Coming Soon</h2>
            <p className="text-gray-500 max-w-md">Detailed guides for this section are currently being drafted by our legal tech team.</p>
          </div>
        );
    }
  };

  const faqs = [
    {
      q: "Is my personal data visible to all lawyers?",
      a: "No. Your detailed case information and personal identity are only revealed to a lawyer once you explicitly initiate a consultation or secure their services."
    },
    {
      q: "How does the billing system work?",
      a: "JusticePal uses an escrow-style payment holding system. Funds are released to the lawyer only after milestones or consultations are successfully completed as per your agreement."
    },
    {
      q: "Can I switch lawyers mid-case?",
      a: "Yes. Our platform allows you to formally request a case transfer. You can securely export your Document Vault package to hand over to a new attorney."
    }
  ];

  return (
    <div className="min-h-full bg-[#f8fafc] text-slate-600 font-sans flex flex-col">
      
      {/* Hero Section */}
      <div className="relative pt-20 pb-24 px-6 overflow-hidden border-b border-gray-200 bg-white">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-white pointer-events-none"></div>
        <div className="relative max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#1B3A6B] tracking-tight mb-6">
            How can we assist you today?
          </h1>
          <p className="text-lg text-slate-500 mb-10 max-w-xl mx-auto">
            Search our comprehensive documentation, workflow guides, and security protocols to master the JusticePal network.
          </p>
          
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search documentation, topics, or FAQs..."
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
                Categories
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
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-8">Frequently Asked Questions</h2>
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
