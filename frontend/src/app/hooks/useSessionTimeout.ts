"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

const IDLE_TIMEOUT_MS = 60 * 60 * 1000; // 1 hour
const ABSOLUTE_TIMEOUT_MS = 24 * 60 * 60 * 1000; // 24 hours

export function useSessionTimeout() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const logoutTimerRef = useRef<NodeJS.Timeout | null>(null);

  const performLogout = useCallback(async (reason: "idle" | "expired") => {
    try {
      await logout();
      localStorage.removeItem("lastActiveTime");
      localStorage.removeItem("loginTime");
      localStorage.removeItem("isLoggedIn");
      
      const message = reason === "idle" 
        ? "You have been logged out due to 1 hour of inactivity for security reasons." 
        : "Your session has reached the 24 hour limit. Please log in again.";
        
      alert(message);
      router.push("/login?expired=true");
    } catch (err) {
      console.error("Logout failed during session timeout", err);
    }
  }, [logout, router]);

  const checkTimeout = useCallback(() => {
    if (!user) return;

    const lastActiveStr = localStorage.getItem("lastActiveTime");
    const loginTimeStr = localStorage.getItem("loginTime");
    
    const now = Date.now();
    const lastActive = lastActiveStr ? parseInt(lastActiveStr, 10) : now;
    const loginTime = loginTimeStr ? parseInt(loginTimeStr, 10) : now;

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
  }, [user, performLogout]);

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
