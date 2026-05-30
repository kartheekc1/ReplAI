"use client";

import { useState } from "react";
import { Instagram, Shield, Check, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

/**
 * Initiates the real Instagram Business Login OAuth flow.
 *
 * Docs: https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/business-login
 */
function buildAuthUrl(state: string): string | null {
  const appId = process.env.NEXT_PUBLIC_META_APP_ID;
  const redirect = process.env.NEXT_PUBLIC_META_REDIRECT_URI;
  if (!appId || !redirect) return null;

  const scope = [
    "instagram_business_basic",
    "instagram_business_manage_messages",
    "instagram_business_manage_comments",
    "instagram_business_content_publish",
  ].join(",");

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirect,
    scope,
    response_type: "code",
    state,
  });
  return `https://www.instagram.com/oauth/authorize?${params.toString()}`;
}

export function ConnectModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [redirecting, setRedirecting] = useState(false);
  const authUrl = buildAuthUrl(crypto.randomUUID());
  const configured = Boolean(authUrl);

  function startOAuth() {
    if (!authUrl) return;
    setRedirecting(true);
    // Persist a CSRF state token so the callback can validate.
    const state = new URL(authUrl).searchParams.get("state")!;
    sessionStorage.setItem("ig_oauth_state", state);
    window.location.href = authUrl;
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) setRedirecting(false);
        onOpenChange(v);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <span
            className="mb-3 grid h-12 w-12 place-items-center rounded-xl text-white"
            style={{ background: "linear-gradient(135deg, #F58529, #DD2A7B, #8134AF, #515BD4)" }}
          >
            <Instagram size={22} />
          </span>
          <DialogTitle>Connect Instagram</DialogTitle>
          <DialogDescription>
            You&apos;ll be redirected to Instagram&apos;s official login. We never see your password.
          </DialogDescription>
        </DialogHeader>

        {!configured && (
          <div className="flex items-start gap-2 rounded-md border border-warning/30 bg-warning/10 p-3 text-[12.5px] text-warning">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <div>
              <div className="font-semibold">Meta app not configured</div>
              Add <code className="font-mono">NEXT_PUBLIC_META_APP_ID</code> and{" "}
              <code className="font-mono">NEXT_PUBLIC_META_REDIRECT_URI</code> to{" "}
              <code className="font-mono">frontend/.env.local</code>, then restart the dev server.
            </div>
          </div>
        )}

        <ul className="my-4 flex flex-col gap-2.5 text-[13.5px]">
          {[
            "Read comments on your posts and reels",
            "Send and receive direct messages",
            "Access basic profile information",
          ].map((p) => (
            <li key={p} className="flex items-center gap-2.5 text-muted">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-brand/10 text-brand">
                <Check size={11} />
              </span>
              {p}
            </li>
          ))}
        </ul>

        <div className="flex items-start gap-2 rounded-md bg-surface-2 p-3 text-[12.5px] text-muted">
          <Shield size={15} className="mt-0.5 shrink-0 text-brand" />
          ReplAI uses Instagram&apos;s official Business Login OAuth. Tokens are encrypted at rest and you can disconnect anytime.
        </div>

        <Button
          variant="primary"
          onClick={startOAuth}
          className="mt-3 w-full"
          size="lg"
          disabled={!configured || redirecting}
        >
          {redirecting ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Redirecting to Instagram…
            </>
          ) : (
            <>
              <Instagram size={16} /> Continue with Instagram
            </>
          )}
        </Button>

        <p className="text-center text-[11.5px] text-subtle">
          Requires an Instagram <strong>Business</strong> or <strong>Creator</strong> account.
        </p>
      </DialogContent>
    </Dialog>
  );
}
