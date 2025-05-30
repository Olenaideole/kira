import { type NextRequest, NextResponse } from "next/server"

// Simple hash function using Web Crypto API (same as signup)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + "kira_salt_2024")
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Get user from database
    const userResponse = await fetch(`${process.env.SUPABASE_URL}/rest/v1/users?email=eq.${email}`, {
      headers: {
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
      },
    })

    if (!userResponse.ok) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 400 })
    }

    const users = await userResponse.json()
    const userData = users[0]

    if (!userData) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 400 })
    }

    // Hash the provided password and compare
    const hashedPassword = await hashPassword(password)

    if (hashedPassword !== userData.password_hash) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 400 })
    }

    // Return user data (excluding password hash)
    const { password_hash, ...userWithoutPassword } = userData

    return NextResponse.json({
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("Signin error:", error)
    return NextResponse.json({ error: "Failed to sign in" }, { status: 500 })
  }
}
