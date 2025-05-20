export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ai_questions: {
        Row: {
          child_id: string
          created_at: string
          id: string
          is_answered: boolean
          observer_id: string
          question: string
        }
        Insert: {
          child_id: string
          created_at?: string
          id?: string
          is_answered?: boolean
          observer_id: string
          question: string
        }
        Update: {
          child_id?: string
          created_at?: string
          id?: string
          is_answered?: boolean
          observer_id?: string
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_questions_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_questions_observer_id_fkey"
            columns: ["observer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      children: {
        Row: {
          class: string
          created_at: string
          date_of_birth: string
          id: string
          name: string
          profile_image_url: string | null
          updated_at: string
        }
        Insert: {
          class: string
          created_at?: string
          date_of_birth: string
          id?: string
          name: string
          profile_image_url?: string | null
          updated_at?: string
        }
        Update: {
          class?: string
          created_at?: string
          date_of_birth?: string
          id?: string
          name?: string
          profile_image_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          child_id: string
          created_at: string
          description: string
          due_date: string | null
          id: string
          observer_id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          child_id: string
          created_at?: string
          description: string
          due_date?: string | null
          id?: string
          observer_id: string
          status: string
          title: string
          updated_at?: string
        }
        Update: {
          child_id?: string
          created_at?: string
          description?: string
          due_date?: string | null
          id?: string
          observer_id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goals_observer_id_fkey"
            columns: ["observer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      growth_areas: {
        Row: {
          area: string
          created_at: string
          emoji: string | null
          id: string
          observation: string
          rating: string
          report_id: string
        }
        Insert: {
          area: string
          created_at?: string
          emoji?: string | null
          id?: string
          observation: string
          rating: string
          report_id: string
        }
        Update: {
          area?: string
          created_at?: string
          emoji?: string | null
          id?: string
          observation?: string
          rating?: string
          report_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "growth_areas_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_pinned: boolean
          read: boolean
          receiver_id: string
          report_id: string | null
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_pinned?: boolean
          read?: boolean
          receiver_id: string
          report_id?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_pinned?: boolean
          read?: boolean
          receiver_id?: string
          report_id?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
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
      monthly_reports: {
        Row: {
          admin_reviewed: boolean
          child_id: string
          created_at: string
          growth_summary: Json | null
          id: string
          month: number
          observer_id: string
          sent_to_parent: boolean
          summary: string
          updated_at: string
          year: number
        }
        Insert: {
          admin_reviewed?: boolean
          child_id: string
          created_at?: string
          growth_summary?: Json | null
          id?: string
          month: number
          observer_id: string
          sent_to_parent?: boolean
          summary: string
          updated_at?: string
          year: number
        }
        Update: {
          admin_reviewed?: boolean
          child_id?: string
          created_at?: string
          growth_summary?: Json | null
          id?: string
          month?: number
          observer_id?: string
          sent_to_parent?: boolean
          summary?: string
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "monthly_reports_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_reports_observer_id_fkey"
            columns: ["observer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      observer_child_mappings: {
        Row: {
          child_id: string
          created_at: string
          id: string
          observer_id: string
        }
        Insert: {
          child_id: string
          created_at?: string
          id?: string
          observer_id: string
        }
        Update: {
          child_id?: string
          created_at?: string
          id?: string
          observer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "observer_child_mappings_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "observer_child_mappings_observer_id_fkey"
            columns: ["observer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      parent_child_mappings: {
        Row: {
          child_id: string
          created_at: string
          id: string
          parent_id: string
        }
        Insert: {
          child_id: string
          created_at?: string
          id?: string
          parent_id: string
        }
        Update: {
          child_id?: string
          created_at?: string
          id?: string
          parent_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "parent_child_mappings_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parent_child_mappings_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          profile_image_url: string | null
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          name: string
          profile_image_url?: string | null
          role: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          profile_image_url?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          admin_reviewed: boolean
          child_id: string
          created_at: string
          curiosity_response_index: number
          curiosity_seed: string
          date: string
          id: string
          observer_id: string
          overall_score: string
          parent_note: string | null
          sent_to_parent: boolean
          theme: string
          updated_at: string
        }
        Insert: {
          admin_reviewed?: boolean
          child_id: string
          created_at?: string
          curiosity_response_index: number
          curiosity_seed: string
          date?: string
          id?: string
          observer_id: string
          overall_score: string
          parent_note?: string | null
          sent_to_parent?: boolean
          theme: string
          updated_at?: string
        }
        Update: {
          admin_reviewed?: boolean
          child_id?: string
          created_at?: string
          curiosity_response_index?: number
          curiosity_seed?: string
          date?: string
          id?: string
          observer_id?: string
          overall_score?: string
          parent_note?: string | null
          sent_to_parent?: boolean
          theme?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_observer_id_fkey"
            columns: ["observer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
