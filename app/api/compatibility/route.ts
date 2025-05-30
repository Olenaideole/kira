import { generateText } from "ai"
import { xai } from "@ai-sdk/xai"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { user, partner } = await request.json()

    // Validate required fields
    if (!user?.birthDate || !user?.birthPlace || !partner?.birthDate || !partner?.birthPlace) {
      return NextResponse.json({ error: "Complete birth details required for both partners" }, { status: 400 })
    }

    // Create the compatibility analysis prompt for Grok
    const prompt = `You are KIRA, an advanced AI astrologer and palm reader specializing in relationship compatibility. Analyze the compatibility between these two individuals:

User 1:
- Birth Date: ${user.birthDate}
- Birth Time: ${user.birthTime || "Unknown"}
- Birth Place: ${user.birthPlace}
- Palm Photo: ${user.palmPhoto ? "Provided" : "Not provided"}

User 2 (Partner):
- Birth Date: ${partner.birthDate}
- Birth Time: ${partner.birthTime || "Unknown"}
- Birth Place: ${partner.birthPlace}
- Palm Photo: ${partner.palmPhoto ? "Provided" : "Not provided"}

Provide a detailed compatibility analysis covering:

1. **Emotional Connection** (0-100 score): Deep emotional bond and understanding
2. **Business Synergy** (0-100 score): Professional collaboration and shared goals
3. **Family Values Alignment** (0-100 score): Family priorities and life vision
4. **Shared Life Purpose** (0-100 score): Spiritual path and personal growth
5. **Energy Synchronization** (0-100 score): Daily energy patterns and compatibility

For each category, provide:
- A numerical score (0-100)
- 2-3 sentences explaining the compatibility
- Specific insights based on astrological and palm reading analysis

Conclude with:
- **Overall Compatibility Score** (0-100): Average of all categories
- **Recommendation**: One specific, actionable recommendation for improving their bond

Format with clear headings using ** for bold text. Be mystical yet practical, insightful yet encouraging.`

    const { text } = await generateText({
      model: xai("grok-2-1212"),
      prompt,
      maxTokens: 1200,
      temperature: 0.7,
    })

    // Parse the response to extract scores and create structured data
    const compatibilityData = {
      analysis: text,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(compatibilityData)
  } catch (error) {
    console.error("Error generating compatibility report with Grok:", error)
    return NextResponse.json({ error: "Failed to generate compatibility report. Please try again." }, { status: 500 })
  }
}
