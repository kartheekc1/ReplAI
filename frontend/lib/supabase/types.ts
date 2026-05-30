// Generated Supabase types — keep in sync with supabase/migrations/0001_init.sql
// Regenerate via: supabase gen types typescript --project-id <ref> > lib/supabase/types.ts

export type PlanTier = "free" | "starter" | "pro" | "agency";
export type AutomationStatus = "active" | "paused" | "draft";
export type AutomationTriggerType = "comment" | "story_reply" | "dm";
export type MessageStatus = "queued" | "sent" | "delivered" | "failed";
export type SubscriptionStatus = "active" | "cancelled" | "past_due" | "trialing";

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          avatar_url: string | null;
          plan: PlanTier;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["users"]["Row"], "created_at" | "updated_at" | "plan"> & {
          plan?: PlanTier;
        };
        Update: Partial<Database["public"]["Tables"]["users"]["Row"]>;
      };
      instagram_accounts: {
        Row: {
          id: string;
          user_id: string;
          ig_user_id: string;
          username: string;
          followers: number;
          profile_picture_url: string | null;
          access_token: string;
          token_expires_at: string | null;
          status: "connected" | "expired" | "revoked";
          connected_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["instagram_accounts"]["Row"], "connected_at">;
        Update: Partial<Database["public"]["Tables"]["instagram_accounts"]["Row"]>;
      };
      automations: {
        Row: {
          id: string;
          user_id: string;
          account_id: string;
          name: string;
          trigger_type: AutomationTriggerType;
          post_id: string | null;
          keywords: string[];
          message: string;
          cta_label: string | null;
          cta_url: string | null;
          require_follow: boolean;
          reply_publicly: boolean;
          status: AutomationStatus;
          dms_sent: number;
          leads_captured: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["automations"]["Row"], "id" | "created_at" | "updated_at" | "dms_sent" | "leads_captured"> & {
          id?: string;
        };
        Update: Partial<Database["public"]["Tables"]["automations"]["Row"]>;
      };
      leads: {
        Row: {
          id: string;
          user_id: string;
          automation_id: string | null;
          name: string | null;
          username: string;
          email: string | null;
          phone: string | null;
          source_post_id: string | null;
          keyword: string | null;
          notes: string | null;
          tags: string[];
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["leads"]["Row"], "id" | "created_at"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["leads"]["Row"]>;
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan: PlanTier;
          status: SubscriptionStatus;
          razorpay_subscription_id: string | null;
          start_date: string;
          expiry_date: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["subscriptions"]["Row"], "id" | "created_at"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["subscriptions"]["Row"]>;
      };
    };
  };
}
