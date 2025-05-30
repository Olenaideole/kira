"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Sparkles, Heart, LogOut, Clock, TrendingUp, Plus, ArrowLeft, Menu, X } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"

interface DailyReport {
  id: string
  report_content: string
  report_date: string
  created_at: string
}

interface User {
  id: string
  email: string
  plan_type: string
  subscription_status: string
  daily_reports_enabled: boolean
  created_at: string
  birth_date?: string
  birth_time?: string
  birth_place?: string
}

interface DailyInsight {
  id: string
  insight_content: string
  insight_date: string
  created_at: string
}

interface TrialStatus {
  daysLeft: number
  reportsUsed: number
  isTrialActive: boolean
  isPremium: boolean
  canGenerateReport: boolean
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [dailyReports, setDailyReports] = useState<DailyReport[]>([])
  const [todaysReport, setTodaysReport] = useState<DailyReport | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"overview" | "daily-insights">("overview")
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const [dailyInsights, setDailyInsights] = useState<DailyInsight[]>([])
  const [todaysInsight, setTodaysInsight] = useState<DailyInsight | null>(null)
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false)
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null)

  useEffect(() => {
    checkUser()

    // Check URL parameters for tab
    const urlParams = new URLSearchParams(window.location.search)
    const tab = urlParams.get("tab")
    if (tab === "daily-insights") {
      setActiveTab("daily-insights")
    }
  }, [])

  const checkUser = async () => {
    const currentUser = await getCurrentUser()
    console.log("Current user in dashboard:", currentUser)
    if (currentUser) {
      setUser(currentUser)
      await fetchDailyReports(currentUser.id)
      await fetchDailyInsights(currentUser.id)
      await fetchTrialStatus(currentUser.id)

      // Check if user has birth data - be more flexible with the check
      const hasBirthData = currentUser.birth_date && currentUser.birth_place
      console.log("User has birth data:", hasBirthData, {
        birth_date: currentUser.birth_date,
        birth_place: currentUser.birth_place,
      })

      if (hasBirthData) {
        await generateFirstDailyInsight(currentUser.id)
      }
    }
    setIsLoading(false)
  }

  const fetchTrialStatus = async (userId: string) => {
    try {
      const response = await fetch("/api/user/trial-status", {
        headers: {
          "x-user-id": userId,
        },
      })
      if (response.ok) {
        const status = await response.json()
        setTrialStatus(status)
      }
    } catch (error) {
      console.error("Error fetching trial status:", error)
    }
  }

  const fetchDailyReports = async (userId: string) => {
    try {
      const response = await fetch("/api/user/daily-reports", {
        headers: {
          "x-user-id": userId,
        },
      })
      if (response.ok) {
        const reports = await response.json()
        setDailyReports(reports)

        // Find today's report
        const today = new Date().toISOString().split("T")[0]
        const todayReport = reports.find((report: DailyReport) => report.report_date === today)
        setTodaysReport(todayReport || null)
      }
    } catch (error) {
      console.error("Error fetching daily reports:", error)
    }
  }

  const fetchDailyInsights = async (userId: string) => {
    try {
      const response = await fetch("/api/user/daily-insights", {
        headers: {
          "x-user-id": userId,
        },
      })
      if (response.ok) {
        const insights = await response.json()
        console.log("Fetched daily insights:", insights)
        setDailyInsights(insights)

        // Find today's insight
        const today = new Date().toISOString().split("T")[0]
        const todayInsight = insights.find((insight: DailyInsight) => insight.insight_date === today)
        setTodaysInsight(todayInsight || null)
        console.log("Today's insight:", todayInsight)
      }
    } catch (error) {
      console.error("Error fetching daily insights:", error)
    }
  }

  const generateFirstDailyInsight = async (userId: string) => {
    try {
      console.log("Attempting to generate first daily insight for user:", userId)
      const response = await fetch("/api/user/generate-first-daily-insight", {
        method: "POST",
        headers: {
          "x-user-id": userId,
        },
      })

      if (response.ok) {
        const newInsight = await response.json()
        console.log("Generated new insight:", newInsight)
        setTodaysInsight(newInsight)
        setDailyInsights((prev) => [newInsight, ...prev.filter((i) => i.insight_date !== newInsight.insight_date)])
      } else {
        const error = await response.json()
        console.log("First insight generation error:", error.error)
        // Don't show error to user for automatic generation
      }
    } catch (error) {
      console.error("Error generating first daily insight:", error)
      // Don't show error to user for automatic generation
    }
  }

  const generateTodaysInsight = async () => {
    if (!user) return

    setIsGeneratingInsight(true)
    try {
      const response = await fetch("/api/user/generate-daily-insight", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
        body: JSON.stringify({
          targetDate: new Date().toISOString().split("T")[0],
        }),
      })

      if (response.ok) {
        const newInsight = await response.json()
        setTodaysInsight(newInsight)
        setDailyInsights((prev) => [newInsight, ...prev.filter((i) => i.insight_date !== newInsight.insight_date)])
      } else {
        const error = await response.json()
        alert(error.error || "Failed to generate insight")
      }
    } catch (error) {
      console.error("Error generating today's insight:", error)
      alert("Failed to generate today's insight")
    } finally {
      setIsGeneratingInsight(false)
    }
  }

  const generateTodaysReport = async () => {
    if (!user) return

    setIsGeneratingReport(true)
    try {
      const response = await fetch("/api/user/generate-today-report", {
        method: "POST",
        headers: {
          "x-user-id": user.id,
        },
      })

      if (response.ok) {
        const newReport = await response.json()
        setTodaysReport(newReport)
        setDailyReports((prev) => [newReport, ...prev])
      } else {
        const error = await response.json()
        alert(error.error || "Failed to generate report")
      }
    } catch (error) {
      console.error("Error generating today's report:", error)
      alert("Failed to generate today's report")
    } finally {
      setIsGeneratingReport(false)
    }
  }

  const handleSignOut = async () => {
    const { signOutWithNotification } = await import("@/lib/auth")
    await signOutWithNotification()
    window.location.href = "/"
  }

  const handleSubscribeClick = () => {
    window.location.href = "/#pricing"
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading your cosmic dashboard...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">Please sign in to access your dashboard</div>
          <Button onClick={() => (window.location.href = "/")}>Go to Home</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          {/* Desktop Header */}
          <div className="hidden md:flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => (window.location.href = "/")}
                variant="ghost"
                className="text-gray-300 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Main Screen
              </Button>
              <div className="h-6 w-px bg-white/20"></div>
              <h1 className="text-2xl font-bold text-white">KIRA Dashboard</h1>
              <div className="text-sm text-gray-300">
                {user?.plan_type === "premium" ? "Premium Member" : "Basic Member"}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-gray-300 text-sm">{user.email}</span>
              <Button variant="ghost" onClick={handleSignOut} className="text-gray-300 hover:text-white">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>

          {/* Mobile Header */}
          <div className="md:hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => (window.location.href = "/")}
                  variant="ghost"
                  size="sm"
                  className="text-gray-300 hover:text-white p-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <h1 className="text-lg font-bold text-white">KIRA Dashboard</h1>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="text-gray-300 hover:text-white p-2"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
              <div className="mt-4 pb-4 border-t border-white/20">
                <div className="space-y-2 pt-4">
                  <div className="text-gray-300 text-sm px-2">{user.email}</div>
                  <div className="text-gray-400 text-xs px-2">
                    {user?.plan_type === "premium" ? "Premium Member" : "Basic Member"}
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      handleSignOut()
                      setIsMobileMenuOpen(false)
                    }}
                    className="w-full justify-start text-gray-300 hover:text-white"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Free Trial Progress Bar - Only show if not premium */}
      {trialStatus && !trialStatus.isPremium && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <Card className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-md border-yellow-400/30">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-2 sm:space-y-0">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    <span className="text-orange-500 font-semibold text-sm sm:text-base">
                      3-Day Free Trial for Daily Insights
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-orange-400" />
                    <span className="text-orange-500 font-medium text-sm">
                      {trialStatus.daysLeft > 0 ? `${trialStatus.daysLeft} days left` : "Trial expired"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-4">
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-yellow-400 to-orange-400 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(0, (trialStatus.daysLeft / 3) * 100)}%` }}
                  />
                </div>
                <div className="text-xs text-gray-800 font-medium mt-2">
                  Daily insights used: {trialStatus.reportsUsed} • Days remaining: {trialStatus.daysLeft}
                </div>
              </div>

              {/* Subscribe CTA */}
              <div className="text-center">
                <Button
                  onClick={handleSubscribeClick}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg font-semibold w-full sm:w-auto"
                >
                  Subscribe for Daily Insights
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex space-x-1 bg-white/10 backdrop-blur-md rounded-lg p-1">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 py-2 px-2 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-colors ${
              activeTab === "overview" ? "bg-white/20 text-white" : "text-gray-300 hover:text-white hover:bg-white/10"
            }`}
          >
            <TrendingUp className="w-4 h-4 inline mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Overview</span>
            <span className="sm:hidden">Home</span>
          </button>
          <button
            onClick={() => setActiveTab("daily-insights")}
            className={`flex-1 py-2 px-2 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-colors ${
              activeTab === "daily-insights"
                ? "bg-white/20 text-white"
                : "text-gray-300 hover:text-white hover:bg-white/10"
            }`}
          >
            <Sparkles className="w-4 h-4 inline mr-1 sm:mr-2" />
            <span className="hidden sm:inline">My Daily Insights</span>
            <span className="sm:hidden">Insights</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-8">
        {activeTab === "overview" ? (
          <>
            {/* Welcome Section */}
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Welcome back to your cosmic journey</h2>
              <p className="text-gray-300">Your personalized insights await</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
              {/* Quick Stats */}
              <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4 sm:gap-6">
                <Card className="bg-white/10 backdrop-blur-md border-white/20">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center space-x-4">
                      <div className="bg-purple-500/20 p-3 rounded-lg">
                        <Calendar className="w-5 sm:w-6 h-5 sm:h-6 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-gray-300 text-sm">Total Insights</p>
                        <p className="text-xl sm:text-2xl font-bold text-white">{dailyInsights.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 backdrop-blur-md border-white/20">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-500/20 p-3 rounded-lg">
                        <Clock className="w-5 sm:w-6 h-5 sm:h-6 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-gray-300 text-sm">Days Active</p>
                        <p className="text-xl sm:text-2xl font-bold text-white">
                          {Math.max(
                            1,
                            Math.ceil(
                              (Date.now() - new Date(user?.created_at || Date.now()).getTime()) / (1000 * 60 * 60 * 24),
                            ),
                          )}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={() => setActiveTab("daily-insights")}
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    View Daily Insights
                  </Button>
                  <Button
                    onClick={() => (window.location.href = "/")}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Compatibility Check
                  </Button>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <>
            {/* My Daily Insights Tab */}
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">My Daily Insights</h2>
              <p className="text-gray-300">Your personalized cosmic guidance for each day</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
              {/* Today's Insight */}
              <div className="lg:col-span-2">
                <Card className="bg-white/10 backdrop-blur-md border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-5 h-5 text-purple-400" />
                        <span className="text-base sm:text-lg">Today's Cosmic Insight</span>
                      </div>
                      <div className="text-sm text-gray-300">
                        {new Date().toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    {todaysInsight ? (
                      <div className="prose prose-invert max-w-none">
                        {todaysInsight.insight_content.split("\n\n").map((paragraph, index) => (
                          <div key={index} className="mb-4">
                            {paragraph.startsWith("**") ? (
                              <h3 className="text-base sm:text-lg font-semibold text-purple-300 mb-2">
                                {paragraph.replace(/\*\*/g, "")}
                              </h3>
                            ) : (
                              <p className="text-gray-200 leading-relaxed text-sm sm:text-base">{paragraph}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-300 mb-4 text-sm sm:text-base">
                          {!user.birth_date || !user.birth_place
                            ? "Complete your birth details on the home page to generate insights."
                            : "Your daily insight hasn't been generated yet."}
                        </p>
                        {user.birth_date && user.birth_place && (
                          <Button
                            onClick={generateTodaysInsight}
                            disabled={isGeneratingInsight}
                            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 w-full sm:w-auto"
                          >
                            {isGeneratingInsight ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Generating...
                              </>
                            ) : (
                              <>
                                <Plus className="w-4 h-4 mr-2" />
                                Generate Today's Insight
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Insights History */}
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Insights History</CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {dailyInsights.map((insight) => (
                      <div
                        key={insight.id}
                        className="p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                        onClick={() => {
                          // You could expand this to show full insight in a modal
                          console.log("Show insight for", insight.insight_date)
                        }}
                      >
                        <div className="text-sm text-purple-300 font-medium">
                          {new Date(insight.insight_date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                        <div className="text-xs text-gray-400 truncate mt-1">
                          {insight.insight_content.substring(0, 80)}...
                        </div>
                      </div>
                    ))}
                    {dailyInsights.length === 0 && (
                      <div className="text-center py-8 text-gray-400 text-sm">
                        <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No insights yet.</p>
                        <p>Your daily insights will appear here.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
