"use client"

import { useState, useEffect } from "react"
import { RotateCcw } from "lucide-react"

export function OrientationHandler() {
  const [isPortrait, setIsPortrait] = useState(true)
  const [showWarning, setShowWarning] = useState(false)

  useEffect(() => {
    // Check if we're on a mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

    const checkOrientation = () => {
      const isPortraitMode = window.matchMedia("(orientation: portrait)").matches
      setIsPortrait(isPortraitMode)

      // Only show warning on mobile devices in landscape mode
      setShowWarning(isMobile && !isPortraitMode)
    }

    // Check initial orientation
    checkOrientation()

    // Add event listener for orientation changes
    window.addEventListener("resize", checkOrientation)
    window.addEventListener("orientationchange", checkOrientation)

    // Cleanup
    return () => {
      window.removeEventListener("resize", checkOrientation)
      window.removeEventListener("orientationchange", checkOrientation)
    }
  }, [])

  if (!showWarning) return null

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-6">
      <div className="animate-spin mb-8">
        <RotateCcw className="h-16 w-16 text-yellow-500" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-4 text-center">Please Rotate Your Device</h2>
      <p className="text-gray-300 text-center mb-8">
        Blackjack Royal is designed to be played in portrait mode for the best experience.
      </p>
    </div>
  )
}
