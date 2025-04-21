"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface BackgroundImageProps {
  variant?: "default" | "felt" | "achievements" | "shop" | "settings" | "multiplayer"
  overlay?: boolean
  className?: string
}

export function BackgroundImage({ variant = "default", overlay = true, className }: BackgroundImageProps) {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    // Simulate image loading
    const timer = setTimeout(() => {
      setLoaded(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  // Use the same image but apply different filters/overlays based on variant
  const getVariantStyles = () => {
    switch (variant) {
      case "felt":
        return "brightness-50 saturate-50 hue-rotate-[20deg]" // Darker green tint
      case "achievements":
        return "brightness-75 sepia(50%) hue-rotate-[30deg]" // Golden tint
      case "shop":
        return "brightness-75 saturate-75 hue-rotate-[330deg]" // Purple tint
      case "settings":
        return "brightness-50 saturate-50 grayscale(50%)" // Darker grayscale
      case "multiplayer":
        return "brightness-75 saturate-100 hue-rotate-[340deg]" // Red tint
      default:
        return "brightness-100" // Default casino look
    }
  }

  // Get overlay opacity based on variant
  const getOverlayOpacity = () => {
    switch (variant) {
      case "felt":
        return "bg-green-950/70"
      case "achievements":
        return "bg-yellow-950/60"
      case "shop":
        return "bg-purple-950/60"
      case "settings":
        return "bg-gray-950/70"
      case "multiplayer":
        return "bg-red-950/60"
      default:
        return "bg-black/50"
    }
  }

  return (
    <div className={cn("fixed inset-0 w-full h-full z-0", className)}>
      {/* Fallback background color */}
      <div className="absolute inset-0 bg-green-950" />

      {/* Background image with casino theme */}
      <div
        className={cn(
          "absolute inset-0 bg-cover bg-center transition-opacity duration-1000",
          getVariantStyles(),
          loaded ? "opacity-100" : "opacity-0",
        )}
        style={{
          backgroundImage: `url(/images/casino-background.png)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Overlay for better text readability */}
      {overlay && <div className={cn("absolute inset-0", getOverlayOpacity())} />}

      {/* Additional decorative elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.4)_100%)]" />
    </div>
  )
}
