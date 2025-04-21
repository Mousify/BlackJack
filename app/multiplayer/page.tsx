"use client"

import { useEffect, useState } from "react"
import { BackgroundImage } from "@/components/ui/background-image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Users, Crown, Star, Clock, Plus } from "lucide-react"
import { useSound } from "@/lib/sounds"
import { useMultiplayer } from "@/contexts/multiplayer-context"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"

// Import the BackButton
import { BackButton } from "@/components/back-button"

export default function MultiplayerPage() {
  const { playMusic, stopMusic, isMusicMuted, playSound } = useSound()
  const { rooms, getRooms, createRoom, joinRoom, isLoading } = useMultiplayer()
  const { user } = useAuth()
  const router = useRouter()

  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newRoomName, setNewRoomName] = useState("")
  const [maxPlayers, setMaxPlayers] = useState(5)
  const [minBet, setMinBet] = useState(5)
  const [maxBet, setMaxBet] = useState(100)

  useEffect(() => {
    // Start background music when the page loads
    if (!isMusicMuted) {
      playMusic("mainTheme")
    }

    // Load rooms
    getRooms()

    // Stop music when navigating away
    return () => {
      stopMusic()
    }
  }, [playMusic, stopMusic, isMusicMuted, getRooms])

  // Filter rooms based on search term
  const filteredRooms = rooms.filter((room) => room.name.toLowerCase().includes(searchTerm.toLowerCase()))

  // Handle room creation
  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) return

    playSound("buttonClick")
    const roomId = await createRoom(newRoomName, maxPlayers, minBet, maxBet)

    if (roomId) {
      setShowCreateDialog(false)
      router.push(`/multiplayer/room/${roomId}`)
    }
  }

  // Handle joining a room
  const handleJoinRoom = async (roomId: string) => {
    playSound("buttonClick")
    const success = await joinRoom(roomId)

    if (success) {
      router.push(`/multiplayer/room/${roomId}`)
    }
  }

  return (
    <main className="min-h-screen relative">
      <BackgroundImage variant="multiplayer" />

      <div className="relative z-10 p-4">
        {/* Replace the existing Link+Button with BackButton */}
        <div className="flex justify-between items-center mb-6">
          <BackButton href="/" label="Back to Menu" />
          <h1 className="text-2xl font-bold text-white drop-shadow-glow">Multiplayer</h1>
          <div className="w-[72px]"></div> {/* Spacer for alignment */}
        </div>

        <div className="max-w-md mx-auto space-y-6">
          {/* Player profile */}
          <Card className="bg-black/70 border-yellow-500/30 p-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center text-2xl font-bold text-black">
                {user?.email?.substring(0, 2).toUpperCase() || "?"}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white">{user?.email?.split("@")[0] || "Player"}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="bg-black/50 text-yellow-500 border-yellow-500/50">
                    <Star className="h-3 w-3 mr-1" />
                    Level 5
                  </Badge>
                  <Badge variant="outline" className="bg-black/50 text-white border-yellow-500/50">
                    <Clock className="h-3 w-3 mr-1" />
                    Online
                  </Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* Search and create */}
          <div className="flex gap-2">
            <Input
              placeholder="Search tables..."
              className="bg-black/50 border-yellow-500/30 text-white placeholder:text-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button
              className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold"
              onClick={() => {
                playSound("buttonClick")
                setShowCreateDialog(true)
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Create
            </Button>
          </div>

          {/* Available tables */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">Available Tables</h2>

            {isLoading ? (
              <Card className="bg-black/70 border-yellow-500/30 p-4 flex justify-center">
                <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
              </Card>
            ) : filteredRooms.length === 0 ? (
              <Card className="bg-black/70 border-yellow-500/30 p-4">
                <p className="text-gray-400 text-center">No rooms available. Create one to get started!</p>
              </Card>
            ) : (
              filteredRooms.map((table) => (
                <Card key={table.id} className="bg-black/70 border-yellow-500/30 p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white">{table.name}</h3>
                        {table.min_bet >= 100 && (
                          <Badge className="bg-purple-600 text-white">
                            <Crown className="h-3 w-3 mr-1" />
                            VIP
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-300">
                        <span className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {table.current_players}/{table.max_players}
                        </span>
                        <span>•</span>
                        <span>Min: {table.min_bet}</span>
                        <span>•</span>
                        <span>Max: {table.max_bet}</span>
                      </div>
                    </div>

                    <Button
                      variant="default"
                      size="sm"
                      disabled={table.current_players >= table.max_players}
                      className={
                        table.current_players >= table.max_players
                          ? "bg-gray-700 text-gray-300 cursor-not-allowed"
                          : "bg-yellow-600 hover:bg-yellow-500 text-black font-bold"
                      }
                      onClick={() => table.current_players < table.max_players && handleJoinRoom(table.id)}
                    >
                      {table.current_players >= table.max_players ? "Full" : "Join"}
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Create Room Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-black/90 border-yellow-500/50 text-white">
          <DialogHeader>
            <DialogTitle className="text-center text-yellow-500">Create New Room</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="room-name" className="text-white">
                Room Name
              </Label>
              <Input
                id="room-name"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="My Blackjack Room"
                className="bg-black/50 border-yellow-500/30 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-players" className="text-white">
                Max Players
              </Label>
              <Input
                id="max-players"
                type="number"
                min={2}
                max={10}
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(Number(e.target.value))}
                className="bg-black/50 border-yellow-500/30 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min-bet" className="text-white">
                  Min Bet
                </Label>
                <Input
                  id="min-bet"
                  type="number"
                  min={5}
                  value={minBet}
                  onChange={(e) => setMinBet(Number(e.target.value))}
                  className="bg-black/50 border-yellow-500/30 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-bet" className="text-white">
                  Max Bet
                </Label>
                <Input
                  id="max-bet"
                  type="number"
                  min={minBet}
                  value={maxBet}
                  onChange={(e) => setMaxBet(Number(e.target.value))}
                  className="bg-black/50 border-yellow-500/30 text-white"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              className="bg-red-900/50 hover:bg-red-800/70 text-white border-red-700/50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateRoom}
              disabled={!newRoomName.trim()}
              className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold"
            >
              Create Room
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
