"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLanguage } from "../context/LanguageContext";
import { createUserWithEmailAndPassword, updateProfile, signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { signInWithGoogle } from "../lib/googleAuth";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://justicepal-production.up.railway.app";

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
  const [role, setRole] = useState<"client" | "lawyer">("client");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const { lang } = useLanguage();
  const tx = content[lang as keyof typeof content] || content.en;
  const router = useRouter();

  const handleGoogleSignUp = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      const userData = await signInWithGoogle(role);
      const userRole = userData?.role;
      
      if (userRole && userRole !== role) {
        await signOut(auth);
        throw new Error(`This account is already registered as a ${userRole}. Please select ${userRole.charAt(0).toUpperCase() + userRole.slice(1)} to log in.`);
      }
      
      localStorage.setItem("isLoggedIn", "true");
      router.push("/dashboard");
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string };
      if (e.code === "auth/popup-closed-by-user") return;
      setError(e.message || "Google sign-up failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

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
      let res: Response;
      try {
        res = await fetch(`${BACKEND_URL}/api/auth/sync`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ email: firebaseUser.email, name, role }),
        });
      } catch (err: unknown) {
        throw new Error(`Cannot reach backend server at ${BACKEND_URL}. Please verify NEXT_PUBLIC_BACKEND_URL in Cloudflare settings.`);
      }

      const contentType = res.headers.get("content-type");
      const isJson = contentType && contentType.includes("application/json");

      if (!res.ok) {
        if (isJson) {
          const data = await res.json();
          throw new Error(data.message || "Failed to sync user with server");
        } else {
          throw new Error(`Backend error (${res.status}). Please verify NEXT_PUBLIC_BACKEND_URL and Railway backend status.`);
        }
      }

      if (!isJson) {
        throw new Error(`Server returned non-JSON response. Please check NEXT_PUBLIC_BACKEND_URL variable.`);
      }

      const userData = await res.json();
      const userRole = userData?.role;

      if (userRole && userRole !== role) {
        // Technically, a new signup shouldn't hit this unless the backend ignored our role and kept an old one.
        // But let's be safe.
        await signOut(auth);
        throw new Error(`This account is already registered as a ${userRole}. Please sign in as ${userRole.charAt(0).toUpperCase() + userRole.slice(1)}.`);
      }

      // Step 5: Redirect on success
      localStorage.setItem("isLoggedIn", "true");
      router.push("/dashboard");
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

          {/* Google Sign-Up Button */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl font-semibold text-gray-700 shadow-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <svg className="animate-spin h-5 w-5 text-gray-500" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {googleLoading ? "Signing up..." : "Sign up with Google"}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">or sign up with email</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Selection Toggle */}
            <div className="flex p-1 bg-gray-100 rounded-xl">
              <button
                type="button"
                onClick={() => setRole("client")}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${role === "client"
                    ? "bg-white text-[#1B3A6B] shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                Client
              </button>
              <button
                type="button"
                onClick={() => setRole("lawyer")}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${role === "lawyer"
                    ? "bg-white text-[#1B3A6B] shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                Lawyer
              </button>
            </div>
            
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
