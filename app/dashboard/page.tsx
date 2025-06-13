"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { Label } from "@/components/ui/label"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PhoneOutgoing, MessageSquare } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { useState, useEffect } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase-client"
import type { User } from "@supabase/supabase-js"
import { useToast } from "@/components/ui/use-toast"

// Simulated call transcript parts
const callScript = [
  {
    speaker: "clever",
    text: (name: string) =>
      `Hi ${name}, welcome to your financial check-in with clever! Today, let's quickly cover your savings goals and recent spending. How have you been feeling about your finances lately?`,
  },
  {
    speaker: "user",
    prompt:
      "Share a brief thought on your current financial feeling (e.g., 'A bit stressed about upcoming bills', 'Feeling good about my savings').",
  },
  {
    speaker: "clever",
    text: (name: string, userResponse: string) =>
      `Thanks for sharing, ${name}. I've noted that: "${userResponse}". Based on your goals, I suggest focusing on [Placeholder: e.g., increasing your emergency fund contributions]. We can explore [Placeholder: e.g., investment options] in more detail in our next call.`,
  },
  {
    speaker: "clever",
    text: () =>
      `This call is ending now. You'll find a summary and actionable steps in your chat history. Have a great day!`,
  },
]

export default function DashboardPage() {
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()
  const { toast } = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [userName, setUserName] = useState<string>("there")
  const [isCallModalOpen, setIsCallModalOpen] = useState(false)
  const [callStep, setCallStep] = useState(0)
  const [userResponses, setUserResponses] = useState<string[]>([])
  const [currentCallTranscript, setCurrentCallTranscript] = useState<string[]>([])
  const [isCallLoading, setIsCallLoading] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()
      setUser(authUser)
      if (authUser) {
        const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", authUser.id).single()
        setUserName(profile?.full_name || authUser.email || "there")
      }
    }
    fetchUser()
  }, [supabase])

  const startCall = () => {
    setCallStep(0)
    setUserResponses([])
    setCurrentCallTranscript([])
    setIsCallModalOpen(true)
    // Add first Clever message to transcript
    const firstMessage = typeof callScript[0].text === "function" ? callScript[0].text(userName) : callScript[0].text
    setCurrentCallTranscript((prev) => [...prev, `clever: ${firstMessage}`])
  }

  const handleNextCallStep = (userResponse?: string) => {
    if (userResponse) {
      setUserResponses((prev) => [...prev, userResponse])
      setCurrentCallTranscript((prev) => [...prev, `User: ${userResponse}`])
    }

    const nextStep = callStep + 1
    if (nextStep < callScript.length) {
      setCallStep(nextStep)
      const currentScriptPart = callScript[nextStep]
      if (currentScriptPart.speaker === "clever") {
        let cleverText = ""
        if (typeof currentScriptPart.text === "function") {
          // Pass necessary args to function, e.g., userName or previous user response
          cleverText = currentScriptPart.text(userName, userResponses[userResponses.length - 1] || "")
        } else {
          cleverText = currentScriptPart.text as string
        }
        setCurrentCallTranscript((prev) => [...prev, `clever: ${cleverText}`])
      }
    } else {
      // Call ended
      saveTranscriptAndEndCall()
    }
  }

  const saveTranscriptAndEndCall = async () => {
    setIsCallLoading(true)
    if (!user) {
      toast({ title: "Error", description: "User not found.", variant: "destructive" })
      setIsCallLoading(false)
      setIsCallModalOpen(false)
      return
    }

    const finalTranscript = currentCallTranscript.join("\n")
    // console.log("Final Transcript:", finalTranscript);

    // Save transcript to Supabase
    const { error } = await supabase
      .from("call_transcripts")
      .insert({ user_id: user.id, transcript_text: finalTranscript, summary: "Call summary placeholder" })

    if (error) {
      toast({ title: "Error Saving Transcript", description: error.message, variant: "destructive" })
    } else {
      toast({ title: "Call Ended", description: "Transcript saved. Check your chat history for details." })
    }

    setIsCallLoading(false)
    setIsCallModalOpen(false)
    // Optionally redirect to chat or show summary
    router.push("/dashboard/chat")
  }

  const currentScriptPart = callScript[callStep]

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Welcome back, {userName}!</CardTitle>
          <CardDescription>Ready to manage your finances with clever?</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <Dialog open={isCallModalOpen} onOpenChange={setIsCallModalOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="flex-1" onClick={startCall}>
                <PhoneOutgoing className="mr-2 h-5 w-5" /> Call Your Assistant
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Financial Assistant Call</DialogTitle>
                <DialogDescription>clever is guiding this 1-2 minute call.</DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-3 max-h-[60vh] overflow-y-auto">
                {currentCallTranscript.map((line, index) => (
                  <p
                    key={index}
                    className={line.startsWith("clever:") ? "font-semibold" : "text-muted-foreground pl-4"}
                  >
                    {line}
                  </p>
                ))}

                {currentScriptPart?.speaker === "user" && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleNextCallStep((e.target as any).userResponse.value)
                      ;(e.target as any).userResponse.value = ""
                    }}
                  >
                    <Label htmlFor="userResponse" className="sr-only">
                      {currentScriptPart.prompt}
                    </Label>
                    <Input
                      name="userResponse"
                      id="userResponse"
                      placeholder={currentScriptPart.prompt as string}
                      className="mt-2"
                      autoFocus
                    />
                    <Button type="submit" className="mt-2 w-full">
                      Send
                    </Button>
                  </form>
                )}
              </div>
              <DialogFooter>
                {currentScriptPart?.speaker === "clever" && callStep < callScript.length - 1 && (
                  <Button onClick={() => handleNextCallStep()} disabled={isCallLoading}>
                    Next
                  </Button>
                )}
                {callStep >= callScript.length - 1 && (
                  <Button onClick={saveTranscriptAndEndCall} disabled={isCallLoading}>
                    {isCallLoading ? "Ending Call..." : "End Call & Save Transcript"}
                  </Button>
                )}
                <DialogClose asChild>
                  <Button variant="outline" disabled={isCallLoading}>
                    Cancel Call
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button size="lg" variant="outline" className="flex-1" onClick={() => router.push("/dashboard/chat")}>
            <MessageSquare className="mr-2 h-5 w-5" /> Chat with Assistant
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Financial Snapshot</CardTitle>
          <CardDescription>Key insights and upcoming actions. (Placeholder)</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This area will display a summary of your financial health, recent advice, or upcoming tasks based on your
            interactions with clever.
          </p>
          {/* Example: Display last advice or call summary */}
        </CardContent>
      </Card>
      {/* Add more dashboard widgets here */}
    </div>
  )
}
