"use client";

import { useAuth } from "../context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

// Define routes that can be accessed without logging in
const publicRoutes = ["/", "/login", "/register", "/about"];

// Routes that logged-in users should be redirected away from (to their dashboard)
// Note: "/" is NOT here — the landing page handles its own role-based redirect
const guestOnlyRoutes = ["/login", "/register"];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!loading) {
      const isPublic = publicRoutes.includes(pathname);
      const isGuestOnly = guestOnlyRoutes.includes(pathname);

      if (user && isGuestOnly) {
        // Logged-in user on a guest-only page → redirect to /dashboard
        // The /dashboard page handles role-based routing (client/lawyer/admin)
        router.replace("/dashboard");
      } else if (!user && !isPublic) {
        // Not logged in and trying to access a protected route
        router.replace("/login");
      } else {
        setIsReady(true);
      }
    }
  }, [user, loading, pathname, router]);

  const isPublic = publicRoutes.includes(pathname);

  if (loading || (!isReady && !isPublic)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
          <p className="text-slate-600 font-medium">Verifying access...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

