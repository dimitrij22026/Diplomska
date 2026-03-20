import type { PropsWithChildren } from "react"
import { Navigate, useLocation } from "react-router-dom"

import { useAuth } from "../../hooks/useAuth"

export const RequireAuth = ({ children }: PropsWithChildren) => {
  const location = useLocation()
  const { token, loading } = useAuth()

  if (loading) {
    return (
      <div className="page-centered">
        <div className="loader" aria-label="Loading session" />
        <p>Checking your session…</p>
      </div>
    )
  }

  if (!token) {
    if (location.pathname === "/") {
      return <Navigate to="/welcome" replace />
    }
    return <Navigate to="/auth/login" replace state={{ from: location }} />
  }

  return children
}


export const RequireAdmin = ({ children }: PropsWithChildren) => {
  const location = useLocation()
  const { token, user, loading } = useAuth()

  if (loading) {
    return (
      <div className="page-centered">
        <div className="loader" aria-label="Loading session" />
        <p>Checking your session...</p>
      </div>
    )
  }

  if (!token) {
    return <Navigate to="/auth/login" replace state={{ from: location }} />
  }

  if (!user || user.role !== "ADMIN") {
    return <Navigate to="/" replace />
  }

  return children
}
