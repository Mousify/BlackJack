"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { BackgroundImage } from "@/components/ui/background-image"
import { useSound } from "@/lib/sounds"
import { Volume2, Music } from "lucide-react"
import { Label } from "@/components/ui/label"
import { OrientationHandler } from "@/components/orientation-handler"

// Import the BackButton
import { BackButton } from "@/components/back-button"

export default function SettingsPage() {
  const {
    soundVolume,
    musicVolume,
    setSoundVolume,
    setMusicVolume,
    isSoundMuted,
    isMusicMuted,
    toggleSoundMute,
    toggleMusicMute,
    playSound,
  } = useSound()

  const [vibrationEnabled, setVibrationEnabled] = useState(true)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [highQualityGraphics, setHighQualityGraphics] = useState(true)
  const [autoSave, setAutoSave] = useState(true)

  // Play sound when slider changes
  const handleSoundVolumeChange = (value: number[]) => {
    setSoundVolume(value[0])
    if (!isSoundMuted) {
      playSound("buttonClick")
    }
  }

  // Toggle vibration
  const toggleVibration = () => {
    setVibrationEnabled(!vibrationEnabled)
    playSound("buttonClick")

    // Provide haptic feedback if enabled
    if (vibrationEnabled && "vibrate" in navigator) {
      try {
        navigator.vibrate(50)
      } catch (e) {
        console.error("Vibration API error:", e)
      }
    }
  }

  return (
    <main className="min-h-screen relative">
      <BackgroundImage variant="settings" />
      <OrientationHandler />

      <div className="relative z-10 p-4">
        {/* Replace the existing Link+Button with BackButton */}
        <div className="flex justify-between items-center mb-6">
          <BackButton href="/" label="Back to Menu" />
          <h1 className="text-2xl font-bold text-white drop-shadow-glow">Settings</h1>
          <div className="w-[72px]"></div> {/* Spacer for alignment */}
        </div>

        <div className="max-w-md mx-auto space-y-6">
          {/* Audio Settings */}
          <Card className="bg-black/70 border-yellow-500/30 p-4 rounded-xl">
            <h2 className="text-xl font-bold text-yellow-500 mb-4">Audio Settings</h2>

            <div className="space-y-6">
              {/* Sound Effects */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-white flex items-center">
                    <Volume2 className="h-4 w-4 mr-2" />
                    Sound Effects
                  </Label>
                  <Switch
                    checked={!isSoundMuted}
                    onCheckedChange={() => {
                      toggleSoundMute()
                      playSound("buttonClick")
                    }}
                    className="data-[state=checked]:bg-yellow-600"
                  />
                </div>
                <Slider
                  disabled={isSoundMuted}
                  value={[soundVolume]}
                  max={1}
                  step={0.01}
                  onValueChange={handleSoundVolumeChange}
                  className={`${isSoundMuted ? "opacity-50" : ""} h-2 bg-gray-700 rounded-full border border-gray-600`}
                />
              </div>

              {/* Music */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-white flex items-center">
                    <Music className="h-4 w-4 mr-2" />
                    Music
                  </Label>
                  <Switch
                    checked={!isMusicMuted}
                    onCheckedChange={() => {
                      toggleMusicMute()
                      playSound("buttonClick")
                    }}
                    className="data-[state=checked]:bg-yellow-600"
                  />
                </div>
                <Slider
                  disabled={isMusicMuted}
                  value={[musicVolume]}
                  max={1}
                  step={0.01}
                  onValueChange={(value) => setMusicVolume(value[0])}
                  className={`${isMusicMuted ? "opacity-50" : ""} h-2 bg-gray-700 rounded-full border border-gray-600`}
                />
              </div>
            </div>
          </Card>

          {/* Gameplay Settings */}
          <Card className="bg-black/70 border-yellow-500/30 p-4 rounded-xl">
            <h2 className="text-xl font-bold text-yellow-500 mb-4">Gameplay Settings</h2>

            <div className="space-y-4">
              {/* Vibration */}
              <div className="flex items-center justify-between">
                <Label className="text-white">Vibration</Label>
                <Switch
                  checked={vibrationEnabled}
                  onCheckedChange={toggleVibration}
                  className="data-[state=checked]:bg-yellow-600"
                />
              </div>

              {/* Notifications */}
              <div className="flex items-center justify-between">
                <Label className="text-white">Notifications</Label>
                <Switch
                  checked={notificationsEnabled}
                  onCheckedChange={() => {
                    setNotificationsEnabled(!notificationsEnabled)
                    playSound("buttonClick")
                  }}
                  className="data-[state=checked]:bg-yellow-600"
                />
              </div>

              {/* Graphics Quality */}
              <div className="flex items-center justify-between">
                <Label className="text-white">High Quality Graphics</Label>
                <Switch
                  checked={highQualityGraphics}
                  onCheckedChange={() => {
                    setHighQualityGraphics(!highQualityGraphics)
                    playSound("buttonClick")
                  }}
                  className="data-[state=checked]:bg-yellow-600"
                />
              </div>

              {/* Auto Save */}
              <div className="flex items-center justify-between">
                <Label className="text-white">Auto Save Game</Label>
                <Switch
                  checked={autoSave}
                  onCheckedChange={() => {
                    setAutoSave(!autoSave)
                    playSound("buttonClick")
                  }}
                  className="data-[state=checked]:bg-yellow-600"
                />
              </div>
            </div>
          </Card>

          {/* Version Info */}
          <div className="text-center text-gray-400 text-sm mt-8">
            <p>Blackjack Royal v1.0.0</p>
            <p className="mt-1">© 2023 All Rights Reserved</p>
          </div>
        </div>
      </div>
    </main>
  )
}
