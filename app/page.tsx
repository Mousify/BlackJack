"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { ChevronRight, Trophy, Coins, Settings, Users, User } from "lucide-react"
import { BackgroundImage } from "@/components/ui/background-image"
import { useSound } from "@/lib/sounds"
import { useAuth } from "@/contexts/auth-context"
import { useGame } from "@/contexts/game-context"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { useState } from "react"

export default function Home() {
  const { playMusic, isMusicMuted, playSound, initializeAudio, userInteracted } = useSound()
  const { user, isLoading: authLoading } = useAuth()
  const { balance, canClaimDailyBonus, claimDailyBonus, setBalance: setBalanceState } = useGame()
  const [showBonusDialog, setShowBonusDialog] = useState(false)

  // Initialize audio on page load
  useEffect(() => {
    if (!userInteracted) {
      initializeAudio()
    }
  }, [initializeAudio, userInteracted])

  useEffect(() => {
    // Start background music when the page loads
    if (!isMusicMuted && userInteracted) {
      playMusic("mainTheme")
    }
  }, [playMusic, isMusicMuted, userInteracted])

  // Add useEffect to sync the balance from the game context
  useEffect(() => {
    // This ensures balance is synchronized across the app by updating whenever user changes
    if (user && !authLoading) {
      setBalanceState(balance)
    }
  }, [user, authLoading, balance])

  // Make sure dialog is shown only when the user hasn't claimed a bonus recently
  useEffect(() => {
    if (user && canClaimDailyBonus && !authLoading && !showBonusDialog) {
      setShowBonusDialog(true)
    }
  }, [user, canClaimDailyBonus, authLoading])

  const handleClaimBonus = async () => {
    const claimed = await claimDailyBonus()
    if (claimed) {
      playSound("win")
    }
    setShowBonusDialog(false)
  }

  const handleButtonClick = () => {
    playSound("buttonClick")
  }

  return (
    <main className="min-h-screen relative">
      <BackgroundImage variant="default" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md mx-auto">
          {/* Logo */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <img src="/images/logo.png" alt="Blackjack Royal" className="w-64 h-auto drop-shadow-glow" />
              </div>
            </div>
            <p className="text-yellow-300 text-lg">The Ultimate Casino Experience</p>
          </div>

          {/* User Info */}
          {user && (
            <div className="mb-6 animate-fade-in">
              <Card className="bg-black/60 border-yellow-500/30 p-3 rounded-xl">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center text-lg font-bold text-black">
                      {user.email?.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-medium">Welcome back!</p>
                      <p className="text-yellow-500 flex items-center">
                        <Coins className="h-3 w-3 mr-1" />
                        {balance} chips
                      </p>
                    </div>
                  </div>
                  <Link href="/profile">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-black/50 text-white border-yellow-500/50 rounded-xl"
                      onClick={handleButtonClick}
                    >
                      <User className="h-4 w-4 mr-1" />
                      Profile
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          )}

          {/* Main Menu */}
          <div className="space-y-4 animate-slide-up">
            <Link href={user ? "/play" : "/auth/signin"} className="block w-full">
              <Button
                variant="default"
                className="w-full py-6 text-xl bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-bold rounded-xl"
                onClick={handleButtonClick}
              >
                PLAY NOW
                <ChevronRight className="ml-2" />
              </Button>
            </Link>

            <div className="grid grid-cols-2 gap-4">
              <Link href={user ? "/achievements" : "/auth/signin"} onClick={handleButtonClick}>
                <Card className="p-4 bg-black/60 border-yellow-500/30 hover:bg-black/80 transition-all cursor-pointer rounded-xl">
                  <div className="flex flex-col items-center text-center">
                    <Trophy className="h-8 w-8 text-yellow-500 mb-2" />
                    <h3 className="font-medium text-white">Achievements</h3>
                  </div>
                </Card>
              </Link>

              <Link href={user ? "/shop" : "/auth/signin"} onClick={handleButtonClick}>
                <Card className="p-4 bg-black/60 border-yellow-500/30 hover:bg-black/80 transition-all cursor-pointer rounded-xl">
                  <div className="flex flex-col items-center text-center">
                    <Coins className="h-8 w-8 text-yellow-500 mb-2" />
                    <h3 className="font-medium text-white">Shop</h3>
                  </div>
                </Card>
              </Link>

              <Link href="/settings" onClick={handleButtonClick}>
                <Card className="p-4 bg-black/60 border-yellow-500/30 hover:bg-black/80 transition-all cursor-pointer rounded-xl">
                  <div className="flex flex-col items-center text-center">
                    <Settings className="h-8 w-8 text-yellow-500 mb-2" />
                    <h3 className="font-medium text-white">Settings</h3>
                  </div>
                </Card>
              </Link>

              <Link href={user ? "/multiplayer" : "/auth/signin"} onClick={handleButtonClick}>
                <Card className="p-4 bg-black/60 border-yellow-500/30 hover:bg-black/80 transition-all cursor-pointer rounded-xl">
                  <div className="flex flex-col items-center text-center">
                    <Users className="h-8 w-8 text-yellow-500 mb-2" />
                    <h3 className="font-medium text-white">Multiplayer</h3>
                  </div>
                </Card>
              </Link>
            </div>
          </div>

          {/* Auth Buttons */}
          {!user && !authLoading && (
            <div className="mt-8 flex gap-4 animate-fade-in-delay">
              <Link href="/auth/signin" className="flex-1" onClick={handleButtonClick}>
                <Button className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold rounded-xl">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup" className="flex-1" onClick={handleButtonClick}>
                <Button
                  variant="outline"
                  className="w-full border-yellow-500/50 text-white hover:bg-yellow-900/20 rounded-xl"
                >
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Daily Bonus Dialog */}
      <Dialog
        open={showBonusDialog}
        onOpenChange={(open) => {
          setShowBonusDialog(open)
          // If dialog is closed without claiming, we should mark it as viewed
          if (!open && canClaimDailyBonus) {
            // Optional: Add logic to temporarily hide bonus dialog
          }
        }}
      >
        <DialogContent className="bg-black/90 border-yellow-500/50 text-white rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-center text-yellow-500">Daily Bonus Available!</DialogTitle>
            <DialogDescription className="text-center text-gray-300">
              Welcome back! Your daily bonus is ready to claim.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center text-4xl font-bold text-black mb-4">
              500
            </div>
            <p className="text-white text-lg">Claim your 500 chips bonus!</p>
          </div>
          <DialogFooter>
            <Button
              onClick={handleClaimBonus}
              className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold rounded-xl"
            >
              Claim Bonus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
