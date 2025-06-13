"use client"

import { useEffect } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase-client"
import { useRouter } from "next/navigation"

// This component handles Supabase auth state changes and redirects.
// It's a simplified example. You might want to use @supabase/auth-helpers-nextjs
// for more robust session management, especially with server components.
export default function SupabaseListener() {
  const supabase = getSupabaseBrowserClient()
  const router = useRouter()

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // console.log('Auth event:', event, session);
      // Handle redirects or UI updates based on auth state
      // For example, redirect to /login if session is null and not on an auth page
      // Or redirect to /dashboard if session exists and on landing page
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  return null
}
