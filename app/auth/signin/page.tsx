"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { BackgroundImage } from "@/components/ui/background-image"
import { useToast } from "@/hooks/use-toast"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useSound } from "@/lib/sounds"
import { BackButton } from "@/components/back-button"

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { signIn } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectedFrom = searchParams.get("redirectedFrom") || "/"
  const { playMusic, isMusicMuted, initializeAudio, userInteracted } = useSound()

  // Initialize audio on page load
  useEffect(() => {
    if (!userInteracted) {
      initializeAudio()
    }
  }, [initializeAudio, userInteracted])

  useEffect(() => {
    // Continue playing music if it's not muted
    if (!isMusicMuted && userInteracted) {
      playMusic("mainTheme")
    }
  }, [playMusic, isMusicMuted, userInteracted])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsLoading(true)
      await signIn(email, password)
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      })
      router.push(redirectedFrom)
    } catch (error: any) {
      let errorMessage = "Please check your credentials and try again."

      // Handle specific error messages
      if (error.message.includes("Email not confirmed")) {
        errorMessage = "Please check your email and confirm your account before signing in."
      } else if (error.message.includes("Invalid login credentials")) {
        errorMessage = "Invalid email or password. Please try again."
      }

      toast({
        title: "Sign in failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen relative">
      <BackgroundImage />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <BackButton href="/" />
          </div>
          <Card className="w-full max-w-md bg-black/70 border-yellow-500/30 rounded-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center text-white">Sign In</CardTitle>
              <CardDescription className="text-center text-gray-300">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-black/50 border-yellow-500/30 text-white rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-black/50 border-yellow-500/30 text-white rounded-xl"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button
                  type="submit"
                  className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold rounded-xl"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
                <div className="text-center text-gray-300">
                  Don't have an account?{" "}
                  <Link href="/auth/signup" className="text-yellow-500 hover:underline">
                    Sign Up
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </main>
  )
}
