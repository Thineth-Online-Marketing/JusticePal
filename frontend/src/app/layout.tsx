import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "./context/LanguageContext";
import { AuthProvider } from "./context/AuthContext";
import { UIProvider } from "./context/UIContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "JusticePal – Sri Lanka's Premier AI Legal Assistant",
  description:
    "Navigate the Sri Lankan legal system with ease. Get instant AI guidance in plain language or connect with verified local attorneys.",
  keywords: ["legal assistant", "Sri Lanka", "AI law", "lawyers", "legal advice"],
  icons: {
    icon: "https://res.cloudinary.com/dluwvqdaz/image/upload/v1775969976/Navy_Blue_JusticePal_Logo_with_Dove_Fusion_new_uhyjl0.png",
    shortcut: "https://res.cloudinary.com/dluwvqdaz/image/upload/v1775969976/Navy_Blue_JusticePal_Logo_with_Dove_Fusion_new_uhyjl0.png",
    apple: "https://res.cloudinary.com/dluwvqdaz/image/upload/v1775969976/Navy_Blue_JusticePal_Logo_with_Dove_Fusion_new_uhyjl0.png",
  },
  openGraph: {
    title: "JusticePal – Sri Lanka's Premier AI Legal Assistant",
    description:
      "Get instant AI legal guidance in plain language or connect with verified local attorneys.",
    type: "website",
  },
};

import AuthGuard from "./components/AuthGuard";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <UIProvider>
          <AuthProvider>
            <LanguageProvider>
              <AuthGuard>{children}</AuthGuard>
            </LanguageProvider>
          </AuthProvider>
        </UIProvider>
      </body>
    </html>
  );
}
