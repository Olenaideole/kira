import { generateText } from "ai"
import { xai } from "@ai-sdk/xai"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("General report API route called")

    const body = await request.json()
    console.log("Request body:", body)

    const { birthDate, birthTime, birthPlace, palmPhoto, userId } = body

    // Validate required fields
    if (!birthDate || !birthPlace) {
      console.log("Validation failed: missing required fields")
      return NextResponse.json({ error: "Birth date and place are required" }, { status: 400 })
    }

    // Only check trial status if user is provided (optional for free reports)
    if (userId) {
      const userResponse = await fetch(`${process.env.SUPABASE_URL}/rest/v1/users?id=eq.${userId}`, {
        headers: {
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        },
      })

      if (userResponse.ok) {
        const users = await userResponse.json()
        const user = users[0]

        if (user) {
          // Check trial status for logged-in users
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

          // Update user's birth data for future daily reports
          await fetch(`${process.env.SUPABASE_URL}/rest/v1/users?id=eq.${userId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
              apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
            },
            body: JSON.stringify({
              birth_date: birthDate,
              birth_time: birthTime || null,
              birth_place: birthPlace,
              updated_at: new Date().toISOString(),
            }),
          })
        }
      }
    }

    console.log("Validation passed, generating general report...")

    const prompt = `You are KIRA, an advanced AI astrologer and palm reader. Generate a comprehensive GENERAL LIFE ANALYSIS report (not a daily report).

Birth Details:
- Date: ${birthDate}
- Time: ${birthTime || "Unknown"}
- Location: ${birthPlace}
- Palm photo: ${palmPhoto ? "Provided for analysis" : "Not provided"}

Generate a detailed GENERAL REPORT covering:
1. **Personality Overview** - Core personality traits and characteristics based on astrological analysis
2. **Life Path & Purpose** - Your spiritual journey and life mission
3. **Strengths & Talents** - Natural abilities and gifts you possess
4. **Challenges & Growth Areas** - Areas for personal development and growth
5. **Career & Financial Potential** - Professional inclinations and money-making abilities
6. **Love & Relationships** - Romantic compatibility and relationship patterns
7. **Health & Wellness** - Physical and mental health tendencies
8. **Family & Social Life** - Family dynamics and social connections
9. **Spiritual Gifts** - Psychic abilities and spiritual inclinations
10. **Life Advice** - Key recommendations for living your best life

${palmPhoto ? "Include palm reading insights throughout each section, analyzing the lines and their meanings." : ""}

This should be a comprehensive GENERAL analysis of the person's entire life, not a daily forecast. Format the response with clear headings using ** for bold text. Make it personal, insightful, and mystical while remaining practical and encouraging.`

    console.log("Calling Grok API for general report...")

    const { text } = await generateText({
      model: xai("grok-2-1212"),
      prompt,
      maxTokens: 1500,
      temperature: 0.7,
    })

    console.log("Grok API response received:", text.substring(0, 200) + "...")

    // Update trial reports used count only if user is provided and logged in
    if (userId) {
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
    console.error("Error in general report API route:", error)

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
