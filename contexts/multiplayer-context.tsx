"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { supabase } from "@/lib/supabase/client"
import { useAuth } from "./auth-context"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

type MultiplayerRoom = {
  id: string
  name: string
  host_id: string
  max_players: number
  min_bet: number
  max_bet: number
  status: string
  created_at: string
  updated_at: string
  current_players?: number
  host_username?: string
}

type RoomPlayer = {
  id: string
  room_id: string
  user_id: string
  seat_number: number
  status: string
  joined_at: string
  username?: string
}

type MultiplayerContextType = {
  rooms: MultiplayerRoom[]
  currentRoom: MultiplayerRoom | null
  players: RoomPlayer[]
  isLoading: boolean
  createRoom: (name: string, maxPlayers: number, minBet: number, maxBet: number) => Promise<string>
  joinRoom: (roomId: string) => Promise<boolean>
  leaveRoom: () => Promise<boolean>
  getRooms: () => Promise<void>
  getPlayers: (roomId: string) => Promise<void>
  isHost: boolean
  startGame: () => Promise<boolean>
}

const MultiplayerContext = createContext<MultiplayerContextType | undefined>(undefined)

export function MultiplayerProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [rooms, setRooms] = useState<MultiplayerRoom[]>([])
  const [currentRoom, setCurrentRoom] = useState<MultiplayerRoom | null>(null)
  const [players, setPlayers] = useState<RoomPlayer[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Check if user is the host of the current room
  const isHost = currentRoom ? currentRoom.host_id === user?.id : false

  // Subscribe to room updates when in a room
  useEffect(() => {
    if (!currentRoom) return

    // Subscribe to room changes
    const roomSubscription = supabase
      .channel(`room:${currentRoom.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "multiplayer_rooms",
          filter: `id=eq.${currentRoom.id}`,
        },
        (payload) => {
          setCurrentRoom(payload.new as MultiplayerRoom)
        },
      )
      .subscribe()

    // Subscribe to player changes
    const playerSubscription = supabase
      .channel(`room_players:${currentRoom.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "room_players",
          filter: `room_id=eq.${currentRoom.id}`,
        },
        () => {
          getPlayers(currentRoom.id)
        },
      )
      .subscribe()

    return () => {
      roomSubscription.unsubscribe()
      playerSubscription.unsubscribe()
    }
  }, [currentRoom])

  // Get all available rooms
  const getRooms = async () => {
    try {
      setIsLoading(true)

      // Get rooms with player count
      const { data, error } = await supabase.rpc("get_rooms_with_player_count")

      if (error) throw error

      setRooms(data || [])
      setIsLoading(false)
    } catch (error) {
      console.error("Error getting rooms:", error)
      setIsLoading(false)
    }
  }

  // Get players in a room
  const getPlayers = async (roomId: string) => {
    try {
      const { data, error } = await supabase
        .from("room_players")
        .select(`
          *,
          profiles:user_id (username)
        `)
        .eq("room_id", roomId)
        .order("seat_number", { ascending: true })

      if (error) throw error

      // Format player data
      const formattedPlayers = data.map((player) => ({
        ...player,
        username: player.profiles?.username,
      }))

      setPlayers(formattedPlayers)
    } catch (error) {
      console.error("Error getting players:", error)
    }
  }

  // Create a new room
  const createRoom = async (name: string, maxPlayers: number, minBet: number, maxBet: number) => {
    try {
      if (!user) throw new Error("You must be logged in to create a room")

      setIsLoading(true)

      // Create the room
      const { data, error } = await supabase
        .from("multiplayer_rooms")
        .insert({
          name,
          host_id: user.id,
          max_players: maxPlayers,
          min_bet: minBet,
          max_bet: maxBet,
          status: "waiting",
        })
        .select()
        .single()

      if (error) throw error

      // Join the room as the host (seat 1)
      const { error: joinError } = await supabase.from("room_players").insert({
        room_id: data.id,
        user_id: user.id,
        seat_number: 1,
        status: "active",
      })

      if (joinError) throw joinError

      setCurrentRoom(data)
      await getPlayers(data.id)
      setIsLoading(false)

      toast({
        title: "Room Created",
        description: `You've created room "${name}"`,
      })

      return data.id
    } catch (error) {
      console.error("Error creating room:", error)
      setIsLoading(false)

      toast({
        title: "Error",
        description: "Failed to create room",
        variant: "destructive",
      })

      return ""
    }
  }

  // Join a room
  const joinRoom = async (roomId: string) => {
    try {
      if (!user) throw new Error("You must be logged in to join a room")

      setIsLoading(true)

      // Get the room
      const { data: room, error: roomError } = await supabase
        .from("multiplayer_rooms")
        .select("*")
        .eq("id", roomId)
        .single()

      if (roomError) throw roomError

      // Check if room is full
      const { data: playerCount, error: countError } = await supabase
        .from("room_players")
        .select("id", { count: "exact" })
        .eq("room_id", roomId)

      if (countError) throw countError

      if (playerCount.length >= room.max_players) {
        toast({
          title: "Room Full",
          description: "This room is already full",
          variant: "destructive",
        })

        setIsLoading(false)
        return false
      }

      // Find an available seat
      const { data: takenSeats, error: seatsError } = await supabase
        .from("room_players")
        .select("seat_number")
        .eq("room_id", roomId)

      if (seatsError) throw seatsError

      const takenSeatNumbers = takenSeats.map((seat) => seat.seat_number)
      let seatNumber = 1

      while (takenSeatNumbers.includes(seatNumber) && seatNumber <= room.max_players) {
        seatNumber++
      }

      if (seatNumber > room.max_players) {
        toast({
          title: "Room Full",
          description: "This room is already full",
          variant: "destructive",
        })

        setIsLoading(false)
        return false
      }

      // Join the room
      const { error: joinError } = await supabase.from("room_players").insert({
        room_id: roomId,
        user_id: user.id,
        seat_number: seatNumber,
        status: "active",
      })

      if (joinError) throw joinError

      setCurrentRoom(room)
      await getPlayers(roomId)
      setIsLoading(false)

      toast({
        title: "Room Joined",
        description: `You've joined room "${room.name}"`,
      })

      return true
    } catch (error) {
      console.error("Error joining room:", error)
      setIsLoading(false)

      toast({
        title: "Error",
        description: "Failed to join room",
        variant: "destructive",
      })

      return false
    }
  }

  // Leave a room
  const leaveRoom = async () => {
    try {
      if (!user || !currentRoom) return false

      setIsLoading(true)

      // Remove player from room
      const { error } = await supabase
        .from("room_players")
        .delete()
        .eq("room_id", currentRoom.id)
        .eq("user_id", user.id)

      if (error) throw error

      // If user is host, delete the room
      if (isHost) {
        await supabase.from("multiplayer_rooms").delete().eq("id", currentRoom.id)
      }

      setCurrentRoom(null)
      setPlayers([])
      setIsLoading(false)

      toast({
        title: "Room Left",
        description: `You've left the room`,
      })

      return true
    } catch (error) {
      console.error("Error leaving room:", error)
      setIsLoading(false)

      toast({
        title: "Error",
        description: "Failed to leave room",
        variant: "destructive",
      })

      return false
    }
  }

  // Start the game (host only)
  const startGame = async () => {
    try {
      if (!user || !currentRoom || !isHost) return false

      // Update room status
      const { error } = await supabase.from("multiplayer_rooms").update({ status: "playing" }).eq("id", currentRoom.id)

      if (error) throw error

      toast({
        title: "Game Started",
        description: "The game has started!",
      })

      return true
    } catch (error) {
      console.error("Error starting game:", error)

      toast({
        title: "Error",
        description: "Failed to start game",
        variant: "destructive",
      })

      return false
    }
  }

  return (
    <MultiplayerContext.Provider
      value={{
        rooms,
        currentRoom,
        players,
        isLoading,
        createRoom,
        joinRoom,
        leaveRoom,
        getRooms,
        getPlayers,
        isHost,
        startGame,
      }}
    >
      {children}
    </MultiplayerContext.Provider>
  )
}

export function useMultiplayer() {
  const context = useContext(MultiplayerContext)
  if (context === undefined) {
    throw new Error("useMultiplayer must be used within a MultiplayerProvider")
  }
  return context
}
