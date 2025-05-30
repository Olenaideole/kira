import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id") || "mock-user-id"

    const response = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/users?id=eq.${userId}&select=email,plan_type,subscription_status,daily_reports_enabled`,
      {
        headers: {
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        },
      },
    )

    if (!response.ok) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const users = await response.json()
    const user = users[0]

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error in profile route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
