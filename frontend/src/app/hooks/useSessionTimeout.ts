"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";

const IDLE_TIMEOUT_MS = 60 * 60 * 1000; // 1 hour
const ABSOLUTE_TIMEOUT_MS = 24 * 60 * 60 * 1000; // 24 hours

export function useSessionTimeout() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const logoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLoggingOutRef = useRef(false);

  const performLogout = useCallback(async (reason: "idle" | "expired") => {
    // Prevent re-entrant logout calls (e.g. from interval firing while logout is in progress)
    if (isLoggingOutRef.current) return;
    isLoggingOutRef.current = true;

    try {
      // Firebase signOut can throw "Database is closing/hidden" when the browser
      // tab is hidden or IndexedDB is unavailable. This is safe to ignore — the
      // important part is clearing local state and redirecting.
      try {
        await logout();
      } catch {
        // Silently ignore Firebase signOut errors (e.g. IndexedDB unavailable)
      }

      localStorage.removeItem("lastActiveTime");
      localStorage.removeItem("loginTime");
      localStorage.removeItem("isLoggedIn");
      
      const message = reason === "idle" 
        ? "You have been logged out due to 1 hour of inactivity for security reasons." 
        : "Your session has reached the 24 hour limit. Please log in again.";
        
      alert(message);
      router.replace("/login?expired=true");
    } finally {
      isLoggingOutRef.current = false;
    }
  }, [logout, router]);

  const checkTimeout = useCallback(() => {
    // Skip checks if there's no user, logout is already in progress,
    // or we're already on the login page
    if (!user || isLoggingOutRef.current) return;
    if (pathname === "/login" || pathname === "/register") return;

    const lastActiveStr = localStorage.getItem("lastActiveTime");
    const loginTimeStr = localStorage.getItem("loginTime");
    
    // If session timestamps were never set, there's nothing to time out
    if (!lastActiveStr || !loginTimeStr) return;

    const now = Date.now();
    const lastActive = parseInt(lastActiveStr, 10);
    const loginTime = parseInt(loginTimeStr, 10);

    // Check Absolute Timeout (24h)
    if (now - loginTime > ABSOLUTE_TIMEOUT_MS) {
      performLogout("expired");
      return;
    }

    // Check Idle Timeout (1h)
    if (now - lastActive > IDLE_TIMEOUT_MS) {
      performLogout("idle");
      return;
    }
  }, [user, pathname, performLogout]);

  // Handle user activity to slide the idle window
  const updateActivity = useCallback(() => {
    if (user) {
      localStorage.setItem("lastActiveTime", Date.now().toString());
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      // Clear timers if user is not logged in
      if (logoutTimerRef.current) clearInterval(logoutTimerRef.current);
      return;
    }

    // Initialize session times if not set
    if (!localStorage.getItem("loginTime")) {
      localStorage.setItem("loginTime", Date.now().toString());
    }
    if (!localStorage.getItem("lastActiveTime")) {
      localStorage.setItem("lastActiveTime", Date.now().toString());
    }

    // Add activity listeners
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((event) => {
      window.addEventListener(event, updateActivity, { passive: true });
    });

    // Check for timeouts every minute
    logoutTimerRef.current = setInterval(checkTimeout, 60 * 1000);

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, updateActivity);
      });
      if (logoutTimerRef.current) clearInterval(logoutTimerRef.current);
    };
  }, [user, checkTimeout, updateActivity]);
}

