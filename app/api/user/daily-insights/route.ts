import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const response = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/daily_insights?user_id=eq.${userId}&order=insight_date.desc&limit=30`,
      {
        headers: {
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        },
      },
    )

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch insights" }, { status: 500 })
    }

    const insights = await response.json()
    return NextResponse.json(insights || [])
  } catch (error) {
    console.error("Error in daily insights route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
