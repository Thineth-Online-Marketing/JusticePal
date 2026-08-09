"use client";

import React, { useState } from "react";
import { Calendar, Clock, Video, User, Briefcase } from "lucide-react";
import { auth } from "../lib/firebase";

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
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>("");
  const [cardNumber, setCardNumber] = useState<string>("");
  const [expiry, setExpiry] = useState<string>("");
  const [cvv, setCvv] = useState<string>("");
  const [errors, setErrors] = useState({ card: false, expiry: false, cvv: false });
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);

  const validateCard = () => setErrors(e => ({ ...e, card: cardNumber.replace(/\D/g, '').length !== 16 }));
  const validateExpiry = () => setErrors(e => ({ ...e, expiry: !/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry) }));
  const validateCvv = () => setErrors(e => ({ ...e, cvv: !/^\d{3,4}$/.test(cvv) }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isCardInvalid = cardNumber.replace(/\D/g, '').length !== 16;
    const isExpiryInvalid = !/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry);
    const isCvvInvalid = !/^\d{3,4}$/.test(cvv);
    
    setErrors({ card: isCardInvalid, expiry: isExpiryInvalid, cvv: isCvvInvalid });
    
    if (isCardInvalid || isExpiryInvalid || isCvvInvalid) {
      return;
    }

    setIsSubmitting(true);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    setPaymentSuccess(true);
    setIsSubmitting(false);
    
    const finalPayload = {
      lawyerId,
      date: selectedDate,
      timeSlot: selectedTime,
      consultationType,
      totalAmount,
      notes
    };

    try {
      const user = auth.currentUser;
      const idToken = user ? await user.getIdToken() : '';
      
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/api/appointments`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify(finalPayload)
      });
    } catch (error) {
      console.error(error);
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
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
                <p className="text-gray-500 mb-8">Your booking has been confirmed.</p>
                <button 
                  onClick={onClose}
                  className="w-full py-3.5 bg-[#1B3A6B] text-white rounded-xl font-semibold shadow-lg hover:bg-[#112549] transition-all"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment & Confirmation</h2>
                
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 mb-8 shadow-inner">
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

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Reason for Consultation (Optional)</label>
                      <textarea 
                        rows={2}
                        placeholder="E.g., Consultation regarding property deed"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none transition-all resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Card Number</label>
                      <input 
                        type="text" 
                        placeholder="0000 0000 0000 0000"
                        value={cardNumber}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 16);
                          setCardNumber(val.replace(/(.{4})/g, '$1 ').trim());
                        }}
                        onBlur={validateCard}
                        className={`w-full px-4 py-3 rounded-xl border ${errors.card ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'} bg-gray-50 focus:bg-white outline-none transition-all`}
                      />
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Expiry Date</label>
                        <input 
                          type="text" 
                          placeholder="MM/YY"
                          value={expiry}
                          onChange={(e) => {
                            let val = e.target.value.replace(/\D/g, '').slice(0, 4);
                            if (val.length >= 3) val = val.slice(0, 2) + '/' + val.slice(2);
                            setExpiry(val);
                          }}
                          onBlur={validateExpiry}
                          className={`w-full px-4 py-3 rounded-xl border ${errors.expiry ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'} bg-gray-50 focus:bg-white outline-none transition-all`}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">CVV</label>
                        <input 
                          type="password" 
                          placeholder="123"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                          onBlur={validateCvv}
                          className={`w-full px-4 py-3 rounded-xl border ${errors.cvv ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'} bg-gray-50 focus:bg-white outline-none transition-all`}
                        />
                      </div>
                    </div>
                  </div>

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
                        Processing...
                      </>
                    ) : "Pay Now"}
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
