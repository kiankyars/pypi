"use client"
import { useState } from "react"
import type React from "react"

import { getSupabaseBrowserClient } from "@/lib/supabase-client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Chrome, Facebook, Twitter } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function SignupPage() {
  const supabase = getSupabaseBrowserClient()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        // emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`, // For email confirmation
      },
    })

    if (error) {
      toast({ title: "Signup Failed", description: error.message, variant: "destructive" })
    } else if (data.user && data.user.identities && data.user.identities.length === 0) {
      // This case might indicate email confirmation is required
      toast({
        title: "Confirmation Email Sent",
        description: "Please check your email to confirm your account.",
        variant: "default",
      })
      router.push("/auth/login") // Or a page saying "check your email"
    } else {
      toast({ title: "Signup Successful!", description: "Redirecting to onboarding..." })
      router.push("/onboard")
      router.refresh()
    }
    setLoading(false)
  }

  const handleOAuthLogin = async (provider: "google" | "twitter" | "facebook") => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })
    if (error) {
      toast({ title: "OAuth Signup Failed", description: error.message, variant: "destructive" })
      setLoading(false)
    }
    // Supabase handles redirection, on callback we can check if user needs onboarding
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create your clever account</CardTitle>
          <CardDescription>Start your journey to financial clarity.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing up..." : "Sign Up"}
            </Button>
          </form>
          <div className="mt-4 relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or sign up with</span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <Button variant="outline" onClick={() => handleOAuthLogin("google")} disabled={loading}>
              <Chrome className="mr-2 h-4 w-4" /> Google
            </Button>
            <Button variant="outline" onClick={() => handleOAuthLogin("twitter")} disabled={loading}>
              <Twitter className="mr-2 h-4 w-4" /> Twitter
            </Button>
            <Button variant="outline" onClick={() => handleOAuthLogin("facebook")} disabled={loading}>
              <Facebook className="mr-2 h-4 w-4" /> Facebook
            </Button>
          </div>
        </CardContent>
        <CardFooter className="text-center text-sm">
          <p>
            Already have an account?{" "}
            <Link href="/auth/login" className="font-medium text-primary hover:underline">
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
