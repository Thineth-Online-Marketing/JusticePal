"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLanguage } from "../context/LanguageContext";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../lib/firebase";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const content = {
  en: {
    welcome: "Create an account",
    subtitle: "Join JusticePal today to get started",
    name: "Full Name",
    email: "Email address",
    password: "Password",
    confirm: "Confirm Password",
    signUp: "Sign Up",
    signingUp: "Creating account...",
    already: "Already have an account?",
    signIn: "Sign in here",
    brandTitle: "JusticePal",
    brandSub: "Your Personal AI Legal Assistant",
    brandDesc: "Empowering Sri Lankans with instant, accessible legal insights and seamless attorney connections.",
    backToHome: "Back to home"
  },
  si: {
    welcome: "ගිණුමක් සාදන්න",
    subtitle: "ආරම්භ කිරීමට අදම JusticePal හා එක්වන්න",
    name: "සම්පූර්ණ නම",
    email: "විද්‍යුත් තැපෑල",
    password: "මුරපදය",
    confirm: "මුරපදය තහවුරු කරන්න",
    signUp: "ලියාපදිංචි වන්න",
    signingUp: "ගිණුම සාදමින්...",
    already: "දැනටමත් ගිණුමක් තිබේද?",
    signIn: "මෙහි පිවිසෙන්න",
    brandTitle: "JusticePal",
    brandSub: "ඔබගේ පෞද්ගලික AI නීති සහායකයා",
    brandDesc: "ක්ෂණික හා ප්‍රවේශ විය හැකි නීතිමය අවබෝධය සහ නීතිඥ සම්බන්ධතා මගින් ශ්‍රී ලාංකිකයින් සවිබල ගැන්වීම.",
    backToHome: "මුල් පිටුවට"
  }
};

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { lang } = useLanguage();
  const tx = content[lang as keyof typeof content] || content.en;
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Step 2: Set display name in Firebase
      await updateProfile(firebaseUser, { displayName: name });

      // Step 3: Get the Firebase ID token
      const idToken = await firebaseUser.getIdToken();

      // Step 4: Sync user to PostgreSQL backend
      const res = await fetch(`${BACKEND_URL}/api/auth/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ email: firebaseUser.email, name }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to sync user with server");
      }

      // Step 5: Redirect on success
      router.push("/lawyers");
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string };
      switch (firebaseError.code) {
        case "auth/email-already-in-use":
          setError("An account with this email already exists. Please sign in.");
          break;
        case "auth/weak-password":
          setError("Password is too weak. Please use at least 6 characters.");
          break;
        case "auth/invalid-email":
          setError("Please enter a valid email address.");
          break;
        default:
          setError(firebaseError.message || "An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex text-gray-900 bg-white">
      {/* Viewport Split - Left Side Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 relative pointer-events-auto">
        <Link 
          href="/" 
          className="absolute top-8 left-8 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-[#1B3A6B] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          {tx.backToHome}
        </Link>
        
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 mb-2">{tx.welcome}</h1>
            <p className="text-gray-500 text-sm sm:text-base">{tx.subtitle}</p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{tx.name}</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent transition-all outline-none"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{tx.email}</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent transition-all outline-none"
                placeholder="you@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{tx.password}</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent transition-all outline-none"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{tx.confirm}</label>
              <input 
                type="password" 
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent transition-all outline-none"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 bg-[#1B3A6B] hover:bg-[#112549] disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl font-semibold shadow-lg shadow-[#1B3A6B]/20 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              )}
              {loading ? tx.signingUp : tx.signUp}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            {tx.already} <Link href="/login" className="font-semibold text-orange-500 hover:text-orange-600 transition-colors">{tx.signIn}</Link>
          </p>
        </div>
      </div>

      {/* Viewport Split - Right Side Design */}
      <div className="hidden lg:flex w-1/2 bg-[#1B3A6B] flex-col justify-center items-center relative overflow-hidden p-12">
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-blue-400/20 rounded-full blur-[80px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-orange-500/20 rounded-full blur-[80px]" />
        
        <div className="relative z-10 w-full max-w-lg text-center backdrop-blur-md bg-white/5 border border-white/10 p-12 rounded-3xl shadow-2xl">
          <div className="relative w-32 h-32 mx-auto mb-6 flex items-center justify-center rounded-2xl overflow-hidden">
            <Image
              src="https://res.cloudinary.com/dluwvqdaz/image/upload/v1775969976/Navy_Blue_JusticePal_Logo_with_Dove_Fusion_new_uhyjl0.png"
              alt="JusticePal Logo"
              fill
              className="object-contain drop-shadow-xl rounded-2xl"
            />
          </div>
          <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">{tx.brandTitle}</h2>
          <h3 className="text-xl text-blue-200 font-medium mb-6 uppercase tracking-widest text-sm">{tx.brandSub}</h3>
          <p className="text-blue-100/80 leading-relaxed text-lg">
            {tx.brandDesc}
          </p>
        </div>
      </div>
    </div>
  );
}
