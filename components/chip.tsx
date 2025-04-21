"use client"

import { cn } from "@/lib/utils"
import { FallbackImage } from "./fallback-image"

interface ChipProps {
  value: number
  onClick?: () => void
  disabled?: boolean
  className?: string
  size?: "sm" | "md" | "lg"
}

export function Chip({ value, onClick, disabled = false, className, size = "md" }: ChipProps) {
  // Get chip image based on value
  const getChipImage = () => {
    switch (value) {
      case 1:
        return "/images/chip-1.png"
      case 5:
        return "/images/chip-5.png"
      case 25:
        return "/images/chip-25.png"
      case 100:
        return "/images/chip-100.png"
      case 500:
        return "/images/chip-500.png"
      default:
        return "/images/chip-5.png"
    }
  }

  // Get size dimensions
  const getSizeDimensions = () => {
    switch (size) {
      case "sm":
        return { width: 40, height: 40 }
      case "lg":
        return { width: 80, height: 80 }
      default:
        return { width: 60, height: 60 }
    }
  }

  const { width, height } = getSizeDimensions()

  return (
    <div
      className={cn(
        "relative flex items-center justify-center cursor-pointer transform transition-all hover:scale-110",
        disabled ? "opacity-50 cursor-not-allowed" : "",
        className,
      )}
      onClick={disabled ? undefined : onClick}
    >
      <FallbackImage
        src={getChipImage()}
        alt={`${value} chip`}
        width={width}
        height={height}
        className="drop-shadow-md"
      />
      <span className="absolute text-white font-bold drop-shadow-md text-center">{value}</span>
    </div>
  )
}
