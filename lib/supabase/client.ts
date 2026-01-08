import { createBrowserClient as createBrowserClientSSR } from "@supabase/ssr"

let client: ReturnType<typeof createBrowserClientSSR> | null = null

export function createBrowserClient() {
  if (client) return client

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[v0] Supabase credentials not found in environment variables")
    throw new Error(
      "Supabase no está configurado. Por favor configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY",
    )
  }

  client = createBrowserClientSSR(supabaseUrl, supabaseAnonKey)
  return client
}

export function createClient() {
  return createBrowserClient()
}
