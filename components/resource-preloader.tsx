"use client"

import { useEffect } from "react"

// List of resources to preload
const RESOURCES = {
  images: ["/images/logo.png", "/images/casino-background.jpg", "/images/felt-background.jpg"],
  sounds: [
    "/sounds/card-deal.mp3",
    "/sounds/card-flip.mp3",
    "/sounds/chip-stack.mp3",
    "/sounds/chip-single.mp3",
    "/sounds/win.mp3",
    "/sounds/lose.mp3",
    "/sounds/push.mp3",
    "/sounds/button-click.mp3",
    "/sounds/main-theme.mp3",
    "/sounds/game-music-1.mp3",
  ],
}

export function ResourcePreloader() {
  useEffect(() => {
    // Preload images
    RESOURCES.images.forEach((src) => {
      const img = new Image()
      img.src = src
    })

    // Preload audio
    RESOURCES.sounds.forEach((src) => {
      const audio = new Audio()
      audio.preload = "auto"
      audio.src = src
    })
  }, [])

  return null
}
