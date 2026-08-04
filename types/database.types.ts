/**
 * Supabase database types for NHT.
 *
 * Hand-maintained to match supabase/migrations.
 * Regenerate after schema changes:
 *   supabase gen types typescript --project-id <ref> > types/database.types.ts
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
      application_files: {
        Row: {
          application_id: string;
          bucket: string;
          category: string;
          created_at: string;
          file_name: string;
          id: string;
          mime_type: string | null;
          path: string;
          size_bytes: number | null;
          uploaded_by: string | null;
        };
        Insert: {
          application_id: string;
          bucket?: string;
          category: string;
          created_at?: string;
          file_name: string;
          id?: string;
          mime_type?: string | null;
          path: string;
          size_bytes?: number | null;
          uploaded_by?: string | null;
        };
        Update: {
          application_id?: string;
          bucket?: string;
          category?: string;
          created_at?: string;
          file_name?: string;
          id?: string;
          mime_type?: string | null;
          path?: string;
          size_bytes?: number | null;
          uploaded_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "application_files_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: false;
            referencedRelation: "applications";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "application_files_uploaded_by_fkey";
            columns: ["uploaded_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      applications: {
        Row: {
          assigned_manager: string | null;
          created_at: string;
          email: string;
          full_name: string;
          id: string;
          last_contact_at: string | null;
          locale: string;
          message: string | null;
          notes: string | null;
          platform: string | null;
          priority: Database["public"]["Enums"]["application_priority"];
          status: Database["public"]["Enums"]["application_status"];
          type: Database["public"]["Enums"]["application_type"];
          updated_at: string;
        };
        Insert: {
          assigned_manager?: string | null;
          created_at?: string;
          email: string;
          full_name: string;
          id?: string;
          last_contact_at?: string | null;
          locale?: string;
          message?: string | null;
          notes?: string | null;
          platform?: string | null;
          priority?: Database["public"]["Enums"]["application_priority"];
          status?: Database["public"]["Enums"]["application_status"];
          type?: Database["public"]["Enums"]["application_type"];
          updated_at?: string;
        };
        Update: {
          assigned_manager?: string | null;
          created_at?: string;
          email?: string;
          full_name?: string;
          id?: string;
          last_contact_at?: string | null;
          locale?: string;
          message?: string | null;
          notes?: string | null;
          platform?: string | null;
          priority?: Database["public"]["Enums"]["application_priority"];
          status?: Database["public"]["Enums"]["application_status"];
          type?: Database["public"]["Enums"]["application_type"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "applications_assigned_manager_fkey";
            columns: ["assigned_manager"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      blog_post_translations: {
        Row: {
          content: Json;
          created_at: string;
          excerpt: string | null;
          id: string;
          locale: string;
          post_id: string;
          seo_description: string | null;
          seo_title: string | null;
          slug: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          content?: Json;
          created_at?: string;
          excerpt?: string | null;
          id?: string;
          locale: string;
          post_id: string;
          seo_description?: string | null;
          seo_title?: string | null;
          slug: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          content?: Json;
          created_at?: string;
          excerpt?: string | null;
          id?: string;
          locale?: string;
          post_id?: string;
          seo_description?: string | null;
          seo_title?: string | null;
          slug?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "blog_post_translations_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "blog_posts";
            referencedColumns: ["id"];
          },
        ];
      };
      blog_posts: {
        Row: {
          author_id: string | null;
          cover_image_url: string | null;
          created_at: string;
          id: string;
          published_at: string | null;
          status: string;
          updated_at: string;
        };
        Insert: {
          author_id?: string | null;
          cover_image_url?: string | null;
          created_at?: string;
          id?: string;
          published_at?: string | null;
          status?: string;
          updated_at?: string;
        };
        Update: {
          author_id?: string | null;
          cover_image_url?: string | null;
          created_at?: string;
          id?: string;
          published_at?: string | null;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      creators: {
        Row: {
          application_id: string | null;
          avatar_url: string | null;
          country: string | null;
          created_at: string;
          email: string;
          full_name: string;
          id: string;
          is_active: boolean;
          languages: string[];
          manager_id: string | null;
          notes: string | null;
          platforms: string[];
          status: Database["public"]["Enums"]["creator_status"];
          telegram: string | null;
          updated_at: string;
        };
        Insert: {
          application_id?: string | null;
          avatar_url?: string | null;
          country?: string | null;
          created_at?: string;
          email: string;
          full_name: string;
          id?: string;
          is_active?: boolean;
          languages?: string[];
          manager_id?: string | null;
          notes?: string | null;
          platforms?: string[];
          status?: Database["public"]["Enums"]["creator_status"];
          telegram?: string | null;
          updated_at?: string;
        };
        Update: {
          application_id?: string | null;
          avatar_url?: string | null;
          country?: string | null;
          created_at?: string;
          email?: string;
          full_name?: string;
          id?: string;
          is_active?: boolean;
          languages?: string[];
          manager_id?: string | null;
          notes?: string | null;
          platforms?: string[];
          status?: Database["public"]["Enums"]["creator_status"];
          telegram?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "creators_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: false;
            referencedRelation: "applications";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "creators_manager_id_fkey";
            columns: ["manager_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          full_name: string | null;
          id: string;
          role: Database["public"]["Enums"]["user_role"];
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          full_name?: string | null;
          id: string;
          role?: Database["public"]["Enums"]["user_role"];
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          full_name?: string | null;
          id?: string;
          role?: Database["public"]["Enums"]["user_role"];
          updated_at?: string;
        };
        Relationships: [];
      };
      settings: {
        Row: {
          key: string;
          updated_at: string;
          updated_by: string | null;
          value: Json;
        };
        Insert: {
          key: string;
          updated_at?: string;
          updated_by?: string | null;
          value?: Json;
        };
        Update: {
          key?: string;
          updated_at?: string;
          updated_by?: string | null;
          value?: Json;
        };
        Relationships: [
          {
            foreignKeyName: "settings_updated_by_fkey";
            columns: ["updated_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_user_role: {
        Args: Record<PropertyKey, never>;
        Returns: Database["public"]["Enums"]["user_role"];
      };
      is_admin_or_above: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_authenticated_user: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_owner: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_staff: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {
      application_priority: "low" | "normal" | "high" | "urgent";
      application_status:
        | "new"
        | "reviewing"
        | "contacted"
        | "meeting"
        | "active"
        | "rejected"
        | "archived";
      application_type: "creator" | "agency" | "partnership" | "general";
      creator_status:
        | "new"
        | "active"
        | "paused"
        | "vacation"
        | "inactive"
        | "banned";
      user_role: "owner" | "admin" | "manager" | "creator" | "guest";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];

export type UserRole = Enums<"user_role">;
export type ApplicationType = Enums<"application_type">;
export type ApplicationStatus = Enums<"application_status">;
export type ApplicationPriority = Enums<"application_priority">;
export type CreatorStatus = Enums<"creator_status">;

export const Constants = {
  public: {
    Enums: {
      application_priority: ["low", "normal", "high", "urgent"] as const,
      application_status: [
        "new",
        "reviewing",
        "contacted",
        "meeting",
        "active",
        "rejected",
        "archived",
      ] as const,
      application_type: ["creator", "agency", "partnership", "general"] as const,
      creator_status: [
        "new",
        "active",
        "paused",
        "vacation",
        "inactive",
        "banned",
      ] as const,
      user_role: ["owner", "admin", "manager", "creator", "guest"] as const,
    },
  },
} as const;
