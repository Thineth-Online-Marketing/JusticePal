"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [roleLoading, setRoleLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    const fetchRoleAndRedirect = async () => {
      try {
        const idToken = await user.getIdToken();
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL || "https://justicepal-production.up.railway.app"}/api/users/profile`,
          {
            headers: { Authorization: `Bearer ${idToken}` },
          }
        );
        if (res.ok) {
          const data = await res.json();
          if (data.role === "lawyer") {
            router.replace("/lawyer-dashboard");
          } else if (data.role === "client") {
            router.replace("/client-dashboard");
          } else if (data.role === "admin") {
            // Admins are not auto-redirected to /admin — they access it manually.
            // Send them back to the landing page.
            router.replace("/");
          } else {
            router.replace("/login");
          }
        } else {
          router.replace("/login");
        }
      } catch (err) {
        console.error("Failed to fetch user role", err);
        router.replace("/login");
      } finally {
        setRoleLoading(false);
      }
    };

    fetchRoleAndRedirect();
  }, [user, authLoading, router]);

  // Show loading spinner while checking auth and redirecting
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
