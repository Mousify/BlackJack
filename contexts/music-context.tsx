"use client"

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react"

type MusicContextType = {
  isPlaying: boolean
  currentTrack: string | null
  playMusic: (track: string) => void
  stopMusic: () => void
  setVolume: (volume: number) => void
  isMuted: boolean
  toggleMute: () => void
  volume: number
}

const MusicContext = createContext<MusicContextType | undefined>(undefined)

// Music files mapping
const MUSIC_FILES: Record<string, string> = {
  mainTheme: "/sounds/main-theme.mp3",
  gameTheme: "/sounds/game-music-1.mp3",
}

export function MusicProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrack, setCurrentTrack] = useState<string | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolumeState] = useState(0.5)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio()
    audio.loop = true
    audio.volume = volume
    audioRef.current = audio
    setIsInitialized(true)

    return () => {
      audio.pause()
      audio.src = ""
    }
  }, [])

  // Play music
  const playMusic = (track: string) => {
    if (!isInitialized) return

    // Get the correct file path
    const musicSrc = MUSIC_FILES[track] || track

    // If already playing this track, do nothing
    if (isPlaying && currentTrack === track) return

    if (audioRef.current) {
      // If already playing something else, stop it first
      if (isPlaying) {
        audioRef.current.pause()
      }

      audioRef.current.src = musicSrc
      audioRef.current.volume = isMuted ? 0 : volume

      const playPromise = audioRef.current.play()

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true)
            setCurrentTrack(track)
          })
          .catch((e) => {
            console.error("Error playing music:", e)
            setIsPlaying(false)
          })
      }
    }
  }

  // Stop music
  const stopMusic = () => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)
      setCurrentTrack(null)
    }
  }

  // Set volume
  const setVolume = (newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume))
    setVolumeState(clampedVolume)

    if (audioRef.current && !isMuted) {
      audioRef.current.volume = clampedVolume
    }
  }

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted)

    if (audioRef.current) {
      audioRef.current.volume = !isMuted ? 0 : volume
    }
  }

  return (
    <MusicContext.Provider
      value={{
        isPlaying,
        currentTrack,
        playMusic,
        stopMusic,
        setVolume,
        isMuted,
        toggleMute,
        volume,
      }}
    >
      {children}
    </MusicContext.Provider>
  )
}

export function useMusic() {
  const context = useContext(MusicContext)
  if (context === undefined) {
    throw new Error("useMusic must be used within a MusicProvider")
  }
  return context
}
