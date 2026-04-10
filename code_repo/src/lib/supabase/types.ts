export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          match_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          match_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          match_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          call_active_at: string | null
          created_at: string | null
          id: string
          meeting_url: string | null
          mentor_id: string
          player_id: string
          status: string | null
        }
        Insert: {
          call_active_at?: string | null
          created_at?: string | null
          id?: string
          meeting_url?: string | null
          mentor_id: string
          player_id: string
          status?: string | null
        }
        Update: {
          call_active_at?: string | null
          created_at?: string | null
          id?: string
          meeting_url?: string | null
          mentor_id?: string
          player_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_profiles: {
        Row: {
          approved: boolean
          availability: string | null
          bio: string | null
          id: string
          institution: string | null
          location: string | null
          mentee_age_pref: string | null
          playing_level: string[] | null
          skills: string[] | null
          why: string | null
          years_played: number | null
        }
        Insert: {
          approved?: boolean
          availability?: string | null
          bio?: string | null
          id: string
          institution?: string | null
          location?: string | null
          mentee_age_pref?: string | null
          playing_level?: string[] | null
          skills?: string[] | null
          why?: string | null
          years_played?: number | null
        }
        Update: {
          approved?: boolean
          availability?: string | null
          bio?: string | null
          id?: string
          institution?: string | null
          location?: string | null
          mentee_age_pref?: string | null
          playing_level?: string[] | null
          skills?: string[] | null
          why?: string | null
          years_played?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mentor_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      player_profiles: {
        Row: {
          age: number | null
          availability: string | null
          challenges: string[] | null
          goal: string | null
          grade: string | null
          id: string
          level: string[] | null
          location: string | null
          parent_email: string | null
          parent_name: string | null
          parent_phone: string | null
          school: string | null
        }
        Insert: {
          age?: number | null
          availability?: string | null
          challenges?: string[] | null
          goal?: string | null
          grade?: string | null
          id: string
          level?: string[] | null
          location?: string | null
          parent_email?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          school?: string | null
        }
        Update: {
          age?: number | null
          availability?: string | null
          challenges?: string[] | null
          goal?: string | null
          grade?: string | null
          id?: string
          level?: string[] | null
          location?: string | null
          parent_email?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          school?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "player_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          id: string
          name: string
          role: string
          sport: string[] | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id: string
          name: string
          role: string
          sport?: string[] | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          name?: string
          role?: string
          sport?: string[] | null
        }
        Relationships: []
      }
      reflections: {
        Row: {
          content: string
          created_at: string | null
          id: string
          player_id: string
          shared_with_mentor: boolean
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          player_id: string
          shared_with_mentor?: boolean
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          player_id?: string
          shared_with_mentor?: boolean
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reflections_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_calls: {
        Row: {
          id: string
          match_id: string
          proposed_by: string
          scheduled_at: string
          note: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          match_id: string
          proposed_by: string
          scheduled_at: string
          note?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          match_id?: string
          proposed_by?: string
          scheduled_at?: string
          note?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      resources: {
        Row: {
          category: string | null
          content: string
          created_at: string | null
          excerpt: string | null
          id: string
          published_at: string | null
          read_time: string | null
          slug: string
          status: string | null
          submitted_by: string | null
          submitted_by_name: string | null
          title: string
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string | null
          excerpt?: string | null
          id?: string
          published_at?: string | null
          read_time?: string | null
          slug: string
          status?: string | null
          submitted_by?: string | null
          submitted_by_name?: string | null
          title: string
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string | null
          excerpt?: string | null
          id?: string
          published_at?: string | null
          read_time?: string | null
          slug?: string
          status?: string | null
          submitted_by?: string | null
          submitted_by_name?: string | null
          title?: string
        }
        Relationships: []
      }
      session_reflections: {
        Row: {
          author_id: string
          body: string
          created_at: string | null
          id: string
          session_id: string
          shared: boolean
          updated_at: string | null
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string | null
          id?: string
          session_id: string
          shared?: boolean
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string | null
          id?: string
          session_id?: string
          shared?: boolean
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_reflections_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_reflections_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          created_at: string | null
          date: string | null
          duration: number | null
          flag_reason: string | null
          flagged: boolean | null
          id: string
          logged_by: string
          match_id: string
          mood: number | null
          notes: string | null
          rating: number | null
          topics: string[] | null
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          duration?: number | null
          flag_reason?: string | null
          flagged?: boolean | null
          id?: string
          logged_by: string
          match_id: string
          mood?: number | null
          notes?: string | null
          rating?: number | null
          topics?: string[] | null
        }
        Update: {
          created_at?: string | null
          date?: string | null
          duration?: number | null
          flag_reason?: string | null
          flagged?: boolean | null
          id?: string
          logged_by?: string
          match_id?: string
          mood?: number | null
          notes?: string | null
          rating?: number | null
          topics?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_logged_by_fkey"
            columns: ["logged_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_goals: {
        Row: {
          attitude_description: string | null
          attitude_score: number | null
          created_at: string | null
          effort_description: string | null
          effort_score: number | null
          focus_description: string | null
          focus_score: number | null
          id: string
          match_id: string
          week_start: string | null
        }
        Insert: {
          attitude_description?: string | null
          attitude_score?: number | null
          created_at?: string | null
          effort_description?: string | null
          effort_score?: number | null
          focus_description?: string | null
          focus_score?: number | null
          id?: string
          match_id: string
          week_start?: string | null
        }
        Update: {
          attitude_description?: string | null
          attitude_score?: number | null
          created_at?: string | null
          effort_description?: string | null
          effort_score?: number | null
          focus_description?: string | null
          focus_score?: number | null
          id?: string
          match_id?: string
          week_start?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "weekly_goals_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
