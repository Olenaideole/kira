// Pure custom authentication system - NO Supabase dependencies

// Simple auth state management
let currentUser: any = null

// Event listeners for auth state changes
const authListeners: ((user: any) => void)[] = []

// Custom auth functions using our own API
export const signUp = async (email: string, password: string) => {
  try {
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Failed to create account")
    }

    return { data, error: null }
  } catch (error) {
    console.error("SignUp error:", error)
    return { data: null, error }
  }
}

export const signIn = async (email: string, password: string) => {
  try {
    const response = await fetch("/api/auth/signin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Failed to sign in")
    }

    // Store user in localStorage and memory
    currentUser = data.user
    if (typeof window !== "undefined") {
      localStorage.setItem("kira_user", JSON.stringify(data.user))
    }

    // Notify listeners
    notifyAuthListeners(data.user)

    return { data: { user: data.user }, error: null }
  } catch (error) {
    console.error("SignIn error:", error)
    return { data: null, error }
  }
}

export const signOut = async () => {
  try {
    currentUser = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("kira_user")
    }

    // Notify listeners
    notifyAuthListeners(null)

    return { error: null }
  } catch (error) {
    console.error("SignOut error:", error)
    return { error }
  }
}

export const getCurrentUser = async () => {
  try {
    // Check memory first
    if (currentUser) {
      return currentUser
    }

    // Check localStorage
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("kira_user")
      if (stored) {
        try {
          currentUser = JSON.parse(stored)
          return currentUser
        } catch (parseError) {
          // If parsing fails, clear the corrupted data
          localStorage.removeItem("kira_user")
        }
      }
    }

    return null
  } catch (error) {
    console.error("Get current user error:", error)
    return null
  }
}

// Simple event emitter for auth state changes
export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
  const listener = (user: any) => {
    callback(user ? "SIGNED_IN" : "SIGNED_OUT", user ? { user } : null)
  }
  authListeners.push(listener)

  return {
    data: {
      subscription: {
        unsubscribe: () => {
          const index = authListeners.indexOf(listener)
          if (index > -1) {
            authListeners.splice(index, 1)
          }
        },
      },
    },
  }
}

// Notify listeners of auth state changes
const notifyAuthListeners = (user: any) => {
  authListeners.forEach((listener) => {
    try {
      listener(user)
    } catch (error) {
      console.error("Error in auth listener:", error)
    }
  })
}

// Convenience functions with notification
export const signInWithNotification = signIn
export const signOutWithNotification = signOut
