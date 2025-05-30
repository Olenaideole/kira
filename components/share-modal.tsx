"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Twitter, Instagram, Link, Check } from "lucide-react"

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  report: string
}

export function ShareModal({ isOpen, onClose, report }: ShareModalProps) {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const shareText = `🔮 Just got my personalized cosmic insights from KIRA AI! ✨\n\nDiscover your destiny with AI-powered astrology and palm reading.\n\n#KIRA #Astrology #AI #Destiny`
  const shareUrl = window.location.origin

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
    window.open(twitterUrl, "_blank")
  }

  const handleInstagramShare = () => {
    // For Instagram, we'll create a shareable image
    generateShareImage()
  }

  const generateShareImage = () => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = 1080
    canvas.height = 1920

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, "#581c87") // purple-900
    gradient.addColorStop(0.5, "#1e3a8a") // blue-900
    gradient.addColorStop(1, "#312e81") // indigo-900

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Add KIRA logo text
    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 120px Arial"
    ctx.textAlign = "center"
    ctx.fillText("KIRA", canvas.width / 2, 200)

    ctx.font = "40px Arial"
    ctx.fillStyle = "#d1d5db"
    ctx.fillText("powered by Orb Super AI", canvas.width / 2, 260)

    // Add main text
    ctx.font = "60px Arial"
    ctx.fillStyle = "#ffffff"
    ctx.fillText("🔮 Your Cosmic Insights", canvas.width / 2, 400)
    ctx.fillText("Await You! ✨", canvas.width / 2, 480)

    // Add description
    ctx.font = "40px Arial"
    ctx.fillStyle = "#e5e7eb"
    const lines = ["Discover your personal destiny", "with AI-powered astrology", "and palm reading insights"]

    lines.forEach((line, index) => {
      ctx.fillText(line, canvas.width / 2, 600 + index * 60)
    })

    // Add website
    ctx.font = "50px Arial"
    ctx.fillStyle = "#a855f7"
    ctx.fillText(shareUrl, canvas.width / 2, 1600)

    // Download the image
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "kira-cosmic-insights.jpg"
        a.click()
        URL.revokeObjectURL(url)
      }
    }, "image/jpeg")
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-white/10 backdrop-blur-md border-white/20 w-full max-w-md">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 text-gray-400 hover:text-white"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
          <CardTitle className="text-white text-center">Share Your Cosmic Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-gray-300 text-sm mb-6">
            Share your KIRA experience with friends and family
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleTwitterShare}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center space-x-2"
            >
              <Twitter className="w-5 h-5" />
              <span>Share on Twitter</span>
            </Button>

            <Button
              onClick={handleInstagramShare}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white flex items-center justify-center space-x-2"
            >
              <Instagram className="w-5 h-5" />
              <span>Download for Instagram</span>
            </Button>

            <Button
              onClick={handleCopyLink}
              variant="outline"
              className="w-full border-white/30 text-white hover:bg-white/10 flex items-center justify-center space-x-2"
            >
              {copied ? <Check className="w-5 h-5" /> : <Link className="w-5 h-5" />}
              <span>{copied ? "Copied!" : "Copy Link"}</span>
            </Button>
          </div>

          <div className="text-xs text-gray-400 text-center mt-4">
            Help others discover their cosmic destiny with KIRA
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
