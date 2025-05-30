"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, Loader2 } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { AuthModal } from "./auth-modal"

interface FormSectionProps {
  onReportGenerated: (report: string) => void
  onGeneratingChange: (generating: boolean) => void
}

export function FormSection({ onReportGenerated, onGeneratingChange }: FormSectionProps) {
  const [formData, setFormData] = useState({
    birthDate: "",
    birthTime: "",
    birthPlace: "",
    palmPhoto: null as File | null,
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signup")

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const currentUser = await getCurrentUser()
    setUser(currentUser)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = (file: File) => {
    setFormData((prev) => ({ ...prev, palmPhoto: file }))
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  const generateTimeOptions = () => {
    const times = ["Unknown"]
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
        times.push(timeString)
      }
    }
    return times
  }

  const handleSubmit = async () => {
    if (!formData.birthDate || !formData.birthPlace) {
      alert("Please fill in all required fields")
      return
    }

    setIsGenerating(true)
    onGeneratingChange(true)

    try {
      // Generate report without requiring authentication
      const response = await fetch("/api/generate-general-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          birthDate: formData.birthDate,
          birthTime: formData.birthTime,
          birthPlace: formData.birthPlace,
          palmPhoto: formData.palmPhoto ? true : false,
          userId: user?.id || null, // Optional - only for saving to history if logged in
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      if (data.error) {
        throw new Error(data.error)
      }

      if (!data.report) {
        throw new Error("No report data received")
      }

      onReportGenerated(data.report)
    } catch (error) {
      console.error("Error generating report:", error)
      alert(`Error generating report: ${error.message}. Please try again.`)
    } finally {
      setIsGenerating(false)
      onGeneratingChange(false)
    }
  }

  return (
    <>
      <section className="px-6 py-16 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Get Your Personal Cosmic Analysis</h2>
          <p className="text-gray-300 text-lg">Discover your unique astrological and palm reading insights</p>
          {!user && (
            <p className="text-purple-300 text-sm mt-2">
              ✨ No registration required for your first report! Sign up to save your insights and get daily guidance.
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Birth Details Form */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-6 space-y-6">
              <h3 className="text-2xl font-semibold text-white mb-4">Birth Details</h3>

              <div className="space-y-2">
                <Label htmlFor="birthDate" className="text-gray-200">
                  Date of Birth *
                </Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleInputChange("birthDate", e.target.value)}
                  className="bg-white/20 border-white/30 text-white placeholder-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthTime" className="text-gray-200">
                  Time of Birth
                </Label>
                <Select onValueChange={(value) => handleInputChange("birthTime", value)}>
                  <SelectTrigger className="bg-white/20 border-white/30 text-white">
                    <SelectValue placeholder="Select time or Unknown" />
                  </SelectTrigger>
                  <SelectContent>
                    {generateTimeOptions().map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthPlace" className="text-gray-200">
                  Place of Birth *
                </Label>
                <Input
                  id="birthPlace"
                  placeholder="Enter city, country"
                  value={formData.birthPlace}
                  onChange={(e) => handleInputChange("birthPlace", e.target.value)}
                  className="bg-white/20 border-white/30 text-white placeholder-gray-300"
                />
              </div>
            </CardContent>
          </Card>

          {/* Palm Photo Upload */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-6">
              <h3 className="text-2xl font-semibold text-white mb-4">Palm Photo</h3>

              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive ? "border-purple-400 bg-purple-400/20" : "border-white/30 hover:border-white/50"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {formData.palmPhoto ? (
                  <div className="space-y-2">
                    <div className="text-green-400 text-lg">✓ Photo uploaded</div>
                    <div className="text-gray-300 text-sm">{formData.palmPhoto.name}</div>
                    <Button
                      onClick={() => setFormData((prev) => ({ ...prev, palmPhoto: null }))}
                      variant="outline"
                      size="sm"
                      className="border-white/30 text-white hover:bg-white/10"
                    >
                      Remove Photo
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                    <div className="text-gray-300">
                      <p className="text-lg mb-2">Drag & drop your palm photo here</p>
                      <p className="text-sm text-gray-400">or</p>
                    </div>

                    <Button
                      variant="outline"
                      className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                      onClick={() => document.getElementById("file-upload")?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Take photo or choose file
                    </Button>

                    <input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUpload(e.target.files[0])
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <Button
            onClick={handleSubmit}
            disabled={isGenerating || !formData.birthDate || !formData.birthPlace}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-4 text-lg font-semibold disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating Your Report...
              </>
            ) : (
              "Get My Cosmic Analysis"
            )}
          </Button>

          {!user && (
            <div className="mt-4 text-center">
              <p className="text-gray-300 text-sm mb-2">Want to save your insights and get daily guidance?</p>
              <Button
                onClick={() => setShowAuthModal(true)}
                variant="outline"
                className="border-purple-400/50 bg-purple-500/20 text-white hover:bg-purple-500/30"
              >
                Sign Up for Free
              </Button>
            </div>
          )}
        </div>
      </section>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onModeChange={setAuthMode}
      />
    </>
  )
}
