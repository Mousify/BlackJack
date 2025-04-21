"use client"

import type React from "react"

import { useState, useEffect } from "react"

interface TouchFeedbackProps {
  children: React.ReactNode
  className?: string
  activeClassName?: string
  onClick?: () => void
  disabled?: boolean
}

export function TouchFeedback({
  children,
  className = "",
  activeClassName = "opacity-70 scale-95",
  onClick,
  disabled = false,
}: TouchFeedbackProps) {
  const [isActive, setIsActive] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check if we're on a mobile device
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent))
  }, [])

  const handleTouchStart = () => {
    if (disabled) return
    setIsActive(true)

    // Provide haptic feedback if available
    if ("vibrate" in navigator) {
      try {
        navigator.vibrate(20)
      } catch (e) {
        // Ignore errors with vibration API
      }
    }
  }

  const handleTouchEnd = () => {
    if (disabled) return
    setIsActive(false)
    if (onClick) onClick()
  }

  // Only apply touch events on mobile
  const touchProps = isMobile
    ? {
        onTouchStart: handleTouchStart,
        onTouchEnd: handleTouchEnd,
        onTouchCancel: () => setIsActive(false),
      }
    : {
        onClick: disabled ? undefined : onClick,
      }

  return (
    <div className={`${className} ${isActive ? activeClassName : ""} transition-all duration-150`} {...touchProps}>
      {children}
    </div>
  )
}
