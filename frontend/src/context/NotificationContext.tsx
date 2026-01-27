import { useState, useCallback, useEffect, useRef, type ReactNode } from "react"
import { NotificationContext, type Notification } from "./notification-context"
import { useAuth } from "../hooks/useAuth"

const STORAGE_KEY = "finmate-notifications"

function getStorageKey(userId?: number): string {
  return userId ? `${STORAGE_KEY}-${userId}` : STORAGE_KEY
}

function loadNotifications(userId?: number): Notification[] {
  const stored = localStorage.getItem(getStorageKey(userId))
  if (!stored) return []

  try {
    return JSON.parse(stored).map((n: Notification) => ({
      ...n,
      createdAt: new Date(n.createdAt),
    }))
  } catch {
    localStorage.removeItem(getStorageKey(userId))
    return []
  }
}

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const initialized = useRef(false)
  const { user } = useAuth()

  const [notifications, setNotifications] = useState<Notification[]>(() => loadNotifications(user?.id))

  // Clear notifications when user logs out or load user-specific notifications
  useEffect(() => {
  if (!initialized.current) return

  setTimeout(() => {
    if (!user) {
      setNotifications([])
    } else {
      setNotifications(loadNotifications(user.id))
    }
  }, 0)
}, [user])

  // Persist notifications to localStorage
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true
      return
    }

    const storageKey = getStorageKey(user?.id)
    if (notifications.length === 0) {
      localStorage.removeItem(storageKey)
    } else {
      localStorage.setItem(storageKey, JSON.stringify(notifications))
    }
  }, [notifications, user?.id])

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
    localStorage.removeItem(getStorageKey(user?.id))
  }, [user?.id])

  // Fire welcome/thank-you notifications safely
  useEffect(() => {
    if (!user || !initialized.current) return

    const fireNotifications = () => {
      // Welcome back notification - fire once per login session
      const loginKey = `has-fired-login-${user.id}`
      if (!sessionStorage.getItem(loginKey)) {
        addNotification({
          type: "info",
          title: "Welcome back",
          message: `Glad to see you again, ${user.full_name ?? "user"}!`,
        })
        sessionStorage.setItem(loginKey, 'true')
      }

      // Thank you notification - fire only once per user account
      const registerKey = `has-fired-register-${user.id}`
      if (!localStorage.getItem(registerKey)) {
        const createdAt = new Date(user.created_at)
        const now = new Date()
        if (now.getTime() - createdAt.getTime() < 60_000) {
          addNotification({
            type: "success",
            title: "Thank you for joining us!",
            message: `We’re excited to have you on board, ${user.full_name ?? "user"}!`,
          })
          localStorage.setItem(registerKey, 'true')
        }
      }
    }

    const timeoutId = setTimeout(fireNotifications, 0)
    return () => clearTimeout(timeoutId)
  }, [user, addNotification])

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