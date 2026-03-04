import { createContext } from "react"
import type { Language, TranslationKey } from "../i18n/translations"

export interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: TranslationKey) => string
}

export const LanguageContext = createContext<LanguageContextType | null>(null)
