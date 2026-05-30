import { Instagram, Key, Send, Target } from "lucide-react";

const STEPS = [
  {
    n: "01",
    icon: Instagram,
    title: "Connect Instagram",
    body: "Link your Instagram Business or Creator account in one secure tap. No passwords stored.",
  },
  {
    n: "02",
    icon: Key,
    title: "Create keyword automation",
    body: "Pick the post and the trigger words. ReplAI listens for every matching comment.",
  },
  {
    n: "03",
    icon: Send,
    title: "Auto-send the DM",
    body: "The moment a follower comments, they get your message — link, offer, or guide — instantly.",
  },
  {
    n: "04",
    icon: Target,
    title: "Convert into leads",
    body: "Capture emails and phone numbers right inside the chat and sync them to your CRM.",
  },
];

export function HowItWorks() {
  return (
    <section className="section" id="how">
      <div className="container-wide">
        <div className="section-head">
          <span className="eyebrow">
            <span className="dot" /> How it works
          </span>
          <h2 className="display">Live in under five minutes</h2>
          <p className="lead">Four steps from a comment to a captured lead — no code, no manual replies.</p>
        </div>
        <div className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div
            aria-hidden
            className="absolute left-[12%] right-[12%] top-10 hidden h-px lg:block"
            style={{ background: "linear-gradient(90deg,transparent,#E0E4EC,transparent)" }}
          />
          {STEPS.map((s) => (
            <div key={s.n} className="card-rv card-rv-hover relative p-6">
              <div className="mb-4 grid h-13 w-13 place-items-center rounded-xl border border-line-2 bg-surface-3 text-brand" style={{ width: 52, height: 52 }}>
                <s.icon size={24} />
              </div>
              <div className="mb-2 font-mono text-[12.5px] text-brand">{s.n}</div>
              <h3 className="mb-2 text-[18px] font-semibold">{s.title}</h3>
              <p className="text-sm leading-[1.55] text-muted">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
