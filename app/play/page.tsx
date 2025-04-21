"use client"

import { useState, useEffect } from "react"
import { BackgroundImage } from "@/components/ui/background-image"
import EnhancedGameBoard from "@/components/enhanced-game-board"
import { MobileNav } from "@/components/mobile-nav"
import { OrientationHandler } from "@/components/orientation-handler"
import { useSound } from "@/lib/sounds"
// Import the BackButton
import { BackButton } from "@/components/back-button"

export default function PlayPage() {
  const { playMusic, stopMusic, isMusicMuted } = useSound()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Start game music when the page loads
    if (!isMusicMuted) {
      playMusic("gameTheme")
    }

    // Simulate loading assets
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    // Stop music when navigating away
    return () => {
      stopMusic()
      clearTimeout(timer)
    }
  }, [playMusic, stopMusic, isMusicMuted])

  return (
    <div className="min-h-screen relative">
      <BackgroundImage variant="felt" />
      <OrientationHandler />

      <div className="relative z-10 pb-16">
        <div className="p-4">
          <BackButton href="/" label="Back to Menu" />
        </div>

        {isLoading ? (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white">Loading game...</p>
            </div>
          </div>
        ) : (
          <EnhancedGameBoard />
        )}
      </div>

      <MobileNav />
    </div>
  )
}
