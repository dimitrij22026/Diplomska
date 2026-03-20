import { Link } from "react-router-dom"

type UserStatusBannerProps = {
  isEmailVerified: boolean
  profilePath?: string
}

export const UserStatusBanner = ({
  isEmailVerified,
  profilePath = "/profile",
}: UserStatusBannerProps) => {
  if (isEmailVerified) {
    return null
  }

  return (
    <div className="user-status-banner" role="alert" aria-live="polite">
      <p className="user-status-banner__message">
        Complete your profile! Please verify your email to unlock Transactions and AI features.
      </p>
      <Link className="primary-button user-status-banner__action" to={profilePath}>
        Go to Profile
      </Link>
    </div>
  )
}