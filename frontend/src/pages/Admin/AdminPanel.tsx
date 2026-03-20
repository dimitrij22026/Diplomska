import { useEffect, useState } from "react"

import { useAuth } from "../../hooks/useAuth"

type AdminUser = {
  id: number
  email: string
  role: string
  subscription_tier: string
}

export const AdminPanel = () => {
  const { token } = useAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadUsers = async () => {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const response = await fetch("/api/admin/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error(`Failed to load users (HTTP ${response.status})`)
        }

        const data = (await response.json()) as AdminUser[]
        setUsers(data)
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load users"
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    void loadUsers()
  }, [token])

  if (loading) {
    return <div>Loading admin users...</div>
  }

  if (error) {
    return <div>{error}</div>
  }

  return (
    <section>
      <h1>Admin Panel</h1>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.email} - {user.role} - {user.subscription_tier}
          </li>
        ))}
      </ul>
    </section>
  )
}
