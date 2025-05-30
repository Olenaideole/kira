"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Sparkles, Calendar } from "lucide-react"
import Link from "next/link"

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const [isVerified, setIsVerified] = useState(false)

  useEffect(() => {
    if (sessionId) {
      // Verify the session and set up the user
      verifySession(sessionId)
    }
  }, [sessionId])

  const verifySession = async (sessionId: string) => {
    try {
      const response = await fetch("/api/verify-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId }),
      })

      if (response.ok) {
        setIsVerified(true)
      }
    } catch (error) {
      console.error("Error verifying session:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center px-6">
      <Card className="bg-white/10 backdrop-blur-md border-white/20 max-w-2xl w-full">
        <CardContent className="p-12 text-center">
          <div className="flex justify-center mb-6">
            <CheckCircle className="w-20 h-20 text-green-400" />
          </div>

          <h1 className="text-4xl font-bold text-white mb-4">Welcome to KIRA Premium!</h1>

          <p className="text-xl text-gray-300 mb-8">
            Your subscription has been activated successfully. You now have access to daily personalized insights.
          </p>

          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-center space-x-2 text-purple-300">
              <Sparkles className="w-5 h-5" />
              <span>Daily AI-powered reports</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-blue-300">
              <Calendar className="w-5 h-5" />
              <span>Your first daily report will arrive at midnight</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-green-300">
              <CheckCircle className="w-5 h-5" />
              <span>Compatibility analysis with partners</span>
            </div>
          </div>

          <div className="space-y-4">
            <Link href="/dashboard">
              <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-3 text-lg font-semibold">
                Go to Dashboard
              </Button>
            </Link>

            <div className="text-gray-400 text-sm">
              <p>Questions? Contact our support team anytime.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
