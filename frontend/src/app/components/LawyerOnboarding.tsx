"use client";
import { useState } from "react";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { auth } from "../lib/firebase";

declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}

export default function LawyerOnboarding({ dbUser, initialStep, onComplete }: { dbUser: any, initialStep: 1 | 2 | 3, onComplete: () => void }) {
  const [step] = useState(initialStep);
  const [loading, setLoading] = useState(false);

  // Profile data
  const [specialization, setSpecialization] = useState(dbUser?.lawyerProfile?.specialization?.[0] || "");
  const [location, setLocation] = useState(dbUser?.lawyerProfile?.location || "");
  const [bio, setBio] = useState(dbUser?.lawyerProfile?.bio || "");
  const [workExperience, setWorkExperience] = useState(dbUser?.lawyerProfile?.workExperience || "");
  const [profilePicture, setProfilePicture] = useState(dbUser?.lawyerProfile?.profilePicture || "");
  
  // Phone verification
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [phoneVerified, setPhoneVerified] = useState(false);

  // ID verification
  const [idPhotos, setIdPhotos] = useState<string[]>([]);

  const handleMockProfileUpload = () => {
    setProfilePicture("https://i.pravatar.cc/150?u=" + dbUser.id);
    alert("Profile picture uploaded!");
  };

  const handleSaveBio = async () => {
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
          profilePicture,
          phone
        }),
      });

      if (!res.ok) throw new Error("Failed to update profile");
      onComplete();
    } catch (error) {
      alert("Failed to save bio data.");
    } finally {
      setLoading(false);
    }
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
      
      // Save phone to DB
      const idToken = await auth.currentUser?.getIdToken();
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/lawyers/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ phone, phoneVerified: true }),
      });
      
      alert("Phone verified successfully!");
      onComplete();
    } catch (error: any) {
      alert("Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadID = () => {
    setIdPhotos(["https://mock-id-photo-url.com/id1.jpg"]);
    alert("ID uploaded successfully!");
  };

  const handleSaveID = async () => {
    setLoading(true);
    try {
      const idToken = await auth.currentUser?.getIdToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/lawyers/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({
          idPhotos,
          profileCompleted: true
        }),
      });

      if (!res.ok) throw new Error("Failed to update profile");
      onComplete();
    } catch (error) {
      alert("Failed to submit ID. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. +94771234567" className="w-full px-4 py-2 border rounded-lg" />
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture</label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden border border-gray-200">
                  {profilePicture ? (
                    <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                  )}
                </div>
                <button onClick={handleMockProfileUpload} className="px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors">
                  Upload Picture
                </button>
              </div>
            </div>
            <button onClick={handleSaveBio} disabled={loading} className="w-full py-3 bg-[#1B3A6B] text-white rounded-lg font-medium mt-4">
              {loading ? "Saving..." : "Save Bio Data"}
            </button>
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

            <button onClick={handleSaveID} disabled={loading || idPhotos.length === 0} className="w-full py-3 bg-[#1B3A6B] text-white rounded-lg font-medium mt-4 disabled:opacity-50">
              {loading ? "Submitting..." : "Submit ID for Approval"}
            </button>
          </div>
        )}

      </div>
  );
}
