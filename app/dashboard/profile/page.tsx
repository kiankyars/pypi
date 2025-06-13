"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { getSupabaseBrowserClient } from "@/lib/supabase-client"
import type { User } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import type { UserProfile } from "@/lib/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Upload } from "lucide-react"

export default function ProfilePage() {
  const supabase = getSupabaseBrowserClient()
  const { toast } = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Partial<UserProfile>>({})
  const [loading, setLoading] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()
      if (authUser) {
        setUser(authUser)
        const { data: userProfile, error } = await supabase.from("profiles").select("*").eq("id", authUser.id).single()
        if (userProfile) {
          setProfile(userProfile)
          if (userProfile.avatar_url) {
            // Construct public URL for avatar if stored in Supabase Storage
            const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(userProfile.avatar_url)
            setAvatarPreview(publicUrlData.publicUrl)
          }
        } else if (error && error.code !== "PGRST116") {
          // PGRST116: 0 rows
          toast({ title: "Error", description: `Failed to load profile: ${error.message}`, variant: "destructive" })
        }
      }
    }
    fetchUserData()
  }, [supabase, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setProfile((prev) => ({
      ...prev,
      [name]: type === "number" ? Number.parseFloat(value) || 0 : value,
    }))
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setLoading(true)

    let avatarPath = profile.avatar_url

    if (avatarFile) {
      const fileExt = avatarFile.name.split(".").pop()
      const filePath = `${user.id}/${Math.random()}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, avatarFile, { upsert: true })

      if (uploadError) {
        toast({ title: "Avatar Upload Failed", description: uploadError.message, variant: "destructive" })
        setLoading(false)
        return
      }
      avatarPath = filePath
    }

    const updates = {
      ...profile,
      id: user.id, // Ensure ID is set for upsert
      full_name: profile.full_name,
      avatar_url: avatarPath,
      // Add other fields from UserProfile type that are editable here
      age: profile.age,
      income: profile.income,
      monthly_expenses: profile.monthly_expenses,
      risk_tolerance: profile.risk_tolerance,
      updated_at: new Date().toISOString(),
    }

    // Use upsert to create profile if it doesn't exist, or update if it does
    const { error } = await supabase.from("profiles").upsert(updates).select().single()

    if (error) {
      toast({ title: "Profile Update Failed", description: error.message, variant: "destructive" })
    } else {
      toast({ title: "Profile Updated Successfully!" })
      if (avatarPath && avatarPath !== profile.avatar_url) {
        // if new avatar was uploaded
        const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(avatarPath)
        setAvatarPreview(publicUrlData.publicUrl)
      }
    }
    setLoading(false)
  }

  if (!user) return <div className="flex items-center justify-center min-h-screen">Loading...</div>

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Your Profile</CardTitle>
        <CardDescription>Manage your personal information and preferences.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center space-y-2">
            <Avatar className="h-24 w-24">
              <AvatarImage
                src={avatarPreview || user.user_metadata?.avatar_url}
                alt={profile.full_name || user.email}
              />
              <AvatarFallback>{(profile.full_name || user.email || "U").charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <Input id="avatar" type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => document.getElementById("avatar")?.click()}
            >
              <Upload className="mr-2 h-4 w-4" /> Change Avatar
            </Button>
          </div>

          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" name="full_name" type="text" value={profile.full_name || ""} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="email">Email (Cannot be changed here)</Label>
            <Input id="email" type="email" value={user.email || ""} disabled />
          </div>
          <div>
            <Label htmlFor="age">Age</Label>
            <Input id="age" name="age" type="number" value={profile.age || ""} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="income">Annual Income (USD)</Label>
            <Input id="income" name="income" type="number" value={profile.income || ""} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="monthly_expenses">Average Monthly Expenses (USD)</Label>
            <Input
              id="monthly_expenses"
              name="monthly_expenses"
              type="number"
              value={profile.monthly_expenses || ""}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="risk_tolerance">Risk Tolerance</Label>
            <select
              id="risk_tolerance"
              name="risk_tolerance"
              value={profile.risk_tolerance || "medium"}
              onChange={handleChange}
              className="w-full p-2 border rounded bg-background"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : "Save Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
