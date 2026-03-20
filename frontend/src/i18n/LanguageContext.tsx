import {
  useState,
  useEffect,
  type ReactNode,
} from "react"
import i18next from "i18next"
import { translations, type Language } from "./translations"
import { LanguageContext } from "./language-context"

const STORAGE_KEY = "finson.language"
const I18N_STORAGE_KEY = "finson.i18nextLng"

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && saved in translations) return saved as Language
    return "mk" // Default to Macedonian
  })

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem(STORAGE_KEY, lang)
    localStorage.setItem(I18N_STORAGE_KEY, lang)
    void i18next.changeLanguage(lang)
  }

  // Translation function with interpolation support
  const t = (key: keyof typeof translations.mk, params?: Record<string, string | number>): string => {
    let text = translations[language][key] || key
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        text = text.replace(new RegExp(`{{${param}}}`, 'g'), String(value))
      })
    }
    return text
  }

  useEffect(() => {
    document.documentElement.lang = language
    // Keep react-i18next consumers (e.g. market and analytics pages) in sync
    // with the app-level language context used by the sidebar selector.
    if (i18next.language !== language) {
      void i18next.changeLanguage(language)
    }
  }, [language])

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}
