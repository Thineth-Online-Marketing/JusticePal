import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import TrustBadges from "./components/TrustBadges";
import LegalCategories from "./components/LegalCategories";
import CTABanner from "./components/CTABanner";
import Footer from "./components/Footer";

export default function Home() {
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
