"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { Session, User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signUp: (email: string, password: string, username: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  getProfile: () => Promise<any>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check active session
    const initAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        setSession(session)
        setUser(session?.user ?? null)

        // Listen for auth changes
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
          setSession(session)
          setUser(session?.user ?? null)
          router.refresh()
        })

        return () => {
          subscription.unsubscribe()
        }
      } catch (error) {
        console.error("Auth initialization error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [router])

  // Sign up with email and password
  const signUp = async (email: string, password: string, username: string) => {
    try {
      // First, create the auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            username,
          },
        },
      })

      if (error) throw error

      // After auth user is created, wait a moment to ensure it's registered in the system
      if (data.user) {
        try {
          // Use a small delay to give auth time to process
          await new Promise((resolve) => setTimeout(resolve, 1000))

          // Create the profile explicitly with service role
          const { error: profileError } = await supabase.from("profiles").insert({
            id: data.user.id,
            username,
            chips: 1000,
            vip_level: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })

          if (!profileError) {
            // Add an additional delay before creating game stats
            await new Promise((resolve) => setTimeout(resolve, 1000))

            // Create initial game stats
            await supabase.from("game_stats").insert({
              user_id: data.user.id,
              hands_played: 0,
              hands_won: 0,
              hands_lost: 0,
              blackjacks: 0,
              biggest_win: 0,
              longest_streak: 0,
            })
          }
        } catch (setupError) {
          console.log("Profile creation will be handled by trigger or retried on sign-in", setupError)
        }
      }

      return data
    } catch (error) {
      console.error("Error signing up:", error)
      throw error
    }
  }

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Update user and session state immediately
      setUser(data.user)
      setSession(data.session)

      return data
    } catch (error) {
      console.error("Error signing in:", error)
      throw error
    }
  }

  // Sign out
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      // Clear user and session state immediately
      setUser(null)
      setSession(null)

      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
      throw error
    }
  }

  // Get user profile
  const getProfile = async () => {
    try {
      if (!user) throw new Error("No user")

      const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error getting profile:", error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        signUp,
        signIn,
        signOut,
        getProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
