// src/lib/types/database.ts
// Les types sont du code TypeScript pur — pas de serveur ni navigateur
// On les met ici pour que les deux fichiers supabase puissent les importer

export type Profile = {
    id: string
    username: string
    chess_com_username: string | null
    lichess_username: string | null
    chess_com_bullet_elo: number | null
    chess_com_blitz_elo: number | null
    chess_com_rapid_elo: number | null
    chess_com_classical_elo: number | null
    lichess_bullet_elo: number | null
    lichess_blitz_elo: number | null
    lichess_rapid_elo: number | null
    lichess_classical_elo: number | null
    lichess_correspondence_elo: number | null
    last_synced_at: string | null
    created_at: string
}

export type Game = {
    id: string
    user_id: string
    platform: 'chess_com' | 'lichess'
    platform_game_id: string
    pgn: string | null
    played_at: string | null
    time_control: string | null
    variant: string
    color: 'white' | 'black'
    result: 'win' | 'loss' | 'draw'
    player_elo: number | null
    opponent_elo: number | null
    opponent_username: string | null
    opening_eco: string | null
    opening_name: string | null
    accuracy: number | null
    stockfish_eval: Record<string, unknown> | null
    created_at: string
}

export type Database = {
    public: {
        Tables: {
            profiles: {
                Row: Profile
                Insert: Omit<Profile, 'created_at'>
                Update: Partial<Profile>
            }
            games: {
                Row: Game
                Insert: Omit<Game, 'id' | 'created_at'>
                Update: Partial<Game>
            }
        }
    }
}