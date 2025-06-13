"use client"
import { useEffect, useState, useCallback } from "react"
import { usePlaidLink, type PlaidLinkOnSuccess } from "react-plaid-link"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

interface PlaidLinkButtonProps {
  onSuccess: PlaidLinkOnSuccess
  onExit: (error: any, metadata: any) => void
  userId: string // To associate the link token with the user
}

export default function PlaidLinkButton({ onSuccess, onExit, userId }: PlaidLinkButtonProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null)
  const { toast } = useToast()

  const generateToken = useCallback(async () => {
    try {
      const response = await fetch("/api/plaid/create-link-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }), // Send userId to server
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create link token")
      }
      const data = await response.json()
      setLinkToken(data.link_token)
    } catch (error: any) {
      console.error("Error generating Plaid link token:", error)
      toast({
        title: "Plaid Error",
        description: `Could not initialize Plaid: ${error.message}`,
        variant: "destructive",
      })
    }
  }, [userId, toast])

  useEffect(() => {
    if (!linkToken) {
      generateToken()
    }
  }, [linkToken, generateToken])

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess,
    onExit,
    // onEvent: (eventName, metadata) => console.log('Plaid event:', eventName, metadata),
  })

  return (
    <Button onClick={() => open()} disabled={!ready || !linkToken} className="w-full">
      {linkToken ? (ready ? "Connect Bank Accounts" : "Initializing Plaid...") : "Loading Plaid..."}
    </Button>
  )
}
