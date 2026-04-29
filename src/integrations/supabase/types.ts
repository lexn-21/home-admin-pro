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
      advisor_directory: {
        Row: {
          active: boolean
          address: string | null
          city: string | null
          created_at: string
          email: string | null
          firm: string | null
          id: string
          immobilien_focus: boolean
          name: string
          partner_status: string | null
          phone: string | null
          website: string | null
          zip: string | null
        }
        Insert: {
          active?: boolean
          address?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          firm?: string | null
          id?: string
          immobilien_focus?: boolean
          name: string
          partner_status?: string | null
          phone?: string | null
          website?: string | null
          zip?: string | null
        }
        Update: {
          active?: boolean
          address?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          firm?: string | null
          id?: string
          immobilien_focus?: boolean
          name?: string
          partner_status?: string | null
          phone?: string | null
          website?: string | null
          zip?: string | null
        }
        Relationships: []
      }
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
      applications: {
        Row: {
          cover_message: string | null
          created_at: string
          id: string
          listing_id: string
          owner_seen_at: string | null
          owner_user_id: string
          seeker_user_id: string
          snapshot_profile: Json
          status: Database["public"]["Enums"]["application_status"]
          updated_at: string
        }
        Insert: {
          cover_message?: string | null
          created_at?: string
          id?: string
          listing_id: string
          owner_seen_at?: string | null
          owner_user_id: string
          seeker_user_id: string
          snapshot_profile?: Json
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
        }
        Update: {
          cover_message?: string | null
          created_at?: string
          id?: string
          listing_id?: string
          owner_seen_at?: string | null
          owner_user_id?: string
          seeker_user_id?: string
          snapshot_profile?: Json
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
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
      contract_templates: {
        Row: {
          active: boolean
          category: string | null
          created_at: string
          description: string | null
          format: string | null
          id: string
          is_free: boolean
          sort_order: number
          source: string | null
          title: string
          url: string | null
        }
        Insert: {
          active?: boolean
          category?: string | null
          created_at?: string
          description?: string | null
          format?: string | null
          id?: string
          is_free?: boolean
          sort_order?: number
          source?: string | null
          title: string
          url?: string | null
        }
        Update: {
          active?: boolean
          category?: string | null
          created_at?: string
          description?: string | null
          format?: string | null
          id?: string
          is_free?: boolean
          sort_order?: number
          source?: string | null
          title?: string
          url?: string | null
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: Database["public"]["Enums"]["expense_category"]
          classification: Database["public"]["Enums"]["expense_classification"]
          contractor: string | null
          created_at: string
          description: string | null
          id: string
          property_id: string | null
          receipt_path: string | null
          spent_on: string
          type: string | null
          unit_id: string | null
          updated_at: string
          user_id: string
          vendor: string | null
        }
        Insert: {
          amount: number
          category?: Database["public"]["Enums"]["expense_category"]
          classification?: Database["public"]["Enums"]["expense_classification"]
          contractor?: string | null
          created_at?: string
          description?: string | null
          id?: string
          property_id?: string | null
          receipt_path?: string | null
          spent_on: string
          type?: string | null
          unit_id?: string | null
          updated_at?: string
          user_id: string
          vendor?: string | null
        }
        Update: {
          amount?: number
          category?: Database["public"]["Enums"]["expense_category"]
          classification?: Database["public"]["Enums"]["expense_classification"]
          contractor?: string | null
          created_at?: string
          description?: string | null
          id?: string
          property_id?: string | null
          receipt_path?: string | null
          spent_on?: string
          type?: string | null
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
      listing_alerts: {
        Row: {
          active: boolean
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["listing_kind"]
          last_notified_at: string | null
          max_price: number | null
          min_rooms: number | null
          min_space: number | null
          user_id: string
          zips: string[] | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["listing_kind"]
          last_notified_at?: string | null
          max_price?: number | null
          min_rooms?: number | null
          min_space?: number | null
          user_id: string
          zips?: string[] | null
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["listing_kind"]
          last_notified_at?: string | null
          max_price?: number | null
          min_rooms?: number | null
          min_space?: number | null
          user_id?: string
          zips?: string[] | null
        }
        Relationships: []
      }
      listing_messages: {
        Row: {
          application_id: string
          body: string
          created_at: string
          id: string
          read_at: string | null
          sender_user_id: string
        }
        Insert: {
          application_id: string
          body: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_user_id: string
        }
        Update: {
          application_id?: string
          body?: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_messages_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_saves: {
        Row: {
          created_at: string
          listing_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          listing_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          listing_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_saves_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          applications_count: number
          available_from: string | null
          city: string | null
          created_at: string
          deposit: number | null
          description: string | null
          energy_class: string | null
          energy_value: number | null
          expires_at: string | null
          features: Json
          id: string
          kind: Database["public"]["Enums"]["listing_kind"]
          living_space: number | null
          min_term_months: number | null
          photos: string[]
          price: number
          property_id: string | null
          published_at: string | null
          rooms: number | null
          status: Database["public"]["Enums"]["listing_status"]
          street_public: string | null
          title: string
          unit_id: string | null
          updated_at: string
          user_id: string
          utilities: number | null
          views_count: number
          zip: string | null
        }
        Insert: {
          applications_count?: number
          available_from?: string | null
          city?: string | null
          created_at?: string
          deposit?: number | null
          description?: string | null
          energy_class?: string | null
          energy_value?: number | null
          expires_at?: string | null
          features?: Json
          id?: string
          kind?: Database["public"]["Enums"]["listing_kind"]
          living_space?: number | null
          min_term_months?: number | null
          photos?: string[]
          price?: number
          property_id?: string | null
          published_at?: string | null
          rooms?: number | null
          status?: Database["public"]["Enums"]["listing_status"]
          street_public?: string | null
          title: string
          unit_id?: string | null
          updated_at?: string
          user_id: string
          utilities?: number | null
          views_count?: number
          zip?: string | null
        }
        Update: {
          applications_count?: number
          available_from?: string | null
          city?: string | null
          created_at?: string
          deposit?: number | null
          description?: string | null
          energy_class?: string | null
          energy_value?: number | null
          expires_at?: string | null
          features?: Json
          id?: string
          kind?: Database["public"]["Enums"]["listing_kind"]
          living_space?: number | null
          min_term_months?: number | null
          photos?: string[]
          price?: number
          property_id?: string | null
          published_at?: string | null
          rooms?: number | null
          status?: Database["public"]["Enums"]["listing_status"]
          street_public?: string | null
          title?: string
          unit_id?: string | null
          updated_at?: string
          user_id?: string
          utilities?: number | null
          views_count?: number
          zip?: string | null
        }
        Relationships: []
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
          month: string | null
          note: string | null
          notes: string | null
          paid_on: string
          property_id: string | null
          status: Database["public"]["Enums"]["payment_status_simple"] | null
          tenant_id: string | null
          type: string | null
          unit_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["payment_kind"]
          month?: string | null
          note?: string | null
          notes?: string | null
          paid_on: string
          property_id?: string | null
          status?: Database["public"]["Enums"]["payment_status_simple"] | null
          tenant_id?: string | null
          type?: string | null
          unit_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["payment_kind"]
          month?: string | null
          note?: string | null
          notes?: string | null
          paid_on?: string
          property_id?: string | null
          status?: Database["public"]["Enums"]["payment_status_simple"] | null
          tenant_id?: string | null
          type?: string | null
          unit_id?: string | null
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
          area_sqm: number | null
          build_year: number | null
          city: string | null
          cold_rent: number | null
          created_at: string
          deposit: number | null
          id: string
          image_url: string | null
          name: string
          notes: string | null
          purchase_date: string | null
          purchase_price: number | null
          rooms: number | null
          sonderafa_7b: boolean
          status: string
          street: string | null
          updated_at: string
          user_id: string
          utilities: number | null
          zip: string | null
        }
        Insert: {
          afa_rate?: number | null
          area_sqm?: number | null
          build_year?: number | null
          city?: string | null
          cold_rent?: number | null
          created_at?: string
          deposit?: number | null
          id?: string
          image_url?: string | null
          name: string
          notes?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          rooms?: number | null
          sonderafa_7b?: boolean
          status?: string
          street?: string | null
          updated_at?: string
          user_id: string
          utilities?: number | null
          zip?: string | null
        }
        Update: {
          afa_rate?: number | null
          area_sqm?: number | null
          build_year?: number | null
          city?: string | null
          cold_rent?: number | null
          created_at?: string
          deposit?: number | null
          id?: string
          image_url?: string | null
          name?: string
          notes?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          rooms?: number | null
          sonderafa_7b?: boolean
          status?: string
          street?: string | null
          updated_at?: string
          user_id?: string
          utilities?: number | null
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
      seeker_profiles: {
        Row: {
          about_me: string | null
          completeness_score: number
          created_at: string
          employer: string | null
          employment_type: Database["public"]["Enums"]["employment_type"] | null
          full_name: string | null
          has_pets: boolean | null
          household_size: number | null
          id: string
          max_rent: number | null
          move_in_from: string | null
          net_income_monthly: number | null
          phone: string | null
          preferred_zips: string[] | null
          profile_photo: string | null
          schufa_status: Database["public"]["Enums"]["schufa_status"]
          smoker: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          about_me?: string | null
          completeness_score?: number
          created_at?: string
          employer?: string | null
          employment_type?:
            | Database["public"]["Enums"]["employment_type"]
            | null
          full_name?: string | null
          has_pets?: boolean | null
          household_size?: number | null
          id?: string
          max_rent?: number | null
          move_in_from?: string | null
          net_income_monthly?: number | null
          phone?: string | null
          preferred_zips?: string[] | null
          profile_photo?: string | null
          schufa_status?: Database["public"]["Enums"]["schufa_status"]
          smoker?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          about_me?: string | null
          completeness_score?: number
          created_at?: string
          employer?: string | null
          employment_type?:
            | Database["public"]["Enums"]["employment_type"]
            | null
          full_name?: string | null
          has_pets?: boolean | null
          household_size?: number | null
          id?: string
          max_rent?: number | null
          move_in_from?: string | null
          net_income_monthly?: number | null
          phone?: string | null
          preferred_zips?: string[] | null
          profile_photo?: string | null
          schufa_status?: Database["public"]["Enums"]["schufa_status"]
          smoker?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          done: boolean
          due_date: string | null
          id: string
          legal_ref: string | null
          legal_url: string | null
          property_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          done?: boolean
          due_date?: string | null
          id?: string
          legal_ref?: string | null
          legal_url?: string | null
          property_id?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          done?: boolean
          due_date?: string | null
          id?: string
          legal_ref?: string | null
          legal_url?: string | null
          property_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
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
          notes: string | null
          phone: string | null
          property_id: string | null
          since: string | null
          unit_id: string | null
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
          notes?: string | null
          phone?: string | null
          property_id?: string | null
          since?: string | null
          unit_id?: string | null
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
          notes?: string | null
          phone?: string | null
          property_id?: string | null
          since?: string | null
          unit_id?: string | null
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
      can_view_seeker_profile: {
        Args: { _seeker: string; _viewer: string }
        Returns: boolean
      }
      is_app_participant: {
        Args: { _app_id: string; _user: string }
        Returns: boolean
      }
      listing_inc_view: { Args: { _listing_id: string }; Returns: undefined }
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
      application_status:
        | "sent"
        | "shortlisted"
        | "rejected"
        | "accepted"
        | "withdrawn"
      booking_status:
        | "requested"
        | "quoted"
        | "accepted"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "disputed"
      employment_type:
        | "unbefristet"
        | "befristet"
        | "selbststaendig"
        | "beamter"
        | "rentner"
        | "student"
        | "arbeitslos"
        | "sonstiges"
      expense_category:
        | "immediate"
        | "depreciable"
        | "utilities_passthrough"
        | "financing"
        | "other"
      expense_classification: "maintenance" | "production" | "anschaffungsnah"
      issue_severity: "info" | "minor" | "major" | "urgent"
      issue_status:
        | "open"
        | "acknowledged"
        | "in_progress"
        | "resolved"
        | "closed"
      listing_kind: "rent" | "sale"
      listing_status: "draft" | "published" | "paused" | "closed"
      payment_kind: "rent_cold" | "utilities" | "deposit" | "other"
      payment_status_simple: "paid" | "open" | "late"
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
      schufa_status: "unverified" | "self_declared" | "document_uploaded"
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
      application_status: [
        "sent",
        "shortlisted",
        "rejected",
        "accepted",
        "withdrawn",
      ],
      booking_status: [
        "requested",
        "quoted",
        "accepted",
        "in_progress",
        "completed",
        "cancelled",
        "disputed",
      ],
      employment_type: [
        "unbefristet",
        "befristet",
        "selbststaendig",
        "beamter",
        "rentner",
        "student",
        "arbeitslos",
        "sonstiges",
      ],
      expense_category: [
        "immediate",
        "depreciable",
        "utilities_passthrough",
        "financing",
        "other",
      ],
      expense_classification: ["maintenance", "production", "anschaffungsnah"],
      issue_severity: ["info", "minor", "major", "urgent"],
      issue_status: [
        "open",
        "acknowledged",
        "in_progress",
        "resolved",
        "closed",
      ],
      listing_kind: ["rent", "sale"],
      listing_status: ["draft", "published", "paused", "closed"],
      payment_kind: ["rent_cold", "utilities", "deposit", "other"],
      payment_status_simple: ["paid", "open", "late"],
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
      schufa_status: ["unverified", "self_declared", "document_uploaded"],
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
