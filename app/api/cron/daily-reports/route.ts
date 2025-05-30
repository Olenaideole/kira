import { generateText } from "ai"
import { xai } from "@ai-sdk/xai"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all premium users with daily reports enabled
    const usersResponse = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/users?plan_type=eq.premium&daily_reports_enabled=eq.true&subscription_status=eq.active&select=id,birth_date,birth_time,birth_place,email`,
      {
        headers: {
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        },
      },
    )

    if (!usersResponse.ok) {
      console.error("Error fetching users")
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
    }

    const users = await usersResponse.json()
    const today = new Date().toISOString().split("T")[0]
    const results = []

    for (const user of users || []) {
      try {
        // Check if report already exists for today
        const existingReportResponse = await fetch(
          `${process.env.SUPABASE_URL}/rest/v1/daily_reports?user_id=eq.${user.id}&report_date=eq.${today}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
              apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
            },
          },
        )

        if (existingReportResponse.ok) {
          const existingReports = await existingReportResponse.json()
          if (existingReports.length > 0) {
            console.log(`Report already exists for user ${user.id}`)
            continue
          }
        }

        // Generate daily report
        const prompt = `You are KIRA, an advanced AI astrologer and palm reader. Generate a personalized daily report for today (${new Date().toLocaleDateString()}).

User's Birth Details:
- Date: ${user.birth_date}
- Time: ${user.birth_time || "Unknown"}
- Location: ${user.birth_place}

Generate a comprehensive daily report covering:
1. **Today's Energy Overview** - Overall energy and cosmic influences
2. **Health & Wellness** - Physical and mental health guidance for today
3. **Career & Money** - Professional opportunities and financial insights
4. **Love & Relationships** - Romantic and social connections guidance
5. **Family & Home** - Family dynamics and domestic matters
6. **Spiritual Guidance** - Meditation, growth, and spiritual practices
7. **Lucky Elements** - Colors, numbers, or activities that will bring good fortune
8. **Daily Affirmation** - A powerful affirmation for today

Make it personal, specific to today's date, and include actionable advice. Format with ** for headings.`

        const { text } = await generateText({
          model: xai("grok-2-1212"),
          prompt,
          maxTokens: 1200,
          temperature: 0.7,
        })

        // Store the report
        const insertResponse = await fetch(`${process.env.SUPABASE_URL}/rest/v1/daily_reports`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
          },
          body: JSON.stringify({
            user_id: user.id,
            report_content: text,
            report_date: today,
          }),
        })

        if (!insertResponse.ok) {
          console.error(`Error storing report for user ${user.id}`)
          results.push({ userId: user.id, status: "error", error: "Failed to store report" })
        } else {
          console.log(`Successfully generated report for user ${user.id}`)
          results.push({ userId: user.id, status: "success" })
        }

        // Add a small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000))
      } catch (error) {
        console.error(`Error processing user ${user.id}:`, error)
        results.push({ userId: user.id, status: "error", error: error.message })
      }
    }

    return NextResponse.json({
      message: "Daily reports generation completed",
      processed: results.length,
      results,
    })
  } catch (error) {
    console.error("Error in daily reports cron:", error)
    return NextResponse.json({ error: "Cron job failed" }, { status: 500 })
  }
}
