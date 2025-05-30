import { generateText } from "ai"
import { xai } from "@ai-sdk/xai"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id") || "mock-user-id"

    // Get user's birth data
    const userResponse = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/users?id=eq.${userId}&select=birth_date,birth_time,birth_place,plan_type`,
      {
        headers: {
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        },
      },
    )

    if (!userResponse.ok) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const users = await userResponse.json()
    const user = users[0]

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (user.plan_type !== "premium") {
      return NextResponse.json({ error: "Premium subscription required" }, { status: 403 })
    }

    // Check if today's report already exists
    const today = new Date().toISOString().split("T")[0]
    const reportResponse = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/daily_reports?user_id=eq.${userId}&report_date=eq.${today}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        },
      },
    )

    if (reportResponse.ok) {
      const existingReports = await reportResponse.json()
      if (existingReports.length > 0) {
        return NextResponse.json(existingReports[0])
      }
    }

    // Generate new daily report
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

    // Store the daily report
    const insertResponse = await fetch(`${process.env.SUPABASE_URL}/rest/v1/daily_reports`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        user_id: userId,
        report_content: text,
        report_date: today,
      }),
    })

    if (!insertResponse.ok) {
      console.error("Error storing daily report")
      return NextResponse.json({ error: "Failed to store report" }, { status: 500 })
    }

    const newReports = await insertResponse.json()
    return NextResponse.json(newReports[0])
  } catch (error) {
    console.error("Error generating today's report:", error)
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
}
