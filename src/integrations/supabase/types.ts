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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      accounting_entries: {
        Row: {
          company_id: string
          created_at: string
          created_by: string
          description: string
          entry_date: string
          entry_number: string
          id: string
          is_posted: boolean
          journal_id: string
          posted_at: string | null
          posted_by: string | null
          reference: string | null
          source_id: string | null
          source_type: string | null
          total_credit: number
          total_debit: number
          updated_at: string
          updated_by: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by: string
          description: string
          entry_date: string
          entry_number: string
          id?: string
          is_posted?: boolean
          journal_id: string
          posted_at?: string | null
          posted_by?: string | null
          reference?: string | null
          source_id?: string | null
          source_type?: string | null
          total_credit?: number
          total_debit?: number
          updated_at?: string
          updated_by: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string
          description?: string
          entry_date?: string
          entry_number?: string
          id?: string
          is_posted?: boolean
          journal_id?: string
          posted_at?: string | null
          posted_by?: string | null
          reference?: string | null
          source_id?: string | null
          source_type?: string | null
          total_credit?: number
          total_debit?: number
          updated_at?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounting_entries_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounting_entries_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounting_entries_journal_id_fkey"
            columns: ["journal_id"]
            isOneToOne: false
            referencedRelation: "accounting_journals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounting_entries_posted_by_fkey"
            columns: ["posted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounting_entries_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      accounting_entry_lines: {
        Row: {
          account_id: string
          created_at: string
          credit_amount: number
          debit_amount: number
          description: string | null
          entry_id: string
          id: string
          line_number: number
        }
        Insert: {
          account_id: string
          created_at?: string
          credit_amount?: number
          debit_amount?: number
          description?: string | null
          entry_id: string
          id?: string
          line_number: number
        }
        Update: {
          account_id?: string
          created_at?: string
          credit_amount?: number
          debit_amount?: number
          description?: string | null
          entry_id?: string
          id?: string
          line_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "accounting_entry_lines_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "syscohada_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounting_entry_lines_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "accounting_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      accounting_journals: {
        Row: {
          company_id: string
          created_at: string
          created_by: string
          id: string
          is_active: boolean
          is_system_journal: boolean
          journal_code: string
          journal_name: string
          journal_type: Database["public"]["Enums"]["journal_type"]
          updated_at: string
          updated_by: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by: string
          id?: string
          is_active?: boolean
          is_system_journal?: boolean
          journal_code: string
          journal_name: string
          journal_type: Database["public"]["Enums"]["journal_type"]
          updated_at?: string
          updated_by: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string
          id?: string
          is_active?: boolean
          is_system_journal?: boolean
          journal_code?: string
          journal_name?: string
          journal_type?: Database["public"]["Enums"]["journal_type"]
          updated_at?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounting_journals_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounting_journals_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounting_journals_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      alerts: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          is_read: boolean
          level: Database["public"]["Enums"]["alert_level"]
          message: string
          read_at: string | null
          read_by: string | null
          related_entity_id: string | null
          related_entity_type: string | null
          title: string
          type: Database["public"]["Enums"]["alert_type"]
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_read?: boolean
          level?: Database["public"]["Enums"]["alert_level"]
          message: string
          read_at?: string | null
          read_by?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          title: string
          type: Database["public"]["Enums"]["alert_type"]
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_read?: boolean
          level?: Database["public"]["Enums"]["alert_level"]
          message?: string
          read_at?: string | null
          read_by?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          title?: string
          type?: Database["public"]["Enums"]["alert_type"]
        }
        Relationships: [
          {
            foreignKeyName: "alerts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_read_by_fkey"
            columns: ["read_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_reconciliation_lines: {
        Row: {
          bank_statement_amount: number | null
          bank_statement_date: string | null
          bank_statement_reference: string | null
          created_at: string
          entry_line_id: string | null
          id: string
          is_reconciled: boolean
          notes: string | null
          reconciliation_id: string
        }
        Insert: {
          bank_statement_amount?: number | null
          bank_statement_date?: string | null
          bank_statement_reference?: string | null
          created_at?: string
          entry_line_id?: string | null
          id?: string
          is_reconciled?: boolean
          notes?: string | null
          reconciliation_id: string
        }
        Update: {
          bank_statement_amount?: number | null
          bank_statement_date?: string | null
          bank_statement_reference?: string | null
          created_at?: string
          entry_line_id?: string | null
          id?: string
          is_reconciled?: boolean
          notes?: string | null
          reconciliation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bank_reconciliation_lines_entry_line_id_fkey"
            columns: ["entry_line_id"]
            isOneToOne: false
            referencedRelation: "accounting_entry_lines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_reconciliation_lines_reconciliation_id_fkey"
            columns: ["reconciliation_id"]
            isOneToOne: false
            referencedRelation: "bank_reconciliations"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_reconciliations: {
        Row: {
          bank_statement_balance: number
          book_balance: number
          company_id: string
          completed_at: string | null
          completed_by: string | null
          created_at: string
          created_by: string
          id: string
          is_completed: boolean
          notes: string | null
          reconciled_balance: number
          reconciliation_date: string
          treasury_account_id: string
          updated_at: string
          updated_by: string
        }
        Insert: {
          bank_statement_balance: number
          book_balance: number
          company_id: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          created_by: string
          id?: string
          is_completed?: boolean
          notes?: string | null
          reconciled_balance: number
          reconciliation_date: string
          treasury_account_id: string
          updated_at?: string
          updated_by: string
        }
        Update: {
          bank_statement_balance?: number
          book_balance?: number
          company_id?: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          created_by?: string
          id?: string
          is_completed?: boolean
          notes?: string | null
          reconciled_balance?: number
          reconciliation_date?: string
          treasury_account_id?: string
          updated_at?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "bank_reconciliations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_reconciliations_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_reconciliations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_reconciliations_treasury_account_id_fkey"
            columns: ["treasury_account_id"]
            isOneToOne: false
            referencedRelation: "treasury_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_reconciliations_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      client_measurements: {
        Row: {
          arm_circumference: number | null
          arm_length: number | null
          back_width: number | null
          bust: number | null
          calf_circumference: number | null
          chest_width: number | null
          client_id: string
          company_id: string
          created_at: string
          created_by: string
          hips: number | null
          id: string
          is_validated: boolean
          leg_length: number | null
          measurement_date: string
          neck_circumference: number | null
          notes: string | null
          shoulder_width: number | null
          thigh_circumference: number | null
          updated_at: string
          updated_by: string
          validated_at: string | null
          validated_by: string | null
          version: number
          waist: number | null
        }
        Insert: {
          arm_circumference?: number | null
          arm_length?: number | null
          back_width?: number | null
          bust?: number | null
          calf_circumference?: number | null
          chest_width?: number | null
          client_id: string
          company_id: string
          created_at?: string
          created_by: string
          hips?: number | null
          id?: string
          is_validated?: boolean
          leg_length?: number | null
          measurement_date?: string
          neck_circumference?: number | null
          notes?: string | null
          shoulder_width?: number | null
          thigh_circumference?: number | null
          updated_at?: string
          updated_by: string
          validated_at?: string | null
          validated_by?: string | null
          version?: number
          waist?: number | null
        }
        Update: {
          arm_circumference?: number | null
          arm_length?: number | null
          back_width?: number | null
          bust?: number | null
          calf_circumference?: number | null
          chest_width?: number | null
          client_id?: string
          company_id?: string
          created_at?: string
          created_by?: string
          hips?: number | null
          id?: string
          is_validated?: boolean
          leg_length?: number | null
          measurement_date?: string
          neck_circumference?: number | null
          notes?: string | null
          shoulder_width?: number | null
          thigh_circumference?: number | null
          updated_at?: string
          updated_by?: string
          validated_at?: string | null
          validated_by?: string | null
          version?: number
          waist?: number | null
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
          },
          {
            foreignKeyName: "client_measurements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_measurements_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_measurements_validated_by_fkey"
            columns: ["validated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          company_id: string
          created_at: string
          created_by: string
          email: string | null
          first_name: string
          gender: string | null
          id: string
          is_active: boolean
          last_name: string
          notes: string | null
          phone: string | null
          updated_at: string
          updated_by: string
        }
        Insert: {
          address?: string | null
          company_id: string
          created_at?: string
          created_by: string
          email?: string | null
          first_name: string
          gender?: string | null
          id?: string
          is_active?: boolean
          last_name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          updated_by: string
        }
        Update: {
          address?: string | null
          company_id?: string
          created_at?: string
          created_by?: string
          email?: string | null
          first_name?: string
          gender?: string | null
          id?: string
          is_active?: boolean
          last_name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
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
          },
        ]
      }
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
      customer_invoice_lines: {
        Row: {
          created_at: string
          description: string
          discount_percent: number | null
          id: string
          invoice_id: string
          line_number: number
          quantity: number
          tax_amount: number
          tax_rate: number | null
          total_amount: number
          total_before_tax: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          description: string
          discount_percent?: number | null
          id?: string
          invoice_id: string
          line_number: number
          quantity?: number
          tax_amount: number
          tax_rate?: number | null
          total_amount: number
          total_before_tax: number
          unit_price: number
        }
        Update: {
          created_at?: string
          description?: string
          discount_percent?: number | null
          id?: string
          invoice_id?: string
          line_number?: number
          quantity?: number
          tax_amount?: number
          tax_rate?: number | null
          total_amount?: number
          total_before_tax?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "customer_invoice_lines_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "customer_invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_invoices: {
        Row: {
          company_id: string
          created_at: string
          created_by: string
          due_date: string
          id: string
          invoice_date: string
          invoice_number: string
          is_paid: boolean
          notes: string | null
          order_id: string
          paid_at: string | null
          paid_by: string | null
          tax_amount: number
          total_amount: number
          total_with_tax: number
          updated_at: string
          updated_by: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by: string
          due_date: string
          id?: string
          invoice_date?: string
          invoice_number: string
          is_paid?: boolean
          notes?: string | null
          order_id: string
          paid_at?: string | null
          paid_by?: string | null
          tax_amount?: number
          total_amount: number
          total_with_tax: number
          updated_at?: string
          updated_by: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string
          due_date?: string
          id?: string
          invoice_date?: string
          invoice_number?: string
          is_paid?: boolean
          notes?: string | null
          order_id?: string
          paid_at?: string | null
          paid_by?: string | null
          tax_amount?: number
          total_amount?: number
          total_with_tax?: number
          updated_at?: string
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
            foreignKeyName: "customer_invoices_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_invoices_paid_by_fkey"
            columns: ["paid_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_invoices_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      depreciations: {
        Row: {
          accumulated_depreciation: number
          company_id: string
          created_at: string
          created_by: string
          depreciation_amount: number
          depreciation_date: string
          entry_id: string | null
          fixed_asset_id: string
          id: string
          net_book_value: number
        }
        Insert: {
          accumulated_depreciation: number
          company_id: string
          created_at?: string
          created_by: string
          depreciation_amount: number
          depreciation_date: string
          entry_id?: string | null
          fixed_asset_id: string
          id?: string
          net_book_value: number
        }
        Update: {
          accumulated_depreciation?: number
          company_id?: string
          created_at?: string
          created_by?: string
          depreciation_amount?: number
          depreciation_date?: string
          entry_id?: string | null
          fixed_asset_id?: string
          id?: string
          net_book_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "depreciations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "depreciations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "depreciations_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "accounting_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "depreciations_fixed_asset_id_fkey"
            columns: ["fixed_asset_id"]
            isOneToOne: false
            referencedRelation: "fixed_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_payment_types: {
        Row: {
          company_id: string | null
          created_at: string | null
          created_by: string | null
          effective_date: string
          employee_id: string | null
          end_date: string | null
          fixed_salary: number | null
          id: string
          is_active: boolean | null
          payment_type: string
          task_rate: number | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          created_by?: string | null
          effective_date: string
          employee_id?: string | null
          end_date?: string | null
          fixed_salary?: number | null
          id?: string
          is_active?: boolean | null
          payment_type: string
          task_rate?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          created_by?: string | null
          effective_date?: string
          employee_id?: string | null
          end_date?: string | null
          fixed_salary?: number | null
          id?: string
          is_active?: boolean | null
          payment_type?: string
          task_rate?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_payment_types_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_payment_types_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          company_id: string
          created_at: string
          created_by: string
          employee_number: string
          hire_date: string
          hourly_rate: number
          id: string
          is_active: boolean
          profile_id: string
          updated_at: string
          updated_by: string
          user_id: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by: string
          employee_number: string
          hire_date: string
          hourly_rate: number
          id?: string
          is_active?: boolean
          profile_id: string
          updated_at?: string
          updated_by: string
          user_id?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string
          employee_number?: string
          hire_date?: string
          hourly_rate?: number
          id?: string
          is_active?: boolean
          profile_id?: string
          updated_at?: string
          updated_by?: string
          user_id?: string | null
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
            foreignKeyName: "employees_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fixed_asset_categories: {
        Row: {
          company_id: string
          created_at: string
          created_by: string
          default_rate: number | null
          default_useful_life: number | null
          depreciation_method: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          syscohada_account: string | null
          updated_at: string
          updated_by: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by: string
          default_rate?: number | null
          default_useful_life?: number | null
          depreciation_method?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          syscohada_account?: string | null
          updated_at?: string
          updated_by: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string
          default_rate?: number | null
          default_useful_life?: number | null
          depreciation_method?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          syscohada_account?: string | null
          updated_at?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "fixed_asset_categories_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      fixed_assets: {
        Row: {
          accumulated_depreciation: number
          acquisition_cost: number
          acquisition_date: string
          asset_category: string
          asset_code: string
          asset_name: string
          company_id: string
          created_at: string
          created_by: string
          depreciation_rate: number | null
          depreciation_type: Database["public"]["Enums"]["depreciation_type"]
          id: string
          is_active: boolean
          net_book_value: number
          notes: string | null
          salvage_value: number
          updated_at: string
          updated_by: string
          useful_life: number
        }
        Insert: {
          accumulated_depreciation?: number
          acquisition_cost: number
          acquisition_date: string
          asset_category: string
          asset_code: string
          asset_name: string
          company_id: string
          created_at?: string
          created_by: string
          depreciation_rate?: number | null
          depreciation_type?: Database["public"]["Enums"]["depreciation_type"]
          id?: string
          is_active?: boolean
          net_book_value: number
          notes?: string | null
          salvage_value?: number
          updated_at?: string
          updated_by: string
          useful_life: number
        }
        Update: {
          accumulated_depreciation?: number
          acquisition_cost?: number
          acquisition_date?: string
          asset_category?: string
          asset_code?: string
          asset_name?: string
          company_id?: string
          created_at?: string
          created_by?: string
          depreciation_rate?: number | null
          depreciation_type?: Database["public"]["Enums"]["depreciation_type"]
          id?: string
          is_active?: boolean
          net_book_value?: number
          notes?: string | null
          salvage_value?: number
          updated_at?: string
          updated_by?: string
          useful_life?: number
        }
        Relationships: [
          {
            foreignKeyName: "fixed_assets_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fixed_assets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fixed_assets_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      models: {
        Row: {
          category: string | null
          company_id: string
          created_at: string
          created_by: string
          description: string | null
          difficulty_level: number | null
          estimated_hours: number | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
          updated_by: string
        }
        Insert: {
          category?: string | null
          company_id: string
          created_at?: string
          created_by: string
          description?: string | null
          difficulty_level?: number | null
          estimated_hours?: number | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          updated_by: string
        }
        Update: {
          category?: string | null
          company_id?: string
          created_at?: string
          created_by?: string
          description?: string | null
          difficulty_level?: number | null
          estimated_hours?: number | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "models_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "models_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "models_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          model_id: string
          notes: string | null
          order_id: string
          quantity: number
          total_price: number
          unit_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          model_id: string
          notes?: string | null
          order_id: string
          quantity?: number
          total_price: number
          unit_price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          model_id?: string
          notes?: string | null
          order_id?: string
          quantity?: number
          total_price?: number
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_materials: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string
          quantity_allocated: number
          quantity_required: number
          total_cost: number
          unit_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id: string
          quantity_allocated?: number
          quantity_required: number
          total_cost: number
          unit_price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string
          quantity_allocated?: number
          quantity_required?: number
          total_cost?: number
          unit_price?: number
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
          },
        ]
      }
      orders: {
        Row: {
          assigned_tailor_id: string | null
          client_id: string
          company_id: string
          created_at: string
          created_by: string
          delivery_date: string | null
          due_date: string | null
          fabric_photos: string[] | null
          id: string
          measurements_id: string | null
          notes: string | null
          order_date: string
          order_number: string
          paid_amount: number
          reference_photos: string[] | null
          status: Database["public"]["Enums"]["production_status"]
          total_amount: number
          updated_at: string
          updated_by: string
        }
        Insert: {
          assigned_tailor_id?: string | null
          client_id: string
          company_id: string
          created_at?: string
          created_by: string
          delivery_date?: string | null
          due_date?: string | null
          fabric_photos?: string[] | null
          id?: string
          measurements_id?: string | null
          notes?: string | null
          order_date?: string
          order_number: string
          paid_amount?: number
          reference_photos?: string[] | null
          status?: Database["public"]["Enums"]["production_status"]
          total_amount?: number
          updated_at?: string
          updated_by: string
        }
        Update: {
          assigned_tailor_id?: string | null
          client_id?: string
          company_id?: string
          created_at?: string
          created_by?: string
          delivery_date?: string | null
          due_date?: string | null
          fabric_photos?: string[] | null
          id?: string
          measurements_id?: string | null
          notes?: string | null
          order_date?: string
          order_number?: string
          paid_amount?: number
          reference_photos?: string[] | null
          status?: Database["public"]["Enums"]["production_status"]
          total_amount?: number
          updated_at?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_assigned_tailor_id_fkey"
            columns: ["assigned_tailor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
            foreignKeyName: "orders_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_created_by_fkey"
            columns: ["created_by"]
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
          },
          {
            foreignKeyName: "orders_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      patterns: {
        Row: {
          company_id: string
          created_at: string
          created_by: string
          file_path: string
          file_size: number | null
          id: string
          is_active: boolean
          model_id: string
          name: string
          version: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by: string
          file_path: string
          file_size?: number | null
          id?: string
          is_active?: boolean
          model_id: string
          name: string
          version?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string
          file_path?: string
          file_size?: number | null
          id?: string
          is_active?: boolean
          model_id?: string
          name?: string
          version?: string | null
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
            foreignKeyName: "patterns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patterns_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "models"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_reminders: {
        Row: {
          company_id: string
          created_at: string
          created_by: string
          id: string
          invoice_id: string
          notes: string | null
          reminder_date: string
          reminder_number: number
          reminder_type: string
          sent_at: string | null
          sent_by: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by: string
          id?: string
          invoice_id: string
          notes?: string | null
          reminder_date?: string
          reminder_number?: number
          reminder_type: string
          sent_at?: string | null
          sent_by?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string
          id?: string
          invoice_id?: string
          notes?: string | null
          reminder_date?: string
          reminder_number?: number
          reminder_type?: string
          sent_at?: string | null
          sent_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_reminders_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_reminders_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "customer_invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          company_id: string
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
          updated_by: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          updated_by: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_categories_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_categories_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      production_tasks: {
        Row: {
          actual_hours: number | null
          company_id: string | null
          completion_date: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string | null
          employee_id: string | null
          estimated_hours: number | null
          id: string
          order_id: string | null
          priority: string | null
          remuneration_amount: number | null
          remuneration_status: string | null
          start_date: string | null
          status: string | null
          task_name: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          actual_hours?: number | null
          company_id?: string | null
          completion_date?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          employee_id?: string | null
          estimated_hours?: number | null
          id?: string
          order_id?: string | null
          priority?: string | null
          remuneration_amount?: number | null
          remuneration_status?: string | null
          start_date?: string | null
          status?: string | null
          task_name: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          actual_hours?: number | null
          company_id?: string | null
          completion_date?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          employee_id?: string | null
          estimated_hours?: number | null
          id?: string
          order_id?: string | null
          priority?: string | null
          remuneration_amount?: number | null
          remuneration_status?: string | null
          start_date?: string | null
          status?: string | null
          task_name?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "production_tasks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_tasks_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_tasks_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      production_tracking: {
        Row: {
          created_at: string
          created_by: string
          id: string
          notes: string | null
          order_id: string
          previous_status:
            | Database["public"]["Enums"]["production_status"]
            | null
          status: Database["public"]["Enums"]["production_status"]
          status_date: string
          time_spent_minutes: number | null
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          notes?: string | null
          order_id: string
          previous_status?:
            | Database["public"]["Enums"]["production_status"]
            | null
          status: Database["public"]["Enums"]["production_status"]
          status_date?: string
          time_spent_minutes?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          notes?: string | null
          order_id?: string
          previous_status?:
            | Database["public"]["Enums"]["production_status"]
            | null
          status?: Database["public"]["Enums"]["production_status"]
          status_date?: string
          time_spent_minutes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "production_tracking_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_tracking_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          company_id: string
          created_at: string
          created_by: string
          current_stock: number
          description: string | null
          id: string
          is_active: boolean
          min_stock_level: number
          name: string
          sku: string | null
          supplier_id: string | null
          unit: string
          unit_price: number
          updated_at: string
          updated_by: string
        }
        Insert: {
          category_id?: string | null
          company_id: string
          created_at?: string
          created_by: string
          current_stock?: number
          description?: string | null
          id?: string
          is_active?: boolean
          min_stock_level?: number
          name: string
          sku?: string | null
          supplier_id?: string | null
          unit?: string
          unit_price?: number
          updated_at?: string
          updated_by: string
        }
        Update: {
          category_id?: string | null
          company_id?: string
          created_at?: string
          created_by?: string
          current_stock?: number
          description?: string | null
          id?: string
          is_active?: boolean
          min_stock_level?: number
          name?: string
          sku?: string | null
          supplier_id?: string | null
          unit?: string
          unit_price?: number
          updated_at?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      purchase_order_items: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          product_id: string
          purchase_order_id: string
          quantity: number
          received_quantity: number
          total_price: number
          unit_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          product_id: string
          purchase_order_id: string
          quantity: number
          received_quantity?: number
          total_price: number
          unit_price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          product_id?: string
          purchase_order_id?: string
          quantity?: number
          received_quantity?: number
          total_price?: number
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          company_id: string
          created_at: string
          created_by: string
          expected_delivery_date: string | null
          id: string
          notes: string | null
          order_date: string
          order_number: string
          status: Database["public"]["Enums"]["purchase_status"]
          supplier_id: string
          total_amount: number
          updated_at: string
          updated_by: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by: string
          expected_delivery_date?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          order_number: string
          status?: Database["public"]["Enums"]["purchase_status"]
          supplier_id: string
          total_amount?: number
          updated_at?: string
          updated_by: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string
          expected_delivery_date?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          order_number?: string
          status?: Database["public"]["Enums"]["purchase_status"]
          supplier_id?: string
          total_amount?: number
          updated_at?: string
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
            foreignKeyName: "purchase_orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reception_items: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          ordered_quantity: number
          product_id: string
          purchase_order_item_id: string
          quality_check: boolean
          received_quantity: number
          reception_id: string
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          ordered_quantity: number
          product_id: string
          purchase_order_item_id: string
          quality_check?: boolean
          received_quantity: number
          reception_id: string
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          ordered_quantity?: number
          product_id?: string
          purchase_order_item_id?: string
          quality_check?: boolean
          received_quantity?: number
          reception_id?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "reception_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
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
            foreignKeyName: "reception_items_reception_id_fkey"
            columns: ["reception_id"]
            isOneToOne: false
            referencedRelation: "receptions"
            referencedColumns: ["id"]
          },
        ]
      }
      receptions: {
        Row: {
          company_id: string
          created_at: string
          created_by: string
          id: string
          is_validated: boolean
          notes: string | null
          purchase_order_id: string
          reception_date: string
          reception_number: string
          validated_at: string | null
          validated_by: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by: string
          id?: string
          is_validated?: boolean
          notes?: string | null
          purchase_order_id: string
          reception_date?: string
          reception_number: string
          validated_at?: string | null
          validated_by?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string
          id?: string
          is_validated?: boolean
          notes?: string | null
          purchase_order_id?: string
          reception_date?: string
          reception_number?: string
          validated_at?: string | null
          validated_by?: string | null
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
            foreignKeyName: "receptions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receptions_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receptions_validated_by_fkey"
            columns: ["validated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      remunerations: {
        Row: {
          amount: number
          company_id: string | null
          created_at: string | null
          created_by: string | null
          employee_id: string | null
          id: string
          notes: string | null
          order_id: string | null
          payment_date: string | null
          payment_type: string | null
          production_task_id: string | null
          status: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          amount: number
          company_id?: string | null
          created_at?: string | null
          created_by?: string | null
          employee_id?: string | null
          id?: string
          notes?: string | null
          order_id?: string | null
          payment_date?: string | null
          payment_type?: string | null
          production_task_id?: string | null
          status?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          amount?: number
          company_id?: string | null
          created_at?: string | null
          created_by?: string | null
          employee_id?: string | null
          id?: string
          notes?: string | null
          order_id?: string | null
          payment_date?: string | null
          payment_type?: string | null
          production_task_id?: string | null
          status?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "remunerations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "remunerations_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "remunerations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "remunerations_production_task_id_fkey"
            columns: ["production_task_id"]
            isOneToOne: false
            referencedRelation: "production_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          company_id: string
          created_at: string
          created_by: string
          id: string
          movement_date: string
          movement_type: string
          notes: string | null
          product_id: string
          quantity: number
          reference: string | null
          unit_price: number | null
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by: string
          id?: string
          movement_date?: string
          movement_type: string
          notes?: string | null
          product_id: string
          quantity: number
          reference?: string | null
          unit_price?: number | null
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string
          id?: string
          movement_date?: string
          movement_type?: string
          notes?: string | null
          product_id?: string
          quantity?: number
          reference?: string | null
          unit_price?: number | null
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
            foreignKeyName: "stock_movements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_valuation_movements: {
        Row: {
          company_id: string
          created_at: string
          id: string
          movement_id: string
          product_id: string
          quantity: number
          total_cost: number
          unit_cost: number
          valuation_method: Database["public"]["Enums"]["stock_valuation_method"]
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          movement_id: string
          product_id: string
          quantity: number
          total_cost: number
          unit_cost: number
          valuation_method: Database["public"]["Enums"]["stock_valuation_method"]
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          movement_id?: string
          product_id?: string
          quantity?: number
          total_cost?: number
          unit_cost?: number
          valuation_method?: Database["public"]["Enums"]["stock_valuation_method"]
        }
        Relationships: [
          {
            foreignKeyName: "stock_valuation_movements_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_valuation_movements_movement_id_fkey"
            columns: ["movement_id"]
            isOneToOne: false
            referencedRelation: "stock_movements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_valuation_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_valuation_settings: {
        Row: {
          company_id: string
          created_at: string
          created_by: string
          id: string
          is_active: boolean
          product_category_id: string | null
          updated_at: string
          updated_by: string
          valuation_method: Database["public"]["Enums"]["stock_valuation_method"]
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by: string
          id?: string
          is_active?: boolean
          product_category_id?: string | null
          updated_at?: string
          updated_by: string
          valuation_method?: Database["public"]["Enums"]["stock_valuation_method"]
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string
          id?: string
          is_active?: boolean
          product_category_id?: string | null
          updated_at?: string
          updated_by?: string
          valuation_method?: Database["public"]["Enums"]["stock_valuation_method"]
        }
        Relationships: [
          {
            foreignKeyName: "stock_valuation_settings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_valuation_settings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_valuation_settings_product_category_id_fkey"
            columns: ["product_category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_valuation_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_invoices: {
        Row: {
          company_id: string
          created_at: string
          created_by: string
          due_date: string
          id: string
          invoice_date: string
          invoice_number: string
          is_paid: boolean
          notes: string | null
          paid_at: string | null
          paid_by: string | null
          purchase_order_id: string
          total_amount: number
          updated_at: string
          updated_by: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by: string
          due_date: string
          id?: string
          invoice_date: string
          invoice_number: string
          is_paid?: boolean
          notes?: string | null
          paid_at?: string | null
          paid_by?: string | null
          purchase_order_id: string
          total_amount: number
          updated_at?: string
          updated_by: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string
          due_date?: string
          id?: string
          invoice_date?: string
          invoice_number?: string
          is_paid?: boolean
          notes?: string | null
          paid_at?: string | null
          paid_by?: string | null
          purchase_order_id?: string
          total_amount?: number
          updated_at?: string
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
            foreignKeyName: "supplier_invoices_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_invoices_paid_by_fkey"
            columns: ["paid_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_invoices_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_invoices_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          company_id: string
          contact_person: string | null
          created_at: string
          created_by: string
          email: string | null
          id: string
          is_active: boolean
          name: string
          payment_terms: number | null
          phone: string | null
          updated_at: string
          updated_by: string
        }
        Insert: {
          address?: string | null
          company_id: string
          contact_person?: string | null
          created_at?: string
          created_by: string
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          payment_terms?: number | null
          phone?: string | null
          updated_at?: string
          updated_by: string
        }
        Update: {
          address?: string | null
          company_id?: string
          contact_person?: string | null
          created_at?: string
          created_by?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          payment_terms?: number | null
          phone?: string | null
          updated_at?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suppliers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suppliers_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      syscohada_accounts: {
        Row: {
          account_category: string
          account_name: string
          account_number: string
          account_type: string
          company_id: string
          created_at: string
          created_by: string
          id: string
          is_active: boolean
          is_system_account: boolean
          parent_account_id: string | null
          updated_at: string
          updated_by: string
        }
        Insert: {
          account_category: string
          account_name: string
          account_number: string
          account_type: string
          company_id: string
          created_at?: string
          created_by: string
          id?: string
          is_active?: boolean
          is_system_account?: boolean
          parent_account_id?: string | null
          updated_at?: string
          updated_by: string
        }
        Update: {
          account_category?: string
          account_name?: string
          account_number?: string
          account_type?: string
          company_id?: string
          created_at?: string
          created_by?: string
          id?: string
          is_active?: boolean
          is_system_account?: boolean
          parent_account_id?: string | null
          updated_at?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "syscohada_accounts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "syscohada_accounts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "syscohada_accounts_parent_account_id_fkey"
            columns: ["parent_account_id"]
            isOneToOne: false
            referencedRelation: "syscohada_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "syscohada_accounts_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      treasury_accounts: {
        Row: {
          account_id: string
          account_name: string
          account_number: string | null
          account_type: string
          bank_name: string | null
          branch_code: string | null
          company_id: string
          created_at: string
          created_by: string
          currency: string
          current_balance: number
          id: string
          initial_balance: number
          is_active: boolean
          is_reconciled: boolean
          last_reconciliation_date: string | null
          notes: string | null
          updated_at: string
          updated_by: string
        }
        Insert: {
          account_id: string
          account_name: string
          account_number?: string | null
          account_type: string
          bank_name?: string | null
          branch_code?: string | null
          company_id: string
          created_at?: string
          created_by: string
          currency?: string
          current_balance?: number
          id?: string
          initial_balance?: number
          is_active?: boolean
          is_reconciled?: boolean
          last_reconciliation_date?: string | null
          notes?: string | null
          updated_at?: string
          updated_by: string
        }
        Update: {
          account_id?: string
          account_name?: string
          account_number?: string | null
          account_type?: string
          bank_name?: string | null
          branch_code?: string | null
          company_id?: string
          created_at?: string
          created_by?: string
          currency?: string
          current_balance?: number
          id?: string
          initial_balance?: number
          is_active?: boolean
          is_reconciled?: boolean
          last_reconciliation_date?: string | null
          notes?: string | null
          updated_at?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "treasury_accounts_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "syscohada_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treasury_accounts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treasury_accounts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treasury_accounts_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      treasury_movements: {
        Row: {
          accounting_entry_id: string | null
          amount: number
          beneficiary: string | null
          category: string
          company_id: string
          created_at: string
          created_by: string
          description: string
          id: string
          is_reconciled: boolean
          movement_date: string
          movement_number: string
          movement_type: string
          notes: string | null
          reference: string | null
          source_id: string | null
          source_type: string | null
          transfer_to_account_id: string | null
          treasury_account_id: string
          updated_at: string
          updated_by: string
        }
        Insert: {
          accounting_entry_id?: string | null
          amount: number
          beneficiary?: string | null
          category: string
          company_id: string
          created_at?: string
          created_by: string
          description: string
          id?: string
          is_reconciled?: boolean
          movement_date?: string
          movement_number: string
          movement_type: string
          notes?: string | null
          reference?: string | null
          source_id?: string | null
          source_type?: string | null
          transfer_to_account_id?: string | null
          treasury_account_id: string
          updated_at?: string
          updated_by: string
        }
        Update: {
          accounting_entry_id?: string | null
          amount?: number
          beneficiary?: string | null
          category?: string
          company_id?: string
          created_at?: string
          created_by?: string
          description?: string
          id?: string
          is_reconciled?: boolean
          movement_date?: string
          movement_number?: string
          movement_type?: string
          notes?: string | null
          reference?: string | null
          source_id?: string | null
          source_type?: string | null
          transfer_to_account_id?: string | null
          treasury_account_id?: string
          updated_at?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "treasury_movements_accounting_entry_id_fkey"
            columns: ["accounting_entry_id"]
            isOneToOne: false
            referencedRelation: "accounting_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treasury_movements_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treasury_movements_transfer_to_account_id_fkey"
            columns: ["transfer_to_account_id"]
            isOneToOne: false
            referencedRelation: "treasury_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treasury_movements_treasury_account_id_fkey"
            columns: ["treasury_account_id"]
            isOneToOne: false
            referencedRelation: "treasury_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      work_hours: {
        Row: {
          company_id: string
          created_at: string
          created_by: string
          employee_id: string
          end_time: string | null
          id: string
          is_paid: boolean
          notes: string | null
          order_id: string | null
          start_time: string | null
          total_hours: number | null
          updated_at: string
          updated_by: string
          work_date: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by: string
          employee_id: string
          end_time?: string | null
          id?: string
          is_paid?: boolean
          notes?: string | null
          order_id?: string | null
          start_time?: string | null
          total_hours?: number | null
          updated_at?: string
          updated_by: string
          work_date: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string
          employee_id?: string
          end_time?: string | null
          id?: string
          is_paid?: boolean
          notes?: string | null
          order_id?: string | null
          start_time?: string | null
          total_hours?: number | null
          updated_at?: string
          updated_by?: string
          work_date?: string
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
            foreignKeyName: "work_hours_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "employees"
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
          },
          {
            foreignKeyName: "work_hours_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_entry_balance: { Args: { p_entry_id: string }; Returns: boolean }
      check_user_consistency: {
        Args: never
        Returns: {
          auth_users_count: number
          missing_profiles: number
          orphaned_profiles: number
          public_profiles_count: number
          status: string
        }[]
      }
      create_syscohada_chart_of_accounts: {
        Args: { p_company_id: string }
        Returns: undefined
      }
      create_user_with_profile: {
        Args: {
          user_company_id?: string
          user_email: string
          user_first_name?: string
          user_last_name?: string
          user_password: string
          user_role?: string
        }
        Returns: Json
      }
      generate_accounting_entry:
        | {
            Args: {
              p_company_id: string
              p_description: string
              p_entries: Json
              p_journal_type: Database["public"]["Enums"]["journal_type"]
              p_source_id: string
              p_source_type: string
            }
            Returns: string
          }
        | {
            Args: {
              p_company_id: string
              p_description: string
              p_entries: Json
              p_journal_id: string
            }
            Returns: string
          }
      generate_order_number: { Args: never; Returns: string }
      generate_treasury_movement_number: {
        Args: { p_company_id: string }
        Returns: string
      }
      get_employee_remunerations:
        | {
            Args: never
            Returns: {
              employee_id: string
              employee_name: string
              month_year: string
              total_remuneration: number
            }[]
          }
        | {
            Args: {
              p_employee_id: string
              p_end_date: string
              p_start_date: string
            }
            Returns: {
              completion_date: string
              hours_worked: number
              order_number: string
              payment_date: string
              remuneration_amount: number
              remuneration_status: string
              task_name: string
            }[]
          }
      get_production_stats:
        | {
            Args: never
            Returns: {
              completed_orders: number
              pending_orders: number
              total_orders: number
              total_revenue: number
            }[]
          }
        | {
            Args: { p_company_id: string }
            Returns: {
              completed_orders: number
              completed_tasks: number
              in_production_orders: number
              in_progress_tasks: number
              pending_orders: number
              pending_remuneration: number
              pending_tasks: number
              total_orders: number
              total_remuneration: number
              total_tasks: number
            }[]
          }
      get_user_company_id: { Args: never; Returns: string }
      has_role: {
        Args: { required_role: Database["public"]["Enums"]["user_role"] }
        Returns: boolean
      }
      post_accounting_entry: { Args: { p_entry_id: string }; Returns: boolean }
      repair_missing_profiles: { Args: never; Returns: Json }
      reverse_accounting_entry: {
        Args: { p_entry_id: string }
        Returns: string
      }
    }
    Enums: {
      alert_level: "info" | "warning" | "error" | "critical"
      alert_type:
        | "stock_low"
        | "order_delay"
        | "payment_due"
        | "supplier_delivery"
        | "quality_issue"
        | "system_alert"
      depreciation_type: "linear" | "declining_balance" | "units_of_production"
      journal_type:
        | "sales"
        | "treasury"
        | "payroll"
        | "stock"
        | "general"
        | "purchase"
        | "bank_reconciliation"
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
      stock_valuation_method: "fifo" | "lifo" | "average_cost" | "standard_cost"
      user_role:
        | "owner"
        | "manager"
        | "tailor"
        | "orders"
        | "stocks"
        | "customer_service"
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
      alert_level: ["info", "warning", "error", "critical"],
      alert_type: [
        "stock_low",
        "order_delay",
        "payment_due",
        "supplier_delivery",
        "quality_issue",
        "system_alert",
      ],
      depreciation_type: ["linear", "declining_balance", "units_of_production"],
      journal_type: [
        "sales",
        "treasury",
        "payroll",
        "stock",
        "general",
        "purchase",
        "bank_reconciliation",
      ],
      production_status: [
        "order_created",
        "waiting_materials",
        "materials_allocated",
        "cutting_in_progress",
        "cutting_completed",
        "assembly_in_progress",
        "assembly_completed",
        "finishing_in_progress",
        "quality_check",
        "ready_to_deliver",
        "delivered",
        "invoiced",
        "paid",
        "cancelled",
      ],
      purchase_status: [
        "draft",
        "ordered",
        "confirmed",
        "in_transit",
        "delivered_not_received",
        "received",
        "invoice_received",
        "ready_to_pay",
        "paid",
        "cancelled",
      ],
      stock_valuation_method: ["fifo", "lifo", "average_cost", "standard_cost"],
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
