export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          avatar_url: string | null
          created_at: string
          updated_at: string
          chips: number
          vip_level: number
          last_daily_bonus: string | null
        }
        Insert: {
          id: string
          username: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          chips?: number
          vip_level?: number
          last_daily_bonus?: string | null
        }
        Update: {
          id?: string
          username?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          chips?: number
          vip_level?: number
          last_daily_bonus?: string | null
        }
      }
      game_stats: {
        Row: {
          id: string
          user_id: string
          hands_played: number
          hands_won: number
          hands_lost: number
          blackjacks: number
          biggest_win: number
          longest_streak: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          hands_played?: number
          hands_won?: number
          hands_lost?: number
          blackjacks?: number
          biggest_win?: number
          longest_streak?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          hands_played?: number
          hands_won?: number
          hands_lost?: number
          blackjacks?: number
          biggest_win?: number
          longest_streak?: number
          created_at?: string
          updated_at?: string
        }
      }
      game_states: {
        Row: {
          id: string
          user_id: string
          game_data: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          game_data: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          game_data?: Json
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          type: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          type: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          type?: string
          description?: string | null
          created_at?: string
        }
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          unlocked_at: string
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          unlocked_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          achievement_id?: string
          unlocked_at?: string
        }
      }
      multiplayer_rooms: {
        Row: {
          id: string
          name: string
          host_id: string
          max_players: number
          min_bet: number
          max_bet: number
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          host_id: string
          max_players?: number
          min_bet?: number
          max_bet?: number
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          host_id?: string
          max_players?: number
          min_bet?: number
          max_bet?: number
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      room_players: {
        Row: {
          id: string
          room_id: string
          user_id: string
          seat_number: number
          status: string
          joined_at: string
        }
        Insert: {
          id?: string
          room_id: string
          user_id: string
          seat_number: number
          status?: string
          joined_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          user_id?: string
          seat_number?: number
          status?: string
          joined_at?: string
        }
      }
    }
  }
}
