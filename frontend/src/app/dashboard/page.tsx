"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import ClientDashboard from "../components/ClientDashboard";
import LawyerDashboard from "../components/LawyerDashboard";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;

    // Check both Firebase auth AND localStorage login flag
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    if (!user || !isLoggedIn) {
      // Not logged in or no explicit login session — clear everything and redirect
      localStorage.removeItem("isLoggedIn");
      router.push("/login");
      return;
    }

    setIsAuthorized(true);

    const fetchRole = async () => {
      try {
        const idToken = await user.getIdToken();
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/users/profile`,
          {
            headers: { Authorization: `Bearer ${idToken}` },
          }
        );
        if (res.ok) {
          const data = await res.json();
          setRole(data.role);
        } else {
          setRole(null);
        }
      } catch (err) {
        console.error("Failed to fetch user role", err);
        setRole(null);
      } finally {
        setRoleLoading(false);
      }
    };

    fetchRole();
  }, [user, authLoading, router]);

  // Show loading spinner while checking auth
  if (authLoading || !isAuthorized || roleLoading) {
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

  // Render Dashboard based on role
  if (role === "client") {
    return <ClientDashboard />;
  } else if (role === "lawyer") {
    return <LawyerDashboard />;
  }

  // Fallback — no valid role, redirect to login
  router.push("/login");
  return null;
}
