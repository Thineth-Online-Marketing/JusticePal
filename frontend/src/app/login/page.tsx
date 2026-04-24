"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLanguage } from "../context/LanguageContext";

const content = {
  en: {
    welcome: "Welcome back",
    subtitle: "Please enter your details to sign in",
    email: "Email address",
    password: "Password",
    remember: "Remember me",
    forgot: "Forgot password?",
    signIn: "Sign In",
    noAccount: "Don't have an account?",
    signUp: "Sign up here",
    brandTitle: "JusticePal",
    brandSub: "Your Personal AI Legal Assistant",
    brandDesc: "Empowering Sri Lankans with instant, accessible legal insights and seamless attorney connections.",
    backToHome: "Back to home"
  },
  si: {
    welcome: "ආයුබෝවන්",
    subtitle: "පිවිසීමට කරුණාකර ඔබේ විස්තර ඇතුළත් කරන්න",
    email: "විද්‍යුත් තැපෑල",
    password: "මුරපදය",
    remember: "මාව මතක තබා ගන්න",
    forgot: "මුරපදය අමතකද?",
    signIn: "ඇතුල් වන්න",
    noAccount: "ගිණුමක් නැද්ද?",
    signUp: "ලියාපදිංචි වන්න",
    brandTitle: "JusticePal",
    brandSub: "ඔබගේ පෞද්ගලික AI නීති සහායකයා",
    brandDesc: "ක්ෂණික හා ප්‍රවේශ විය හැකි නීතිමය අවබෝධය සහ නීතිඥ සම්බන්ධතා මගින් ශ්‍රී ලාංකිකයින් සවිබල ගැන්වීම.",
    backToHome: "මුල් පිටුවට"
  }
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { lang } = useLanguage();
  const tx = content[lang as keyof typeof content] || content.en;

  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("isLoggedIn", "true");
    router.push("/lawyers");
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
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 mb-2">{tx.welcome}</h1>
            <p className="text-gray-500 text-sm sm:text-base">{tx.subtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{tx.email}</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">{tx.password}</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent transition-all outline-none"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#1B3A6B] focus:ring-[#1B3A6B]" />
                <span className="text-gray-600">{tx.remember}</span>
              </label>
              <a href="#" className="font-semibold text-[#1B3A6B] hover:text-orange-500 transition-colors">{tx.forgot}</a>
            </div>

            <button 
              type="submit" 
              className="w-full py-3.5 bg-[#1B3A6B] hover:bg-[#112549] text-white rounded-xl font-semibold shadow-lg shadow-[#1B3A6B]/20 transform hover:-translate-y-0.5 transition-all duration-200"
            >
              {tx.signIn}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            {tx.noAccount} <Link href="/register" className="font-semibold text-orange-500 hover:text-orange-600 transition-colors">{tx.signUp}</Link>
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
