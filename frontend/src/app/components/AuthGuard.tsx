"use client";

import { useAuth } from "../context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

// Define routes that can be accessed without logging in
const publicRoutes = ["/", "/login", "/register", "/about"];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!loading) {
      // Allow if it's a public route, OR if the user is authenticated.
      // Wait, is it exact match for pathname? Yes, and maybe some dynamic public routes?
      // For now, exact matching on publicRoutes works.
      const isPublic = publicRoutes.includes(pathname);
      
      if (!user && !isPublic) {
        // Use router.replace to avoid building up a huge back stack of redirects
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
