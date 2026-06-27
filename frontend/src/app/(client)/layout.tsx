import ClientNavbar from "../components/ClientNavbar";

export default function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden bg-[#f8fafc] font-sans">
      <ClientNavbar />
      <div className="flex-1 w-full overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
