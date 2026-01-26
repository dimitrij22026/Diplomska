import { useEffect, useState } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

import { apiClient } from "../../api/client"

export const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get("token")
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus("error")
        setMessage("Недостасува токен за верификација")
        return
      }

      try {
        const response = await apiClient.post<{ message: string }>("/auth/verify-email", { token })
        setStatus("success")
        setMessage(response.message)
      } catch (err) {
        setStatus("error")
        setMessage(err instanceof Error ? err.message : "Верификацијата не успеа")
      }
    }

    verifyEmail()
  }, [token])

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: "center" }}>
        {status === "loading" && (
          <>
            <Loader2 size={48} className="loader-spin" style={{ color: "var(--accent)", margin: "0 auto 1rem" }} />
            <h2>Се верифицира...</h2>
            <p className="auth-subtitle">Ве молиме почекајте</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle size={48} style={{ color: "var(--positive)", margin: "0 auto 1rem" }} />
            <h2>Email-от е потврден!</h2>
            <p className="auth-subtitle">{message}</p>
            <button
              className="primary-button"
              style={{ marginTop: "1.5rem", width: "100%" }}
              onClick={() => navigate("/auth/login")}
            >
              Продолжи кон најава
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle size={48} style={{ color: "var(--negative)", margin: "0 auto 1rem" }} />
            <h2>Верификацијата не успеа</h2>
            <p className="auth-subtitle">{message}</p>
            <button
              className="primary-button"
              style={{ marginTop: "1.5rem", width: "100%" }}
              onClick={() => navigate("/auth/login")}
            >
              Назад кон најава
            </button>
          </>
        )}
      </div>
    </div>
  )
}
