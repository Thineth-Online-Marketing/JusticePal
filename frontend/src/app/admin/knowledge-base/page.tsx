"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  Brain,
  Plus,
  Trash2,
  Search,
  Filter,
  BookOpen,
  Scale,
  FileText,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  X,
  Loader2,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Database,
  Layers,
  Tag,
} from "lucide-react";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://justicepal-production.up.railway.app";

// ─── Types ──────────────────────────────────────────────
interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  category: string;
  source: string;
  type: string;
}

// ─── Constants ──────────────────────────────────────────
const CATEGORIES = [
  "Criminal Law",
  "Family Law",
  "Property Law",
  "Labor Law",
  "Civil Procedure",
  "Consumer Protection",
  "Constitutional Law",
  "FAQ",
];

const TYPES: { value: string; label: string; icon: React.ElementType }[] = [
  { value: "law", label: "Law", icon: Scale },
  { value: "faq", label: "FAQ", icon: HelpCircle },
  { value: "procedure", label: "Procedure", icon: FileText },
];

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "Criminal Law": { bg: "#fef2f2", text: "#991b1b", border: "#fecaca" },
  "Family Law": { bg: "#fdf4ff", text: "#86198f", border: "#f5d0fe" },
  "Property Law": { bg: "#eff6ff", text: "#1e40af", border: "#bfdbfe" },
  "Labor Law": { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0" },
  "Civil Procedure": { bg: "#fffbeb", text: "#92400e", border: "#fde68a" },
  "Consumer Protection": { bg: "#fefce8", text: "#854d0e", border: "#fef08a" },
  "Constitutional Law": { bg: "#eef2ff", text: "#3730a3", border: "#c7d2fe" },
  FAQ: { bg: "#f0fdfa", text: "#115e59", border: "#99f6e4" },
};

const TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  law: { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe" },
  faq: { bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0" },
  procedure: { bg: "#fffbeb", text: "#b45309", border: "#fde68a" },
};

// ─── Main Page Component ────────────────────────────────
export default function KnowledgeBasePage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search & filter
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterType, setFilterType] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Expanded rows
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Add modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    title: "",
    content: "",
    category: CATEGORIES[0],
    source: "",
    type: "law",
  });
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState("");

  // Delete
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Toast notification
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // ─── Fetch Knowledge ────────────────────────────
  const fetchKnowledge = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError("");
      const token = await user.getIdToken();
      const res = await fetch(`${BACKEND_URL}/api/admin/knowledge`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch knowledge entries");
      const data = await res.json();
      setEntries(data.entries || []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load knowledge base";
      console.error("Error fetching knowledge:", err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchKnowledge();
    }
  }, [user]);

  // ─── Add Knowledge ─────────────────────────────
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !addForm.title.trim() ||
      !addForm.content.trim() ||
      !addForm.source.trim()
    ) {
      setAddError("All fields are required");
      return;
    }

    if (!user) return;
    try {
      setIsAdding(true);
      setAddError("");
      const token = await user.getIdToken();
      const res = await fetch(`${BACKEND_URL}/api/admin/knowledge`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(addForm),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to add entry");
      }

      showToast("Knowledge entry added successfully!", "success");
      setShowAddModal(false);
      setAddForm({
        title: "",
        content: "",
        category: CATEGORIES[0],
        source: "",
        type: "law",
      });
      await fetchKnowledge();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to add entry";
      setAddError(message);
    } finally {
      setIsAdding(false);
    }
  };

  // ─── Delete Knowledge ──────────────────────────
  const handleDelete = async (id: string) => {
    if (!user) return;
    try {
      setDeletingId(id);
      const token = await user.getIdToken();
      const res = await fetch(
        `${BACKEND_URL}/api/admin/knowledge/${encodeURIComponent(id)}`,
        { 
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (!res.ok) throw new Error("Failed to delete entry");

      showToast("Knowledge entry deleted", "success");
      setConfirmDeleteId(null);
      await fetchKnowledge();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete entry";
      showToast(message, "error");
    } finally {
      setDeletingId(null);
    }
  };

  // ─── Toast ──────────────────────────────────────
  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ─── Filtered & Searched Entries ────────────────
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchSearch =
        !searchQuery ||
        entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.source.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory =
        !filterCategory || entry.category === filterCategory;
      const matchType = !filterType || entry.type === filterType;

      return matchSearch && matchCategory && matchType;
    });
  }, [entries, searchQuery, filterCategory, filterType]);

  // ─── Category Stats ─────────────────────────────
  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {};
    entries.forEach((e) => {
      stats[e.category] = (stats[e.category] || 0) + 1;
    });
    return stats;
  }, [entries]);

  const typeStats = useMemo(() => {
    const stats: Record<string, number> = {};
    entries.forEach((e) => {
      stats[e.type] = (stats[e.type] || 0) + 1;
    });
    return stats;
  }, [entries]);

  // ─────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────
  return (
    <>
      {/* ── Page Header ───────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "#3b82f615" }}
            >
              <Brain size={20} color="#3b82f6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
              Knowledge Base
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 ml-[46px]">
            Manage the AI legal knowledge database powering the chatbot
          </p>
        </div>
        <div className="flex items-center gap-2 ml-[46px] sm:ml-0">
          <button
            onClick={fetchKnowledge}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all disabled:opacity-50"
          >
            <RefreshCw
              size={13}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all hover:brightness-110 hover:-translate-y-0.5"
            style={{
              background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
              boxShadow: "0 4px 12px rgba(59,130,246,0.3)",
            }}
          >
            <Plus size={14} />
            Add Entry
          </button>
        </div>
      </div>

      {/* ── Stat Cards ────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          className="rounded-xl p-4"
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "#3b82f615" }}
            >
              <Database size={16} color="#3b82f6" />
            </div>
          </div>
          <p className="text-xl font-bold text-slate-800">{entries.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Total Entries</p>
        </div>

        <div
          className="rounded-xl p-4"
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "#8b5cf615" }}
            >
              <Layers size={16} color="#8b5cf6" />
            </div>
          </div>
          <p className="text-xl font-bold text-slate-800">
            {Object.keys(categoryStats).length}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Categories</p>
        </div>

        <div
          className="rounded-xl p-4"
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "#1d4ed815" }}
            >
              <Scale size={16} color="#1d4ed8" />
            </div>
          </div>
          <p className="text-xl font-bold text-slate-800">
            {typeStats["law"] || 0}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Laws</p>
        </div>

        <div
          className="rounded-xl p-4"
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "#10b98115" }}
            >
              <HelpCircle size={16} color="#10b981" />
            </div>
          </div>
          <p className="text-xl font-bold text-slate-800">
            {(typeStats["faq"] || 0) + (typeStats["procedure"] || 0)}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            FAQs & Procedures
          </p>
        </div>
      </div>

      {/* ── Search & Filter Bar ───────────────────── */}
      <div
        className="rounded-xl p-4"
        style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, content, or source..."
              className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold border transition-all ${showFilters || filterCategory || filterType
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
          >
            <Filter size={13} />
            Filters
            {(filterCategory || filterType) && (
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            )}
          </button>
        </div>

        {/* Filter Dropdowns */}
        {showFilters && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-3 pt-3 border-t border-slate-100">
            <div className="flex-1">
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat} ({categoryStats[cat] || 0})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">All Types</option>
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label} ({typeStats[t.value] || 0})
                  </option>
                ))}
              </select>
            </div>
            {(filterCategory || filterType) && (
              <button
                onClick={() => {
                  setFilterCategory("");
                  setFilterType("");
                }}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-100 transition-all self-end"
              >
                <X size={12} />
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Knowledge Table ───────────────────────── */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        {/* Table Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <BookOpen size={15} className="text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-800">
              Knowledge Entries
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {filteredEntries.length} of {entries.length} entries
          </span>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400">
            <Loader2 size={28} className="animate-spin mb-3" />
            <p className="text-sm font-medium">
              Loading knowledge base...
            </p>
            <p className="text-xs mt-1">
              Fetching entries from Pinecone vector database
            </p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="p-8 text-center">
            <AlertTriangle
              size={28}
              className="text-red-400 mx-auto mb-2"
            />
            <p className="text-sm font-medium text-red-600">{error}</p>
            <button
              onClick={fetchKnowledge}
              className="mt-3 text-xs font-semibold text-blue-600 hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredEntries.length === 0 && (
          <div className="p-12 text-center">
            <Database
              size={32}
              className="text-slate-300 mx-auto mb-3"
            />
            <p className="text-sm font-medium text-slate-500">
              {entries.length === 0
                ? "No knowledge entries found"
                : "No entries match your search"}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {entries.length === 0
                ? "Add your first legal knowledge entry to get started"
                : "Try adjusting your search or filters"}
            </p>
            {entries.length === 0 && (
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all"
              >
                <Plus size={13} />
                Add First Entry
              </button>
            )}
          </div>
        )}

        {/* Desktop Table */}
        {!loading && !error && filteredEntries.length > 0 && (
          <>
            <table className="w-full text-left hidden md:table">
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  <th className="px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((entry) => {
                  const isExpanded = expandedId === entry.id;
                  const catColor =
                    CATEGORY_COLORS[entry.category] || CATEGORY_COLORS["FAQ"];
                  const typeColor =
                    TYPE_COLORS[entry.type] || TYPE_COLORS["law"];

                  return (
                    <React.Fragment key={entry.id}>
                      <tr
                        className="border-t border-slate-100 hover:bg-slate-50/60 transition-colors cursor-pointer"
                        onClick={() =>
                          setExpandedId(isExpanded ? null : entry.id)
                        }
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            {isExpanded ? (
                              <ChevronUp
                                size={14}
                                className="text-slate-400 shrink-0"
                              />
                            ) : (
                              <ChevronDown
                                size={14}
                                className="text-slate-400 shrink-0"
                              />
                            )}
                            <span className="text-sm font-medium text-slate-700 line-clamp-1">
                              {entry.title}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                            style={{
                              background: catColor.bg,
                              color: catColor.text,
                              border: `1px solid ${catColor.border}`,
                            }}
                          >
                            {entry.category}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-slate-500 max-w-[200px] truncate">
                          {entry.source}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize"
                            style={{
                              background: typeColor.bg,
                              color: typeColor.text,
                              border: `1px solid ${typeColor.border}`,
                            }}
                          >
                            <Tag size={10} />
                            {entry.type}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDeleteId(entry.id);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all"
                          >
                            <Trash2 size={12} />
                            Delete
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Content Row */}
                      {isExpanded && (
                        <tr className="border-t border-slate-50">
                          <td
                            colSpan={5}
                            className="px-5 py-4"
                            style={{ background: "#f8fafc" }}
                          >
                            <div className="rounded-xl p-4 bg-white border border-slate-200">
                              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                Content Preview
                              </h4>
                              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                                {entry.content}
                              </p>
                              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100">
                                <span className="text-[10px] text-slate-400">
                                  <span className="font-semibold text-slate-500">
                                    ID:
                                  </span>{" "}
                                  {entry.id}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  <span className="font-semibold text-slate-500">
                                    Characters:
                                  </span>{" "}
                                  {entry.content.length.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredEntries.map((entry) => {
                const isExpanded = expandedId === entry.id;
                const catColor =
                  CATEGORY_COLORS[entry.category] || CATEGORY_COLORS["FAQ"];
                const typeColor =
                  TYPE_COLORS[entry.type] || TYPE_COLORS["law"];

                return (
                  <div key={entry.id} className="p-4 space-y-2.5">
                    <div
                      className="flex items-start justify-between cursor-pointer"
                      onClick={() =>
                        setExpandedId(isExpanded ? null : entry.id)
                      }
                    >
                      <div className="flex items-start gap-2 min-w-0">
                        {isExpanded ? (
                          <ChevronUp
                            size={14}
                            className="text-slate-400 shrink-0 mt-0.5"
                          />
                        ) : (
                          <ChevronDown
                            size={14}
                            className="text-slate-400 shrink-0 mt-0.5"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-700 line-clamp-2">
                            {entry.title}
                          </p>
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            <span
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold"
                              style={{
                                background: catColor.bg,
                                color: catColor.text,
                                border: `1px solid ${catColor.border}`,
                              }}
                            >
                              {entry.category}
                            </span>
                            <span
                              className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize"
                              style={{
                                background: typeColor.bg,
                                color: typeColor.text,
                                border: `1px solid ${typeColor.border}`,
                              }}
                            >
                              <Tag size={8} />
                              {entry.type}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDeleteId(entry.id);
                        }}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-all shrink-0"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="ml-6 rounded-xl p-3 bg-slate-50 border border-slate-200">
                        <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                          {entry.content}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-2">
                          Source: {entry.source}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ── ADD KNOWLEDGE MODAL ───────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div
            className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
            style={{ animation: "fadeInUp 0.2s ease-out" }}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-800">
                  Add Knowledge Entry
                </h3>
                <p className="text-xs text-slate-400">
                  Add legal knowledge to power the AI chatbot
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setAddError("");
                }}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1 hover:bg-slate-200/50 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAdd} className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-5">
                {addError && (
                  <div
                    className="px-4 py-2.5 rounded-lg text-sm font-medium text-red-700 flex items-center gap-2"
                    style={{
                      background: "#fef2f2",
                      border: "1px solid #fecaca",
                    }}
                  >
                    <AlertTriangle size={14} />
                    {addError}
                  </div>
                )}

                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={addForm.title}
                    onChange={(e) =>
                      setAddForm({ ...addForm, title: e.target.value })
                    }
                    placeholder="e.g., Sri Lanka Penal Code - Robbery (Section 380)"
                    className="w-full px-4 py-2.5 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 outline-none border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Content <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={addForm.content}
                    onChange={(e) =>
                      setAddForm({ ...addForm, content: e.target.value })
                    }
                    placeholder="Enter the full legal text, explanation, or FAQ answer..."
                    rows={6}
                    className="w-full px-4 py-2.5 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 outline-none border border-slate-200 bg-slate-50 resize-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    {addForm.content.length} characters
                  </p>
                </div>

                {/* Category & Type Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={addForm.category}
                      onChange={(e) =>
                        setAddForm({ ...addForm, category: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-xl text-sm text-slate-800 outline-none border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={addForm.type}
                      onChange={(e) =>
                        setAddForm({ ...addForm, type: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-xl text-sm text-slate-800 outline-none border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                    >
                      {TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Source */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Source / Legal Reference{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={addForm.source}
                    onChange={(e) =>
                      setAddForm({ ...addForm, source: e.target.value })
                    }
                    placeholder="e.g., Sri Lanka Penal Code, Section 380"
                    className="w-full px-4 py-2.5 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 outline-none border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setAddError("");
                  }}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-xl text-xs font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="px-5 py-2 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:brightness-110"
                  style={{
                    background:
                      "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                    boxShadow: "0 4px 12px rgba(59,130,246,0.25)",
                  }}
                >
                  {isAdding ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      Adding & Embedding...
                    </>
                  ) : (
                    <>
                      <Plus size={13} />
                      Add to Knowledge Base
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRMATION MODAL ─────────────── */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div
            className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-sm p-6"
            style={{ animation: "fadeInUp 0.2s ease-out" }}
          >
            <div className="flex flex-col items-center text-center">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                style={{ background: "#fef2f2" }}
              >
                <Trash2 size={22} color="#ef4444" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">
                Delete Knowledge Entry?
              </h3>
              <p className="text-sm text-slate-500 mb-5">
                This will permanently remove this entry from the AI knowledge
                base. This action cannot be undone.
              </p>
              <div className="flex items-center gap-3 w-full">
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="flex-1 px-4 py-2.5 text-slate-600 bg-white border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(confirmDeleteId)}
                  disabled={deletingId !== null}
                  className="flex-1 px-4 py-2.5 text-white bg-red-600 hover:bg-red-700 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                >
                  {deletingId === confirmDeleteId ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={14} />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST NOTIFICATION ────────────────────── */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold shadow-lg border"
          style={{
            background: toast.type === "success" ? "#f0fdf4" : "#fef2f2",
            color: toast.type === "success" ? "#166534" : "#991b1b",
            borderColor:
              toast.type === "success" ? "#bbf7d0" : "#fecaca",
            animation: "fadeInUp 0.3s ease-out",
          }}
        >
          {toast.type === "success" ? (
            <CheckCircle size={16} />
          ) : (
            <AlertTriangle size={16} />
          )}
          {toast.message}
        </div>
      )}

      {/* ── Keyframe Animation ────────────────────── */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
