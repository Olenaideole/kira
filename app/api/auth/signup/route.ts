import { type NextRequest, NextResponse } from "next/server"
import { hashPassword } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    // Check if user already exists
    const existingUserResponse = await fetch(`${process.env.SUPABASE_URL}/rest/v1/users?email=eq.${email}&select=id`, {
      headers: {
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
      },
    })

    if (existingUserResponse.ok) {
      const existingUsers = await existingUserResponse.json()
      if (existingUsers.length > 0) {
        return NextResponse.json({ error: "User already exists" }, { status: 400 })
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Generate user ID
    const userId = crypto.randomUUID()

    // Create user record
    const createResponse = await fetch(`${process.env.SUPABASE_URL}/rest/v1/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
      },
      body: JSON.stringify({
        id: userId,
        email,
        password_hash: hashedPassword,
        trial_start_date: new Date().toISOString(),
        is_trial_active: true,
        trial_reports_used: 0,
        plan_type: "basic",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }),
    })

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error("Database error:", errorText)
      let specificError = "Unknown database error";
      try {
        // Try to parse Supabase error (which might be JSON with a message field)
        const supabaseError = JSON.parse(errorText);
        if (supabaseError && supabaseError.message) {
          specificError = supabaseError.message;
        } else if (errorText.includes("duplicate key value violates unique constraint")) {
          specificError = "User with this email already exists.";
        } else {
          specificError = errorText.substring(0, 100); // Fallback to raw text snippet
        }
      } catch (e) {
        // If parsing fails, use a snippet of the raw error text
        specificError = errorText.substring(0, 100);
      }
      return NextResponse.json({ error: `Failed to create account: ${specificError}` }, { status: 500 })
    }

    return NextResponse.json({
      message: "Account created successfully! You can now sign in.",
      user: {
        id: userId,
        email,
      },
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 })
  }
}
