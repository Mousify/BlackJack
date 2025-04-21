"use client"

import { useRouter } from "next/navigation"
import { useSound } from "@/lib/sounds"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface BackButtonProps {
  href?: string
  label?: string
  className?: string
  onClick?: () => void
}

export function BackButton({ href, label = "Back to Menu", className = "", onClick }: BackButtonProps) {
  const router = useRouter()
  const { playSound } = useSound()

  const handleClick = () => {
    playSound("buttonClick")

    // If custom onClick is provided, call it
    if (onClick) {
      onClick()
      return
    }

    if (href) {
      router.push(href)
    } else {
      router.back()
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className={`bg-black/50 text-white border-yellow-500/50 hover:bg-black/70 ${className}`}
      onClick={handleClick}
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      {label}
    </Button>
  )
}
