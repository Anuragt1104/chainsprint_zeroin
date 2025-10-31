export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      crews: {
        Row: {
          id: string;
          slug: string;
          name: string;
          sprint_goal: string | null;
          owner_wallet: string | null;
          current_streak_days: number;
          last_active_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          sprint_goal?: string | null;
          owner_wallet?: string | null;
          current_streak_days?: number;
          last_active_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          sprint_goal?: string | null;
          owner_wallet?: string | null;
          current_streak_days?: number;
          last_active_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      crew_members: {
        Row: {
          id: string;
          crew_id: string;
          wallet_address: string;
          role: string;
          joined_at: string;
        };
        Insert: {
          id?: string;
          crew_id: string;
          wallet_address: string;
          role?: string;
          joined_at?: string;
        };
        Update: {
          id?: string;
          crew_id?: string;
          wallet_address?: string;
          role?: string;
          joined_at?: string;
        };
        Relationships: [];
      };
      wallet_sessions: {
        Row: {
          id: string;
          crew_id: string;
          wallet_address: string;
          chain_id: string | null;
          last_connected_at: string;
        };
        Insert: {
          id?: string;
          crew_id: string;
          wallet_address: string;
          chain_id?: string | null;
          last_connected_at?: string;
        };
        Update: {
          id?: string;
          crew_id?: string;
          wallet_address?: string;
          chain_id?: string | null;
          last_connected_at?: string;
        };
        Relationships: [];
      };
      sprint_snapshots: {
        Row: {
          id: string;
          crew_id: string;
          wallet_address: string | null;
          portfolio: Json;
          pnl: Json;
          positions: Json;
          transactions: Json;
          summary: Json;
          captured_at: string;
        };
        Insert: {
          id?: string;
          crew_id: string;
          wallet_address?: string | null;
          portfolio: Json;
          pnl: Json;
          positions: Json;
          transactions: Json;
          summary: Json;
          captured_at?: string;
        };
        Update: {
          id?: string;
          crew_id?: string;
          wallet_address?: string | null;
          portfolio?: Json;
          pnl?: Json;
          positions?: Json;
          transactions?: Json;
          summary?: Json;
          captured_at?: string;
        };
        Relationships: [];
      };
      zerion_events: {
        Row: {
          id: string;
          crew_id: string;
          wallet_address: string | null;
          event_type: string;
          payload: Json;
          signature_valid: boolean;
          received_at: string;
        };
        Insert: {
          id?: string;
          crew_id: string;
          wallet_address?: string | null;
          event_type: string;
          payload: Json;
          signature_valid?: boolean;
          received_at?: string;
        };
        Update: {
          id?: string;
          crew_id?: string;
          wallet_address?: string | null;
          event_type?: string;
          payload?: Json;
          signature_valid?: boolean;
          received_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Update"];