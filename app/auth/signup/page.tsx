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
import Link from "next/link"
import { useSound } from "@/lib/sounds"
import { BackButton } from "@/components/back-button"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { signUp } = useAuth()
  const { toast } = useToast()
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

    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      await signUp(email, password, username)
      setIsSuccess(true)
      toast({
        title: "Verification email sent!",
        description: "Please check your email to verify your account.",
      })
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message || "Please check your information and try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <main className="min-h-screen relative">
        <BackgroundImage />

        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
          <Card className="w-full max-w-md bg-black/70 border-yellow-500/30 rounded-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center text-white">Check Your Email</CardTitle>
              <CardDescription className="text-center text-gray-300">
                We've sent a verification link to your email address.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <p className="text-white">
                Please check your email at <span className="font-bold text-yellow-500">{email}</span> and click the
                verification link to complete your registration.
              </p>
              <p className="text-gray-300">After verifying your email, you'll be able to sign in to your account.</p>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Link href="/auth/signin" className="w-full">
                <Button className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold rounded-xl">
                  Go to Sign In
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </main>
    )
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
              <CardTitle className="text-2xl font-bold text-center text-white">Create Account</CardTitle>
              <CardDescription className="text-center text-gray-300">
                Sign up to start playing and track your progress
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-white">
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="YourUsername"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="bg-black/50 border-yellow-500/30 text-white rounded-xl"
                  />
                </div>
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
                  <p className="text-xs text-gray-400">Password must be at least 6 characters long</p>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button
                  type="submit"
                  className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold rounded-xl"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Sign Up"}
                </Button>
                <div className="text-center text-gray-300">
                  Already have an account?{" "}
                  <Link href="/auth/signin" className="text-yellow-500 hover:underline">
                    Sign In
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
