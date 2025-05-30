import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id") || "mock-user-id"

    const response = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/daily_reports?user_id=eq.${userId}&order=report_date.desc&limit=30`,
      {
        headers: {
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        },
      },
    )

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 })
    }

    const reports = await response.json()
    return NextResponse.json(reports || [])
  } catch (error) {
    console.error("Error in daily reports route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
