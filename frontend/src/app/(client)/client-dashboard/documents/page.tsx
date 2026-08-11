"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../context/AuthContext";
import { 
  FileText, 
  Search, 
  Filter, 
  UploadCloud, 
  Download, 
  Trash2, 
  Eye, 
  File, 
  FileImage,
  AlertCircle,
  FolderOpen
} from "lucide-react";
import UploadDocumentModal from "../../../components/UploadDocumentModal";

interface Case {
  id: string;
  title: string;
  caseNumber: string;
}

interface Document {
  id: string;
  fileName: string;
  fileType: string;
  fileUrl: string;
  fileSize: number;
  documentType: string;
  createdAt: string;
  uploadedBy: {
    name: string;
    role: string;
  };
  case: {
    title: string;
    caseNumber: string;
  };
  uploadedById: string;
}

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

async function authHeaders(user: any): Promise<HeadersInit> {
  const token = await user.getIdToken();
  return {
    Authorization: `Bearer ${token}`,
  };
}

// Utility to get nice icons based on mime type
const getFileIcon = (mimeType: string, className = "w-6 h-6") => {
  if (mimeType.includes("pdf")) return <FileText className={`${className} text-red-500`} />;
  if (mimeType.includes("word") || mimeType.includes("document")) return <FileText className={`${className} text-blue-600`} />;
  if (mimeType.includes("image")) return <FileImage className={`${className} text-purple-500`} />;
  return <File className={`${className} text-gray-500`} />;
};

// Utility to format size
const formatSize = (bytes: number) => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

// Utility to format Document Type
const formatDocType = (type: string) => {
  return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

export default function CaseDocumentsPage() {
  const { user } = useAuth();
  
  const [documents, setDocuments] = useState<Document[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCaseId, setSelectedCaseId] = useState("");
  const [selectedDocType, setSelectedDocType] = useState("");
  
  // Modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const fetchCases = useCallback(async () => {
    if (!user) return;
    try {
      const headers = await authHeaders(user);
      const res = await fetch(`${API_BASE}/api/cases`, { headers });
      if (res.ok) {
        const data = await res.json();
        setCases(data);
      }
    } catch (err) {
      console.error(err);
    }
  }, [user]);

  const fetchDocuments = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const headers = await authHeaders(user);
      
      const params = new URLSearchParams();
      if (selectedCaseId) params.append("caseId", selectedCaseId);
      if (selectedDocType) params.append("documentType", selectedDocType);
      if (searchQuery) params.append("search", searchQuery);
      
      const res = await fetch(`${API_BASE}/api/documents?${params.toString()}`, { headers });
      
      if (!res.ok) throw new Error("Failed to load documents");
      
      const data = await res.json();
      setDocuments(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [user, selectedCaseId, selectedDocType, searchQuery]);

  // Initial load
  useEffect(() => {
    if (user) {
      fetchCases();
      fetchDocuments();
    }
  }, [user, fetchCases, fetchDocuments]);

  // Actions
  const handleDownload = async (docId: string, fileName: string) => {
    if (!user) return;
    try {
      const headers = await authHeaders(user);
      const res = await fetch(`${API_BASE}/api/documents/${docId}/download`, { headers });
      
      if (!res.ok) throw new Error("Failed to download");
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert("Failed to download document. Please try again.");
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm("Are you sure you want to delete this document? This cannot be undone.")) return;
    if (!user) return;
    
    try {
      const headers = await authHeaders(user);
      const res = await fetch(`${API_BASE}/api/documents/${docId}`, { 
        method: "DELETE",
        headers 
      });
      
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Failed to delete");
      }
      
      // Remove from list
      setDocuments(prev => prev.filter(d => d.id !== docId));
    } catch (err: any) {
      alert(err.message || "Failed to delete document.");
    }
  };

  // UI rendering
  if (loading && documents.length === 0) {
    return (
      <main className="max-w-[1200px] w-full mx-auto px-4 md:px-8 py-8">
        <div className="h-8 w-64 bg-gray-200 animate-pulse rounded mb-2" />
        <div className="h-4 w-48 bg-gray-200 animate-pulse rounded mb-8" />
        
        <div className="flex gap-4 mb-6">
          <div className="h-10 w-1/3 bg-gray-200 animate-pulse rounded-xl" />
          <div className="h-10 w-1/4 bg-gray-200 animate-pulse rounded-xl" />
          <div className="h-10 w-1/4 bg-gray-200 animate-pulse rounded-xl" />
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-16 w-full bg-gray-100 animate-pulse rounded-xl" />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-[1200px] w-full mx-auto px-4 md:px-8 py-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1B3A6B] tracking-tight">Case Documents</h1>
          <p className="text-gray-500 mt-2 text-base">View and manage documents for your active cases.</p>
        </div>
        <button 
          onClick={() => setIsUploadModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#1B3A6B] hover:bg-[#112549] text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
        >
          <UploadCloud className="w-5 h-5" />
          Upload Document
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 items-center">
        
        <div className="relative flex-1 w-full">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search documents by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-48">
            <Filter className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <select
              value={selectedCaseId}
              onChange={(e) => setSelectedCaseId(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:bg-white appearance-none cursor-pointer"
            >
              <option value="">All Cases</option>
              {cases.map(c => (
                <option key={c.id} value={c.id}>{c.caseNumber} - {c.title}</option>
              ))}
            </select>
          </div>

          <select
            value={selectedDocType}
            onChange={(e) => setSelectedDocType(e.target.value)}
            className="w-full md:w-48 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:bg-white cursor-pointer"
          >
            <option value="">All Types</option>
            <option value="CONTRACT">Contract</option>
            <option value="COURT_FILING">Court Filing</option>
            <option value="EVIDENCE">Evidence</option>
            <option value="CORRESPONDENCE">Correspondence</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>

      {/* Error state */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-start gap-3 mb-6">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-red-800">Error loading documents</h4>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
          <button onClick={fetchDocuments} className="ml-auto px-4 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-sm font-bold rounded-lg transition-colors">
            Retry
          </button>
        </div>
      )}

      {/* Document List */}
      {!loading && !error && documents.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-16 px-4 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-5">
            <FolderOpen className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No documents yet</h3>
          <p className="text-gray-500 max-w-sm mx-auto mb-6">
            {searchQuery || selectedCaseId || selectedDocType 
              ? "We couldn't find any documents matching your filters." 
              : "Upload your first document to start keeping track of your case files."}
          </p>
          <button 
            onClick={() => {
              if (searchQuery || selectedCaseId || selectedDocType) {
                setSearchQuery("");
                setSelectedCaseId("");
                setSelectedDocType("");
              } else {
                setIsUploadModalOpen(true);
              }
            }}
            className="px-6 py-2.5 bg-[#1B3A6B] hover:bg-[#112549] text-white font-bold rounded-xl shadow-sm transition-colors"
          >
            {searchQuery || selectedCaseId || selectedDocType ? "Clear Filters" : "Upload Document"}
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Document Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Case</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date & Uploader</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Size</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {documents.map((doc) => {
                  const date = new Date(doc.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                  
                  // In Prisma, we mapped user.id to uploadedById, but we also check if doc.uploadedBy.id matches user?.uid
                  // Wait, Firebase uid is user.uid, but in Prisma uploadedById is the postgres UUID. 
                  // If the user's role is client, they can delete their own documents.
                  // For simplicity on the frontend, let's assume we get the backend to enforce the delete, but we show the button if they uploaded it.
                  // Or we can just let the backend reject if they try to delete something they didn't upload.
                  // Actually, let's just always show delete if the role of the uploader is "client" and this is the client dashboard.
                  const canDelete = doc.uploadedBy.role === 'client' || doc.uploadedBy.role === 'user'; 

                  return (
                    <tr key={doc.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                            {getFileIcon(doc.fileType)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 truncate max-w-[200px] xl:max-w-[300px]" title={doc.fileName}>
                              {doc.fileName}
                            </p>
                            <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded text-[10px] font-bold bg-blue-50 text-blue-700 tracking-wide uppercase">
                              {formatDocType(doc.documentType)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-gray-900">{doc.case.caseNumber}</p>
                        <p className="text-xs text-gray-500 truncate max-w-[150px]" title={doc.case.title}>{doc.case.title}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">{date}</p>
                        <p className="text-xs text-gray-500">by {doc.uploadedBy.name}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md">
                          {formatSize(doc.fileSize)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleDownload(doc.id, doc.fileName)}
                            className="p-2 text-gray-400 hover:text-[#1B3A6B] hover:bg-blue-50 rounded-lg transition-all"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          
                          {canDelete && (
                            <button 
                              onClick={() => handleDelete(doc.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      <UploadDocumentModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
        onSuccess={() => {
          setIsUploadModalOpen(false);
          fetchDocuments(); // Refresh the list
        }}
      />
    </main>
  );
}
