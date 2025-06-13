"use client"
import Navbar from "@/components/global/navbar"
import type React from "react"
import BottomNav from "@/components/dashboard/bottom-nav"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase-client"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    const checkAuthAndOnboarding = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session?.user) {
        router.push("/auth/login")
        return
      }
      // Check if user is onboarded
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("onboarded")
        .eq("id", session.user.id)
        .single()

      if (error && error.code !== "PGRST116") {
        // PGRST116: 0 rows, means no profile yet
        console.error("Error fetching profile:", error)
        // Handle error, maybe redirect to an error page or login
        router.push("/auth/login")
        return
      }

      if (!profile || !profile.onboarded) {
        router.push("/onboard")
      }
    }
    checkAuthAndOnboarding()
  }, [supabase, router])

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8 mb-16 md:mb-0">
        {" "}
        {/* mb for bottom nav */}
        {children}
      </main>
      <BottomNav />
      {/* Footer might be optional in dashboard view or simplified */}
      {/* <Footer /> */}
    </div>
  )
}
