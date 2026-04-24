"use client";

import Image from "next/image";
import { Search, MapPin, BriefcaseBusiness, Star, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import LawyersNavbar from "../components/LawyersNavbar";
import Footer from "../components/Footer";

export default function LawyersPage() {
  const lawyers = [
    {
      name: "Kavinda Perera",
      specialization: "Criminal Defense Specialist",
      location: "Colombo, Sri Lanka",
      experience: "15+ Years Experience",
      rating: 4.9,
      reviews: 120,
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Anjali Wijesekara",
      specialization: "Family & Divorce Law",
      location: "Kandy, Sri Lanka",
      experience: "8+ Years Experience",
      rating: 4.8,
      reviews: 85,
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Ruwan Fernando",
      specialization: "Corporate & Intellectual Property",
      location: "Colombo, Sri Lanka",
      experience: "12+ Years Experience",
      rating: 5.0,
      reviews: 42,
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Lasantha Gunawardena",
      specialization: "Real Estate & Land Disputes",
      location: "Galle, Sri Lanka",
      experience: "20+ Years Experience",
      rating: 4.7,
      reviews: 156,
      image: "https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Tharushi Senaratne",
      specialization: "Human Rights & Civil Law",
      location: "Jaffna, Sri Lanka",
      experience: "5+ Years Experience",
      rating: 4.9,
      reviews: 28,
      image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Malani De Silva",
      specialization: "Labour & Employment Law",
      location: "Negombo, Sri Lanka",
      experience: "10+ Years Experience",
      rating: 4.6,
      reviews: 92,
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=80",
    },
  ];

  return (
    <>
      <LawyersNavbar />
      <main className="min-h-screen bg-[#F8FAFC] pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-[#111827] mb-3">Verified Lawyers</h1>
          <p className="text-base text-gray-500">Find the right legal expertise for your needs across Sri Lanka.</p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8 shadow-sm rounded-xl">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-4 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent transition-shadow"
            placeholder="Search by name, specialization, or city..."
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-10">
          <button className="px-5 py-2.5 bg-[#1B3A6B] text-white rounded-full text-xs font-semibold hover:bg-[#112549] transition-colors shadow-sm">
            All Specializations
          </button>

          {["Criminal Law", "Family Law", "Corporate", "Property Law", "Civil Litigation"].map((filter) => (
            <button key={filter} className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-full text-xs font-medium hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2">
              {filter}
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>
          ))}
        </div>

        {/* Lawyer Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {lawyers.map((lawyer, index) => (
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
                    Verified Partner
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

                <button className="w-full bg-[#1B3A6B] text-white font-semibold py-3 rounded-lg hover:bg-[#112549] transition-colors mt-auto">
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-2 mt-16">
          <button className="w-10 h-10 rounded-xl flex items-center justify-center border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#1B3A6B] text-white font-semibold shadow-md">
            1
          </button>
          <button className="w-10 h-10 rounded-xl flex items-center justify-center border border-gray-200 bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors">
            2
          </button>
          <button className="w-10 h-10 rounded-xl flex items-center justify-center border border-gray-200 bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors">
            3
          </button>
          <span className="w-8 h-10 flex items-center justify-center text-gray-400">
            ...
          </span>
          <button className="w-10 h-10 rounded-xl flex items-center justify-center border border-gray-200 bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors">
            12
          </button>
          <button className="w-10 h-10 rounded-xl flex items-center justify-center border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
