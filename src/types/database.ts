export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          company_name: string | null
          industry: string | null
          phone_number: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          company_name?: string | null
          industry?: string | null
          phone_number?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          company_name?: string | null
          industry?: string | null
          phone_number?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      fraud_models: {
        Row: {
          id: string
          user_id: string
          model_name: string
          model_type: string
          model_config: Json
          accuracy_score: number | null
          training_date: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          model_name: string
          model_type: string
          model_config: Json
          accuracy_score?: number | null
          training_date?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          model_name?: string
          model_type?: string
          model_config?: Json
          accuracy_score?: number | null
          training_date?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fraud_models_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      fraud_alerts: {
        Row: {
          id: string
          user_id: string
          model_id: string | null
          alert_type: string
          risk_score: number
          transaction_id: string | null
          details: Json
          status: string
          created_at: string
          resolved_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          model_id?: string | null
          alert_type: string
          risk_score: number
          transaction_id?: string | null
          details: Json
          status?: string
          created_at?: string
          resolved_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          model_id?: string | null
          alert_type?: string
          risk_score?: number
          transaction_id?: string | null
          details?: Json
          status?: string
          created_at?: string
          resolved_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fraud_alerts_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "fraud_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fraud_alerts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      transaction_analysis: {
        Row: {
          id: string
          user_id: string
          transaction_id: string
          amount: number
          currency: string
          merchant_name: string | null
          merchant_category: string | null
          transaction_time: string
          location_country: string | null
          location_city: string | null
          device_fingerprint: string | null
          ip_address: string | null
          risk_score: number | null
          risk_factors: Json | null
          is_fraudulent: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          transaction_id: string
          amount: number
          currency?: string
          merchant_name?: string | null
          merchant_category?: string | null
          transaction_time: string
          location_country?: string | null
          location_city?: string | null
          device_fingerprint?: string | null
          ip_address?: string | null
          risk_score?: number | null
          risk_factors?: Json | null
          is_fraudulent?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          transaction_id?: string
          amount?: number
          currency?: string
          merchant_name?: string | null
          merchant_category?: string | null
          transaction_time?: string
          location_country?: string | null
          location_city?: string | null
          device_fingerprint?: string | null
          ip_address?: string | null
          risk_score?: number | null
          risk_factors?: Json | null
          is_fraudulent?: boolean | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaction_analysis_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      api_usage: {
        Row: {
          id: string
          user_id: string
          endpoint: string
          method: string
          request_count: number
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          endpoint: string
          method: string
          request_count?: number
          date?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          endpoint?: string
          method?: string
          request_count?: number
          date?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      subscription_plans: {
        Row: {
          id: string
          plan_name: string
          api_calls_limit: number
          price_monthly: number
          features: Json
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          plan_name: string
          api_calls_limit: number
          price_monthly: number
          features: Json
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          plan_name?: string
          api_calls_limit?: number
          price_monthly?: number
          features?: Json
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          status: string
          current_period_start: string
          current_period_end: string | null
          stripe_subscription_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_id: string
          status?: string
          current_period_start?: string
          current_period_end?: string | null
          stripe_subscription_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_id?: string
          status?: string
          current_period_start?: string
          current_period_end?: string | null
          stripe_subscription_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
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