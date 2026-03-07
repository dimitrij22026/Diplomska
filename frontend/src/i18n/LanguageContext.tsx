import {
  useState,
  useEffect,
  type ReactNode,
} from "react"
import { translations, type Language } from "./translations"
import { LanguageContext } from "./language-context"

const STORAGE_KEY = "finson.language"

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === "mk" || saved === "en") return saved
    return "mk" // Default to Macedonian
  })

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem(STORAGE_KEY, lang)
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
  }, [language])

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}
