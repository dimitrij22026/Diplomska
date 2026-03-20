import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import en from "./i18n/en.json";
import mk from "./i18n/mk.json";
import es from "./i18n/es.json";
import de from "./i18n/de.json";
import fr from "./i18n/fr.json";

const resources = {
  en: { translation: en },
  mk: { translation: mk },
  es: { translation: es },
  de: { translation: de },
  fr: { translation: fr },
};

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    supportedLngs: ["en", "mk", "es", "de", "fr"],
    defaultNS: "translation",
    ns: ["translation"],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
      lookupLocalStorage: "finson.i18nextLng",
    },
  });

export default i18n;

// Keep the existing app context exports intact for gradual migration.
export { LanguageProvider } from "./i18n/LanguageContext";
export { useLanguage } from "./i18n/useLanguage";
export { translations, type Language, type TranslationKey } from "./i18n/translations";
