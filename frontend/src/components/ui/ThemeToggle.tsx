import { Sun, Moon, Monitor } from "lucide-react"
import { useTheme } from "../../hooks/useTheme"
import { useLanguage } from "../../i18n/useLanguage"
import "./ThemeToggle.css"

interface ThemeToggleProps {
  showLabels?: boolean;
}

export function ThemeToggle({ showLabels = false }: ThemeToggleProps) {
  const { mode, setMode } = useTheme()
  const { language } = useLanguage()

  // For the sliding background pill
  const activeIndex = mode === "light" ? 0 : mode === "dark" ? 1 : 2;

  return (
    <div 
      className={`theme-toggle-container ${showLabels ? 'with-labels' : ''}`} 
      role="group" 
      aria-label={language === "mk" ? "Избор на тема" : "Theme Selection"}
      style={{"--active-index": activeIndex} as React.CSSProperties}
    >
      <div className="theme-toggle-pill" />
      <button
        type="button"
        className={`theme-toggle-btn ${mode === "light" ? "active" : ""}`}
        onClick={() => setMode("light")}
        title={language === "mk" ? "Светла" : "Light"}
      >
        <Sun size={showLabels ? 18 : 16} />
        {showLabels && <span>{language === "mk" ? "Светла" : "Light"}</span>}
      </button>

      <button
        type="button"
        className={`theme-toggle-btn ${mode === "dark" ? "active" : ""}`}
        onClick={() => setMode("dark")}
        title={language === "mk" ? "Темна" : "Dark"}
      >
        <Moon size={showLabels ? 18 : 16} />
        {showLabels && <span>{language === "mk" ? "Темна" : "Dark"}</span>}
      </button>

      <button
        type="button"
        className={`theme-toggle-btn ${mode === "system" ? "active" : ""}`}
        onClick={() => setMode("system")}
        title={language === "mk" ? "Систем" : "System"}
      >
        <Monitor size={showLabels ? 18 : 16} />
        {showLabels && <span>{language === "mk" ? "Систем" : "System"}</span>}
      </button>
    </div>
  )
}

