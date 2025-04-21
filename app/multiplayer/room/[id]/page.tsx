"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { BackgroundImage } from "@/components/ui/background-image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Crown, Clock, MessageSquare, Send } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useMultiplayer } from "@/contexts/multiplayer-context"
import { useAuth } from "@/contexts/auth-context"
import { useSound } from "@/lib/sounds"
import { useToast } from "@/hooks/use-toast"
import { BackButton } from "@/components/back-button"

export default function MultiplayerRoomPage() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.id as string
  const { currentRoom, players, getPlayers, isHost, leaveRoom, startGame } = useMultiplayer()
  const { user } = useAuth()
  const { playSound, playMusic, stopMusic, isMusicMuted } = useSound()
  const { toast } = useToast()
  const [message, setMessage] = useState("")
  const [chatMessages, setChatMessages] = useState<{ user: string; text: string }[]>([])

  useEffect(() => {
    if (!roomId) return

    getPlayers(roomId)

    // Start background music
    if (!isMusicMuted) {
      playMusic("mainTheme")
    }

    return () => {
      stopMusic()
    }
  }, [roomId, getPlayers, playMusic, stopMusic, isMusicMuted])

  const handleLeaveRoom = async () => {
    playSound("buttonClick")
    const success = await leaveRoom()
    if (success) {
      router.push("/multiplayer")
    }
  }

  const handleStartGame = async () => {
    playSound("buttonClick")
    const success = await startGame()
    if (success) {
      toast({
        title: "Game Started",
        description: "The game has started!",
      })
    }
  }

  const handleSendMessage = () => {
    if (!message.trim()) return

    playSound("buttonClick")

    // Add message to chat
    setChatMessages([...chatMessages, { user: user?.email?.split("@")[0] || "You", text: message }])
    setMessage("")
  }

  if (!currentRoom) {
    return (
      <main className="min-h-screen relative">
        <BackgroundImage variant="multiplayer" />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
          <Card className="bg-black/70 border-yellow-500/30 p-8 max-w-md w-full">
            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <h2 className="text-xl font-bold text-white mb-2">Loading Room</h2>
              <p className="text-gray-300 text-center">Please wait while we load the room data...</p>
            </div>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen relative">
      <BackgroundImage variant="multiplayer" />

      <div className="relative z-10 p-4">
        <div className="flex justify-between items-center mb-6">
          <BackButton href="/multiplayer" label="Leave Room" onClick={handleLeaveRoom} />
          <h1 className="text-2xl font-bold text-white drop-shadow-glow">{currentRoom.name}</h1>
          <Badge variant="outline" className="bg-black/50 text-white border-yellow-500/50">
            <Users className="h-4 w-4 mr-1" />
            {players.length}/{currentRoom.max_players}
          </Badge>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Game area */}
          <div className="lg:col-span-2">
            <Card className="bg-black/70 border-yellow-500/30 p-4 h-[500px] flex flex-col">
              {currentRoom.status === "waiting" ? (
                <div className="flex-1 flex flex-col items-center justify-center">
                  <h2 className="text-xl font-bold text-white mb-4">Waiting for players...</h2>
                  <div className="flex items-center gap-2 mb-6">
                    <Clock className="h-5 w-5 text-yellow-500 animate-pulse" />
                    <span className="text-gray-300">Game will start soon</span>
                  </div>

                  {isHost && (
                    <Button
                      onClick={handleStartGame}
                      disabled={players.length < 2}
                      className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold"
                    >
                      Start Game
                    </Button>
                  )}

                  {!isHost && <p className="text-gray-400 text-center">Waiting for the host to start the game...</p>}
                </div>
              ) : (
                <div className="flex-1 flex flex-col">
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <h2 className="text-xl font-bold text-white mb-4">Game in Progress</h2>
                      <p className="text-gray-300">The multiplayer game functionality is coming soon!</p>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Players */}
            <Card className="bg-black/70 border-yellow-500/30 p-4">
              <h2 className="text-lg font-bold text-white mb-3 flex items-center">
                <Users className="h-5 w-5 mr-2 text-yellow-500" />
                Players
              </h2>

              <div className="space-y-3">
                {players.map((player) => (
                  <div key={player.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center text-lg font-bold text-black">
                      {player.username?.substring(0, 2).toUpperCase() || "?"}
                    </div>
                    <div>
                      <div className="flex items-center">
                        <span className="font-medium text-white">{player.username || "Unknown"}</span>
                        {player.user_id === currentRoom.host_id && <Crown className="h-4 w-4 ml-1 text-yellow-500" />}
                      </div>
                      <span className="text-xs text-gray-400">Seat {player.seat_number}</span>
                    </div>
                  </div>
                ))}

                {Array.from({ length: currentRoom.max_players - players.length }).map((_, i) => (
                  <div key={`empty-${i}`} className="flex items-center gap-3 opacity-50">
                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                      <Users className="h-5 w-5 text-gray-500" />
                    </div>
                    <span className="text-gray-500">Empty Seat</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Chat */}
            <Card className="bg-black/70 border-yellow-500/30 p-4">
              <h2 className="text-lg font-bold text-white mb-3 flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-yellow-500" />
                Chat
              </h2>

              <div className="h-[200px] overflow-y-auto mb-3 space-y-2 p-2 bg-black/50 rounded-md">
                {chatMessages.length === 0 ? (
                  <p className="text-gray-500 text-center text-sm">No messages yet</p>
                ) : (
                  chatMessages.map((msg, i) => (
                    <div key={i} className="text-sm">
                      <span className="font-bold text-yellow-500">{msg.user}: </span>
                      <span className="text-gray-300">{msg.text}</span>
                    </div>
                  ))
                )}
              </div>

              <div className="flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="bg-black/50 border-yellow-500/30 text-white"
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <Button
                  onClick={handleSendMessage}
                  size="icon"
                  className="bg-yellow-600 hover:bg-yellow-500 text-black"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </Card>

            {/* Room Info */}
            <Card className="bg-black/70 border-yellow-500/30 p-4">
              <h2 className="text-lg font-bold text-white mb-3">Room Info</h2>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Min Bet:</span>
                  <span className="text-white">{currentRoom.min_bet} chips</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Max Bet:</span>
                  <span className="text-white">{currentRoom.max_bet} chips</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <Badge
                    variant="outline"
                    className={
                      currentRoom.status === "waiting"
                        ? "bg-blue-900/50 text-blue-400 border-blue-500/50"
                        : "bg-green-900/50 text-green-400 border-green-500/50"
                    }
                  >
                    {currentRoom.status === "waiting" ? "Waiting" : "Playing"}
                  </Badge>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
