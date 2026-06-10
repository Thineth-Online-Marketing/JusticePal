"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Heart, Share2, MapPin, BriefcaseBusiness, Globe, ChevronLeft, Calendar as CalendarIcon, Star, CheckCircle2, ChevronRight as ChevronRightIcon } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import BookingModal from "../components/BookingModal";

export default function LawyerProfilePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const [selectedDate, setSelectedDate] = useState(4);
  const [selectedSlot, setSelectedSlot] = useState("10:30 AM");
  const [consultationType, setConsultationType] = useState("video");
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#F8FAFC] pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-blue-900 transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/lawyers" className="hover:text-blue-900 transition-colors">Lawyers</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">Mr. Chaminda Perera</span>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column - Profile Details */}
            <div className="flex-1 space-y-6">

              {/* Profile Card */}
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 relative">
                <div className="absolute top-6 right-6 flex items-center gap-3 md:bg-transparent bg-white/80 p-1 md:p-0 rounded-full md:rounded-none z-10">
                  <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                    <Heart className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-40 h-40 relative rounded-2xl overflow-hidden flex-shrink-0 border border-gray-100 shadow-sm">
                    <Image
                      src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80"
                      alt="Mr. Chaminda Perera"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Mr. Chaminda Perera</h1>
                      <CheckCircle2 className="w-6 h-6 text-blue-500" />
                    </div>
                    <p className="text-[#1B3A6B] font-semibold text-lg mb-4">Senior Attorney-at-Law</p>

                    <div className="flex flex-wrap gap-y-3 gap-x-6 text-sm text-gray-600 mb-5">
                      <div className="flex items-center gap-2">
                        <BriefcaseBusiness className="w-4 h-4 text-gray-400" />
                        <span>15+ Years Experience</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>Colombo, Sri Lanka</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <span>English, Sinhala, Tamil</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {["Land Law", "Corporate Law", "Civil Litigation"].map(tag => (
                        <span key={tag} className="px-3 py-1.5 bg-[#F1F5F9] text-[#334155] border border-gray-200 text-xs font-semibold rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center items-center">
                  <p className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Cases Won</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">450+</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center items-center">
                  <p className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Consultations</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">1.2k</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center items-center">
                  <p className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Rating</p>
                  <div className="flex items-center gap-1">
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">4.9</p>
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  </div>
                </div>
              </div>

              {/* Tabs and Content */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex overflow-x-auto border-b border-gray-100 scrollbar-hide">
                  {["About", "Specializations", "Experience", "Publications"].map((tab, idx) => (
                    <button key={tab} className={`px-6 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${idx === 0 ? 'border-[#1B3A6B] text-[#1B3A6B]' : 'border-transparent text-gray-500 hover:text-gray-900'}`}>
                      {tab}
                    </button>
                  ))}
                </div>
                <div className="p-6 md:p-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Professional Summary</h3>
                  <div className="space-y-4 text-gray-600 leading-relaxed text-sm">
                    <p>
                      Mr. Chaminda Perera is a distinguished Attorney-at-Law with over 15 years of extensive practice in the Sri Lankan legal system. Specializing in Land and Corporate Law, he has successfully represented numerous high-profile clients in the District Courts and the Court of Appeal.
                    </p>
                    <p>
                      His approach combines traditional legal excellence with modern strategic thinking, ensuring clients receive the most comprehensive protection of their rights and assets.
                    </p>
                  </div>
                </div>
              </div>

              {/* Reviews Section */}
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Verified Client Reviews</h3>

                <div className="space-y-6">
                  {/* Review 1 */}
                  <div className="border-b border-gray-100 pb-6">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-sm">AS</div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">Aruni Samaraweera</p>
                          <p className="text-[10px] text-gray-400">2 weeks ago</p>
                        </div>
                      </div>
                      <div className="flex gap-[1px]">
                        {[1, 2, 3, 4, 5].map(star => <Star key={star} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />)}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">"Extremely professional and knowledgeable. Helped me resolve a complex property dispute in less than 3 months. Highly recommend for any land law matters."</p>
                  </div>

                  {/* Review 2 */}
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#F1F5F9] flex items-center justify-center text-[#475569] font-bold text-sm">KD</div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">Kasun Dissanayake</p>
                          <p className="text-[10px] text-gray-400">1 month ago</p>
                        </div>
                      </div>
                      <div className="flex gap-[1px]">
                        {[1, 2, 3, 4, 5].map(star => <Star key={star} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />)}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">"Very clear communication and honest advice regarding my business incorporation. The booking process through JusticePal was seamless."</p>
                  </div>
                </div>

                <div className="mt-8">
                  <button className="text-sm font-bold text-[#1B3A6B] hover:text-[#112549] flex items-center gap-1 transition-colors group">
                    View All 142 Reviews <ChevronRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

            </div>

            {/* Right Column - Booking & Map */}
            <div className="w-full lg:w-[400px] flex-shrink-0 space-y-6">

              {/* Booking Widget */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-6 text-gray-900">
                  <CalendarIcon className="w-5 h-5 text-gray-700" />
                  <h3 className="text-lg font-bold">Book Consultation</h3>
                </div>

                {/* Calendar View */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-gray-900 text-sm">November 2024</span>
                    <div className="flex gap-2 text-gray-400">
                      <button className="p-1 hover:text-gray-900 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                      <button className="p-1 hover:text-gray-900 transition-colors"><ChevronRight className="w-4 h-4" /></button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center mb-2">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                      <span key={day} className="text-[10px] font-bold text-gray-400 uppercase">{day}</span>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center">
                    {/* Simulated Dates */}
                    {[27, 28, 29, 30, 31].map(date => (
                      <button key={`prev-${date}`} className="h-8 text-xs text-gray-300 font-medium" disabled>{date}</button>
                    ))}
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(date => (
                      <button
                        key={date}
                        onClick={() => setSelectedDate(date)}
                        className={`h-8 w-8 mx-auto rounded-full text-xs font-semibold flex items-center justify-center transition-colors ${selectedDate === date ? 'bg-[#1B3A6B] text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                      >
                        {date}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Slots */}
                <div className="mb-6">
                  <h4 className="text-xs font-bold text-gray-900 mb-3 uppercase tracking-wider">Available Slots (Mon, Nov 4)</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {["09:00 AM", "10:30 AM", "02:00 PM", "04:30 PM"].map(time => (
                      <button
                        key={time}
                        onClick={() => setSelectedSlot(time)}
                        className={`py-2 px-3 rounded-lg border text-sm font-semibold transition-all ${selectedSlot === time ? 'border-[#1B3A6B] bg-blue-50/50 text-[#1B3A6B]' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Consultation Type */}
                <div className="mb-6 space-y-3">
                  <h4 className="text-xs font-bold text-gray-900 mb-2 uppercase tracking-wider">Consultation Type</h4>

                  <label className={`block border rounded-xl p-4 cursor-pointer transition-all ${consultationType === 'video' ? 'border-[#1B3A6B] bg-[#F8FAFC]' : 'border-gray-100 hover:border-gray-200'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${consultationType === 'video' ? 'border-[#1B3A6B]' : 'border-gray-300'}`}>
                        {consultationType === 'video' && <div className="w-2 h-2 rounded-full bg-[#1B3A6B]" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-0.5">
                          <span className="font-bold text-gray-900 text-sm">Video Call</span>
                          <span className="font-bold text-gray-900 text-sm">Rs. 5,000</span>
                        </div>
                        <span className="text-[10px] text-gray-500">Secure link via JusticePal</span>
                      </div>
                    </div>
                    <input type="radio" className="hidden" name="type" value="video" onChange={() => setConsultationType('video')} />
                  </label>

                  <label className={`block border rounded-xl p-4 cursor-pointer transition-all ${consultationType === 'person' ? 'border-[#1B3A6B] bg-[#F8FAFC]' : 'border-gray-100 hover:border-gray-200'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${consultationType === 'person' ? 'border-[#1B3A6B]' : 'border-gray-300'}`}>
                        {consultationType === 'person' && <div className="w-2 h-2 rounded-full bg-[#1B3A6B]" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-0.5">
                          <span className="font-bold text-gray-900 text-sm">In-Person</span>
                          <span className="font-bold text-gray-900 text-sm">Rs. 7,500</span>
                        </div>
                        <span className="text-[10px] text-gray-500">At Lawyer's Office, Colombo 03</span>
                      </div>
                    </div>
                    <input type="radio" className="hidden" name="type" value="person" onChange={() => setConsultationType('person')} />
                  </label>
                </div>

                {/* Price Breakdown */}
                <div className="bg-[#F8FAFC] rounded-xl p-5 mb-5 border border-gray-100">
                  <div className="flex justify-between items-center text-sm mb-2.5">
                    <span className="text-gray-500 font-medium">Consultation Fee</span>
                    <span className="text-gray-900 font-semibold">Rs. {consultationType === 'video' ? '5,000.00' : '7,500.00'}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm mb-4">
                    <span className="text-gray-500 font-medium">Service Fee (JusticePal)</span>
                    <span className="text-gray-900 font-semibold">Rs. 250.00</span>
                  </div>
                  <div className="h-px bg-gray-200 mb-4" />
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900 text-base">Total Amount</span>
                    <span className="font-bold text-[#1B3A6B] text-lg">Rs. {consultationType === 'video' ? '5,250.00' : '7,750.00'}</span>
                  </div>
                </div>

                <button 
                  onClick={() => setIsBookingModalOpen(true)}
                  className="w-full bg-[#1B3A6B] hover:bg-[#112549] text-white font-semibold py-3.5 rounded-xl transition-all flex justify-center items-center gap-2 group shadow-md shadow-[#1B3A6B]/10"
                >
                  Proceed to Payment
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="3" y="6" width="18" height="12" rx="2" ry="2" />
                    <path d="M3 10h18" />
                    <path d="M7 14h.01" />
                  </svg>
                </button>
                <p className="text-center text-[9px] text-gray-400 mt-4 uppercase tracking-[0.15em] font-bold">Secured by JusticePal Escrow Protection</p>
              </div>

              {/* Office Location */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hidden lg:block">
                <div className="flex items-center gap-2 mb-4 text-gray-900">
                  <MapPin className="w-4 h-4 text-gray-700" />
                  <h3 className="text-sm font-bold uppercase tracking-wider">Office Location</h3>
                </div>
                <div className="w-full h-36 bg-gray-200 rounded-xl overflow-hidden mb-4 relative">
                  {/* Map Placeholder Image */}
                  <Image src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80" alt="Map" fill className="object-cover" />
                  <div className="absolute inset-0 flex justify-center items-center">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <MapPin className="w-5 h-5 text-red-500" />
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">124 Galle Road, Colombo 03, Sri Lanka</p>
                <a href="#" className="text-sm font-bold text-[#1B3A6B] hover:text-[#112549] transition-colors">Get Directions</a>
              </div>

            </div>
          </div>
        </div>
      </main>
      <Footer />
      {isBookingModalOpen && (
        <BookingModal 
          lawyerId="chaminda-perera" 
          lawyerName="Mr. Chaminda Perera"
          selectedDate={`November ${selectedDate}, 2024`}
          selectedTime={selectedSlot}
          consultationType={consultationType === 'video' ? 'Video Call' : 'In-Person'}
          totalAmount={consultationType === 'video' ? '5,250.00' : '7,750.00'}
          onClose={() => setIsBookingModalOpen(false)} 
        />
      )}
    </>
  );
}
