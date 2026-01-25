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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          action_url: string | null
          created_at: string
          description: string | null
          id: string
          item_id: string | null
          item_title: string | null
          metadata: Json | null
          title: string
          type: Database["public"]["Enums"]["activity_type"]
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          item_id?: string | null
          item_title?: string | null
          metadata?: Json | null
          title: string
          type: Database["public"]["Enums"]["activity_type"]
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          item_id?: string | null
          item_title?: string | null
          metadata?: Json | null
          title?: string
          type?: Database["public"]["Enums"]["activity_type"]
          user_id?: string
        }
        Relationships: []
      }
      books: {
        Row: {
          author: string
          available_for_loan: number
          available_for_sale: number
          barcode: string | null
          category: string | null
          cover_url: string | null
          created_at: string
          discount: number | null
          edition: string | null
          id: string
          is_featured: boolean | null
          is_new: boolean | null
          isbn: string | null
          pages: number | null
          publication_year: number | null
          publisher: string | null
          sale_price: number | null
          spirit_author: string | null
          summary: string | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author: string
          available_for_loan?: number
          available_for_sale?: number
          barcode?: string | null
          category?: string | null
          cover_url?: string | null
          created_at?: string
          discount?: number | null
          edition?: string | null
          id?: string
          is_featured?: boolean | null
          is_new?: boolean | null
          isbn?: string | null
          pages?: number | null
          publication_year?: number | null
          publisher?: string | null
          sale_price?: number | null
          spirit_author?: string | null
          summary?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author?: string
          available_for_loan?: number
          available_for_sale?: number
          barcode?: string | null
          category?: string | null
          cover_url?: string | null
          created_at?: string
          discount?: number | null
          edition?: string | null
          id?: string
          is_featured?: boolean | null
          is_new?: boolean | null
          isbn?: string | null
          pages?: number | null
          publication_year?: number | null
          publisher?: string | null
          sale_price?: number | null
          spirit_author?: string | null
          summary?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          book_id: string
          created_at: string
          id: string
          quantity: number
          type: string
          user_id: string
        }
        Insert: {
          book_id: string
          created_at?: string
          id?: string
          quantity?: number
          type: string
          user_id: string
        }
        Update: {
          book_id?: string
          created_at?: string
          id?: string
          quantity?: number
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      loans: {
        Row: {
          admin_notes: string | null
          book_id: string
          created_at: string
          due_date: string | null
          id: string
          loan_date: string | null
          renewals_count: number | null
          return_date: string | null
          status: Database["public"]["Enums"]["loan_status"]
          updated_at: string
          user_id: string
          user_notes: string | null
        }
        Insert: {
          admin_notes?: string | null
          book_id: string
          created_at?: string
          due_date?: string | null
          id?: string
          loan_date?: string | null
          renewals_count?: number | null
          return_date?: string | null
          status?: Database["public"]["Enums"]["loan_status"]
          updated_at?: string
          user_id: string
          user_notes?: string | null
        }
        Update: {
          admin_notes?: string | null
          book_id?: string
          created_at?: string
          due_date?: string | null
          id?: string
          loan_date?: string | null
          renewals_count?: number | null
          return_date?: string | null
          status?: Database["public"]["Enums"]["loan_status"]
          updated_at?: string
          user_id?: string
          user_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loans_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: Json | null
          avatar_url: string | null
          cpf: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string | null
          social_name: string | null
          updated_at: string
        }
        Insert: {
          address?: Json | null
          avatar_url?: string | null
          cpf?: string | null
          created_at?: string
          email: string
          full_name: string
          id: string
          phone?: string | null
          social_name?: string | null
          updated_at?: string
        }
        Update: {
          address?: Json | null
          avatar_url?: string | null
          cpf?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          social_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          book_id: string
          comment: string | null
          created_at: string
          id: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          book_id: string
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          book_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          admin_notes: string | null
          book_id: string
          created_at: string
          discount: number | null
          id: string
          payment_method: string | null
          quantity: number
          status: Database["public"]["Enums"]["sale_status"]
          total_price: number
          unit_price: number
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          book_id: string
          created_at?: string
          discount?: number | null
          id?: string
          payment_method?: string | null
          quantity?: number
          status?: Database["public"]["Enums"]["sale_status"]
          total_price: number
          unit_price: number
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          book_id?: string
          created_at?: string
          discount?: number | null
          id?: string
          payment_method?: string | null
          quantity?: number
          status?: Database["public"]["Enums"]["sale_status"]
          total_price?: number
          unit_price?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wishlists: {
        Row: {
          book_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          book_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          book_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      activity_type:
        | "loan_request"
        | "loan_confirmed"
        | "loan_rejected"
        | "return_request"
        | "return_confirmed"
        | "return_rejected"
        | "renewal_request"
        | "renewal_confirmed"
        | "renewal_rejected"
        | "purchase"
        | "purchase_confirmed"
        | "purchase_cancelled"
        | "review"
        | "wishlist_add"
        | "wishlist_remove"
        | "message"
      app_role: "admin" | "user"
      loan_status:
        | "pending"
        | "active"
        | "returned"
        | "overdue"
        | "renewal_pending"
        | "return_pending"
      sale_status: "pending" | "confirmed" | "cancelled"
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
      activity_type: [
        "loan_request",
        "loan_confirmed",
        "loan_rejected",
        "return_request",
        "return_confirmed",
        "return_rejected",
        "renewal_request",
        "renewal_confirmed",
        "renewal_rejected",
        "purchase",
        "purchase_confirmed",
        "purchase_cancelled",
        "review",
        "wishlist_add",
        "wishlist_remove",
        "message",
      ],
      app_role: ["admin", "user"],
      loan_status: [
        "pending",
        "active",
        "returned",
        "overdue",
        "renewal_pending",
        "return_pending",
      ],
      sale_status: ["pending", "confirmed", "cancelled"],
    },
  },
} as const
