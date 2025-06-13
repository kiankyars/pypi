import { NextResponse } from "next/server"
import plaidClient from "@/lib/plaid-client"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs" // For server-side auth
import { cookies } from "next/headers"

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies }) // Server-side Supabase client

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { public_token } = await req.json()
    if (!public_token) {
      return NextResponse.json({ error: "Public token is required" }, { status: 400 })
    }

    const response = await plaidClient.itemPublicTokenExchange({ public_token })
    const accessToken = response.data.access_token
    const itemId = response.data.item_id

    // Store accessToken and itemId securely, associated with the user
    // For example, in your 'profiles' table
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ plaid_access_token: accessToken, plaid_item_id: itemId })
      .eq("id", user.id)

    if (updateError) {
      console.error("Supabase update error after Plaid token exchange:", updateError)
      throw updateError
    }

    return NextResponse.json({ message: "Access token exchanged and stored successfully." })
  } catch (error: any) {
    console.error("Plaid public token exchange error:", error.response?.data || error.message)
    return NextResponse.json(
      { error: error.response?.data?.error_message || "Failed to exchange public token" },
      { status: 500 },
    )
  }
}
