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
          read_at: string | null
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          match_id: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          match_id?: string
          read_at?: string | null
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
          completed_at: string | null
          created_at: string | null
          id: string
          meeting_url: string | null
          mentor_id: string
          player_id: string
          program_end: string | null
          program_start: string | null
          status: string | null
        }
        Insert: {
          call_active_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          meeting_url?: string | null
          mentor_id: string
          player_id: string
          program_end?: string | null
          program_start?: string | null
          status?: string | null
        }
        Update: {
          call_active_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          meeting_url?: string | null
          mentor_id?: string
          player_id?: string
          program_end?: string | null
          program_start?: string | null
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
      service_hours: {
        Row: {
          id: string
          mentor_id: string
          match_id: string
          session_id: string | null
          date: string
          minutes: number
          notes: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          mentor_id: string
          match_id: string
          session_id?: string | null
          date: string
          minutes: number
          notes?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          mentor_id?: string
          match_id?: string
          session_id?: string | null
          date?: string
          minutes?: number
          notes?: string | null
          created_at?: string | null
        }
        Relationships: []
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
          media_type: string | null
          published_at: string | null
          read_time: string | null
          slug: string
          sport: string | null
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
          media_type?: string | null
          published_at?: string | null
          read_time?: string | null
          slug: string
          sport?: string | null
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
          media_type?: string | null
          published_at?: string | null
          read_time?: string | null
          slug?: string
          sport?: string | null
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
      group_sessions: {
        Row: {
          capacity: number | null
          cover_url: string | null
          created_at: string
          description: string | null
          duration_min: number
          host_name: string | null
          host_title: string | null
          id: string
          meeting_url: string | null
          slug: string
          sport: string | null
          starts_at: string
          status: string
          title: string
          topic: string | null
        }
        Insert: {
          capacity?: number | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          duration_min?: number
          host_name?: string | null
          host_title?: string | null
          id?: string
          meeting_url?: string | null
          slug: string
          sport?: string | null
          starts_at: string
          status?: string
          title: string
          topic?: string | null
        }
        Update: {
          capacity?: number | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          duration_min?: number
          host_name?: string | null
          host_title?: string | null
          id?: string
          meeting_url?: string | null
          slug?: string
          sport?: string | null
          starts_at?: string
          status?: string
          title?: string
          topic?: string | null
        }
        Relationships: []
      }
      session_rsvps: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          session_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          session_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          session_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_rsvps_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "group_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string | null
          resend_contact_id: string | null
          source: string | null
          status: string
          unsubscribe_token: string
          unsubscribed_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name?: string | null
          resend_contact_id?: string | null
          source?: string | null
          status?: string
          unsubscribe_token?: string
          unsubscribed_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          resend_contact_id?: string | null
          source?: string | null
          status?: string
          unsubscribe_token?: string
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      newsletter_issues: {
        Row: {
          content: string
          created_at: string
          excerpt: string | null
          id: string
          preview_text: string | null
          recipient_count: number | null
          resend_broadcast_id: string | null
          sent_at: string | null
          slug: string
          status: string
          subject: string
          title: string
        }
        Insert: {
          content: string
          created_at?: string
          excerpt?: string | null
          id?: string
          preview_text?: string | null
          recipient_count?: number | null
          resend_broadcast_id?: string | null
          sent_at?: string | null
          slug: string
          status?: string
          subject: string
          title: string
        }
        Update: {
          content?: string
          created_at?: string
          excerpt?: string | null
          id?: string
          preview_text?: string | null
          recipient_count?: number | null
          resend_broadcast_id?: string | null
          sent_at?: string | null
          slug?: string
          status?: string
          subject?: string
          title?: string
        }
        Relationships: []
      }
      courses: {
        Row: {
          category: string | null
          cover_url: string | null
          created_at: string
          description: string | null
          id: string
          instructor: string | null
          level: string | null
          slug: string
          sort_order: number
          sport: string | null
          status: string
          summary: string | null
          title: string
        }
        Insert: {
          category?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          instructor?: string | null
          level?: string | null
          slug: string
          sort_order?: number
          sport?: string | null
          status?: string
          summary?: string | null
          title: string
        }
        Update: {
          category?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          instructor?: string | null
          level?: string | null
          slug?: string
          sort_order?: number
          sport?: string | null
          status?: string
          summary?: string | null
          title?: string
        }
        Relationships: []
      }
      lessons: {
        Row: {
          content: string | null
          course_id: string
          created_at: string
          duration: string | null
          id: string
          slug: string
          sort_order: number
          title: string
          video_url: string | null
        }
        Insert: {
          content?: string | null
          course_id: string
          created_at?: string
          duration?: string | null
          id?: string
          slug: string
          sort_order?: number
          title: string
          video_url?: string | null
        }
        Update: {
          content?: string | null
          course_id?: string
          created_at?: string
          duration?: string | null
          id?: string
          slug?: string
          sort_order?: number
          title?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_progress: {
        Row: {
          completed_at: string
          id: string
          lesson_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          id?: string
          lesson_id: string
          user_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          lesson_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      podcast_episodes: {
        Row: {
          apple_url: string | null
          audio_url: string | null
          created_at: string
          description: string | null
          duration: string | null
          episode_number: number | null
          id: string
          published_at: string | null
          season: number | null
          slug: string
          spotify_url: string | null
          status: string
          title: string
          youtube_url: string | null
        }
        Insert: {
          apple_url?: string | null
          audio_url?: string | null
          created_at?: string
          description?: string | null
          duration?: string | null
          episode_number?: number | null
          id?: string
          published_at?: string | null
          season?: number | null
          slug: string
          spotify_url?: string | null
          status?: string
          title: string
          youtube_url?: string | null
        }
        Update: {
          apple_url?: string | null
          audio_url?: string | null
          created_at?: string
          description?: string | null
          duration?: string | null
          episode_number?: number | null
          id?: string
          published_at?: string | null
          season?: number | null
          slug?: string
          spotify_url?: string | null
          status?: string
          title?: string
          youtube_url?: string | null
        }
        Relationships: []
      }
      // ─── Gameday (mobile app) ─────────────────────────────────────────────
      // Added by 20260826000000_gameday_app.sql. Regenerate this whole file
      // with `npx supabase gen types typescript` rather than editing it by
      // hand; it is committed to the app repo too, so a schema change breaks
      // both typechecks at once.
      athlete_settings: {
        Row: {
          id: string
          primary_sport: string
          level: string | null
          position: string | null
          focus_areas: string[]
          anchor_word: string | null
          baseline_pressure: number | null
          baseline_body_areas: string[]
          notifications_opt_in: boolean
          tz: string | null
          season_start: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          primary_sport?: string
          level?: string | null
          position?: string | null
          focus_areas?: string[]
          anchor_word?: string | null
          baseline_pressure?: number | null
          baseline_body_areas?: string[]
          notifications_opt_in?: boolean
          tz?: string | null
          season_start?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          primary_sport?: string
          level?: string | null
          position?: string | null
          focus_areas?: string[]
          anchor_word?: string | null
          baseline_pressure?: number | null
          baseline_body_areas?: string[]
          notifications_opt_in?: boolean
          tz?: string | null
          season_start?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      games: {
        Row: {
          id: string
          athlete_id: string
          sport: string
          kind: string
          opponent: string | null
          starts_at: string
          tz: string
          venue: string | null
          status: string
          result: string | null
          created_at: string
        }
        Insert: {
          id?: string
          athlete_id: string
          sport: string
          kind?: string
          opponent?: string | null
          starts_at: string
          tz?: string
          venue?: string | null
          status?: string
          result?: string | null
          created_at?: string
        }
        Update: {
          sport?: string
          kind?: string
          opponent?: string | null
          starts_at?: string
          tz?: string
          venue?: string | null
          status?: string
          result?: string | null
        }
        Relationships: []
      }
      game_entries: {
        Row: {
          id: string
          game_id: string
          athlete_id: string
          phase: string
          pressure: number | null
          energy: number | null
          valence: number | null
          arousal: number | null
          sleep_hours: number | null
          body_areas: string[]
          controllable: string | null
          payload: Json
          created_at: string
        }
        Insert: {
          id?: string
          game_id: string
          athlete_id: string
          phase: string
          pressure?: number | null
          energy?: number | null
          valence?: number | null
          arousal?: number | null
          sleep_hours?: number | null
          body_areas?: string[]
          controllable?: string | null
          payload?: Json
          created_at?: string
        }
        Update: {
          pressure?: number | null
          energy?: number | null
          valence?: number | null
          arousal?: number | null
          sleep_hours?: number | null
          body_areas?: string[]
          controllable?: string | null
          payload?: Json
        }
        Relationships: []
      }
      debriefs: {
        Row: {
          id: string
          game_id: string
          athlete_id: string
          performance: number
          effort: number | null
          mindset: number | null
          routine_followed: boolean | null
          worked: string[]
          didnt: string[]
          letting_go: string | null
          voice_path: string | null
          transcript: string | null
          reflection_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          game_id: string
          athlete_id: string
          performance: number
          effort?: number | null
          mindset?: number | null
          routine_followed?: boolean | null
          worked?: string[]
          didnt?: string[]
          letting_go?: string | null
          voice_path?: string | null
          transcript?: string | null
          reflection_id?: string | null
          created_at?: string
        }
        Update: {
          performance?: number
          effort?: number | null
          mindset?: number | null
          routine_followed?: boolean | null
          worked?: string[]
          didnt?: string[]
          letting_go?: string | null
          voice_path?: string | null
          transcript?: string | null
          reflection_id?: string | null
        }
        Relationships: []
      }
      routines: {
        Row: {
          id: string
          athlete_id: string
          kind: string
          name: string
          is_default: boolean
          anchor_word: string | null
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string
          athlete_id: string
          kind: string
          name: string
          is_default?: boolean
          anchor_word?: string | null
          updated_at?: string
          created_at?: string
        }
        Update: {
          kind?: string
          name?: string
          is_default?: boolean
          anchor_word?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      routine_steps: {
        Row: {
          id: string
          routine_id: string
          position: number
          kind: string
          label: string
          seconds: number
          config: Json
        }
        Insert: {
          id?: string
          routine_id: string
          position: number
          kind: string
          label: string
          seconds: number
          config?: Json
        }
        Update: {
          position?: number
          kind?: string
          label?: string
          seconds?: number
          config?: Json
        }
        Relationships: []
      }
      drills: {
        Row: {
          id: string
          slug: string
          title: string
          category: string
          sports: string[]
          seconds: number
          blurb: string | null
          script: Json
          audio_path: string | null
          published: boolean
          version: number
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          category: string
          sports?: string[]
          seconds: number
          blurb?: string | null
          script?: Json
          audio_path?: string | null
          published?: boolean
          version?: number
          updated_at?: string
          created_at?: string
        }
        Update: {
          slug?: string
          title?: string
          category?: string
          sports?: string[]
          seconds?: number
          blurb?: string | null
          script?: Json
          audio_path?: string | null
          published?: boolean
          version?: number
          updated_at?: string
        }
        Relationships: []
      }
      drill_completions: {
        Row: {
          id: string
          athlete_id: string
          drill_slug: string
          drill_id: string | null
          helpful: boolean | null
          completed_at: string
        }
        Insert: {
          id?: string
          athlete_id: string
          drill_slug: string
          drill_id?: string | null
          helpful?: boolean | null
          completed_at?: string
        }
        Update: {
          helpful?: boolean | null
        }
        Relationships: []
      }
      device_tokens: {
        Row: {
          id: string
          athlete_id: string
          token: string
          platform: string
          tz: string | null
          last_seen: string
          created_at: string
        }
        Insert: {
          id?: string
          athlete_id: string
          token: string
          platform: string
          tz?: string | null
          last_seen?: string
          created_at?: string
        }
        Update: {
          platform?: string
          tz?: string | null
          last_seen?: string
        }
        Relationships: []
      }
      notification_sends: {
        Row: {
          id: string
          athlete_id: string
          game_id: string | null
          kind: string
          sent_at: string
        }
        Insert: {
          id?: string
          athlete_id: string
          game_id?: string | null
          kind: string
          sent_at?: string
        }
        Update: {
          sent_at?: string
        }
        Relationships: []
      }
      insights: {
        Row: {
          id: string
          athlete_id: string
          kind: string
          title: string
          body: string
          evidence: Json
          sample_size: number
          generated_at: string
          dismissed_at: string | null
        }
        Insert: {
          id?: string
          athlete_id: string
          kind: string
          title: string
          body: string
          evidence?: Json
          sample_size: number
          generated_at?: string
          dismissed_at?: string | null
        }
        Update: {
          dismissed_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      v_game_log: {
        Row: {
          game_id: string
          athlete_id: string
          sport: string
          kind: string
          opponent: string | null
          starts_at: string
          venue: string | null
          status: string
          result: string | null
          walk_in_pressure: number | null
          sleep_hours: number | null
          body_areas: string[] | null
          controllable: string | null
          performance: number | null
          routine_followed: boolean | null
          worked: string[] | null
          didnt: string[] | null
          letting_go: string | null
          debriefed_at: string | null
        }
        Relationships: []
      }
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
