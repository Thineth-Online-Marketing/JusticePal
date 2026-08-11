"use client";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";

let isIntercepted = false;

/**
 * Initializes a global interceptor for window.fetch.
 * Catches 401 Unauthorized responses and handles global logout.
 */
export function initFetchInterceptor() {
  if (typeof window === "undefined" || isIntercepted) return;
  
  const originalFetch = window.fetch;
  
  window.fetch = async (...args) => {
    try {
      const response = await originalFetch(...args);
      
      // If we get a 401 Unauthorized, and we are not already on the login page
      if (response.status === 401 && !window.location.pathname.includes("/login")) {
        console.warn("Global fetch interceptor caught 401 Unauthorized. Logging out...");
        
        try {
          await signOut(auth);
          localStorage.removeItem("lastActiveTime");
          localStorage.removeItem("loginTime");
          localStorage.removeItem("isLoggedIn");
          
          alert("Session expired or unauthorized. Please log in again for security.");
          
          window.location.href = "/login?expired=true";
        } catch (err) {
          console.error("Failed to sign out on 401", err);
        }
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  };
  
  isIntercepted = true;
}
