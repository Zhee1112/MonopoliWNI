export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      rooms: {
        Row: {
          id: string;
          code: string;
          host_id: string;
          status: 'waiting' | 'playing' | 'finished';
          current_turn: number;
          turn_order: string[];
          pot_money: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          host_id: string;
          status?: 'waiting' | 'playing' | 'finished';
          current_turn?: number;
          turn_order?: string[];
          pot_money?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          host_id?: string;
          status?: 'waiting' | 'playing' | 'finished';
          current_turn?: number;
          turn_order?: string[];
          pot_money?: number;
          created_at?: string;
        };
      };
      players: {
        Row: {
          id: string;
          room_id: string;
          name: string;
          clean_money: number;
          dirty_money: number;
          position: number;
          properties: string[];
          role: string;
          role_level: number;
          luck: number;
          permanent_luck_modifiers: Json[];
          stats: Json;
          evidence: Json[];
          status_effects: Json[];
          is_bankrupt: boolean;
          is_connected: boolean;
          token_color: string;
          dirty_history: Json[];
          meme_role_buff: string | null;
          meme_role_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          name: string;
          clean_money?: number;
          dirty_money?: number;
          position?: number;
          properties?: string[];
          role?: string;
          role_level?: number;
          luck?: number;
          permanent_luck_modifiers?: Json[];
          stats?: Json;
          evidence?: Json[];
          status_effects?: Json[];
          is_bankrupt?: boolean;
          is_connected?: boolean;
          token_color?: string;
          dirty_history?: Json[];
          meme_role_buff?: string | null;
          meme_role_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          name?: string;
          clean_money?: number;
          dirty_money?: number;
          position?: number;
          properties?: string[];
          role?: string;
          role_level?: number;
          luck?: number;
          permanent_luck_modifiers?: Json[];
          stats?: Json;
          evidence?: Json[];
          status_effects?: Json[];
          is_bankrupt?: boolean;
          is_connected?: boolean;
          token_color?: string;
          dirty_history?: Json[];
          meme_role_buff?: string | null;
          meme_role_active?: boolean;
          created_at?: string;
        };
      };
      properties: {
        Row: {
          id: string;
          room_id: string;
          board_index: number;
          owner_id: string | null;
          house_level: number;
          is_mortgaged: boolean;
        };
        Insert: {
          id?: string;
          room_id: string;
          board_index: number;
          owner_id?: string | null;
          house_level?: number;
          is_mortgaged?: boolean;
        };
        Update: {
          id?: string;
          room_id?: string;
          board_index?: number;
          owner_id?: string | null;
          house_level?: number;
          is_mortgaged?: boolean;
        };
      };
      game_log: {
        Row: {
          id: string;
          room_id: string;
          player_id: string;
          action: string;
          detail: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          player_id: string;
          action: string;
          detail?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          player_id?: string;
          action?: string;
          detail?: Json;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
