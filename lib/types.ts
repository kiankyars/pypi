export interface UserProfile {
  id: string
  full_name?: string
  avatar_url?: string
  age?: number
  income?: number
  monthly_expenses?: number
  risk_tolerance?: "low" | "medium" | "high"
  onboarded?: boolean
  plaid_access_token?: string
  plaid_item_id?: string
}

export interface Debt {
  id?: string
  user_id: string
  type: string
  amount: number
  interest_rate?: number
}

export interface Goal {
  id?: string
  user_id: string
  description: string
  target_age?: number
  target_amount?: number
  priority?: number
}

export interface OnboardingData {
  age: number
  income: number
  monthly_expenses: number
  debts: Array<Omit<Debt, "user_id" | "id">>
  goals: Array<Omit<Goal, "user_id" | "id">>
  risk_tolerance: "low" | "medium" | "high"
}
