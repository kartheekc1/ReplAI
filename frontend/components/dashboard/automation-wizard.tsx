"use client";

import { useEffect, useState } from "react";
import { Check, Image as ImageIcon, MessageCircle, Send, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type Post = { id: string; type: string; caption: string };

export function AutomationWizard({
  open,
  onOpenChange,
  posts,
  initialPostId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  posts: Post[];
  initialPostId?: string;
}) {
  const [step, setStep] = useState(0);
  const [postId, setPostId] = useState<string | undefined>(initialPostId || posts[0]?.id);
  const [keywords, setKeywords] = useState<string[]>(["link"]);
  const [draft, setDraft] = useState("");
  const [requireFollow, setRequireFollow] = useState(false);
  const [replyPublicly, setReplyPublicly] = useState(true);
  const [message, setMessage] = useState(
    "Hey 👋\n\nThanks for the interest. Here's the link:\nhttps://example.com"
  );
  const [ctaLabel, setCtaLabel] = useState("Grab the link");
  const [ctaUrl, setCtaUrl] = useState("https://example.com");

  useEffect(() => {
    if (open) {
      setStep(0);
      setPostId(initialPostId || posts[0]?.id);
    }
  }, [open, initialPostId, posts]);

  function addKeyword() {
    const k = draft.trim().toLowerCase();
    if (!k || keywords.includes(k)) return;
    setKeywords([...keywords, k]);
    setDraft("");
  }

  function activate() {
    toast.success("Automation activated — your post is now listening.");
    onOpenChange(false);
  }

  const steps = ["Post", "Keywords", "Conditions", "Message", "Review"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Create automation</DialogTitle>
          <DialogDescription>Five quick steps from a comment to a captured lead.</DialogDescription>
        </DialogHeader>

        {/* Stepper */}
        <div className="flex items-center gap-2">
          {steps.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <button
                onClick={() => setStep(i)}
                className={cn(
                  "grid h-7 w-7 place-items-center rounded-full text-[12px] font-semibold transition-colors",
                  i <= step ? "bg-brand-gradient text-white" : "bg-surface-3 text-muted"
                )}
              >
                {i < step ? <Check size={13} /> : i + 1}
              </button>
              <span className={cn("text-[12px]", i === step ? "font-semibold" : "text-muted")}>
                {label}
              </span>
              {i < steps.length - 1 && <span className="mx-2 h-px w-6 bg-line" />}
            </div>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
          {/* Editor */}
          <div className="min-h-[260px]">
            {step === 0 && (
              <>
                <Label>Choose a post or reel</Label>
                <div className="mt-3 grid max-h-[280px] grid-cols-3 gap-2 overflow-y-auto pr-1">
                  {posts.map((p, idx) => (
                    <button
                      key={p.id}
                      onClick={() => setPostId(p.id)}
                      className={cn(
                        "group relative aspect-square overflow-hidden rounded-md border-2 transition-all",
                        postId === p.id ? "border-brand" : "border-line hover:border-line-strong"
                      )}
                      style={{
                        background: `linear-gradient(135deg, hsl(${idx * 47}, 70%, 70%), hsl(${idx * 47 + 60}, 70%, 60%))`,
                      }}
                    >
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-1.5 text-left text-[10px] text-white line-clamp-2">
                        {p.caption}
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
            {step === 1 && (
              <>
                <Label>Trigger keywords</Label>
                <p className="mt-1 text-[12.5px] text-muted">
                  Add words or phrases — when any match a comment, the automation fires.
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5 rounded-md border border-line bg-surface p-2.5">
                  {keywords.map((k) => (
                    <span key={k} className="chip-mono inline-flex items-center gap-1.5">
                      {k}
                      <button onClick={() => setKeywords(keywords.filter((x) => x !== k))}>
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addKeyword();
                      }
                    }}
                    placeholder="Type a keyword + Enter"
                    className="min-w-[140px] flex-1 bg-transparent text-sm outline-none"
                  />
                </div>
              </>
            )}
            {step === 2 && (
              <div className="flex flex-col gap-4">
                <Row
                  title="Require user to follow you"
                  sub="Only send DM if the commenter follows the account."
                  checked={requireFollow}
                  onChange={setRequireFollow}
                />
                <Row
                  title="Reply publicly under the comment"
                  sub="Acknowledge the comment publicly before sending the DM."
                  checked={replyPublicly}
                  onChange={setReplyPublicly}
                />
              </div>
            )}
            {step === 3 && (
              <>
                <Label htmlFor="msg">DM message</Label>
                <Textarea
                  id="msg"
                  className="mt-2"
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="ctaL">Button label</Label>
                    <Input
                      id="ctaL"
                      className="mt-1"
                      value={ctaLabel}
                      onChange={(e) => setCtaLabel(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="ctaU">Button URL</Label>
                    <Input
                      id="ctaU"
                      className="mt-1"
                      value={ctaUrl}
                      onChange={(e) => setCtaUrl(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}
            {step === 4 && (
              <div className="space-y-3 text-[13.5px]">
                <Summary label="Post" value={posts.find((p) => p.id === postId)?.caption ?? "—"} />
                <Summary label="Keywords" value={keywords.join(", ")} />
                <Summary label="Require follow" value={requireFollow ? "Yes" : "No"} />
                <Summary label="Reply publicly" value={replyPublicly ? "Yes" : "No"} />
                <Summary label="CTA" value={`${ctaLabel} → ${ctaUrl}`} />
              </div>
            )}
          </div>

          {/* Live preview */}
          <div className="rounded-lg border border-line bg-section-bg p-4">
            <div className="mb-3 text-[11.5px] font-semibold uppercase tracking-wider text-subtle">
              Live preview
            </div>
            <div className="card-rv space-y-3 bg-white p-3.5">
              <div className="flex items-start gap-2">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-gradient text-[11px] font-bold text-white">
                  @
                </span>
                <div className="flex-1 text-[12.5px]">
                  <span className="font-semibold">@new.fan</span>{" "}
                  <span className="text-muted">
                    {keywords[0] ? `commented "${keywords[0]}"` : "commented…"}
                  </span>
                </div>
              </div>
              {replyPublicly && (
                <div className="flex items-start gap-2 rounded-md bg-section-bg p-2 text-[12px] text-muted">
                  <MessageCircle size={12} className="mt-0.5 text-brand" />
                  Replied publicly: &ldquo;Sent you a DM! 📩&rdquo;
                </div>
              )}
              <div className="flex items-start gap-2">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-gradient text-[11px] font-bold text-white">
                  <Send size={11} />
                </span>
                <div className="flex-1 rounded-[4px_14px_14px_14px] bg-surface-3 p-2.5 text-[13px] leading-relaxed">
                  <div className="whitespace-pre-line">{message}</div>
                  <button
                    type="button"
                    className="mt-2.5 inline-flex w-full items-center justify-center gap-1 rounded-md bg-brand-gradient px-3 py-2 text-[12px] font-semibold text-white"
                  >
                    {ctaLabel}
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-[11.5px] text-success">
              <Sparkles size={11} /> ~1.4s avg delivery time
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-2 flex items-center justify-between border-t border-line pt-4">
          <Button variant="ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
            Back
          </Button>
          {step < steps.length - 1 ? (
            <Button variant="primary" onClick={() => setStep((s) => s + 1)}>
              Continue
            </Button>
          ) : (
            <Button variant="primary" onClick={activate}>
              <Check size={15} /> Activate
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Row({
  title,
  sub,
  checked,
  onChange,
}: {
  title: string;
  sub: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start gap-4 rounded-md border border-line bg-surface p-3.5">
      <ImageIcon size={18} className="mt-0.5 text-brand" />
      <div className="flex-1">
        <div className="text-sm font-semibold">{title}</div>
        <p className="text-[12.5px] text-muted">{sub}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-line py-2.5 last:border-0">
      <span className="font-semibold text-muted">{label}</span>
      <span className="max-w-[60%] text-right">{value}</span>
    </div>
  );
}
