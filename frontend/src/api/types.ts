export type TransactionType = "income" | "expense"

export interface UserProfile {
  id: number
  email: string
  full_name?: string | null
  profile_picture?: string | null
  currency: string
  monthly_income: string
  is_email_verified: boolean
  created_at: string
  updated_at: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
}

export interface TransactionPayload {
  category: string
  amount: string
  currency: string
  transaction_type: TransactionType
  occurred_at: string
  note?: string | null
}

export interface Transaction extends TransactionPayload {
  id: number
  user_id: number
  created_at: string
}

export interface BudgetGoal {
  id: number
  user_id: number
  category: string
  limit_amount: string
  period: "monthly" | "weekly" | "yearly"
  starts_on: string
  created_at: string
  updated_at: string
}

export interface MonthlyInsight {
  month: string
  total_income: string
  total_expense: string
  balance: string
  top_expense_categories: Array<{ category: string; amount: string }>
  // Previous month data for trend calculations
  prev_total_income: string
  prev_total_expense: string
  // Carryover from previous month (leftover balance)
  carryover: string
}

export interface AdviceEntry {
  id: number
  conversation_id: string
  prompt: string
  response: string
  created_at: string
}

export interface AdviceRequestPayload {
  question: string
  conversation_id?: string | null
}

export interface ConversationSummary {
  conversation_id: string
  title: string
  message_count: number
  last_message_at: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegistrationPayload extends LoginCredentials {
  full_name?: string | null
  currency?: string
  monthly_income?: string
}
