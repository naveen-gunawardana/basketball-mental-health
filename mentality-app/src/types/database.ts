/**
 * Supabase types for the tables Gameday touches.
 *
 * Regenerate with the CLI rather than hand-editing:
 *   npm run types:db
 *
 * The generated file should be committed to *both* repos — this one and the
 * website's — so a schema change that breaks the app also breaks the website's
 * typecheck. That's the cheapest possible guard against the two codebases
 * drifting apart on a shared database.
 *
 * Only the Gameday tables plus the handful of website tables the app reads are
 * modelled here. The rest of the site's schema exists but is deliberately
 * absent so this file stays readable.
 */

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
      /* ── Shared with the website ─────────────────────────────────────── */

      profiles: {
        Row: {
          id: string;
          name: string;
          role: string;
          sport: string[] | null;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          role: string;
          sport?: string[] | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };

      matches: {
        Row: {
          id: string;
          player_id: string;
          mentor_id: string;
          status: string;
          created_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };

      reflections: {
        Row: {
          id: string;
          player_id: string;
          content: string;
          shared_with_mentor: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          player_id: string;
          content: string;
          shared_with_mentor?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["reflections"]["Insert"]>;
        Relationships: [];
      };

      /* ── Gameday ─────────────────────────────────────────────────────── */

      athlete_settings: {
        Row: {
          id: string;
          primary_sport: string;
          level: string | null;
          position: string | null;
          focus_areas: string[];
          anchor_word: string | null;
          baseline_pressure: number | null;
          baseline_body_areas: string[];
          notifications_opt_in: boolean;
          tz: string | null;
          season_start: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          primary_sport?: string;
          level?: string | null;
          position?: string | null;
          focus_areas?: string[];
          anchor_word?: string | null;
          baseline_pressure?: number | null;
          baseline_body_areas?: string[];
          notifications_opt_in?: boolean;
          tz?: string | null;
          season_start?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["athlete_settings"]["Insert"]>;
        Relationships: [];
      };

      games: {
        Row: {
          id: string;
          athlete_id: string;
          sport: string;
          kind: string;
          opponent: string | null;
          starts_at: string;
          tz: string;
          venue: string | null;
          status: string;
          result: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          athlete_id: string;
          sport: string;
          kind?: string;
          opponent?: string | null;
          starts_at: string;
          tz?: string;
          venue?: string | null;
          status?: string;
          result?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["games"]["Insert"]>;
        Relationships: [];
      };

      game_entries: {
        Row: {
          id: string;
          game_id: string;
          athlete_id: string;
          phase: string;
          pressure: number | null;
          energy: number | null;
          valence: number | null;
          arousal: number | null;
          sleep_hours: number | null;
          body_areas: string[];
          controllable: string | null;
          payload: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          game_id: string;
          athlete_id: string;
          phase: string;
          pressure?: number | null;
          energy?: number | null;
          valence?: number | null;
          arousal?: number | null;
          sleep_hours?: number | null;
          body_areas?: string[];
          controllable?: string | null;
          payload?: Json;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["game_entries"]["Insert"]>;
        Relationships: [];
      };

      debriefs: {
        Row: {
          id: string;
          game_id: string;
          athlete_id: string;
          performance: number;
          effort: number | null;
          mindset: number | null;
          routine_followed: boolean | null;
          worked: string[];
          didnt: string[];
          letting_go: string | null;
          voice_path: string | null;
          transcript: string | null;
          reflection_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          game_id: string;
          athlete_id: string;
          performance: number;
          effort?: number | null;
          mindset?: number | null;
          routine_followed?: boolean | null;
          worked?: string[];
          didnt?: string[];
          letting_go?: string | null;
          voice_path?: string | null;
          transcript?: string | null;
          reflection_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["debriefs"]["Insert"]>;
        Relationships: [];
      };

      routines: {
        Row: {
          id: string;
          athlete_id: string;
          kind: string;
          name: string;
          is_default: boolean;
          anchor_word: string | null;
          updated_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          athlete_id: string;
          kind: string;
          name: string;
          is_default?: boolean;
          anchor_word?: string | null;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["routines"]["Insert"]>;
        Relationships: [];
      };

      routine_steps: {
        Row: {
          id: string;
          routine_id: string;
          position: number;
          kind: string;
          label: string;
          seconds: number;
          config: Json;
        };
        Insert: {
          id?: string;
          routine_id: string;
          position: number;
          kind: string;
          label: string;
          seconds: number;
          config?: Json;
        };
        Update: Partial<Database["public"]["Tables"]["routine_steps"]["Insert"]>;
        Relationships: [];
      };

      drills: {
        Row: {
          id: string;
          slug: string;
          title: string;
          category: string;
          sports: string[];
          seconds: number;
          blurb: string | null;
          script: Json;
          audio_path: string | null;
          published: boolean;
          version: number;
          updated_at: string;
          created_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };

      drill_completions: {
        Row: {
          id: string;
          athlete_id: string;
          drill_slug: string;
          drill_id: string | null;
          helpful: boolean | null;
          completed_at: string;
        };
        Insert: {
          id?: string;
          athlete_id: string;
          drill_slug: string;
          drill_id?: string | null;
          helpful?: boolean | null;
          completed_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["drill_completions"]["Insert"]>;
        Relationships: [];
      };

      device_tokens: {
        Row: {
          id: string;
          athlete_id: string;
          token: string;
          platform: string;
          tz: string | null;
          last_seen: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          athlete_id: string;
          token: string;
          platform: string;
          tz?: string | null;
          last_seen?: string;
        };
        Update: Partial<Database["public"]["Tables"]["device_tokens"]["Insert"]>;
        Relationships: [];
      };

      insights: {
        Row: {
          id: string;
          athlete_id: string;
          kind: string;
          title: string;
          body: string;
          evidence: Json;
          sample_size: number;
          generated_at: string;
          dismissed_at: string | null;
        };
        Insert: never;
        Update: { dismissed_at?: string | null };
        Relationships: [];
      };

      notification_sends: {
        Row: {
          id: string;
          athlete_id: string;
          game_id: string | null;
          kind: string;
          sent_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
    };

    Views: {
      v_game_log: {
        Row: {
          game_id: string;
          athlete_id: string;
          sport: string;
          kind: string;
          opponent: string | null;
          starts_at: string;
          venue: string | null;
          status: string;
          result: string | null;
          walk_in_pressure: number | null;
          sleep_hours: number | null;
          body_areas: string[] | null;
          controllable: string | null;
          performance: number | null;
          routine_followed: boolean | null;
          worked: string[] | null;
          didnt: string[] | null;
          letting_go: string | null;
          debriefed_at: string | null;
        };
        Relationships: [];
      };
    };

    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
