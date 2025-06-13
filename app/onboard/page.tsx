"use client"
// This will be a multi-step form.
import type React from "react"

// For brevity, I'll sketch out the structure.
// You'd typically use a state management library like Zustand or React Context for complex forms.
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import type { OnboardingData } from "@/lib/types"
import type { User } from "@supabase/supabase-js"
import PlaidLinkButton from "@/components/onboarding/plaid-link-button" // Create this component

// Placeholder for PlaidLink component
// import { usePlaidLink, PlaidLinkOptions } from 'react-plaid-link';

const initialOnboardingData: OnboardingData = {
  age: 0,
  income: 0,
  monthly_expenses: 0,
  debts: [],
  goals: [],
  risk_tolerance: "medium",
}

export default function OnboardingPage() {
  const supabase = getSupabaseBrowserClient()
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<OnboardingData>(initialOnboardingData)
  const [loading, setLoading] = useState(false)
  const [plaidLinked, setPlaidLinked] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) router.push("/auth/login")
      else setUser(user)
    }
    fetchUser()
  }, [supabase, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number.parseFloat(value) || 0 : value,
    }))
  }

  // Simplified debt/goal handling for demo
  const addDebt = () =>
    setFormData((prev) => ({ ...prev, debts: [...prev.debts, { type: "", amount: 0, interest_rate: 0 }] }))
  const addGoal = () =>
    setFormData((prev) => ({ ...prev, goals: [...prev.goals, { description: "", target_amount: 0 }] }))

  const handlePlaidSuccess = (public_token: string, metadata: any) => {
    // console.log('Plaid public token:', public_token, metadata);
    // Send public_token to your server to exchange for access_token
    // For demo, just mark as linked
    setPlaidLinked(true)
    toast({ title: "Plaid Linked Successfully!", description: "Your accounts are being synced." })
    // In a real app, you'd call an API route here:
    // await fetch('/api/plaid/exchange-public-token', { method: 'POST', body: JSON.stringify({ public_token }) });
  }

  const handlePlaidExit = (error: any, metadata: any) => {
    if (error) {
      toast({ title: "Plaid Linking Error", description: error.message, variant: "destructive" })
    }
    // console.log('Plaid exit:', error, metadata);
  }

  const handleSubmit = async () => {
    if (!user) return
    setLoading(true)
    try {
      // 1. Update profile table
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          age: formData.age,
          income: formData.income,
          monthly_expenses: formData.monthly_expenses,
          risk_tolerance: formData.risk_tolerance,
          onboarded: true,
          // plaid_access_token and plaid_item_id would be set by the /api/plaid/exchange-public-token route
        })
        .eq("id", user.id)

      if (profileError) throw profileError

      // 2. Insert debts (clear existing ones for simplicity in demo, or handle updates)
      await supabase.from("debts").delete().eq("user_id", user.id)
      if (formData.debts.length > 0) {
        const debtsToInsert = formData.debts.map((d) => ({ ...d, user_id: user.id }))
        const { error: debtsError } = await supabase.from("debts").insert(debtsToInsert)
        if (debtsError) throw debtsError
      }

      // 3. Insert goals
      await supabase.from("goals").delete().eq("user_id", user.id)
      if (formData.goals.length > 0) {
        const goalsToInsert = formData.goals.map((g) => ({ ...g, user_id: user.id }))
        const { error: goalsError } = await supabase.from("goals").insert(goalsToInsert)
        if (goalsError) throw goalsError
      }

      toast({ title: "Onboarding Complete!", description: "Welcome to clever! Redirecting to dashboard..." })
      router.push("/dashboard")
      router.refresh()
    } catch (error: any) {
      console.error("Onboarding error:", error)
      toast({ title: "Onboarding Failed", description: error.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  if (!user) return <div className="flex items-center justify-center min-h-screen">Loading user...</div>

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome to clever, {user.user_metadata?.full_name || user.email}!</CardTitle>
          <CardDescription>Let's get to know your financial situation. (Step {step} of 4)</CardDescription>
          {/* Progress Bar Placeholder */}
          <div className="w-full bg-muted rounded-full h-2.5 mt-2">
            <div className="bg-primary h-2.5 rounded-full" style={{ width: `${(step / 4) * 100}%` }}></div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Basic Information (US Users Only)</h3>
              <div>
                <Label htmlFor="age">Age (Optional)</Label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  value={formData.age || ""}
                  onChange={handleChange}
                  placeholder="e.g., 30"
                />
              </div>
              <div>
                <Label htmlFor="income">Annual Income (USD, Optional)</Label>
                <Input
                  id="income"
                  name="income"
                  type="number"
                  value={formData.income || ""}
                  onChange={handleChange}
                  placeholder="e.g., 75000"
                />
              </div>
              <div>
                <Label htmlFor="monthly_expenses">Average Monthly Expenses (USD, Optional)</Label>
                <Input
                  id="monthly_expenses"
                  name="monthly_expenses"
                  type="number"
                  value={formData.monthly_expenses || ""}
                  onChange={handleChange}
                  placeholder="e.g., 3000"
                />
              </div>
              <Button onClick={() => setStep(2)} className="w-full">
                Next
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Link Financial Accounts (via Plaid)</h3>
              <p className="text-sm text-muted-foreground">
                Securely connect your bank accounts to get personalized advice. This helps clever understand your cash
                flow and balances.
              </p>
              <PlaidLinkButton onSuccess={handlePlaidSuccess} onExit={handlePlaidExit} userId={user.id} />
              {plaidLinked && <p className="text-green-600">Accounts linked successfully!</p>}
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button onClick={() => setStep(3)} className="w-1/2" disabled={!plaidLinked}>
                  Next (Skip if no accounts)
                </Button>
              </div>
              <Button variant="link" onClick={() => setStep(3)} className="w-full text-sm">
                Skip Plaid Linking
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Debts & Goals (Optional)</h3>
              {/* Simplified UI for debts and goals */}
              <div>
                <Label>Debts (e.g., Credit Card, Student Loan)</Label>
                {formData.debts.map((debt, index) => (
                  <div key={index} className="flex gap-2 my-1">
                    <Input
                      type="text"
                      placeholder="Type (e.g. Visa)"
                      value={debt.type}
                      onChange={(e) => {
                        const newDebts = [...formData.debts]
                        newDebts[index].type = e.target.value
                        setFormData((f) => ({ ...f, debts: newDebts }))
                      }}
                    />
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={debt.amount || ""}
                      onChange={(e) => {
                        const newDebts = [...formData.debts]
                        newDebts[index].amount = Number.parseFloat(e.target.value)
                        setFormData((f) => ({ ...f, debts: newDebts }))
                      }}
                    />
                    <Input
                      type="number"
                      placeholder="Interest Rate %"
                      value={debt.interest_rate || ""}
                      onChange={(e) => {
                        const newDebts = [...formData.debts]
                        newDebts[index].interest_rate = Number.parseFloat(e.target.value)
                        setFormData((f) => ({ ...f, debts: newDebts }))
                      }}
                    />
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addDebt}>
                  + Add Debt
                </Button>
              </div>
              <div>
                <Label>Financial Goals (e.g., Retirement, Buy House)</Label>
                {formData.goals.map((goal, index) => (
                  <div key={index} className="flex gap-2 my-1">
                    <Input
                      type="text"
                      placeholder="Description (e.g. Retire by 60)"
                      value={goal.description}
                      onChange={(e) => {
                        const newGoals = [...formData.goals]
                        newGoals[index].description = e.target.value
                        setFormData((f) => ({ ...f, goals: newGoals }))
                      }}
                    />
                    <Input
                      type="number"
                      placeholder="Target Amount (Optional)"
                      value={goal.target_amount || ""}
                      onChange={(e) => {
                        const newGoals = [...formData.goals]
                        newGoals[index].target_amount = Number.parseFloat(e.target.value)
                        setFormData((f) => ({ ...f, goals: newGoals }))
                      }}
                    />
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addGoal}>
                  + Add Goal
                </Button>
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button onClick={() => setStep(4)} className="w-1/2">
                  Next
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Risk Tolerance</h3>
              <div>
                <Label htmlFor="risk_tolerance">How would you describe your investment risk tolerance?</Label>
                <select
                  id="risk_tolerance"
                  name="risk_tolerance"
                  value={formData.risk_tolerance}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="low">Low (Prefer safety, lower potential returns)</option>
                  <option value="medium">Medium (Balanced approach to risk and return)</option>
                  <option value="high">High (Willing to take more risk for higher potential returns)</option>
                </select>
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(3)}>
                  Back
                </Button>
                <Button onClick={handleSubmit} className="w-1/2" disabled={loading}>
                  {loading ? "Saving..." : "Complete Onboarding"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
