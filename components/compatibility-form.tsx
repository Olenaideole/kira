"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Loader2, Heart } from "lucide-react"

interface CompatibilityFormProps {
  onCompatibilityGenerated: (analysis: string) => void
}

export function CompatibilityForm({ onCompatibilityGenerated }: CompatibilityFormProps) {
  const [userData, setUserData] = useState({
    birthDate: "",
    birthTime: "",
    birthPlace: "",
    palmPhoto: null as File | null,
  })

  const [partnerData, setPartnerData] = useState({
    birthDate: "",
    birthTime: "",
    birthPlace: "",
    palmPhoto: null as File | null,
  })

  const [isGenerating, setIsGenerating] = useState(false)

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
    if (!userData.birthDate || !userData.birthPlace || !partnerData.birthDate || !partnerData.birthPlace) {
      alert("Please fill in birth date and place for both partners")
      return
    }

    setIsGenerating(true)

    try {
      const response = await fetch("/api/compatibility", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: {
            ...userData,
            palmPhoto: userData.palmPhoto ? true : false,
          },
          partner: {
            ...partnerData,
            palmPhoto: partnerData.palmPhoto ? true : false,
          },
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate compatibility analysis")
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      onCompatibilityGenerated(data.analysis)
    } catch (error) {
      console.error("Error generating compatibility analysis:", error)
      alert("Error generating compatibility analysis. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <section className="px-6 py-16 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Heart className="w-8 h-8 text-pink-400" />
          <h2 className="text-4xl font-bold text-white">Compatibility Analysis</h2>
          <Heart className="w-8 h-8 text-pink-400" />
        </div>
        <p className="text-gray-300 text-lg">Discover your cosmic connection with your partner</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* User Details */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-center">Your Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-200">Date of Birth *</Label>
              <Input
                type="date"
                value={userData.birthDate}
                onChange={(e) => setUserData((prev) => ({ ...prev, birthDate: e.target.value }))}
                className="bg-white/20 border-white/30 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-200">Time of Birth</Label>
              <Select onValueChange={(value) => setUserData((prev) => ({ ...prev, birthTime: value }))}>
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
              <Label className="text-gray-200">Place of Birth *</Label>
              <Input
                placeholder="Enter city, country"
                value={userData.birthPlace}
                onChange={(e) => setUserData((prev) => ({ ...prev, birthPlace: e.target.value }))}
                className="bg-white/20 border-white/30 text-white placeholder-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-200">Palm Photo (Optional)</Label>
              <div className="border-2 border-dashed border-white/30 rounded-lg p-4 text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <Button
                  variant="outline"
                  className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                  onClick={() => document.getElementById("user-file-upload")?.click()}
                >
                  Upload Photo
                </Button>
                <input
                  id="user-file-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setUserData((prev) => ({ ...prev, palmPhoto: e.target.files![0] }))
                    }
                  }}
                />
                {userData.palmPhoto && <p className="text-green-400 text-sm mt-2">✓ {userData.palmPhoto.name}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Partner Details */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-center">Partner's Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-200">Date of Birth *</Label>
              <Input
                type="date"
                value={partnerData.birthDate}
                onChange={(e) => setPartnerData((prev) => ({ ...prev, birthDate: e.target.value }))}
                className="bg-white/20 border-white/30 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-200">Time of Birth</Label>
              <Select onValueChange={(value) => setPartnerData((prev) => ({ ...prev, birthTime: value }))}>
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
              <Label className="text-gray-200">Place of Birth *</Label>
              <Input
                placeholder="Enter city, country"
                value={partnerData.birthPlace}
                onChange={(e) => setPartnerData((prev) => ({ ...prev, birthPlace: e.target.value }))}
                className="bg-white/20 border-white/30 text-white placeholder-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-200">Palm Photo (Optional)</Label>
              <div className="border-2 border-dashed border-white/30 rounded-lg p-4 text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <Button
                  variant="outline"
                  className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                  onClick={() => document.getElementById("partner-file-upload")?.click()}
                >
                  Upload Photo
                </Button>
                <input
                  id="partner-file-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setPartnerData((prev) => ({ ...prev, palmPhoto: e.target.files![0] }))
                    }
                  }}
                />
                {partnerData.palmPhoto && <p className="text-green-400 text-sm mt-2">✓ {partnerData.palmPhoto.name}</p>}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center mt-8">
        <Button
          onClick={handleSubmit}
          disabled={
            isGenerating ||
            !userData.birthDate ||
            !userData.birthPlace ||
            !partnerData.birthDate ||
            !partnerData.birthPlace
          }
          className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-8 py-4 text-lg font-semibold disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Analyzing Compatibility...
            </>
          ) : (
            "Generate Compatibility Report"
          )}
        </Button>
      </div>
    </section>
  )
}
