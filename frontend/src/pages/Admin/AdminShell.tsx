import { ArrowLeft, LockKeyhole, ShieldOff } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { useAuth } from "../../hooks/useAuth"
import { AdminPanel } from "./AdminPanel"

export const AdminShell = () => {
  const navigate = useNavigate()
  const { logout } = useAuth()

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <button type="button" className="admin-btn admin-btn--ghost" onClick={() => navigate("/")}>
          <ArrowLeft size={16} />
          Back to Main App
        </button>
        <div className="admin-header__title-wrap">
          <h1>Admin Command Center</h1>
          <p className="admin-header__secure-state">
            <LockKeyhole size={14} />
            Secure Session Active
          </p>
        </div>
        <button
          type="button"
          className="admin-btn admin-btn--danger"
          onClick={() => {
            sessionStorage.removeItem("finance-app.admin-step-up")
            logout()
          }}
        >
          <ShieldOff size={16} />
          Terminal Exit
        </button>
      </header>
      <div className="admin-shell__content">
        <div className="admin-shell__badge">
          <LockKeyhole size={16} />
          High-security controls are active
        </div>
        <AdminPanel />
      </div>
    </div>
  )
}
