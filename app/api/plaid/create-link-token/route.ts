import { NextResponse } from "next/server"
import plaidClient from "@/lib/plaid-client"
import { Products, CountryCode } from "plaid"

export async function POST(req: Request) {
  try {
    // In a real app, you'd get the user ID from an authenticated session
    // For this demo, we might pass it in the body or use a server-side Supabase client
    // const supabase = getSupabaseServerClient(); // If using server client
    // const { data: { user } } = await supabase.auth.getUser();
    // if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // const userId = user.id;

    const { userId } = await req.json() // Assuming userId is passed for demo purposes
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const request = {
      user: { client_user_id: userId },
      client_name: "clever Financial Assistant",
      products: [Products.Auth, Products.Transactions], // Adjust as needed
      country_codes: [CountryCode.Us],
      language: "en",
      // redirect_uri: process.env.PLAID_REDIRECT_URI, // Optional: for OAuth flows
    }

    const response = await plaidClient.linkTokenCreate(request)
    return NextResponse.json({ link_token: response.data.link_token })
  } catch (error: any) {
    console.error("Plaid link token creation error:", error.response?.data || error.message)
    return NextResponse.json(
      { error: error.response?.data?.error_message || "Failed to create link token" },
      { status: 500 },
    )
  }
}
