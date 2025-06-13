import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"

// Define a type for our database schema if you have one.
// Or use `any` if you don't have a specific schema.
// You can generate types from your Supabase schema: https://supabase.com/docs/guides/api/generating-types
export type Database = any // Replace with your generated types

let client: SupabaseClient<Database> | undefined

export function getSupabaseBrowserClient() {
  if (client) {
    return client
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase URL and/or anonymous key not found. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your .env.local file and that you have restarted your development server.",
    )
  }

  client = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)

  return client
}

// For server-side Supabase client (e.g., in API routes or Server Actions)
// You might need a different setup if using service_role key
// import { createServerClient, type CookieOptions } from '@supabase/ssr'
// import { cookies } from 'next/headers'
// export function getSupabaseServerClient() {
//   const cookieStore = cookies()
//   return createServerClient<Database>(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         get(name: string) {
//           return cookieStore.get(name)?.value
//         },
//       },
//     }
//   )
// }
