import { useEffect, useMemo, useState, type ReactNode } from "react"

import { ThemeContext, type ThemeMode } from "./theme-context"

const STORAGE_KEY = "finson.theme"

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "dark"
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function applyTheme(theme: "light" | "dark") {
  document.documentElement.setAttribute("data-theme", theme)
}

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === "light" || saved === "dark" || saved === "system") return saved
    return "system"
  })

  const resolvedTheme = useMemo<"light" | "dark">(() => {
    return mode === "system" ? getSystemTheme() : mode
  }, [mode])

  const setMode = (nextMode: ThemeMode) => {
    setModeState(nextMode)
    localStorage.setItem(STORAGE_KEY, nextMode)
  }

  useEffect(() => {
    applyTheme(resolvedTheme)
  }, [resolvedTheme])

  useEffect(() => {
    if (mode !== "system") return
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const onChange = () => applyTheme(getSystemTheme())

    mediaQuery.addEventListener("change", onChange)
    return () => mediaQuery.removeEventListener("change", onChange)
  }, [mode])

  return <ThemeContext.Provider value={{ mode, resolvedTheme, setMode }}>{children}</ThemeContext.Provider>
}
