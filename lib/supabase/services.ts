import { createBrowserClient } from "./client"
import type { Transaction, FinancialGoal, Card, Budget, Account } from "./types"

// Transactions Service
export const transactionsService = {
  async getAll(): Promise<Transaction[]> {
    const supabase = createBrowserClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error("No authenticated user")

    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })

    if (error) throw error
    return data || []
  },

  async create(transaction: Omit<Transaction, "id" | "user_id" | "created_at" | "updated_at">): Promise<Transaction> {
    const supabase = createBrowserClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error("No authenticated user")

    const { data, error } = await supabase
      .from("transactions")
      .insert([{ ...transaction, user_id: user.id }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<Transaction>): Promise<Transaction> {
    const supabase = createBrowserClient()

    const { data, error } = await supabase.from("transactions").update(updates).eq("id", id).select().single()

    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const supabase = createBrowserClient()

    const { error } = await supabase.from("transactions").delete().eq("id", id)

    if (error) throw error
  },
}

// Financial Goals Service
export const goalsService = {
  async getAll(): Promise<FinancialGoal[]> {
    const supabase = createBrowserClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error("No authenticated user")

    const { data, error } = await supabase
      .from("financial_goals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  },

  async create(goal: Omit<FinancialGoal, "id" | "user_id" | "created_at" | "updated_at">): Promise<FinancialGoal> {
    const supabase = createBrowserClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error("No authenticated user")

    const { data, error } = await supabase
      .from("financial_goals")
      .insert([{ ...goal, user_id: user.id }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<FinancialGoal>): Promise<FinancialGoal> {
    const supabase = createBrowserClient()

    const { data, error } = await supabase.from("financial_goals").update(updates).eq("id", id).select().single()

    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const supabase = createBrowserClient()

    const { error } = await supabase.from("financial_goals").delete().eq("id", id)

    if (error) throw error
  },
}

// Cards Service
export const cardsService = {
  async getAll(): Promise<Card[]> {
    const supabase = createBrowserClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error("No authenticated user")

    const { data, error } = await supabase
      .from("cards")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  },

  async create(card: Omit<Card, "id" | "user_id" | "created_at" | "updated_at">): Promise<Card> {
    const supabase = createBrowserClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error("No authenticated user")

    const { data, error } = await supabase
      .from("cards")
      .insert([{ ...card, user_id: user.id }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<Card>): Promise<Card> {
    const supabase = createBrowserClient()

    const { data, error } = await supabase.from("cards").update(updates).eq("id", id).select().single()

    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const supabase = createBrowserClient()

    const { error } = await supabase.from("cards").delete().eq("id", id)

    if (error) throw error
  },
}

// Budgets Service
export const budgetsService = {
  async getAll(): Promise<Budget[]> {
    const supabase = createBrowserClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error("No authenticated user")

    const { data, error } = await supabase
      .from("budgets")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  },

  async create(budget: Omit<Budget, "id" | "user_id" | "created_at" | "updated_at">): Promise<Budget> {
    const supabase = createBrowserClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error("No authenticated user")

    const { data, error } = await supabase
      .from("budgets")
      .insert([{ ...budget, user_id: user.id }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<Budget>): Promise<Budget> {
    const supabase = createBrowserClient()

    const { data, error } = await supabase.from("budgets").update(updates).eq("id", id).select().single()

    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const supabase = createBrowserClient()

    const { error } = await supabase.from("budgets").delete().eq("id", id)

    if (error) throw error
  },
}

// Accounts Service
export const accountsService = {
  async getAll(): Promise<Account[]> {
    const supabase = createBrowserClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error("No authenticated user")

    const { data, error } = await supabase
      .from("accounts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  },

  async create(account: Omit<Account, "id" | "user_id" | "created_at" | "updated_at">): Promise<Account> {
    const supabase = createBrowserClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error("No authenticated user")

    const { data, error } = await supabase
      .from("accounts")
      .insert([{ ...account, user_id: user.id }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<Account>): Promise<Account> {
    const supabase = createBrowserClient()

    const { data, error } = await supabase.from("accounts").update(updates).eq("id", id).select().single()

    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const supabase = createBrowserClient()

    const { error } = await supabase.from("accounts").delete().eq("id", id)

    if (error) throw error
  },
}
