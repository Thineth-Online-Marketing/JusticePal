"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  Send,
  Bot,
  User,
  Sparkles,
  Scale,
  BookOpen,
  Shield,
  AlertTriangle,
  ExternalLink,
  Search,
  Star,
  MapPin,
  ChevronRight,
  MessageSquare,
  Users,
  Loader2,
  Info,
} from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

// --- Types ---
interface Source {
  title: string;
  source: string;
  category: string;
  relevance: number;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  confidence?: number;
  disclaimer?: string;
  timestamp: Date;
}

interface MatchedLawyer {
  id: string;
  name: string;
  email: string;
  specializations: string[];
  location: string | null;
  bio: string | null;
  hourlyRate: number | null;
  profilePicture: string | null;
  isVerified: boolean;
  matchScore: number;
}

// --- Suggested Questions ---
const suggestedQuestions = [
  { icon: Scale, text: "What are the grounds for divorce in Sri Lanka?", category: "Family Law" },
  { icon: Shield, text: "How to file a police complaint in Sri Lanka?", category: "Criminal Law" },
  { icon: BookOpen, text: "What are my rights as an employee?", category: "Labor Law" },
  { icon: AlertTriangle, text: "How to resolve a land dispute?", category: "Property Law" },
];

export default function ChatAIPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"chat" | "match">("chat");

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Lawyer Matching State
  const [issueDescription, setIssueDescription] = useState("");
  const [matchedLawyers, setMatchedLawyers] = useState<MatchedLawyer[]>([]);
  const [isMatching, setIsMatching] = useState(false);
  const [matchMessage, setMatchMessage] = useState("");

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- Chat Handler ---
  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isSending || !user) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsSending(true);

    try {
      const token = await user.getIdToken();
      const res = await fetch(`${BACKEND_URL}/api/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: messageText }),
      });

      const data = await res.json();

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.answer || "I couldn't process your question. Please try again.",
        sources: data.sources || [],
        confidence: data.confidence || 0,
        disclaimer: data.disclaimer,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "Sorry, something went wrong. Please try again later.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  // --- Lawyer Matching Handler ---
  const findLawyers = async () => {
    if (!issueDescription.trim() || isMatching || !user) return;

    setIsMatching(true);
    setMatchedLawyers([]);
    setMatchMessage("");

    try {
      const token = await user.getIdToken();
      const res = await fetch(`${BACKEND_URL}/api/ai/match-lawyers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ description: issueDescription.trim() }),
      });

      const data = await res.json();
      setMatchedLawyers(data.lawyers || []);
      setMatchMessage(data.message || "");
    } catch (error) {
      console.error("Matching error:", error);
      setMatchMessage("Something went wrong. Please try again.");
    } finally {
      setIsMatching(false);
    }
  };

  // --- Confidence Badge ---
  const ConfidenceBadge = ({ score }: { score: number }) => {
    const color =
      score >= 70
        ? "bg-emerald-100 text-emerald-700 border-emerald-200"
        : score >= 40
        ? "bg-amber-100 text-amber-700 border-amber-200"
        : "bg-red-100 text-red-700 border-red-200";

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${color}`}>
        <Sparkles className="w-3 h-3" />
        {score}% match
      </span>
    );
  };

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-8">
        {/* Header */}
        <div className="pt-8 pb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-[#1B3A6B] to-[#2b5eaa] shadow-lg shadow-blue-900/20">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#112549]">AI Legal Assistant</h1>
              <p className="text-sm text-gray-500">Powered by Sri Lankan legal knowledge</p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1 p-1 bg-white rounded-2xl border border-gray-200 shadow-sm mb-6 max-w-md">
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeTab === "chat"
                ? "bg-[#1B3A6B] text-white shadow-md shadow-blue-900/20"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Ask Legal Question
          </button>
          <button
            onClick={() => setActiveTab("match")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeTab === "match"
                ? "bg-[#1B3A6B] text-white shadow-md shadow-blue-900/20"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Users className="w-4 h-4" />
            Find a Lawyer
          </button>
        </div>

        {/* ΓöÇΓöÇΓöÇΓöÇ CHAT TAB ΓöÇΓöÇΓöÇΓöÇ */}
        {activeTab === "chat" && (
          <div className="flex flex-col bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden" style={{ height: "calc(100vh - 280px)" }}>
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.length === 0 ? (
                /* Empty State */
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#1B3A6B]/10 to-blue-100 flex items-center justify-center mb-6">
                    <Scale className="w-10 h-10 text-[#1B3A6B]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#112549] mb-2">Ask me anything about Sri Lankan law</h3>
                  <p className="text-sm text-gray-500 max-w-md mb-8">
                    I can help with questions about family law, criminal law, property disputes, labor rights, and more.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
                    {suggestedQuestions.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(q.text)}
                        className="flex items-start gap-3 p-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-blue-50 hover:border-blue-200 transition-all duration-200 text-left group"
                      >
                        <q.icon className="w-5 h-5 text-[#1B3A6B] mt-0.5 shrink-0 group-hover:text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-800 group-hover:text-[#1B3A6B]">{q.text}</p>
                          <p className="text-[11px] text-gray-400 mt-1">{q.category}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Message Bubbles */
                messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.role === "assistant" && (
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1B3A6B] to-[#2b5eaa] flex items-center justify-center shrink-0 mt-1">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] ${
                        msg.role === "user"
                          ? "bg-[#1B3A6B] text-white rounded-2xl rounded-tr-md px-5 py-3"
                          : "bg-gray-50 border border-gray-100 rounded-2xl rounded-tl-md px-5 py-4"
                      }`}
                    >
                      {/* Message Content */}
                      <div className={`text-sm leading-relaxed whitespace-pre-wrap ${msg.role === "user" ? "text-white" : "text-gray-800"}`}>
                        {msg.content}
                      </div>

                      {/* Confidence + Sources */}
                      {msg.role === "assistant" && msg.sources && msg.sources.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-gray-200 space-y-3">
                          <div className="flex items-center gap-2">
                            {msg.confidence !== undefined && <ConfidenceBadge score={msg.confidence} />}
                            <span className="text-[11px] text-gray-400">{msg.sources.length} source(s)</span>
                          </div>

                          <div className="space-y-2">
                            {msg.sources.map((src, i) => (
                              <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-white border border-gray-100">
                                <BookOpen className="w-3.5 h-3.5 text-[#1B3A6B] mt-0.5 shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-gray-700 truncate">{src.title}</p>
                                  <p className="text-[10px] text-gray-400">{src.source} ΓÇó {src.category}</p>
                                </div>
                                <span className="text-[10px] font-medium text-gray-400 shrink-0">{src.relevance}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Disclaimer */}
                      {msg.disclaimer && (
                        <div className="mt-3 flex items-start gap-1.5 p-2 rounded-lg bg-amber-50 border border-amber-100">
                          <Info className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                          <p className="text-[10px] text-amber-700 leading-relaxed">{msg.disclaimer}</p>
                        </div>
                      )}

                      {/* Timestamp */}
                      <p className={`text-[10px] mt-2 ${msg.role === "user" ? "text-blue-200" : "text-gray-400"}`}>
                        {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    {msg.role === "user" && (
                      <div className="w-8 h-8 rounded-xl bg-gray-200 flex items-center justify-center shrink-0 mt-1">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                    )}
                  </div>
                ))
              )}

              {/* Typing Indicator */}
              {isSending && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1B3A6B] to-[#2b5eaa] flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-tl-md px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 text-[#1B3A6B] animate-spin" />
                      <span className="text-sm text-gray-500">Searching legal knowledge base...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="border-t border-gray-100 bg-white p-4">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="Ask a legal question..."
                  className="flex-1 px-5 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B]/40 transition-all"
                  disabled={isSending}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isSending}
                  className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1B3A6B] to-[#2b5eaa] text-white shadow-lg shadow-blue-900/20 hover:shadow-xl hover:shadow-blue-900/30 disabled:opacity-40 disabled:shadow-none transition-all duration-200"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ΓöÇΓöÇΓöÇΓöÇ LAWYER MATCHING TAB ΓöÇΓöÇΓöÇΓöÇ */}
        {activeTab === "match" && (
          <div className="space-y-6">
            {/* Search Card */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-orange-50">
                  <Search className="w-5 h-5 text-[#F97316]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#112549]">Describe Your Legal Issue</h2>
                  <p className="text-sm text-gray-500">Our AI will find the best-matching lawyers for you</p>
                </div>
              </div>

              <textarea
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                placeholder="Example: I need help with a property dispute in Colombo. My neighbor is claiming part of my land and I have the original deed..."
                rows={4}
                className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-200 text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B]/40 transition-all"
              />

              <button
                onClick={findLawyers}
                disabled={!issueDescription.trim() || isMatching}
                className="mt-4 flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3 rounded-2xl bg-gradient-to-r from-[#1B3A6B] to-[#2b5eaa] text-white font-semibold text-sm shadow-lg shadow-blue-900/20 hover:shadow-xl hover:shadow-blue-900/30 disabled:opacity-40 disabled:shadow-none transition-all duration-200"
              >
                {isMatching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Searching lawyers...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Find Matching Lawyers
                  </>
                )}
              </button>
            </div>

            {/* Results */}
            {matchMessage && matchedLawyers.length === 0 && !isMatching && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
                <Info className="w-5 h-5 text-amber-600 shrink-0" />
                <p className="text-sm text-amber-800">{matchMessage}</p>
              </div>
            )}

            {matchedLawyers.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-[#112549]">Matched Lawyers</h3>
                  <span className="text-sm text-gray-500">{matchedLawyers.length} result(s)</span>
                </div>

                <div className="grid gap-4">
                  {matchedLawyers.map((lawyer) => (
                    <div
                      key={lawyer.id}
                      className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md hover:border-blue-200 transition-all duration-200 group"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 min-w-0">
                          {/* Avatar */}
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1B3A6B]/10 to-blue-100 flex items-center justify-center shrink-0 text-[#1B3A6B] font-bold text-xl">
                            {lawyer.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-base font-bold text-[#112549] truncate">{lawyer.name}</h4>
                              {lawyer.isVerified && (
                                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
                                  Γ£ô Verified
                                </span>
                              )}
                            </div>

                            {/* Specializations */}
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              {lawyer.specializations.map((spec, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-[#1B3A6B] border border-blue-100"
                                >
                                  {spec}
                                </span>
                              ))}
                            </div>

                            {/* Details */}
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              {lawyer.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {lawyer.location}
                                </span>
                              )}
                              {lawyer.hourlyRate && (
                                <span className="flex items-center gap-1">
                                  LKR {lawyer.hourlyRate.toLocaleString()}/hr
                                </span>
                              )}
                            </div>

                            {lawyer.bio && (
                              <p className="text-sm text-gray-600 mt-2 line-clamp-2">{lawyer.bio}</p>
                            )}
                          </div>
                        </div>

                        {/* Match Score + Action */}
                        <div className="flex flex-col items-end gap-3 shrink-0">
                          <div className="flex items-center gap-1.5">
                            <Star className="w-4 h-4 text-[#F97316]" />
                            <span className="text-lg font-bold text-[#112549]">{lawyer.matchScore}%</span>
                          </div>
                          <a
                            href={`/find-lawyer`}
                            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-[#1B3A6B] text-white text-xs font-semibold hover:bg-[#112549] transition-colors group-hover:shadow-md"
                          >
                            View Profile
                            <ChevronRight className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div className="flex items-start gap-2 p-4 rounded-2xl bg-blue-50 border border-blue-100">
              <Info className="w-4 h-4 text-[#1B3A6B] mt-0.5 shrink-0" />
              <p className="text-xs text-[#1B3A6B]/80 leading-relaxed">
                Lawyer matching is based on specialization relevance to your described issue. Always verify credentials and discuss your case details directly with the lawyer before engagement.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
