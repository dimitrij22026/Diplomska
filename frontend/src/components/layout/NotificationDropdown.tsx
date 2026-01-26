import { useState, useRef, useEffect } from "react"
import { Bell, Check, Trash2, AlertTriangle, Info, CheckCircle, PiggyBank, X } from "lucide-react"
import { useNotifications } from "../../hooks/useNotifications"
import { useLanguage } from "../../i18n"
import type { NotificationType } from "../../context/notification-context"

const getIcon = (type: NotificationType) => {
  switch (type) {
    case "warning":
      return <AlertTriangle size={16} className="notification-icon notification-icon--warning" />
    case "success":
      return <CheckCircle size={16} className="notification-icon notification-icon--success" />
    case "budget":
      return <PiggyBank size={16} className="notification-icon notification-icon--budget" />
    default:
      return <Info size={16} className="notification-icon notification-icon--info" />
  }
}

const formatTimeAgo = (date: Date, language: string): string => {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) {
    return language === "mk" ? "Сега" : "Just now"
  }
  if (diffMins < 60) {
    return language === "mk" ? `Пред ${diffMins} мин` : `${diffMins}m ago`
  }
  if (diffHours < 24) {
    return language === "mk" ? `Пред ${diffHours} ч` : `${diffHours}h ago`
  }
  return language === "mk" ? `Пред ${diffDays} ден` : `${diffDays}d ago`
}

export const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotification, clearAll } = useNotifications()
  const { language } = useLanguage()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleNotificationClick = (id: string) => {
    markAsRead(id)
  }

  return (
    <div className="notification-dropdown" ref={dropdownRef}>
      <button 
        className="ghost-button notification-bell" 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-panel">
          <div className="notification-header">
            <h3>{language === "mk" ? "Известувања" : "Notifications"}</h3>
            <div className="notification-actions">
              {unreadCount > 0 && (
                <button 
                  className="notification-action-btn" 
                  onClick={markAllAsRead}
                  title={language === "mk" ? "Означи сè како прочитано" : "Mark all as read"}
                >
                  <Check size={14} />
                </button>
              )}
              {notifications.length > 0 && (
                <button 
                  className="notification-action-btn" 
                  onClick={clearAll}
                  title={language === "mk" ? "Избриши сè" : "Clear all"}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="notification-empty">
                <Bell size={32} />
                <p>{language === "mk" ? "Нема известувања" : "No notifications"}</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`notification-item ${notification.read ? "" : "notification-item--unread"}`}
                  onClick={() => handleNotificationClick(notification.id)}
                >
                  <div className="notification-item__icon">
                    {getIcon(notification.type)}
                  </div>
                  <div className="notification-item__content">
                    <p className="notification-item__title">{notification.title}</p>
                    <p className="notification-item__message">{notification.message}</p>
                    <span className="notification-item__time">
                      {formatTimeAgo(notification.createdAt, language)}
                    </span>
                  </div>
                  <button 
                    className="notification-item__close"
                    onClick={(e) => {
                      e.stopPropagation()
                      clearNotification(notification.id)
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
