"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, MapPin, BriefcaseBusiness, Star, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useLanguage } from "../context/LanguageContext";
import { getLawyers } from "../../data/lawyers";
import { useAuth } from "../context/AuthContext";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function LawyersPage() {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [dbLawyers, setDbLawyers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const translations = {
    en: {
      title: "Verified Lawyers",
      subtitle: "Find the right legal expertise for your needs across Sri Lanka.",
      searchPlaceholder: "Search by name, specialization, or city...",
      allSpecializations: "All Specializations",
      filters: ["Criminal Law", "Family Law", "Corporate", "Property Law", "Civil Litigation"],
      verifiedPartner: "Verified Partner",
      viewProfile: "View Profile",
    },
    si: {
      title: "තහවුරු කළ නීතිඥයින්",
      subtitle: "ශ්‍රී ලංකාව පුරා ඔබේ අවශ්‍යතා සඳහා සුදුසු නීතිඥ සහාය ලබාගන්න.",
      searchPlaceholder: "නම, විශේෂත්වය හෝ නගරය අනුව සොයන්න...",
      allSpecializations: "සියලුම විශේෂත්වයන්",
      filters: ["අපරාධ නීතිය", "පවුල් නීතිය", "වාණිජ නීතිය", "දේපළ නීතිය", "සිවිල් නඩු"],
      verifiedPartner: "තහවුරු කළ සහකරු",
      viewProfile: "පැතිකඩ බලන්න",
    }
  };

  useEffect(() => {
    const fetchLawyers = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/lawyers`);
        if (res.ok) {
          const data = await res.json();
          const mapped = data.map((l: any) => ({
            id: l.id,
            name: l.user?.name || "Anonymous",
            specialization: l.specialization?.[0] || (lang === "si" ? "නීතිඥ" : "Attorney-at-Law"),
            location: l.location || (lang === "si" ? "කොළඹ, ශ්‍රී ලංකාව" : "Colombo, Sri Lanka"),
            experience: l.workExperience || (lang === "si" ? "වසර 5+ ක පළපුරුද්ද" : "5+ Years Experience"),
            rating: 4.9,
            reviews: 14,
            image: l.profilePicture || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80",
            casesWon: "50+",
            consultations: "150",
            languages: ["English", "Sinhala"],
            tags: l.specialization || ["Lawyer"],
          }));
          setDbLawyers(mapped);
        }
      } catch (error) {
        console.error("Error fetching lawyers from backend", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLawyers();
  }, [lang]);

  const t = translations[lang as keyof typeof translations] || translations.en;

  const mockLawyers = getLawyers(lang);
  const allLawyers = [...dbLawyers, ...mockLawyers];

  const filteredLawyers = allLawyers.filter((lawyer) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      lawyer.name.toLowerCase().includes(query) ||
      lawyer.specialization.toLowerCase().includes(query) ||
      lawyer.location.toLowerCase().includes(query);

    const isAll = selectedFilter === "All" || selectedFilter === translations.si.allSpecializations || selectedFilter === translations.en.allSpecializations;
    const filterIndex = t.filters.indexOf(selectedFilter);
    const engFilter = filterIndex !== -1 ? translations.en.filters[filterIndex].toLowerCase() : selectedFilter.toLowerCase();

    const matchesFilter = isAll || 
      lawyer.specialization.toLowerCase().includes(selectedFilter.toLowerCase()) ||
      lawyer.tags.some((tag: string) => tag.toLowerCase().includes(engFilter)) ||
      (engFilter === "civil litigation" && lawyer.tags.some((tag: string) => tag.toLowerCase().includes("civil")));

    return matchesSearch && matchesFilter;
  });

  const lawyersPerPage = 6;
  const totalPages = Math.ceil(filteredLawyers.length / lawyersPerPage);
  const indexOfLastLawyer = currentPage * lawyersPerPage;
  const indexOfFirstLawyer = indexOfLastLawyer - lawyersPerPage;
  const currentLawyers = filteredLawyers.slice(indexOfFirstLawyer, indexOfLastLawyer);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#F8FAFC] pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-[#111827] mb-3">{t.title}</h1>
          <p className="text-base text-gray-500">{t.subtitle}</p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8 shadow-sm rounded-xl">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="block w-full pl-11 pr-4 py-4 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent transition-shadow"
            placeholder={t.searchPlaceholder}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-10">
          <button 
            onClick={() => { setSelectedFilter(t.allSpecializations); setCurrentPage(1); }}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-colors shadow-sm ${selectedFilter === "All" || selectedFilter === t.allSpecializations ? 'bg-[#1B3A6B] text-white hover:bg-[#112549]' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
          >
            {t.allSpecializations}
          </button>

          {t.filters.map((filter) => {
            const isSelected = selectedFilter === filter;
            return (
              <button 
                key={filter} 
                onClick={() => { setSelectedFilter(filter); setCurrentPage(1); }}
                className={`px-4 py-2.5 rounded-full text-xs font-medium transition-colors shadow-sm ${isSelected ? 'bg-[#1B3A6B] text-white border border-[#1B3A6B]' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
              >
                {filter}
              </button>
            );
          })}
        </div>

        {/* Lawyer Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {currentLawyers.map((lawyer, index) => (
            <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex flex-col">
              {/* Image Section */}
              <div className="relative h-64 w-full">
                <Image
                  src={lawyer.image}
                  alt={lawyer.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-bold text-gray-900">{lawyer.rating.toFixed(1)}</span>
                  <span className="text-xs text-gray-500 font-medium">({lawyer.reviews})</span>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-start mb-4">
                  <span className="inline-block bg-blue-50 text-blue-700 text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded">
                    {t.verifiedPartner}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-1">{lawyer.name}</h3>
                <p className="text-[#1B3A6B] font-semibold text-xs mb-5">{lawyer.specialization}</p>

                <div className="flex flex-col gap-3 mb-6 mt-auto">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span className="text-xs font-medium">{lawyer.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <BriefcaseBusiness className="h-4 w-4" />
                    <span className="text-xs font-medium">{lawyer.experience}</span>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    if (user) {
                      router.push(`/lawyers/${lawyer.id}`);
                    } else {
                      router.push("/login");
                    }
                  }}
                  className="w-full mt-auto bg-[#1B3A6B] text-white font-semibold py-3 rounded-lg hover:bg-[#112549] transition-colors"
                >
                  {t.viewProfile}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-16">
            <button 
              onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className={`w-10 h-10 rounded-xl flex items-center justify-center border border-gray-200 transition-colors ${currentPage === 1 ? 'bg-gray-50 text-gray-300 cursor-not-allowed' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            {Array.from({ length: totalPages }).map((_, index) => {
              const pageNumber = index + 1;
              return (
                <button 
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors font-medium ${currentPage === pageNumber ? 'bg-[#1B3A6B] text-white shadow-md' : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  {pageNumber}
                </button>
              );
            })}
            
            <button 
              onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`w-10 h-10 rounded-xl flex items-center justify-center border border-gray-200 transition-colors ${currentPage === totalPages ? 'bg-gray-50 text-gray-300 cursor-not-allowed' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
        </div>
      </main>
      <Footer />
    </>
  );
}
