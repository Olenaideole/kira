"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Star, Loader2 } from "lucide-react"

export function PricingSection() {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  const handleSubscribe = async (planType: "premium") => {
    setIsLoading(true)
    setLoadingPlan(planType)

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planType,
        }),
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error("Failed to create checkout session")
      }
    } catch (error) {
      console.error("Error creating checkout session:", error)
      alert(`Error starting payment process: ${error.message}. Please try again.`)
    } finally {
      setIsLoading(false)
      setLoadingPlan(null)
    }
  }

  return (
    <section id="pricing" className="px-6 py-16 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-white mb-4">Choose Your Destiny Access</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Basic Plan */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">Basic</CardTitle>
            <div className="text-3xl font-bold text-white">Free</div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-gray-200">
                <Check className="w-5 h-5 text-green-400" />
                <span>Natal Chart analysis</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-200">
                <Check className="w-5 h-5 text-green-400" />
                <span>Palm Photo line analysis</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-200">
                <Check className="w-5 h-5 text-green-400" />
                <span>General combined report</span>
              </div>
            </div>
            <Button disabled className="w-full bg-gray-600 text-gray-400 cursor-not-allowed">
              Current Plan
            </Button>
          </CardContent>
        </Card>

        {/* Premium Plan */}
        <Card className="bg-gradient-to-br from-purple-900/90 to-blue-900/90 backdrop-blur-md border-purple-400/50 relative shadow-2xl shadow-purple-500/20">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-4 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
              <Star className="w-4 h-4" />
              <span>Most Popular</span>
            </div>
          </div>

          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">Premium</CardTitle>
            <div className="space-y-1">
              <div className="text-3xl font-bold text-white">
                <span className="line-through text-gray-400 text-xl">$22</span> $15
                <span className="text-lg font-normal text-gray-200">/month</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-gray-100">
                <Check className="w-5 h-5 text-green-400" />
                <span>All from Basic</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-100">
                <Check className="w-5 h-5 text-green-400" />
                <span>Daily personalized AI-powered reports</span>
              </div>
              <div className="ml-6 space-y-2 text-sm text-gray-200">
                <div>• Health recommendations</div>
                <div>• Business & Money insights</div>
                <div>• Love & Relationships guidance</div>
                <div>• Family & Well-being advice</div>
                <div>• Spiritual Guidance</div>
              </div>
              <div className="flex items-center space-x-2 text-gray-100">
                <Check className="w-5 h-5 text-green-400" />
                <span>Compatibility Check with Partner</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-100">
                <Check className="w-5 h-5 text-green-400" />
                <span>Priority Support</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-100">
                <Check className="w-5 h-5 text-green-400" />
                <span>Early access to new features</span>
              </div>
            </div>

            <Button
              onClick={() => handleSubscribe("premium")}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-gray-900 font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isLoading && loadingPlan === "premium" ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Subscribe Now"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
