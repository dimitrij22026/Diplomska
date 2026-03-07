import { useEffect, useState } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

import { apiClient } from "../../api/client"
import { useLanguage } from "../../i18n"

export const VerifyEmailPage = () => {
  const { t } = useLanguage()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get("token")
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus("error")
        setMessage(t("verifyTokenMissing"))
        return
      }

      try {
        const response = await apiClient.post<{ message: string }>("/auth/verify-email", { token })
        setStatus("success")
        setMessage(response.message)
      } catch (err) {
        setStatus("error")
        setMessage(err instanceof Error ? err.message : t("verifyFailed"))
      }
    }

    verifyEmail()
  }, [token, t])

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: "center" }}>
        {status === "loading" && (
          <>
            <Loader2 size={48} className="loader-spin" style={{ color: "var(--accent)", margin: "0 auto 1rem" }} />
            <h2>{t("verifyInProgress")}</h2>
            <p className="auth-subtitle">{t("verifyPleaseWait")}</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle size={48} style={{ color: "var(--positive)", margin: "0 auto 1rem" }} />
            <h2>{t("verifySuccessTitle")}</h2>
            <p className="auth-subtitle">{message}</p>
            <button
              className="primary-button"
              style={{ marginTop: "1.5rem", width: "100%" }}
              onClick={() => navigate("/auth/login")}
            >
              {t("verifyContinueToLogin")}
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle size={48} style={{ color: "var(--negative)", margin: "0 auto 1rem" }} />
            <h2>{t("verifyFailed")}</h2>
            <p className="auth-subtitle">{message}</p>
            <button
              className="primary-button"
              style={{ marginTop: "1.5rem", width: "100%" }}
              onClick={() => navigate("/auth/login")}
            >
              {t("verifyBackToLogin")}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
