import { BarChart3, Bot, CreditCard, Globe, LogOut, Moon, PiggyBank, Sun, TrendingUp, User, Monitor, Info } from "lucide-react"
import { NavLink, useNavigate } from "react-router-dom"

import { useAuth } from "../../hooks/useAuth"
import { useTheme } from "../../hooks/useTheme"
import { useLanguage } from "../../i18n"

export const Sidebar = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const { language, setLanguage, t } = useLanguage()
  const { mode, setMode } = useTheme()

  const navItems = [
    { to: "/", label: t("overview"), icon: <BarChart3 size={18} /> },
    { to: "/transactions", label: t("transactions"), icon: <CreditCard size={18} /> },
    { to: "/budgets", label: t("budgets"), icon: <PiggyBank size={18} /> },
    { to: "/analytics", label: language === "mk" ? "Аналитика" : "Analytics", icon: <TrendingUp size={18} /> },
    { to: "/portfolio", label: t("portfolio"), icon: <TrendingUp size={18} /> },
    { to: "/crypto", label: t("crypto"), icon: <Moon size={18} /> },
    { to: "/stocks", label: t("stocks"), icon: <Sun size={18} /> },
    { to: "/assistant", label: t("aiAdvisor"), icon: <Bot size={18} /> },
    { to: "/profile", label: t("profile"), icon: <User size={18} /> },
    { to: "/about", label: language === "mk" ? "За нас" : "About Us", icon: <Info size={18} /> },
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__logo">ƒ</div>
        <div>
          <p className="sidebar__title">Finson</p>
          <p className="sidebar__subtitle">
            {language === "mk" ? "AI финансиски советник" : "AI financial advisor"}
          </p>
        </div>
      </div>
      <nav className="sidebar__nav">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? "nav-link nav-link--active" : "nav-link")}>
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      
      {/* Language Switcher */}
      <div className="sidebar__language">
        <Globe size={16} />
        <button
          type="button"
          className={language === "mk" ? "lang-btn lang-btn--active" : "lang-btn"}
          onClick={() => setLanguage("mk")}
        >
          MK
        </button>
        <span className="lang-separator">|</span>
        <button
          type="button"
          className={language === "en" ? "lang-btn lang-btn--active" : "lang-btn"}
          onClick={() => setLanguage("en")}
        >
          EN
        </button>
      </div>

      <div className="sidebar__theme" role="group" aria-label={language === "mk" ? "Тема" : "Theme"}>
        <button
          type="button"
          className={mode === "light" ? "theme-btn theme-btn--active" : "theme-btn"}
          onClick={() => setMode("light")}
          title={language === "mk" ? "Светла" : "Light"}
        >
          <Sun size={16} />
          <span>{language === "mk" ? "Светла" : "Light"}</span>
        </button>
        <button
          type="button"
          className={mode === "dark" ? "theme-btn theme-btn--active" : "theme-btn"}
          onClick={() => setMode("dark")}
          title={language === "mk" ? "Темна" : "Dark"}
        >
          <Moon size={16} />
          <span>{language === "mk" ? "Темна" : "Dark"}</span>
        </button>
        <button
          type="button"
          className={mode === "system" ? "theme-btn theme-btn--active" : "theme-btn"}
          onClick={() => setMode("system")}
          title={language === "mk" ? "Систем" : "System"}
        >
          <Monitor size={16} />
          <span>{language === "mk" ? "Систем" : "System"}</span>
        </button>
      </div>
      
      <div className="sidebar__cta">
        <strong>{t("setNewLimit")}</strong>
        <p>{t("budgetAutomation")}</p>
        <button type="button" onClick={() => navigate("/budgets")}>
          {t("manageBudgets")}
        </button>
      </div>
      <button className="sidebar__logout" onClick={logout}>
        <LogOut size={18} />
        {t("logout")}
      </button>
    </aside>
  )
}
