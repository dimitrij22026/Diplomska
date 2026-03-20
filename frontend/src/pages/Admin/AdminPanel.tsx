import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Activity, Crown, Lock, Shield, Users } from "lucide-react"

import { apiClient } from "../../api/client"
import type { AdminStatsResponse, AdminStepUpResponse, UserProfile } from "../../api/types"
import { useAuth } from "../../hooks/useAuth"

type AdminUser = UserProfile

const STEP_UP_STORAGE_KEY = "finance-app.admin-step-up"
const ADMIN_IDLE_TIMEOUT_MS = 15 * 60 * 1000
const PAGE_SIZE = 10

type StoredStepUp = {
  token: string
  expiresAt: string
}

const readStoredStepUp = (): StoredStepUp | null => {
  try {
    const raw = sessionStorage.getItem(STEP_UP_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredStepUp
    if (!parsed.token || !parsed.expiresAt) return null
    return parsed
  } catch {
    return null
  }
}

const writeStoredStepUp = (payload: StoredStepUp) => {
  sessionStorage.setItem(STEP_UP_STORAGE_KEY, JSON.stringify(payload))
}

const clearStoredStepUp = () => {
  sessionStorage.removeItem(STEP_UP_STORAGE_KEY)
}

const userInitial = (entry: AdminUser): string => {
  const source = entry.full_name?.trim() || entry.email
  return source.charAt(0).toUpperCase()
}

export const AdminPanel = () => {
  const { token, user } = useAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [stats, setStats] = useState<AdminStatsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null)
  const [stepUpToken, setStepUpToken] = useState<string | null>(() => readStoredStepUp()?.token ?? null)
  const [stepUpExpiresAt, setStepUpExpiresAt] = useState<string | null>(
    () => readStoredStepUp()?.expiresAt ?? null,
  )
  const [reauthPassword, setReauthPassword] = useState("")
  const [reauthPin, setReauthPin] = useState("")
  const [reauthSubmitting, setReauthSubmitting] = useState(false)
  const [reauthError, setReauthError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [deleting, setDeleting] = useState(false)
  const lastActivityRef = useRef<number>(Date.now())

  const isStepUpValid = useMemo(() => {
    if (!stepUpToken || !stepUpExpiresAt) return false
    return new Date(stepUpExpiresAt).getTime() > Date.now()
  }, [stepUpToken, stepUpExpiresAt])

  const lockAdminArea = useCallback((reason?: string) => {
    clearStoredStepUp()
    setStepUpToken(null)
    setStepUpExpiresAt(null)
    if (reason) {
      setReauthError(reason)
    }
  }, [])

  const getStepUpHeaders = useCallback(() => {
    return stepUpToken ? { "X-Admin-Step-Up-Token": stepUpToken } : undefined
  }, [stepUpToken])

  const loadAdminData = useCallback(async () => {
    if (!token || !isStepUpValid) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const [usersData, statsData] = await Promise.all([
        apiClient.get<AdminUser[]>("/admin/users", { token, headers: getStepUpHeaders() }),
        apiClient.get<AdminStatsResponse>("/admin/stats", { token, headers: getStepUpHeaders() }),
      ])
      setUsers(usersData)
      setStats(statsData)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load admin data"
      setError(message)
      if (message.toLowerCase().includes("step-up") || message.toLowerCase().includes("token")) {
        lockAdminArea("Security session expired. Please re-authenticate.")
      }
    } finally {
      setLoading(false)
    }
  }, [getStepUpHeaders, isStepUpValid, lockAdminArea, token])

  useEffect(() => {
    if (!isStepUpValid) {
      lockAdminArea()
      return
    }
    void loadAdminData()
  }, [isStepUpValid, loadAdminData, lockAdminArea])

  useEffect(() => {
    if (!isStepUpValid) return

    const updateLastActivity = () => {
      lastActivityRef.current = Date.now()
    }

    const intervalId = window.setInterval(() => {
      const idleFor = Date.now() - lastActivityRef.current
      if (idleFor >= ADMIN_IDLE_TIMEOUT_MS) {
        lockAdminArea("Admin privileges expired after 15 minutes of inactivity.")
      }
    }, 10_000)

    window.addEventListener("mousemove", updateLastActivity)
    window.addEventListener("keydown", updateLastActivity)
    window.addEventListener("click", updateLastActivity)
    window.addEventListener("scroll", updateLastActivity)
    window.addEventListener("touchstart", updateLastActivity)

    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener("mousemove", updateLastActivity)
      window.removeEventListener("keydown", updateLastActivity)
      window.removeEventListener("click", updateLastActivity)
      window.removeEventListener("scroll", updateLastActivity)
      window.removeEventListener("touchstart", updateLastActivity)
    }
  }, [isStepUpValid, lockAdminArea])

  const submitStepUp = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!token) return

    try {
      setReauthSubmitting(true)
      setReauthError(null)
      const payload: { password?: string; pin?: string } = {}
      if (reauthPassword.trim()) {
        payload.password = reauthPassword
      }
      if (reauthPin.trim()) {
        payload.pin = reauthPin
      }
      const response = await apiClient.post<AdminStepUpResponse>("/admin/step-up-verify", payload, { token })
      setStepUpToken(response.step_up_token)
      setStepUpExpiresAt(response.expires_at)
      writeStoredStepUp({ token: response.step_up_token, expiresAt: response.expires_at })
      setReauthPassword("")
      setReauthPin("")
      lastActivityRef.current = Date.now()
      await loadAdminData()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Re-authentication failed"
      setReauthError(message)
    } finally {
      setReauthSubmitting(false)
    }
  }

  const promoteUser = async (userId: number) => {
    if (!token || !stepUpToken) return

    try {
      setUpdatingUserId(userId)
      await apiClient.patch<AdminUser>(`/admin/users/${userId}`, { role: "ADMIN" }, { token, headers: getStepUpHeaders() })
      await loadAdminData()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to promote user"
      setError(message)
    } finally {
      setUpdatingUserId(null)
    }
  }

  const requestDeleteUser = (target: AdminUser) => {
    setDeleteTarget(target)
    setDeleteConfirmText("")
  }

  const confirmDeleteUser = async () => {
    if (!token || !stepUpToken || !deleteTarget) return

    try {
      setDeleting(true)
      await apiClient.delete(`/admin/users/${deleteTarget.id}`, { token, headers: getStepUpHeaders() })
      setDeleteTarget(null)
      setDeleteConfirmText("")
      await loadAdminData()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete user"
      setError(message)
    } finally {
      setDeleting(false)
    }
  }

  const filteredUsers = useMemo(() => {
    const normalized = search.trim().toLowerCase()
    if (!normalized) return users
    return users.filter((entry) => {
      const name = entry.full_name?.toLowerCase() ?? ""
      return (
        entry.email.toLowerCase().includes(normalized) ||
        name.includes(normalized) ||
        entry.subscription_tier.toLowerCase().includes(normalized) ||
        entry.role.toLowerCase().includes(normalized)
      )
    })
  }, [search, users])

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE))
  const pagedUsers = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filteredUsers.slice(start, start + PAGE_SIZE)
  }, [filteredUsers, page])

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  if (!isStepUpValid) {
    return (
      <div className="admin-gate-overlay">
        <form className="admin-gate" onSubmit={submitStepUp}>
          <div className="admin-gate__icon">
            <Lock size={18} />
          </div>
          <p className="admin-gate__eyebrow">Step-Up Authentication</p>
          <h2>Double-Lock Verification</h2>
          <p>Re-enter your password or admin PIN to access this restricted environment.</p>
          <label htmlFor="admin-password">Password</label>
          <input
            id="admin-password"
            type="password"
            value={reauthPassword}
            onChange={(event) => setReauthPassword(event.target.value)}
            placeholder="Enter account password"
            autoComplete="current-password"
            className="admin-input"
          />
          <label htmlFor="admin-pin">Admin PIN (optional)</label>
          <input
            id="admin-pin"
            type="password"
            value={reauthPin}
            onChange={(event) => setReauthPin(event.target.value)}
            placeholder="Enter admin PIN"
            autoComplete="one-time-code"
            className="admin-input"
          />
          {reauthError && <div className="admin-gate__error">{reauthError}</div>}
          <button
            type="submit"
            disabled={reauthSubmitting || (!reauthPassword.trim() && !reauthPin.trim())}
            className="admin-btn admin-btn--primary"
          >
            {reauthSubmitting ? "Validating..." : "Unlock Admin Center"}
          </button>
        </form>
      </div>
    )
  }

  return (
    <section className="admin-command-center">
      {error && <div className="admin-alert">{error}</div>}

      <div className="admin-stats-grid">
        <article className="admin-stat-card">
          <div className="admin-stat-card__icon">
            <Users size={16} />
          </div>
          <p>Total Users</p>
          <h3>{stats?.total_users ?? "-"}</h3>
        </article>
        <article className="admin-stat-card">
          <div className="admin-stat-card__icon">
            <Crown size={16} />
          </div>
          <p>Revenue / Tiers</p>
          <h3>
            PRO {stats?.tiers.pro ?? 0} / FREE {stats?.tiers.free ?? 0}
          </h3>
          <small>Premium: {stats?.tiers.premium ?? 0}</small>
        </article>
        <article className="admin-stat-card">
          <div className="admin-stat-card__icon">
            <Activity size={16} />
          </div>
          <p>System Health</p>
          <h3>
            <span className="admin-status-dot" />
            {stats?.system_health ?? "Operational"}
          </h3>
          <small>API Latency: {stats?.api_latency_ms ?? 0} ms</small>
        </article>
        <article className="admin-stat-card">
          <div className="admin-stat-card__icon">
            <Shield size={16} />
          </div>
          <p>Secure Scope</p>
          <h3>Step-Up</h3>
          <small>15-minute inactivity lock enabled</small>
        </article>
      </div>

      <div className="admin-table-wrap">
        <div className="admin-table-toolbar">
          <h2>User Access Control</h2>
          <input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            placeholder="Search by email, name, tier, role"
          />
        </div>

        {loading ? (
          <div className="admin-loading">Loading secure user registry...</div>
        ) : (
          <>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Subscription Tier</th>
                  <th>Last Login</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pagedUsers.map((entry) => {
                  const isCurrentUser = user?.id === entry.id
                  const canDelete = !isCurrentUser && entry.role !== "ADMIN"
                  return (
                    <tr key={entry.id}>
                      <td>
                        <div className="admin-user-cell">
                          <div className="admin-user-avatar">{userInitial(entry)}</div>
                          <span className="admin-user-email" title={entry.email}>
                            {entry.email}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`pill pill--role ${entry.role === "ADMIN" ? "pill--admin" : "pill--user"}`}>
                          {entry.role}
                        </span>
                      </td>
                      <td>
                        <span className={`pill pill--tier pill--tier-${entry.subscription_tier.toLowerCase()}`}>
                          {entry.subscription_tier}
                        </span>
                      </td>
                      <td>{entry.last_login_at ? new Date(entry.last_login_at).toLocaleString() : "Never"}</td>
                      <td>
                        <span className={entry.is_banned ? "status-badge status-badge--banned" : "status-badge status-badge--active"}>
                          {entry.is_banned ? "Banned" : "Active"}
                        </span>
                      </td>
                      <td>
                        <div className="admin-actions">
                          {entry.role !== "ADMIN" ? (
                            <button
                              type="button"
                              onClick={() => promoteUser(entry.id)}
                              disabled={updatingUserId === entry.id}
                              className="admin-btn admin-btn--ghost"
                            >
                              {updatingUserId === entry.id ? "Promoting..." : "Promote User"}
                            </button>
                          ) : (
                            <span className="admin-muted">Admin account</span>
                          )}
                          <button
                            type="button"
                            onClick={() => requestDeleteUser(entry)}
                            disabled={!canDelete}
                            className="admin-btn admin-btn--danger"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {pagedUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="admin-empty">
                      No users matched your search query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="admin-pagination">
              <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page <= 1}>
                Previous
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={page >= totalPages}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>

      {deleteTarget && (
        <div className="admin-modal-backdrop" role="presentation">
          <div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="delete-user-title">
            <h3 id="delete-user-title">Delete User</h3>
            <p>
              This action is permanent. To confirm, type the user email exactly:
              <strong> {deleteTarget.email}</strong>
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(event) => setDeleteConfirmText(event.target.value)}
              placeholder="Type email to confirm"
            />
            <div className="admin-modal__actions">
              <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="admin-btn admin-btn--danger"
                onClick={() => void confirmDeleteUser()}
                disabled={deleting || deleteConfirmText.trim() !== deleteTarget.email}
              >
                {deleting ? "Deleting..." : "Delete User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
