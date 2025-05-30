import { generateText } from "ai"
import { xai } from "@ai-sdk/xai"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    console.log("Generating first daily insight for user:", userId)

    // Get user's birth data
    const userResponse = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/users?id=eq.${userId}&select=birth_date,birth_time,birth_place,email`,
      {
        headers: {
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        },
      },
    )

    if (!userResponse.ok) {
      console.error("Error fetching user:", userResponse.status, userResponse.statusText)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const users = await userResponse.json()
    const user = users[0]

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log("User data for insight generation:", {
      birth_date: user.birth_date,
      birth_place: user.birth_place,
      birth_time: user.birth_time,
    })

    // Check if today's insight already exists
    const today = new Date().toISOString().split("T")[0]
    const existingInsightResponse = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/daily_insights?user_id=eq.${userId}&insight_date=eq.${today}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        },
      },
    )

    if (existingInsightResponse.ok) {
      const existingInsights = await existingInsightResponse.json()
      if (existingInsights.length > 0) {
        console.log("Existing insight found, returning it")
        return NextResponse.json(existingInsights[0])
      }
    }

    // Only generate insight if user has birth data - be more flexible with validation
    if (!user.birth_date || !user.birth_place) {
      console.log("Missing birth data:", { birth_date: user.birth_date, birth_place: user.birth_place })
      return NextResponse.json(
        {
          error: "Birth data required. Please complete your profile first.",
        },
        { status: 400 },
      )
    }

    // Generate today's date information for the prompt
    const todayDate = new Date()
    const formattedDate = todayDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    // Create the specialized daily insight prompt
    const prompt = `You are KIRA, an advanced AI astrologer and palm reader. Generate a personalized DAILY INSIGHT for ${formattedDate}.

User's Natal Chart Data:
- Birth Date: ${user.birth_date}
- Birth Time: ${user.birth_time || "Unknown"}
- Birth Location: ${user.birth_place}
- Palm Reading: Available for interpretation

Today's Cosmic Context: ${formattedDate}

Take the user's natal chart data and palm reading image interpretation, overlay it with today's planetary positions and general energetic conditions. Provide personalized recommendations in the following areas:

**🌟 Today's Energy Overview**
Brief summary of the day's cosmic energy and how it affects this person specifically.

**💪 Health & Vitality**
Physical wellness recommendations, energy levels, and health focus areas for today.

**💼 Business & Career**
Professional opportunities, decision-making guidance, and career energy for today.

**💕 Relationships & Love**
Romantic connections, social interactions, and relationship guidance for today.

**🧠 Emotions & Mental State**
Emotional balance, mental clarity, and psychological insights for today.

**🌱 Personal Growth**
Spiritual development, learning opportunities, and growth areas for today.

**🎯 Today's Action Items**
3-4 specific, practical actions the user should take today based on their cosmic profile.

**✨ Daily Affirmation**
A powerful, personalized affirmation for today based on their astrological profile.

Keep it inspiring, intuitive, and practical. Make specific references to today's date and cosmic conditions. Format with clear headings using ** for bold text.`

    console.log("Generating daily insight with Grok...")

    const { text } = await generateText({
      model: xai("grok-2-1212"),
      prompt,
      maxTokens: 1200,
      temperature: 0.7,
    })

    console.log("Daily insight generated, storing in database...")

    // Store the daily insight
    const insertResponse = await fetch(`${process.env.SUPABASE_URL}/rest/v1/daily_insights`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        user_id: userId,
        insight_content: text,
        insight_date: today,
        created_at: new Date().toISOString(),
      }),
    })

    if (!insertResponse.ok) {
      const errorText = await insertResponse.text()
      console.error("Error storing daily insight:", insertResponse.status, errorText)
      return NextResponse.json({ error: "Failed to store insight" }, { status: 500 })
    }

    const newInsights = await insertResponse.json()
    console.log("Daily insight stored successfully")

    return NextResponse.json(newInsights[0])
  } catch (error) {
    console.error("Error generating first daily insight:", error)
    return NextResponse.json({ error: "Failed to generate daily insight" }, { status: 500 })
  }
}
