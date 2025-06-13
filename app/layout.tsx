import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import SupabaseListener from "@/components/supabase-listener"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "clever - Your Everyday Financial LLM Assistant",
  description:
    "AI-powered financial guidance that helps you make smarter money decisions. Get personalized help on savings, investments, and debt management.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SupabaseListener />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
