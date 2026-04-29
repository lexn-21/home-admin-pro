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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      advisor_links: {
        Row: {
          access_count: number
          advisor_email: string | null
          advisor_name: string
          created_at: string
          expires_at: string
          id: string
          last_accessed_at: string | null
          revoked: boolean
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_count?: number
          advisor_email?: string | null
          advisor_name: string
          created_at?: string
          expires_at?: string
          id?: string
          last_accessed_at?: string | null
          revoked?: boolean
          token?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_count?: number
          advisor_email?: string | null
          advisor_name?: string
          created_at?: string
          expires_at?: string
          id?: string
          last_accessed_at?: string | null
          revoked?: boolean
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          budget_estimate: number | null
          category: Database["public"]["Enums"]["provider_category"]
          commission_amount: number | null
          commission_rate: number | null
          completed_at: string | null
          created_at: string
          description: string | null
          final_amount: number | null
          id: string
          property_id: string | null
          provider_id: string | null
          quoted_amount: number | null
          rating: number | null
          review: string | null
          scheduled_at: string | null
          status: Database["public"]["Enums"]["booking_status"]
          title: string
          updated_at: string
          urgency: string | null
          user_id: string
        }
        Insert: {
          budget_estimate?: number | null
          category: Database["public"]["Enums"]["provider_category"]
          commission_amount?: number | null
          commission_rate?: number | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          final_amount?: number | null
          id?: string
          property_id?: string | null
          provider_id?: string | null
          quoted_amount?: number | null
          rating?: number | null
          review?: string | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          title: string
          updated_at?: string
          urgency?: string | null
          user_id: string
        }
        Update: {
          budget_estimate?: number | null
          category?: Database["public"]["Enums"]["provider_category"]
          commission_amount?: number | null
          commission_rate?: number | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          final_amount?: number | null
          id?: string
          property_id?: string | null
          provider_id?: string | null
          quoted_amount?: number | null
          rating?: number | null
          review?: string | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          title?: string
          updated_at?: string
          urgency?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category: Database["public"]["Enums"]["expense_category"]
          created_at: string
          description: string | null
          id: string
          property_id: string | null
          receipt_path: string | null
          spent_on: string
          unit_id: string | null
          updated_at: string
          user_id: string
          vendor: string | null
        }
        Insert: {
          amount: number
          category?: Database["public"]["Enums"]["expense_category"]
          created_at?: string
          description?: string | null
          id?: string
          property_id?: string | null
          receipt_path?: string | null
          spent_on: string
          unit_id?: string | null
          updated_at?: string
          user_id: string
          vendor?: string | null
        }
        Update: {
          amount?: number
          category?: Database["public"]["Enums"]["expense_category"]
          created_at?: string
          description?: string | null
          id?: string
          property_id?: string | null
          receipt_path?: string | null
          spent_on?: string
          unit_id?: string | null
          updated_at?: string
          user_id?: string
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      market_index: {
        Row: {
          avg_purchase_sqm: number
          avg_rent_sqm: number
          avg_utilities_sqm: number | null
          city: string | null
          id: string
          sample_size: number | null
          updated_at: string
          vacancy_rate: number | null
          yield_factor: number
          zip: string
        }
        Insert: {
          avg_purchase_sqm: number
          avg_rent_sqm: number
          avg_utilities_sqm?: number | null
          city?: string | null
          id?: string
          sample_size?: number | null
          updated_at?: string
          vacancy_rate?: number | null
          yield_factor: number
          zip: string
        }
        Update: {
          avg_purchase_sqm?: number
          avg_rent_sqm?: number
          avg_utilities_sqm?: number | null
          city?: string | null
          id?: string
          sample_size?: number | null
          updated_at?: string
          vacancy_rate?: number | null
          yield_factor?: number
          zip?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["payment_kind"]
          note: string | null
          paid_on: string
          tenant_id: string | null
          unit_id: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["payment_kind"]
          note?: string | null
          paid_on: string
          tenant_id?: string | null
          unit_id: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["payment_kind"]
          note?: string | null
          paid_on?: string
          tenant_id?: string | null
          unit_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          afa_rate: number | null
          build_year: number | null
          city: string | null
          created_at: string
          id: string
          name: string
          purchase_date: string | null
          purchase_price: number | null
          street: string | null
          updated_at: string
          user_id: string
          zip: string | null
        }
        Insert: {
          afa_rate?: number | null
          build_year?: number | null
          city?: string | null
          created_at?: string
          id?: string
          name: string
          purchase_date?: string | null
          purchase_price?: number | null
          street?: string | null
          updated_at?: string
          user_id: string
          zip?: string | null
        }
        Update: {
          afa_rate?: number | null
          build_year?: number | null
          city?: string | null
          created_at?: string
          id?: string
          name?: string
          purchase_date?: string | null
          purchase_price?: number | null
          street?: string | null
          updated_at?: string
          user_id?: string
          zip?: string | null
        }
        Relationships: []
      }
      providers: {
        Row: {
          category: Database["public"]["Enums"]["provider_category"]
          city: string | null
          created_at: string
          email: string | null
          hourly_rate: number | null
          id: string
          lat: number | null
          lng: number | null
          name: string
          phone: string | null
          premium: boolean | null
          rating: number | null
          response_time_hours: number | null
          reviews_count: number | null
          verified: boolean | null
          website: string | null
          zip: string | null
        }
        Insert: {
          category: Database["public"]["Enums"]["provider_category"]
          city?: string | null
          created_at?: string
          email?: string | null
          hourly_rate?: number | null
          id?: string
          lat?: number | null
          lng?: number | null
          name: string
          phone?: string | null
          premium?: boolean | null
          rating?: number | null
          response_time_hours?: number | null
          reviews_count?: number | null
          verified?: boolean | null
          website?: string | null
          zip?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["provider_category"]
          city?: string | null
          created_at?: string
          email?: string | null
          hourly_rate?: number | null
          id?: string
          lat?: number | null
          lng?: number | null
          name?: string
          phone?: string | null
          premium?: boolean | null
          rating?: number | null
          response_time_hours?: number | null
          reviews_count?: number | null
          verified?: boolean | null
          website?: string | null
          zip?: string | null
        }
        Relationships: []
      }
      tenant_issues: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          reported_at: string
          resolved_at: string | null
          severity: Database["public"]["Enums"]["issue_severity"]
          status: Database["public"]["Enums"]["issue_status"]
          tenant_id: string
          title: string
          unit_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          reported_at?: string
          resolved_at?: string | null
          severity?: Database["public"]["Enums"]["issue_severity"]
          status?: Database["public"]["Enums"]["issue_status"]
          tenant_id: string
          title: string
          unit_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          reported_at?: string
          resolved_at?: string | null
          severity?: Database["public"]["Enums"]["issue_severity"]
          status?: Database["public"]["Enums"]["issue_status"]
          tenant_id?: string
          title?: string
          unit_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tenant_portal_links: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          revoked: boolean
          tenant_id: string
          token: string
          unit_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          revoked?: boolean
          tenant_id: string
          token?: string
          unit_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          revoked?: boolean
          tenant_id?: string
          token?: string
          unit_id?: string
          user_id?: string
        }
        Relationships: []
      }
      tenants: {
        Row: {
          created_at: string
          deposit: number | null
          email: string | null
          full_name: string
          id: string
          lease_end: string | null
          lease_start: string | null
          phone: string | null
          unit_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deposit?: number | null
          email?: string | null
          full_name: string
          id?: string
          lease_end?: string | null
          lease_start?: string | null
          phone?: string | null
          unit_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deposit?: number | null
          email?: string | null
          full_name?: string
          id?: string
          lease_end?: string | null
          lease_start?: string | null
          phone?: string | null
          unit_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenants_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          created_at: string
          id: string
          label: string
          living_space: number | null
          property_id: string
          rent_cold: number | null
          rooms: number | null
          updated_at: string
          user_id: string
          utilities: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          living_space?: number | null
          property_id: string
          rent_cold?: number | null
          rooms?: number | null
          updated_at?: string
          user_id: string
          utilities?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          living_space?: number | null
          property_id?: string
          rent_cold?: number | null
          rooms?: number | null
          updated_at?: string
          user_id?: string
          utilities?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "units_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      vault_documents: {
        Row: {
          category: Database["public"]["Enums"]["vault_category"]
          created_at: string
          display_name: string
          enc_iv: string
          enc_salt: string
          id: string
          mime_type: string | null
          notes: string | null
          original_name: string
          property_id: string | null
          retention_until: string | null
          size_bytes: number
          storage_path: string
          tenant_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["vault_category"]
          created_at?: string
          display_name: string
          enc_iv: string
          enc_salt: string
          id?: string
          mime_type?: string | null
          notes?: string | null
          original_name: string
          property_id?: string | null
          retention_until?: string | null
          size_bytes?: number
          storage_path: string
          tenant_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["vault_category"]
          created_at?: string
          display_name?: string
          enc_iv?: string
          enc_salt?: string
          id?: string
          mime_type?: string | null
          notes?: string | null
          original_name?: string
          property_id?: string | null
          retention_until?: string | null
          size_bytes?: number
          storage_path?: string
          tenant_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vault_settings: {
        Row: {
          created_at: string
          pin_salt: string
          updated_at: string
          user_id: string
          verifier_ct: string
          verifier_iv: string
        }
        Insert: {
          created_at?: string
          pin_salt: string
          updated_at?: string
          user_id: string
          verifier_ct: string
          verifier_iv: string
        }
        Update: {
          created_at?: string
          pin_salt?: string
          updated_at?: string
          user_id?: string
          verifier_ct?: string
          verifier_iv?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      advisor_get_data: { Args: { _token: string }; Returns: Json }
      advisor_owner_for_token: { Args: { _token: string }; Returns: string }
      advisor_touch_token: { Args: { _token: string }; Returns: string }
      avm_estimate: {
        Args: { _annual_rent: number; _living_space: number; _zip: string }
        Returns: Json
      }
      tenant_portal_report_issue: {
        Args: {
          _category: string
          _description: string
          _severity: Database["public"]["Enums"]["issue_severity"]
          _title: string
          _token: string
        }
        Returns: string
      }
      tenant_portal_resolve: { Args: { _token: string }; Returns: Json }
    }
    Enums: {
      booking_status:
        | "requested"
        | "quoted"
        | "accepted"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "disputed"
      expense_category:
        | "immediate"
        | "depreciable"
        | "utilities_passthrough"
        | "financing"
        | "other"
      issue_severity: "info" | "minor" | "major" | "urgent"
      issue_status:
        | "open"
        | "acknowledged"
        | "in_progress"
        | "resolved"
        | "closed"
      payment_kind: "rent_cold" | "utilities" | "deposit" | "other"
      provider_category:
        | "sanitaer"
        | "elektrik"
        | "heizung"
        | "dach"
        | "maler"
        | "garten"
        | "reinigung"
        | "schluessel"
        | "schaedling"
        | "steuerberater"
        | "jurist"
        | "energieberater"
      vault_category:
        | "kaufvertrag"
        | "mietvertrag"
        | "nebenkostenabrechnung"
        | "versicherung"
        | "steuerbescheid"
        | "grundbuch"
        | "energieausweis"
        | "foto"
        | "rechnung"
        | "protokoll"
        | "korrespondenz"
        | "sonstiges"
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
    Enums: {
      booking_status: [
        "requested",
        "quoted",
        "accepted",
        "in_progress",
        "completed",
        "cancelled",
        "disputed",
      ],
      expense_category: [
        "immediate",
        "depreciable",
        "utilities_passthrough",
        "financing",
        "other",
      ],
      issue_severity: ["info", "minor", "major", "urgent"],
      issue_status: [
        "open",
        "acknowledged",
        "in_progress",
        "resolved",
        "closed",
      ],
      payment_kind: ["rent_cold", "utilities", "deposit", "other"],
      provider_category: [
        "sanitaer",
        "elektrik",
        "heizung",
        "dach",
        "maler",
        "garten",
        "reinigung",
        "schluessel",
        "schaedling",
        "steuerberater",
        "jurist",
        "energieberater",
      ],
      vault_category: [
        "kaufvertrag",
        "mietvertrag",
        "nebenkostenabrechnung",
        "versicherung",
        "steuerbescheid",
        "grundbuch",
        "energieausweis",
        "foto",
        "rechnung",
        "protokoll",
        "korrespondenz",
        "sonstiges",
      ],
    },
  },
} as const
