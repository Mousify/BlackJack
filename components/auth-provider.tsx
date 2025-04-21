"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import type { Session, User } from "@supabase/supabase-js"

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  signOut: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const getSession = async () => {
      console.log("AuthProvider: Getting initial session")
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession()
      console.log("AuthProvider: Initial session retrieved", currentSession ? "Session exists" : "No session")
      setSession(currentSession)
      setUser(currentSession?.user || null)
      setIsLoading(false)
    }

    getSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      console.log(`AuthProvider: Auth state changed: ${_event}`, currentSession ? "Session exists" : "No session")
      setSession(currentSession)
      setUser(currentSession?.user || null)
      setIsLoading(false)

      // Force a router refresh to update server components
      console.log("AuthProvider: Refreshing router to update server components")
      router.refresh()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  const signOut = async () => {
    console.log("AuthProvider: Signing out")
    await supabase.auth.signOut()
    console.log("AuthProvider: Sign out complete, redirecting to login")
    router.push("/login")
    router.refresh()
  }

  console.log("AuthProvider: Rendering with user", user?.id || "no user")

  return <AuthContext.Provider value={{ user, session, isLoading, signOut }}>{children}</AuthContext.Provider>
}
