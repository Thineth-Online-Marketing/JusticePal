import ClientDashboard from "../../components/ClientDashboard";
import Footer from "../../components/Footer";

export default function ClientDashboardPage() {
  return (
    <div className="min-h-full flex flex-col">
      <div className="flex-1">
        <ClientDashboard />
      </div>
      <Footer />
    </div>
  );
}
