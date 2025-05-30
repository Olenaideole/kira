"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, User, LogOut, HelpCircle } from "lucide-react"
import { AuthModal } from "./auth-modal"
import { SupportModal } from "./support-modal"
import { getCurrentUser, signOutWithNotification, onAuthStateChange } from "@/lib/auth"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin")
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkUser()

    // Listen for auth state changes
    const {
      data: { subscription },
    } = onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session?.user?.email)
      if (event === "SIGNED_IN") {
        setUser(session?.user || null)
      } else if (event === "SIGNED_OUT") {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error("Error checking user:", error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOutWithNotification()
      setUser(null)
      setIsMenuOpen(false)
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const scrollToPricing = () => {
    const pricingSection = document.getElementById("pricing")
    pricingSection?.scrollIntoView({ behavior: "smooth" })
    setIsMenuOpen(false)
  }

  const openAuthModal = (mode: "signin" | "signup") => {
    setAuthMode(mode)
    setIsAuthModalOpen(true)
    setIsMenuOpen(false)
  }

  return (
    <>
      <header className="w-full px-6 py-4 flex items-center justify-between relative z-20">
        <div className="flex items-center space-x-2">
          <div className="text-2xl font-bold text-white">KIRA</div>
          <div className="text-sm text-gray-300 mt-2">powered by Orb Super AI</div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <button onClick={scrollToPricing} className="text-gray-300 hover:text-white transition-colors duration-200">
            Pricing
          </button>

          {user && (
            <button
              onClick={() => (window.location.href = "/dashboard?tab=daily-insights")}
              className="text-gray-300 hover:text-white transition-colors duration-200"
            >
              My Daily Insights
            </button>
          )}

          {isLoading ? (
            <div className="text-gray-300 text-sm">Loading...</div>
          ) : user ? (
            <div className="flex items-center space-x-4">
              <span className="text-gray-300 text-sm">{user.email}</span>
              <Button
                variant="ghost"
                onClick={() => setIsSupportModalOpen(true)}
                className="text-gray-300 hover:text-white"
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                Support
              </Button>
              <Button variant="ghost" onClick={handleSignOut} className="text-gray-300 hover:text-white">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          ) : (
            <>
              <Button
                variant="ghost"
                onClick={() => openAuthModal("signin")}
                className="text-gray-300 hover:text-white"
              >
                Sign In
              </Button>
              <Button
                onClick={() => openAuthModal("signup")}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0"
              >
                Sign Up
              </Button>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden text-gray-300 hover:text-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-black/90 backdrop-blur-md border-t border-white/20 md:hidden">
            <div className="px-6 py-4 space-y-4">
              <button
                onClick={scrollToPricing}
                className="block w-full text-left text-gray-300 hover:text-white transition-colors"
              >
                Pricing
              </button>

              {user && (
                <button
                  onClick={() => {
                    window.location.href = "/dashboard?tab=daily-insights"
                    setIsMenuOpen(false)
                  }}
                  className="block w-full text-left text-gray-300 hover:text-white transition-colors"
                >
                  My Daily Insights
                </button>
              )}

              {isLoading ? (
                <div className="text-gray-300 text-sm">Loading...</div>
              ) : user ? (
                <>
                  <div className="flex items-center space-x-2 text-gray-300 text-sm">
                    <User className="w-4 h-4" />
                    <span>{user.email}</span>
                  </div>
                  <button
                    onClick={() => {
                      setIsSupportModalOpen(true)
                      setIsMenuOpen(false)
                    }}
                    className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span>Support</span>
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => openAuthModal("signin")}
                    className="w-full justify-start text-gray-300 hover:text-white"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => openAuthModal("signup")}
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        mode={authMode}
        onModeChange={setAuthMode}
      />

      <SupportModal isOpen={isSupportModalOpen} onClose={() => setIsSupportModalOpen(false)} userEmail={user?.email} />
    </>
  )
}
