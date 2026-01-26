import { Search } from "lucide-react"
import { format } from "date-fns"
import { mk, enUS } from "date-fns/locale"

import { useAuth } from "../../hooks/useAuth"
import { useSearch } from "../../context/SearchContext"
import { useLanguage } from "../../i18n"
import { NotificationDropdown } from "./NotificationDropdown"

export const TopBar = () => {
  const { user } = useAuth()
  const { searchTerm, handleSearch } = useSearch()
  const { language, t } = useLanguage()

  const dateLocale = language === "mk" ? mk : enUS
  const dateFormat = language === "mk" ? "dd.MM.yyyy" : "MM/dd/yyyy"

  return (
    <header className="topbar">
      <div>
        <p className="topbar__title">{t("welcomeBack")}</p>
        <p className="topbar__greeting">{user?.full_name ?? user?.email}</p>
        <p className="topbar__date">{format(new Date(), dateFormat, { locale: dateLocale })}</p>
      </div>
      <div className="topbar__actions">
        <div className="topbar__search">
          <Search size={18} />
          <input
            placeholder={t("searchTransactions")}
            aria-label="Search"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <NotificationDropdown />
        <div className="topbar__badge">{user?.currency ?? "EUR"}</div>
      </div>
    </header>
  )
}
