"use client";

import { useLanguage } from "../context/LanguageContext";
import enTranslations from "../../locales/en.json";
import siTranslations from "../../locales/si.json";

const translations: Record<string, any> = {
  en: enTranslations,
  si: siTranslations,
};

export function useTranslation() {
  const { lang } = useLanguage();

  const t = (key: string, variables?: Record<string, any>): any => {
    const keys = key.split(".");
    let value = translations[lang];

    for (const k of keys) {
      if (value === undefined || value === null) break;
      value = value[k];
    }

    // Fallback to English if key doesn't exist in current language
    if (value === undefined && lang !== "en") {
      value = translations["en"];
      for (const k of keys) {
        if (value === undefined || value === null) break;
        value = value[k];
      }
    }

    if (typeof value !== "string") {
      if (typeof value === "object" && value !== null) {
        return value;
      }
      return key; // return key if no translation found
    }

    // Handle variables (e.g., "Hello {{name}}")
    if (variables) {
      let strVal = value as string;
      Object.keys(variables).forEach((varKey) => {
        strVal = strVal.replace(new RegExp(`{{${varKey}}}`, "g"), String(variables[varKey]));
      });
      return strVal;
    }

    return value as string;
  };

  return { t, lang };
}
