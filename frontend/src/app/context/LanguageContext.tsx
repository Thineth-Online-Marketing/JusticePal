"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type Language = "en" | "si";

interface LanguageContextType {
  lang: Language;
  toggle: () => void;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  toggle: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>("en");
  const toggle = () => setLang((prev) => (prev === "en" ? "si" : "en"));

  return (
    <LanguageContext.Provider value={{ lang, toggle }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
