"use client";

import React, { useState, useEffect, useRef, Suspense, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { 
  Mic, MicOff, Video, VideoOff, Monitor, MessageSquare, 
  Users, Settings, PhoneOff, Shield, Radio,
  Send, Paperclip, Plus, FileText, Download, 
  Sparkles, X, Loader2, Volume2, ShieldCheck, 
  FileSignature, Calendar, LayoutDashboard, Clock, CircleDot, Trash2, Wifi
} from "lucide-react";
import ClientNavbar from "../components/ClientNavbar";
import JusticePalLogo from "../components/JusticePalLogo";
import { useAuth } from "../context/AuthContext";
import { useUI } from "../context/UIContext";

// Typed interfaces for real data
interface ChatMessage {
  id: string;
  senderRole: string;
  text: string;
  createdAt: string;
  sender?: { id: string; name: string };
}

interface Participant {
  id: string;
  name: string;
  email: string;
}

interface RoomInfo {
  id: string;
  appointmentId: string;
  status: string;
  startedAt?: string;
  lawyerJoinedAt?: string;
  clientJoinedAt?: string;
  summaryJson?: string;
}

interface AppointmentInfo {
  id: string;
  scheduledAt: string;
  caseDescription: string;
  status: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

function ConsultationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useUI();

  // Detect role from URL query param "?role=lawyer" or "?role=client"
  const urlRole = searchParams.get("role");
  const [currentRole, setCurrentRole] = useState<"lawyer" | "client">("lawyer");

  // ── Real backend state ──────────────────────────────────────────
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [appointment, setAppointment] = useState<AppointmentInfo | null>(null);
  const [participants, setParticipants] = useState<{ lawyer: Participant | null; client: Participant | null }>({
    lawyer: null,
    client: null,
  });
  const [isLoadingRoom, setIsLoadingRoom] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [remoteTyping, setRemoteTyping] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Audio/Video control states (local)
  const [localMuted, setLocalMuted] = useState(false);
  const [localCamOff, setLocalCamOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // Right sidebar toggle states
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"chat" | "participants" | "documents">("chat");

  // Session timer
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Chat messages (real, from backend)
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessageText, setNewMessageText] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Document state
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extract appointment ID from search params
  const appointmentId = searchParams.get("appointmentId");

  // Derived display names
  const lawyerName = participants.lawyer?.name || "Advocate";
  const clientName = participants.client?.name || "Client";
  const remoteName = currentRole === "lawyer" ? clientName : lawyerName;
  const selfName = currentRole === "lawyer" ? lawyerName : clientName;

  // Format timer as MM:SS
  const timerString = `${String(Math.floor(sessionSeconds / 60)).padStart(2, "0")}:${String(sessionSeconds % 60).padStart(2, "0")}`;

  // ── Start session timer once room is active ──────────────────────
  useEffect(() => {
    if (roomInfo?.status === "active") {
      timerRef.current = setInterval(() => {
        setSessionSeconds((s) => s + 1);
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [roomInfo?.status]);

  // ── Join room & init Socket.io ───────────────────────────────────
  useEffect(() => {
    if (urlRole === "client" || urlRole === "lawyer") {
      setCurrentRole(urlRole);
    }
  }, [urlRole]);

  const joinRoom = useCallback(async () => {
    if (!user || !appointmentId) return;
    setIsLoadingRoom(true);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch(`${BACKEND_URL}/api/consultations/${appointmentId}/join`, {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRoomInfo(data.room);
        setParticipants(data.participants);
        setCurrentRole(data.myRole);
        setAppointment(data.room?.appointment ?? null);
      } else {
        console.warn("Room join returned non-OK:", res.status);
      }
    } catch (err) {
      console.error("Error joining room:", err);
    } finally {
      setIsLoadingRoom(false);
    }
  }, [user, appointmentId]);

  // Load historical messages
  const fetchMessages = useCallback(async () => {
    if (!user || !appointmentId) return;
    try {
      const idToken = await user.getIdToken();
      const res = await fetch(`${BACKEND_URL}/api/consultations/${appointmentId}/messages`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  }, [user, appointmentId]);

  // Init on mount
  useEffect(() => {
    if (user && appointmentId) {
      joinRoom();
      fetchMessages();
    }
  }, [user, appointmentId, joinRoom, fetchMessages]);

  // ── Socket.io connection ─────────────────────────────────────────
  useEffect(() => {
    if (!user || !appointmentId) return;
    let socket: Socket;

    const initSocket = async () => {
      const idToken = await user.getIdToken();
      socket = io(BACKEND_URL, {
        auth: { token: idToken },
        transports: ["websocket", "polling"],
      });

      socketRef.current = socket;

      socket.on("connect", () => {
        setSocketConnected(true);
        socket.emit("join_consultation", { appointmentId });
      });

      socket.on("disconnect", () => setSocketConnected(false));

      socket.on("new_message", (msg: ChatMessage) => {
        setMessages((prev) => {
          // If exact ID already exists, ignore
          if (prev.some((m) => m.id === msg.id)) return prev;

          // Replace an optimistic copy from the same sender with the same text
          const optimisticIdx = prev.findIndex(
            (m) =>
              m.id.startsWith("optimistic-") &&
              m.senderRole === msg.senderRole &&
              m.text === msg.text
          );
          if (optimisticIdx !== -1) {
            const updated = [...prev];
            updated[optimisticIdx] = msg;
            return updated;
          }

          // Otherwise it's a message from the other participant — append it
          return [...prev, msg];
        });
      });


      socket.on("participant_typing", ({ isTyping: typing }: { isTyping: boolean }) => {
        setRemoteTyping(typing);
      });

      socket.on("participant_joined", ({ name, role }: { name: string; role: string }) => {
        showToast(`${name} has joined the consultation`, "success");
      });

      socket.on("error", ({ message }: { message: string }) => {
        console.error("[Socket error]", message);
        // Show user-friendly toast for known errors
        if (message === "Appointment not found") {
          showToast("Could not find this appointment. Make sure you joined via a valid consultation link.", "error");
        } else if (message === "Access denied") {
          showToast("You are not a participant in this consultation.", "error");
        }
      });
    };

    initSocket();

    return () => {
      socket?.disconnect();
      socketRef.current = null;
    };
  }, [user, appointmentId]);

  // Format file size helper
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Fetch case files from backend
  const fetchCaseFiles = async () => {
    if (!user) return;
    setIsLoadingDocs(true);
    try {
      const idToken = await user.getIdToken();
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      let url = `${backendUrl}/api/case-files`;
      if (appointmentId) {
        url += `?appointmentId=${appointmentId}`;
      }
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${idToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      } else {
        console.error("Failed to fetch case files");
      }
    } catch (err) {
      console.error("Error fetching case files:", err);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  // Run fetch on mount & when user / appointment ID changes
  useEffect(() => {
    if (user) {
      fetchCaseFiles();
    }
  }, [user, appointmentId]);

  // Handle case file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Limit file size to 10MB
    if (file.size > 10 * 1024 * 1024) {
      showToast("File size exceeds the 10MB limit.", "error");
      return;
    }

    setIsUploading(true);
    showToast(`Uploading ${file.name}...`, "warning");

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64String = (reader.result as string).split(",")[1];
          const idToken = await user.getIdToken();
          const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

          const response = await fetch(`${backendUrl}/api/case-files`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${idToken}`
            },
            body: JSON.stringify({
              name: file.name,
              fileContent: base64String,
              fileType: file.type,
              fileSize: file.size,
              appointmentId: appointmentId || undefined
            })
          });

          if (response.ok) {
            showToast(`Uploaded file: ${file.name}`, "success");
            fetchCaseFiles(); // Refresh list

            // Inject notification message in chat
            setMessages(prev => [...prev, {
              id: Math.random().toString(36).substr(2, 9),
              senderRole: currentRole,
              text: `📎 Shared a document: ${file.name} (${formatFileSize(file.size)})`,
              createdAt: new Date().toISOString(),
            }]);
          } else {
            const errorData = await response.json();
            showToast(errorData.message || "Failed to upload file.", "error");
          }
        } catch (err) {
          console.error("Error sending upload request:", err);
          showToast("Upload failed.", "error");
        } finally {
          setIsUploading(false);
          // Reset file input value
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("FileReader error:", err);
      showToast("Failed to read file.", "error");
      setIsUploading(false);
    }
  };

  // Handle case file delete
  const handleDeleteFile = async (fileId: string) => {
    if (!user) {
      showToast("You must be logged in to delete files.", "error");
      return;
    }
    if (!confirm("Are you sure you want to delete this case file?")) return;
    try {
      const idToken = await user.getIdToken();
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const res = await fetch(`${backendUrl}/api/case-files/${fileId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${idToken}` }
      });
      if (res.ok) {
        showToast("File deleted successfully", "success");
        fetchCaseFiles(); // Refresh list
      } else {
        const errorData = await res.json();
        showToast(errorData.message || "Failed to delete file", "error");
      }
    } catch (err) {
      console.error("Error deleting file:", err);
      showToast("Delete failed", "error");
    }
  };

  // Trigger file dialog
  const handleAttachFile = () => {
    fileInputRef.current?.click();
  };

  // Lawyer notes state
  const [lawyerNotes, setLawyerNotes] = useState(
    "Client Sarah Chen is agreeable to Property Partition of 60/40.\nKey concerns raised:\n1. Timeline of transfer (needs to be within 60 days of court final order).\n2. Taxes applicable on capital gains.\nAction required:\n- Draft amendment to Clause 4.2.\n- Schedule follow-up mediation session for Tuesday."
  );

  // AI Summary generator states
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [generatedSummary, setGeneratedSummary] = useState<any>(null);

  // Simulation controls (for demonstrating interactive states)
  const [remoteMuted, setRemoteMuted] = useState(false);
  const [remoteCamOff, setRemoteCamOff] = useState(false);
  const [speakingParty, setSpeakingParty] = useState<"lawyer" | "client" | "none">("client");
  const [connectionQuality, setConnectionQuality] = useState<"excellent" | "good" | "poor">("excellent");
  const [isCallEnding, setIsCallEnding] = useState(false);

  // Scroll to bottom of chat when new message arrives
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeTab]);

  // ── Send message via Socket.io ───────────────────────────────────
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = newMessageText.trim();
    if (!text) return;

    // Optimistically add the message to local state immediately
    // so it appears in the UI without waiting for a server round-trip
    const optimisticMsg: ChatMessage = {
      id: `optimistic-${Date.now()}`,
      senderRole: currentRole,
      text,
      createdAt: new Date().toISOString(),
      sender: { id: "me", name: selfName },
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    setNewMessageText("");

    // Clear typing indicator
    if (socketRef.current && appointmentId) {
      socketRef.current.emit("typing", { appointmentId, isTyping: false });
    }

    // If no appointmentId, we're in demo mode — message is already shown locally
    if (!appointmentId) return;

    if (socketRef.current && socketConnected) {
      // Send via Socket.io — server will broadcast `new_message` back which
      // we deduplicate by checking id, so the optimistic copy stays visible
      socketRef.current.emit("send_message", { appointmentId, text });
    } else {
      // Fallback to REST if socket is not connected
      (async () => {
        try {
          const idToken = await user!.getIdToken();
          const res = await fetch(`${BACKEND_URL}/api/consultations/${appointmentId}/messages`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
            body: JSON.stringify({ text }),
          });
          if (res.ok) {
            const saved: ChatMessage = await res.json();
            // Replace the optimistic message with the real persisted one
            setMessages((prev) =>
              prev.map((m) => (m.id === optimisticMsg.id ? saved : m))
            );
          }
        } catch (err) {
          console.error("REST fallback message failed:", err);
        }
      })();
    }
  };


  // ── Typing indicator ─────────────────────────────────────────────
  const handleTyping = (val: string) => {
    setNewMessageText(val);
    if (!socketRef.current || !appointmentId) return;
    socketRef.current.emit("typing", { appointmentId, isTyping: true });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit("typing", { appointmentId, isTyping: false });
    }, 2000);
  };

  // ── AI Summary via real Gemini API ───────────────────────────────
  const handleGenerateSummary = async () => {
    if (!user || !appointmentId) return;
    setIsGeneratingSummary(true);
    setGeneratedSummary(null);
    showToast("Generating consultation summary with AI...", "warning");
    try {
      const idToken = await user.getIdToken();
      const res = await fetch(`${BACKEND_URL}/api/consultations/${appointmentId}/summary`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ lawyerNotes }),
      });
      if (res.ok) {
        const data = await res.json();
        setGeneratedSummary(data);
        showToast("Consultation summary generated successfully!", "success");
      } else {
        const err = await res.json();
        showToast(err.message || "Failed to generate summary", "error");
      }
    } catch (err) {
      console.error("Summary error:", err);
      showToast("Failed to generate summary", "error");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  // ── End consultation ─────────────────────────────────────────────
  const handleEndCall = async () => {
    setIsCallEnding(true);
    showToast("Disconnecting from secure room...", "warning");
    // Notify backend
    if (user && appointmentId) {
      try {
        const idToken = await user.getIdToken();
        await fetch(`${BACKEND_URL}/api/consultations/${appointmentId}/leave`, {
          method: "POST",
          headers: { Authorization: `Bearer ${idToken}` },
        });
      } catch (err) {
        console.error("Leave room error:", err);
      }
    }
    socketRef.current?.disconnect();
    showToast("Consultation ended. Redirecting to dashboard...", "success");
    setTimeout(() => {
      router.push(currentRole === "lawyer" ? "/lawyer-dashboard" : "/dashboard");
    }, 1200);
  };

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC] font-sans overflow-hidden text-gray-900">
      
      {/* ────────────────── navbar wrapper ────────────────── */}
      {currentRole === "client" ? (
        // Client Navbar (fixed, takes 72px)
        <div className="h-[72px] flex-shrink-0 relative z-30">
          <ClientNavbar />
        </div>
      ) : (
        // Standard Lawyer Navbar — matches lawyer-dashboard layout exactly
        <LawyerConsultationHeader
          user={user}
          lawyerName={lawyerName}
          lawyerProfilePic={participants.lawyer ? undefined : undefined}
          socketConnected={socketConnected}
        />
      )}

      {/* ────────────────── main body area ────────────────── */}
      <div className="flex flex-1 overflow-hidden relative">
        

        {/* Video meeting content area */}

        <div className="flex-1 flex flex-col overflow-y-auto min-w-0 p-4 lg:p-6 space-y-6">
          
          {/* Header Dashboard section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Family Law</span>
                <span className="text-xs font-bold text-gray-400">#JP-9821</span>
                <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  E2E Encrypted
                </div>
              </div>
              <h2 className="text-lg font-bold text-gray-900 mt-1.5 flex items-center gap-2">
                {appointment?.caseDescription
                  ? appointment.caseDescription.slice(0, 60) + (appointment.caseDescription.length > 60 ? "..." : "")
                  : "Legal Consultation"}
                <span className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 text-[#1B3A6B] text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
                  <CircleDot className="w-2.5 h-2.5 text-blue-600 animate-pulse" />
                  {roomInfo?.status === "active" ? "Live Meeting" : roomInfo?.status === "ended" ? "Session Ended" : "Waiting"}
                </span>
              </h2>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-[#F3F4F6] px-3.5 py-2 rounded-xl border border-gray-100">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="font-mono text-sm font-bold text-gray-700">{timerString}</span>
              </div>
              
              <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-xs font-bold shadow-sm">
                <Shield className="w-4 h-4 text-emerald-600" />
                Secure Connection
              </div>
            </div>
          </div>

          {/* Main workspace panels */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1 min-h-[450px]">
            
            {/* Center column: Video panels */}
            <div className="xl:col-span-2 flex flex-col space-y-4">
              
              {/* Primary Video Container */}
              <div className="relative bg-gray-950 rounded-3xl overflow-hidden flex-1 min-h-[380px] shadow-lg border border-gray-800 flex items-center justify-center">
                
                {/* Connection quality status indicator (top left) */}
                <div className="absolute top-4 left-4 z-20 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${
                    connectionQuality === "excellent" ? "bg-emerald-500" :
                    connectionQuality === "good" ? "bg-yellow-500" : "bg-red-500 animate-pulse"
                  }`}></span>
                  <span className="text-[10px] font-bold uppercase text-white tracking-wider">
                    {connectionQuality === "excellent" ? "Connection: Excellent" :
                     connectionQuality === "good" ? "Connection: Good" : "Connection: Poor"}
                  </span>
                </div>

                {/* Secure Badge (top right) */}
                <div className="absolute top-4 right-4 z-20 bg-emerald-600/90 backdrop-blur-sm px-3 py-1 rounded-full text-white text-[10px] font-bold flex items-center gap-1.5 shadow-sm border border-emerald-500/30">
                  <Shield className="w-3.5 h-3.5" />
                  E2EE Secure
                </div>

                {/* Primary Remote Video Stream or Avatar Placeholder */}
                {remoteCamOff ? (
                  <div className="flex flex-col items-center justify-center text-center p-6 space-y-4">
                    <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center border-2 border-gray-700 shadow-inner text-white font-extrabold text-2xl">
                      {remoteName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-gray-200 text-sm">{remoteName}</p>
                      <p className="text-xs text-gray-500">Camera is turned off</p>
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 w-full h-full relative">
                    <Image 
                      src={
                        currentRole === "lawyer"
                          ? "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=800&h=600" // Client
                          : "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800&h=600" // Lawyer
                      }
                      alt="Remote Caller"
                      fill
                      priority
                      className="object-cover"
                    />

                    {/* Active Speaker Ring / Indicator */}
                    {speakingParty === (currentRole === "lawyer" ? "client" : "lawyer") && (
                      <div className="absolute inset-0 border-4 border-emerald-500 rounded-3xl pointer-events-none animate-pulse z-10"></div>
                    )}
                  </div>
                )}

                {/* Remote Muted Overlay Indicator */}
                {remoteMuted && (
                  <div className="absolute bottom-4 left-4 z-20 bg-red-600/90 backdrop-blur-sm text-white p-2 rounded-full shadow border border-red-500/30">
                    <MicOff className="w-4 h-4" />
                  </div>
                )}

                {/* Remote Participant Label (bottom-left) */}
                <div className="absolute bottom-4 left-4 z-10 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2">
                  <p className="text-xs font-bold text-white">{remoteName}</p>
                  <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded tracking-wide ${
                    currentRole === "lawyer" 
                      ? "bg-green-500/20 text-green-300 border border-green-500/30" 
                      : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                  }`}>
                    {currentRole === "lawyer" ? "Client" : "Lawyer"}
                  </span>

                  {speakingParty === (currentRole === "lawyer" ? "client" : "lawyer") && (
                    <span className="flex items-center gap-0.5 ml-1 bg-emerald-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase animate-pulse">
                      <Volume2 className="w-3 h-3" />
                      Speaking
                    </span>
                  )}
                </div>

                {/* ────────────────── Floating Self Video Container ────────────────── */}
                <div className="absolute bottom-4 right-4 z-20 w-36 h-48 sm:w-44 sm:h-56 bg-gray-900 rounded-2xl overflow-hidden border border-white/20 shadow-2xl flex items-center justify-center">
                  {localCamOff ? (
                    <div className="flex flex-col items-center justify-center text-center p-3 space-y-2">
                      <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700 text-white font-bold text-base">
                        {currentRole === "lawyer" ? "SJ" : "SC"}
                      </div>
                      <p className="font-semibold text-[10px] text-gray-300">You (Muted)</p>
                    </div>
                  ) : (
                    <div className="absolute inset-0 w-full h-full relative">
                      <Image 
                        src={
                          currentRole === "lawyer"
                            ? "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250&h=350" // Lawyer self
                            : "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=250&h=350" // Client self
                        }
                        alt="Local Self Preview"
                        fill
                        className="object-cover"
                      />

                      {/* Active Speaker Ring / Indicator */}
                      {speakingParty === currentRole && (
                        <div className="absolute inset-0 border-2 border-emerald-500 rounded-2xl pointer-events-none animate-pulse z-10"></div>
                      )}
                    </div>
                  )}

                  {/* Local Muted Overlay Indicator */}
                  {localMuted && (
                    <div className="absolute bottom-2 left-2 z-20 bg-red-600/90 backdrop-blur-sm text-white p-1 rounded-full shadow border border-red-500/20">
                      <MicOff className="w-3 h-3" />
                    </div>
                  )}

                  <div className="absolute bottom-2 right-2 z-10 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/10 text-[9px] font-bold text-white">
                    You
                  </div>
                </div>

              </div>

              {/* Bottom Meeting Control Bar */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex justify-between items-center gap-4">
                
                {/* Left panel: Info status */}
                <div className="hidden sm:flex items-center gap-3">
                  <div className="flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-100 rounded-xl px-3 py-1.5 text-xs font-bold animate-pulse">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500"></span>
                    REC 00:15:32
                  </div>
                  <span className="text-xs text-gray-400 font-medium">Session Encrypted</span>
                </div>

                {/* Center panel: Control buttons */}
                <div className="flex items-center gap-2 mx-auto sm:mx-0">
                  {/* Audio Mute toggle */}
                  <button 
                    onClick={() => {
                      setLocalMuted(!localMuted);
                      showToast(localMuted ? "Microphone active" : "Microphone muted", "warning");
                    }}
                    className={`p-3 rounded-xl border transition-all ${
                      localMuted 
                        ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100" 
                        : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                    title={localMuted ? "Unmute microphone" : "Mute microphone"}
                  >
                    {localMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>

                  {/* Video Camera toggle */}
                  <button 
                    onClick={() => {
                      setLocalCamOff(!localCamOff);
                      showToast(localCamOff ? "Camera turned on" : "Camera turned off", "warning");
                    }}
                    className={`p-3 rounded-xl border transition-all ${
                      localCamOff 
                        ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100" 
                        : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                    title={localCamOff ? "Turn camera on" : "Turn camera off"}
                  >
                    {localCamOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                  </button>

                  {/* Screen Share toggle */}
                  <button 
                    onClick={() => {
                      setIsScreenSharing(!isScreenSharing);
                      showToast(isScreenSharing ? "Screen sharing stopped" : "Screen sharing started", "success");
                    }}
                    className={`p-3 rounded-xl border transition-all ${
                      isScreenSharing 
                        ? "bg-[#EBF1F9] border-blue-200 text-[#1B3A6B] hover:bg-blue-100" 
                        : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                    title={isScreenSharing ? "Stop sharing screen" : "Share screen"}
                  >
                    <Monitor className="w-5 h-5" />
                  </button>

                  {/* Settings popup simulation button */}
                  <button 
                    onClick={() => showToast("Devices settings: Default speakers, Camera selected", "success")}
                    className="p-3 rounded-xl border bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                    title="Audio & Video Settings"
                  >
                    <Settings className="w-5 h-5" />
                  </button>

                  {/* Spacer */}
                  <div className="w-px h-8 bg-gray-200 mx-1"></div>

                  {/* End Consultation Call (Red button) */}
                  <button 
                    onClick={handleEndCall}
                    disabled={isCallEnding}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-md active:scale-95 disabled:bg-red-400"
                  >
                    {isCallEnding ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <PhoneOff className="w-4 h-4" />
                    )}
                    <span className="hidden md:inline">End Call</span>
                  </button>
                </div>

                {/* Right panel: Sidebar togglers */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      if (rightSidebarOpen && activeTab === "chat") {
                        setRightSidebarOpen(false);
                      } else {
                        setRightSidebarOpen(true);
                        setActiveTab("chat");
                      }
                    }}
                    className={`p-3 rounded-xl border transition-all ${
                      rightSidebarOpen && activeTab === "chat"
                        ? "bg-[#EBF1F9] border-blue-200 text-[#1B3A6B]" 
                        : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                    title="Toggle Chat"
                  >
                    <MessageSquare className="w-5 h-5" />
                  </button>

                  <button 
                    onClick={() => {
                      if (rightSidebarOpen && activeTab === "participants") {
                        setRightSidebarOpen(false);
                      } else {
                        setRightSidebarOpen(true);
                        setActiveTab("participants");
                      }
                    }}
                    className={`p-3 rounded-xl border transition-all ${
                      rightSidebarOpen && activeTab === "participants"
                        ? "bg-[#EBF1F9] border-blue-200 text-[#1B3A6B]" 
                        : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                    title="Toggle Participants"
                  >
                    <Users className="w-5 h-5" />
                  </button>
                </div>

              </div>

              {/* Lawyer-Specific Live Notes Panel */}
              {currentRole === "lawyer" && (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-[#1B3A6B]" />
                      <h3 className="font-bold text-gray-900 text-base">Real-time Legal Consultation Notes</h3>
                    </div>
                    <span className="text-[10px] bg-blue-50 text-[#1B3A6B] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">Lawyer Workspace</span>
                  </div>
                  
                  <div className="space-y-3">
                    <textarea 
                      value={lawyerNotes}
                      onChange={(e) => setLawyerNotes(e.target.value)}
                      placeholder="Type consultation notes here..."
                      className="w-full min-h-[120px] bg-[#F9FAFC] border border-gray-200 rounded-xl p-4 text-sm focus:outline-none focus:border-blue-200 focus:bg-white text-gray-700 leading-relaxed font-mono"
                    />
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <p className="text-xs text-gray-400">Notes automatically save to case folder.</p>
                      
                      <button 
                        onClick={handleGenerateSummary}
                        disabled={isGeneratingSummary}
                        className="flex items-center gap-2 bg-[#F97316] hover:bg-[#ea6b0a] text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-sm disabled:bg-orange-300"
                      >
                        {isGeneratingSummary ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Analyzing Consultation...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            Generate Consultation Summary
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Summary Render Result */}
                  {generatedSummary && (
                    <div className="border border-orange-100 bg-orange-50/30 rounded-2xl p-5 mt-4 space-y-4 animate-fade-in">
                      <div className="flex items-center justify-between border-b border-orange-100 pb-3">
                        <div className="flex items-center gap-2 text-[#F97316]">
                          <Sparkles className="w-5 h-5" />
                          <h4 className="font-extrabold text-sm uppercase tracking-wider">{generatedSummary.title}</h4>
                        </div>
                        <button 
                          onClick={() => setGeneratedSummary(null)}
                          className="text-gray-400 hover:text-gray-600 rounded-full hover:bg-black/5 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div>
                          <p className="text-gray-400 font-bold uppercase">Date & Session</p>
                          <p className="font-bold text-gray-700 mt-0.5">{generatedSummary.date}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 font-bold uppercase">Participants</p>
                          <p className="font-bold text-gray-700 mt-0.5">{generatedSummary.participants}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-gray-400 font-bold uppercase mb-1">Executive Summary</p>
                          <p className="text-sm text-gray-600 leading-relaxed bg-white rounded-xl border border-gray-100 p-3 shadow-inner">
                            {generatedSummary.summary}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-400 font-bold uppercase mb-1">Key Outcomes & Agreements</p>
                          <ul className="list-disc pl-5 space-y-1 text-xs text-gray-600">
                            {generatedSummary.keyOutcomes.map((o: string, idx: number) => (
                              <li key={idx}><span className="font-semibold text-gray-700">{o}</span></li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <p className="text-xs text-gray-400 font-bold uppercase mb-1">Next Steps & Responsibilities</p>
                          <ul className="list-decimal pl-5 space-y-1 text-xs text-gray-600 font-semibold">
                            {generatedSummary.nextSteps.map((s: string, idx: number) => (
                              <li key={idx} className="text-blue-900">{s}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-2">
                        <button 
                          onClick={() => {
                            showToast("Summary copied to clipboard", "success");
                          }}
                          className="px-4 py-2 border border-gray-200 bg-white rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          Copy Content
                        </button>
                        <button 
                          onClick={() => {
                            showToast("Consultation summary saved to Case #JP-9821 files", "success");
                          }}
                          className="flex items-center gap-1.5 bg-[#1B3A6B] hover:bg-[#112549] text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors shadow-sm"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Save and Attach to Case
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>

            {/* Right column: Collapsible Sidebar */}
            {rightSidebarOpen && (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden min-h-[400px]">
                
                {/* Tabs Header */}
                <div className="flex border-b border-gray-100 bg-gray-50/50 p-1 flex-shrink-0">
                  <button 
                    onClick={() => setActiveTab("chat")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl text-xs font-bold transition-colors ${
                      activeTab === "chat" 
                        ? "bg-white text-[#1B3A6B] shadow-sm border border-gray-100" 
                        : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Chat
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab("participants")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl text-xs font-bold transition-colors ${
                      activeTab === "participants" 
                        ? "bg-white text-[#1B3A6B] shadow-sm border border-gray-100" 
                        : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    People
                  </button>

                  <button 
                    onClick={() => setActiveTab("documents")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl text-xs font-bold transition-colors ${
                      activeTab === "documents" 
                        ? "bg-white text-[#1B3A6B] shadow-sm border border-gray-100" 
                        : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Files
                  </button>
                </div>

                {/* Tab content wrapper */}
                <div className="flex-1 overflow-y-auto p-4 min-h-[300px] flex flex-col justify-between">
                  
                  {activeTab === "chat" && (
                    <div className="flex flex-col h-full justify-between flex-1">
                      {/* Messages list */}
                      <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1 flex-1 mb-4">
                        {messages.length === 0 && (
                          <div className="text-center py-8 text-gray-400">
                            <p className="text-xs font-medium">No messages yet. Start the conversation!</p>
                          </div>
                        )}
                        {messages.map((msg) => {
                          const isSelf = msg.senderRole === currentRole;
                          const senderName = msg.senderRole === "lawyer"
                            ? `Adv. ${lawyerName}`
                            : clientName;
                          const timeStr = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                          return (
                            <div key={msg.id} className={`flex flex-col ${isSelf ? "items-end" : "items-start"}`}>
                              <span className="text-[9px] text-gray-400 font-bold mb-1 ml-1 mr-1">
                                {senderName}
                              </span>
                              <div className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                                isSelf 
                                  ? "bg-[#1B3A6B] text-white rounded-tr-none" 
                                  : "bg-gray-100 text-gray-800 rounded-tl-none"
                              }`}>
                                {msg.text}
                              </div>
                              <span className="text-[9px] text-gray-400 mt-1 ml-1 mr-1">{timeStr}</span>
                            </div>
                          );
                        })}
                        {remoteTyping && (
                          <div className="flex items-start">
                            <div className="bg-gray-100 text-gray-500 text-xs px-3 py-2 rounded-2xl rounded-tl-none flex items-center gap-1">
                              <span className="animate-bounce">·</span>
                              <span className="animate-bounce delay-100">·</span>
                              <span className="animate-bounce delay-200">·</span>
                            </div>
                          </div>
                        )}
                        <div ref={chatEndRef} />
                      </div>

                      {/* Chat input field */}
                      <form onSubmit={handleSendMessage} className="flex gap-2 bg-gray-50 border border-gray-200 rounded-xl p-1.5">
                        <button 
                          type="button"
                          onClick={handleAttachFile}
                          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-150 transition-colors"
                          title="Attach document or image"
                        >
                          <Paperclip className="w-4 h-4" />
                        </button>
                        
                        <input 
                          type="text"
                          value={newMessageText}
                          onChange={(e) => handleTyping(e.target.value)}
                          placeholder={`Message ${remoteName}...`}
                          className="flex-1 bg-transparent text-xs border-none outline-none text-gray-700 px-1 py-1"
                        />

                        <button 
                          type="submit"
                          className="bg-[#1B3A6B] hover:bg-[#112549] text-white p-2 rounded-lg transition-colors flex items-center justify-center shrink-0"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    </div>
                  )}

                  {activeTab === "participants" && (
                    <div className="space-y-4 flex-1">
                      <div className="flex items-center justify-between text-xs text-gray-400 font-bold uppercase tracking-wider pb-2 border-b border-gray-150">
                        <span>Participants (2)</span>
                        <span>Speaking Status</span>
                      </div>

                      {/* Participant: Lawyer */}
                      <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-xl transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-100 overflow-hidden relative border border-gray-200 shrink-0">
                            <Image 
                              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150&h=150" 
                              alt="Lawyer" 
                              fill 
                              className="object-cover" 
                            />
                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></div>
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-gray-900 leading-tight">{lawyerName}</h4>
                            <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Advocate • Organizer</p>
                          </div>
                        </div>

                        {speakingParty === "lawyer" ? (
                          <div className="flex gap-0.5">
                            <span className="h-3 w-0.5 bg-emerald-500 rounded animate-[pulse_0.6s_infinite]"></span>
                            <span className="h-4 w-0.5 bg-emerald-500 rounded animate-[pulse_0.8s_infinite]"></span>
                            <span className="h-2 w-0.5 bg-emerald-500 rounded animate-[pulse_0.5s_infinite]"></span>
                          </div>
                        ) : (
                          <span className="text-[9px] text-gray-400 font-bold uppercase">Mute</span>
                        )}
                      </div>

                      {/* Participant: Client */}
                      <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-xl transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-orange-100 overflow-hidden relative border border-gray-200 shrink-0">
                            <Image 
                              src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=150&h=150" 
                              alt="Client" 
                              fill 
                              className="object-cover" 
                            />
                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></div>
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-gray-900 leading-tight">{clientName}</h4>
                            <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Client</p>
                          </div>
                        </div>

                        {speakingParty === "client" ? (
                          <div className="flex gap-0.5">
                            <span className="h-3 w-0.5 bg-emerald-500 rounded animate-[pulse_0.6s_infinite]"></span>
                            <span className="h-4 w-0.5 bg-emerald-500 rounded animate-[pulse_0.8s_infinite]"></span>
                            <span className="h-2 w-0.5 bg-emerald-500 rounded animate-[pulse_0.5s_infinite]"></span>
                          </div>
                        ) : (
                          <span className="text-[9px] text-gray-400 font-bold uppercase">Mute</span>
                        )}
                      </div>

                      {/* Encryption notification */}
                      <div className="mt-8 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 text-center space-y-2">
                        <ShieldCheck className="w-6 h-6 text-emerald-600 mx-auto" />
                        <h5 className="text-xs font-bold text-emerald-800">Secure Consultation Line</h5>
                        <p className="text-[10px] text-emerald-600 leading-relaxed font-medium">
                          All audio, video, messages, and uploaded files are encrypted.
                        </p>
                      </div>

                    </div>
                  )}

                  {activeTab === "documents" && (
                    <div className="space-y-4 flex-1">
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        onChange={handleFileUpload} 
                        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" 
                      />
                      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Shared Files ({documents.length})</span>
                        <button 
                          onClick={handleAttachFile}
                          disabled={isUploading}
                          className="flex items-center gap-1 text-[10px] font-extrabold text-[#1B3A6B] bg-blue-50 border border-blue-100 px-2 py-1 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add File
                        </button>
                      </div>

                      {isUploading && (
                        <div className="bg-blue-50/50 border border-dashed border-blue-200 rounded-2xl p-3.5 flex gap-3 items-center">
                          <Loader2 className="w-4 h-4 animate-spin text-[#1B3A6B] shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-blue-900 leading-snug">Uploading file...</p>
                          </div>
                        </div>
                      )}

                      {/* Documents Card list */}
                      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                        {isLoadingDocs ? (
                          <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                            <Loader2 className="w-6 h-6 animate-spin text-[#1B3A6B] mb-2" />
                            <p className="text-xs font-medium">Loading documents...</p>
                          </div>
                        ) : documents.length === 0 ? (
                          <div className="text-center py-8 text-gray-400">
                            <p className="text-xs font-medium">No documents shared yet.</p>
                          </div>
                        ) : (
                          documents.map((doc) => (
                            <div 
                              key={doc.id}
                              className="bg-[#F9FAFC] border border-gray-200 rounded-2xl p-3.5 flex gap-3 items-start hover:border-blue-200 hover:bg-white transition-all cursor-pointer group"
                            >
                              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-bold text-gray-900 leading-snug truncate group-hover:text-blue-900 transition-colors" title={doc.name}>
                                  {doc.name}
                                </h4>
                                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                                  {formatFileSize(doc.fileSize)} • Uploaded by {doc.user?.name || doc.uploadedBy}
                                </p>
                              </div>
                              <div className="flex items-center gap-1 shrink-0 mt-0.5">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    showToast(`Opening ${doc.name}`, "success");
                                    window.open(doc.url, "_blank");
                                  }}
                                  className="text-gray-400 hover:text-blue-600 rounded-lg p-1 hover:bg-gray-100 transition-all"
                                  title="Download document"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                                {user && doc.user && doc.user.firebaseUid === user.uid && (
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteFile(doc.id);
                                    }}
                                    className="text-gray-400 hover:text-red-650 rounded-lg p-1 hover:bg-gray-100 transition-all"
                                    title="Delete document"
                                  >
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                    </div>
                  )}

                </div>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* ────────────────── Demonstration & Simulation panel ────────────────── */}
      <footer className="bg-slate-900 text-white border-t border-slate-800 p-4 relative z-40">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl text-white">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-100 uppercase tracking-widest">Interactive Simulation Hub</p>
              <p className="text-[10px] text-slate-400 font-semibold">Demo consultation behaviors. Toggle options to see how the JusticePal UI adapts.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            
            {/* Role simulation */}
            <div className="flex p-0.5 bg-slate-800 rounded-xl border border-slate-700">
              <button 
                onClick={() => {
                  setCurrentRole("lawyer");
                  showToast("Switched mockup layout to Lawyer view", "success");
                }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wide transition-colors ${currentRole === "lawyer" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"}`}
              >
                Lawyer UI
              </button>
              <button 
                onClick={() => {
                  setCurrentRole("client");
                  showToast("Switched mockup layout to Client view", "success");
                }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wide transition-colors ${currentRole === "client" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"}`}
              >
                Client UI
              </button>
            </div>

            {/* Speaking state simulation */}
            <select 
              value={speakingParty}
              onChange={(e) => {
                setSpeakingParty(e.target.value as any);
                showToast(`Simulation: Active speaker set to ${e.target.value}`, "success");
              }}
              className="bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-[10px] font-bold text-slate-200 focus:outline-none"
            >
              <option value="none">Speaker: Silent</option>
              <option value="client">Speaker: Client Speaking</option>
              <option value="lawyer">Speaker: Lawyer Speaking</option>
            </select>

            {/* Connection state simulation */}
            <select 
              value={connectionQuality}
              onChange={(e) => {
                setConnectionQuality(e.target.value as any);
                showToast(`Simulation: Connection set to ${e.target.value}`, "warning");
              }}
              className="bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-[10px] font-bold text-slate-200 focus:outline-none"
            >
              <option value="excellent">Excellent Line Quality</option>
              <option value="good">Good Line Quality</option>
              <option value="poor">Poor Line Quality</option>
            </select>

            {/* Remote cam simulation */}
            <button 
              onClick={() => {
                setRemoteCamOff(!remoteCamOff);
                showToast(remoteCamOff ? "Simulation: Remote camera ON" : "Simulation: Remote camera OFF", "warning");
              }}
              className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold transition-all ${
                remoteCamOff 
                  ? "bg-orange-600 border-orange-500 text-white" 
                  : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750"
              }`}
            >
              Remote Cam: {remoteCamOff ? "OFF" : "ON"}
            </button>

            {/* Remote mic simulation */}
            <button 
              onClick={() => {
                setRemoteMuted(!remoteMuted);
                showToast(remoteMuted ? "Simulation: Remote participant active" : "Simulation: Remote participant muted", "warning");
              }}
              className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold transition-all ${
                remoteMuted 
                  ? "bg-orange-600 border-orange-500 text-white" 
                  : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750"
              }`}
            >
              Remote Mic: {remoteMuted ? "MUTED" : "ACTIVE"}
            </button>

            {/* Inbound message simulator */}
            <button 
              onClick={() => {
                const receiverRole = currentRole === "lawyer" ? "client" : "lawyer";
                const texts = [
                  "Just sent over the amended land survey draft, please confirm if you see it.",
                  "Do we need to notarize these documents with a local attorney?",
                  "I am satisfied with these mediation terms.",
                  "Can you explain the capital gains tax implications again?"
                ];
                const text = texts[Math.floor(Math.random() * texts.length)];
                const msg: ChatMessage = {
                  id: Math.random().toString(36).substr(2, 9),
                  senderRole: receiverRole,
                  text,
                  createdAt: new Date().toISOString(),
                };
                setMessages(prev => [...prev, msg]);
                showToast(`Simulation: Message received from ${receiverRole === "lawyer" ? lawyerName : clientName}`, "success");
              }}
              className="px-3.5 py-1.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-bold shadow-sm transition-colors"
            >
              Simulate Inbound Message
            </button>

          </div>
        </div>
      </footer>

    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// LawyerConsultationHeader — identical to lawyer-dashboard layout.tsx header
// ──────────────────────────────────────────────────────────────────────────────
function LawyerConsultationHeader({
  user,
  lawyerName,
  lawyerProfilePic,
  socketConnected,
}: {
  user: { displayName?: string | null; email?: string | null } | null;
  lawyerName: string;
  lawyerProfilePic?: string;
  socketConnected: boolean;
}) {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = React.useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    const { signOut } = await import("firebase/auth");
    const { auth } = await import("../lib/firebase");
    await signOut(auth);
    router.push("/");
  };

  const navLinks = [
    { name: "Dashboard", href: "/lawyer-dashboard" },
    { name: "Calendar", href: "/lawyer-dashboard/calendar" },
    { name: "Active Cases", href: "/lawyer-dashboard/cases" },
    { name: "Messages", href: "/lawyer-dashboard/messages" },
    { name: "Settings", href: "/lawyer-dashboard/settings" },
  ];

  return (
    <header className="h-[72px] flex items-center justify-between z-30 flex-shrink-0 px-6 bg-white shadow-sm border-b border-gray-100 transition-all duration-300">

      {/* Left Side: Logo */}
      <div className="flex items-center h-full shrink-0">
        <Link href="/" className="hover:opacity-90 transition-opacity duration-200">
          <JusticePalLogo />
        </Link>
      </div>

      {/* Navigation Links - Centered */}
      <nav className="hidden lg:flex items-center justify-center flex-1 h-full mx-4 space-x-1">
        {navLinks.map((item, idx) => {
          const isConsultation = item.href === "/lawyer-dashboard";
          return (
            <Link
              key={idx}
              href={item.href}
              className={`flex items-center px-4 h-full text-sm font-medium transition-colors border-b-2 ${
                isConsultation
                  ? "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                  : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {item.name}
            </Link>
          );
        })}
        {/* Active Video Session indicator in nav */}
        <span className="flex items-center gap-1.5 px-3 h-full border-b-2 border-[#1B3A6B] text-[#1B3A6B] bg-blue-50/50 text-sm font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
          Video Session
        </span>
      </nav>

      {/* Right Actions */}
      <div className="flex items-center gap-4 shrink-0">

        {/* Socket status pill */}
        <div className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
          socketConnected
            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
            : "bg-gray-50 text-gray-500 border-gray-200"
        }`}>
          <Wifi className={`w-3 h-3 ${socketConnected ? "text-emerald-600" : "text-gray-400"}`} />
          {socketConnected ? "Live" : "Connecting..."}
        </div>

        {/* Search Bar */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#f1f5f9] border border-gray-200">
          <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search case files, appointments..."
            className="bg-transparent outline-none text-[13px] w-48 text-slate-900 placeholder:text-slate-400"
          />
        </div>

        {/* Notification Bell */}
        <button className="relative p-2 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors">
          <svg className="w-[20px] h-[20px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white" />
        </button>

        {/* Profile Dropdown */}
        <div className="relative ml-2">
          <button
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <div className="text-right leading-tight hidden sm:block">
              <p className="text-[13px] font-semibold text-slate-800">Counselor {lawyerName}</p>
              <p className="text-[10px] font-bold tracking-wider text-[#3b82f6]">HIGH COURT ADVOCATE</p>
            </div>
            <div className="flex items-center gap-1">
              <div
                className="w-9 h-9 rounded-full overflow-hidden relative flex-shrink-0 flex items-center justify-center text-xs font-bold text-white"
                style={{ background: "linear-gradient(135deg, #3b82f6 0%, #1e3a8a 100%)" }}
              >
                {lawyerProfilePic ? (
                  <Image src={lawyerProfilePic} alt={lawyerName} fill className="object-cover" />
                ) : (
                  lawyerName.charAt(0)
                )}
              </div>
              <svg
                className={`w-3.5 h-3.5 text-slate-400 hidden sm:block transition-transform ${isProfileDropdownOpen ? "rotate-180" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          {isProfileDropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsProfileDropdownOpen(false)} />
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50 text-slate-800">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-bold text-gray-900">{user?.displayName || lawyerName}</p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{user?.email}</p>
                </div>
                <div className="p-2">
                  <Link
                    href="/lawyer-dashboard/settings"
                    onClick={() => setIsProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-1"
                  >
                    <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default function ConsultationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <svg className="animate-spin h-10 w-10 text-[#1B3A6B]" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      </div>
    }>
      <ConsultationContent />
    </Suspense>
  );
}
