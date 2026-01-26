import { useState, useCallback, useEffect, useRef, type ReactNode } from "react"
import { NotificationContext, type Notification } from "./notification-context"
import { useAuth } from "../hooks/useAuth"

const STORAGE_KEY = "finmate-notifications"

function loadNotifications(): Notification[] {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return []

  try {
    return JSON.parse(stored).map((n: Notification) => ({
      ...n,
      createdAt: new Date(n.createdAt),
    }))
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return []
  }
}

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const initialized = useRef(false)
  const { user } = useAuth()
  const [hasFiredLoginNotification, setHasFiredLoginNotification] = useState(false)
  const [hasFiredRegisterNotification, setHasFiredRegisterNotification] = useState(false)

  const [notifications, setNotifications] = useState<Notification[]>(() => loadNotifications())

  // Persist notifications to localStorage
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true
      return
    }

    if (notifications.length === 0) {
      localStorage.removeItem(STORAGE_KEY)
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
    }
  }, [notifications])

  const unreadCount = notifications.filter(n => !n.read).length

  const addNotification = useCallback(
    (notification: Omit<Notification, "id" | "read" | "createdAt">) => {
      const newNotification: Notification = {
        ...notification,
        id: `${notification.type}-${Date.now()}`,
        read: false,
        createdAt: new Date(),
      }

      setNotifications(prev => [newNotification, ...prev].slice(0, 20))
    },
    []
  )

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }, [])

  const clearNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  // Fire welcome/thank-you notifications only once per session
useEffect(() => {
  if (user && !hasFiredLoginNotification) {
    queueMicrotask(() => {
      addNotification({
        type: "info",
        title: "Welcome back",
        message: `Glad to see you again, ${user.full_name ?? "user"}!`,
      })
      setHasFiredLoginNotification(true)
    })
  }

  if (user && !hasFiredRegisterNotification) {
    const createdAt = new Date(user.created_at)
    const now = new Date()
    const diffMs = now.getTime() - createdAt.getTime()
    if (diffMs < 60_000) {
      queueMicrotask(() => {
        addNotification({
          type: "success",
          title: "Thank you for joining us!",
          message: `We’re excited to have you on board, ${user.full_name ?? "user"}!`,
        })
        setHasFiredRegisterNotification(true)
      })
    }
  }
}, [user, addNotification, hasFiredLoginNotification, hasFiredRegisterNotification])

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotification,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}