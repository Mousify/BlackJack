"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useSounds } from "@/lib/sounds"
import { Volume2 } from "lucide-react"

export function AudioInitializer() {
  const { userInteracted, initializeAudio } = useSounds()
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // Only show the prompt after a short delay and if audio isn't already initialized
    const timer = setTimeout(() => {
      if (!userInteracted) {
        setShowPrompt(true)
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [userInteracted])

  const handleEnable = () => {
    initializeAudio()
    setShowPrompt(false)
  }

  if (userInteracted || !showPrompt) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50 p-4">
      <div className="bg-black/90 border border-yellow-500/50 p-6 rounded-lg text-center max-w-md">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-yellow-600 flex items-center justify-center">
            <Volume2 className="h-8 w-8 text-black" />
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-2 text-yellow-500">Enable Game Sounds</h2>
        <p className="mb-6 text-gray-300">
          Blackjack Royal includes sound effects and music to enhance your gaming experience.
        </p>
        <div className="flex gap-3">
          <Button onClick={handleEnable} className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-3">
            Enable Sounds
          </Button>
          <Button
            onClick={() => setShowPrompt(false)}
            variant="outline"
            className="flex-1 border-yellow-500/50 text-white hover:bg-yellow-900/20"
          >
            Not Now
          </Button>
        </div>
      </div>
    </div>
  )
}
