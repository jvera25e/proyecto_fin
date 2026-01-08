export interface Transaction {
  id: string
  user_id: string
  description: string
  amount: number
  category: string
  account: string
  date: string
  type: "income" | "expense"
  notes?: string
  created_at: string
  updated_at: string
}

export interface FinancialGoal {
  id: string
  user_id: string
  name: string
  target_amount: number
  current_amount: number
  deadline: string
  category: string
  priority: "high" | "medium" | "low"
  status: "active" | "completed" | "paused"
  created_at: string
  updated_at: string
}

export interface Card {
  id: string
  user_id: string
  card_number: string
  card_holder: string
  card_type: string
  expiry_date: string
  bank: string
  credit_limit?: number
  balance?: number
  created_at: string
  updated_at: string
}

export interface Budget {
  id: string
  user_id: string
  category: string
  amount: number
  spent: number
  period: "monthly" | "yearly"
  created_at: string
  updated_at: string
}

export interface Account {
  id: string
  user_id: string
  name: string
  type: "checking" | "savings" | "credit" | "investment"
  balance: number
  currency: string
  created_at: string
  updated_at: string
}
