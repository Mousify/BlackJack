"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { supabase } from "@/lib/supabase/client"
import { useAuth } from "./auth-context"
import { useToast } from "@/hooks/use-toast"

type GameContextType = {
  balance: number
  setBalance: (balance: number) => void
  addWin: (amount?: number) => Promise<void>
  addLoss: (amount?: number) => Promise<void>
  addBlackjack: () => Promise<void>
  addGamePlayed: () => Promise<void>
  saveGameState: (gameData: any) => Promise<void>
  loadGameState: () => Promise<any>
  gameStats: GameStats
  isLoading: boolean
  claimDailyBonus: () => Promise<boolean>
  canClaimDailyBonus: boolean
}

type GameStats = {
  handsPlayed: number
  handsWon: number
  handsLost: number
  blackjacks: number
  biggestWin: number
  longestStreak: number
  currentStreak: number
}

const GameContext = createContext<GameContextType | undefined>(undefined)

export function GameProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [balance, setBalanceState] = useState(1000)
  const [gameStats, setGameStats] = useState<GameStats>({
    handsPlayed: 0,
    handsWon: 0,
    handsLost: 0,
    blackjacks: 0,
    biggestWin: 0,
    longestStreak: 0,
    currentStreak: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [canClaimDailyBonus, setCanClaimDailyBonus] = useState(false)

  // Load user data when authenticated
  useEffect(() => {
    if (user) {
      loadUserData()
      checkDailyBonus()
    } else {
      setIsLoading(false)
    }
  }, [user])

  // Improve the loadUserData function to handle race conditions and retry logic
  const loadUserData = async () => {
    try {
      setIsLoading(true)

      // Add retry mechanism for profile fetch
      let profile = null
      let profileError = null
      let retryCount = 0

      while (!profile && retryCount < 3) {
        const { data, error } = await supabase.from("profiles").select("*").eq("id", user!.id).single()

        if (!error) {
          profile = data
          break
        }

        profileError = error
        retryCount++
        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }

      // If still no profile after retries, create one
      if (!profile) {
        // If profile doesn't exist, create one
        if (profileError && profileError.code === "PGRST116") {
          try {
            const { data: newProfile, error: createError } = await supabase
              .from("profiles")
              .insert({
                id: user!.id,
                username: user!.email?.split("@")[0] || "Player",
                chips: 1000,
                vip_level: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .select()
              .single()

            if (createError) {
              console.error("Error creating profile:", createError)
              setBalanceState(1000) // Default balance
            } else if (newProfile) {
              profile = newProfile
              setBalanceState(newProfile.chips)

              // Wait a moment to ensure profile is created before creating game stats
              await new Promise((resolve) => setTimeout(resolve, 1000))

              // Create game stats after profile is created
              try {
                await supabase.from("game_stats").insert({
                  user_id: user!.id,
                  hands_played: 0,
                  hands_won: 0,
                  hands_lost: 0,
                  blackjacks: 0,
                  biggest_win: 0,
                  longest_streak: 0,
                })
              } catch (statsError) {
                console.error("Error creating game stats after profile:", statsError)
              }
            }
          } catch (err) {
            console.error("Error in profile creation process:", err)
            setBalanceState(1000) // Default balance
          }
        } else {
          console.error("Error loading profile:", profileError)
          setBalanceState(1000) // Default balance
        }
      } else {
        setBalanceState(profile.chips)
      }

      // Get game stats with retry logic
      let stats = null
      let statsRetryCount = 0

      while (!stats && statsRetryCount < 3) {
        const { data, error } = await supabase.from("game_stats").select("*").eq("user_id", user!.id).single()

        if (!error) {
          stats = data
          break
        }

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, 1000))
        statsRetryCount++
      }

      if (!stats) {
        // Create stats if they don't exist after retries
        try {
          const { data: newStats, error: createError } = await supabase
            .from("game_stats")
            .insert({
              user_id: user!.id,
              hands_played: 0,
              hands_won: 0,
              hands_lost: 0,
              blackjacks: 0,
              biggest_win: 0,
              longest_streak: 0,
            })
            .select()
            .single()

          if (createError) {
            console.error("Error creating game stats:", createError)
          } else {
            stats = newStats
          }

          setGameStats({
            handsPlayed: 0,
            handsWon: 0,
            handsLost: 0,
            blackjacks: 0,
            biggestWin: 0,
            longestStreak: 0,
            currentStreak: 0,
          })
        } catch (err) {
          console.error("Error in game stats creation process:", err)
        }
      } else {
        setGameStats({
          handsPlayed: stats.hands_played || 0,
          handsWon: stats.hands_won || 0,
          handsLost: stats.hands_lost || 0,
          blackjacks: stats.blackjacks || 0,
          biggestWin: stats.biggest_win || 0,
          longestStreak: stats.longest_streak || 0,
          currentStreak: 0,
        })
      }

      setIsLoading(false)
    } catch (error) {
      console.error("Error loading user data:", error)
      setIsLoading(false)
    }
  }

  // Check if user can claim daily bonus
  const checkDailyBonus = async () => {
    try {
      if (!user) return

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("last_daily_bonus")
        .eq("id", user.id)
        .single()

      if (error) {
        if (error.code === "PGRST116") {
          // No profile found, they can claim bonus
          setCanClaimDailyBonus(true)
          return
        }
        throw error
      }

      if (!profile.last_daily_bonus) {
        setCanClaimDailyBonus(true)
        return
      }

      const lastBonus = new Date(profile.last_daily_bonus)
      const now = new Date()

      // Check if last bonus was claimed more than 24 hours ago
      if (now.getTime() - lastBonus.getTime() > 24 * 60 * 60 * 1000) {
        setCanClaimDailyBonus(true)
      } else {
        setCanClaimDailyBonus(false)
      }
    } catch (error) {
      console.error("Error checking daily bonus:", error)
      // Default to allowing bonus if there's an error
      setCanClaimDailyBonus(true)
    }
  }

  // Fix the daily bonus claim function to handle potential errors
  const claimDailyBonus = async () => {
    try {
      if (!user) return false

      const bonusAmount = 500

      // First, verify the profile exists before updating
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single()

      if (profileCheckError) {
        // Profile doesn't exist, try to create it first
        const { error: createProfileError } = await supabase.from("profiles").insert({
          id: user.id,
          username: user.email?.split("@")[0] || "Player",
          chips: 1000 + bonusAmount,
          vip_level: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_daily_bonus: new Date().toISOString(),
        })

        if (createProfileError) {
          console.error("Error creating profile for bonus:", createProfileError)
          return false
        }

        setBalanceState(1000 + bonusAmount)
      } else {
        // Update balance and last_daily_bonus
        const { error } = await supabase
          .from("profiles")
          .update({
            chips: balance + bonusAmount,
            last_daily_bonus: new Date().toISOString(),
          })
          .eq("id", user.id)

        if (error) throw error

        setBalanceState(balance + bonusAmount)
      }

      // Record transaction (with retry if it fails)
      try {
        const { error: transactionError } = await supabase.from("transactions").insert({
          user_id: user.id,
          amount: bonusAmount,
          type: "daily_bonus",
          description: "Daily login bonus",
        })

        if (transactionError) {
          console.error("Failed to record transaction, retrying:", transactionError)

          // Wait a moment and retry
          await new Promise((resolve) => setTimeout(resolve, 1000))

          await supabase.from("transactions").insert({
            user_id: user.id,
            amount: bonusAmount,
            type: "daily_bonus",
            description: "Daily login bonus",
          })
        }
      } catch (transactionError) {
        console.error("Transaction recording failed:", transactionError)
        // Continue even if transaction recording fails
      }

      setCanClaimDailyBonus(false)

      toast({
        title: "Daily Bonus Claimed!",
        description: `You received ${bonusAmount} chips.`,
      })

      return true
    } catch (error) {
      console.error("Error claiming daily bonus:", error)
      return false
    }
  }

  // Set balance and update in database
  const setBalance = async (newBalance: number) => {
    try {
      setBalanceState(newBalance)

      if (user) {
        await supabase.from("profiles").update({ chips: newBalance }).eq("id", user.id)
      }
    } catch (error) {
      console.error("Error updating balance:", error)
    }
  }

  // Add a win to stats
  const addWin = async (amount = 0) => {
    try {
      if (!user) return

      const newStats = {
        ...gameStats,
        handsWon: gameStats.handsWon + 1,
        currentStreak: gameStats.currentStreak + 1,
      }

      // Update biggest win if applicable
      if (amount > gameStats.biggestWin) {
        newStats.biggestWin = amount
      }

      // Update longest streak if applicable
      if (newStats.currentStreak > gameStats.longestStreak) {
        newStats.longestStreak = newStats.currentStreak
      }

      setGameStats(newStats)

      // Update in database
      await supabase
        .from("game_stats")
        .update({
          hands_won: newStats.handsWon,
          biggest_win: newStats.biggestWin,
          longest_streak: newStats.longestStreak,
        })
        .eq("user_id", user.id)
    } catch (error) {
      console.error("Error updating win stats:", error)
    }
  }

  // Add a loss to stats
  const addLoss = async (amount = 0) => {
    try {
      if (!user) return

      const newStats = {
        ...gameStats,
        handsLost: gameStats.handsLost + 1,
        currentStreak: 0, // Reset streak on loss
      }

      setGameStats(newStats)

      // Update in database
      await supabase
        .from("game_stats")
        .update({
          hands_lost: newStats.handsLost,
        })
        .eq("user_id", user.id)
    } catch (error) {
      console.error("Error updating loss stats:", error)
    }
  }

  // Add a blackjack to stats
  const addBlackjack = async () => {
    try {
      if (!user) return

      const newStats = {
        ...gameStats,
        blackjacks: gameStats.blackjacks + 1,
      }

      setGameStats(newStats)

      // Update in database
      await supabase
        .from("game_stats")
        .update({
          blackjacks: newStats.blackjacks,
        })
        .eq("user_id", user.id)
    } catch (error) {
      console.error("Error updating blackjack stats:", error)
    }
  }

  // Add a game played to stats
  const addGamePlayed = async () => {
    try {
      if (!user) return

      const newStats = {
        ...gameStats,
        handsPlayed: gameStats.handsPlayed + 1,
      }

      setGameStats(newStats)

      // Update in database
      await supabase
        .from("game_stats")
        .update({
          hands_played: newStats.handsPlayed,
        })
        .eq("user_id", user.id)
    } catch (error) {
      console.error("Error updating games played:", error)
    }
  }

  // Save game state
  const saveGameState = async (gameData: any) => {
    try {
      if (!user) return

      // Check if a saved game already exists
      const { data, error: fetchError } = await supabase
        .from("game_states")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle()

      if (fetchError && fetchError.code !== "PGRST116") throw fetchError

      if (data) {
        // Update existing game state
        const { error } = await supabase.from("game_states").update({ game_data: gameData }).eq("id", data.id)

        if (error) throw error
      } else {
        // Create new game state
        const { error } = await supabase.from("game_states").insert({
          user_id: user.id,
          game_data: gameData,
        })

        if (error) throw error
      }

      toast({
        title: "Game Saved",
        description: "Your game has been saved successfully.",
      })
    } catch (error) {
      console.error("Error saving game state:", error)
      toast({
        title: "Save Failed",
        description: "There was an error saving your game.",
        variant: "destructive",
      })
    }
  }

  // Load game state
  const loadGameState = async () => {
    try {
      if (!user) return null

      const { data, error } = await supabase
        .from("game_states")
        .select("game_data")
        .eq("user_id", user.id)
        .maybeSingle()

      if (error && error.code !== "PGRST116") throw error

      if (data) {
        toast({
          title: "Game Loaded",
          description: "Your saved game has been loaded.",
        })
        return data.game_data
      }

      return null
    } catch (error) {
      console.error("Error loading game state:", error)
      toast({
        title: "Load Failed",
        description: "There was an error loading your saved game.",
        variant: "destructive",
      })
      return null
    }
  }

  return (
    <GameContext.Provider
      value={{
        balance,
        setBalance,
        addWin,
        addLoss,
        addBlackjack,
        addGamePlayed,
        saveGameState,
        loadGameState,
        gameStats,
        isLoading,
        claimDailyBonus,
        canClaimDailyBonus,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const context = useContext(GameContext)
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider")
  }
  return context
}
