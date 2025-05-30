import { generateText } from "ai"
import { xai } from "@ai-sdk/xai"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("API route called")

    const body = await request.json()
    console.log("Request body:", body)

    const { birthDate, birthTime, birthPlace, palmPhoto, reportDate, userId } = body

    // Validate required fields
    if (!birthDate || !birthPlace) {
      console.log("Validation failed: missing required fields")
      return NextResponse.json({ error: "Birth date and place are required" }, { status: 400 })
    }

    // Check if user exists and trial status
    if (userId) {
      const userResponse = await fetch(`${process.env.SUPABASE_URL}/rest/v1/users?id=eq.${userId}`, {
        headers: {
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        },
      })

      if (!userResponse.ok) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      const users = await userResponse.json()
      const user = users[0]

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      // Check trial status
      const trialStartDate = user.trial_start_date ? new Date(user.trial_start_date) : new Date()
      const trialEndDate = new Date(trialStartDate.getTime() + 3 * 24 * 60 * 60 * 1000)
      const now = new Date()
      const isTrialActive = now < trialEndDate && user.is_trial_active
      const isPremium = user.plan_type === "premium" && user.subscription_status === "active"

      if (!isTrialActive && !isPremium) {
        return NextResponse.json({ error: "Trial expired. Please upgrade to premium." }, { status: 403 })
      }

      // Update trial start date if not set
      if (!user.trial_start_date) {
        await fetch(`${process.env.SUPABASE_URL}/rest/v1/users?id=eq.${userId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
          },
          body: JSON.stringify({ trial_start_date: new Date().toISOString() }),
        })
      }

      // Check if report already exists for today
      const targetDate = reportDate || new Date().toISOString().split("T")[0]
      const reportResponse = await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/daily_reports?user_id=eq.${userId}&report_date=eq.${targetDate}`,
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
          return NextResponse.json({ report: existingReports[0].report_content })
        }
      }
    }

    console.log("Validation passed, generating prompt...")

    // Create the prompt for Grok with specific date
    const targetDate = reportDate || new Date().toISOString().split("T")[0]
    const formattedDate = new Date(targetDate).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    const prompt = `You are KIRA, an advanced AI astrologer and palm reader. Generate a comprehensive personal life report specifically for ${formattedDate}.

Birth Details:
- Date: ${birthDate}
- Time: ${birthTime || "Unknown"}
- Location: ${birthPlace}
- Palm photo: ${palmPhoto ? "Provided" : "Not provided"}

Generate a detailed report covering:
1. **Your Life Energy for ${formattedDate}** - Current energy levels and vitality for this specific date
2. **Health Focus** - Health insights and recommendations for today
3. **Business Potential** - Career and financial outlook for this date
4. **Relationships Insight** - Love and personal connections guidance for today
5. **Family Advice** - Family dynamics and guidance for this specific day
6. **Daily Guidance** - Specific advice and predictions for ${formattedDate}
7. **Spiritual Note** - Spiritual insights and growth opportunities for today

Make sure to reference the specific date (${formattedDate}) throughout the report. Format the response with clear headings using ** for bold text. Make it personal, insightful, and mystical while remaining practical. Include specific predictions and actionable advice for this exact date.`

    console.log("Calling Grok API...")

    const { text } = await generateText({
      model: xai("grok-2-1212"),
      prompt,
      maxTokens: 1000,
      temperature: 0.7,
    })

    console.log("Grok API response received:", text.substring(0, 200) + "...")

    // Store the report if user is provided
    if (userId) {
      const isTrialReport = true // For now, all reports are trial reports unless premium

      await fetch(`${process.env.SUPABASE_URL}/rest/v1/daily_reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        },
        body: JSON.stringify({
          user_id: userId,
          report_content: text,
          report_date: targetDate,
          is_trial_report: isTrialReport,
        }),
      })

      // Update trial reports used count
      const currentUserResponse = await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/users?id=eq.${userId}&select=trial_reports_used`,
        {
          headers: {
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
          },
        },
      )

      if (currentUserResponse.ok) {
        const currentUsers = await currentUserResponse.json()
        const currentUser = currentUsers[0]

        if (currentUser) {
          const newCount = (currentUser.trial_reports_used || 0) + 1
          await fetch(`${process.env.SUPABASE_URL}/rest/v1/users?id=eq.${userId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
              apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
            },
            body: JSON.stringify({ trial_reports_used: newCount }),
          })
        }
      }
    }

    return NextResponse.json({ report: text })
  } catch (error) {
    console.error("Error in API route:", error)

    if (error instanceof Error) {
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }

    return NextResponse.json(
      {
        error: `Failed to generate report: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
