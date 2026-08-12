"use client";

import ClientNavbar from "../components/ClientNavbar";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

export default function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  
  if (loading) return null;

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden bg-[#f8fafc] font-sans">
      {user ? <ClientNavbar /> : <Navbar />}
      <div className="flex-1 w-full overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
