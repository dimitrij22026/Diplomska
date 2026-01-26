import { createContext } from "react"

import type {
  LoginCredentials,
  RegistrationPayload,
  UserProfile,
} from "../api/types"

export interface AuthContextValue {
  user: UserProfile | null
  token: string | null
  loading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (payload: RegistrationPayload) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
