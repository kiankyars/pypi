// For Supabase OAuth callback
import { NextResponse, type NextRequest } from "next/server"
import { cookies } from "next/headers"
import { createServerClient, type CookieOptions } from "@supabase/ssr"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get("next") ?? "/dashboard" // Default to dashboard

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.delete({ name, ...options })
          },
        },
      },
    )
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Check if user is new or needs onboarding
      const { data: profile } = await supabase.from("profiles").select("onboarded").eq("id", data.user.id).single()

      if (profile && profile.onboarded) {
        return NextResponse.redirect(`${origin}${next}`)
      } else {
        // New user or not onboarded, redirect to onboarding
        return NextResponse.redirect(`${origin}/onboard`)
      }
    } else {
      console.error("OAuth callback error:", error)
      // Redirect to an error page or login page with an error message
      return NextResponse.redirect(`${origin}/auth/login?error=OAuth_callback_failed`)
    }
  }

  // return the user to an error page with instructions
  console.error("OAuth callback: No code found")
  return NextResponse.redirect(`${origin}/auth/login?error=OAuth_no_code`)
}
