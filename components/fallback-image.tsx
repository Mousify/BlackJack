"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface FallbackImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  fallbackClassName?: string
}

export function FallbackImage({
  src,
  alt,
  width = 300,
  height = 200,
  className,
  fallbackClassName,
}: FallbackImageProps) {
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Reset states when src changes
    setError(false)
    setLoading(true)
  }, [src])

  // Generate initials from alt text
  const getInitials = () => {
    return alt
      .split(" ")
      .map((word) => word[0])
      .join("")
      .substring(0, 2)
      .toUpperCase()
  }

  if (error) {
    // Render CSS fallback
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900 text-white",
          fallbackClassName,
        )}
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        <div className="text-center">
          <div className="text-2xl font-bold">{getInitials()}</div>
          <div className="text-xs mt-1">{alt}</div>
        </div>
      </div>
    )
  }

  return (
    <>
      {loading && (
        <div
          className={cn("animate-pulse bg-gray-700", fallbackClassName)}
          style={{ width: `${width}px`, height: `${height}px` }}
        />
      )}
      <img
        src={src || "/placeholder.svg"}
        alt={alt}
        width={width}
        height={height}
        className={cn(loading ? "hidden" : "", className)}
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false)
          setError(true)
        }}
      />
    </>
  )
}
