"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { io, Socket } from "socket.io-client";
import ClientNavbar from "../../../components/ClientNavbar";
import { useAuth } from "../../../context/AuthContext";
import { useLanguage } from "../../../context/LanguageContext";
import {
  Video, Phone, MoreVertical, Send, Paperclip, Smile,
  FileText, Download, User, Scale, Calendar, Briefcase, Shield, ArrowLeft,
  Loader2, MessageSquare, Inbox as InboxIcon
} from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://justice-pal-cjhn.vercel.app";

/* ───────────────────── translations ───────────────────── */
const translations = {
  en: {
    activeChats: "My Attorneys",
    typePlaceholder: "Type your message here...",
    caseDetails: "CASE DETAILS",
    caseId: "CASE ID",
    caseType: "SPECIALTY",
    nextMilestone: "NEXT MILESTONE",
    sharedAssets: "SHARED DOCUMENTS",
    viewAll: "View All",
    statusOnline: "ONLINE",
    statusOffline: "OFFLINE",
    activeCase: "ACTIVE CASE",
    backBtn: "Back to Dashboard",
    noConversations: "No conversations yet",
    noConversationsSub: "Book an appointment with a lawyer to start a conversation.",
    selectConversation: "Select a conversation",
    selectConversationSub: "Choose an attorney from the left to view your messages.",
    loading: "Loading conversations...",
    noMessages: "No messages yet. Send a message to start the conversation!",
  },
  si: {
    activeChats: "මගේ නීතිඥයින්",
    typePlaceholder: "ඔබේ පණිවිඩය මෙහි ටයිප් කරන්න...",
    caseDetails: "නඩුවේ විස්තර",
    caseId: "නඩු අංකය",
    caseType: "විශේෂීකරණය",
    nextMilestone: "මීළඟ සන්ධිස්ථානය",
    sharedAssets: "බෙදාගත් ලිපිගොනු",
    viewAll: "සියල්ල බලන්න",
    statusOnline: "සක්‍රීයයි",
    statusOffline: "නොබැඳි",
    activeCase: "ක්‍රියාකාරී නඩුව",
    backBtn: "නැවත උපකරණ පුවරුවට",
    noConversations: "තවම සංවාද නොමැත",
    noConversationsSub: "සංවාදයක් ආරම්භ කිරීමට නීතිඥයෙකු සමඟ හමුවීමක් වෙන්කරන්න.",
    selectConversation: "සංවාදයක් තෝරන්න",
    selectConversationSub: "ඔබේ පණිවුඩ බැලීමට වම් පසින් නීතිඥයෙකු තෝරන්න.",
    loading: "සංවාද පූරණය වෙමින්...",
    noMessages: "තවම පණිවුඩ නැත. සංවාදය ආරම්භ කිරීමට පණිවුඩයක් යවන්න!",
  }
};

/* ───────────────────── types ───────────────────── */
interface ConversationUser {
  id: string;
  name: string;
  email: string;
  role: string;
  lawyerProfile?: {
    specialization: string[];
    profilePicture: string | null;
    isVerified: boolean;
  } | null;
}

interface LastMessage {
  id: string;
  text: string;
  senderId: string;
  read: boolean;
  createdAt: string;
}

interface Conversation {
  id: string;
  appointmentId: string | null;
  otherUser: ConversationUser;
  lastMessage: LastMessage | null;
  lastMessageAt: string;
  hasUnread: boolean;
  createdAt: string;
}

interface DirectMessage {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  read: boolean;
  createdAt: string;
  sender: {
    id: string;
    name: string;
  };
}

/* ───────────────────── helpers ───────────────────── */
const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-purple-100 text-purple-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
];

function getAvatarColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: "long" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function ClientInboxPage() {
  const { user, loading: authLoading } = useAuth();
  const [roleLoading, setRoleLoading] = useState(true);
  const { lang } = useLanguage();
  const tx = translations[lang as keyof typeof translations] || translations.en;
  const router = useRouter();

  // --- Conversation list state ---
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [convoLoading, setConvoLoading] = useState(true);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  // --- Messages state ---
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- Socket.io refs ---
  const socketRef = useRef<Socket | null>(null);
  const activeChatIdRef = useRef<string | null>(null);

  // Keep ref in sync with state so socket callbacks see latest value
  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  // --- Auth & role check ---
  useEffect(() => {
    if (authLoading) return;

    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!user || !isLoggedIn) {
      localStorage.removeItem("isLoggedIn");
      router.replace("/login");
      return;
    }

    const verifyClientRole = async () => {
      try {
        const idToken = await user.getIdToken();
        const res = await fetch(
          `${BACKEND_URL}/api/users/profile`,
          {
            headers: { Authorization: `Bearer ${idToken}` },
          }
        );
        if (res.ok) {
          const data = await res.json();
          if (data.role === "client") {
            setRoleLoading(false);
          } else if (data.role === "lawyer") {
            router.replace("/lawyer-dashboard");
          } else if (data.role === "admin") {
            router.replace("/admin");
          } else {
            router.replace("/login");
          }
        } else {
          router.replace("/login");
        }
      } catch (err) {
        console.error("Failed to verify client role", err);
        router.replace("/login");
      }
    };

    verifyClientRole();
  }, [user, authLoading, router]);

  // --- Fetch conversations ---
  const fetchConversations = useCallback(async () => {
    if (!user) return;
    try {
      const idToken = await user.getIdToken();
      const res = await fetch(`${BACKEND_URL}/api/inbox/conversations`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (res.ok) {
        const data: Conversation[] = await res.json();
        setConversations(data);
      }
    } catch (err) {
      console.error("Failed to fetch conversations", err);
    } finally {
      setConvoLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!roleLoading && user) {
      fetchConversations();
    }
  }, [roleLoading, user, fetchConversations]);

  // --- Fetch messages for active conversation ---
  const fetchMessages = useCallback(async (conversationId: string) => {
    if (!user) return;
    setMessagesLoading(true);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch(
        `${BACKEND_URL}/api/inbox/conversations/${conversationId}/messages`,
        {
          headers: { Authorization: `Bearer ${idToken}` },
        }
      );
      if (res.ok) {
        const data: DirectMessage[] = await res.json();
        setMessages(data);
        // Mark conversation as read in local state
        setConversations((prev) =>
          prev.map((c) => (c.id === conversationId ? { ...c, hasUnread: false } : c))
        );
      }
    } catch (err) {
      console.error("Failed to fetch messages", err);
    } finally {
      setMessagesLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (activeChatId) {
      fetchMessages(activeChatId);
    }
  }, [activeChatId, fetchMessages]);

  // --- Scroll to bottom on new messages ---
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- Socket.io connection & real-time listener ---
  useEffect(() => {
    if (!user || roleLoading) return;
    let socket: Socket;

    const initSocket = async () => {
      const idToken = await user.getIdToken();
      socket = io(BACKEND_URL, {
        auth: { token: idToken },
        transports: ["websocket", "polling"],
      });

      socketRef.current = socket;

      socket.on("connect", () => {
        console.log("[Inbox] Socket connected");
        // Join the user's private inbox room
        socket.emit("join_inbox");
      });

      // Listen for incoming direct messages in real time
      socket.on("receive_direct_message", (payload: {
        conversationId: string;
        message: { id: string; text: string; senderId: string; createdAt: string };
      }) => {
        const { conversationId, message: incomingMsg } = payload;

        // If this message belongs to the currently open conversation, append it
        if (activeChatIdRef.current === conversationId) {
          setMessages((prev) => {
            // Skip if we already have this message (e.g. our own optimistic copy)
            if (prev.some((m) => m.id === incomingMsg.id)) return prev;
            return [
              ...prev,
              {
                id: incomingMsg.id,
                conversationId,
                senderId: incomingMsg.senderId,
                text: incomingMsg.text,
                read: true,
                createdAt: incomingMsg.createdAt,
                sender: { id: incomingMsg.senderId, name: "" },
              },
            ];
          });
        }

        // Update the conversation list preview regardless
        setConversations((prev) =>
          prev.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  lastMessage: {
                    id: incomingMsg.id,
                    text: incomingMsg.text,
                    senderId: incomingMsg.senderId,
                    read: activeChatIdRef.current === conversationId,
                    createdAt: incomingMsg.createdAt,
                  },
                  lastMessageAt: incomingMsg.createdAt,
                  hasUnread: activeChatIdRef.current !== conversationId,
                }
              : c
          )
        );
      });

      socket.on("disconnect", () => {
        console.log("[Inbox] Socket disconnected");
      });
    };

    initSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user, roleLoading]);

  // --- Loading screen ---
  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <svg className="animate-spin h-10 w-10 text-[#1B3A6B]" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      </div>
    );
  }

  // --- Derived state ---
  const activeConvo = conversations.find((c) => c.id === activeChatId) || null;
  const activeOtherUser = activeConvo?.otherUser || null;

  // --- Send message ---
  const handleSendMessage = async () => {
    if (!inputVal.trim() || !activeChatId || !user || sendingMessage) return;
    setSendingMessage(true);

    const optimisticMsg: DirectMessage = {
      id: `optimistic-${Date.now()}`,
      conversationId: activeChatId,
      senderId: "self",
      text: inputVal.trim(),
      read: false,
      createdAt: new Date().toISOString(),
      sender: { id: "self", name: user.displayName || "You" },
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    setInputVal("");

    try {
      const idToken = await user.getIdToken();
      const res = await fetch(`${BACKEND_URL}/api/inbox/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          conversationId: activeChatId,
          content: optimisticMsg.text,
        }),
      });

      if (res.ok) {
        const serverMsg: DirectMessage = await res.json();
        // Replace optimistic message with server response
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticMsg.id ? serverMsg : m))
        );
        // Update conversation's lastMessage in the list
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeChatId
              ? {
                  ...c,
                  lastMessage: {
                    id: serverMsg.id,
                    text: serverMsg.text,
                    senderId: serverMsg.senderId,
                    read: false,
                    createdAt: serverMsg.createdAt,
                  },
                  lastMessageAt: serverMsg.createdAt,
                }
              : c
          )
        );

        // Emit via Socket.io so the receiver gets the message in real time
        const receiverId = activeConvo?.otherUser?.id;
        if (socketRef.current && receiverId) {
          socketRef.current.emit("send_direct_message", {
            conversationId: activeChatId,
            receiverId,
            messageData: {
              id: serverMsg.id,
              text: serverMsg.text,
              senderId: serverMsg.senderId,
              createdAt: serverMsg.createdAt,
            },
          });
        }
      }
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setSendingMessage(false);
    }
  };

  return (
      <div className="flex-1 flex overflow-hidden bg-white h-[calc(100vh-80px)] w-full">
        
        {/* LEFT COLUMN: Chat List */}
        <div className="w-[340px] flex-shrink-0 border-r border-gray-200 flex flex-col h-full bg-white">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">{tx.activeChats}</h2>
            <Link href="/client-dashboard" className="text-xs font-bold text-[#1B3A6B] flex items-center gap-1 hover:underline">
              <ArrowLeft className="w-3.5 h-3.5" />
              {lang === "en" ? "Dashboard" : "උපකරණ පුවරුව"}
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto">
            {convoLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
                <Loader2 className="w-6 h-6 animate-spin" />
                <p className="text-xs font-semibold">{tx.loading}</p>
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3 px-8 text-center">
                <InboxIcon className="w-10 h-10 text-gray-300" />
                <p className="text-sm font-bold text-gray-500">{tx.noConversations}</p>
                <p className="text-xs text-gray-400">{tx.noConversationsSub}</p>
              </div>
            ) : (
              conversations.map((conv) => {
                const isActive = conv.id === activeChatId;
                const otherUser = conv.otherUser;
                const initials = getInitials(otherUser.name);
                const avatarColor = getAvatarColor(otherUser.id);
                const specialty =
                  otherUser.lawyerProfile?.specialization?.join(", ") || "";

                return (
                  <div
                    key={conv.id}
                    onClick={() => setActiveChatId(conv.id)}
                    className={`p-4 flex gap-4 cursor-pointer transition-colors border-l-4 ${
                      isActive
                        ? "border-l-[#1B3A6B] bg-blue-50/20"
                        : "border-l-transparent hover:bg-gray-50"
                    }`}
                  >
                    {otherUser.lawyerProfile?.profilePicture ? (
                      <Image
                        src={otherUser.lawyerProfile.profilePicture}
                        alt={otherUser.name}
                        width={44}
                        height={44}
                        className="w-11 h-11 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${avatarColor}`}>
                        {initials}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <h3 className="text-sm font-bold text-gray-900 truncate">{otherUser.name}</h3>
                        <span className={`text-[10px] font-bold ${conv.hasUnread ? "text-blue-600 font-extrabold" : "text-gray-400"}`}>
                          {conv.lastMessage ? formatTime(conv.lastMessage.createdAt) : ""}
                        </span>
                      </div>
                      {specialty && (
                        <p className="text-[10px] font-bold text-blue-600 mb-1 truncate">{specialty}</p>
                      )}
                      <p className="text-xs text-gray-500 truncate font-medium">
                        {conv.lastMessage?.text || "No messages yet"}
                      </p>
                    </div>
                    {conv.hasUnread && (
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0 self-center" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* MIDDLE COLUMN: Chat Thread */}
        <div className="flex-1 flex flex-col min-w-0 bg-white border-r border-gray-200">
          
          {!activeConvo ? (
            /* No conversation selected placeholder */
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-4">
              <MessageSquare className="w-14 h-14 text-gray-200" />
              <p className="text-base font-bold text-gray-500">{tx.selectConversation}</p>
              <p className="text-sm text-gray-400 max-w-xs text-center">{tx.selectConversationSub}</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="h-20 border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0 bg-white">
                <div className="flex items-center gap-4">
                  {activeOtherUser?.lawyerProfile?.profilePicture ? (
                    <Image
                      src={activeOtherUser.lawyerProfile.profilePicture}
                      alt={activeOtherUser.name}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-base ${activeOtherUser ? getAvatarColor(activeOtherUser.id) : "bg-gray-100"}`}>
                      {activeOtherUser ? getInitials(activeOtherUser.name) : "?"}
                    </div>
                  )}
                  <div>
                    <h2 className="text-base font-bold text-gray-900 leading-tight">{activeOtherUser?.name}</h2>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">
                        {tx.statusOnline} · {activeOtherUser?.lawyerProfile?.specialization?.join(", ") || "Attorney"}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-gray-400">
                  <button className="p-2 hover:bg-gray-50 rounded-xl transition-colors" aria-label="Video Call">
                    <Video className="w-5 h-5 text-gray-500" />
                  </button>
                  <button className="p-2 hover:bg-gray-50 rounded-xl transition-colors" aria-label="Audio Call">
                    <Phone className="w-5 h-5 text-gray-500" />
                  </button>
                  <button className="p-2 hover:bg-gray-50 rounded-xl transition-colors" aria-label="More Options">
                    <MoreVertical className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
                {messagesLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                    <MessageSquare className="w-10 h-10 text-gray-200" />
                    <p className="text-sm font-medium">{tx.noMessages}</p>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isClient = msg.senderId === "self" || msg.sender?.name === (user?.displayName || "You");
                    return (
                      <div key={msg.id || index} className={`flex gap-3 ${isClient ? "justify-end" : "justify-start"}`}>
                        
                        {!isClient && (
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 self-end mb-1 ${activeOtherUser ? getAvatarColor(activeOtherUser.id) : "bg-gray-100"}`}>
                            {activeOtherUser ? activeOtherUser.name[0] : "?"}
                          </div>
                        )}

                        <div className="flex flex-col gap-1 max-w-[70%]">
                          <div
                            className={`p-4 rounded-2xl shadow-sm text-sm font-medium leading-relaxed border ${
                              isClient
                                ? "bg-[#1B3A6B] text-white border-transparent rounded-tr-sm"
                                : "bg-white text-gray-700 border-gray-100 rounded-tl-sm"
                            }`}
                          >
                            {msg.text}
                          </div>
                          
                          <span className={`text-[9px] font-bold text-gray-400 px-1 ${isClient ? "text-right" : "text-left"}`}>
                            {formatTime(msg.createdAt)}
                          </span>
                        </div>

                        {isClient && (
                          <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 self-end mb-1 relative border border-slate-300">
                            {user?.displayName ? user.displayName[0] : "A"}
                          </div>
                        )}

                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-gray-100 bg-white flex-shrink-0">
                <div className="flex items-center gap-2 p-2 border border-gray-200 bg-[#F9FAFC] rounded-2xl focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300 transition-all">
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors" aria-label="Attach File">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <input
                    type="text"
                    placeholder={tx.typePlaceholder}
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSendMessage();
                    }}
                    className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder-gray-400 py-2"
                  />
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors" aria-label="Emoji Picker">
                    <Smile className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleSendMessage}
                    disabled={sendingMessage || !inputVal.trim()}
                    className="w-10 h-10 bg-[#1B3A6B] text-white rounded-xl flex items-center justify-center hover:bg-[#112549] transition-colors shadow-sm shrink-0 disabled:opacity-50"
                    aria-label="Send Message"
                  >
                    {sendingMessage ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 ml-0.5" />
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* RIGHT COLUMN: Case Context */}
        <div className="w-[300px] flex-shrink-0 flex flex-col h-full bg-[#FDFDFE] overflow-y-auto">
          <div className="p-6 space-y-8">
            
            {activeConvo && activeOtherUser ? (
              <>
                {/* Attorney Details */}
                <div>
                  <h3 className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-4">{tx.caseDetails}</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-bold text-blue-600 mb-0.5">{lang === "en" ? "ATTORNEY" : "නීතිඥයා"}</p>
                      <p className="text-sm font-bold text-slate-800">{activeOtherUser.name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-blue-600 mb-0.5">{tx.caseType}</p>
                      <p className="text-sm font-bold text-slate-800">
                        {activeOtherUser.lawyerProfile?.specialization?.join(", ") || "General Law"}
                      </p>
                    </div>
                    {activeOtherUser.lawyerProfile?.isVerified && (
                      <div className="flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-[10px] font-bold text-emerald-600">{lang === "en" ? "Bar Council Verified" : "නීතිඥ සභාව සත්‍යාපිතයි"}</span>
                      </div>
                    )}
                    {activeConvo.appointmentId && (
                      <div>
                        <p className="text-[10px] font-bold text-blue-600 mb-0.5">{tx.caseId}</p>
                        <p className="text-sm font-bold text-slate-800">
                          {activeConvo.appointmentId.slice(0, 8).toUpperCase()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-40 text-gray-300">
                <p className="text-xs font-semibold">{lang === "en" ? "Select a conversation" : "සංවාදයක් තෝරන්න"}</p>
              </div>
            )}

          </div>
        </div>

      </div>
  );
}
