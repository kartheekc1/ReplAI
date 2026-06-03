"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bolt,
  Heart,
  Instagram,
  MessageCircle,
  Plus,
  Shield,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EmptyState } from "@/components/dashboard/empty-state";
import { AutomationWizard } from "@/components/dashboard/automation-wizard";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { apiClient } from "@/lib/api";

type Account = {
  id: string;
  username: string;
  followers: number;
  status: string;
  connected_at: string;
};

type IGMedia = {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url?: string;
  thumbnail_url?: string;
  permalink?: string;
  like_count?: number;
  comments_count?: number;
};

export default function AccountDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [account, setAccount] = useState<Account | null>(null);
  const [posts, setPosts] = useState<IGMedia[] | null>(null);
  const [activePostIds, setActivePostIds] = useState<Set<string>>(new Set());
  const [wizardPost, setWizardPost] = useState<string | null>(null);

  useEffect(() => {
    const sb = createSupabaseBrowserClient();
    (async () => {
      // Load the account from Supabase (RLS-scoped to this user)
      const { data: acct } = await sb
        .from("instagram_accounts")
        .select("id, username, followers, status, connected_at")
        .eq("id", id)
        .maybeSingle();
      setAccount((acct as Account | null) ?? null);

      // Mark which posts already have active automations
      const { data: autos } = await sb
        .from("automations")
        .select("post_id")
        .eq("account_id", id)
        .eq("status", "active");
      const ids = ((autos ?? []) as Array<{ post_id: string | null }>)
        .map((a) => a.post_id)
        .filter((p): p is string => Boolean(p));
      setActivePostIds(new Set(ids));

      // Fetch real Instagram media via FastAPI -> Graph API
      try {
        const media = await apiClient.get<IGMedia[]>(`/instagram/${id}/media`);
        setPosts(media);
      } catch {
        setPosts([]);
      }
    })();
  }, [id]);

  if (!account) {
    return (
      <div className="card-rv p-8 text-center text-muted">
        Account not found.{" "}
        <Link href="/dashboard/accounts" className="font-semibold text-brand">
          ← Back
        </Link>
      </div>
    );
  }

  const wizardPosts = (posts ?? []).map((p) => ({
    id: p.id,
    type: p.media_type === "VIDEO" ? "reel" : p.media_type === "CAROUSEL_ALBUM" ? "carousel" : "post",
    caption: p.caption ?? "(no caption)",
  }));

  return (
    <div className="animate-screenIn">
      <Link href="/dashboard/accounts" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft size={14} /> All accounts
      </Link>

      {/* Profile */}
      <div className="card-rv mb-5 p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="relative">
            <span
              className="grid h-24 w-24 place-items-center rounded-full p-1"
              style={{ background: "linear-gradient(135deg, #F58529, #DD2A7B, #8134AF, #515BD4)" }}
            >
              <span className="grid h-full w-full place-items-center rounded-full bg-white text-2xl font-bold text-ink">
                {account.username.slice(0, 2).toUpperCase()}
              </span>
            </span>
            <Badge tone={account.status === "connected" ? "success" : "warning"} className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap">
              {account.status === "connected" ? "Connected" : "Expired"}
            </Badge>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-bold">@{account.username}</h2>
              <Instagram size={18} className="text-muted" />
            </div>
            <div className="mt-3 flex gap-7 text-sm">
              <span>
                <span className="font-display text-lg">{posts?.length ?? "—"}</span>{" "}
                <span className="text-muted">Posts</span>
              </span>
              <span>
                <span className="font-display text-lg">{account.followers.toLocaleString()}</span>{" "}
                <span className="text-muted">Followers</span>
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge tone="brand"><Shield size={11} /> Comments</Badge>
              <Badge tone="brand"><Shield size={11} /> Messages</Badge>
              <Badge tone="brand"><Shield size={11} /> Profile</Badge>
            </div>
          </div>
          <div className="flex flex-col gap-2.5">
            <Button variant="primary" onClick={() => setWizardPost("")}>
              <Sparkles size={16} /> New automation
            </Button>
            <Button variant="ghost">Disconnect</Button>
          </div>
        </div>
      </div>

      {/* Posts grid */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All ({posts?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="reels">Reels</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          {posts === null ? (
            <PostsGridSkeleton />
          ) : posts.length === 0 ? (
            <EmptyState
              icon={Instagram}
              title="No posts yet"
              body="Either this account has no posts, or Instagram hasn't shared media access yet. Make sure your Meta app has instagram_business_basic permission and try reconnecting."
              action={null}
            />
          ) : (
            <PostsGrid items={posts} activeIds={activePostIds} onAutomate={(pid) => setWizardPost(pid)} />
          )}
        </TabsContent>
        <TabsContent value="reels">
          <PostsGrid items={(posts ?? []).filter((p) => p.media_type === "VIDEO")} activeIds={activePostIds} onAutomate={setWizardPost} />
        </TabsContent>
        <TabsContent value="posts">
          <PostsGrid items={(posts ?? []).filter((p) => p.media_type !== "VIDEO")} activeIds={activePostIds} onAutomate={setWizardPost} />
        </TabsContent>
      </Tabs>

      <AutomationWizard
        open={wizardPost !== null}
        onOpenChange={(v) => !v && setWizardPost(null)}
        posts={wizardPosts}
        initialPostId={wizardPost ?? undefined}
      />
    </div>
  );
}

function PostsGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="card-rv overflow-hidden">
          <div className="aspect-square animate-pulse bg-surface-2" />
        </div>
      ))}
    </div>
  );
}

function PostsGrid({
  items,
  activeIds,
  onAutomate,
}: {
  items: IGMedia[];
  activeIds: Set<string>;
  onAutomate: (id: string) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((p) => {
        const thumb = p.thumbnail_url || p.media_url;
        const isActive = activeIds.has(p.id);
        return (
          <div key={p.id} className="card-rv card-rv-hover overflow-hidden">
            <div className="relative aspect-square w-full bg-surface-2">
              {thumb && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={thumb} alt="" className="absolute inset-0 h-full w-full object-cover" />
              )}
              <Badge tone="gray" className="absolute left-3 top-3 bg-black/40 text-white">
                {p.media_type === "VIDEO" ? "reel" : p.media_type === "CAROUSEL_ALBUM" ? "carousel" : "post"}
              </Badge>
              {isActive && (
                <Badge tone="success" className="absolute right-3 top-3">
                  <Bolt size={10} /> Active
                </Badge>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-[12.5px] text-white">
                <div className="line-clamp-2">{p.caption ?? ""}</div>
                <div className="mt-1 flex items-center gap-3 text-[11px] opacity-90">
                  <span className="inline-flex items-center gap-1"><Heart size={11} /> {p.like_count ?? "—"}</span>
                  <span className="inline-flex items-center gap-1"><MessageCircle size={11} /> {p.comments_count ?? "—"}</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" className="w-full rounded-none border-0 border-t border-line text-[13px]" onClick={() => onAutomate(p.id)}>
              <Plus size={13} /> {isActive ? "Edit automation" : "Automate this"}
            </Button>
          </div>
        );
      })}
    </div>
  );
}
