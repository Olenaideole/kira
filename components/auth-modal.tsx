"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Loader2, CheckCircle } from "lucide-react"
import { signUp, signInWithNotification } from "@/lib/auth"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  mode: "signin" | "signup"
  onModeChange: (mode: "signin" | "signup") => void
}

export function AuthModal({ isOpen, onClose, mode, onModeChange }: AuthModalProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")

    try {
      if (mode === "signup") {
        const { data, error } = await signUp(email, password)
        if (error) {
          throw new Error(error.message || "Failed to create account")
        }

        setIsSuccess(true)
        setMessage("Account created successfully! You can now sign in.")
      } else {
        const { data, error } = await signInWithNotification(email, password)
        if (error) {
          throw new Error(error.message || "Failed to sign in")
        }

        if (data?.user) {
          setIsSuccess(true)
          setMessage("Successfully signed in!")
          setTimeout(() => {
            onClose()
            // Force a page reload to update all components with new user state
            window.location.reload()
          }, 1000)
        }
      }
    } catch (error: any) {
      console.error("Auth error:", error)
      setIsSuccess(false); // Ensure success state is reset on error
      setMessage(
        typeof error.message === 'string' && error.message
        ? error.message
        : "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setEmail("")
    setPassword("")
    setMessage("")
    setIsSuccess(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleModeChange = (newMode: "signin" | "signup") => {
    resetForm()
    onModeChange(newMode)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-white/10 backdrop-blur-md border-white/20 w-full max-w-md">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 text-gray-400 hover:text-white"
            onClick={handleClose}
          >
            <X className="w-4 h-4" />
          </Button>
          <CardTitle className="text-white text-center">{mode === "signup" ? "Create Account" : "Sign In"}</CardTitle>
        </CardHeader>
        <CardContent>
          {isSuccess ? (
            <div className="text-center space-y-4">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto" />
              <p className="text-green-400">{message}</p>
              {mode === "signup" && (
                <Button onClick={() => handleModeChange("signin")} className="w-full">
                  Sign In Now
                </Button>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-200">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/20 border-white/30 text-white placeholder-gray-300"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-200">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/20 border-white/30 text-white placeholder-gray-300"
                  placeholder="Enter your password"
                  required
                  minLength={6}
                />
              </div>

              {message && (
                <p
                  className={`text-sm ${message.includes("error") || message.includes("Failed") ? "text-red-400" : "text-green-400"}`}
                >
                  {message}
                </p>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {mode === "signup" ? "Creating Account..." : "Signing In..."}
                  </>
                ) : mode === "signup" ? (
                  "Create Account"
                ) : (
                  "Sign In"
                )}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => handleModeChange(mode === "signup" ? "signin" : "signup")}
                  className="text-sm text-purple-300 hover:text-purple-200 underline"
                >
                  {mode === "signup" ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
                </button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
