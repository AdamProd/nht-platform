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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          actor_id: string | null
          actor_role: Database["public"]["Enums"]["user_role"] | null
          created_at: string
          description: string
          entity_id: string | null
          entity_type: string | null
          event_id: string | null
          event_type: string
          id: string
          module: string
          payload: Json
          related_creator_id: string | null
          visibility: string
        }
        Insert: {
          actor_id?: string | null
          actor_role?: Database["public"]["Enums"]["user_role"] | null
          created_at?: string
          description: string
          entity_id?: string | null
          entity_type?: string | null
          event_id?: string | null
          event_type: string
          id?: string
          module: string
          payload?: Json
          related_creator_id?: string | null
          visibility?: string
        }
        Update: {
          actor_id?: string | null
          actor_role?: Database["public"]["Enums"]["user_role"] | null
          created_at?: string
          description?: string
          entity_id?: string | null
          entity_type?: string | null
          event_id?: string | null
          event_type?: string
          id?: string
          module?: string
          payload?: Json
          related_creator_id?: string | null
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "platform_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_related_creator_id_fkey"
            columns: ["related_creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }
      application_files: {
        Row: {
          application_id: string
          bucket: string
          category: string
          created_at: string
          file_name: string
          id: string
          mime_type: string | null
          path: string
          size_bytes: number | null
          uploaded_by: string | null
        }
        Insert: {
          application_id: string
          bucket?: string
          category: string
          created_at?: string
          file_name: string
          id?: string
          mime_type?: string | null
          path: string
          size_bytes?: number | null
          uploaded_by?: string | null
        }
        Update: {
          application_id?: string
          bucket?: string
          category?: string
          created_at?: string
          file_name?: string
          id?: string
          mime_type?: string | null
          path?: string
          size_bytes?: number | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "application_files_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "application_files_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          assigned_manager: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          last_contact_at: string | null
          locale: string
          message: string | null
          notes: string | null
          platform: string | null
          priority: Database["public"]["Enums"]["application_priority"]
          status: Database["public"]["Enums"]["application_status"]
          type: Database["public"]["Enums"]["application_type"]
          updated_at: string
        }
        Insert: {
          assigned_manager?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          last_contact_at?: string | null
          locale?: string
          message?: string | null
          notes?: string | null
          platform?: string | null
          priority?: Database["public"]["Enums"]["application_priority"]
          status?: Database["public"]["Enums"]["application_status"]
          type?: Database["public"]["Enums"]["application_type"]
          updated_at?: string
        }
        Update: {
          assigned_manager?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          last_contact_at?: string | null
          locale?: string
          message?: string | null
          notes?: string | null
          platform?: string | null
          priority?: Database["public"]["Enums"]["application_priority"]
          status?: Database["public"]["Enums"]["application_status"]
          type?: Database["public"]["Enums"]["application_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_assigned_manager_fkey"
            columns: ["assigned_manager"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_post_translations: {
        Row: {
          content: Json
          created_at: string
          excerpt: string | null
          id: string
          locale: string
          post_id: string
          seo_description: string | null
          seo_title: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          content?: Json
          created_at?: string
          excerpt?: string | null
          id?: string
          locale: string
          post_id: string
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          excerpt?: string | null
          id?: string
          locale?: string
          post_id?: string
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_translations_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_id: string | null
          cover_image_url: string | null
          created_at: string
          id: string
          published_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          cover_image_url?: string | null
          created_at?: string
          id?: string
          published_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          cover_image_url?: string | null
          created_at?: string
          id?: string
          published_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_activity: {
        Row: {
          body: string | null
          created_at: string
          creator_id: string
          id: string
          kind: string
          title: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          creator_id: string
          id?: string
          kind?: string
          title: string
        }
        Update: {
          body?: string | null
          created_at?: string
          creator_id?: string
          id?: string
          kind?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "creator_activity_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          creator_id: string | null
          id: string
          meta: Json
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          creator_id?: string | null
          id?: string
          meta?: Json
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          creator_id?: string | null
          id?: string
          meta?: Json
        }
        Relationships: [
          {
            foreignKeyName: "creator_audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creator_audit_logs_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_documents: {
        Row: {
          bucket: string
          created_at: string
          creator_id: string
          doc_type: Database["public"]["Enums"]["creator_document_type"]
          file_name: string
          id: string
          mime_type: string | null
          path: string
          size_bytes: number | null
          uploaded_by: string | null
        }
        Insert: {
          bucket?: string
          created_at?: string
          creator_id: string
          doc_type: Database["public"]["Enums"]["creator_document_type"]
          file_name: string
          id?: string
          mime_type?: string | null
          path: string
          size_bytes?: number | null
          uploaded_by?: string | null
        }
        Update: {
          bucket?: string
          created_at?: string
          creator_id?: string
          doc_type?: Database["public"]["Enums"]["creator_document_type"]
          file_name?: string
          id?: string
          mime_type?: string | null
          path?: string
          size_bytes?: number | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creator_documents_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creator_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_payouts: {
        Row: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          created_at: string
          creator_id: string
          currency: string
          id: string
          method: Database["public"]["Enums"]["payout_method"]
          notes: string | null
          paid_at: string | null
          period_end: string
          period_start: string
          receipt_number: string | null
          rejected_at: string | null
          rejected_by: string | null
          rejection_reason: string | null
          requested_at: string
          status: Database["public"]["Enums"]["payout_status"]
          updated_at: string
        }
        Insert: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          creator_id: string
          currency?: string
          id?: string
          method?: Database["public"]["Enums"]["payout_method"]
          notes?: string | null
          paid_at?: string | null
          period_end: string
          period_start: string
          receipt_number?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          requested_at?: string
          status?: Database["public"]["Enums"]["payout_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          creator_id?: string
          currency?: string
          id?: string
          method?: Database["public"]["Enums"]["payout_method"]
          notes?: string | null
          paid_at?: string | null
          period_end?: string
          period_start?: string
          receipt_number?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          requested_at?: string
          status?: Database["public"]["Enums"]["payout_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "creator_payouts_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creator_payouts_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creator_payouts_rejected_by_fkey"
            columns: ["rejected_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_platform_accounts: {
        Row: {
          created_at: string
          creator_id: string
          id: string
          manager_notes: string | null
          platform: string
          profile_url: string | null
          status: Database["public"]["Enums"]["platform_link_status"]
          updated_at: string
          username: string | null
        }
        Insert: {
          created_at?: string
          creator_id: string
          id?: string
          manager_notes?: string | null
          platform: string
          profile_url?: string | null
          status?: Database["public"]["Enums"]["platform_link_status"]
          updated_at?: string
          username?: string | null
        }
        Update: {
          created_at?: string
          creator_id?: string
          id?: string
          manager_notes?: string | null
          platform?: string
          profile_url?: string | null
          status?: Database["public"]["Enums"]["platform_link_status"]
          updated_at?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creator_platform_accounts_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_settings: {
        Row: {
          creator_id: string
          locale: string | null
          notify_email: boolean
          notify_telegram: boolean
          theme: string
          updated_at: string
        }
        Insert: {
          creator_id: string
          locale?: string | null
          notify_email?: boolean
          notify_telegram?: boolean
          theme?: string
          updated_at?: string
        }
        Update: {
          creator_id?: string
          locale?: string | null
          notify_email?: boolean
          notify_telegram?: boolean
          theme?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "creator_settings_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: true
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_stats_daily: {
        Row: {
          content: number
          creator_id: string
          day: string
          growth: number
          id: string
          messages: number
          revenue: number
          subscribers: number
        }
        Insert: {
          content?: number
          creator_id: string
          day: string
          growth?: number
          id?: string
          messages?: number
          revenue?: number
          subscribers?: number
        }
        Update: {
          content?: number
          creator_id?: string
          day?: string
          growth?: number
          id?: string
          messages?: number
          revenue?: number
          subscribers?: number
        }
        Relationships: [
          {
            foreignKeyName: "creator_stats_daily_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_support_messages: {
        Row: {
          author_id: string | null
          body: string
          created_at: string
          id: string
          is_staff: boolean
          ticket_id: string
        }
        Insert: {
          author_id?: string | null
          body: string
          created_at?: string
          id?: string
          is_staff?: boolean
          ticket_id: string
        }
        Update: {
          author_id?: string | null
          body?: string
          created_at?: string
          id?: string
          is_staff?: boolean
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "creator_support_messages_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creator_support_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "creator_support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_support_tickets: {
        Row: {
          created_at: string
          creator_id: string
          id: string
          last_message_at: string
          status: Database["public"]["Enums"]["support_ticket_status"]
          subject: string
          unread_for_creator: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          id?: string
          last_message_at?: string
          status?: Database["public"]["Enums"]["support_ticket_status"]
          subject: string
          unread_for_creator?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          id?: string
          last_message_at?: string
          status?: Database["public"]["Enums"]["support_ticket_status"]
          subject?: string
          unread_for_creator?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "creator_support_tickets_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_tasks: {
        Row: {
          completed_at: string | null
          created_at: string
          creator_id: string
          deadline: string | null
          details: string | null
          id: string
          manager_id: string | null
          priority: Database["public"]["Enums"]["cabinet_task_priority"]
          status: Database["public"]["Enums"]["cabinet_task_status"]
          title: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          creator_id: string
          deadline?: string | null
          details?: string | null
          id?: string
          manager_id?: string | null
          priority?: Database["public"]["Enums"]["cabinet_task_priority"]
          status?: Database["public"]["Enums"]["cabinet_task_status"]
          title: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          creator_id?: string
          deadline?: string | null
          details?: string | null
          id?: string
          manager_id?: string | null
          priority?: Database["public"]["Enums"]["cabinet_task_priority"]
          status?: Database["public"]["Enums"]["cabinet_task_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "creator_tasks_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creator_tasks_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          application_id: string | null
          archived_at: string | null
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          creator_id: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: Database["public"]["Enums"]["task_priority"]
          sort_order: number
          status: Database["public"]["Enums"]["task_status"]
          title: string
          type: Database["public"]["Enums"]["task_type"]
          updated_at: string
        }
        Insert: {
          application_id?: string | null
          archived_at?: string | null
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          creator_id?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          sort_order?: number
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          type?: Database["public"]["Enums"]["task_type"]
          updated_at?: string
        }
        Update: {
          application_id?: string | null
          archived_at?: string | null
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          creator_id?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          sort_order?: number
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          type?: Database["public"]["Enums"]["task_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }

      task_subtasks: {
        Row: {
          completed_at: string | null
          created_at: string
          created_by: string | null
          id: string
          is_done: boolean
          position: number
          task_id: string
          title: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_done?: boolean
          position?: number
          task_id: string
          title: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_done?: boolean
          position?: number
          task_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_subtasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_subtasks_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_attachments: {
        Row: {
          bucket: string
          created_at: string
          file_name: string
          id: string
          mime_type: string | null
          path: string
          size_bytes: number | null
          task_id: string
          uploaded_by: string | null
        }
        Insert: {
          bucket?: string
          created_at?: string
          file_name: string
          id?: string
          mime_type?: string | null
          path: string
          size_bytes?: number | null
          task_id: string
          uploaded_by?: string | null
        }
        Update: {
          bucket?: string
          created_at?: string
          file_name?: string
          id?: string
          mime_type?: string | null
          path?: string
          size_bytes?: number | null
          task_id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_attachments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      task_comments: {
        Row: {
          author_id: string | null
          body: string
          created_at: string
          id: string
          task_id: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          body: string
          created_at?: string
          id?: string
          task_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          body?: string
          created_at?: string
          id?: string
          task_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      creators: {
        Row: {
          manager_id: string | null
          manyvids_url: string | null
          notes: string | null
          onlyfans_url: string | null
          payout_method: Database["public"]["Enums"]["payout_method"]
          payouts_total: number
          phone: string | null
          platform_accounts: Json
          platforms: string[]
          preferred_currency: string
          profile_completed_at: string | null
          revenue_current_month: number
          revenue_lifetime: number
          revenue_previous_month: number
          status: Database["public"]["Enums"]["creator_status"]
          telegram: string | null
          tiktok_url: string | null
          timezone: string | null
          twitter_url: string | null
          updated_at: string
          user_id: string | null
          agency_percent: number
          application_id: string | null
          avatar_url: string | null
          biography: string | null
          birthday: string | null
          chaturbate_url: string | null
          country: string | null
          created_at: string
          display_name: string
          email: string
          fansly_url: string | null
          full_name: string
          id: string
          instagram_url: string | null
          invited_at: string | null
          invited_by: string | null
          is_active: boolean
          languages: string[]
          last_activity_at: string | null
          last_login_at: string | null
          legal_name: string | null
        }
        Insert: {
          application_id?: string | null
          avatar_url?: string | null
          biography?: string | null
          birthday?: string | null
          chaturbate_url?: string | null
          country?: string | null
          created_at?: string
          display_name: string
          email: string
          fansly_url?: string | null
          full_name: string
          id?: string
          instagram_url?: string | null
          invited_at?: string | null
          invited_by?: string | null
          is_active?: boolean
          languages?: string[]
          last_activity_at?: string | null
          last_login_at?: string | null
          legal_name?: string | null
          manager_id?: string | null
          manyvids_url?: string | null
          notes?: string | null
          onlyfans_url?: string | null
          agency_percent?: number
          payout_method?: Database["public"]["Enums"]["payout_method"]
          payouts_total?: number
          phone?: string | null
          platform_accounts?: Json
          platforms?: string[]
          preferred_currency?: string
          profile_completed_at?: string | null
          revenue_current_month?: number
          revenue_lifetime?: number
          revenue_previous_month?: number
          status?: Database["public"]["Enums"]["creator_status"]
          telegram?: string | null
          tiktok_url?: string | null
          timezone?: string | null
          twitter_url?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          application_id?: string | null
          avatar_url?: string | null
          biography?: string | null
          birthday?: string | null
          chaturbate_url?: string | null
          country?: string | null
          created_at?: string
          display_name?: string
          email?: string
          fansly_url?: string | null
          full_name?: string
          id?: string
          instagram_url?: string | null
          invited_at?: string | null
          invited_by?: string | null
          is_active?: boolean
          languages?: string[]
          last_activity_at?: string | null
          last_login_at?: string | null
          legal_name?: string | null
          manager_id?: string | null
          manyvids_url?: string | null
          notes?: string | null
          onlyfans_url?: string | null
          agency_percent?: number
          payout_method?: Database["public"]["Enums"]["payout_method"]
          payouts_total?: number
          phone?: string | null
          platform_accounts?: Json
          platforms?: string[]
          preferred_currency?: string
          profile_completed_at?: string | null
          revenue_current_month?: number
          revenue_lifetime?: number
          revenue_previous_month?: number
          status?: Database["public"]["Enums"]["creator_status"]
          telegram?: string | null
          tiktok_url?: string | null
          timezone?: string | null
          twitter_url?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creators_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creators_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creators_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creators_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      commission_history: {
        Row: {
          agency_percent: number
          bonus_percent: number
          changed_by: string | null
          created_at: string
          id: string
          manager_percent: number
          note: string | null
          referral_percent: number
          settings_id: string | null
        }
        Insert: {
          agency_percent: number
          bonus_percent?: number
          changed_by?: string | null
          created_at?: string
          id?: string
          manager_percent?: number
          note?: string | null
          referral_percent?: number
          settings_id?: string | null
        }
        Update: {
          agency_percent?: number
          bonus_percent?: number
          changed_by?: string | null
          created_at?: string
          id?: string
          manager_percent?: number
          note?: string | null
          referral_percent?: number
          settings_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commission_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commission_history_settings_id_fkey"
            columns: ["settings_id"]
            isOneToOne: false
            referencedRelation: "commission_settings"
            referencedColumns: ["id"]
          },
        ]
      }
      commission_settings: {
        Row: {
          agency_percent: number
          bonus_percent: number
          created_at: string
          id: string
          manager_percent: number
          referral_percent: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          agency_percent?: number
          bonus_percent?: number
          created_at?: string
          id?: string
          manager_percent?: number
          referral_percent?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          agency_percent?: number
          bonus_percent?: number
          created_at?: string
          id?: string
          manager_percent?: number
          referral_percent?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commission_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_transactions: {
        Row: {
          agency_amount: number
          agency_percent: number
          created_at: string
          created_by: string | null
          creator_amount: number
          creator_id: string
          creator_percent: number
          currency: string
          gross_revenue: number
          id: string
          manager_id: string | null
          notes: string | null
          payment_method:
            | Database["public"]["Enums"]["finance_payment_method"]
            | null
          platform: string
          reference_id: string | null
          status: Database["public"]["Enums"]["finance_transaction_status"]
          transaction_date: string
          updated_at: string
        }
        Insert: {
          agency_amount?: number
          agency_percent?: number
          created_at?: string
          created_by?: string | null
          creator_amount?: number
          creator_id: string
          creator_percent?: number
          currency?: string
          gross_revenue: number
          id?: string
          manager_id?: string | null
          notes?: string | null
          payment_method?:
            | Database["public"]["Enums"]["finance_payment_method"]
            | null
          platform: string
          reference_id?: string | null
          status?: Database["public"]["Enums"]["finance_transaction_status"]
          transaction_date?: string
          updated_at?: string
        }
        Update: {
          agency_amount?: number
          agency_percent?: number
          created_at?: string
          created_by?: string | null
          creator_amount?: number
          creator_id?: string
          creator_percent?: number
          currency?: string
          gross_revenue?: number
          id?: string
          manager_id?: string | null
          notes?: string | null
          payment_method?:
            | Database["public"]["Enums"]["finance_payment_method"]
            | null
          platform?: string
          reference_id?: string | null
          status?: Database["public"]["Enums"]["finance_transaction_status"]
          transaction_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "finance_transactions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_transactions_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_transactions_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          actor_id: string | null
          archived_at: string | null
          created_at: string
          event_id: string | null
          event_type: string
          id: string
          link: string | null
          message: string
          module: string
          read_at: string | null
          recipient_id: string
          title: string
        }
        Insert: {
          actor_id?: string | null
          archived_at?: string | null
          created_at?: string
          event_id?: string | null
          event_type: string
          id?: string
          link?: string | null
          message: string
          module: string
          read_at?: string | null
          recipient_id: string
          title: string
        }
        Update: {
          actor_id?: string | null
          archived_at?: string | null
          created_at?: string
          event_id?: string | null
          event_type?: string
          id?: string
          link?: string | null
          message?: string
          module?: string
          read_at?: string | null
          recipient_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "platform_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_events: {
        Row: {
          actor_id: string | null
          actor_role: Database["public"]["Enums"]["user_role"] | null
          created_at: string
          entity_type: string | null
          id: string
          module: string
          payload: Json
          related_creator_id: string | null
          target_id: string | null
          type: string
          visibility: string
        }
        Insert: {
          actor_id?: string | null
          actor_role?: Database["public"]["Enums"]["user_role"] | null
          created_at?: string
          entity_type?: string | null
          id?: string
          module: string
          payload?: Json
          related_creator_id?: string | null
          target_id?: string | null
          type: string
          visibility?: string
        }
        Update: {
          actor_id?: string | null
          actor_role?: Database["public"]["Enums"]["user_role"] | null
          created_at?: string
          entity_type?: string | null
          id?: string
          module?: string
          payload?: Json
          related_creator_id?: string | null
          target_id?: string | null
          type?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_events_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_events_related_creator_id_fkey"
            columns: ["related_creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          biography: string | null
          created_at: string
          department: Database["public"]["Enums"]["staff_department"] | null
          department_custom: string | null
          email: string | null
          full_name: string | null
          id: string
          impersonating_creator_id: string | null
          last_login_at: string | null
          locale: string | null
          notes: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          status: Database["public"]["Enums"]["staff_status"] | null
          timezone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          biography?: string | null
          created_at?: string
          department?: Database["public"]["Enums"]["staff_department"] | null
          department_custom?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          impersonating_creator_id?: string | null
          last_login_at?: string | null
          locale?: string | null
          notes?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["staff_status"] | null
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          biography?: string | null
          created_at?: string
          department?: Database["public"]["Enums"]["staff_department"] | null
          department_custom?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          impersonating_creator_id?: string | null
          last_login_at?: string | null
          locale?: string | null
          notes?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["staff_status"] | null
          timezone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_impersonating_creator_id_fkey"
            columns: ["impersonating_creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "settings_updated_by_fkey"
            columns: ["updated_by"]
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
      acting_creator_id: { Args: never; Returns: string }
      can_access_creator: {
        Args: { target_creator_id: string }
        Returns: boolean
      }
      get_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      is_admin_or_above: { Args: never; Returns: boolean }
      is_authenticated_user: { Args: never; Returns: boolean }
      is_creator_role: { Args: never; Returns: boolean }
      is_finance_staff: { Args: never; Returns: boolean }
      is_owner: { Args: never; Returns: boolean }
      is_staff: { Args: never; Returns: boolean }
    }
    Enums: {
      application_priority: "low" | "normal" | "high" | "urgent"
      application_status:
        | "new"
        | "reviewing"
        | "contacted"
        | "meeting"
        | "active"
        | "rejected"
        | "archived"
      application_type: "creator" | "agency" | "partnership" | "general"
      cabinet_task_priority: "low" | "normal" | "high" | "urgent"
      cabinet_task_status: "open" | "in_progress" | "completed" | "cancelled"
      task_priority: "low" | "medium" | "high" | "urgent"
      task_status:
        | "new"
        | "in_progress"
        | "waiting"
        | "blocked"
        | "review"
        | "completed"
        | "archived"
      task_type:
        | "creator"
        | "finance"
        | "support"
        | "application"
        | "staff"
        | "custom"
      creator_document_type: "passport" | "agreement" | "tax" | "bank"
      creator_status:
        | "new"
        | "active"
        | "paused"
        | "vacation"
        | "inactive"
        | "banned"
        | "invited"
      finance_payment_method:
        | "stripe"
        | "wise"
        | "paypal"
        | "crypto"
        | "bank_transfer"
        | "other"
      finance_transaction_status:
        | "pending"
        | "approved"
        | "paid"
        | "cancelled"
        | "disputed"
      payout_method: "bank" | "paypal" | "crypto" | "other"
      payout_status: "pending" | "processing" | "completed" | "failed"
      platform_link_status: "linked" | "pending" | "disconnected" | "issue"
      staff_department:
        | "management"
        | "sales"
        | "support"
        | "marketing"
        | "content"
        | "finance"
        | "hr"
        | "operations"
        | "custom"
      staff_status:
        | "invited"
        | "active"
        | "vacation"
        | "suspended"
        | "disabled"
        | "archived"
      support_ticket_status: "open" | "waiting" | "answered" | "closed"
      user_role:
        | "owner"
        | "admin"
        | "manager"
        | "creator"
        | "guest"
        | "support"
        | "moderator"
        | "content_manager"
        | "finance"
        | "viewer"
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
      application_priority: ["low", "normal", "high", "urgent"],
      application_status: [
        "new",
        "reviewing",
        "contacted",
        "meeting",
        "active",
        "rejected",
        "archived",
      ],
      application_type: ["creator", "agency", "partnership", "general"],
      cabinet_task_priority: ["low", "normal", "high", "urgent"],
      cabinet_task_status: ["open", "in_progress", "completed", "cancelled"],
      task_priority: ["low", "medium", "high", "urgent"],
      task_status: [
        "new",
        "in_progress",
        "waiting",
        "blocked",
        "review",
        "completed",
        "archived",
      ],
      task_type: [
        "creator",
        "finance",
        "support",
        "application",
        "staff",
        "custom",
      ],
      creator_document_type: ["passport", "agreement", "tax", "bank"],
      creator_status: [
        "new",
        "active",
        "paused",
        "vacation",
        "inactive",
        "banned",
        "invited",
      ],
      finance_payment_method: [
        "stripe",
        "wise",
        "paypal",
        "crypto",
        "bank_transfer",
        "other",
      ],
      finance_transaction_status: [
        "pending",
        "approved",
        "paid",
        "cancelled",
        "disputed",
      ],
      payout_method: ["bank", "paypal", "crypto", "other"],
      payout_status: ["pending", "processing", "completed", "failed"],
      platform_link_status: ["linked", "pending", "disconnected", "issue"],
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
      ],
      staff_status: [
        "invited",
        "active",
        "vacation",
        "suspended",
        "disabled",
        "archived",
      ],
      support_ticket_status: ["open", "waiting", "answered", "closed"],
      user_role: [
        "owner",
        "admin",
        "manager",
        "creator",
        "guest",
        "support",
        "moderator",
        "content_manager",
        "finance",
        "viewer",
      ],
    },
  },
} as const

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
export type CrmTaskStatus = Enums<"task_status">;
export type TaskStatus = Enums<"task_status">;
export type CrmTaskPriority = Enums<"task_priority">;
export type TaskPriority = Enums<"task_priority">;
export type CrmTaskType = Enums<"task_type">;
export type TaskType = Enums<"task_type">;
export type PayoutStatus = Enums<"payout_status">;
export type PayoutMethod = Enums<"payout_method">;
export type CreatorDocumentType = Enums<"creator_document_type">;
export type SupportTicketStatus = Enums<"support_ticket_status">;
