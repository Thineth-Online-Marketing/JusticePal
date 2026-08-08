"use client";

import React, { useState } from "react";
import { Calendar, Clock, Video, User, Briefcase, CreditCard, ExternalLink } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://justicepal-production.up.railway.app";

interface BookingModalProps {
  lawyerId: string;
  lawyerName: string;
  selectedDate: string;
  selectedTime: string;
  consultationType: string;
  totalAmount: string;
  onClose: () => void;
}

export default function BookingModal({
  lawyerId,
  lawyerName,
  selectedDate,
  selectedTime,
  consultationType,
  totalAmount,
  onClose
}: BookingModalProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const token = await user?.getIdToken();
      if (!token) throw new Error("Please log in to proceed.");

      // Step 1: Create the appointment
      const appointmentRes = await fetch(`${BACKEND_URL}/api/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: (user as any)?.uid || "",
          lawyerId,
          scheduledAt: new Date(`${selectedDate} ${selectedTime}`).toISOString(),
          caseDescription: `${consultationType} consultation with ${lawyerName}`,
        }),
      });

      if (!appointmentRes.ok) {
        // If the appointment creation fails, try to handle it gracefully
        const errData = await appointmentRes.json().catch(() => null);
        throw new Error(errData?.message || "Failed to create appointment.");
      }

      const appointment = await appointmentRes.json();

      // Step 2: Create Stripe Checkout Session
      const paymentRes = await fetch(`${BACKEND_URL}/api/payments/create-checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          appointmentId: appointment.id,
          amount: parseFloat(totalAmount.replace(/[^0-9.]/g, "")),
          lawyerName,
          consultationType,
        }),
      });

      if (!paymentRes.ok) {
        // Payment session failed — still created the appointment, show success
        setPaymentSuccess(true);
        setIsSubmitting(false);
        return;
      }

      const paymentData = await paymentRes.json();

      if (paymentData.sessionUrl) {
        // Redirect to Stripe Checkout
        window.location.href = paymentData.sessionUrl;
      } else {
        // No Stripe URL — treat as successful booking without payment
        setPaymentSuccess(true);
      }
    } catch (err: any) {
      console.error("Booking error:", err);
      setError(err.message || "An error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
        >
          ✕
        </button>

        <div className="p-6 sm:p-8">
          <div className="animate-fade-in-up">
            {paymentSuccess ? (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
                <p className="text-gray-500 mb-8">Your consultation has been booked successfully.</p>
                <button 
                  onClick={onClose}
                  className="w-full py-3.5 bg-[#1B3A6B] text-white rounded-xl font-semibold shadow-lg hover:bg-[#112549] transition-all"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Confirm & Pay</h2>
                
                {/* Booking Summary */}
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 mb-6 shadow-inner">
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
                    <div className="w-12 h-12 bg-blue-100 text-[#1B3A6B] rounded-full flex items-center justify-center flex-shrink-0">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-0.5">Consultation With</p>
                      <h3 className="text-lg font-bold text-gray-900">{lawyerName}</h3>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                      <Calendar className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Date</p>
                        <p className="text-sm font-bold text-gray-800">{selectedDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                      <Clock className="w-5 h-5 text-orange-500" />
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Time</p>
                        <p className="text-sm font-bold text-gray-800">{selectedTime}</p>
                      </div>
                    </div>
                    <div className="col-span-2 flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                      {consultationType.toLowerCase().includes('video') ? <Video className="w-5 h-5 text-purple-500" /> : <User className="w-5 h-5 text-purple-500" />}
                      <div className="flex-1 flex justify-between items-center">
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase">Method</p>
                          <p className="text-sm font-bold text-gray-800">{consultationType}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-gray-400 font-bold uppercase">Total Fee</p>
                          <p className="text-lg font-extrabold text-[#1B3A6B]">LKR {totalAmount}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stripe Payment Info */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex items-start gap-3">
                  <CreditCard className="w-5 h-5 text-[#1B3A6B] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-[#1B3A6B] mb-1">Secure Payment via Stripe</p>
                    <p className="text-xs text-blue-600/70">You will be redirected to Stripe&apos;s secure checkout page to complete payment. Your card details are never stored on our servers.</p>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <button 
                    type="submit"
                    disabled={isSubmitting} 
                    className="w-full py-3.5 bg-[#1B3A6B] text-white rounded-xl font-semibold shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#112549] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Creating booking...
                      </>
                    ) : (
                      <>
                        <ExternalLink className="w-4 h-4" />
                        Proceed to Payment
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
