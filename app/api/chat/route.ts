import { openai } from "@ai-sdk/openai"
import { streamText, type CoreMessage } from "ai"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return new Response("Unauthorized", { status: 401 })
    }

    const { messages }: { messages: CoreMessage[] } = await req.json()

    // Fetch user profile and recent transcripts/advice for context
    const [{ data: profile }, { data: transcripts }, { data: adviceHistory }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase
        .from("call_transcripts")
        .select("transcript_text, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(2),
      supabase
        .from("advice_history")
        .select("advice_payload, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1),
    ])

    let systemPrompt = `You are clever, a helpful and empathetic financial assistant. You are not a registered financial advisor and must not provide specific investment recommendations (e.g., "buy stock X"). Instead, provide general financial education, guidance on budgeting, saving, debt management, and understanding investment principles. Frame advice in terms of percentages, types of accounts, or strategies, not specific products. Be encouraging and actionable. Current date: ${new Date().toLocaleDateString()}.`

    if (profile) {
      systemPrompt += `\n\nUser Profile Context:
      Age: ${profile.age || "N/A"}
      Income: ${profile.income || "N/A"}
      Monthly Expenses: ${profile.monthly_expenses || "N/A"}
      Risk Tolerance: ${profile.risk_tolerance || "N/A"}
      Onboarded: ${profile.onboarded}`
      // Consider adding goals and debts if available and relevant
    }

    if (transcripts && transcripts.length > 0) {
      systemPrompt += `\n\nRecent Call Transcript Snippets (for context, most recent first):`
      transcripts.forEach((t) => {
        systemPrompt += `\n- (Call on ${new Date(t.created_at).toLocaleDateString()}): "${t.transcript_text.substring(0, 200)}..."`
      })
    }

    if (adviceHistory && adviceHistory.length > 0) {
      systemPrompt += `\n\nLast advice given on ${new Date(adviceHistory[0].created_at).toLocaleDateString()}: ${JSON.stringify(adviceHistory[0].advice_payload).substring(0, 200)}...`
    }

    systemPrompt +=
      "\n\nFocus on providing actionable advice on: 1. Savings rate. 2. Investment allocation (percentages + account types). 3. Debt-payoff strategy. If the user asks something else, address it while keeping these core areas in mind if appropriate."

    const result = await streamText({
      model: openai("gpt-4o"), // Or your preferred model
      system: systemPrompt,
      messages,
      // onFinish: async ({ text }) => { // text is the full response string
      //   // Save the AI's response to advice_history
      //   // This is a simplified way; you might want to parse the text to structure advice_payload
      //   await supabase.from('advice_history').insert({
      //     user_id: user.id,
      //     prompt_text: messages.filter(m => m.role === 'user').map(m => m.content).join('\n'), // crude prompt
      //     advice_payload: { raw_response: text } // Store the raw response or parse it
      //   });
      // }
    })

    return result.toDataStreamResponse()
  } catch (error: any) {
    console.error("Chat API error:", error)
    const errorMessage = error.message || "An unexpected error occurred"
    // Ensure a Response object is returned for errors too
    return new Response(JSON.stringify({ error: "Failed to process chat request", details: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
