/**
 * JusticePal — Centralized Translation Dictionary
 * 
 * All user-facing strings for both English (en) and Sinhala (si).
 * Components should import `translations` and use `translations[lang]` to get strings.
 */

export const translations = {
  en: {
    // ── Navbar ──
    home: "Home",
    lawyers: "Our Lawyers",
    about: "About Us",
    login: "Log In",
    signup: "Get Started",
    logout: "Sign Out",
    dashboard: "Go to Dashboard",
    profile: "My Profile",
    appointments: "Active Appointments",
    docs: "Case Documents",
    language: "Language",

    // ── Hero / Homepage ──
    heroTitle: "Navigate Sri Lankan Law with Confidence",
    heroSubtitle: "Get instant AI legal guidance in plain language or connect with verified local attorneys.",
    heroSearchPlaceholder: "Describe your legal issue...",
    heroCta: "Find a Lawyer",
    heroAiCta: "Ask AI Assistant",
    trustedBy: "Trusted by thousands of Sri Lankans",

    // ── Footer ──
    footerTagline: "Making legal services accessible to everyone in Sri Lanka.",
    quickLinks: "Quick Links",
    legalResources: "Legal Resources",
    contactUs: "Contact Us",
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",
    allRightsReserved: "All rights reserved.",

    // ── Find Lawyer ──
    findLawyer: "Find a Lawyer",
    searchLawyers: "Search Lawyers",
    filterBySpecialization: "Filter by Specialization",
    filterByLocation: "Filter by Location",
    allSpecializations: "All Specializations",
    allLocations: "All Locations",
    noLawyersFound: "No lawyers found matching your criteria.",
    verified: "Verified",
    perHour: "per hour",
    viewProfile: "View Profile",
    bookNow: "Book Now",

    // ── Client Dashboard ──
    welcomeBack: "Welcome back",
    upcomingAppointments: "Upcoming Appointments",
    recentNotifications: "Recent Notifications",
    quickActions: "Quick Actions",
    findALawyer: "Find a Lawyer",
    aiAssistant: "AI Legal Assistant",
    documentDrafting: "Draft Legal Document",
    myDocuments: "My Documents",
    noAppointments: "No upcoming appointments",
    noNotifications: "No recent notifications",
    joinVideoCall: "Join Video Call",
    videoConsultation: "Video Consultation",

    // ── Auth Pages ──
    loginTitle: "Welcome back",
    loginSubtitle: "Sign in to your JusticePal account",
    registerTitle: "Create your account",
    registerSubtitle: "Join JusticePal to connect with verified lawyers",
    email: "Email Address",
    password: "Password",
    confirmPassword: "Confirm Password",
    fullName: "Full Name",
    forgotPassword: "Forgot password?",
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: "Already have an account?",
    signInWithGoogle: "Continue with Google",
    orContinueWith: "Or continue with",

    // ── Common ──
    loading: "Loading...",
    error: "Something went wrong",
    tryAgain: "Try Again",
    cancel: "Cancel",
    submit: "Submit",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    close: "Close",
    back: "Back",
    next: "Next",
    search: "Search",
    viewAll: "View All",
  },

  si: {
    // ── Navbar ──
    home: "මුල් පිටුව",
    lawyers: "නීතිඥයින්",
    about: "අප ගැන",
    login: "පිවිසෙන්න",
    signup: "ලියාපදිංචි වන්න",
    logout: "ඉවත්වන්න",
    dashboard: "උපකරණ පුවරුවට",
    profile: "මගේ පැතිකඩ",
    appointments: "ක්‍රියාකාරී හමුවීම්",
    docs: "නඩු ලේඛන",
    language: "භාෂාව",

    // ── Hero / Homepage ──
    heroTitle: "ශ්‍රී ලංකා නීතිය විශ්වාසයෙන් සැරිසරන්න",
    heroSubtitle: "සරල භාෂාවෙන් ක්ෂණික AI නීතිමය මාර්ගෝපදේශන ලබාගන්න හෝ සත්‍යාපිත ස්ථානීය නීතිඥයින් සමඟ සම්බන්ධ වන්න.",
    heroSearchPlaceholder: "ඔබේ නීතිමය ගැටලුව විස්තර කරන්න...",
    heroCta: "නීතිඥයෙක් සොයන්න",
    heroAiCta: "AI සහායකට අසන්න",
    trustedBy: "ශ්‍රී ලාංකිකයින් දහස් ගණනකගේ විශ්වාසය",

    // ── Footer ──
    footerTagline: "ශ්‍රී ලංකාවේ සෑම කෙනෙකුටම නීති සේවා ප්‍රවේශ විය හැකි කිරීම.",
    quickLinks: "ඉක්මන් සබැඳි",
    legalResources: "නීතිමය සම්පත්",
    contactUs: "අප හා සම්බන්ධ වන්න",
    privacyPolicy: "පෞද්ගලිකත්ව ප්‍රතිපත්තිය",
    termsOfService: "සේවා කොන්දේසි",
    allRightsReserved: "සියලු හිමිකම් ඇවිරිණි.",

    // ── Find Lawyer ──
    findLawyer: "නීතිඥයෙකු සොයන්න",
    searchLawyers: "නීතිඥයින් සොයන්න",
    filterBySpecialization: "විශේෂීකරණය අනුව පෙරන්න",
    filterByLocation: "ස්ථානය අනුව පෙරන්න",
    allSpecializations: "සියලු විශේෂීකරණ",
    allLocations: "සියලු ස්ථාන",
    noLawyersFound: "ඔබේ නිර්ණායක හා ගැලපෙන නීතිඥයින් හමු නොවීය.",
    verified: "සත්‍යාපිත",
    perHour: "පැයකට",
    viewProfile: "පැතිකඩ බලන්න",
    bookNow: "දැන් වෙන්කරවන්න",

    // ── Client Dashboard ──
    welcomeBack: "නැවත සාදරයෙන් පිළිගනිමු",
    upcomingAppointments: "ඉදිරි හමුවීම්",
    recentNotifications: "මෑත දැනුම්දීම්",
    quickActions: "ඉක්මන් ක්‍රියාමාර්ග",
    findALawyer: "නීතිඥයෙක් සොයන්න",
    aiAssistant: "AI නීතිමය සහායක",
    documentDrafting: "නීති ලේඛනය කෙටුම්පත් කරන්න",
    myDocuments: "මගේ ලේඛන",
    noAppointments: "ඉදිරි හමුවීම් නොමැත",
    noNotifications: "මෑත දැනුම්දීම් නොමැත",
    joinVideoCall: "වීඩියෝ ඇමතුමට සම්බන්ධ වන්න",
    videoConsultation: "වීඩියෝ උපදේශනය",

    // ── Auth Pages ──
    loginTitle: "නැවත සාදරයෙන් පිළිගනිමු",
    loginSubtitle: "ඔබේ JusticePal ගිණුමට පිවිසෙන්න",
    registerTitle: "ඔබේ ගිණුම සාදන්න",
    registerSubtitle: "සත්‍යාපිත නීතිඥයින් සමඟ සම්බන්ධ වීමට JusticePal හි සම්බන්ධ වන්න",
    email: "විද්‍යුත් තැපැල් ලිපිනය",
    password: "මුරපදය",
    confirmPassword: "මුරපදය තහවුරු කරන්න",
    fullName: "සම්පූර්ණ නම",
    forgotPassword: "මුරපදය අමතකද?",
    dontHaveAccount: "ගිණුමක් නැද්ද?",
    alreadyHaveAccount: "දැනටමත් ගිණුමක් තිබේද?",
    signInWithGoogle: "Google සමඟ ඉදිරියට",
    orContinueWith: "හෝ සමඟ ඉදිරියට",

    // ── Common ──
    loading: "පූරණය වෙමින්...",
    error: "යමක් වැරදී ඇත",
    tryAgain: "නැවත උත්සාහ කරන්න",
    cancel: "අවලංගු කරන්න",
    submit: "ඉදිරිපත් කරන්න",
    save: "සුරකින්න",
    delete: "මකන්න",
    edit: "සංස්කරණය",
    close: "වසන්න",
    back: "ආපසු",
    next: "ඊළඟ",
    search: "සොයන්න",
    viewAll: "සියල්ල බලන්න",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;
export type Language = "en" | "si";
