export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      companies: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company_id: string
          created_at: string
          email: string
          first_name: string
          id: string
          is_active: boolean
          last_login: string | null
          last_name: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          email: string
          first_name: string
          id?: string
          is_active?: boolean
          last_login?: string | null
          last_name: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          is_active?: boolean
          last_login?: string | null
          last_name?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      // =====================================================
      // MODULE CLIENTS
      // =====================================================
      clients: {
        Row: {
          id: string
          company_id: string
          first_name: string
          last_name: string
          email: string | null
          phone: string | null
          address: string | null
          notes: string | null
          is_active: boolean
          created_at: string
          updated_at: string
          created_by: string
          updated_by: string
        }
        Insert: {
          id?: string
          company_id: string
          first_name: string
          last_name: string
          email?: string | null
          phone?: string | null
          address?: string | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          created_by: string
          updated_by: string
        }
        Update: {
          id?: string
          company_id?: string
          first_name?: string
          last_name?: string
          email?: string | null
          phone?: string | null
          address?: string | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      // =====================================================
      // MODULE MESURES
      // =====================================================
      client_measurements: {
        Row: {
          id: string
          client_id: string
          company_id: string
          measurement_date: string
          version: number
          bust: number | null
          waist: number | null
          hips: number | null
          shoulder_width: number | null
          arm_length: number | null
          leg_length: number | null
          neck_circumference: number | null
          chest_width: number | null
          back_width: number | null
          arm_circumference: number | null
          thigh_circumference: number | null
          calf_circumference: number | null
          notes: string | null
          is_validated: boolean
          validated_by: string | null
          validated_at: string | null
          created_at: string
          updated_at: string
          created_by: string
          updated_by: string
        }
        Insert: {
          id?: string
          client_id: string
          company_id: string
          measurement_date?: string
          version?: number
          bust?: number | null
          waist?: number | null
          hips?: number | null
          shoulder_width?: number | null
          arm_length?: number | null
          leg_length?: number | null
          neck_circumference?: number | null
          chest_width?: number | null
          back_width?: number | null
          arm_circumference?: number | null
          thigh_circumference?: number | null
          calf_circumference?: number | null
          notes?: string | null
          is_validated?: boolean
          validated_by?: string | null
          validated_at?: string | null
          created_at?: string
          updated_at?: string
          created_by: string
          updated_by: string
        }
        Update: {
          id?: string
          client_id?: string
          company_id?: string
          measurement_date?: string
          version?: number
          bust?: number | null
          waist?: number | null
          hips?: number | null
          shoulder_width?: number | null
          arm_length?: number | null
          leg_length?: number | null
          neck_circumference?: number | null
          chest_width?: number | null
          back_width?: number | null
          arm_circumference?: number | null
          thigh_circumference?: number | null
          calf_circumference?: number | null
          notes?: string | null
          is_validated?: boolean
          validated_by?: string | null
          validated_at?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_measurements_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_measurements_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          }
        ]
      }
      // =====================================================
      // MODULE STOCKS ET FOURNISSEURS
      // =====================================================
      suppliers: {
        Row: {
          id: string
          company_id: string
          name: string
          contact_person: string | null
          email: string | null
          phone: string | null
          address: string | null
          payment_terms: number
          is_active: boolean
          created_at: string
          updated_at: string
          created_by: string
          updated_by: string
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          contact_person?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          payment_terms?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
          created_by: string
          updated_by: string
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          contact_person?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          payment_terms?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          }
        ]
      }
      product_categories: {
        Row: {
          id: string
          company_id: string
          name: string
          description: string | null
          is_active: boolean
          created_at: string
          updated_at: string
          created_by: string
          updated_by: string
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          created_by: string
          updated_by: string
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          }
        ]
      }
      products: {
        Row: {
          id: string
          company_id: string
          category_id: string | null
          supplier_id: string | null
          name: string
          description: string | null
          sku: string | null
          unit: string
          unit_price: number
          min_stock_level: number
          current_stock: number
          is_active: boolean
          created_at: string
          updated_at: string
          created_by: string
          updated_by: string
        }
        Insert: {
          id?: string
          company_id: string
          category_id?: string | null
          supplier_id?: string | null
          name: string
          description?: string | null
          sku?: string | null
          unit?: string
          unit_price?: number
          min_stock_level?: number
          current_stock?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
          created_by: string
          updated_by: string
        }
        Update: {
          id?: string
          company_id?: string
          category_id?: string | null
          supplier_id?: string | null
          name?: string
          description?: string | null
          sku?: string | null
          unit?: string
          unit_price?: number
          min_stock_level?: number
          current_stock?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          }
        ]
      }
      stock_movements: {
        Row: {
          id: string
          company_id: string
          product_id: string
          movement_type: string
          quantity: number
          unit_price: number | null
          reference: string | null
          notes: string | null
          movement_date: string
          created_at: string
          created_by: string
        }
        Insert: {
          id?: string
          company_id: string
          product_id: string
          movement_type: string
          quantity: number
          unit_price?: number | null
          reference?: string | null
          notes?: string | null
          movement_date?: string
          created_at?: string
          created_by: string
        }
        Update: {
          id?: string
          company_id?: string
          product_id?: string
          movement_type?: string
          quantity?: number
          unit_price?: number | null
          reference?: string | null
          notes?: string | null
          movement_date?: string
          created_at?: string
          created_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      // =====================================================
      // MODULE ACHATS ET RÉCEPTIONS
      // =====================================================
      purchase_orders: {
        Row: {
          id: string
          company_id: string
          supplier_id: string
          order_number: string
          order_date: string
          expected_delivery_date: string | null
          status: Database["public"]["Enums"]["purchase_status"]
          total_amount: number
          notes: string | null
          created_at: string
          updated_at: string
          created_by: string
          updated_by: string
        }
        Insert: {
          id?: string
          company_id: string
          supplier_id: string
          order_number: string
          order_date?: string
          expected_delivery_date?: string | null
          status?: Database["public"]["Enums"]["purchase_status"]
          total_amount?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
          created_by: string
          updated_by: string
        }
        Update: {
          id?: string
          company_id?: string
          supplier_id?: string
          order_number?: string
          order_date?: string
          expected_delivery_date?: string | null
          status?: Database["public"]["Enums"]["purchase_status"]
          total_amount?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          }
        ]
      }
      purchase_order_items: {
        Row: {
          id: string
          purchase_order_id: string
          product_id: string
          quantity: number
          unit_price: number
          total_price: number
          received_quantity: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          purchase_order_id: string
          product_id: string
          quantity: number
          unit_price: number
          total_price: number
          received_quantity?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          purchase_order_id?: string
          product_id?: string
          quantity?: number
          unit_price?: number
          total_price?: number
          received_quantity?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      receptions: {
        Row: {
          id: string
          company_id: string
          purchase_order_id: string
          reception_number: string
          reception_date: string
          is_validated: boolean
          validated_by: string | null
          validated_at: string | null
          notes: string | null
          created_at: string
          created_by: string
        }
        Insert: {
          id?: string
          company_id: string
          purchase_order_id: string
          reception_number: string
          reception_date?: string
          is_validated?: boolean
          validated_by?: string | null
          validated_at?: string | null
          notes?: string | null
          created_at?: string
          created_by: string
        }
        Update: {
          id?: string
          company_id?: string
          purchase_order_id?: string
          reception_number?: string
          reception_date?: string
          is_validated?: boolean
          validated_by?: string | null
          validated_at?: string | null
          notes?: string | null
          created_at?: string
          created_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "receptions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receptions_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          }
        ]
      }
      reception_items: {
        Row: {
          id: string
          reception_id: string
          purchase_order_item_id: string
          product_id: string
          ordered_quantity: number
          received_quantity: number
          unit_price: number
          quality_check: boolean
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          reception_id: string
          purchase_order_item_id: string
          product_id: string
          ordered_quantity: number
          received_quantity: number
          unit_price: number
          quality_check?: boolean
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          reception_id?: string
          purchase_order_item_id?: string
          product_id?: string
          ordered_quantity?: number
          received_quantity?: number
          unit_price?: number
          quality_check?: boolean
          notes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reception_items_reception_id_fkey"
            columns: ["reception_id"]
            isOneToOne: false
            referencedRelation: "receptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reception_items_purchase_order_item_id_fkey"
            columns: ["purchase_order_item_id"]
            isOneToOne: false
            referencedRelation: "purchase_order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reception_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      supplier_invoices: {
        Row: {
          id: string
          company_id: string
          purchase_order_id: string
          invoice_number: string
          invoice_date: string
          due_date: string
          total_amount: number
          is_paid: boolean
          paid_at: string | null
          paid_by: string | null
          notes: string | null
          created_at: string
          updated_at: string
          created_by: string
          updated_by: string
        }
        Insert: {
          id?: string
          company_id: string
          purchase_order_id: string
          invoice_number: string
          invoice_date: string
          due_date: string
          total_amount: number
          is_paid?: boolean
          paid_at?: string | null
          paid_by?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          created_by: string
          updated_by: string
        }
        Update: {
          id?: string
          company_id?: string
          purchase_order_id?: string
          invoice_number?: string
          invoice_date?: string
          due_date?: string
          total_amount?: number
          is_paid?: boolean
          paid_at?: string | null
          paid_by?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_invoices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_invoices_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          }
        ]
      }
      // =====================================================
      // MODULE MODÈLES ET PATRONS
      // =====================================================
      models: {
        Row: {
          id: string
          company_id: string
          name: string
          description: string | null
          category: string | null
          difficulty_level: number | null
          estimated_hours: number | null
          is_active: boolean
          created_at: string
          updated_at: string
          created_by: string
          updated_by: string
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          description?: string | null
          category?: string | null
          difficulty_level?: number | null
          estimated_hours?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          created_by: string
          updated_by: string
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          description?: string | null
          category?: string | null
          difficulty_level?: number | null
          estimated_hours?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "models_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          }
        ]
      }
      patterns: {
        Row: {
          id: string
          company_id: string
          model_id: string
          name: string
          file_path: string
          file_size: number | null
          version: string
          is_active: boolean
          created_at: string
          created_by: string
        }
        Insert: {
          id?: string
          company_id: string
          model_id: string
          name: string
          file_path: string
          file_size?: number | null
          version?: string
          is_active?: boolean
          created_at?: string
          created_by: string
        }
        Update: {
          id?: string
          company_id?: string
          model_id?: string
          name?: string
          file_path?: string
          file_size?: number | null
          version?: string
          is_active?: boolean
          created_at?: string
          created_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "patterns_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patterns_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "models"
            referencedColumns: ["id"]
          }
        ]
      }
      // =====================================================
      // MODULE COMMANDES ET PRODUCTION
      // =====================================================
      orders: {
        Row: {
          id: string
          company_id: string
          client_id: string
          order_number: string
          order_date: string
          delivery_date: string | null
          status: Database["public"]["Enums"]["production_status"]
          total_amount: number
          paid_amount: number
          assigned_tailor_id: string | null
          measurements_id: string | null
          fabric_photos: string[] | null
          reference_photos: string[] | null
          notes: string | null
          created_at: string
          updated_at: string
          created_by: string
          updated_by: string
        }
        Insert: {
          id?: string
          company_id: string
          client_id: string
          order_number: string
          order_date?: string
          delivery_date?: string | null
          status?: Database["public"]["Enums"]["production_status"]
          total_amount?: number
          paid_amount?: number
          assigned_tailor_id?: string | null
          measurements_id?: string | null
          fabric_photos?: string[] | null
          reference_photos?: string[] | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          created_by: string
          updated_by: string
        }
        Update: {
          id?: string
          company_id?: string
          client_id?: string
          order_number?: string
          order_date?: string
          delivery_date?: string | null
          status?: Database["public"]["Enums"]["production_status"]
          total_amount?: number
          paid_amount?: number
          assigned_tailor_id?: string | null
          measurements_id?: string | null
          fabric_photos?: string[] | null
          reference_photos?: string[] | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_assigned_tailor_id_fkey"
            columns: ["assigned_tailor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_measurements_id_fkey"
            columns: ["measurements_id"]
            isOneToOne: false
            referencedRelation: "client_measurements"
            referencedColumns: ["id"]
          }
        ]
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          model_id: string
          quantity: number
          unit_price: number
          total_price: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          model_id: string
          quantity?: number
          unit_price: number
          total_price: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          model_id?: string
          quantity?: number
          unit_price?: number
          total_price?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "models"
            referencedColumns: ["id"]
          }
        ]
      }
      order_materials: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity_required: number
          quantity_allocated: number
          unit_price: number
          total_cost: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity_required: number
          quantity_allocated?: number
          unit_price: number
          total_cost: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity_required?: number
          quantity_allocated?: number
          unit_price?: number
          total_cost?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_materials_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_materials_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      production_tracking: {
        Row: {
          id: string
          order_id: string
          status: Database["public"]["Enums"]["production_status"]
          previous_status: Database["public"]["Enums"]["production_status"] | null
          status_date: string
          notes: string | null
          time_spent_minutes: number | null
          created_at: string
          created_by: string
        }
        Insert: {
          id?: string
          order_id: string
          status: Database["public"]["Enums"]["production_status"]
          previous_status?: Database["public"]["Enums"]["production_status"] | null
          status_date?: string
          notes?: string | null
          time_spent_minutes?: number | null
          created_at?: string
          created_by: string
        }
        Update: {
          id?: string
          order_id?: string
          status?: Database["public"]["Enums"]["production_status"]
          previous_status?: Database["public"]["Enums"]["production_status"] | null
          status_date?: string
          notes?: string | null
          time_spent_minutes?: number | null
          created_at?: string
          created_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "production_tracking_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          }
        ]
      }
      // =====================================================
      // MODULE FACTURATION
      // =====================================================
      customer_invoices: {
        Row: {
          id: string
          company_id: string
          order_id: string
          invoice_number: string
          invoice_date: string
          due_date: string
          total_amount: number
          tax_amount: number
          total_with_tax: number
          is_paid: boolean
          paid_at: string | null
          paid_by: string | null
          notes: string | null
          created_at: string
          updated_at: string
          created_by: string
          updated_by: string
        }
        Insert: {
          id?: string
          company_id: string
          order_id: string
          invoice_number: string
          invoice_date?: string
          due_date: string
          total_amount: number
          tax_amount?: number
          total_with_tax: number
          is_paid?: boolean
          paid_at?: string | null
          paid_by?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          created_by: string
          updated_by: string
        }
        Update: {
          id?: string
          company_id?: string
          order_id?: string
          invoice_number?: string
          invoice_date?: string
          due_date?: string
          total_amount?: number
          tax_amount?: number
          total_with_tax?: number
          is_paid?: boolean
          paid_at?: string | null
          paid_by?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_invoices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          }
        ]
      }
      // =====================================================
      // MODULE RH ET PAIE
      // =====================================================
      employees: {
        Row: {
          id: string
          company_id: string
          profile_id: string
          employee_number: string
          hire_date: string
          hourly_rate: number
          is_active: boolean
          created_at: string
          updated_at: string
          created_by: string
          updated_by: string
        }
        Insert: {
          id?: string
          company_id: string
          profile_id: string
          employee_number: string
          hire_date: string
          hourly_rate: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
          created_by: string
          updated_by: string
        }
        Update: {
          id?: string
          company_id?: string
          profile_id?: string
          employee_number?: string
          hire_date?: string
          hourly_rate?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "employees_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      work_hours: {
        Row: {
          id: string
          company_id: string
          employee_id: string
          work_date: string
          start_time: string | null
          end_time: string | null
          total_hours: number | null
          order_id: string | null
          notes: string | null
          created_at: string
          updated_at: string
          created_by: string
          updated_by: string
        }
        Insert: {
          id?: string
          company_id: string
          employee_id: string
          work_date: string
          start_time?: string | null
          end_time?: string | null
          total_hours?: number | null
          order_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          created_by: string
          updated_by: string
        }
        Update: {
          id?: string
          company_id?: string
          employee_id?: string
          work_date?: string
          start_time?: string | null
          end_time?: string | null
          total_hours?: number | null
          order_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_hours_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_hours_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_hours_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          }
        ]
      }
      // =====================================================
      // MODULE ALERTES ET NOTIFICATIONS
      // =====================================================
      alerts: {
        Row: {
          id: string
          company_id: string
          type: Database["public"]["Enums"]["alert_type"]
          level: Database["public"]["Enums"]["alert_level"]
          title: string
          message: string
          related_entity_type: string | null
          related_entity_id: string | null
          is_read: boolean
          read_at: string | null
          read_by: string | null
          expires_at: string | null
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          company_id: string
          type: Database["public"]["Enums"]["alert_type"]
          level?: Database["public"]["Enums"]["alert_level"]
          title: string
          message: string
          related_entity_type?: string | null
          related_entity_id?: string | null
          is_read?: boolean
          read_at?: string | null
          read_by?: string | null
          expires_at?: string | null
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          company_id?: string
          type?: Database["public"]["Enums"]["alert_type"]
          level?: Database["public"]["Enums"]["alert_level"]
          title?: string
          message?: string
          related_entity_type?: string | null
          related_entity_id?: string | null
          is_read?: boolean
          read_at?: string | null
          read_by?: string | null
          expires_at?: string | null
          created_at?: string
          created_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alerts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_company_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_role: {
        Args: { required_role: Database["public"]["Enums"]["user_role"] }
        Returns: boolean
      }
    }
    Enums: {
      user_role:
        | "owner"
        | "manager"
        | "tailor"
        | "orders"
        | "stocks"
        | "customer_service"
      purchase_status:
        | "draft"
        | "ordered"
        | "confirmed"
        | "in_transit"
        | "delivered_not_received"
        | "received"
        | "invoice_received"
        | "ready_to_pay"
        | "paid"
        | "cancelled"
      production_status:
        | "order_created"
        | "waiting_materials"
        | "materials_allocated"
        | "cutting_in_progress"
        | "cutting_completed"
        | "assembly_in_progress"
        | "assembly_completed"
        | "finishing_in_progress"
        | "quality_check"
        | "ready_to_deliver"
        | "delivered"
        | "invoiced"
        | "paid"
        | "cancelled"
      alert_type:
        | "stock_low"
        | "order_delay"
        | "payment_due"
        | "supplier_delivery"
        | "quality_issue"
        | "system_alert"
      alert_level:
        | "info"
        | "warning"
        | "error"
        | "critical"
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
      user_role: [
        "owner",
        "manager",
        "tailor",
        "orders",
        "stocks",
        "customer_service",
      ],
    },
  },
} as const
