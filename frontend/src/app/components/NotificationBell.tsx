"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Bell, Check, CheckCheck, Calendar, FileText, Info, CreditCard, AlertTriangle } from "lucide-react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import { useUI } from "../context/UIContext";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string; // "info" | "success" | "warning" | "payment" | "booking"
  read: boolean;
  createdAt: string;
}

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const POLL_INTERVAL_MS = 30_000; // 30 seconds

function getNotificationIcon(type: string) {
  switch (type) {
    case "booking":
      return <Calendar className="w-4 h-4 text-blue-600" />;
    case "payment":
      return <CreditCard className="w-4 h-4 text-green-600" />;
    case "warning":
      return <AlertTriangle className="w-4 h-4 text-orange-600" />;
    case "success":
      return <Check className="w-4 h-4 text-emerald-600" />;
    default:
      return <FileText className="w-4 h-4 text-indigo-600" />;
  }
}

function getIconBg(type: string) {
  switch (type) {
    case "booking":
      return "bg-blue-50";
    case "payment":
      return "bg-green-50";
    case "warning":
      return "bg-orange-50";
    case "success":
      return "bg-emerald-50";
    default:
      return "bg-indigo-50";
  }
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function NotificationBell() {
  const { user } = useAuth();
  const { showToast } = useUI();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch unread count (lightweight, runs on interval)
  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const idToken = await user.getIdToken();
      const res = await fetch(`${API_BASE}/api/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.count);
      }
    } catch (err) {
      // Silently fail — polling will retry
    }
  }, [user]);

  // Fetch full notification list (runs when dropdown opens)
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch(`${API_BASE}/api/notifications`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (res.ok) {
        const data: Notification[] = await res.json();
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.read).length);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Mark a single notification as read
  const markAsRead = async (id: string) => {
    if (!user) return;
    try {
      const idToken = await user.getIdToken();
      await fetch(`${API_BASE}/api/notifications/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${idToken}` },
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    if (!user) return;
    try {
      const idToken = await user.getIdToken();
      await fetch(`${API_BASE}/api/notifications/read-all`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${idToken}` },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  // Poll for unread count as fallback
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Real-time socket.io connection for instant notifications
  useEffect(() => {
    if (!user) return;

    let socket: Socket;

    const initSocket = async () => {
      try {
        const idToken = await user.getIdToken();
        socket = io(API_BASE, {
          auth: { token: idToken },
          transports: ["websocket", "polling"],
        });

        socket.on("new_notification", (notification: Notification) => {
          // Play a subtle notification sound if browser permits
          try {
            const audio = new Audio('/notification-sound.mp3');
            audio.volume = 0.5;
            audio.play().catch(e => console.log('Audio playback prevented:', e));
          } catch (e) {
            // Ignore audio errors
          }

          // Display dynamic toast
          if (showToast) {
            showToast(notification.title, notification.type === "warning" ? "warning" : "success");
          }

          // Update component states instantly without reloading
          setNotifications((prev) => [notification, ...prev]);
          setUnreadCount((prev) => prev + 1);
        });

      } catch (err) {
        console.error("Failed to initialize notification socket:", err);
      }
    };

    initSocket();

    // Proper cleanup to prevent memory leaks
    return () => {
      if (socket) {
        socket.off("new_notification");
        socket.disconnect();
      }
    };
  }, [user, showToast]);

  // Fetch full list when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        id="notification-bell"
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-100 transition-colors"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[380px] max-h-[480px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-red-50 text-red-600 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-xs font-semibold text-[#1B3A6B] hover:text-blue-800 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="overflow-y-auto max-h-[360px]">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-gray-200 border-t-[#1B3A6B] rounded-full animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                  <Bell className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-sm font-semibold text-gray-500">No notifications yet</p>
                <p className="text-xs text-gray-400 mt-1">We&apos;ll notify you when something happens</p>
              </div>
            ) : (
              notifications.slice(0, 10).map((notif) => (
                <button
                  key={notif.id}
                  onClick={() => {
                    if (!notif.read) markAsRead(notif.id);
                  }}
                  className={`w-full text-left px-5 py-3.5 flex gap-3 items-start hover:bg-gray-50 transition-colors border-l-[3px] ${
                    notif.read
                      ? "border-l-transparent"
                      : "border-l-[#1B3A6B] bg-blue-50/30"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full ${getIconBg(notif.type)} flex items-center justify-center shrink-0 mt-0.5`}
                  >
                    {getNotificationIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm leading-tight ${
                        notif.read ? "font-medium text-gray-700" : "font-bold text-gray-900"
                      }`}
                    >
                      {notif.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-2">
                      {notif.message}
                    </p>
                    <span className="text-[10px] font-semibold text-gray-400 mt-1 block">
                      {timeAgo(notif.createdAt)}
                    </span>
                  </div>
                  {!notif.read && (
                    <div className="w-2 h-2 bg-[#1B3A6B] rounded-full shrink-0 mt-2" />
                  )}
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-gray-100 p-3">
              <button className="w-full py-2 text-xs font-bold text-[#1B3A6B] hover:bg-gray-50 rounded-lg transition-colors">
                View All Notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
