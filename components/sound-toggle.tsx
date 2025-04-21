"use client"

import { useSound } from "@/lib/sounds"
import { Button } from "@/components/ui/button"
import { Volume2, VolumeX, Music, Music2 } from "lucide-react"

export function SoundToggle() {
  const { isSoundMuted, toggleSoundMute, isMusicMuted, toggleMusicMute, playSound } = useSound()

  const handleSoundToggle = () => {
    playSound("buttonClick")
    toggleSoundMute()
  }

  const handleMusicToggle = () => {
    playSound("buttonClick")
    toggleMusicMute()
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={handleSoundToggle}
        className="bg-black/50 text-white border-white/20 h-9 w-9"
        aria-label={isSoundMuted ? "Unmute sounds" : "Mute sounds"}
      >
        {isSoundMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={handleMusicToggle}
        className="bg-black/50 text-white border-white/20 h-9 w-9"
        aria-label={isMusicMuted ? "Unmute music" : "Mute music"}
      >
        {isMusicMuted ? <Music2 size={18} /> : <Music size={18} />}
      </Button>
    </div>
  )
}
