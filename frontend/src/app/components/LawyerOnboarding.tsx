"use client";
import { useState } from "react";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { auth } from "../lib/firebase";

declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}

export default function LawyerOnboarding({ dbUser, onComplete }: { dbUser: any, onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Profile data
  const [specialization, setSpecialization] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [workExperience, setWorkExperience] = useState("");
  
  // Phone verification
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [phoneVerified, setPhoneVerified] = useState(false);

  // ID verification
  const [idPhotos, setIdPhotos] = useState<string[]>([]);

  const handleNextStep = () => {
    setStep(step + 1);
  };

  const handleSendCode = async () => {
    setLoading(true);
    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
        });
      }
      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, phone, appVerifier);
      setConfirmationResult(result);
      alert("OTP sent successfully!");
    } catch (error: any) {
      alert(error.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!confirmationResult) return;
    setLoading(true);
    try {
      await confirmationResult.confirm(otp);
      setPhoneVerified(true);
      alert("Phone verified successfully!");
      handleNextStep();
    } catch (error: any) {
      alert("Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadID = () => {
    // Mock upload
    setIdPhotos(["https://mock-id-photo-url.com/id1.jpg"]);
    alert("ID uploaded successfully!");
  };

  const handleSubmitProfile = async () => {
    setLoading(true);
    try {
      const idToken = await auth.currentUser?.getIdToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/lawyers/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          specialization: [specialization],
          location,
          bio,
          workExperience,
          phone,
          phoneVerified: true,
          idPhotos,
          profileCompleted: true
        }),
      });

      if (!res.ok) throw new Error("Failed to update profile");
      
      onComplete(); // Triggers re-fetch or state update in parent
    } catch (error) {
      alert("Failed to submit profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-2xl font-bold text-[#1B3A6B] mb-2">Lawyer Verification Setup</h1>
        <p className="text-gray-500 mb-8">Please complete your profile and verify your identity to access the dashboard.</p>

        {/* Step 1: Profile Information */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in-up">
            <h2 className="text-lg font-semibold border-b pb-2">Step 1: Bio Data</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" disabled value={dbUser.name} className="w-full px-4 py-2 border rounded-lg bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
              <input type="text" value={specialization} onChange={(e) => setSpecialization(e.target.value)} placeholder="e.g. Criminal Defense, Family Law" className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location / Office</label>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Colombo, Sri Lanka" className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Work Experience</label>
              <textarea value={workExperience} onChange={(e) => setWorkExperience(e.target.value)} rows={3} placeholder="Describe your experience..." className="w-full px-4 py-2 border rounded-lg"></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Short Bio</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={2} className="w-full px-4 py-2 border rounded-lg"></textarea>
            </div>
            <button onClick={handleNextStep} className="w-full py-3 bg-[#1B3A6B] text-white rounded-lg font-medium mt-4">Continue to Phone Verification</button>
          </div>
        )}

        {/* Step 2: Phone Verification */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in-up">
            <h2 className="text-lg font-semibold border-b pb-2">Step 2: Verify Mobile Number</h2>
            <div id="recaptcha-container"></div>
            {!confirmationResult ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number (with +94)</label>
                  <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+94771234567" className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <button onClick={handleSendCode} disabled={loading} className="w-full py-3 bg-[#1B3A6B] text-white rounded-lg font-medium mt-4">
                  {loading ? "Sending..." : "Send OTP"}
                </button>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP</label>
                  <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456" className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <button onClick={handleVerifyCode} disabled={loading} className="w-full py-3 bg-emerald-600 text-white rounded-lg font-medium mt-4">
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
              </>
            )}
          </div>
        )}

        {/* Step 3: Lawyer ID */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in-up">
            <h2 className="text-lg font-semibold border-b pb-2">Step 3: Lawyer ID Verification</h2>
            <p className="text-sm text-gray-600">Please upload a clear photo of your official Lawyer ID card.</p>
            
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50">
              {idPhotos.length > 0 ? (
                <div className="text-emerald-600 font-medium">ID Uploaded Successfully</div>
              ) : (
                <>
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <button onClick={handleUploadID} className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100">Browse Files (Mock Upload)</button>
                </>
              )}
            </div>

            <button onClick={handleSubmitProfile} disabled={loading || idPhotos.length === 0} className="w-full py-3 bg-[#1B3A6B] text-white rounded-lg font-medium mt-4 disabled:opacity-50">
              {loading ? "Submitting..." : "Submit for Approval"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
