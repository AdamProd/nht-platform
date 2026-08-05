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
      creator_activity: {
        Row: {
          body: string | null;
          created_at: string;
          creator_id: string;
          id: string;
          kind: string;
          title: string;
        };
        Insert: {
          body?: string | null;
          created_at?: string;
          creator_id: string;
          id?: string;
          kind?: string;
          title: string;
        };
        Update: {
          body?: string | null;
          created_at?: string;
          creator_id?: string;
          id?: string;
          kind?: string;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "creator_activity_creator_id_fkey";
            columns: ["creator_id"];
            isOneToOne: false;
            referencedRelation: "creators";
            referencedColumns: ["id"];
          },
        ];
      };
      creator_documents: {
        Row: {
          bucket: string;
          created_at: string;
          creator_id: string;
          doc_type: Database["public"]["Enums"]["creator_document_type"];
          file_name: string;
          id: string;
          mime_type: string | null;
          path: string;
          size_bytes: number | null;
          uploaded_by: string | null;
        };
        Insert: {
          bucket?: string;
          created_at?: string;
          creator_id: string;
          doc_type: Database["public"]["Enums"]["creator_document_type"];
          file_name: string;
          id?: string;
          mime_type?: string | null;
          path: string;
          size_bytes?: number | null;
          uploaded_by?: string | null;
        };
        Update: {
          bucket?: string;
          created_at?: string;
          creator_id?: string;
          doc_type?: Database["public"]["Enums"]["creator_document_type"];
          file_name?: string;
          id?: string;
          mime_type?: string | null;
          path?: string;
          size_bytes?: number | null;
          uploaded_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "creator_documents_creator_id_fkey";
            columns: ["creator_id"];
            isOneToOne: false;
            referencedRelation: "creators";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "creator_documents_uploaded_by_fkey";
            columns: ["uploaded_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      creator_payouts: {
        Row: {
          amount: number;
          created_at: string;
          creator_id: string;
          currency: string;
          id: string;
          method: Database["public"]["Enums"]["payout_method"];
          paid_at: string | null;
          period_end: string;
          period_start: string;
          receipt_number: string | null;
          status: Database["public"]["Enums"]["payout_status"];
          updated_at: string;
        };
        Insert: {
          amount?: number;
          created_at?: string;
          creator_id: string;
          currency?: string;
          id?: string;
          method?: Database["public"]["Enums"]["payout_method"];
          paid_at?: string | null;
          period_end: string;
          period_start: string;
          receipt_number?: string | null;
          status?: Database["public"]["Enums"]["payout_status"];
          updated_at?: string;
        };
        Update: {
          amount?: number;
          created_at?: string;
          creator_id?: string;
          currency?: string;
          id?: string;
          method?: Database["public"]["Enums"]["payout_method"];
          paid_at?: string | null;
          period_end?: string;
          period_start?: string;
          receipt_number?: string | null;
          status?: Database["public"]["Enums"]["payout_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "creator_payouts_creator_id_fkey";
            columns: ["creator_id"];
            isOneToOne: false;
            referencedRelation: "creators";
            referencedColumns: ["id"];
          },
        ];
      };
      creator_platform_accounts: {
        Row: {
          created_at: string;
          creator_id: string;
          id: string;
          manager_notes: string | null;
          platform: string;
          profile_url: string | null;
          status: Database["public"]["Enums"]["platform_link_status"];
          updated_at: string;
          username: string | null;
        };
        Insert: {
          created_at?: string;
          creator_id: string;
          id?: string;
          manager_notes?: string | null;
          platform: string;
          profile_url?: string | null;
          status?: Database["public"]["Enums"]["platform_link_status"];
          updated_at?: string;
          username?: string | null;
        };
        Update: {
          created_at?: string;
          creator_id?: string;
          id?: string;
          manager_notes?: string | null;
          platform?: string;
          profile_url?: string | null;
          status?: Database["public"]["Enums"]["platform_link_status"];
          updated_at?: string;
          username?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "creator_platform_accounts_creator_id_fkey";
            columns: ["creator_id"];
            isOneToOne: false;
            referencedRelation: "creators";
            referencedColumns: ["id"];
          },
        ];
      };
      creator_settings: {
        Row: {
          creator_id: string;
          locale: string | null;
          notify_email: boolean;
          notify_telegram: boolean;
          theme: string;
          updated_at: string;
        };
        Insert: {
          creator_id: string;
          locale?: string | null;
          notify_email?: boolean;
          notify_telegram?: boolean;
          theme?: string;
          updated_at?: string;
        };
        Update: {
          creator_id?: string;
          locale?: string | null;
          notify_email?: boolean;
          notify_telegram?: boolean;
          theme?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "creator_settings_creator_id_fkey";
            columns: ["creator_id"];
            isOneToOne: true;
            referencedRelation: "creators";
            referencedColumns: ["id"];
          },
        ];
      };
      creator_stats_daily: {
        Row: {
          content: number;
          creator_id: string;
          day: string;
          growth: number;
          id: string;
          messages: number;
          revenue: number;
          subscribers: number;
        };
        Insert: {
          content?: number;
          creator_id: string;
          day: string;
          growth?: number;
          id?: string;
          messages?: number;
          revenue?: number;
          subscribers?: number;
        };
        Update: {
          content?: number;
          creator_id?: string;
          day?: string;
          growth?: number;
          id?: string;
          messages?: number;
          revenue?: number;
          subscribers?: number;
        };
        Relationships: [
          {
            foreignKeyName: "creator_stats_daily_creator_id_fkey";
            columns: ["creator_id"];
            isOneToOne: false;
            referencedRelation: "creators";
            referencedColumns: ["id"];
          },
        ];
      };
      creator_support_messages: {
        Row: {
          author_id: string | null;
          body: string;
          created_at: string;
          id: string;
          is_staff: boolean;
          ticket_id: string;
        };
        Insert: {
          author_id?: string | null;
          body: string;
          created_at?: string;
          id?: string;
          is_staff?: boolean;
          ticket_id: string;
        };
        Update: {
          author_id?: string | null;
          body?: string;
          created_at?: string;
          id?: string;
          is_staff?: boolean;
          ticket_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "creator_support_messages_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "creator_support_messages_ticket_id_fkey";
            columns: ["ticket_id"];
            isOneToOne: false;
            referencedRelation: "creator_support_tickets";
            referencedColumns: ["id"];
          },
        ];
      };
      creator_support_tickets: {
        Row: {
          created_at: string;
          creator_id: string;
          id: string;
          last_message_at: string;
          status: Database["public"]["Enums"]["support_ticket_status"];
          subject: string;
          unread_for_creator: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          creator_id: string;
          id?: string;
          last_message_at?: string;
          status?: Database["public"]["Enums"]["support_ticket_status"];
          subject: string;
          unread_for_creator?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          creator_id?: string;
          id?: string;
          last_message_at?: string;
          status?: Database["public"]["Enums"]["support_ticket_status"];
          subject?: string;
          unread_for_creator?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "creator_support_tickets_creator_id_fkey";
            columns: ["creator_id"];
            isOneToOne: false;
            referencedRelation: "creators";
            referencedColumns: ["id"];
          },
        ];
      };
      creator_tasks: {
        Row: {
          completed_at: string | null;
          created_at: string;
          creator_id: string;
          deadline: string | null;
          details: string | null;
          id: string;
          manager_id: string | null;
          priority: Database["public"]["Enums"]["cabinet_task_priority"];
          status: Database["public"]["Enums"]["cabinet_task_status"];
          title: string;
          updated_at: string;
        };
        Insert: {
          completed_at?: string | null;
          created_at?: string;
          creator_id: string;
          deadline?: string | null;
          details?: string | null;
          id?: string;
          manager_id?: string | null;
          priority?: Database["public"]["Enums"]["cabinet_task_priority"];
          status?: Database["public"]["Enums"]["cabinet_task_status"];
          title: string;
          updated_at?: string;
        };
        Update: {
          completed_at?: string | null;
          created_at?: string;
          creator_id?: string;
          deadline?: string | null;
          details?: string | null;
          id?: string;
          manager_id?: string | null;
          priority?: Database["public"]["Enums"]["cabinet_task_priority"];
          status?: Database["public"]["Enums"]["cabinet_task_status"];
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "creator_tasks_creator_id_fkey";
            columns: ["creator_id"];
            isOneToOne: false;
            referencedRelation: "creators";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "creator_tasks_manager_id_fkey";
            columns: ["manager_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      // Live remote schema (no user_id — auth link is creators.email ↔ auth.users.email)
      creators: {
        Row: {
          application_id: string | null;
          avatar_url: string | null;
          birthday: string | null;
          country: string | null;
          created_at: string;
          display_name: string;
          email: string;
          full_name: string;
          id: string;
          is_active: boolean;
          languages: string[];
          last_activity_at: string | null;
          last_login_at: string | null;
          legal_name: string | null;
          manager_id: string | null;
          notes: string | null;
          payouts_total: number;
          phone: string | null;
          platform_accounts: Json;
          platforms: string[];
          revenue_current_month: number;
          revenue_lifetime: number;
          revenue_previous_month: number;
          status: Database["public"]["Enums"]["creator_status"];
          telegram: string | null;
          timezone: string | null;
          updated_at: string;
        };
        Insert: {
          application_id?: string | null;
          avatar_url?: string | null;
          birthday?: string | null;
          country?: string | null;
          created_at?: string;
          display_name: string;
          email: string;
          full_name: string;
          id?: string;
          is_active?: boolean;
          languages?: string[];
          last_activity_at?: string | null;
          last_login_at?: string | null;
          legal_name?: string | null;
          manager_id?: string | null;
          notes?: string | null;
          payouts_total?: number;
          phone?: string | null;
          platform_accounts?: Json;
          platforms?: string[];
          revenue_current_month?: number;
          revenue_lifetime?: number;
          revenue_previous_month?: number;
          status?: Database["public"]["Enums"]["creator_status"];
          telegram?: string | null;
          timezone?: string | null;
          updated_at?: string;
        };
        Update: {
          application_id?: string | null;
          avatar_url?: string | null;
          birthday?: string | null;
          country?: string | null;
          created_at?: string;
          display_name?: string;
          email?: string;
          full_name?: string;
          id?: string;
          is_active?: boolean;
          languages?: string[];
          last_activity_at?: string | null;
          last_login_at?: string | null;
          legal_name?: string | null;
          manager_id?: string | null;
          notes?: string | null;
          payouts_total?: number;
          phone?: string | null;
          platform_accounts?: Json;
          platforms?: string[];
          revenue_current_month?: number;
          revenue_lifetime?: number;
          revenue_previous_month?: number;
          status?: Database["public"]["Enums"]["creator_status"];
          telegram?: string | null;
          timezone?: string | null;
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
      creator_audit_logs: {
        Row: {
          action: string;
          actor_id: string | null;
          created_at: string;
          creator_id: string | null;
          id: string;
          meta: Json;
        };
        Insert: {
          action: string;
          actor_id?: string | null;
          created_at?: string;
          creator_id?: string | null;
          id?: string;
          meta?: Json;
        };
        Update: {
          action?: string;
          actor_id?: string | null;
          created_at?: string;
          creator_id?: string | null;
          id?: string;
          meta?: Json;
        };
        Relationships: [
          {
            foreignKeyName: "creator_audit_logs_actor_id_fkey";
            columns: ["actor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "creator_audit_logs_creator_id_fkey";
            columns: ["creator_id"];
            isOneToOne: false;
            referencedRelation: "creators";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          biography: string | null;
          created_at: string;
          department: Database["public"]["Enums"]["staff_department"] | null;
          department_custom: string | null;
          email: string | null;
          full_name: string | null;
          id: string;
          last_login_at: string | null;
          locale: string | null;
          notes: string | null;
          phone: string | null;
          role: Database["public"]["Enums"]["user_role"];
          status: Database["public"]["Enums"]["staff_status"] | null;
          timezone: string | null;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          biography?: string | null;
          created_at?: string;
          department?: Database["public"]["Enums"]["staff_department"] | null;
          department_custom?: string | null;
          email?: string | null;
          full_name?: string | null;
          id: string;
          last_login_at?: string | null;
          locale?: string | null;
          notes?: string | null;
          phone?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          status?: Database["public"]["Enums"]["staff_status"] | null;
          timezone?: string | null;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          biography?: string | null;
          created_at?: string;
          department?: Database["public"]["Enums"]["staff_department"] | null;
          department_custom?: string | null;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          last_login_at?: string | null;
          locale?: string | null;
          notes?: string | null;
          phone?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          status?: Database["public"]["Enums"]["staff_status"] | null;
          timezone?: string | null;
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
      finance_transactions: {
        Row: {
          agency_amount: number;
          agency_percent: number;
          created_at: string;
          created_by: string | null;
          creator_amount: number;
          creator_id: string;
          creator_percent: number;
          currency: string;
          gross_revenue: number;
          id: string;
          manager_id: string | null;
          notes: string | null;
          payment_method: Database["public"]["Enums"]["finance_payment_method"] | null;
          platform: string;
          reference_id: string | null;
          status: Database["public"]["Enums"]["finance_transaction_status"];
          transaction_date: string;
          updated_at: string;
        };
        Insert: {
          agency_amount?: number;
          agency_percent?: number;
          created_at?: string;
          created_by?: string | null;
          creator_amount?: number;
          creator_id: string;
          creator_percent?: number;
          currency?: string;
          gross_revenue: number;
          id?: string;
          manager_id?: string | null;
          notes?: string | null;
          payment_method?: Database["public"]["Enums"]["finance_payment_method"] | null;
          platform?: string;
          reference_id?: string | null;
          status?: Database["public"]["Enums"]["finance_transaction_status"];
          transaction_date?: string;
          updated_at?: string;
        };
        Update: {
          agency_amount?: number;
          agency_percent?: number;
          created_at?: string;
          created_by?: string | null;
          creator_amount?: number;
          creator_id?: string;
          creator_percent?: number;
          currency?: string;
          gross_revenue?: number;
          id?: string;
          manager_id?: string | null;
          notes?: string | null;
          payment_method?: Database["public"]["Enums"]["finance_payment_method"] | null;
          platform?: string;
          reference_id?: string | null;
          status?: Database["public"]["Enums"]["finance_transaction_status"];
          transaction_date?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "finance_transactions_creator_id_fkey";
            columns: ["creator_id"];
            isOneToOne: false;
            referencedRelation: "creators";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "finance_transactions_manager_id_fkey";
            columns: ["manager_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "finance_transactions_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      platform_events: {
        Row: {
          actor_id: string | null;
          actor_role: Database["public"]["Enums"]["user_role"] | null;
          created_at: string;
          entity_type: string | null;
          id: string;
          module: string;
          payload: Json;
          related_creator_id: string | null;
          target_id: string | null;
          type: string;
          visibility: string;
        };
        Insert: {
          actor_id?: string | null;
          actor_role?: Database["public"]["Enums"]["user_role"] | null;
          created_at?: string;
          entity_type?: string | null;
          id?: string;
          module: string;
          payload?: Json;
          related_creator_id?: string | null;
          target_id?: string | null;
          type: string;
          visibility?: string;
        };
        Update: {
          actor_id?: string | null;
          actor_role?: Database["public"]["Enums"]["user_role"] | null;
          created_at?: string;
          entity_type?: string | null;
          id?: string;
          module?: string;
          payload?: Json;
          related_creator_id?: string | null;
          target_id?: string | null;
          type?: string;
          visibility?: string;
        };
        Relationships: [
          {
            foreignKeyName: "platform_events_actor_id_fkey";
            columns: ["actor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "platform_events_related_creator_id_fkey";
            columns: ["related_creator_id"];
            isOneToOne: false;
            referencedRelation: "creators";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          actor_id: string | null;
          archived_at: string | null;
          created_at: string;
          event_id: string | null;
          event_type: string;
          id: string;
          link: string | null;
          message: string;
          module: string;
          read_at: string | null;
          recipient_id: string;
          title: string;
        };
        Insert: {
          actor_id?: string | null;
          archived_at?: string | null;
          created_at?: string;
          event_id?: string | null;
          event_type: string;
          id?: string;
          link?: string | null;
          message: string;
          module: string;
          read_at?: string | null;
          recipient_id: string;
          title: string;
        };
        Update: {
          actor_id?: string | null;
          archived_at?: string | null;
          created_at?: string;
          event_id?: string | null;
          event_type?: string;
          id?: string;
          link?: string | null;
          message?: string;
          module?: string;
          read_at?: string | null;
          recipient_id?: string;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_recipient_id_fkey";
            columns: ["recipient_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notifications_actor_id_fkey";
            columns: ["actor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notifications_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "platform_events";
            referencedColumns: ["id"];
          },
        ];
      };
      activity_logs: {
        Row: {
          actor_id: string | null;
          actor_role: Database["public"]["Enums"]["user_role"] | null;
          created_at: string;
          description: string;
          entity_id: string | null;
          entity_type: string | null;
          event_id: string | null;
          event_type: string;
          id: string;
          module: string;
          payload: Json;
          related_creator_id: string | null;
          visibility: string;
        };
        Insert: {
          actor_id?: string | null;
          actor_role?: Database["public"]["Enums"]["user_role"] | null;
          created_at?: string;
          description: string;
          entity_id?: string | null;
          entity_type?: string | null;
          event_id?: string | null;
          event_type: string;
          id?: string;
          module: string;
          payload?: Json;
          related_creator_id?: string | null;
          visibility?: string;
        };
        Update: {
          actor_id?: string | null;
          actor_role?: Database["public"]["Enums"]["user_role"] | null;
          created_at?: string;
          description?: string;
          entity_id?: string | null;
          entity_type?: string | null;
          event_id?: string | null;
          event_type?: string;
          id?: string;
          module?: string;
          payload?: Json;
          related_creator_id?: string | null;
          visibility?: string;
        };
        Relationships: [
          {
            foreignKeyName: "activity_logs_actor_id_fkey";
            columns: ["actor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "activity_logs_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "platform_events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "activity_logs_related_creator_id_fkey";
            columns: ["related_creator_id"];
            isOneToOne: false;
            referencedRelation: "creators";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      acting_creator_id: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      can_access_creator: {
        Args: { target_creator_id: string };
        Returns: boolean;
      };
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
      is_creator_role: {
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
      cabinet_task_priority: "low" | "normal" | "high" | "urgent";
      cabinet_task_status: "open" | "in_progress" | "completed" | "cancelled";
      creator_document_type: "passport" | "agreement" | "tax" | "bank";
      creator_status:
        | "new"
        | "invited"
        | "active"
        | "paused"
        | "vacation"
        | "inactive"
        | "banned";
      finance_payment_method:
        | "stripe"
        | "wise"
        | "paypal"
        | "crypto"
        | "bank_transfer"
        | "other";
      finance_transaction_status:
        | "pending"
        | "approved"
        | "paid"
        | "cancelled"
        | "disputed";
      payout_method: "bank" | "paypal" | "crypto" | "other";
      payout_status: "pending" | "processing" | "completed" | "failed";
      platform_link_status: "linked" | "pending" | "disconnected" | "issue";
      staff_department:
        | "management"
        | "sales"
        | "support"
        | "marketing"
        | "content"
        | "finance"
        | "hr"
        | "operations"
        | "custom";
      staff_status:
        | "invited"
        | "active"
        | "vacation"
        | "suspended"
        | "disabled"
        | "archived";
      support_ticket_status: "open" | "waiting" | "answered" | "closed";
      user_role:
        | "owner"
        | "admin"
        | "manager"
        | "support"
        | "moderator"
        | "content_manager"
        | "finance"
        | "viewer"
        | "creator"
        | "guest";
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
export type StaffStatus = Enums<"staff_status">;
export type StaffDepartment = Enums<"staff_department">;
export type ApplicationType = Enums<"application_type">;
export type ApplicationStatus = Enums<"application_status">;
export type ApplicationPriority = Enums<"application_priority">;
export type CreatorStatus = Enums<"creator_status">;
export type FinanceTransactionStatus = Enums<"finance_transaction_status">;
export type FinancePaymentMethod = Enums<"finance_payment_method">;
export type PlatformLinkStatus = Enums<"platform_link_status">;
export type CabinetTaskStatus = Enums<"cabinet_task_status">;
export type CabinetTaskPriority = Enums<"cabinet_task_priority">;
export type PayoutStatus = Enums<"payout_status">;
export type PayoutMethod = Enums<"payout_method">;
export type CreatorDocumentType = Enums<"creator_document_type">;
export type SupportTicketStatus = Enums<"support_ticket_status">;

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
      cabinet_task_priority: ["low", "normal", "high", "urgent"] as const,
      cabinet_task_status: [
        "open",
        "in_progress",
        "completed",
        "cancelled",
      ] as const,
      creator_document_type: [
        "passport",
        "agreement",
        "tax",
        "bank",
      ] as const,
      creator_status: [
        "new",
        "invited",
        "active",
        "paused",
        "vacation",
        "inactive",
        "banned",
      ] as const,
      finance_payment_method: [
        "stripe",
        "wise",
        "paypal",
        "crypto",
        "bank_transfer",
        "other",
      ] as const,
      finance_transaction_status: [
        "pending",
        "approved",
        "paid",
        "cancelled",
        "disputed",
      ] as const,
      payout_method: ["bank", "paypal", "crypto", "other"] as const,
      payout_status: [
        "pending",
        "processing",
        "completed",
        "failed",
      ] as const,
      platform_link_status: [
        "linked",
        "pending",
        "disconnected",
        "issue",
      ] as const,
      staff_department: [
        "management",
        "sales",
        "support",
        "marketing",
        "content",
        "finance",
        "hr",
        "operations",
        "custom",
      ] as const,
      staff_status: [
        "invited",
        "active",
        "vacation",
        "suspended",
        "disabled",
        "archived",
      ] as const,
      support_ticket_status: [
        "open",
        "waiting",
        "answered",
        "closed",
      ] as const,
      user_role: [
        "owner",
        "admin",
        "manager",
        "support",
        "moderator",
        "content_manager",
        "finance",
        "viewer",
        "creator",
        "guest",
      ] as const,
    },
  },
} as const;
