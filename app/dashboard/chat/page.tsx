"use client"
import { useChat } from "@ai-sdk/react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SendHorizonal, User, Bot } from "lucide-react"
import { useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: "/api/chat", // Your API route for chat
    // You can pass initial messages or other options here
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] md:h-[calc(100vh-8rem)]">
      {" "}
      {/* Adjust height based on Navbar/BottomNav */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-muted/30 rounded-lg">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Bot className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg font-semibold">Chat with clever</p>
            <p className="text-muted-foreground">Ask about savings, investments, debt, or anything finance!</p>
            <p className="text-xs text-muted-foreground mt-2">Example: "How can I save an extra $200 per month?"</p>
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <Card
              className={`max-w-xs md:max-w-md lg:max-w-lg p-3 shadow ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-background"}`}
            >
              <CardContent className="p-0 text-sm whitespace-pre-wrap">
                <div className="flex items-start space-x-2">
                  {m.role === "assistant" && (
                    <Avatar className="h-6 w-6">
                      <AvatarFallback>
                        <Bot size={16} />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  {m.role === "user" && (
                    <Avatar className="h-6 w-6 order-2 ml-2">
                      <AvatarFallback>
                        <User size={16} />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <span className={m.role === "user" ? "order-1" : ""}>{m.content}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {error && (
        <div className="p-4 text-red-500 border border-red-500 bg-red-50 rounded-md">
          <p>
            <strong>Error:</strong> {error.message}
          </p>
          <p className="text-xs">There was an issue communicating with the assistant. Please try again.</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="p-4 border-t bg-background">
        <div className="flex items-center space-x-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask clever about your finances..."
            className="flex-grow"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            <SendHorizonal className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  )
}
