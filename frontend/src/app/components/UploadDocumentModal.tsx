"use client";

import React, { useState, useEffect } from "react";
import { X, UploadCloud, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Case {
  id: string;
  title: string;
  caseNumber: string;
}

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

async function authHeaders(user: any): Promise<HeadersInit> {
  const token = await user.getIdToken();
  return {
    Authorization: `Bearer ${token}`,
  };
}

export default function UploadDocumentModal({ isOpen, onClose, onSuccess }: UploadDocumentModalProps) {
  const { user } = useAuth();
  
  const [cases, setCases] = useState<Case[]>([]);
  const [casesLoading, setCasesLoading] = useState(false);
  
  const [selectedCase, setSelectedCase] = useState("");
  const [documentType, setDocumentType] = useState("OTHER");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      // Reset state
      setFile(null);
      setSelectedCase("");
      setDocumentType("OTHER");
      setDescription("");
      setError(null);
      setSuccess(false);
      
      // Fetch cases
      const fetchCases = async () => {
        setCasesLoading(true);
        try {
          const headers = await authHeaders(user);
          const res = await fetch(`${API_BASE}/api/cases`, { headers });
          if (res.ok) {
            const data = await res.json();
            setCases(data);
          }
        } catch (err) {
          console.error("Failed to fetch cases:", err);
        } finally {
          setCasesLoading(false);
        }
      };
      
      fetchCases();
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      
      // Validate type
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(selected.type)) {
        setError("Invalid file type. Only PDF, DOCX, JPG, and PNG are allowed.");
        return;
      }
      
      // Validate size (10MB)
      if (selected.size > 10 * 1024 * 1024) {
        setError("File is too large. Maximum size is 10MB.");
        return;
      }
      
      setFile(selected);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }
    if (!selectedCase) {
      setError("Please select a case to associate this document with.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("caseId", selectedCase);
      formData.append("documentType", documentType);
      if (description) formData.append("description", description);

      const headers = await authHeaders(user);
      
      const res = await fetch(`${API_BASE}/api/documents`, {
        method: "POST",
        headers, // Do not set Content-Type for FormData
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to upload document");
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during upload.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={!uploading && !success ? onClose : undefined} />
      
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Upload Document</h3>
          <button 
            onClick={onClose}
            disabled={uploading || success}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Upload Successful!</h4>
              <p className="text-sm text-gray-500">Your document has been securely saved.</p>
            </div>
          ) : (
            <div className="space-y-5">
              
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* File Drop/Pick Area */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Document File</label>
                <div className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-colors ${
                  file ? 'border-[#1B3A6B] bg-blue-50/50' : 'border-gray-200 bg-gray-50 hover:bg-gray-100/50'
                }`}>
                  {file ? (
                    <>
                      <FileText className="w-8 h-8 text-[#1B3A6B] mb-2" />
                      <p className="text-sm font-medium text-gray-900 truncate max-w-xs">{file.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      <button 
                        onClick={() => setFile(null)}
                        className="text-xs text-red-600 font-semibold mt-3 hover:underline"
                      >
                        Remove file
                      </button>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-sm font-medium text-gray-700 mb-1">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-500">PDF, DOCX, JPG, or PNG (max 10MB)</p>
                      <input 
                        type="file" 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        accept=".pdf,.docx,.jpg,.jpeg,.png,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png"
                        onChange={handleFileChange}
                      />
                    </>
                  )}
                </div>
              </div>

              {/* Case Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Associated Case</label>
                <select 
                  value={selectedCase}
                  onChange={(e) => setSelectedCase(e.target.value)}
                  disabled={casesLoading}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:bg-white transition-all disabled:opacity-50"
                >
                  <option value="" disabled>Select a case...</option>
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.caseNumber} - {c.title}
                    </option>
                  ))}
                </select>
                {cases.length === 0 && !casesLoading && (
                  <p className="text-xs text-amber-600 mt-1.5 font-medium">You don't have any active cases to upload to.</p>
                )}
              </div>

              {/* Document Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Document Type</label>
                <select 
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:bg-white transition-all"
                >
                  <option value="CONTRACT">Contract</option>
                  <option value="COURT_FILING">Court Filing</option>
                  <option value="EVIDENCE">Evidence</option>
                  <option value="CORRESPONDENCE">Correspondence</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description <span className="text-gray-400 font-normal">(Optional)</span></label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Briefly describe the contents of this document..."
                  rows={2}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:bg-white transition-all resize-none"
                />
              </div>

            </div>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
            <button 
              onClick={onClose}
              disabled={uploading}
              className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              onClick={handleUpload}
              disabled={uploading || !file || !selectedCase}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#1B3A6B] hover:bg-[#112549] text-white text-sm font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading
                </>
              ) : (
                "Upload"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
