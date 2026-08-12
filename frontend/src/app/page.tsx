"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import TrustBadges from "./components/TrustBadges";
import LegalCategories from "./components/LegalCategories";
import CTABanner from "./components/CTABanner";
import Footer from "./components/Footer";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://justice-pal-cjhn.vercel.app";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (loading) return;

    // Local check for redirect=false query parameter to bypass dashboard redirect
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("redirect") === "false") {
        setTimeout(() => setChecking(false), 0);
        return;
      }
    }

    // Not logged in — show landing page
    if (!user) {
      setTimeout(() => setChecking(false), 0);
      return;
    }

    // Logged in — fetch role and redirect clients/lawyers
    const checkRole = async () => {
      try {
        const idToken = await user.getIdToken();
        const res = await fetch(`${BACKEND_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${idToken}` },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.role === "lawyer") {
            router.replace("/lawyer-dashboard");
            return;
          } else if (data.role === "client") {
            router.replace("/client-dashboard");
            return;
          }
          // Admin or any other role — show landing page
        }
      } catch (err) {
        console.error("Failed to check user role:", err);
      }
      setChecking(false);
    };

    checkRole();
  }, [user, loading, router]);

  // Show a brief loading state while checking role
  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <svg
          className="animate-spin h-10 w-10 text-[#1B3A6B]"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
      </div>
    );
  }

  // Show landing page for unauthenticated users and admins
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <HeroSection />
        <TrustBadges />
        <LegalCategories />
        <CTABanner />
      </main>
      <Footer />
    </div>
  );
}
