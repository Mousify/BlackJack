"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useGame } from "@/contexts/game-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { BackgroundImage } from "@/components/ui/background-image"
import { useToast } from "@/hooks/use-toast"
import { Trophy, Coins, BarChart2, History } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase/client"

// Import the BackButton
import { BackButton } from "@/components/back-button"

type ProfileData = {
  username: string
  avatar_url: string | null
  chips: number
  vip_level: number
}

export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const { gameStats, balance } = useGame()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [profileData, setProfileData] = useState<ProfileData>({
    username: "",
    avatar_url: null,
    chips: 0,
    vip_level: 0,
  })
  const [username, setUsername] = useState("")
  const [transactions, setTransactions] = useState<any[]>([])

  useEffect(() => {
    if (user) {
      loadProfile()
      loadTransactions()
    }
  }, [user])

  const loadProfile = async () => {
    try {
      setIsLoading(true)

      const { data, error } = await supabase.from("profiles").select("*").eq("id", user!.id).single()

      if (error) throw error

      setProfileData(data)
      setUsername(data.username)
      setIsLoading(false)
    } catch (error) {
      console.error("Error loading profile:", error)
      setIsLoading(false)
    }
  }

  const loadTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(10)

      if (error) throw error

      setTransactions(data || [])
    } catch (error) {
      console.error("Error loading transactions:", error)
    }
  }

  const updateProfile = async () => {
    try {
      setIsLoading(true)

      const { error } = await supabase.from("profiles").update({ username }).eq("id", user!.id)

      if (error) throw error

      setProfileData({ ...profileData, username })

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      })

      setIsLoading(false)
    } catch (error: any) {
      console.error("Error updating profile:", error)

      toast({
        title: "Update Failed",
        description: error.message || "There was an error updating your profile.",
        variant: "destructive",
      })

      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString()
  }

  return (
    <main className="min-h-screen relative">
      <BackgroundImage variant="settings" />

      <div className="relative z-10 p-4">
        {/* Replace the existing Link+Button with BackButton */}
        <div className="flex justify-between items-center mb-6">
          <BackButton href="/" label="Back to Menu" />
          <h1 className="text-2xl font-bold text-white drop-shadow-glow">My Profile</h1>
          <Button
            variant="outline"
            size="sm"
            className="bg-black/50 text-white border-red-500/50 hover:bg-red-900/50"
            onClick={signOut}
          >
            Sign Out
          </Button>
        </div>

        <div className="max-w-md mx-auto space-y-6">
          <Card className="bg-black/70 border-yellow-500/30 p-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center text-2xl font-bold text-black">
                {profileData.username ? profileData.username.substring(0, 2).toUpperCase() : ""}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white">{profileData.username}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="bg-black/50 text-yellow-500 border-yellow-500/50">
                    <Coins className="h-3 w-3 mr-1" />
                    {balance} chips
                  </Badge>
                  <Badge variant="outline" className="bg-black/50 text-purple-400 border-purple-500/50">
                    <Trophy className="h-3 w-3 mr-1" />
                    VIP Level {profileData.vip_level}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>

          <Tabs defaultValue="stats" className="w-full">
            <TabsList className="grid grid-cols-3 bg-black/50 border border-yellow-500/30">
              <TabsTrigger value="stats" className="data-[state=active]:bg-yellow-600 data-[state=active]:text-black">
                Stats
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-yellow-600 data-[state=active]:text-black">
                History
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="data-[state=active]:bg-yellow-600 data-[state=active]:text-black"
              >
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="stats" className="mt-4">
              <Card className="bg-black/70 border-yellow-500/30 p-4">
                <CardHeader className="p-0 pb-4">
                  <CardTitle className="text-xl text-white flex items-center">
                    <BarChart2 className="h-5 w-5 mr-2 text-yellow-500" />
                    Game Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-400">Hands Played</p>
                      <p className="text-lg font-bold text-white">{gameStats.handsPlayed}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-400">Hands Won</p>
                      <p className="text-lg font-bold text-green-500">{gameStats.handsWon}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-400">Hands Lost</p>
                      <p className="text-lg font-bold text-red-500">{gameStats.handsLost}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-400">Win Rate</p>
                      <p className="text-lg font-bold text-yellow-500">
                        {gameStats.handsPlayed > 0 ? Math.round((gameStats.handsWon / gameStats.handsPlayed) * 100) : 0}
                        %
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-400">Blackjacks</p>
                      <p className="text-lg font-bold text-purple-400">{gameStats.blackjacks}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-400">Longest Streak</p>
                      <p className="text-lg font-bold text-blue-400">{gameStats.longestStreak}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-400">Biggest Win</p>
                      <p className="text-lg font-bold text-green-500">{gameStats.biggestWin}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="mt-4">
              <Card className="bg-black/70 border-yellow-500/30 p-4">
                <CardHeader className="p-0 pb-4">
                  <CardTitle className="text-xl text-white flex items-center">
                    <History className="h-5 w-5 mr-2 text-yellow-500" />
                    Transaction History
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-4">
                  {transactions.length === 0 ? (
                    <p className="text-gray-400">No transactions yet</p>
                  ) : (
                    <div className="space-y-3">
                      {transactions.map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex justify-between items-center border-b border-gray-800 pb-2"
                        >
                          <div>
                            <p className="font-medium text-white capitalize">{transaction.type.replace("_", " ")}</p>
                            <p className="text-xs text-gray-400">{formatDate(transaction.created_at)}</p>
                            {transaction.description && (
                              <p className="text-sm text-gray-300">{transaction.description}</p>
                            )}
                          </div>
                          <p className={`font-bold ${transaction.amount > 0 ? "text-green-500" : "text-red-500"}`}>
                            {transaction.amount > 0 ? "+" : ""}
                            {transaction.amount}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="mt-4">
              <Card className="bg-black/70 border-yellow-500/30 p-4">
                <CardHeader className="p-0 pb-4">
                  <CardTitle className="text-xl text-white">Account Settings</CardTitle>
                  <CardDescription className="text-gray-400">Update your account information</CardDescription>
                </CardHeader>
                <CardContent className="p-0 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-white">
                      Username
                    </Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="bg-black/50 border-yellow-500/30 text-white"
                    />
                  </div>
                  <Button
                    onClick={updateProfile}
                    disabled={isLoading || username === profileData.username}
                    className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold"
                  >
                    {isLoading ? "Updating..." : "Update Profile"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  )
}
