import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    // Validate userId format (should be a UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(userId)) {
      return NextResponse.json({ error: "Invalid user ID format" }, { status: 400 })
    }

    try {
      const response = await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/users?id=eq.${userId}&select=trial_start_date,trial_reports_used,is_trial_active,plan_type,subscription_status`,
        {
          headers: {
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
          },
        },
      )

      if (!response.ok) {
        console.error("Supabase API error:", response.status, response.statusText)
        return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 })
      }

      const users = await response.json()
      const user = users[0]

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      // Calculate trial status
      const trialStartDate = user.trial_start_date ? new Date(user.trial_start_date) : new Date()
      const trialEndDate = new Date(trialStartDate.getTime() + 3 * 24 * 60 * 60 * 1000)
      const now = new Date()
      const daysLeft = Math.max(0, Math.ceil((trialEndDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)))
      const isTrialActive = now < trialEndDate && user.is_trial_active
      const isPremium = user.plan_type === "premium" && user.subscription_status === "active"

      return NextResponse.json({
        daysLeft,
        reportsUsed: user.trial_reports_used || 0,
        isTrialActive,
        isPremium,
        canGenerateReport: isTrialActive || isPremium,
      })
    } catch (fetchError) {
      console.error("Database fetch error:", fetchError)
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error checking trial status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
