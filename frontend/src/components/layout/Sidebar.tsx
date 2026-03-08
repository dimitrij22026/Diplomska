import { BarChart3, Bot, CreditCard, Globe, PiggyBank, TrendingUp, User, Info, X, ChevronLeft, ChevronRight, Moon, Sun } from "lucide-react"
import { NavLink, useNavigate } from "react-router-dom"

import { useLanguage } from "../../i18n"

interface SidebarProps {
  isOpen?: boolean
  isCollapsed?: boolean
  onClose?: () => void
  onToggleCollapse?: () => void
}

export const Sidebar = ({ isOpen, isCollapsed, onClose, onToggleCollapse }: SidebarProps) => {
  const navigate = useNavigate()
  const { language, setLanguage, t } = useLanguage()

  const navItems = [
    { to: "/", label: t("overview"), icon: <BarChart3 size={18} /> },
    { to: "/transactions", label: t("transactions"), icon: <CreditCard size={18} /> },
    { to: "/budgets", label: t("budgets"), icon: <PiggyBank size={18} /> },
    { to: "/analytics", label: t("analytics"), icon: <TrendingUp size={18} /> },
    { to: "/portfolio", label: t("portfolio"), icon: <TrendingUp size={18} /> },
    { to: "/crypto", label: t("crypto"), icon: <Moon size={18} /> },
    { to: "/stocks", label: t("stocks"), icon: <Sun size={18} /> },
    { to: "/assistant", label: t("aiAdvisor"), icon: <Bot size={18} /> },
    { to: "/profile", label: t("profile"), icon: <User size={18} /> },
    { to: "/about", label: t("aboutUs"), icon: <Info size={18} /> },
  ]

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
      <div className="sidebar__brand">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="sidebar__logo">F</div>
          <div>
            <p className="sidebar__title">Finson</p>
            <p className="sidebar__subtitle">
              {t("sidebarSubtitle")}
            </p>
          </div>
        </div>
        <button className="sidebar__close-btn" onClick={onClose} aria-label="Close menu">
          <X size={20} />
        </button>
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

      <div className="sidebar__cta">
        <strong>{t("setNewLimit")}</strong>
        <p>{t("budgetAutomation")}</p>
        <button type="button" onClick={() => navigate("/budgets")}>
          {t("manageBudgets")}
        </button>
      </div>
    </aside>
  )
}
