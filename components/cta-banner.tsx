"use client"

import { Button } from "@/components/ui/button"
import { Sparkles, Zap } from "lucide-react"

export function CtaBanner() {
  const handleJoinBeta = () => {
    alert("Beta signup would start here")
  }

  return (
    <section className="px-6 py-20 max-w-4xl mx-auto text-center">
      <div className="bg-gradient-to-r from-purple-600/30 to-blue-600/30 backdrop-blur-md rounded-2xl p-12 border border-white/20">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Zap className="w-6 h-6 text-yellow-400" />
          <Sparkles className="w-6 h-6 text-purple-400" />
          <Zap className="w-6 h-6 text-blue-400" />
        </div>

        <h2 className="text-4xl font-bold text-white mb-4">Be the first to try Orb Super AI App</h2>

        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Your personalized everyday general AI assistant for life, work, and destiny. Join our beta today.
        </p>

        <Button
          onClick={handleJoinBeta}
          className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-12 py-4 text-lg font-semibold"
        >
          Join Beta
        </Button>
      </div>
    </section>
  )
}
