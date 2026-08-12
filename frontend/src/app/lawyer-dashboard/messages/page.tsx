"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import {
  Send, MessageSquare, Inbox as InboxIcon, Loader2
} from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const content = {
  en: {
    activeCases: "Active Conversations",
    typeMessage: "Type your legal advice here...",
    caseSummary: "CLIENT DETAILS",
    caseId: "CLIENT ID",
    type: "EMAIL",
    nextMilestone: "APPOINTMENT STATUS",
    sharedAssets: "SHARED ASSETS",
    viewAll: "View All",
    billableTime: "BILLABLE TIME",
    thisWeek: "this week",
    noConversations: "No conversations yet",
    noConversationsSub: "Client messages will appear here once an appointment or chat is started.",
    selectConversation: "Select a conversation",
    selectConversationSub: "Choose a client from the left panel to view and send messages.",
    loading: "Loading conversations...",
    noMessages: "No messages yet. Start the conversation with your client!",
  },
  si: {
    activeCases: "සක්‍රීය සංවාද",
    typeMessage: "ඔබේ නීති උපදෙස් මෙහි ටයිප් කරන්න...",
    caseSummary: "සේවාදායකයාගේ විස්තර",
    caseId: "සේවාදායක අංකය",
    type: "විද්‍යුත් තැපෑල",
    nextMilestone: "හමුවීමේ තත්ත්වය",
    sharedAssets: "බෙදාගත් වත්කම්",
    viewAll: "සියල්ල බලන්න",
    billableTime: "ගෙවිය යුතු කාලය",
    thisWeek: "මේ සතියේ",
    noConversations: "තවම සංවාද නොමැත",
    noConversationsSub: "සේවාදායකයෙකු සමඟ හමුවීමක් වෙන් කළ පසු පණිවුඩ මෙහි දර්ශනය වේ.",
    selectConversation: "සංවාදයක් තෝරන්න",
    selectConversationSub: "පණිවුඩ යැවීමට වම් පසින් සේවාදායකයෙකු තෝරන්න.",
    loading: "සංවාද පූරණය වෙමින්...",
    noMessages: "තවම පණිවුඩ නැත. ඔබේ සේවාදායකයා සමඟ සංවාදය ආරම්භ කරන්න!",
  }
};

/* ── Types ─────────────────────────────────────────────────── */
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

/* ── Helpers ───────────────────────────────────────────────── */
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
  if (!name) return "CL";
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function formatTime(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: "short" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function MessagesPage() {
  const { user, loading: authLoading } = useAuth();
  const { lang } = useLanguage();
  const tx = content[lang as keyof typeof content] || content.en;
  const router = useRouter();

  // --- State ---
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [convoLoading, setConvoLoading] = useState(true);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const activeChatIdRef = useRef<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Keep ref in sync
  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  // --- Auth & Role Check ---
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }

    const checkLawyerProfile = async () => {
      try {
        const idToken = await user.getIdToken();
        const res = await fetch(`${BACKEND_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${idToken}` }
        });
        if (res.ok) {
          const data = await res.json();
          setCurrentUserId(data.id);
        }
      } catch (err) {
        console.error("Failed to verify user profile", err);
      }
    };

    checkLawyerProfile();
  }, [user, authLoading, router]);

  // --- Fetch Conversations ---
  const fetchConversations = useCallback(async () => {
    if (!user) return;
    try {
      const idToken = await user.getIdToken();
      const res = await fetch(`${BACKEND_URL}/api/inbox/conversations`, {
        headers: { Authorization: `Bearer ${idToken}` }
      });
      if (res.ok) {
        const data: Conversation[] = await res.json();
        setConversations(data);
        if (data.length > 0 && !activeChatIdRef.current) {
          setActiveChatId(data[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch conversations", err);
    } finally {
      setConvoLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user, fetchConversations]);

  // --- Fetch Messages for Selected Conversation ---
  const fetchMessages = useCallback(async (conversationId: string) => {
    if (!user) return;
    setMessagesLoading(true);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch(`${BACKEND_URL}/api/inbox/conversations/${conversationId}/messages`, {
        headers: { Authorization: `Bearer ${idToken}` }
      });
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

  // --- Auto scroll to bottom ---
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- Socket.io Integration ---
  useEffect(() => {
    if (!user) return;
    let socket: Socket;

    const initSocket = async () => {
      const idToken = await user.getIdToken();
      socket = io(BACKEND_URL, {
        auth: { token: idToken },
        transports: ["websocket", "polling"],
      });

      socketRef.current = socket;

      socket.on("connect", () => {
        console.log("[Lawyer Messages] Socket connected");
        socket.emit("join_inbox");
      });

      socket.on("receive_direct_message", (payload: {
        conversationId: string;
        message: { id: string; text: string; senderId: string; createdAt: string };
      }) => {
        const { conversationId, message: incomingMsg } = payload;

        if (activeChatIdRef.current === conversationId) {
          setMessages((prev) => {
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
        console.log("[Lawyer Messages] Socket disconnected");
      });
    };

    initSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user]);

  // --- Derived State ---
  const activeConvo = conversations.find((c) => c.id === activeChatId) || null;
  const activeOtherUser = activeConvo?.otherUser || null;

  // --- Send Message ---
  const handleSendMessage = async () => {
    if (!inputVal.trim() || !activeChatId || !user || sendingMessage) return;
    setSendingMessage(true);

    const optimisticMsg: DirectMessage = {
      id: `optimistic-${Date.now()}`,
      conversationId: activeChatId,
      senderId: currentUserId || "self",
      text: inputVal.trim(),
      read: false,
      createdAt: new Date().toISOString(),
      sender: { id: currentUserId || "self", name: user.displayName || "You" },
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
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticMsg.id ? serverMsg : m))
        );

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#f8fafc]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1B3A6B]" />
      </div>
    );
  }

  return (
    <main className="flex-1 flex overflow-hidden bg-white h-full relative">
      
      {/* LEFT COLUMN: Chat List */}
      <div className="w-[340px] flex-shrink-0 border-r border-gray-200 flex flex-col h-full bg-white">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#1B3A6B]" />
            {tx.activeCases}
          </h2>
          {conversations.length > 0 && (
            <span className="px-2 py-0.5 bg-blue-50 text-[#1B3A6B] rounded-full text-xs font-bold border border-blue-100">
              {conversations.length}
            </span>
          )}
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {convoLoading ? (
            <div className="flex flex-col items-center justify-center h-48 gap-2 text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin text-[#1B3A6B]" />
              <span className="text-xs font-medium">{tx.loading}</span>
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-[#1B3A6B] flex items-center justify-center mb-3">
                <InboxIcon className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-gray-800 mb-1">{tx.noConversations}</p>
              <p className="text-xs text-gray-400">{tx.noConversationsSub}</p>
            </div>
          ) : (
            conversations.map((chat) => {
              const other = chat.otherUser;
              const isSelected = chat.id === activeChatId;
              const avatarColor = getAvatarColor(other?.id || chat.id);

              return (
                <div
                  key={chat.id}
                  onClick={() => setActiveChatId(chat.id)}
                  className={`p-4 flex gap-3 cursor-pointer transition-colors border-l-4 ${
                    isSelected
                      ? "border-l-[#1B3A6B] bg-blue-50/40"
                      : "border-l-transparent hover:bg-gray-50/80"
                  }`}
                >
                  <div className={`w-11 h-11 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm shadow-sm ${avatarColor}`}>
                    {getInitials(other?.name || "Client")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h3 className={`text-sm font-bold truncate ${chat.hasUnread ? "text-gray-900" : "text-gray-800"}`}>
                        {other?.name || "Client"}
                      </h3>
                      {chat.lastMessageAt && (
                        <span className="text-[10px] font-semibold text-gray-400 flex-shrink-0 ml-1">
                          {formatTime(chat.lastMessageAt)}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-semibold text-gray-500 truncate mb-1">
                      {other?.email || "Client Consultation"}
                    </p>
                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-xs truncate ${chat.hasUnread ? "font-bold text-gray-900" : "font-normal text-gray-500"}`}>
                        {chat.lastMessage ? chat.lastMessage.text : "No messages yet"}
                      </p>
                      {chat.hasUnread && (
                        <span className="w-2 h-2 rounded-full bg-[#F97316] flex-shrink-0"></span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MIDDLE COLUMN: Chat Thread */}
      <div className="flex-1 flex flex-col min-w-0 bg-white relative">
        {activeConvo && activeOtherUser ? (
          <>
            {/* Chat Header */}
            <div className="h-20 border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0 bg-white">
              <div className="flex items-center gap-4">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${getAvatarColor(activeOtherUser.id)}`}>
                  {getInitials(activeOtherUser.name)}
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 leading-tight">
                    {activeOtherUser.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                      Client
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="text-xs text-gray-400 font-medium">
                      {activeOtherUser.email}
                    </span>
                  </div>
                </div>
              </div>

              {activeConvo.appointmentId && (
                <button
                  onClick={() => router.push(`/consultation?role=lawyer&appointmentId=${activeConvo.appointmentId}`)}
                  className="px-4 py-2 bg-[#1B3A6B] hover:bg-[#112549] text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-2"
                >
                  🎥 Join Video Call
                </button>
              )}
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F8FAFC]">
              {messagesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 animate-spin text-[#1B3A6B]" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-[#1B3A6B] flex items-center justify-center mb-3">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-gray-700">{tx.noMessages}</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isSelf = msg.senderId === currentUserId || msg.senderId === "self";
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${isSelf ? "justify-end" : "justify-start"}`}
                    >
                      {!isSelf && (
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1 ${getAvatarColor(activeOtherUser.id)}`}>
                          {getInitials(activeOtherUser.name)}
                        </div>
                      )}

                      <div className={`flex flex-col gap-1 max-w-[75%] ${isSelf ? "items-end" : "items-start"}`}>
                        <div
                          className={`p-3.5 rounded-2xl text-sm font-medium leading-relaxed shadow-sm ${
                            isSelf
                              ? "bg-[#1B3A6B] text-white rounded-tr-xs"
                              : "bg-white text-gray-800 rounded-tl-xs border border-gray-100"
                          }`}
                        >
                          {msg.text}
                        </div>
                        <span className="text-[10px] font-semibold text-gray-400 px-1">
                          {formatTime(msg.createdAt)}
                        </span>
                      </div>

                      {isSelf && (
                        <div className="w-8 h-8 rounded-full bg-[#112549] text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1 shadow-sm">
                          YOU
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-4 border-t border-gray-100 bg-white flex-shrink-0">
              <div className="flex items-center gap-3 p-2 border border-gray-200 bg-[#F9FAFC] rounded-2xl focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300 transition-all">
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={tx.typeMessage}
                  disabled={sendingMessage}
                  className="flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder-gray-400 py-1.5 px-2"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputVal.trim() || sendingMessage}
                  className="w-10 h-10 bg-[#1B3A6B] hover:bg-[#112549] disabled:bg-gray-200 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-colors shadow-sm flex-shrink-0"
                >
                  {sendingMessage ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <Send className="w-4 h-4 ml-0.5" />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#F8FAFC]">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-[#1B3A6B] flex items-center justify-center mb-4 shadow-sm">
              <InboxIcon className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">{tx.selectConversation}</h3>
            <p className="text-xs text-gray-500 max-w-sm">{tx.selectConversationSub}</p>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Case & Client Context */}
      <div className="w-[320px] flex-shrink-0 border-l border-gray-200 flex flex-col h-full bg-[#FDFDFE]">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Client Details */}
          <div>
            <h3 className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-4">{tx.caseSummary}</h3>
            {activeOtherUser ? (
              <div className="space-y-4">
                <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm space-y-3">
                  <div>
                    <p className="text-[10px] font-bold text-blue-600 uppercase">Client Name</p>
                    <p className="text-sm font-bold text-gray-900">{activeOtherUser.name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-blue-600 uppercase">Contact Email</p>
                    <p className="text-xs font-semibold text-gray-700 truncate">{activeOtherUser.email}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400 font-medium">Select a conversation to view client profile details.</p>
            )}
          </div>

          {/* Quick Consultation Call */}
          {activeConvo?.appointmentId && (
            <div>
              <h3 className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-3">{tx.nextMilestone}</h3>
              <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-xl shadow-sm space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <p className="text-xs font-bold text-[#1B3A6B]">Scheduled Consultation Room</p>
                </div>
                <button
                  onClick={() => router.push(`/consultation?role=lawyer&appointmentId=${activeConvo.appointmentId}`)}
                  className="w-full py-2 bg-[#1B3A6B] hover:bg-[#112549] text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                >
                  Join Consultation
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-[#FDFDFE]">
          <div className="bg-[#F3F6F8] rounded-xl p-4 border border-gray-200">
            <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-1">{tx.billableTime}</p>
            <div className="flex items-end justify-between">
              <span className="text-xl font-black text-[#1B3A6B]">Encrypted</span>
              <span className="text-xs font-bold text-[#10B981] mb-0.5">Live Socket</span>
            </div>
          </div>
        </div>
      </div>

    </main>
  );
}
