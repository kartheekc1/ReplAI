import {
  BarChart3,
  ClipboardList,
  Database,
  Image as ImageIcon,
  Key,
  Layers,
  MessageCircle,
  Sparkles,
  Target,
  Users,
} from "lucide-react";

const FEATURES = [
  { icon: MessageCircle, title: "Comment-to-DM automation", body: "Reply to every qualifying comment with a personal DM — automatically, 24/7." },
  { icon: ImageIcon, title: "Story reply automation", body: "Turn story replies and reactions into conversations and qualified leads." },
  { icon: Key, title: "Keyword triggers", body: "Set unlimited trigger words and phrases per post, with exact or fuzzy matching." },
  { icon: ClipboardList, title: "Lead collection", body: "Capture email and phone right inside the DM with native in-chat forms." },
  { icon: BarChart3, title: "Analytics dashboard", body: "Track comments, DMs, leads and revenue with real-time, exportable reports." },
  { icon: Target, title: "Conversion tracking", body: "Pixel-perfect attribution from comment to clicked link to closed sale." },
  { icon: Database, title: "CRM management", body: "Tag leads, add notes, sync to your favorite CRM — all from one inbox." },
  { icon: Sparkles, title: "AI smart replies", body: "Let AI understand intent and craft on-brand responses that actually convert." },
  { icon: Layers, title: "Multi-account support", body: "Manage every brand and creator account from a single unified workspace." },
  { icon: Users, title: "Team collaboration", body: "Invite teammates, assign roles, and collaborate on automations together." },
];

export function Features() {
  return (
    <section className="section" id="features">
      <div className="container-wide">
        <div className="section-head">
          <span className="eyebrow">
            <span className="dot" /> Features
          </span>
          <h2 className="display">Everything you need to automate growth</h2>
          <p className="lead">A complete toolkit for turning engagement into revenue — without lifting a finger.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="card-rv card-rv-hover p-5">
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl border border-secondary/25 bg-brand/10 text-brand">
                <f.icon size={21} />
              </div>
              <h3 className="mb-2 text-[16.5px] font-semibold">{f.title}</h3>
              <p className="text-[13.5px] leading-[1.55] text-muted">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
