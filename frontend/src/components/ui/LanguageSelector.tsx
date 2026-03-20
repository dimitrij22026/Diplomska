import { useEffect, useMemo, useRef, useState } from "react"
import { Check, ChevronDown } from "lucide-react"

import { useLanguage } from "../../i18n"
import type { Language } from "../../i18n"

interface LanguageOption {
  code: Language
  flag: string
  label: string
}

const languageOptions: LanguageOption[] = [
  { code: "en", flag: "🇺🇸", label: "English" },
  { code: "mk", flag: "🇲🇰", label: "Македонски" },
  { code: "de", flag: "🇩🇪", label: "Deutsch" },
  { code: "fr", flag: "🇫🇷", label: "Français" },
  { code: "es", flag: "🇪🇸", label: "Español" },
]

export const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!wrapperRef.current) return
      if (!wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const currentLanguage = useMemo(
    () => languageOptions.find((option) => option.code === language) ?? languageOptions[0],
    [language],
  )

  return (
    <div className="language-selector" ref={wrapperRef}>
      <button
        type="button"
        className="language-selector__trigger"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Select language"
      >
        <span className="language-selector__item-left">
          <span className="language-selector__flag" aria-hidden="true">
            {currentLanguage.flag}
          </span>
          <span className="language-selector__label">{currentLanguage.label}</span>
        </span>
        <ChevronDown size={14} className={isOpen ? "language-selector__chevron language-selector__chevron--open" : "language-selector__chevron"} />
      </button>

      {isOpen ? (
        <div className="language-selector__menu" role="menu" aria-label="Language options">
          {languageOptions.map((option) => {
            const isActive = option.code === language

            return (
              <button
                key={option.code}
                type="button"
                role="menuitemradio"
                aria-checked={isActive}
                className={isActive ? "language-selector__item language-selector__item--active" : "language-selector__item"}
                onClick={() => {
                  setLanguage(option.code)
                  setIsOpen(false)
                }}
              >
                <span className="language-selector__item-left">
                  <span className="language-selector__flag" aria-hidden="true">
                    {option.flag}
                  </span>
                  <span>{option.label}</span>
                </span>
                {isActive ? <Check size={14} /> : null}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
